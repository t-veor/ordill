import { h, Fragment } from "preact";
import { WordleState } from "./wordleState";

export interface EndFooterProps {
    wordle: WordleState;
    onPlayAgain?: () => void;
    onCopyResults?: () => void;
    onShowStats?: () => void;
}

const isPlural = (n: number): boolean => {
    const endsInEleven = n % 100 === 11;
    const endsInOne = n % 10 === 1;
    return !endsInOne || endsInEleven;
};

export default function EndFooter({
    wordle,
    onPlayAgain,
    onCopyResults,
    onShowStats,
}: EndFooterProps) {
    const { gameState, guessedWords, secretWord, dailyNumber } = wordle;
    const state = gameState.name;
    const guesses = guessedWords.length;
    const isDaily = dailyNumber != null;

    let message;
    if (state === "won") {
        message = `Þér tókst það í ${guesses} tilraun${
            isPlural(guesses) ? "um" : ""
        }!`;
    } else if (state === "resigned") {
        message = `Þú gafst upp eftir ${guesses} tilraun${
            isPlural(guesses) ? "ir" : ""
        }!`;
    } else {
        message = `Orðið var ${secretWord.toUpperCase()}.`;
    }

    let showStatsButton = undefined;
    if (isDaily) {
        showStatsButton = (
            <button class="end-footer-button show-stats" onClick={onShowStats}>
                Sýna Tölfræði
            </button>
        );
    }

    return (
        <div class="end-footer">
            <div class="end-footer-message">{message}</div>
            <button class="end-footer-button play-again" onClick={onPlayAgain}>
                {isDaily ? "Spila Frjálst" : "Spila Aftur"}
            </button>
            {showStatsButton}
            <button
                class="end-footer-button copy-results"
                onClick={onCopyResults}
            >
                Deila
            </button>
        </div>
    );
}
