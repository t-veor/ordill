import allWords from "./all.wordlist.txt";
import commonWords from "./common.wordlist.txt";

const binarySearch = (array: string[], value: string) => {
    let low = 0;
    let high = array.length - 1;

    while (low <= high) {
        const mid = low + ((high - low) >>> 1);
        const candidate = array[mid];

        if (candidate < value) {
            low = mid + 1;
        } else if (candidate > value) {
            high = mid - 1;
        } else {
            return mid;
        }
    }

    return ~low;
};

const includes = (array: string[], value: string) =>
    binarySearch(array, value) >= 0;

export const isValidWord = (word: string) =>
    includes(commonWords, word) || includes(allWords, word);

export const ALLOWED_LETTERS = "abcdefghijklmnopqrstuvwyxzáéíóúýþæöð";
export const isAllowedLetter = (letter: string) =>
    letter.length === 1 && ALLOWED_LETTERS.includes(letter);
