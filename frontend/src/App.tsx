import React from 'react';

import './App.css';
import LoginForm from "./components/LoginForm";

const App: React.FC = () => {
    return (
        <div className="App">
            <LoginForm
                endpoint="http://localhost:8100/api/login/"
            />
        </div>
    );
};

export default App;
