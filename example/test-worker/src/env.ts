export interface Env {
	MY_KV_NAMESPACE: KVNamespace;
	MY_DURABLE_OBJECT: DurableObjectNamespace;
	MY_BUCKET: R2Bucket;
	MY_DATABASE: D1Database;
}

export type CF = [env: Env, context: ExecutionContext];
