import { handle } from "@hono/node-server/vercel";

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
import app from "../dist/src/app.js";

export default handle(app);
