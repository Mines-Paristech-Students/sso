import React from 'react';
import Image from "react-bootstrap/Image";
import logoMines from "../static/logo_mines.png";

type Props = {
    heading?: any,
};

export default function Heading(props: Props) {
    return (
        <header>
            <Image src={logoMines} alt="Logo des Mines" rounded className="logoMines"/>
            {
                props.heading && <h1>{props.heading}</h1>
            }
        </header>
    );
}
