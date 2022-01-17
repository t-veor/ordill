const esbuild = require("esbuild");
const { promises: fs } = require("fs");
const path = require("path");

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
    outdir: "./dist/"
}).then(() => {
    // Copy static
    return copyDir(
        path.join(__dirname, "static"),
        path.join(__dirname, "dist"),
    );
}).then(() => {
    // Copy fonts
    return copyDir(
        path.join(__dirname, "fonts"),
        path.join(__dirname, "dist/fonts"),
    );
}).catch((e) => {
    console.log(e);
    process.exit(1);
});

