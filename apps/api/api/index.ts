import { handle } from "@hono/node-server/vercel";



import app from "../dist/src/index.js";

// @ts-ignore
export default handle(app);