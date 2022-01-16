import { h, Fragment, Component } from "preact";
import Instructions from "./Instructions";

interface HeaderState {
    instructionsOpen: boolean,
}

export default class Header extends Component<{}, HeaderState> {
    state: HeaderState = {
        instructionsOpen: false,
    }

    openInstructions = () => {
        this.setState({ instructionsOpen: true });
    }

    closeInstructions = () => {
        this.setState({ instructionsOpen: false });
    }

    render() {
        return (
            <div class="header">
                <h1 class="title">Orðill</h1>
                <button
                    class="instructions-button"
                    onClick={this.openInstructions}
                >
                    ?
                </button>
                <Instructions
                    open={this.state.instructionsOpen}
                    onClose={this.closeInstructions}
                />
            </div>
        );
    }
}
