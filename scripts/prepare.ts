import { existsSync } from "node:fs";

(async function () {
  const isProd = process.env.NODE_ENV === "production";

  const hasGit = await existsSync(".git");

  if (!isProd && hasGit) {
    await Bun.$`bun lefthook install`;
  }
})();
