import axios from 'axios';
import React, {FormEvent, useState} from 'react';
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Image from "react-bootstrap/Image";
import InputGroup from "react-bootstrap/InputGroup";
import {useParams} from "react-router-dom"

import LoginFormAlert from "./LoginFormAlert";
import MainContainer from "./MainContainer";
import logoMines from "./logo_mines.png"
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

export default function LoginForm(props: LoginProps) {
    // The audience GET parameter.
    let {audience} = useParams();

    // The alert message at the bottom.
    const [alertErrorCode, setAlertErrorCode] = useState<null | ErrorCode>(null);

    function clearAlert() {
        setAlertErrorCode(null);
    }

    // The form states.
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
                <Image src={logoMines} alt="Logo des Mines" rounded className="logoMines"/>

                <h1>Connexion {renderAudienceName()}</h1>

                <Form onSubmit={handleSubmit}>
                    <Form.Group as={Col} xs={{span: 12}} md={{span: 4, offset: 4}} controlId="formUsername">
                        <Form.Label>Nom d’utilisateur</Form.Label>
                        <InputGroup>
                            <InputGroup.Prepend>
                                <InputGroup.Text>🆔</InputGroup.Text>
                            </InputGroup.Prepend>
                            <Form.Control type="text"
                                          name="username"
                                          value={username}
                                          onChange={handleChange}
                                          required
                                          title="Nom d’utilisateur"
                                          aria-label="Nom d’utilisateur"
                                          placeholder="Nom d’utilisateur"/>
                        </InputGroup>
                    </Form.Group>

                    <Form.Group as={Col} xs={{span: 12}} md={{span: 4, offset: 4}} controlId="formPassword">
                        <Form.Label>Mot de passe</Form.Label>
                        <InputGroup>
                            <InputGroup.Prepend>
                                <InputGroup.Text>🔑</InputGroup.Text>
                            </InputGroup.Prepend>
                            <Form.Control type="password"
                                          name="password"
                                          value={password}
                                          onChange={handleChange}
                                          required
                                          title="Mot de passe"
                                          arial-label="Mot de passe"
                                          placeholder="Mot de passe"/>
                        </InputGroup>
                    </Form.Group>

                    <Button variant="outline-dark"
                            type="submit">
                        Connexion
                    </Button>
                </Form>

                {
                    alertErrorCode &&
                    <LoginFormAlert error={alertErrorCode}
                                    clearAlert={clearAlert}/>
                }
            </div>
        )
    }

    return (
        <MainContainer>
            {renderContent()}
        </MainContainer>
    )
}
