import axios from 'axios';
import React, {FormEvent, useState} from 'react';
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Image from "react-bootstrap/Image";
import LoginFormAlert from "./LoginFormAlert";
import MainContainer from "./MainContainer";

import logoMines from "./logo_mines.png"

type LoginProps = {
    endpoint: string,
};

export enum ErrorCode {
    BAD_CREDENTIALS = "BAD_CREDENTIALS",
    UNAUTHORIZED_AUDIENCE = "UNAUTHORIZED_AUDIENCE",
    UNKNOWN_ERROR = "UNKNOWN_ERROR",
}

export default function LoginForm(props: LoginProps) {
    const [alertErrorCode, setAlertErrorCode] = useState<null | ErrorCode>(null);

    // Form states.
    const [username, setUsername] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [audience, setAudience] = useState<string>("portail");

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
            case "audience":
                setAudience(value);
                break;
        }

        // Clear the alert if there is one.
        clearAlert();
    }

    function clearAlert() {
        setAlertErrorCode(null);
    }

    function renderContent() {
        return (
            <>
                <Image src={logoMines} alt="Logo des Mines" rounded className="logoMines"/>

                <Form onSubmit={handleSubmit} className="LoginForm">
                    <Form.Group as={Row} controlId="formUsername">
                        <Form.Label column xs={{span: 12}} md={{span: 2, offset: 3}} className="form-label">
                            Nom d’utilisateur :
                        </Form.Label>
                        <Col xs={{span: 12}} md={3}>
                            <Form.Control type="text"
                                          name="username"
                                          value={username}
                                          onChange={handleChange}
                                          required
                                          placeholder="Nom d’utilisateur"/>
                        </Col>
                    </Form.Group>

                    <Form.Group as={Row} controlId="formPassword">
                        <Form.Label column xs={{span: 12}} md={{span: 2, offset: 3}} className="form-label">
                            Mot de passe :
                        </Form.Label>
                        <Col xs={{span: 12}} md={3}>
                            <Form.Control type="password"
                                          name="password"
                                          value={password}
                                          onChange={handleChange}
                                          required
                                          placeholder="********"/>
                        </Col>
                    </Form.Group>

                    <Form.Group as={Row} controlId="formAudience">
                        <Form.Label column xs={{span: 12}} md={{span: 2, offset: 3}} className="form-label">
                            Audience :
                        </Form.Label>
                        <Col xs={{span: 12}} md={3}>
                            <Form.Control as="select"
                                          name="audience"
                                          value={audience}
                                          onChange={handleChange}
                                          required>
                                <option value="portail">Portail</option>
                                <option value="rezal">Rézal</option>
                            </Form.Control>
                        </Col>
                    </Form.Group>

                    <Button variant="primary"
                            type="submit">
                        Se connecter
                    </Button>
                </Form>

                {
                    alertErrorCode &&
                    <LoginFormAlert error={alertErrorCode}
                                    clearAlert={clearAlert}/>
                }
            </>
        )
    }

    return (
        <MainContainer title={"Bienvenue !"}>
            {renderContent()}
        </MainContainer>
    )
}
