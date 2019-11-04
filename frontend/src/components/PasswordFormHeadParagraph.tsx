import React from 'react';
import {Link} from "react-router-dom";

type Props = {
    passwordHasChanged: boolean
};

export default function PasswordFormHeadParagraph(props: Props) {
    return (
        props.passwordHasChanged
            ? <p>
                Mot de passe changé ! Tu peux maintenant te connecter au <Link to="/connexion/portail/">Portail des
                élèves</Link> ou au <Link to={"/connexion/rezal"}>Rézal</Link>.
            </p>
            : <p>
                Ton nouveau mot de passe doit comporter au moins <strong>12 caractères</strong>.
            </p>
    );
}
