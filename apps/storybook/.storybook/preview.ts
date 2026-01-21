import type { Preview } from "@storybook/react-vite";
import "../src/styles/globals.css";

const preview: Preview = {
  tags: ["autodocs"],
  parameters: {
    actions: { argTypesRegex: "^on[A-Z].*" },
    controls: {
      matchers: {},
    },
    options: {
      storySort: {
        order: ["Overview", ["Components Overview"], "*"],
      },
    },
  },
};

export default preview;
