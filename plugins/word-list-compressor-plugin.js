const { promises: fs } = require("fs");
const path = require("path");

const commonPrefix = (a, b) => {
    if (a.length !== b.length) {
        throw new Error(`Can't compress words of different lengths! (Found ${a} and ${b})`);
    }
    let i = 0;
    for (; i < a.length; i++) {
        if (a[i] !== b[i]) {
            break;
        }
    }
    return i;
}

const compress = (words) => {
    if (words.length < 1) {
        throw new Error("Must compress word lists of at least 1 word!");
    }
    words.sort();

    const compressedWords = [];
    compressedWords.push(words[0]);
    let prevWord = words[0];
    for (let i = 1; i < words.length; i++) {
        const word = words[i];
        const j = commonPrefix(prevWord, word);
        compressedWords.push(word.substring(j));
        prevWord = word;
    }
    return compressedWords.join(".");
}

const wordListCompressorPlugin = {
    name: "word-list-compressor",
    setup(build) {

        build.onResolve({ filter: /^word-list-uncompressor$/ }, args => ({
            path: args.path,
            namespace: "word-list-uncompressor",
        }));

        build.onLoad({ filter: /.*/, namespace: "word-list-uncompressor" }, () => ({
            contents: `
export default function uncompress(data) {
    const words = [];

    const splitData = data.split(".");
    let prevWord = splitData[0];
    words.push(prevWord);

    for (let i = 1; i < splitData.length; i++) {
        const curr = splitData[i];
        const word = prevWord.substring(0, prevWord.length - curr.length) + curr;
        words.push(word);
        prevWord = word;
    }

    return words;
}
            `,
            loader: "js",
        }));

        build.onResolve({ filter: /.wordlist.txt$/ }, (args) => {
            const absolutePath = path.isAbsolute(args.path) ?
                args.path : path.join(args.resolveDir, args.path);
            return {
                path: absolutePath,
                namespace: "word-list-to-compress",
            };
        });

        build.onLoad({ filter: /.*/, namespace: "word-list-to-compress" }, async (args) => {
            const contents = await fs.readFile(args.path, { encoding: "utf8" });
            const uncompressedWords = contents.split("\n");
            if (uncompressedWords[uncompressedWords.length - 1] === "") {
                uncompressedWords.pop();
            }
            const compressed = compress(uncompressedWords);

            return {
                contents: `
import uncompress from "word-list-uncompressor";
const data = uncompress(${JSON.stringify(compressed)});
export default data;
                `,
                loader: "js",
            };
        });
    }
};

module.exports = wordListCompressorPlugin;
