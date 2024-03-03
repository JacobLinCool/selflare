import fs from "node:fs";

const FILE = "node_modules/miniflare/dist/src/index.js";

fs.writeFileSync(
	FILE,
	fs
		.readFileSync(FILE, "utf-8")
		.replace(/#assembleConfig/g, "assembleConfig")
		.replace(/#getLoopbackPort/g, "getLoopbackPort"),
);
