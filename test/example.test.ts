import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { beforeAll, describe, expect, it } from "vitest";

beforeAll(() => {
	execSync("pnpm build");
});

describe("compile", () => {
	it("should compile example", () => {
		const dir = path.join("example", "test-worker");
		const capnp = path.join(dir, "worker.capnp");
		if (fs.existsSync(capnp)) {
			fs.unlinkSync(capnp);
		}
		execSync(`node ../../dist/index.js compile`, { cwd: dir });
		expect(fs.existsSync(capnp)).toBe(true);
	});
}, 30_000);
