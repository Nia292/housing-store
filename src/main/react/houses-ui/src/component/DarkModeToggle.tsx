import {useContext, useEffect, useState} from "react";
import {PrimeReactContext} from "primereact/api";
import {ToggleButton} from "primereact/togglebutton";

export function DarkModeToggle() {
    const [darkMode, setDarkMode] = useState<boolean>(window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
    const {changeTheme} = useContext(PrimeReactContext);

    useEffect(() => {
        const theme = darkMode ? "lara-light-indigo" : "lara-dark-indigo";
        const previousTheme = darkMode ? "lara-dark-indigo" : "lara-light-indigo";
        if (changeTheme) {
            changeTheme(previousTheme, theme, "theme-link", () => console.log('Done!'));
        }
    }, [darkMode]);

    return (<ToggleButton onIcon="pi pi-moon" offIcon="pi pi-sun"
                          offLabel="Not Luna Mode"
                          onLabel="Luna Mode"
                          checked={darkMode} onChange={(e) => setDarkMode(e.value)}/>)
}