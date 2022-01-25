import { h, Fragment } from "preact";
import { useEffect, useState } from "preact/hooks";

export type Language = "is" | "en";
let listeners: Array<(language: Language) => void> = [];
let lastLanguage: Language = "is";
const subscribe = (cb: (language: Language) => void) => {
    listeners.push(cb);
};
const unsubscribe = (cb: (language: Language) => void) => {
    listeners = listeners.filter((i) => i !== cb);
};

const setInstructionsLanguage = (language: Language) => {
    if (language !== lastLanguage) {
        lastLanguage = language;
        for (const cb of listeners) {
            cb(language);
        }
    }
};

export const useInstructionsLanguage = (): [
    Language,
    (language: Language) => void
] => {
    const [language, setLanguage] = useState<Language>(lastLanguage);
    useEffect(() => {
        subscribe(setLanguage);
        return () => unsubscribe(setLanguage);
    }, []);

    return [language, setInstructionsLanguage];
};

export function ToggleLanguagesButton({ classNames }: { classNames: string }) {
    const [language, setLanguage] = useInstructionsLanguage();
    const text =
        language === "is" ? "\u{1f1ec}\u{1f1e7}" : "\u{1f1ee}\u{1f1f8}";
    const onClick = () => {
        setLanguage(language === "is" ? "en" : "is");
    };

    return (
        <button class={classNames} onClick={onClick}>
            {text}
        </button>
    );
}

export default function Instructions() {
    const [language, _] = useInstructionsLanguage();

    if (language === "is") {
        return (
            <>
                <p>
                    Giskaðu á <b>ORÐILIN</b> í 6 eða færri tilraunum.
                </p>
                <p>
                    Hver tilraun verður að vera gilt orð á íslensku með 5
                    bókstöfum.
                </p>
                <p>
                    Eftir hverja tilraun breyta bókstafirnir um lit til að sýna
                    hversu nálægt þú varst.
                </p>
                <hr />
                <p>
                    <b>Dæmi</b>:
                </p>
                <div class="word-grid-row example">
                    <div class="word-grid-cell correct">l</div>
                    <div class="word-grid-cell entry">ú</div>
                    <div class="word-grid-cell entry">i</div>
                    <div class="word-grid-cell entry">n</div>
                    <div class="word-grid-cell entry">n</div>
                </div>
                <p>
                    Bókstafurinn <b>L</b> er í orðinu og á réttum stað.
                </p>
                <div class="word-grid-row example">
                    <div class="word-grid-cell entry">t</div>
                    <div class="word-grid-cell partial">ö</div>
                    <div class="word-grid-cell entry">f</div>
                    <div class="word-grid-cell entry">l</div>
                    <div class="word-grid-cell entry">u</div>
                </div>
                <p>
                    Bókstafurinn <b>Ö</b> er í orðinu en ekki á réttum stað.
                </p>
                <div class="word-grid-row example">
                    <div class="word-grid-cell entry">ó</div>
                    <div class="word-grid-cell entry">s</div>
                    <div class="word-grid-cell entry">k</div>
                    <div class="word-grid-cell incorrect">ý</div>
                    <div class="word-grid-cell entry">r</div>
                </div>
                <p>
                    Bókstafurinn <b>Ý</b> er ekki í orðinu á neinum stað.
                </p>
                <hr />
                <p>
                    Í „Daglegum" ham fá allir sama orðið, bara 6 tilraunir og
                    það er eingöngu eitt orð á dag.
                </p>
                <p>
                    Skiptu yfir í „Frjálsan" ham ef þú vilt spila meira. Í honum
                    færðu handahófskennd orð og ótakmarkaðar tilraunir.
                </p>
                <p>Það er hægt að skipta á milli leiktegunda í valmyndinni.</p>
                <hr />
                <p>
                    Þetta er íslensk útgáfa af hinu frábæra{" "}
                    <a
                        href="https://www.powerlanguage.co.uk/wordle/"
                        target="_blank"
                        rel="noreferrer"
                    >
                        Wordle
                    </a>
                    .
                </p>
                <p>
                    Source kóðann má finna á{" "}
                    <a
                        href="https://github.com/t-veor/ordill"
                        target="_blank"
                        rel="noreferrer"
                    >
                        Github
                    </a>
                    .
                </p>
            </>
        );
    } else {
        return (
            <>
                <p>
                    Guess the <b>ORÐILL</b> in 6 or fewer tries.
                </p>
                <p>
                    Each attempt must be a valid word in Icelandic with 5
                    letters.
                </p>
                <p>
                    After each attempt, the letters change colour to show how
                    close you were.
                </p>
                <hr />
                <p>
                    <b>Examples</b>:
                </p>
                <div class="word-grid-row example">
                    <div class="word-grid-cell correct">l</div>
                    <div class="word-grid-cell entry">ú</div>
                    <div class="word-grid-cell entry">i</div>
                    <div class="word-grid-cell entry">n</div>
                    <div class="word-grid-cell entry">n</div>
                </div>
                <p>
                    The letter <b>L</b> is in the word and in the correct spot.
                </p>
                <div class="word-grid-row example">
                    <div class="word-grid-cell entry">t</div>
                    <div class="word-grid-cell partial">ö</div>
                    <div class="word-grid-cell entry">f</div>
                    <div class="word-grid-cell entry">l</div>
                    <div class="word-grid-cell entry">u</div>
                </div>
                <p>
                    The letter <b>Ö</b> is in the word but in the wrong spot.
                </p>
                <div class="word-grid-row example">
                    <div class="word-grid-cell entry">ó</div>
                    <div class="word-grid-cell entry">s</div>
                    <div class="word-grid-cell entry">k</div>
                    <div class="word-grid-cell incorrect">ý</div>
                    <div class="word-grid-cell entry">r</div>
                </div>
                <p>
                    The letter <b>Ý</b> is not in the word in any spot.
                </p>
                <hr />
                <p>
                    In "Daily" mode („Daglegt") everyone gets the same word,
                    only 6 tries, and there is only one word per day.
                </p>
                <p>
                    Switch to "Freeplay" mode („Frjálst") if you want to play
                    more. In this mode you get random words and unlimited tries.
                </p>
                <p>You can switch between the game modes in the menu.</p>
                <hr />
                <p>
                    This is an Icelandic version of the excellent{" "}
                    <a
                        href="https://www.powerlanguage.co.uk/wordle/"
                        target="_blank"
                        rel="noreferrer"
                    >
                        Wordle
                    </a>
                    .
                </p>
                <p>
                    The source code can be found on{" "}
                    <a
                        href="https://github.com/t-veor/ordill"
                        target="_blank"
                        rel="noreferrer"
                    >
                        Github
                    </a>
                    .
                </p>
            </>
        );
    }
}
