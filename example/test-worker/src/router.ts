import { IRequest, Router, createCors, error, text } from "itty-router";
import { d1 } from "./d1";
import { CF } from "./env";
import { kv } from "./kv";
import openapi from "./openapi.yaml";
import { r2 } from "./r2";

export const { preflight, corsify } = createCors({
	origins: ["*"],
	methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
});

export const router = Router<IRequest, CF>()
	.all("*", preflight)
	.get<IRequest, CF>("/", (req, env) =>
		Response.redirect(
			"https://api-spec.pages.dev/x?url=" + new URL("/openapi.yaml", req.url).toString(),
		),
	)
	.get<IRequest, CF>("/openapi.yaml", () =>
		text(openapi, { headers: { "Content-Type": "application/yaml" } }),
	)
	.all("/kv/*", kv.handle)
	.all("/d1/*", d1.handle)
	.all("/r2/*", r2.handle)
	.all("*", () => error(404));
