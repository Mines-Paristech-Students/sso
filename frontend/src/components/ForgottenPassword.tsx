import axios from 'axios';
import React, {FormEvent, useState} from 'react';
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Col from "react-bootstrap/Col";
import InputGroup from "react-bootstrap/InputGroup";

import MainContainer from "./MainContainer";

type Props = {
    endpoint: string,
};

// Dumb emails which will be used to fill the email placeholder. Just for fun.
const EMAIL_PLACEHOLDERS = [
    "bde@mines-paristech.fr",
    "bdl@mines-paristech.fr",
    "bencheur@mines-paristech.fr",
    "matmaz@mines-paristech.fr",
    "peigne@mines-paristech.fr",
    "picheur@mines-paristech.fr",
    "zaza@mines-paristech.fr"
];

export default function ForgottenPassword(props: Props) {
    const email_placeholder = EMAIL_PLACEHOLDERS[Math.floor(Math.random() * Math.floor(EMAIL_PLACEHOLDERS.length))];

    // The form states.
    const [email, setEmail] = useState<string>("");

    function handleChange(event: FormEvent<any>) {
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
            console.log(value)
        }).catch(error => {
            console.log(error)
        })
    }

    function renderContent() {
        return (
            <div className="NewPasswordForm">
                <p>
                    Donne-nous ton adresse mail <code>mines-paristech.fr</code>.<br/>
                    Si on te connaît, tu recevras un lien pour changer ton mot de passe.
                </p>

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
                                          aria-label="Adresse mail"
                                          placeholder={email_placeholder}/>
                        </InputGroup>
                    </Form.Group>

                    <Button className="submit-button"
                            variant="outline-dark"
                            type="submit">
                        Demander un nouveau mot de passe
                    </Button>
                </Form>
            </div>
        )
    }

    return (
        <MainContainer heading={"Mot de passe oublié"}>
            {renderContent()}
        </MainContainer>
    )
}
