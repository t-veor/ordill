import { h, Fragment } from "preact";

export interface InstructionsProps {
    open: boolean,
    onClose?: () => void,
}

export default function Instructions({ open, onClose }: InstructionsProps) {
    let instructionsClass = "instructions";
    if (!open) {
        instructionsClass += " closed";
    }

    return (
        <div class={instructionsClass}>
            <div class="instructions-contents">
                <div class="header">
                    <h2 class="title">Leiðbeiningar</h2>
                    <button class="instructions-button" onClick={onClose}>X</button>
                </div>
                <hr />
                <div class="instructions-body">
                    <p>
                        This is an Icelandic version of the excellent{" "}
                        <a target="_blank" href="https://www.powerlanguage.co.uk/wordle/">Wordle</a>.
                        You can find the source code on{" "}
                        <a target="_blank" href="https://github.com/t-veor/ordill">Github</a>.
                    </p>
                    <p>
                        Þetta er íslensk útgáfa af hinu frábæru{" "}
                        <a target="_blank" href="https://www.powerlanguage.co.uk/wordle/">Wordle</a>.
                        Source kóðann má finna á{" "}
                        <a target="_blank" href="https://github.com/t-veor/ordill">Github</a>.
                    </p>
                    <hr />
                    <p>
                        Giskaðu á <b>ORÐILIN</b> í eins fáum tilraunum og þú
                        getur. Fjöldi tilrauna er ótakmarkaður.
                    </p>
                    <p>
                        Hver tilraun verður að vera gilt orð á íslensku með 5
                        bókstöfum.
                    </p>
                    <p>
                        Eftir hverja tilraun breyta bókstafirnir um lit til að
                        sýna hversu nálægt þú varst.
                    </p>
                    <hr />
                    <p><b>Dæmi</b>:</p>
                    <div class="word-grid-row example">
                        <div class="word-grid-cell correct">l</div>
                        <div class="word-grid-cell entry">ú</div>
                        <div class="word-grid-cell entry">i</div>
                        <div class="word-grid-cell entry">n</div>
                        <div class="word-grid-cell entry">n</div>
                    </div>
                    <p>Bókstafurinn <b>L</b> er í orðinu og á réttum stað.</p>
                    <div class="word-grid-row example">
                        <div class="word-grid-cell entry">t</div>
                        <div class="word-grid-cell partial">ö</div>
                        <div class="word-grid-cell entry">f</div>
                        <div class="word-grid-cell entry">l</div>
                        <div class="word-grid-cell entry">u</div>
                    </div>
                    <p>Bókstafurinn <b>Ö</b> er í orðinu en ekki á réttum stað.</p>
                    <div class="word-grid-row example">
                        <div class="word-grid-cell entry">ó</div>
                        <div class="word-grid-cell entry">s</div>
                        <div class="word-grid-cell entry">k</div>
                        <div class="word-grid-cell incorrect">ý</div>
                        <div class="word-grid-cell entry">r</div>
                    </div>
                    <p>Bókstafurinn <b>Ý</b> er ekki í orðinu á neinum stað.</p>
                </div>
            </div>
        </div>
    );
}
