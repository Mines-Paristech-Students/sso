import React from 'react';
import {BrowserRouter as Router, Switch, Route} from 'react-router-dom';

import './App.css';
import LoginForm from "./components/LoginForm";
import Error404 from "./components/Error404";
import NewPasswordForm from "./components/NewPasswordForm";

const App: React.FC = () => {
    return (
        <Router>
            <div className="App">
                <Switch>
                    <Route path="/connexion/:audience">
                        <LoginForm endpoint="http://localhost:8100/api/login/"/>
                    </Route>
                    <Route path="/oubli">
                        <NewPasswordForm endpoint="http://localhost:8100/api/login/"/>
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
