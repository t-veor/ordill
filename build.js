const esbuild = require("esbuild");
const fs = require("fs");
const path = require("path");

esbuild.build({
    entryPoints: ["./src/index.tsx", "./src/index.css"],
    bundle: true,
    minify: true,
    outdir: "./dist/"
}).then(() => {
    return new Promise((resolve, reject) => {
        fs.copyFile(
            path.join(__dirname, "src", "index.html"),
            path.join(__dirname, "dist", "index.html"),
            (err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            }
        );
    });
}).catch((e) => {
    console.log(e);
    process.exit(1);
});

