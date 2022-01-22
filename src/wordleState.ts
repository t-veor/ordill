import { useEffect, useReducer, useState } from "preact/hooks";
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
    if (currentWord.length >= 5 || !isAllowedLetter(letter)) {
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

    if (correct) {
        return {
            ...state,
            guessedWords: [...state.guessedWords, letters],
            gameState: { name: "won" },
        };
    } else {
        return {
            ...state,
            guessedWords: [...state.guessedWords, letters],
            gameState: { name: "playing", currentWord: "" },
        };
    }
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

export function initialState(settings: Settings): WordleState {
    const isDaily = true;
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
    if (word.length !== 5) {
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

export const useWordle = (
    initialState: WordleState
): [WordleState, (action: WordleAction) => void] => {
    const [settings, setSettings] = useState(settingsManager.get());
    useEffect(() => {
        settingsManager.subscribe(setSettings);
        return () => settingsManager.unsubscribe(setSettings);
    }, []);

    const [state, dispatch] = useReducer(wordleReducer, initialState);
    const { gameState, guessedWords } = state;

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
