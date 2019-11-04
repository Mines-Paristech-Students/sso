import React from 'react';

import {LoginErrorCode} from './Login'
import Alert from "react-bootstrap/Alert";
import {RequestPasswordRecoveryErrorCode} from "./RequestPasswordRecovery";
import {ResetPasswordErrorCode} from "./ResetPassword";
import {Link} from "react-router-dom";
import {ChangePasswordErrorCode} from "./ChangePassword";

type Props = {
    loginError?: LoginErrorCode,
    requestPasswordRecoveryError?: RequestPasswordRecoveryErrorCode,
    setPasswordError?: ResetPasswordErrorCode,
    changePasswordError?: ChangePasswordErrorCode,
    clearAlert: () => void
};

export default function FormAlert(props: Props) {
    const UNKNOWN_ERROR = "Erreur non définie. Contacte un(e) administrateur(trice).";

    function getAlertContent() {
        if (props.loginError) {
            switch (props.loginError) {
                case LoginErrorCode.INVALID_CREDENTIALS:
                    return "Identifiants incorrects.";
                case LoginErrorCode.INVALID_AUDIENCE:
                    return "Tu ne peux pas accéder à ce site.";
                default:
                    return UNKNOWN_ERROR;
            }
        } else if (props.requestPasswordRecoveryError) {
            switch (props.requestPasswordRecoveryError) {
                case RequestPasswordRecoveryErrorCode.INVALID_EMAIL:
                    return "Adresse mail inconnue.";
                default:
                    return UNKNOWN_ERROR;
            }
        } else if (props.setPasswordError) {
            switch (props.setPasswordError) {
                case ResetPasswordErrorCode.WEAK_PASSWORD:
                    return <>Ce mot de passe est tout pourri, choisis-en un autre ! <span role="img"
                                                                                          aria-label="émoticônes en colère">😡😡😡</span></>;
                case ResetPasswordErrorCode.INVALID_TOKEN:
                    return <>Ton lien a expiré. <Link to="/mot-de-passe/oubli/">Demandes-en un autre.</Link></>;
                default:
                    return UNKNOWN_ERROR;
            }
        } else if (props.changePasswordError) {
            switch (props.changePasswordError) {
                case ChangePasswordErrorCode.WEAK_PASSWORD:
                    return <>Ce mot de passe est tout pourri, choisis-en un autre ! <span role="img"
                                                                                          aria-label="émoticônes en colère">😡😡😡</span></>;
                case ChangePasswordErrorCode.INVALID_CREDENTIALS:
                    return "Identifiants incorrects";
                default:
                    return UNKNOWN_ERROR;
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
