import React from 'react';
import {BrowserRouter as Router, Switch, Route} from 'react-router-dom';

import './App.css';
import Login from "./components/Login";
import Error404 from "./components/Error404";
import ForgottenPassword from "./components/ForgottenPassword";
import NewPassword from "./components/NewPassword";

const App: React.FC = () => {
    return (
        <Router>
            <div className="App">
                <Switch>
                    <Route path="/connexion/:audience">
                        <Login endpoint="http://localhost:8100/api/login/"/>
                    </Route>
                    <Route path="/oubli">
                        <ForgottenPassword endpoint="http://localhost:8100/api/password/forgotten/"/>
                    </Route>
                    <Route path="/nouveau/:token">
                        <NewPassword endpoint="http://localhost:8100/api/password/password_change/"/>
                    </Route>
                    <Route path="*">
                        <Error404/>
                    </Route>
                </Switch>
            </div>
        </Router>
    );
};

export default App;
