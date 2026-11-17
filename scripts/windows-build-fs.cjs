/* eslint-disable @typescript-eslint/no-require-imports -- Node --require preload must be CommonJS. */
// Windows antivirus/indexing and restricted desktop filesystems can temporarily
// reject concurrent directory creation. Retry only build-output mkdir operations;
// preserve every other filesystem error and the normal non-recursive semantics.
const fs = require("node:fs/promises");
const path = require("node:path");
if (process.platform === "win32") {
  const original = fs.mkdir;
  const root = path.resolve(process.env.BUILD_OUTPUT_DIR || ".next");
  fs.mkdir = async function (target, options) {
    const destination = path.resolve(String(target));
    if (!destination.startsWith(root + path.sep) && destination !== root)
      return original.call(this, target, options);
    for (let attempt = 0; ; attempt++) {
      try {
        return await original.call(this, target, options);
      } catch (error) {
        if (!["EPERM", "EACCES"].includes(error.code) || attempt >= 8)
          throw error;
        if (options && typeof options === "object" && options.recursive) {
          try {
            if ((await fs.stat(target)).isDirectory()) return;
          } catch {}
        }
        await new Promise((resolve) => setTimeout(resolve, 30 * (attempt + 1)));
      }
    }
  };
}
