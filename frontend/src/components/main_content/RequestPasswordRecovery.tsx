import axios from 'axios';
import React, {FormEvent, useState} from 'react';
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Col from "react-bootstrap/Col";
import InputGroup from "react-bootstrap/InputGroup";

import {Link} from "react-router-dom";
import {FormErrorCode} from "./ErrorBar";
import {getEmailPlaceholder} from "./placeholders";
import Heading from "../Heading";

type Props = {
    endpoint: string,
    setError: (errorCode: null | FormErrorCode, errorDetails: null | string) => void,
    clearError: () => void,
};

const emailPlaceholder = getEmailPlaceholder();

export default function RequestPasswordRecovery(props: Props) {
    // The form states.
    const [email, setEmail] = useState<string>("");

    // True iff the backend indicated the new password email was sent.
    const [emailSent, setEmailSent] = useState<boolean>(false);

    function handleChange(event: FormEvent<any>) {
        props.clearError();

        const target = event.target as HTMLInputElement;
        const value = target.value;

        if (target.name === "email") {
            setEmail(value);
        }
    }

    function handleSubmit(event: FormEvent<any>) {
        event.preventDefault();

        axios.post(
            props.endpoint,
            {
                email: email,
            }
        ).then(value => {
            setEmailSent(true);
        }).catch(error => {
            const response = error.response;

            if (response && response.status === 400) {
                if (response.data.error.code == FormErrorCode.UNKNOWN_ERROR) {
                    props.setError(FormErrorCode.UNKNOWN_ERROR, response.data.error.details);
                } else {
                    props.setError(response.data.error.code, null);
                }
            }
        });
    }

    function renderContent() {
        const paragraph = emailSent
            ? <p>
                Nous t’avons envoyé un mail (il est peut-être dans ton dossier « Spam »).<br/>
                Si tu ne l’as pas reçu d’ici quelques minutes, <Link to="/mot-de-passe/oubli"
                                                                     onClick={() => window.location.reload()}>réessaye</Link> ou <a
                href="mailto:rezal@mines-paristech.fr">contacte-nous</a>.
            </p>
            : <p>
                Donne-nous ton adresse mail <code>@mines-paristech.fr</code>.<br/>
                Si on te connaît, tu recevras un lien pour changer ton mot de passe.
            </p>;

        const buttonText = emailSent ? "Demande envoyée" : "Demander un nouveau mot de passe";

        return (
            <>
                <Heading heading="Demander un nouveau mot de passe"/>

                {paragraph}

                <Form onSubmit={handleSubmit}>
                    <Form.Group as={Col} xs={{span: 12}} lg={{span: 6, offset: 3}} controlId="formEmail">
                        <Form.Label>Adresse mail</Form.Label>
                        <InputGroup>
                            <InputGroup.Prepend>
                                <InputGroup.Text><span role="img"
                                                       aria-label="émoticône enveloppe">✉</span></InputGroup.Text>
                            </InputGroup.Prepend>
                            <Form.Control type="email"
                                          name="email"
                                          value={email}
                                          onChange={handleChange}
                                          required
                                          disabled={emailSent}
                                          aria-label="Adresse mail"
                                          placeholder={emailPlaceholder}/>
                        </InputGroup>
                    </Form.Group>

                    <Button className="submit-button"
                            variant="outline-dark"
                            disabled={emailSent}
                            type="submit">
                        {buttonText}
                    </Button>
                </Form>
            </>
        )
    }

    return renderContent();
}
