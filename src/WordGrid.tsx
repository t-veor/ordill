import { h, Fragment } from "preact";

export type LetterState = 0 | 1 | 2 | 3;
export const LETTER_STATE_MAP: Record<LetterState, string> = {
    [0]: "entry",
    [1]: "incorrect",
    [2]: "partial",
    [3]: "correct",
};

export interface Letter {
    letter: string,
    state: LetterState,
}

export interface WordGridProps {
    words: Array<Array<Letter>>,
}

export default function WordGrid({ words }: WordGridProps) {
    const rows = [];
    for (const word of words) {
        const cells = [];
        for (let i = 0; i < 5; i++) {
            const letter = word[i];
            const char = letter?.letter ?? "";
            const state = LETTER_STATE_MAP[letter?.state ?? 0];

            cells.push(<div class={`word-grid-cell ${state}`}>{char}</div>);
        }
        rows.push(<div class="word-grid-row">{cells}</div>);
    }

    return (<div class="word-grid">{rows}</div>);
}
