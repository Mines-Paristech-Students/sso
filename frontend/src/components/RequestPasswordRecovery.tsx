import axios from 'axios';
import React, {FormEvent, useState} from 'react';
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Col from "react-bootstrap/Col";
import InputGroup from "react-bootstrap/InputGroup";

import MainContainer from "./MainContainer";
import {Link} from "react-router-dom";
import FormAlert from "./FormAlert";
import {getEmailPlaceholder} from "./placeholders";

export enum RequestPasswordRecoveryErrorCode {
    INVALID_EMAIL = "INVALID_EMAIL",
    UNKNOWN_ERROR = "UNKNOWN_ERROR",
}

type Props = {
    endpoint: string,
};

export default function RequestPasswordRecovery(props: Props) {
    const emailPlaceholder = getEmailPlaceholder();

    // The alert message at the bottom.
    const [alertErrorCode, setAlertErrorCode] = useState<null | RequestPasswordRecoveryErrorCode>(null);

    function clearAlert() {
        setAlertErrorCode(null);
    }

    // The form states.
    const [email, setEmail] = useState<string>("");

    // True iff the backend indicated the new password email was sent.
    const [emailSent, setEmailSent] = useState<boolean>(false);

    function handleChange(event: FormEvent<any>) {
        const target = event.target as HTMLInputElement;
        const value = target.value;

        if (target.name === "email") {
            setEmail(value);
        }

        // Remove the alert.
        clearAlert();
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
            if (error.response && error.response.status === 400 &&
                error.response.data.error === RequestPasswordRecoveryErrorCode.INVALID_EMAIL) {
                setAlertErrorCode(RequestPasswordRecoveryErrorCode.INVALID_EMAIL);
            } else {
                setAlertErrorCode(RequestPasswordRecoveryErrorCode.UNKNOWN_ERROR);
            }
        });
    }

    function renderContent() {
        const paragraph = emailSent
            ? <p>
                Nous t’avons envoyé un mail (il est peut-être dans ton dossier « Spam »).<br/>
                Si tu ne l’as pas reçu d’ici quelques minutes, <Link to="/oubli"
                                                                     onClick={() => window.location.reload()}>réessaye</Link> ou <a
                href="mailto:rezal@mines-paristech.fr">contacte-nous</a>.
            </p>
            : <p>
                Donne-nous ton adresse mail <code>@mines-paristech.fr</code>.<br/>
                Si on te connaît, tu recevras un lien pour changer ton mot de passe.
            </p>;

        const buttonText = emailSent ? "Demande envoyée" : "Demander un nouveau mot de passe";

        return (
            <div className="ForgottenPasswordForm">
                {paragraph}

                <Form onSubmit={handleSubmit}>
                    <Form.Group as={Col} xs={{span: 12}} lg={{span: 6, offset: 3}} controlId="formEmail">
                        <Form.Label>Adresse mail</Form.Label>
                        <InputGroup>
                            <InputGroup.Prepend>
                                <InputGroup.Text><span role="img" aria-label="enveloppe">✉</span></InputGroup.Text>
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

                {
                    alertErrorCode &&
                    <FormAlert requestPasswordRecoveryError={alertErrorCode}
                               clearAlert={clearAlert}/>
                }
            </div>
        )
    }

    return (
        <MainContainer heading={"Mot de passe oublié"}>
            {renderContent()}
        </MainContainer>
    )
}
