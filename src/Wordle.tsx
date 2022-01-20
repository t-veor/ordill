import { h, Fragment, Component } from "preact";
import EndFooter from "./EndFooter";
import Keyboard from "./Keyboard";
import settingsManager, { Settings } from "./settings";
import { toast } from "./Toaster";
import WordGrid, { Letter, LetterState } from "./WordGrid";
import { isAllowedLetter, isValidWord, randomWord } from "./words";

const SQUARES = ["\u{2b1b}", "\u{2b1c}", "\u{1f7e8}", "\u{1f7e9}", "\u{1f7e6}", "\u{1f7e7}"];

type GameState = {
    state: "playing",
    currentWord: string,
} | {
    state: "won"
} | {
    state: "resigned"
};

interface WordleState {
    gameState: GameState,
    guessedWords: Array<Array<Letter>>,
    secretWord: string,
    letterStates: Record<string, LetterState | undefined>,

    generation: number,
    settings: Settings,
}

type ValidateResult = {
    valid: true,
    error?: undefined
} | {
    valid?: undefined,
    error: string,
}

const validateWord = (word: string, lastGuess?: Array<Letter>, hardMode?: boolean): ValidateResult => {
    if (!isValidWord(word)) {
        return {
            error: "Orð ekki gilt",
        };
    }

    if (!hardMode) {
        return { valid: true };
    }

    return validateHardModeConstraints(word, lastGuess);
}

// Actually it's only possible to index 0 or 1 into this array, but whatever
const NEUTER_CARDINALS = ["", "", "tvö ", "þrjú ", "fjögur ", "fimm "];

const validateHardModeConstraints = (word: string, lastGuess?: Array<Letter>): ValidateResult => {
    if (lastGuess == null) {
        return { valid: true };
    }

    for (let i = 0; i < lastGuess.length; i++) {
        const { letter, state } = lastGuess[i];
        if (word[i] !== letter && state === LetterState.Correct) {
            return {
                error: `${i + 1}. stafurinn verður að vera ${letter.toUpperCase()}`,
            };
        }
    }

    const requiredLetterFreqs: Record<string, number> = {};
    for (const { letter, state } of lastGuess) {
        if (state >= LetterState.Partial) {
            requiredLetterFreqs[letter] = (requiredLetterFreqs[letter] || 0) + 1;
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
                error: `Orð verður að innihalda ${NEUTER_CARDINALS[requiredFreq]}${letter.toUpperCase()}`,
            };
        }
    }

    return { valid: true };
}

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
}

