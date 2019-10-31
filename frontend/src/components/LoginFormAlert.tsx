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
            default:
                return "Erreur "
        }
    }

    if (props.error === null) {
        return <></>
    } else {
        return (
            <Alert variant="warning"
                   onClose={props.clearAlert}
                   dismissible>
                {getAlertContent()}
            </Alert>
        );
    }
}
