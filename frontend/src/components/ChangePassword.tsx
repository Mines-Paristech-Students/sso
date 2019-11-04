import axios from 'axios';
import React, {FormEvent, useState} from 'react';
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Col from "react-bootstrap/Col";
import InputGroup from "react-bootstrap/InputGroup";
import {Link} from "react-router-dom"

import FormAlert from "./FormAlert";
import MainContainer from "./MainContainer";
import {getUsernamePlaceholder} from "./placeholders";
import PasswordFormHeadParagraph from "./PasswordFormHeadParagraph";

export enum ChangePasswordErrorCode {
    INVALID_CREDENTIALS = "INVALID_CREDENTIALS",
    WEAK_PASSWORD = "WEAK_PASSWORD",
    UNKNOWN_ERROR = "UNKNOWN_ERROR",
}

type Props = {
    endpoint: string,
};

const usernamePlaceholder = getUsernamePlaceholder();
const oldPasswordPlaceholder = "Mot de passe actuel";
const newPasswordPlaceholder = "Nouveau mot de passe";
const newPasswordConfirmationPlaceholder = "Confirmation du nouveau mot de passe";

export default function ChangePassword(props: Props) {
    // The alert message at the bottom.
    const [alertErrorCode, setAlertErrorCode] = useState<null | ChangePasswordErrorCode>(null);

    function clearAlert() {
        setAlertErrorCode(null);
    }

    // The form states.
    const [username, setUsername] = useState<string>("");
    const [oldPassword, setOldPassword] = useState<string>("");
    const [newPassword, setNewPassword] = useState<string>("");
    const [newPasswordConfirmation, setNewPasswordConfirmation] = useState<string>("");

    // True iff the backend indicated that the password was successfully changed.
    const [passwordHasChanged, setPasswordChanged] = useState<boolean>(false);

    function handleChange(event: FormEvent<any>) {
        const target = event.target as HTMLInputElement;
        const value = target.value;

        switch (target.name) {
            case "username":
                setUsername(value);
                break;
            case "oldPassword":
                setOldPassword(value);
                break;
            case "newPassword":
                setNewPassword(value);
                break;
            case "newPasswordConfirmation":
                setNewPasswordConfirmation(value);
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
                old_password: oldPassword,
                new_password: newPassword,
            }
        ).then(value => {
            setPasswordChanged(true);
        }).catch(error => {
            const response = error.response;

            if (response && response.status === 400) {
                switch (response.data.error.type) {
                    case ChangePasswordErrorCode.INVALID_CREDENTIALS:
                        setAlertErrorCode(ChangePasswordErrorCode.INVALID_CREDENTIALS);
                        break;
                    case ChangePasswordErrorCode.WEAK_PASSWORD:
                        setAlertErrorCode(ChangePasswordErrorCode.WEAK_PASSWORD);
                        break;
                    default:
                        setAlertErrorCode(ChangePasswordErrorCode.UNKNOWN_ERROR);
                        break;
                }
            } else {
                setAlertErrorCode(ChangePasswordErrorCode.UNKNOWN_ERROR);
            }
        })
    }

    function renderContent() {
        return (
            <div className="LoginForm">
                <PasswordFormHeadParagraph passwordHasChanged={passwordHasChanged}/>

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
                                          disabled={passwordHasChanged}
                                          aria-label="Nom d’utilisateur"
                                          placeholder={usernamePlaceholder}/>
                        </InputGroup>
                    </Form.Group>

                    <Form.Group as={Col} xs={{span: 12}} lg={{span: 6, offset: 3}} controlId="formOldPassword">
                        <Form.Label>Mot de passe actuel</Form.Label>
                        <InputGroup>
                            <InputGroup.Prepend>
                                <InputGroup.Text><span role="img"
                                                       aria-label="émoticône vieille clé">🗝</span></InputGroup.Text>
                            </InputGroup.Prepend>
                            <Form.Control type="password"
                                          name="oldPassword"
                                          value={oldPassword}
                                          onChange={handleChange}
                                          required
                                          disabled={passwordHasChanged}
                                          aria-label="Mot de passe actuel"
                                          placeholder={oldPasswordPlaceholder}/>
                        </InputGroup>
                    </Form.Group>

                    <Form.Group as={Col} xs={{span: 12}} lg={{span: 6, offset: 3}} controlId="formNewPassword">
                        <Form.Label>Nouveau mot de passe</Form.Label>
                        <InputGroup>
                            <InputGroup.Prepend>
                                <InputGroup.Text><span role="img" aria-label="émoticône clé">🔑</span></InputGroup.Text>
                            </InputGroup.Prepend>
                            <Form.Control type="password"
                                          name="newPassword"
                                          value={newPassword}
                                          onChange={handleChange}
                                          required
                                          disabled={passwordHasChanged}
                                          arial-label="Nouveau mot de passe"
                                          placeholder={newPasswordPlaceholder}/>
                        </InputGroup>
                    </Form.Group>

                    <Form.Group as={Col} xs={{span: 12}} lg={{span: 6, offset: 3}}
                                controlId="formNewPasswordConfirmation">
                        <Form.Label>Confirmation du nouveau mot de passe</Form.Label>
                        <InputGroup>
                            <InputGroup.Prepend>
                                <InputGroup.Text><span role="img" aria-label="émoticône clé">🔑</span></InputGroup.Text>
                            </InputGroup.Prepend>
                            <Form.Control type="password"
                                          name="newPasswordConfirmation"
                                          value={newPasswordConfirmation}
                                          onChange={handleChange}
                                          required
                                          disabled={passwordHasChanged}
                                          arial-label="Confirmation du nouveau mot de passe"
                                          placeholder={newPasswordConfirmationPlaceholder}/>
                        </InputGroup>
                    </Form.Group>

                    <Button className="submit-button"
                            variant="outline-primary"
                            disabled={newPassword !== newPasswordConfirmation || newPassword.length < 12 || passwordHasChanged}
                            type="submit">
                        {passwordHasChanged ? "Demande envoyée" : "Changer mon mot de passe"}
                    </Button>
                </Form>

                <p>
                    <Link to="/mot-de-passe/oubli">Mot de passe oublié ?</Link>
                </p>

                {
                    alertErrorCode &&
                    <FormAlert changePasswordError={alertErrorCode}
                               clearAlert={clearAlert}/>
                }
            </div>
        )
    }

    return (
        <MainContainer heading="Changemement de mot de passe">
            {renderContent()}
        </MainContainer>
    )
}
