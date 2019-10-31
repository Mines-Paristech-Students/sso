import axios from 'axios';
import React, {FormEvent, useEffect, useState} from 'react';
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import {Redirect} from 'react-router-dom';
import LoginFormAlert from "./LoginFormAlert";

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
            if (error.response && error.response.status === 401)
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

    return (
        <>
            <Form onSubmit={handleSubmit}>
                <Form.Group controlId="formUsername">
                    <Form.Label>Nom d’utilisateur</Form.Label>
                    <Form.Control type="text"
                                  name="username"
                                  value={username}
                                  onChange={handleChange}
                                  required
                                  placeholder="Nom d’utilisateur"/>
                </Form.Group>

                <Form.Group controlId="formPassword">
                    <Form.Label>Mot de passe</Form.Label>
                    <Form.Control type="password"
                                  name="password"
                                  value={password}
                                  onChange={handleChange}
                                  required
                                  placeholder="********"/>
                </Form.Group>

                <Form.Group controlId="formAudience">
                    <Form.Label>
                        Audience
                    </Form.Label>
                    <Form.Control as="select"
                                  name="audience"
                                  value={audience}
                                  onChange={handleChange}
                                  required>
                        <option value="portail">Portail</option>
                        <option value="rezal">Rézal</option>
                    </Form.Control>
                </Form.Group>

                <Button variant="primary"
                        type="submit">
                    Submit
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
