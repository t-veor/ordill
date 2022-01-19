import { h, Fragment, Component } from "preact";
import InstructionsTab from "./InstructionsTab";
import SettingsTab from "./SettingsTab";

type TabState = "settings" | "instructions" | null;

interface HeaderState {
    tab: TabState,
}

export default class Header extends Component<{}, HeaderState> {
    state: HeaderState = {
        tab: null,
    }

    openSettings = () => {
        this.setState({ tab: "settings" });
    }

    openInstructions = () => {
        this.setState({ tab: "instructions" });
    }

    closeTab = () => {
        this.setState({ tab: null });
    }

    render(_: {}, { tab }: HeaderState) {
        return (
            <div class="header">
                <h1 class="title">Orðill</h1>
                <button
                    class="tab-button"
                    onClick={this.openSettings}
                >
                    {"\u{2699}\u{fe0f}"}
                </button>
                <button
                    class="tab-button"
                    onClick={this.openInstructions}
                >
                    ?
                </button>
                <SettingsTab
                    open={tab === "settings"}
                    onClose={this.closeTab}
                />
                <InstructionsTab
                    open={tab === "instructions"}
                    onClose={this.closeTab}
                />
            </div>
        );
    }
}
