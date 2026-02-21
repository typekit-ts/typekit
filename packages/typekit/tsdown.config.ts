import { defineConfig } from "tsdown";

export default defineConfig({
  exports: true,
  entry: [
    // Export whole project
    "./src/index.ts",
    // Export basic building blocks for application development
    // "./src/prelude.ts",

    "./src/result/index.ts",
    "./src/option/index.ts",
  ],
});
