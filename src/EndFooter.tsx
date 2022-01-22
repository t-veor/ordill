import { h, Fragment, Component } from "preact"
import { WordleState } from "./wordleState";

export interface EndFooterProps {
    wordle: WordleState,
    onPlayAgain?: () => void;
    onCopyResults?: () => Promise<void>;
}

interface EndFooterState {
    copied: boolean,
}

const isPlural = (n: number): boolean => {
    const endsInEleven = n % 100 === 11;
    const endsInOne = n % 10 === 1;
    return !endsInOne || endsInEleven;
};

export default class EndFooter extends Component<EndFooterProps, EndFooterState> {
    state: EndFooterState = {
        copied: false
    };

    onCopyResults = () => {
        if (this.props.onCopyResults) {
            this.props.onCopyResults().then(() => {
                this.setState({ copied: true });
            });
        }
    };

    render({ wordle, onPlayAgain }: EndFooterProps, { copied }: EndFooterState) {
        const { gameState, guessedWords, secretWord } = wordle;
        const state = gameState.name;
        const guesses = guessedWords.length;

        let message;
        if (state === "won") {
            message = `Þér tókst það í ${guesses} tilraun${isPlural(guesses) ? "um" : ""}!`;
        } else if (state === "resigned") {
            message = `Þú gafst upp eftir ${guesses} tilraun${isPlural(guesses) ? "ir" : ""}!`;
        } else {
            message = `Orðið var ${secretWord.toUpperCase()}.`;
        }

        return (
            <div class="end-footer">
                <div class="end-footer-message">{message}</div>
                <button class="end-footer-button play-again" onClick={onPlayAgain}>
                    Spila Aftur
                </button>
                <button class="end-footer-button copy-results" onClick={this.onCopyResults}>
                    {copied ? "Afritað!" : "Deila"}
                </button>
            </div>
        );
    }
}
