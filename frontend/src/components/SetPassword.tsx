import axios from 'axios';
import React, {FormEvent, useState} from 'react';
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Col from "react-bootstrap/Col";
import InputGroup from "react-bootstrap/InputGroup";

import MainContainer from "./MainContainer";
import {useParams} from "react-router";
import FormAlert from "./FormAlert";

export enum SetPasswordErrorCode {
    WEAK_PASSWORD = "WEAK_PASSWORD",
    INVALID_TOKEN = "INVALID_TOKEN",
    TOKEN_EXPIRED = "TOKEN_EXPIRED",
    UNKNOWN_ERROR = "UNKNOWN_ERROR",
}

type Props = {
    endpoint: string,
};

export default function SetPassword(props: Props) {
    // The token GET parameter.
    let {token} = useParams();

    // The alert message at the bottom.
    const [alertErrorCode, setAlertErrorCode] = useState<null | SetPasswordErrorCode>(null);

    function clearAlert() {
        setAlertErrorCode(null);
    }

    // The form states.
    const [password, setPassword] = useState<string>("");

    // True iff the backend indicated that the password was successfully changed.
    const [passwordChanged, setPasswordChanged] = useState<boolean>(false);

    function handleChange(event: FormEvent<any>) {
        const target = event.target as HTMLInputElement;
        const value = target.value;

        if (target.name === "password") {
            setPassword(value);
        }

        // Remove the alert.
        clearAlert();
    }

    function handleSubmit(event: FormEvent<any>) {
        event.preventDefault();

        axios.post(
            props.endpoint,
            {
                token: token,
                password: password,
            },
            {responseType: "json"}
        ).then(value => {
            setPasswordChanged(true);
        }).catch(error => {
            console.log(error.response.data);
            if (error.response && error.response.status === 400) {
                switch (error.response.data.error) {
                    case SetPasswordErrorCode.WEAK_PASSWORD:
                        setAlertErrorCode(SetPasswordErrorCode.WEAK_PASSWORD);
                        break;
                    case SetPasswordErrorCode.TOKEN_EXPIRED:
                        setAlertErrorCode(SetPasswordErrorCode.TOKEN_EXPIRED);
                        break;
                    case SetPasswordErrorCode.INVALID_TOKEN:
                        setAlertErrorCode(SetPasswordErrorCode.INVALID_TOKEN);
                        break;
                }
            } else {
                setAlertErrorCode(SetPasswordErrorCode.UNKNOWN_ERROR);
            }
        })
    }

    function renderContent() {
        const paragraph = passwordChanged
            ? <p>
                Mot de passe changé ! Tu peux maintenant te connecter avec.
            </p>
            : <p>
                Ton nouveau mot de passe doit comporter au moins <strong>12 caractères</strong>, dont <strong>1
                chiffre</strong>, <strong>1 majuscule</strong> et <strong>1 minuscule</strong>.
            </p>;

        const buttonText = passwordChanged ? "Demande envoyée" : "Changer mon mot de passe";

        return (
            <div className="NewPasswordForm">
                {paragraph}

                <Form onSubmit={handleSubmit}>
                    <Form.Group as={Col} xs={{span: 12}} lg={{span: 6, offset: 3}} controlId="formPassword">
                        <Form.Label>Nouveau mot de passe</Form.Label>
                        <InputGroup>
                            <InputGroup.Prepend>
                                <InputGroup.Text><span role="img" aria-label="clé">🔑</span></InputGroup.Text>
                            </InputGroup.Prepend>
                            <Form.Control type="password"
                                          name="password"
                                          value={password}
                                          onChange={handleChange}
                                          required
                                          disabled={passwordChanged}
                                          aria-label="Nouveau mot de passe"
                                          placeholder="Nouveau mot de passe"/>
                        </InputGroup>
                    </Form.Group>

                    <Button className="submit-button"
                            variant="outline-dark"
                            disabled={passwordChanged}
                            type="submit">
                        {buttonText}
                    </Button>
                </Form>

                {
                    alertErrorCode &&
                    <FormAlert setPasswordError={alertErrorCode}
                               clearAlert={clearAlert}/>
                }
            </div>
        )
    }

    return (
        <MainContainer heading={"Nouveau mot de passe"}>
            {renderContent()}
        </MainContainer>
    )
}
