import { h, Fragment, Component, Attributes, ComponentChild, ComponentChildren, Ref, RenderableProps } from "preact";
import { LetterState, LETTER_STATE_MAP } from "./WordGrid";

const KEYBOARD_ROWS = [
    ["Enter", "á", "é", "í", "ó", "ú", "ý", "ö"],
    ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p", "ð"],
    ["a", "s", "d", "f", "g", "h", "j", "k", "l", "æ"],
    ["GiveUp", "z", "x", "c", "v", "b", "n", "m", "þ", "Backspace"],
];

const BLANKED_KEYS = ["c", "q", "w", "z"];

export interface KeyboardProps {
    letterStates: Record<string, LetterState | undefined>,
    wordIsValid: boolean,
    isDaily: boolean,
    onKeyDown?: (key: string) => void;
}

export default class Keyboard extends Component<KeyboardProps> {
    onClick = (event: MouseEvent) => {
        const key = (event.target as HTMLElement).dataset.key;
        if (key) {
            this.props.onKeyDown?.(key);
        }
    };

    render({ letterStates, wordIsValid, isDaily }: RenderableProps<KeyboardProps>) {
        const rows = KEYBOARD_ROWS.map((row, rowIndex) => {
            const keys = row.map(key => {
                let buttonClass = "keyboard-button";
                let contents;
                let disabled = BLANKED_KEYS.includes(key);

                if (key === "Enter") {
                    buttonClass += " enter";
                    contents = "Giska";
                    if (!wordIsValid) {
                        buttonClass += " entry fake-disable";
                    } else {
                        buttonClass += " correct";
                    }
                } else if (key === "GiveUp") {
                    buttonClass += " give-up";
                    contents = "Gefast Upp";
                    disabled = isDaily;
                } else {
                    if (key === "Backspace") {
                        buttonClass += " backspace";
                        contents = "\u{232b}";
                    } else {
                        buttonClass += " letter";
                        contents = key;
                    }

                    const state = LETTER_STATE_MAP[letterStates[key] ?? 0];
                    buttonClass += " " + state;
                }

                return (
                    <button
                        key={key}
                        data-key={key}
                        class={buttonClass}
                        onClick={this.onClick}
                        disabled={disabled}
                    >
                        {contents}
                    </button>
                );
            });

            return (<div class="keyboard-row" key={rowIndex}>{keys}</div>);
        });

        return (<div class="keyboard">{rows}</div>);
    }
}
