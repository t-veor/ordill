import { h, Fragment } from "preact";
import Tab from "./Tab";

export interface InstructionsTabProps {
    open: boolean,
    onClose?: () => void,
}

export default function InstructionsTab(props: InstructionsTabProps) {
    return (
        <Tab name="Leiðbeiningar" {...props}>
            <p>
                Giskaðu á <b>ORÐILIN</b> í sex eða færri tilraunum.
            </p>
            <p>
                Hver tilraun verður að vera gilt orð á íslensku með 5 bókstöfum.
            </p>
            <p>
                Eftir hverja tilraun breyta bókstafirnir um lit til að sýna
                hversu nálægt þú varst.
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
            <hr />
            <p>
                Allir fá sama orðið og bara sex tilraunir í „Daglegum" ham, og
                það er eingöngu eitt orð á dag.
            </p>
            <p>
                Ef þú vilt spila meira, geturðu skipt yfir í „Frjálsan" ham til
                að fá handahófskennt orð og ótakmarkaðar tilraunir.
            </p>
            <p>
                Það er hægt að skipta á milli leiktegunda í valmyndinni.
            </p>
            <hr />
            <p>
                Þetta er íslensk útgáfa af hinu frábæra{" "}
                <a target="_blank" href="https://www.powerlanguage.co.uk/wordle/">Wordle</a>.
            </p>
            <p>
                Source kóðann má finna á{" "}
                <a target="_blank" href="https://github.com/t-veor/ordill">Github</a>.
            </p>
        </Tab>
    );
}
