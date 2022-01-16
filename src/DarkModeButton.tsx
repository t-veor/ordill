import { h, Component } from "preact";

interface DarkModeButtonState {
    dark: boolean,
}

export default class DarkModeButton extends Component<{}, DarkModeButtonState> {
    state: DarkModeButtonState = {
        dark: true,
    }

    onClick = () => {
        const newState = !this.state.dark;
        this.setDarkMode(newState);
    }

    setDarkMode(dark: boolean) {
        this.setState({ dark }, () => {
            try {
                if (dark) {
                    document.body.classList.add("dark");
                } else {
                    document.body.classList.remove("dark");
                }
                localStorage.setItem("darkMode", `${dark}`);
            } catch (err) {
                console.log(err);
            }
        });
    }

    componentDidMount() {
        let dark = false;
        try {
            dark = localStorage.getItem("darkMode") === "true";
        } catch (err) {
            console.log(err);
        }

        this.setState({ dark }, () => {
            if (dark) {
                document.body.classList.add("dark");
            } else {
                document.body.classList.remove("dark");
            }
        });
    }

    render(_: {}, { dark }: DarkModeButtonState) {
        return (
            <button class="dark-mode-button" onClick={this.onClick}>
                {dark ? "\u{2600}\u{fe0f}" : "\u{1f319}"}
            </button>
        );
    }
}
