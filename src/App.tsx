import { h, Fragment } from "preact";
import Header from "./Header";
import Wordle from "./Wordle";

export default function App() {
    return (
        <div class="main-container">
            <Header />
            <hr />
            <Wordle />
        </div>
    );
}
