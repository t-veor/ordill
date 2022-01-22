import { h, Fragment } from "preact";
import { useEffect, useRef } from "preact/hooks";

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
    minRows?: number
}

const makeCell = (letter?: Letter) => {
    const char = letter?.letter ?? "";
    const state = LETTER_STATE_MAP[letter?.state ?? 0];

    let cellClass = `word-grid-cell ${state}`;
    if (letter?.resigning) {
        cellClass = `word-grid-cell resigning`;
    }

    if (state === "entry" && char !== "") {
        cellClass += " filled";
    }

    return (<div class={cellClass}>{char}</div>)
};

export default function WordGrid({ words }: WordGridProps) {
    const lastRow = useRef<HTMLDivElement>(null);
    useEffect(
        () => lastRow.current?.scrollIntoView({ behavior: "smooth" }),
        [words],
    );

    const rows = words.map((word, i) => {
        const cells = [];
        for (let j = 0; j < 5; j++) {
            cells.push(makeCell(word[j]));
        }
        const ref = i === words.length - 1 ? lastRow : undefined;
        return (<div class="word-grid-row" ref={ref}>{cells}</div>);
    });

    return (
        <div class="word-grid">
            <div class="word-grid-inner">
                {rows}
            </div>
        </div>
    );
}
