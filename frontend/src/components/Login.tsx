import axios from 'axios';
import React, {FormEvent, useState} from 'react';
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Col from "react-bootstrap/Col";
import InputGroup from "react-bootstrap/InputGroup";
import {Link, useParams} from "react-router-dom"

import LoginFormAlert from "./LoginFormAlert";
import MainContainer from "./MainContainer";
import Error404 from "./Error404";

type LoginProps = {
    endpoint: string,
};

export enum ErrorCode {
    BAD_CREDENTIALS = "BAD_CREDENTIALS",
    UNAUTHORIZED_AUDIENCE = "UNAUTHORIZED_AUDIENCE",
    INVALID_AUDIENCE = "INVALID_AUDIENCE",
    UNKNOWN_ERROR = "UNKNOWN_ERROR",
}

// Dumb usernames which will be used to fill the email placeholder. Just for fun.
const USERNAME_PLACEHOLDERS = [
    "16bde",
    "17bde",
    "18bde",
    "19bde",
    "16bdl",
    "17bdl",
    "18bdl",
    "19bdl",
    "16bench",
    "17bench",
    "18bench",
    "19bench",
    "16peigne",
    "17peigne",
    "18peigne",
    "19peigne",
    "16picheur",
    "17picheur",
    "18picheur",
    "19picheur",
];

export default function LoginForm(props: LoginProps) {
    // The audience GET parameter.
    let {audience} = useParams();

    // The alert message at the bottom.
    const [alertErrorCode, setAlertErrorCode] = useState<null | ErrorCode>(null);

    function clearAlert() {
        setAlertErrorCode(null);
    }

    // The form states.
    const username_placeholder = USERNAME_PLACEHOLDERS[Math.floor(Math.random() * Math.floor(USERNAME_PLACEHOLDERS.length))];
    const [username, setUsername] = useState<string>("");
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
                    case ErrorCode.BAD_CREDENTIALS:
                        setAlertErrorCode(ErrorCode.BAD_CREDENTIALS);
                        break;
                    case ErrorCode.UNAUTHORIZED_AUDIENCE:
                        setAlertErrorCode(ErrorCode.UNAUTHORIZED_AUDIENCE);
                        break;
                    default:
                        setAlertErrorCode(ErrorCode.UNKNOWN_ERROR);
                        break;
                }
            } else {
                setAlertErrorCode(ErrorCode.UNKNOWN_ERROR);
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
            return <Error404/>;
        }

        return (
            <div className="LoginForm">
                <Form onSubmit={handleSubmit}>
                    <Form.Group as={Col} xs={{span: 12}} lg={{span: 6, offset: 3}} controlId="formUsername">
                        <Form.Label>Nom d’utilisateur</Form.Label>
                        <InputGroup>
                            <InputGroup.Prepend>
                                <InputGroup.Text><span role="img" aria-label="ID">🆔</span></InputGroup.Text>
                            </InputGroup.Prepend>
                            <Form.Control type="text"
                                          name="username"
                                          value={username}
                                          onChange={handleChange}
                                          required
                                          aria-label="Nom d’utilisateur"
                                          placeholder={username_placeholder}/>
                        </InputGroup>
                    </Form.Group>

                    <Form.Group as={Col} xs={{span: 12}} lg={{span: 6, offset: 3}} controlId="formPassword">
                        <Form.Label>Mot de passe</Form.Label>
                        <InputGroup>
                            <InputGroup.Prepend>
                                <InputGroup.Text><span role="img" aria-label="clé">🔑</span></InputGroup.Text>
                            </InputGroup.Prepend>
                            <Form.Control type="password"
                                          name="password"
                                          value={password}
                                          onChange={handleChange}
                                          required
                                          arial-label="Mot de passe"
                                          placeholder="Mot de passe"/>
                        </InputGroup>
                    </Form.Group>

                    <Button className="submit-button"
                            variant="outline-dark"
                            type="submit">
                        Connexion
                    </Button>
                </Form>

                <p>
                    <Link to="/oubli">Mot de passe oublié ?</Link>
                </p>

                {
                    alertErrorCode &&
                    <LoginFormAlert error={alertErrorCode}
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
