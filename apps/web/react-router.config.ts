import type { Config } from "@react-router/dev/config";

export default {
  ssr: false, // for spa mode
  appDirectory: "src",
  prerender: ["/"],
} satisfies Config;
