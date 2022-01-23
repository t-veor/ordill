import { h, Fragment } from "preact";
import { useCallback, useContext, useEffect, useMemo } from "preact/hooks";
import { AppContext } from "./App";
import { DAILY_GUESSES } from "./consts";
import EndFooter from "./EndFooter";
import Keyboard from "./Keyboard";
import settingsManager from "./settings";
import { toast } from "./Toaster";
import WordGrid, { Letter, LetterState } from "./WordGrid";
import { initialState, validateWord, WordleAction, WordleState } from "./wordleState";

const SQUARES = ["\u{2b1b}", "\u{2b1c}", "\u{1f7e8}", "\u{1f7e9}", "\u{1f7e6}", "\u{1f7e7}"];
const LINK = "https://t-veor.github.io/ordill/";

export interface WordleProps {
    wordle: WordleState,
    dispatchWordle: (action: WordleAction) => void,
    onShowStats?: () => void;
}

const makeResultText = (guessedWords: Array<Array<Letter>>, hardMode: boolean, dailyNumber?: number) => {
    const { dark, highContrast } = settingsManager.get();

    const squares = [""];
    squares.push(SQUARES[dark ? 0 : 1])
    squares.push(SQUARES[highContrast ? 4 : 2]);
    squares.push(SQUARES[highContrast ? 5 : 3]);

    const dayCount = dailyNumber != null ? `${dailyNumber + 1} ` : "";
    const totalGuesses = dailyNumber != null ? `${DAILY_GUESSES}` : "\u{221e}";
    const hardModeStar = hardMode ? "*" : "";

    const grid = guessedWords
        .map(word => (
            word.map(({ state }) => squares[state]).join("")
        )).join("  \n");

    return `Orðill ${dayCount}${guessedWords.length}/${totalGuesses}${hardModeStar}\n\n${grid}\n${LINK}`;
}

export default function Wordle({ wordle, dispatchWordle, onShowStats }: WordleProps) {
    const { gameState, guessedWords, secretWord, dailyNumber, generation } = wordle;
    const isDaily = dailyNumber != null;

    const { statsDidShow } = useContext(AppContext);

    const submitKey = useCallback((key: string) => {
        switch (key) {
            case "Enter":
                return dispatchWordle({ type: "submit" });
            case "Backspace":
                return dispatchWordle({ type: "backspace" });
            case "GiveUp":
                return dispatchWordle({ type: "resign" });
            default:
                return dispatchWordle({ type: "input", letter: key.toLowerCase() });
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
        dispatchWordle({
            type: "load",
            newState: initialState(settingsManager.get(), wordle.hardMode),
        });
    };

    const copyResults = () => {
        const text = makeResultText(wordle.guessedWords, wordle.hardMode, dailyNumber);
        navigator.clipboard.writeText(text)
            .then(() => toast("Afritun tókst!"))
            .catch(() => toast("Afritun mistókst!"));
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

    const isEndGame = gameState.name !== "playing";

    const wordIsValid = !isEndGame ?
        !!validateWord(wordle, gameState.currentWord).valid : false;

    const showFooter = isEndGame && (!isDaily || statsDidShow);
    const footer = !showFooter ?
        (
            <Keyboard
                letterStates={letterStates}
                onKeyDown={submitKey}
                wordIsValid={wordIsValid}
                isDaily={isDaily}
            />
        )
        :
        (
            <EndFooter
                wordle={wordle}
                onPlayAgain={playAgain}
                onCopyResults={copyResults}
                onShowStats={onShowStats}
            />
        );


    return (
        <>
            <div class="mode-display">
                {isDaily ? `Daglegt - #${dailyNumber + 1}` : "Frjálst"}
            </div>
            <WordGrid
                words={grid}
                minRows={isDaily ? DAILY_GUESSES : undefined}
                key={generation}
            />
            {footer}
        </>
    );
}
