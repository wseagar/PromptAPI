import { build } from "esbuild";
async function main() {
  const resultBrowser = await build({
    entryPoints: ["src/browser.ts"],
    bundle: true,
    outfile: "dist/esbuild/browser.js",
    sourcemap: "both",
    minify: true,
    platform: "browser",
    format: "cjs",
    target: "es6",
  });
  console.log("resultBrowser", resultBrowser);

  const nodeCjs = await build({
    entryPoints: ["src/node.ts"],
    bundle: true,
    outfile: "dist/esbuild/node.js",
    sourcemap: "both",
    minify: true,
    platform: "node",
    format: "cjs",
    target: "es6",
  });
  console.log("resultcjs", nodeCjs);

  const nodeEsm = await build({
    entryPoints: ["src/node.ts"],
    bundle: true,
    outfile: "dist/esbuild/node.mjs",
    sourcemap: "both",
    minify: true,
    platform: "node",
    format: "esm",
    target: "es6",
  });
  console.log("resultesm", nodeEsm);
}
main();
