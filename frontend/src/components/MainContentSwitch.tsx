import React, {useState} from 'react';
import ErrorBar, {FormErrorCode} from "./main_content/ErrorBar";
import {Redirect, Route, Switch} from "react-router";
import Login from "./main_content/Login";
import RequestPasswordRecovery from "./main_content/RequestPasswordRecovery";
import ResetPassword from "./main_content/ResetPassword";
import ChangePasswordForm from "./main_content/ChangePassword";

type Props = {};


export default function MainContentSwitch(props: Props) {
    const [errorCode, setErrorCode] = useState<null | FormErrorCode>(null);
    const [errorDetails, setErrorDetails] = useState<null | string>(null);

    function clearError() {
        setErrorCode(null);
        setErrorDetails(null);
    }

    function setError(errorCode: null | FormErrorCode, errorDetails: null | string) {
        setErrorCode(errorCode);
        setErrorDetails(errorDetails);
    }

    return (
        <>
            <div className="main-content">
                <Switch>
                    <Route path="/connexion/:audience">
                        <Login endpoint="http://localhost:8100/api/v1/login/"
                               setError={setError}
                               clearError={clearError}/>
                    </Route>
                    <Route path="/mot-de-passe/oubli">
                        <RequestPasswordRecovery endpoint="http://localhost:8100/api/v1/password/recover/request/"
                                                 setError={setError}
                                                 clearError={clearError}/>
                    </Route>
                    <Route path="/mot-de-passe/nouveau/:token">
                        <ResetPassword endpoint="http://localhost:8100/api/v1/password/recover/reset/"
                                       setError={setError}
                                       clearError={clearError}/>
                    </Route>
                    <Route path="/mot-de-passe/changer/">
                        <ChangePasswordForm endpoint="http://localhost:8100/api/v1/password/change/"
                                            setError={setError}
                                            clearError={clearError}/>
                    </Route>
                    <Route path="*">
                        <Redirect to="/404"/>
                    </Route>
                </Switch>
            </div>

            {
                errorCode &&
                <ErrorBar errorCode={errorCode}
                          errorDetails={errorDetails}
                          clearError={clearError}/>
            }
        </>
    )
}
