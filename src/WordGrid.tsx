import { h, Fragment } from "preact";

export type LetterState = "entry" | "incorrect" | "correct" | "partial";

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
            const state = letter?.state ?? "entry";

            cells.push(<div class={`word-grid-cell ${state}`}>{char}</div>);
        }
        rows.push(<div class="word-grid-row">{cells}</div>);
    }

    return (<div class="word-grid">{rows}</div>);
}
