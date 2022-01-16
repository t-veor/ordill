import { h, Fragment, Component } from "preact";
import EndFooter from "./EndFooter";
import Keyboard from "./Keyboard";
import WordGrid, { Letter, LetterState } from "./WordGrid";
import { isAllowedLetter, isValidWord, randomWord } from "./words";

const SQUARES = ["\u{2b1c}", "\u{2b1b}", "\u{1f7e8}", "\u{1f7e9}"];

type GameState = {
    state: "playing",
    currentWord: string,
} | {
    state: "won"
} | {
    state: "resigned"
};

interface WordleState {
    guessedWords: Array<Array<Letter>>,
    gameState: GameState,
    secretWord: string,
    letterStates: Record<string, LetterState | undefined>,
    generation: number,
}

const checkWord = (word: string, target: string): Array<Letter> | null => {
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
                state: 3,
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
                state: 1,
            };
        } else {
            letters[i] = {
                letter,
                state: 2,
            };
            freqs[letter] -= 1;
        }
    }

    return letters;
}

const makeResultText = (guessedWords: Array<Array<Letter>>): string => {
    const grid = guessedWords
        .map(word => (
            word.map(({ state }) => SQUARES[state]).join("")
        )).join("\n");

    return `Íslenskt Wordle ${guessedWords.length}/\u{221e}\n\n${grid}`;
}

export default class Wordle extends Component<{}, WordleState> {
    state: WordleState = {
        guessedWords: [],
        gameState: {
            state: "playing",
            currentWord: ""
        },
        secretWord: "",
        letterStates: {},
        generation: 0,
    };

    componentDidMount() {
        document.addEventListener("keydown", this.onKeyDown);
        this.reset();
    }

    componentWillUnmount() {
        document.removeEventListener("keydown", this.onKeyDown);
    }

    onKeyDown = (event: KeyboardEvent) => {
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
        const text = makeResultText(this.state.guessedWords);
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

    submitWord() {
        const { gameState } = this.state;
        if (gameState.state !== "playing") {
            return;
        }

        const { currentWord } = gameState;

        const correct = currentWord === this.state.secretWord;

        if (correct || currentWord.length === 5 && isValidWord(currentWord)) {
            const letters = checkWord(currentWord, this.state.secretWord)!;

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
                state: 0,
            })));

            const wordIsValid = currentWord.length === 5 && isValidWord(currentWord);
            footer = (
                <Keyboard
                    letterStates={letterStates}
                    onKeyDown={this.submitKey}
                    wordIsValid={wordIsValid}
                />
            );
        } else {
            if (gameState.state === "resigned") {
                grid.push(secretWord.split("").map(letter => ({
                    letter,
                    state: 3,
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

