import axios from "../axios";
import React, { FormEvent, useState } from "react";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Col from "react-bootstrap/Col";
import InputGroup from "react-bootstrap/InputGroup";
import { Link, useParams, Redirect } from "react-router-dom";

import FormAlert from "./FormAlert";
import MainContainer from "./MainContainer";
import { getUsernamePlaceholder } from "./placeholders";

export enum LoginErrorCode {
  INVALID_CREDENTIALS = "INVALID_CREDENTIALS",
  INVALID_AUDIENCE = "INVALID_AUDIENCE",
  UNKNOWN_ERROR = "UNKNOWN_ERROR",
}

type LoginProps = {
  endpoint: string;
};

const usernamePlaceholder = getUsernamePlaceholder();
const passwordPlaceholder = "Mot de passe";

export default function Login(props: LoginProps) {
  // The audience GET parameter.
  let { audience } = useParams<{ audience: string | undefined }>();

  const redirectionUrls: Record<string, string | undefined> = {
    rezal: process.env.REACT_APP_REZAL_URL,
    portail: process.env.REACT_APP_PORTAIL_URL,
  };

  // The alert message at the bottom.
  const [alertErrorCode, setAlertErrorCode] = useState<null | LoginErrorCode>(
    null
  );

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

    axios
      .post(props.endpoint, {
        username: username,
        password: password,
        audience: audience,
      })
      .then((value) => axios.get(value.data.redirect as string, { withCredentials: true })
      .then(() => {
        if(!Object.keys(redirectionUrls).includes(audience)) {
          return;
        }

        const audienceUrl = redirectionUrls[audience];

        if (!audienceUrl) {
          return;
        }

        window.location.href = audienceUrl;
      })
      .catch((error) => {
        const response = error.response;

        if (response && response.status === 401) {
          switch (response.data.error.type) {
            case LoginErrorCode.INVALID_CREDENTIALS:
              setAlertErrorCode(LoginErrorCode.INVALID_CREDENTIALS);
              break;
            case LoginErrorCode.INVALID_AUDIENCE:
              setAlertErrorCode(LoginErrorCode.INVALID_AUDIENCE);
              break;
            default:
              setAlertErrorCode(LoginErrorCode.UNKNOWN_ERROR);
              break;
          }
        } else {
          setAlertErrorCode(LoginErrorCode.UNKNOWN_ERROR);
        }
      });
  }

  function renderAudienceName() {
    switch (audience) {
      case "rezal":
        return (
          <>
            au <span className="audience-name">Rézal</span>
          </>
        );
      case "portail":
        return (
          <>
            au <span className="audience-name">Portail des élèves</span>
          </>
        );
      default:
        return <></>;
    }
  }

  function renderContent() {
    if (audience !== "portail" && audience !== "rezal") {
      return <Redirect to="/404" />;
    }

    return (
      <div className="LoginForm">
        <Form onSubmit={handleSubmit}>
          <Form.Group
            as={Col}
            xs={{ span: 12 }}
            lg={{ span: 6, offset: 3 }}
            controlId="formUsername"
          >
            <Form.Label>Nom d’utilisateur</Form.Label>
            <InputGroup>
              <InputGroup.Prepend>
                <InputGroup.Text>
                  <span role="img" aria-label="émoticône ID">
                    🆔
                  </span>
                </InputGroup.Text>
              </InputGroup.Prepend>
              <Form.Control
                type="text"
                name="username"
                value={username}
                onChange={handleChange}
                required
                aria-label="Nom d’utilisateur"
                placeholder={usernamePlaceholder}
              />
            </InputGroup>
          </Form.Group>

          <Form.Group
            as={Col}
            xs={{ span: 12 }}
            lg={{ span: 6, offset: 3 }}
            controlId="formPassword"
          >
            <Form.Label>Mot de passe</Form.Label>
            <InputGroup>
              <InputGroup.Prepend>
                <InputGroup.Text>
                  <span role="img" aria-label="émoticône clé">
                    🔑
                  </span>
                </InputGroup.Text>
              </InputGroup.Prepend>
              <Form.Control
                type="password"
                name="password"
                value={password}
                onChange={handleChange}
                required
                arial-label="Mot de passe"
                placeholder={passwordPlaceholder}
              />
            </InputGroup>
          </Form.Group>

          <Button
            className="submit-button"
            variant="outline-dark"
            type="submit"
          >
            Connexion
          </Button>
        </Form>

        <p>
          <Link to="/mot-de-passe/oubli">Mot de passe oublié ?</Link>
        </p>

        {alertErrorCode && (
          <FormAlert loginError={alertErrorCode} clearAlert={clearAlert} />
        )}
      </div>
    );
  }

  return (
    <MainContainer heading={<>Connexion {renderAudienceName()}</>}>
      {renderContent()}
    </MainContainer>
  );
}
