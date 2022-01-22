import { useEffect, useReducer, useState } from "preact/hooks";
import { DAILY_GUESSES, WORD_LENGTH } from "./consts";
import settingsManager, { Settings } from "./settings";
import { toast } from "./Toaster";
import { Letter, LetterState } from "./WordGrid";
import { isAllowedLetter, isValidWord, randomWord } from "./words";

type GameState =
    | {
          name: "playing";
          currentWord: string;
      }
    | {
          name: "won";
      }
    | {
          name: "resigned";
      }
    | {
          name: "lost";
      };

export interface WordleState {
    gameState: GameState;
    guessedWords: Array<Array<Letter>>;
    secretWord: string;
    isDaily: boolean;
    hardMode: boolean;
    generation?: number;
    toastMessage?: { message: string };
}

export type WordleAction =
    | {
          type: "input";
          letter: string;
      }
    | {
          type: "submit";
      }
    | {
          type: "backspace";
      }
    | {
          type: "resign";
      }
    | {
          type: "load";
          newState: WordleState;
      }
    | {
          type: "setHardMode";
          hardMode: boolean;
      };

function wordleReducer(state: WordleState, action: WordleAction): WordleState {
    switch (action.type) {
        case "input":
            return appendLetter(state, action.letter);
        case "submit":
            return submitWord(state);
        case "backspace":
            return backspace(state);
        case "resign":
            return resign(state);
        case "load":
            return action.newState;
        case "setHardMode":
            return { ...state, hardMode: action.hardMode };
        default:
            return state;
    }
}

function appendLetter(state: WordleState, letter: string): WordleState {
    const { gameState } = state;
    if (gameState.name !== "playing") {
        return state;
    }

    const { currentWord } = gameState;
    if (currentWord.length >= WORD_LENGTH || !isAllowedLetter(letter)) {
        return state;
    }

    return {
        ...state,
        gameState: {
            name: "playing",
            currentWord: currentWord + letter,
        },
    };
}

function backspace(state: WordleState): WordleState {
    const { gameState } = state;
    if (gameState.name !== "playing") {
        return state;
    }

    const { currentWord } = gameState;
    return {
        ...state,
        gameState: {
            name: "playing",
            currentWord: currentWord.substring(0, currentWord.length - 1),
        },
    };
}

function submitWord(state: WordleState): WordleState {
    const { gameState, secretWord } = state;
    if (gameState.name !== "playing") {
        return state;
    }

    const { currentWord } = gameState;

    const correct = currentWord === secretWord;

    let valid = correct;
    if (!valid) {
        const result = validateWord(state, currentWord);
        if (result.error) {
            state = { ...state, toastMessage: { message: result.error } };
        }
        valid = !!result.valid;
    }

    if (!valid) {
        return state;
    }

    const letters = scoreWord(currentWord, secretWord)!;
    const guessedWords = [...state.guessedWords, letters];

    let newGameState: GameState;
    if (correct) {
        newGameState = { name: "won" };
    } else if (state.isDaily && guessedWords.length >= DAILY_GUESSES) {
        newGameState = { name: "lost" };
    } else {
        newGameState = { name: "playing", currentWord: "" };
    }

    return {
        ...state,
        guessedWords,
        gameState: newGameState,
    };
}

function resign(state: WordleState): WordleState {
    const { gameState } = state;
    if (gameState.name !== "playing") {
        return state;
    }

    return {
        ...state,
        gameState: { name: "resigned" },
    };
}

export function initialState(
    isDaily: boolean,
    settings: Settings
): WordleState {
    const secretWord = randomWord();
    return {
        gameState: { name: "playing", currentWord: "" },
        guessedWords: [],
        isDaily,
        hardMode: !!settings.hardMode,
        secretWord,
    };
}

type ValidateResult =
    | {
          valid: true;
          error?: undefined;
      }
    | {
          valid?: undefined;
          error: string;
      };

export const validateWord = (
    state: WordleState,
    word: string
): ValidateResult => {
    if (word.length !== WORD_LENGTH) {
        return { error: "Of fáir bókstafir" };
    }

    const { guessedWords, hardMode } = state;
    if (!isValidWord(word)) {
        return {
            error: "Orð ekki gilt",
        };
    }

    if (!hardMode) {
        return { valid: true };
    }

    const lastGuess = guessedWords[guessedWords.length - 1];
    return validateHardModeConstraints(word, lastGuess);
};

// Actually it's only possible to index 1 or 2 into this array, but whatever
const NEUTER_CARDINALS = ["", "", "tvö ", "þrjú ", "fjögur ", "fimm "];

const validateHardModeConstraints = (
    word: string,
    lastGuess?: Array<Letter>
): ValidateResult => {
    if (lastGuess == null) {
        return { valid: true };
    }

    for (let i = 0; i < lastGuess.length; i++) {
        const { letter, state } = lastGuess[i];
        if (word[i] !== letter && state === LetterState.Correct) {
            return {
                error: `${
                    i + 1
                }. stafurinn verður að vera ${letter.toUpperCase()}`,
            };
        }
    }

    const requiredLetterFreqs: Record<string, number> = {};
    for (const { letter, state } of lastGuess) {
        if (state >= LetterState.Partial) {
            requiredLetterFreqs[letter] =
                (requiredLetterFreqs[letter] || 0) + 1;
        }
    }
    const foundLetterFreqs: Record<string, number> = {};
    for (let i = 0; i < word.length; i++) {
        const l = word[i];
        foundLetterFreqs[l] = (foundLetterFreqs[l] || 0) + 1;
    }

    for (const letter of Object.keys(requiredLetterFreqs)) {
        const requiredFreq = requiredLetterFreqs[letter];
        if ((foundLetterFreqs[letter] || 0) < requiredFreq) {
            return {
                error: `Orð verður að innihalda ${
                    NEUTER_CARDINALS[requiredFreq]
                }${letter.toUpperCase()}`,
            };
        }
    }

    return { valid: true };
};

