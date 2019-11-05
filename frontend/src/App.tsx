import React from 'react';
import {BrowserRouter as Router, Switch, Route} from 'react-router-dom';

import './App.css';
import Error404 from "./components/Error404";
import FakeAdmin from "./components/FakeAdmin";
import MainContentSwitch from "./components/MainContentSwitch";

const App: React.FC = () => {
    return (
        <Router>
            <div className="App">
                <Switch>
                    <Route path="/404">
                        <Error404/>
                    </Route>
                    <Route path="/admin">
                        <FakeAdmin/>
                    </Route>
                    <Route path="*">
                        <MainContentSwitch/>
                    </Route>
                </Switch>
            </div>
        </Router>
    );
};

export default App;
