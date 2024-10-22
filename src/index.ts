import * as dotenv from "dotenv";
import { resolve } from "path";
import { cwd } from "process";
import { createMultiServer } from "./multi-server";
import { createSingleServer } from "./single-sever";

dotenv.config({ path: resolve(cwd(), ".env") });

export const PORT = process.env.PORT || 4000;

const isMultiServerMode = process.argv.includes("--multi");

if (isMultiServerMode) {
  createMultiServer(PORT);
} else {
  createSingleServer(PORT);
}
