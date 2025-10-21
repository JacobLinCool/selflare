import TOML from "@iarna/toml";
import { Miniflare, serializeConfig } from "miniflare";
import { execSync } from "node:child_process";
import fs from "node:fs";
import { inspect } from "node:util";
import { unstable_getMiniflareWorkerOptions } from "wrangler";
import type { Arguments } from "yargs";

interface CompileArgs {
	script?: string;
	out: string;
	dir: string[];
	debug: boolean;
}

export async function compile(argv: Arguments<CompileArgs>): Promise<void> {
	const worker_config_filenames = ['wrangler.toml', 'wrangler.jsonc', 'wrangler.json']
	let worker_config_filename: string | undefined
	for (const filename of worker_config_filenames) {
		if (fs.existsSync(filename)) {
			worker_config_filename = filename
			break
		}
	}
	if (!worker_config_filename) {
		throw new Error('file not found: ' + String(worker_config_filenames))
	}

	let worker_config: any
	if (worker_config_filename === 'wrangler.toml') {
		worker_config = TOML.parse(fs.readFileSync("wrangler.toml", "utf-8"));
	} else if (worker_config_filename === 'wrangler.jsonc') {
		console.log('Selflare is incompatible with jsonc. Creating wrangler.json...')
		const worker_config_text = fs.readFileSync("wrangler.jsonc", "utf-8").split('\n')
		for (let line_index = 0; line_index < worker_config_text.length; line_index++) {
			const first_char = worker_config_text[line_index].trimStart()[0]
			if (['/', '*'].includes(first_char)) {
				worker_config_text[line_index] = ''
			}
		}
		fs.writeFileSync('wrangler.json', worker_config_text.filter(line => line !== '').join('\n'))
		worker_config_filename = 'wrangler.json'
	} if (worker_config_filename === 'wrangler.json') {
		worker_config = JSON.parse(fs.readFileSync("wrangler.json", "utf-8"));
	}

	const { main, workerOptions } = unstable_getMiniflareWorkerOptions(worker_config_filename);

	if (!main) {
		throw new Error("No main in " + worker_config_filename);
	}

	if (argv.debug) {
		console.log(inspect(workerOptions, { compact: true, depth: 10, breakLength: 80 }));
	}

	if (!argv.script) {
		console.log("Building script with wrangler ...");
		execSync("npx wrangler deploy --dry-run --outdir .wrangler/dist");
		argv.script = ".wrangler/dist/index.js";
	}
	console.log("Using script from", argv.script);
	if (argv.debug) {
		console.log(inspect(worker_config, { compact: true, depth: 10, breakLength: 80 }));
	}

	const mf = new Miniflare({
		scriptPath: argv.script,
		...workerOptions,
		modules: true,
		modulesRules: worker_config.rules?.map((r: any) => ({
			type: r.type,
			fallthrough: r.fallthrough,
			include: r.globs,
		})),
	});
	await mf.ready;

	// @ts-expect-error private method usage
	const port = await mf.getLoopbackPort();
	// @ts-expect-error private method usage
	const config = await mf.assembleConfig(port);
	if (argv.debug) {
		console.log(inspect(config, { compact: true, depth: 10, breakLength: 80 }));
	}

	// configure dir mappings
	for (const service of config.services) {
		const matched = argv.dir.filter((d) => d.split("=")[0] === service.name);
		const dir = matched[matched.length - 1];
		if (dir) {
			const [name, path] = dir.split("=");
			service.disk.path = path;
			console.log(`Mapping ${name} to ${path}`);
		}
	}

	// set loopback port
	const loopback = config.services.find((s: any) => s.name === "loopback");
	if (loopback) {
		loopback.external.address = `localhost:8080`;
	}

	// remove hot reload entry
	const entry = config.services.findIndex((s: any) => s.name === "core:entry");
	if (entry !== -1) {
		config.services.splice(entry, 1);
	}

	// set socket
	config.sockets[0].address = "*:8080";
	config.sockets[0].service.name = "core:user:";

	// set vars to be read from environment variables
	const core = config.services.find((s: any) => s.name === "core:user:");
	for (const binding of core.worker.bindings) {
		// seems to be a var binding
		if (typeof binding.json === "string") {
			delete binding.json;
			binding.fromEnvironment = binding.name;
		}
	}

	if (argv.debug) {
		console.log(inspect(config, { compact: true, depth: 10, breakLength: 80 }));
	}
	const buffer = serializeConfig(config);
	fs.writeFileSync(argv.out, buffer);

	console.log("Wrote capnp file to", argv.out);

	await mf.dispose();
}
