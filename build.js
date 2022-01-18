const esbuild = require("esbuild");
const { promises: fs } = require("fs");
const path = require("path");
const wordListCompressorPlugin = require("./plugins/word-list-compressor-plugin");

async function copyDir(src, dst) {
    await fs.mkdir(dst, { recursive: true });
    const entries = await fs.readdir(src, { withFileTypes: true });

    for (const entry of entries) {
        const srcPath = path.join(src, entry.name);
        const dstPath = path.join(dst, entry.name);

        if (entry.isDirectory()) {
            await copyDir(srcPath, dstPath);
        } else {
            await fs.copyFile(srcPath, dstPath);
        }
    }
}

esbuild.build({
    entryPoints: ["./src/index.tsx", "./src/index.css"],
    external: ["fonts/*"],
    bundle: true,
    minify: true,
    outdir: "./dist/",
    plugins: [wordListCompressorPlugin],
}).then(() => {
    // Copy static
    return copyDir(
        path.join(__dirname, "static"),
        path.join(__dirname, "dist"),
    );
}).catch((e) => {
    console.log(e);
    process.exit(1);
});

