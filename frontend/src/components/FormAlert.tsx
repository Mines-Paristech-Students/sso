import React from 'react';

import {LoginErrorCode} from './Login'
import Alert from "react-bootstrap/Alert";
import {RequestPasswordRecoveryErrorCode} from "./RequestPasswordRecovery";
import {SetPasswordErrorCode} from "./SetPassword";
import {Link} from "react-router-dom";

type Props = {
    loginError?: LoginErrorCode,
    requestPasswordRecoveryError?: RequestPasswordRecoveryErrorCode,
    setPasswordError?: SetPasswordErrorCode,
    clearAlert: () => void
};

export default function FormAlert(props: Props) {
    function getAlertContent() {
        if (props.loginError) {
            switch (props.loginError) {
                case LoginErrorCode.BAD_CREDENTIALS:
                    return "Identifiants incorrects.";
                case LoginErrorCode.UNAUTHORIZED_AUDIENCE:
                    return "Tu ne peux pas accéder à ce site.";
                case LoginErrorCode.INVALID_AUDIENCE:
                    return "Ce site ne peut pas se connecter via ce serveur.";
                default:
                    return "Erreur non définie. Contacte un(e) administrateur(trice)."
            }
        } else if (props.requestPasswordRecoveryError) {
            switch (props.requestPasswordRecoveryError) {
                case RequestPasswordRecoveryErrorCode.INVALID_EMAIL:
                    return "Adresse mail inconnue.";
                default:
                    return "Erreur non définie. Contacte un(e) administrateur(trice)."
            }
        } else if (props.setPasswordError) {
            switch (props.setPasswordError) {
                case SetPasswordErrorCode.WEAK_PASSWORD:
                    return <>Ce mot de passe est tout pourri, choisis-en un autre ! <span role="img"
                                                                                          aria-label="émoticônes en colère">😡😡😡</span></>;
                case SetPasswordErrorCode.INVALID_TOKEN:
                    return <>Ton lien a expiré. <Link to="/mot-de-passe/oubli/">Demandes-en un autre.</Link></>;
                case SetPasswordErrorCode.TOKEN_EXPIRED:
                    return <>Ton lien a expiré. <Link to="/mot-de-passe/oubli/">Demandes-en un autre.</Link></>;
                default:
                    return "Erreur non définie. Contacte un(e) administrateur(trice)."
            }
        }

        return null
    }

    const content = getAlertContent();

    if (content) {
        return (
            <Alert variant="danger"
                   onClose={props.clearAlert}
                   dismissible
                   className="FormAlert">
                {getAlertContent()}
            </Alert>
        );
    }

    return <></>
}
