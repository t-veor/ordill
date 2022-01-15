import { h, Fragment, Component } from "preact";
import Keyboard from "./Keyboard";
import WordGrid, { Letter, LetterState } from "./WordGrid";
import { isAllowedLetter, isValidWord, randomWord } from "./words";

interface WordleState {
    guessedWords: Array<Array<Letter>>,
    currentWord?: string,
    secretWord: string,
    letterStates: Record<string, LetterState | undefined>,
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

export default class Wordle extends Component<{}, WordleState> {
    state: WordleState = {
        guessedWords: [],
        secretWord: "",
        letterStates: {},
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
            case "Backspace": {
                const currentWord = this.state.currentWord;
                if (currentWord == null) {
                    break;
                }

                this.setState({
                    currentWord: currentWord.substring(0, currentWord.length - 1),
                });
                break;
            }
            default:
                this.appendLetter(key.toLowerCase());
                break;
        }
    }

    reset() {
        const secretWord = randomWord();
        this.setState({
            guessedWords: [],
            currentWord: "",
            secretWord,
            letterStates: {},
        });
    }

    appendLetter(letter: string) {
        const currentWord = this.state.currentWord;
        if (currentWord == null) {
            return;
        }

        if (currentWord.length >= 5) {
            return;
        }
        if (isAllowedLetter(letter)) {
            this.setState({
                currentWord: currentWord + letter,
            });
        }
    }

    submitWord() {
        const currentWord = this.state.currentWord;
        if (currentWord == null) {
            return;
        }

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
                    currentWord: undefined,
                    letterStates: newState,
                });
            } else {
                this.setState({
                    guessedWords: [...this.state.guessedWords, letters],
                    currentWord: "",
                    letterStates: newState,
                });
            }
        }
    }

    render() {
        const { currentWord, letterStates, guessedWords } = this.state;

        const grid = [...guessedWords];

        if (currentWord != null) {
            grid.push(currentWord.split("").map(letter => ({
                letter,
                state: 0,
            })));
        }

        const isValid = currentWord != null && currentWord.length === 5 && isValidWord(currentWord);

        return (
            <div class="wordle">
                <WordGrid words={grid} />
                <Keyboard
                    letterStates={letterStates}
                    onKeyDown={this.submitKey}
                    isValid={isValid}
                />
            </div>
        );
    }
}
