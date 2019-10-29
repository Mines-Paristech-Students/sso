import axios from 'axios';
import React, {FormEvent, SyntheticEvent} from 'react';


interface LoginProps {
    endpoint: string;
}

interface LoginState {
    username: string;
    password: string;
    audience: string;
}

export default class LoginForm extends React.Component<LoginProps, LoginState> {
    constructor(props: LoginProps, context: LoginState) {
        super(props, context);

        this.state = {
            username: "",
            password: "",
            audience: "portail",
        };

        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleChange = this.handleChange.bind(this);
    }

    private handleSubmit(event: SyntheticEvent) {
        event.preventDefault();

        axios
            .post(this.props.endpoint,
                {
                    username: this.state.username,
                    password: this.state.password,
                    audience: this.state.audience,
                })
            .then(value => console.log(value))
            .catch(reason => console.log(reason));
    }

    private handleChange(event: React.FormEvent) {
        const target = event.target as HTMLInputElement;
        const value = target.value;
        const name = target.name;

        this.setState({
            [name]: value
        } as Pick<LoginState, keyof LoginState>);
    }

    render() {
        return (
            <form className="login-form" onSubmit={this.handleSubmit}>
                <label>
                    Nom d’utilisateur<br/>
                    <input name="username"
                           type="text"
                           value={this.state.username}
                           onChange={this.handleChange}/>
                </label><br/>
                <label>
                    Mot de passe<br/>
                    <input name="password"
                           type="password"
                           value={this.state.password}
                           onChange={this.handleChange}/>
                </label><br/>
                <label>
                    Audience<br/>
                    <select name="audience"
                            value={this.state.audience}
                            onChange={this.handleChange}>
                        <option value="portail">Portail</option>
                        <option value="rezal">Rézal</option>
                    </select>
                </label><br/>

                <input type="submit" value="Submit"/>
            </form>
        )
    }
}
