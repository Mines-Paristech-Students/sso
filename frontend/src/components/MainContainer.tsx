import React, {useState} from 'react';
import Image from "react-bootstrap/Image";
import logoMines from "../static/logo_mines.png";
import FormAlert, {FormErrorCode} from "./FormAlert";

type Props = {
    heading?: any,
    children?: any,
};


export default function MainContainer(props: Props) {
    /**
     * Displays a heading, a content and an alert bar for displaying errors.
     * Provides an endpoint to the content, as well as functions to set and clear errors.
     */

    const [errorCode, setErrorCode] = useState<null | FormErrorCode>(null);
    const [errorDetails, setErrorDetails] = useState<null | string>(null);

    function clearError() {
        setErrorCode(null);
        setErrorDetails(null);
    }

    function setError(errorCode: null | FormErrorCode, errorDetails: null | string) {
        setErrorCode(errorCode);
        setErrorDetails(errorDetails);
    }

    return (
        <div className="MainContainer">
            {
                props.heading &&
                <header>
                    <Image src={logoMines} alt="Logo des Mines" rounded className="logoMines"/>
                    <h1>{props.heading}</h1>
                </header>
            }

            <div className="content">
                {
                        props.children(setError, clearError)
                }
            </div>

            {
                errorCode &&
                <FormAlert errorCode={errorCode}
                           errorDetails={errorDetails}
                           clearError={clearError}/>
            }
        </div>
    )
}
