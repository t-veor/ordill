import { h, Fragment } from "preact";
import Instructions, {
    ToggleLanguagesButton,
    useInstructionsLanguage,
} from "./Instructions";
import Tab from "./Tab";

export interface InstructionsTabProps {
    open: boolean;
    onClose?: () => void;
}

export default function InstructionsTab(props: InstructionsTabProps) {
    const [language, setLanguage] = useInstructionsLanguage();
    const name = language === "is" ? "Leiðbeiningar" : "Instructions";

    return (
        <Tab
            name={name}
            headerComponents={<ToggleLanguagesButton classNames="tab-button" />}
            {...props}
        >
            <Instructions />
        </Tab>
    );
}
