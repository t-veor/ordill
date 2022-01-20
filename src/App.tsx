import { h, Fragment } from "preact";
import Header from "./Header";
import { Toaster } from "./Toaster";
import Wordle from "./Wordle";

export default function App() {
    return (
        <div class="main-container">
            <Header />
            <hr />
            <Wordle />
            <Toaster />
        </div>
    );
}
