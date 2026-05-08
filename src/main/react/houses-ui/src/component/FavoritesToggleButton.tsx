import {ToggleButton, type ToggleButtonChangeEvent} from "primereact/togglebutton";
import {useRef, useState} from "react";
import {OverlayPanel} from "primereact/overlaypanel";
import {InputText} from "primereact/inputtext";
import * as React from "react";
import {Button} from "primereact/button";

export interface FavoritesToggleButtonProps {
    favoritesPending: boolean;
    isFavorite: boolean;

    onFavoritesToggle(isFavorite: boolean, text: string): void;
}

export function FavoritesToggleButton(props: FavoritesToggleButtonProps) {
    const overlayPanel = useRef<OverlayPanel>(null);
    const input = useRef<HTMLInputElement>(null);

    const [favoriteText, setFavoriteText] = useState('');

    function onToggleChange(e: ToggleButtonChangeEvent): void {
        if (e.value) {
            overlayPanel.current?.toggle(e.originalEvent, null);
            setTimeout(() => input.current?.focus(), 50);
        } else {
            props.onFavoritesToggle(false, "");
        }
    }

    function onConfirmFavorites(event: React.KeyboardEvent<HTMLInputElement>) {
        if (event.key === 'Enter') {
            saveFavorite(event);
        }
    }

    function saveFavorite(event: React.SyntheticEvent): void {
        props.onFavoritesToggle(true, favoriteText);
        overlayPanel?.current?.toggle(event, null)
    }

    return <>
        <ToggleButton
            disabled={props.favoritesPending}
            checked={props.isFavorite}
            onChange={onToggleChange}
            onLabel=""
            offLabel=""
            onIcon="pi pi-heart"
            offIcon="pi pi-heart"
        />
        <OverlayPanel ref={overlayPanel} >
            <p>
                You can add a comment for your favorite here. Press enter to confirm, press escape to cancel adding as favorite
            </p>
            <div className="flex flex-row">
                <InputText style={{width: "100%"}}
                           value={favoriteText}
                           onChange={event => setFavoriteText(event.target.value)}
                           onKeyDown={onConfirmFavorites}
                           ref={input}
                           placeholder="Favorite comment"/>
                <Button icon="pi pi-check" onClick={event => saveFavorite(event)} />
            </div>
        </OverlayPanel>
    </>
}