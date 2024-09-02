#!/usr/bin/env node
import type { Argv } from "yargs";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import pkg from "../package.json";
import { compile } from "./commands/compile";
import { docker } from "./commands/docker";
import { DEFAULT_CAPNP_PATH, DEFAULT_DIR_MAPPING } from "./constants";

yargs(hideBin(process.argv))
	.scriptName(pkg.name)
	.version(pkg.version)
	.command(
		"compile",
		"Compile the worker script into a capnp file",
		(yargs: Argv) => {
			return yargs
				.option("script", {
					alias: "s",
					type: "string",
					description: "the bundled script to use",
				})
				.option("out", {
					alias: "o",
					type: "string",
					description: "the output path of capnp file",
					default: DEFAULT_CAPNP_PATH,
				})
				.option("dir", {
					alias: "d",
					type: "string",
					description: "the directory mapping in the format of NAME=PATH",
					array: true,
					default: DEFAULT_DIR_MAPPING,
				})
				.option("debug", {
					alias: "D",
					type: "boolean",
					description: "enable debug mode",
					default: false,
				});
		},
		compile,
	)
	.command(
		"docker",
		"Generate Dockerfile and docker-compose.yml",
		(yargs: Argv) => {
			return yargs.option("capnp", {
				type: "string",
				description: "the path of capnp file",
				default: DEFAULT_CAPNP_PATH,
			});
		},
		docker,
	)
	.demandCommand()
	.alias("h", "help")
	.alias("v", "version")
	.parse();
