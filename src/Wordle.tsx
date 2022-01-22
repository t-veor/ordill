import { h, Fragment } from "preact";
import { useCallback, useEffect, useMemo } from "preact/hooks";
import EndFooter from "./EndFooter";
import Keyboard from "./Keyboard";
import settingsManager from "./settings";
import WordGrid, { Letter, LetterState } from "./WordGrid";
import { initialState, useWordle, validateWord } from "./wordleState";

const SQUARES = ["\u{2b1b}", "\u{2b1c}", "\u{1f7e8}", "\u{1f7e9}", "\u{1f7e6}", "\u{1f7e7}"];

const makeResultText = (guessedWords: Array<Array<Letter>>, hardMode: boolean) => {
    const { dark, highContrast } = settingsManager.get();

    const squares = [""];
    squares.push(SQUARES[dark ? 0 : 1])
    squares.push(SQUARES[highContrast ? 4 : 2]);
    squares.push(SQUARES[highContrast ? 5 : 3]);

    const hardModeStar = hardMode ? "*" : "";

    const grid = guessedWords
        .map(word => (
            word.map(({ state }) => squares[state]).join("")
        )).join("\n");

    return `Orðill ${guessedWords.length}/\u{221e}${hardModeStar}\n\n${grid}`;
}

export default function Wordle() {
    const [state, dispatch] = useWordle(initialState(settingsManager.get()))
    const { gameState, guessedWords, secretWord } = state;

    const submitKey = useCallback((key: string) => {
        switch (key) {
            case "Enter":
                return dispatch({ type: "submit" });
            case "Backspace":
                return dispatch({ type: "backspace" });
            case "GiveUp":
                return dispatch({ type: "resign" });
            default:
                return dispatch({ type: "input", letter: key.toLowerCase() });
        }
    }, []);

    const onKeyDown = useCallback((event: KeyboardEvent) => {
        const target = event.target as HTMLElement;
        if (event.key === "Enter" && (target.tagName === "BUTTON" || target.tagName === "A")) {
            return;
        }
        submitKey(event.key);
    }, [submitKey]);
    useEffect(() => {
        document.addEventListener("keydown", onKeyDown);
        return () => document.removeEventListener("keydown", onKeyDown);
    }, [onKeyDown]);

    const playAgain = () => {
        dispatch({
            type: "load",
            newState: initialState(settingsManager.get()),
        });
    };

    const copyResults = () => {
        const text = makeResultText(state.guessedWords, state.hardMode);
        return navigator.clipboard.writeText(text);
    };

    const letterStates = useMemo(() => {
        const states: Record<string, LetterState> = {};
        for (const word of guessedWords) {
            for (const { letter, state } of word) {
                if ((states[letter] || 0) < state) {
                    states[letter] = state;
                }
            }
        }
        return states;
    }, [guessedWords]);

    const grid = useMemo(() => {
        const grid = [...guessedWords];
        if (gameState.name === "playing") {
            grid.push(gameState.currentWord.split("").map(letter => ({
                letter, state: LetterState.Entry
            })));
        } else if (gameState.name === "resigned") {
            grid.push(secretWord.split("").map(letter => ({
                letter,
                state: LetterState.Correct,
                resigning: true,
            })));
        }
        return grid;
    }, [guessedWords, gameState, secretWord]);

    const wordIsValid = gameState.name === "playing" ?
        !!validateWord(state, gameState.currentWord).valid : false;

    const footer = gameState.name === "playing" ?
        (
            <Keyboard
                letterStates={letterStates}
                onKeyDown={submitKey}
                wordIsValid={wordIsValid}
            />
        )
        :
        (
            <EndFooter
                state={gameState.name}
                guesses={guessedWords.length}
                secretWord={secretWord}
                onPlayAgain={playAgain}
                onCopyResults={copyResults}
            />
        );


    return (
        <>
            <div class="mode-display">Frjálst</div>
            <WordGrid words={grid} />
            {footer}
        </>
    );
}
