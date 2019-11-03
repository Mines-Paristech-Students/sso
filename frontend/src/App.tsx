import React from 'react';
import {BrowserRouter as Router, Switch, Route, Redirect} from 'react-router-dom';

import './App.css';
import Login from "./components/Login";
import Error404 from "./components/Error404";
import RequestPasswordRecovery from "./components/RequestPasswordRecovery";
import RecoverPassword from "./components/SetPassword";
import FakeAdmin from "./components/FakeAdmin";

const App: React.FC = () => {
    return (
        <Router>
            <div className="App">
                <Switch>
                    <Route path="/connexion/:audience">
                        <Login endpoint="http://localhost:8100/api/login/"/>
                    </Route>
                    <Route path="/oubli">
                        <RequestPasswordRecovery endpoint="http://localhost:8100/api/password/recover/request/"/>
                    </Route>
                    <Route path="/nouveau/:token">
                        <RecoverPassword endpoint="http://localhost:8100/api/password/recover/set_password/"/>
                    </Route>
                    <Route path="/admin">
                        <FakeAdmin/>
                    </Route>
                    <Route path="/404">
                        <Error404/>
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
