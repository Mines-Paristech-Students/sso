import axios from 'axios';
import React, {FormEvent, useState} from 'react';
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Col from "react-bootstrap/Col";
import InputGroup from "react-bootstrap/InputGroup";
import {Link, Redirect, useParams} from "react-router-dom"

import {FormErrorCode} from "./ErrorBar";
import {getUsernamePlaceholder} from "./placeholders";
import Heading from "../Heading";

type LoginProps = {
    endpoint: string,
    setError: (errorCode: null | FormErrorCode, errorDetails: null | string) => void,
    clearError: () => void,
};

const usernamePlaceholder = getUsernamePlaceholder();
const passwordPlaceholder = "Mot de passe";

export default function Login(props: LoginProps) {
    // The audience GET parameter.
    let {audience} = useParams();

    // The form states.
    const [username, setUsername] = useState<string>("");
    const [password, setPassword] = useState<string>("");

    function handleChange(event: FormEvent<any>) {
        props.clearError();

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
            const response = error.response;

            if (response && response.status === 401) {
                if (response.data.error.code === FormErrorCode.UNKNOWN_ERROR) {
                    props.setError(FormErrorCode.UNKNOWN_ERROR, response.data.error.details);
                } else {
                    props.setError(response.data.error.code, null);
                }
            } else {
                props.setError(FormErrorCode.UNKNOWN_ERROR, null)
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
            <>
                <Heading heading={<>Connexion {renderAudienceName()}</>}/>

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
            </>
        )
    }

    return renderContent();
}
