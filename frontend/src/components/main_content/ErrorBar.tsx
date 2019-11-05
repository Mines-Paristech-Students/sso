import React from 'react';

import Alert from "react-bootstrap/Alert";
import {Link} from "react-router-dom";

export enum FormErrorCode {
    INVALID_AUDIENCE = "INVALID_AUDIENCE",
    INVALID_CREDENTIALS = "INVALID_CREDENTIALS",
    INVALID_EMAIL = "INVALID_EMAIL",
    INVALID_TOKEN = "INVALID_TOKEN",
    WEAK_PASSWORD = "WEAK_PASSWORD",
    UNKNOWN_ERROR = "UNKNOWN_ERROR",
}

type Props = {
    errorCode: null | FormErrorCode,
    errorDetails: null | string
    clearError: () => void
};

export default function ErrorBar(props: Props) {
    function getAlertContent() {
        switch (props.errorCode) {
            case FormErrorCode.INVALID_AUDIENCE:
                return "Tu ne peux pas accéder à ce site.";
            case FormErrorCode.INVALID_CREDENTIALS:
                return "Identifiants incorrects.";
            case FormErrorCode.INVALID_EMAIL:
                return "Adresse mail inconnue.";
            case FormErrorCode.INVALID_TOKEN:
                return <>Ton lien a expiré. <Link to="/mot-de-passe/oubli/">Demandes-en un autre.</Link></>;
            case FormErrorCode.WEAK_PASSWORD:
                return <>Ce mot de passe est tout pourri, choisis-en un autre ! <span role="img"
                                                                                      aria-label="émoticônes en colère">😡😡😡</span></>;
            case FormErrorCode.UNKNOWN_ERROR:
            default:
                return "Erreur imprévue. Merci de contacter un(e) administrateur(trice).\nDétails :\n" + props.errorDetails;
        }
    }

    if (props.errorCode) {
        return (
            <Alert variant="danger"
                   onClose={props.clearError}
                   dismissible
                   className="FormAlert">
                {getAlertContent()}
            </Alert>
        );
    }

    return <></>
}
