import React from 'react';
import {BrowserRouter as Router, Switch, Route, Redirect} from 'react-router-dom';

import './App.css';
import Login from "./components/Login";
import Error404 from "./components/Error404";
import RequestPasswordRecovery from "./components/RequestPasswordRecovery";
import ResetPassword from "./components/ResetPassword";
import FakeAdmin from "./components/FakeAdmin";
import ChangePasswordForm from "./components/ChangePassword";
import MainContainer from "./components/MainContainer";

const App: React.FC = () => {
    return (
        <Router>
            <div className="App">
                <Switch>
                    <Route path="/connexion/:audience">
                        <MainContainer heading={<>Connexion</>}>
                            <Login endpoint="http://localhost:8100/api/v1/login/"/>
                        </MainContainer>
                    </Route>
                    <Route path="/mot-de-passe/oubli">
                        <MainContainer heading="Mot de passe oublié"
                                       content={RequestPasswordRecovery}
                                       endpoint="http://localhost:8100/api/v1/password/recover/request/"/>
                    </Route>
                    <Route path="/mot-de-passe/nouveau/:token">
                        <MainContainer heading="Nouveau mot de passe"
                                       content={ResetPassword}
                                       endpoint="http://localhost:8100/api/v1/password/recover/reset/"/>
                    </Route>
                    <Route path="/mot-de-passe/changer/">
                        <MainContainer heading="Changemement de mot de passe"
                                       content={ChangePasswordForm}
                                       endpoint="http://localhost:8100/api/v1/password/change/"/>
                    </Route>
                    <Route path="/admin">
                        <MainContainer heading="Administration"
                                       content={FakeAdmin}/>
                    </Route>
                    <Route path="/404">
                        <MainContainer heading="404."
                                       content={Error404}/>
                    </Route>
                    <Route path="*">
                        <Redirect to="/404"/>
                    </Route>
                </Switch>
            </div>
        </Router>
    );
};

export default App;
