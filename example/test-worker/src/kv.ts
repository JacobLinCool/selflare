import { IRequest, Router } from "itty-router";
import { CF } from "./env";

export const kv = Router<IRequest, CF>({ base: "/kv" })
	.get<IRequest, CF>("/", (req, env) => env.MY_KV_NAMESPACE.list())
	.get<IRequest, CF>("/:key", (req, env) => env.MY_KV_NAMESPACE.get(req.params.key))
	.put<IRequest, CF>("/:key", async (req, env) => {
		const value = await req.text();
		await env.MY_KV_NAMESPACE.put(req.params.key, value);
		return { ok: true };
	});
