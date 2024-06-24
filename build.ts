import { build } from "esbuild";
import { copy } from "esbuild-plugin-copy";

(async () => {
  const res = await build({
    entryPoints: ["./src/index.ts"],
    outdir: "build",
    bundle: true,
    minify: true,
    sourcemap: true,
    plugins: [
      copy({
        resolveFrom: "cwd",
        assets: [
          {
            from: ["./manifest.json"],
            to: ["./build/manifest.json"],
          },
          {
            from: ["./icons/*.png"],
            to: ["./build/icons"],
          },
        ],
      }),
    ],
  });
})();
