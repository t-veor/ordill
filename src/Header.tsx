import { h, Fragment, Component } from "preact";
import InstructionsTab from "./InstructionsTab";
import SettingsTab from "./SettingsTab";

export type TabState = "settings" | "instructions" | null;

interface HeaderState {
    tab: TabState;
}

export default class Header extends Component<{}, HeaderState> {
    state: HeaderState = {
        tab: null,
    };

    setTab = (tab: TabState) => this.setState({ tab });
    openSettings = () => this.setTab("settings");
    openInstructions = () => this.setTab("instructions");
    closeTab = () => this.setTab(null);

    render(_: {}, { tab }: HeaderState) {
        return (
            <div class="header">
                <button class="tab-button" onClick={this.openSettings}>
                    {"\u{2630}"}
                </button>
                <h1 class="title">Orðill</h1>
                <button class="tab-button" onClick={this.openInstructions}>
                    ?
                </button>
                <SettingsTab open={tab === "settings"} setTab={this.setTab} />
                <InstructionsTab
                    open={tab === "instructions"}
                    onClose={this.closeTab}
                />
            </div>
        );
    }
}
