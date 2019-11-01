import React from 'react';

import {ErrorCode} from './LoginForm'
import Alert from "react-bootstrap/Alert";

type Props = {
    error: null | ErrorCode,
    clearAlert: () => void
};

export default function LoginFormAlert(props: Props) {
    function getAlertContent() {
        switch (props.error) {
            case ErrorCode.BAD_CREDENTIALS:
                return "Identifiants incorrects.";
            case ErrorCode.UNAUTHORIZED_AUDIENCE:
                return "Vous ne pouvez pas accéder à ce site.";
            case ErrorCode.INVALID_AUDIENCE:
                return "Ce site ne peut pas se connecter via ce serveur.";
            default:
                return "Erreur non définie. Veuillez contacter un(e) administrateur(trice)."
        }
    }

    if (props.error === null) {
        return <></>
    } else {
        return (
            <Alert variant="danger"
                   onClose={props.clearAlert}
                   dismissible
                   className="LoginFormAlert">
                {getAlertContent()}
            </Alert>
        );
    }
}
