import { h, Fragment, Component } from "preact";

export interface SwitchProps {
    value: boolean;
    disabled?: boolean;
    onChange?: (newValue: boolean) => void;
}

export default class Switch extends Component<SwitchProps> {
    onTrue = () => {
        this.props.onChange?.(true);
    };

    onFalse = () => {
        this.props.onChange?.(false);
    };

    render({ value, disabled }: SwitchProps) {
        let trueButtonClass = "switch-button true";
        let falseButtonClass = "switch-button false";

        if (disabled) {
            trueButtonClass += " fake-disable";
            falseButtonClass += " fake-disable";
        }

        if (value) {
            trueButtonClass += " active";
        } else {
            falseButtonClass += " active";
        }

        return (
            <div class="switch">
                <button class={falseButtonClass} onClick={this.onFalse}>
                    X
                </button>
                <button class={trueButtonClass} onClick={this.onTrue}>
                    {"\u{2713}"}
                </button>
            </div>
        );
    }
}
