import axios from 'axios';
import React, {FormEvent, useState} from 'react';
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Col from "react-bootstrap/Col";
import InputGroup from "react-bootstrap/InputGroup";
import {useParams} from "react-router";
import {FormErrorCode} from "./ErrorBar";
import PasswordFormHeadParagraph from "./PasswordFormHeadParagraph";
import Heading from "../Heading";

type Props = {
    endpoint: string,
    setError: (errorCode: null | FormErrorCode, errorDetails: null | string) => void,
    clearError: () => void,
};

export default function ResetPassword(props: Props) {
    // The token GET parameter.
    let {token} = useParams();

    // The form states.
    const [password, setPassword] = useState<string>("");

    // True iff the backend indicated that the password was successfully changed.
    const [passwordHasChanged, setPasswordChanged] = useState<boolean>(false);

    function handleChange(event: FormEvent<any>) {
        props.clearError();

        const target = event.target as HTMLInputElement;
        const value = target.value;

        if (target.name === "password") {
            setPassword(value);
        }
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
            setPassword("");
        }).catch(error => {
            const response = error.response;

            if (response && response.status === 400) {
                if (response.data.error.code == FormErrorCode.UNKNOWN_ERROR) {
                    props.setError(FormErrorCode.UNKNOWN_ERROR, response.data.error.details);
                } else {
                    props.setError(response.data.error.code, null);
                }
            }
        })
    }

    function renderContent() {
        return (
            <>
                <Heading heading="Nouveau mot de passe"/>

                <PasswordFormHeadParagraph passwordHasChanged={passwordHasChanged}/>

                <Form onSubmit={handleSubmit}>
                    <Form.Group as={Col} xs={{span: 12}} lg={{span: 6, offset: 3}} controlId="formPassword">
                        <Form.Label>Nouveau mot de passe</Form.Label>
                        <InputGroup>
                            <InputGroup.Prepend>
                                <InputGroup.Text><span role="img" aria-label="émoticône clé">🔑</span></InputGroup.Text>
                            </InputGroup.Prepend>
                            <Form.Control type="password"
                                          name="password"
                                          value={password}
                                          onChange={handleChange}
                                          required
                                          disabled={passwordHasChanged}
                                          minLength={12}
                                          aria-label="Nouveau mot de passe"
                                          placeholder="Nouveau mot de passe"/>
                        </InputGroup>
                    </Form.Group>

                    <Button className="submit-button"
                            variant="outline-primary"
                            disabled={passwordHasChanged || password.length < 12}
                            type="submit">
                        {passwordHasChanged ? "Demande envoyée" : "Changer mon mot de passe"}
                    </Button>
                </Form>
            </>
        )
    }

    return renderContent();
}