const makeResultText = (guessedWords: Array<Array<Letter>>, settings: Settings) => {
    const { dark, highContrast, hardMode } = settings;

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

export default class Wordle extends Component<{}, WordleState> {
    state: WordleState = {
        gameState: {
            state: "playing",
            currentWord: ""
        },
        guessedWords: [],
        secretWord: "",
        letterStates: {},

        generation: 0,
        settings: {},
    };

    componentDidMount() {
        document.addEventListener("keydown", this.onKeyDown);
        settingsManager.subscribe(this.onSettingsChange);
        this.reset();
    }

    componentWillUnmount() {
        document.removeEventListener("keydown", this.onKeyDown);
        settingsManager.unsubscribe(this.onSettingsChange);
    }

    componentDidUpdate() {
        const { gameState, guessedWords } = this.state;
        settingsManager.reportInProgress(
            gameState.state === "playing" && guessedWords.length > 0
        );
    }

    onSettingsChange = (settings: Settings) => {
        this.setState({ settings });
    }

    onKeyDown = (event: KeyboardEvent) => {
        const target = event.target as HTMLElement;
        if (event.key === "Enter" && (target.tagName === "BUTTON" || target.tagName === "A")) {
            return;
        }
        this.submitKey(event.key);
    };

    submitKey = (key: string) => {
        switch (key) {
            case "Enter":
                this.submitWord();
                break;
            case "Backspace":
                this.backspace();
                break;
            case "GiveUp":
                this.giveUp();
                break;
            default:
                this.appendLetter(key.toLowerCase());
                break;
        }
    }

    playAgain = () => {
        this.reset();
    }

    copyResults = () => {
        const text = makeResultText(this.state.guessedWords, this.state.settings);
        return navigator.clipboard.writeText(text);
    }

    reset() {
        const secretWord = randomWord();
        this.setState({
            guessedWords: [],
            gameState: {
                state: "playing",
                currentWord: "",
            },
            secretWord,
            letterStates: {},
            generation: this.state.generation + 1,
        });
    }

    appendLetter(letter: string) {
        const { gameState } = this.state;
        if (gameState.state !== "playing") {
            return;
        }

        const { currentWord } = gameState;
        if (currentWord.length >= 5) {
            return;
        }
        if (isAllowedLetter(letter)) {
            this.setState({
                gameState: {
                    state: "playing",
                    currentWord: currentWord + letter,
                }
            });
        }
    }

    backspace() {
        const { gameState } = this.state;
        if (gameState.state !== "playing") {
            return;
        }

        const { currentWord } = gameState;
        this.setState({
            gameState: {
                state: "playing",
                currentWord: currentWord.substring(0, currentWord.length - 1),
            },
        });
    }

    validateWord(word: string): ValidateResult {
        if (word.length !== 5) {
            return { error: "Of fáir bókstafir" };
        }

        const { guessedWords, settings } = this.state;
        const { hardMode } = settings;
        return validateWord(word, guessedWords[guessedWords.length - 1], hardMode);
    }

    submitWord() {
        const { gameState } = this.state;
        if (gameState.state !== "playing") {
            return;
        }

        const { currentWord } = gameState;

        const correct = currentWord === this.state.secretWord;

        let valid = correct;
        if (!valid) {
            const result = this.validateWord(currentWord);
            if (result.error) {
                toast(result.error);
            }
            valid = !!result.valid;
        }

        if (!valid) {
            return;
        }

        const letters = scoreWord(currentWord, this.state.secretWord)!;

        const newState = Object.assign({}, this.state.letterStates);
        for (const { letter, state } of letters) {
            const prevState = newState[letter];
            if (prevState == null || prevState < state) {
                newState[letter] = state;
            }
        }

        if (correct) {
            this.setState({
                guessedWords: [...this.state.guessedWords, letters],
                gameState: { state: "won" },
                letterStates: newState,
            });
        } else {
            this.setState({
                guessedWords: [...this.state.guessedWords, letters],
                gameState: {
                    state: "playing",
                    currentWord: "",
                },
                letterStates: newState,
            });
        }
    }

    giveUp() {
        const { gameState } = this.state;
        if (gameState.state !== "playing") {
            return;
        }

        this.setState({
            gameState: {
                state: "resigned"
            },
        });
    }

    render() {
        const { gameState, letterStates, guessedWords, secretWord, generation } = this.state;

        const grid = [...guessedWords];

        let footer = null;
        if (gameState.state === "playing") {
            const { currentWord } = gameState;
            grid.push(currentWord.split("").map(letter => ({
                letter,
                state: LetterState.Entry,
            })));

            footer = (
                <Keyboard
                    letterStates={letterStates}
                    onKeyDown={this.submitKey}
                    wordIsValid={!!this.validateWord(currentWord).valid}
                />
            );
        } else {
            if (gameState.state === "resigned") {
                grid.push(secretWord.split("").map(letter => ({
                    letter,
                    state: LetterState.Correct,
                    resigning: true,
                })));
            }

            footer = (
                <EndFooter
                    state={gameState.state}
                    guesses={guessedWords.length}
                    onPlayAgain={this.playAgain}
                    onCopyResults={this.copyResults}
                />
            );
        }

        return (
            <>
                <WordGrid key={generation} words={grid} />
                {footer}
            </>
        );
    }
}