const scoreWord = (word: string, target: string): Array<Letter> | null => {
    if (word.length !== target.length) {
        return null;
    }

    const letters: Array<Letter> = Array(word.length);

    const freqs: Record<string, number> = {};
    for (let i = 0; i < target.length; i++) {
        const letter = target[i];
        freqs[letter] = (freqs[letter] ?? 0) + 1;
    }

    for (let i = 0; i < word.length; i++) {
        if (word[i] === target[i]) {
            letters[i] = {
                letter: word[i],
                state: LetterState.Correct,
            };
            freqs[word[i]] -= 1;
        }
    }

    for (let i = 0; i < word.length; i++) {
        if (letters[i] != null) {
            continue;
        }

        const letter = word[i];
        if (freqs[letter] == null || freqs[letter] <= 0) {
            letters[i] = {
                letter,
                state: LetterState.Incorrect,
            };
        } else {
            letters[i] = {
                letter,
                state: LetterState.Partial,
            };
            freqs[letter] -= 1;
        }
    }

    return letters;
};

const isObject = (obj: unknown): obj is Record<string, unknown> => {
    return typeof obj === "object" && obj !== null;
};

const tryParseGameState = (obj: unknown): GameState | null => {
    if (!isObject(obj)) {
        return null;
    }

    const name = "" + obj.name;
    if (name === "playing") {
        let currentWord = "" + obj.currentWord;
        currentWord = currentWord.split("").filter(isAllowedLetter).join("");
        return {
            name,
            currentWord,
        };
    } else if (name === "won" || name === "resigned" || name === "lost") {
        return { name };
    }

    return null;
};

const tryParseGuessedWords = (obj: unknown): Array<Array<Letter>> | null => {
    const guessedWords: Array<Array<Letter>> = [];

    if (!Array.isArray(obj)) {
        return null;
    }

    for (const word of obj) {
        if (!Array.isArray(word)) {
            return null;
        }

        const resultWord: Array<Letter> = [];
        for (let i = 0; i < Math.min(word.length, WORD_LENGTH); i++) {
            const l = word[i];
            if (!isObject(l)) {
                return null;
            }

            const letter = l.letter;
            if (typeof letter !== "string" || !isAllowedLetter(letter)) {
                return null;
            }

            const state = l.state;
            if (
                state !== LetterState.Incorrect &&
                state !== LetterState.Partial &&
                state !== LetterState.Correct
            ) {
                return null;
            }

            resultWord.push({ letter, state });
        }
        guessedWords.push(resultWord);
    }

    return guessedWords;
};

const tryParseWordleState = (
    isDaily: boolean,
    obj: unknown
): WordleState | null => {
    if (!isObject(obj)) {
        return null;
    }

    const gameState = tryParseGameState(obj.gameState);
    if (gameState == null) {
        return null;
    }

    const guessedWords = tryParseGuessedWords(obj.guessedWords);
    if (guessedWords == null) {
        return null;
    }

    const secretWord = obj.secretWord;
    if (typeof secretWord !== "string" || secretWord.length !== WORD_LENGTH) {
        return null;
    }

    const hardMode = !!obj.hardMode;

    return {
        gameState,
        guessedWords,
        secretWord,
        isDaily,
        hardMode,
    };
};

const tryLoadGame = (isDaily: boolean): WordleState | null => {
    const storageKey = isDaily ? "dailySave" : "freeplaySave";
    try {
        const data = localStorage.getItem(storageKey);
        const parsed: unknown = JSON.parse(data!);

        return tryParseWordleState(isDaily, parsed);
    } catch (err) {
        console.log(err);
    }

    return null;
};

const saveGame = ({ generation, toastMessage, ...game }: WordleState) => {
    const storageKey = game.isDaily ? "dailySave" : "freeplaySave";
    try {
        localStorage.setItem(storageKey, JSON.stringify(game));
    } catch (err) {
        console.log(err);
    }
};

export const loadGameOrNew = (
    isDaily: boolean,
    settings: Settings,
    prevState?: WordleState
): WordleState => {
    const game = tryLoadGame(isDaily) ?? initialState(isDaily, settings);
    game.generation = (prevState?.generation ?? 0) + 1;
    return game;
};

export const useWordle = (
    initialize: () => WordleState
): [WordleState, (action: WordleAction) => void] => {
    const [settings, setSettings] = useState(settingsManager.get());
    useEffect(() => {
        settingsManager.subscribe(setSettings);
        return () => settingsManager.unsubscribe(setSettings);
    }, []);

    const [state, dispatch] = useReducer(wordleReducer, undefined, initialize);
    const { gameState, guessedWords } = state;

    useEffect(() => saveGame(state), [state]);

    useEffect(() => {
        dispatch({ type: "setHardMode", hardMode: !!settings.hardMode });
    }, [settings.hardMode]);

    useEffect(() => {
        settingsManager.reportInProgress(
            gameState.name === "playing" && guessedWords.length > 0
        );
    }, [gameState.name, guessedWords]);

    useEffect(() => {
        if (state.toastMessage) {
            toast(state.toastMessage.message);
        }
    }, [state.toastMessage]);

    return [state, dispatch];
};
