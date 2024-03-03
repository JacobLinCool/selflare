import { error, json } from "itty-router";
import { Env } from "./env";
import { corsify, router } from "./router";

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		console.log(request.method, request.url);
		return router.handle(request, env, ctx).then(json).then(corsify).catch(error);
	},
};
