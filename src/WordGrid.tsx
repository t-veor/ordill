import { h, Fragment } from "preact";

export const enum LetterState {
    Entry,
    Incorrect,
    Partial,
    Correct,
};
export const LETTER_STATE_MAP: Record<LetterState, string> = {
    [LetterState.Entry]: "entry",
    [LetterState.Incorrect]: "incorrect",
    [LetterState.Partial]: "partial",
    [LetterState.Correct]: "correct",
};

export interface Letter {
    letter: string,
    state: LetterState,
    resigning?: boolean,
}

export interface WordGridProps {
    words: Array<Array<Letter>>,
}

export default function WordGrid({ words }: WordGridProps) {
    const rows = words.map(word => {
        const cells = [];

        for (let i = 0; i < 5; i++) {
            const letter = word[i];
            const char = letter?.letter ?? "";
            const state = LETTER_STATE_MAP[letter?.state ?? 0];

            let cellClass = `word-grid-cell ${state}`;
            if (letter?.resigning) {
                cellClass = `word-grid-cell resigning`;
            }

            if (state === "entry" && char !== "") {
                cellClass += " filled";
            }

            cells.push(<div class={cellClass}>{char}</div>);
        }

        return (<div class="word-grid-row">{cells}</div>);
    });

    return (<div class="word-grid">{rows}</div>);
}
