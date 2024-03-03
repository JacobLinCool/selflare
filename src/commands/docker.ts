import dedent from "dedent";
import fs from "node:fs";
import type { Arguments } from "yargs";

interface Args {
	capnp: string;
}

export function docker(argv: Arguments<Args>): void {
	if (fs.existsSync("Dockerfile")) {
		console.log("Dockerfile already exists, skipping");
	} else {
		fs.writeFileSync(
			"Dockerfile",
			dedent`
            FROM jacoblincool/workerd:latest

            COPY ${argv.capnp} ./worker.capnp

            CMD ["serve", "--experimental", "--binary", "worker.capnp"]
        `,
		);
		console.log("Wrote Dockerfile");
	}

	if (fs.existsSync("docker-compose.yml")) {
		console.log("docker-compose.yml already exists, skipping");
	} else {
		fs.writeFileSync(
			"docker-compose.yml",
			dedent`
            version: "3.8"

            services:
                worker:
                    build: .
                    image: worker
                    volumes:
                        - ./.storage/cache:/worker/cache
                        - ./.storage/kv:/worker/kv
                        - ./.storage/d1:/worker/d1
                        - ./.storage/r2:/worker/r2
                    ports:
                        - "8080:8080"
        `,
		);
		console.log("Wrote docker-compose.yml");
	}
}
