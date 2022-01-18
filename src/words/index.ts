import allWords from "./all.wordlist.txt";
import commonWords from "./common.wordlist.txt";

export const randomWord = () => commonWords[Math.random() * commonWords.length | 0];

export const isValidWord = (word: string) => commonWords.includes(word) || allWords.includes(word);

export const ALLOWED_LETTERS = "abcdefghijklmnopqrstuvwyxzáéíóúýþæöð";
export const isAllowedLetter = (letter: string) => letter.length === 1 && ALLOWED_LETTERS.includes(letter);
