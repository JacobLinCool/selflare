import { IRequest, Router } from "itty-router";
import { CF } from "./env";

export const r2 = Router<IRequest, CF>({ base: "/r2" })
	.get<IRequest, CF>("/", async (req, env) => env.MY_BUCKET.list())
	.get<IRequest, CF>("/:id", async (req, env) => {
		const obj = await env.MY_BUCKET.get(req.params.id);
		if (obj === null) {
			throw new Error("Not found");
		}

		const headers = new Headers();
		obj.writeHttpMetadata(headers);
		return new Response(obj.body, { headers });
	})
	.put<IRequest, CF>("/:id", async (req, env) => {
		const obj = await req.blob();
		await env.MY_BUCKET.put(req.params.id, obj, {
			httpMetadata: { contentType: obj.type },
		});
		return { ok: true, type: obj.type };
	});
