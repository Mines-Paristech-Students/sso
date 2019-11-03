import axios from 'axios';
import React, {FormEvent, useState} from 'react';
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Col from "react-bootstrap/Col";
import InputGroup from "react-bootstrap/InputGroup";
import {Link, useParams, Redirect} from "react-router-dom"

import FormAlert from "./FormAlert";
import MainContainer from "./MainContainer";
import {getUsernamePlaceholder} from "./placeholders";

export enum LoginErrorCode {
    INVALID_CREDENTIALS = "INVALID_CREDENTIALS",
    UNAUTHORIZED_AUDIENCE = "UNAUTHORIZED_AUDIENCE",
    INVALID_AUDIENCE = "INVALID_AUDIENCE",
    UNKNOWN_ERROR = "UNKNOWN_ERROR",
}

type LoginProps = {
    endpoint: string,
};

export default function Login(props: LoginProps) {
    // The audience GET parameter.
    let {audience} = useParams();

    // The alert message at the bottom.
    const [alertErrorCode, setAlertErrorCode] = useState<null | LoginErrorCode>(null);

    function clearAlert() {
        setAlertErrorCode(null);
    }

    // The form states.
    const usernamePlaceholder = getUsernamePlaceholder();
    const [username, setUsername] = useState<string>("");

    const passwordPlaceholder = "Mot de passe";
    const [password, setPassword] = useState<string>("");

    function handleChange(event: FormEvent<any>) {
        const target = event.target as HTMLInputElement;
        const value = target.value;

        switch (target.name) {
            case "username":
                setUsername(value);
                break;
            case "password":
                setPassword(value);
                break;
        }

        // Clear the alert if there is one.
        clearAlert();
    }

    function handleSubmit(event: FormEvent<any>) {
        event.preventDefault();

        axios.post(
            props.endpoint,
            {
                username: username,
                password: password,
                audience: audience,
            }
        ).then(value => {
            window.location = value.data.redirect;
        }).catch(error => {
            if (error.response && error.response.status === 401) {
                switch (error.response.data) {
                    case LoginErrorCode.INVALID_CREDENTIALS:
                        setAlertErrorCode(LoginErrorCode.INVALID_CREDENTIALS);
                        break;
                    case LoginErrorCode.UNAUTHORIZED_AUDIENCE:
                        setAlertErrorCode(LoginErrorCode.UNAUTHORIZED_AUDIENCE);
                        break;
                    default:
                        setAlertErrorCode(LoginErrorCode.UNKNOWN_ERROR);
                        break;
                }
            } else {
                setAlertErrorCode(LoginErrorCode.UNKNOWN_ERROR);
            }
        })
    }

    function renderAudienceName() {
        switch (audience) {
            case "rezal":
                return <>au <span className="audience-name">Rézal</span></>;
            case "portail":
                return <>au <span className="audience-name">Portail des élèves</span></>;
            default:
                return <></>;
        }
    }

    function renderContent() {
        if (audience !== "portail" && audience !== "rezal") {
            return <Redirect to="/404"/>;
        }

        return (
            <div className="LoginForm">
                <Form onSubmit={handleSubmit}>
                    <Form.Group as={Col} xs={{span: 12}} lg={{span: 6, offset: 3}} controlId="formUsername">
                        <Form.Label>Nom d’utilisateur</Form.Label>
                        <InputGroup>
                            <InputGroup.Prepend>
                                <InputGroup.Text><span role="img" aria-label="émoticône ID">🆔</span></InputGroup.Text>
                            </InputGroup.Prepend>
                            <Form.Control type="text"
                                          name="username"
                                          value={username}
                                          onChange={handleChange}
                                          required
                                          aria-label="Nom d’utilisateur"
                                          placeholder={usernamePlaceholder}/>
                        </InputGroup>
                    </Form.Group>

                    <Form.Group as={Col} xs={{span: 12}} lg={{span: 6, offset: 3}} controlId="formPassword">
                        <Form.Label>Mot de passe</Form.Label>
                        <InputGroup>
                            <InputGroup.Prepend>
                                <InputGroup.Text><span role="img" aria-label="émoticône clé">🔑</span></InputGroup.Text>
                            </InputGroup.Prepend>
                            <Form.Control type="password"
                                          name="password"
                                          value={password}
                                          onChange={handleChange}
                                          required
                                          arial-label="Mot de passe"
                                          placeholder={passwordPlaceholder}/>
                        </InputGroup>
                    </Form.Group>

                    <Button className="submit-button"
                            variant="outline-dark"
                            type="submit">
                        Connexion
                    </Button>
                </Form>

                <p>
                    <Link to="/mot-de-passe/oubli">Mot de passe oublié ?</Link>
                </p>

                {
                    alertErrorCode &&
                    <FormAlert loginError={alertErrorCode}
                               clearAlert={clearAlert}/>
                }
            </div>
        )
    }

    return (
        <MainContainer heading={<>Connexion {renderAudienceName()}</>}>
            {renderContent()}
        </MainContainer>
    )
}
