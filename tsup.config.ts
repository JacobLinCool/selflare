import fs from "node:fs";
import { defineConfig } from "tsup";

export default defineConfig({
	entryPoints: ["src/index.ts"],
	outDir: "dist",
	bundle: true,
	platform: "node",
	noExternal: ["miniflare"],
	external: ["workerd", "@cspotcode/source-map-support"],
	async onSuccess() {
		fs.cpSync("node_modules/miniflare/dist/src/workers", "dist/workers", { recursive: true });
	},
	clean: true,
});
