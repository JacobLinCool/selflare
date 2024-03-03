import { IRequest, Router } from "itty-router";
import { CF } from "./env";

export const d1 = Router<IRequest, CF>({ base: "/d1" })
	.get<IRequest, CF>("/", async (req, env) => {
		await env.MY_DATABASE.exec(
			"CREATE TABLE IF NOT EXISTS person (id INT PRIMARY KEY, name TEXT, age INT)",
		);
		return env.MY_DATABASE.prepare("SELECT * FROM person").all();
	})
	.get<IRequest, CF>("/:id", async (req, env) => {
		const stmt = env.MY_DATABASE.prepare("SELECT * FROM person WHERE id = ?").bind(
			parseInt(req.params.id),
		);
		return stmt.first();
	})
	.put<IRequest, CF>("/:id", async (req, env) => {
		const json = await req.json<{ name: string; age: number }>();
		if (typeof json !== "object") {
			throw new Error("Invalid JSON");
		}
		if (typeof json.name !== "string") {
			throw new Error("Invalid name");
		}
		if (typeof json.age !== "number") {
			throw new Error("Invalid age");
		}
		const { name, age } = json;
		const stmt = env.MY_DATABASE.prepare(
			"INSERT INTO person (id, name, age) VALUES (?, ?, ?)",
		).bind(parseInt(req.params.id), name, age);
		return stmt.run();
	});
