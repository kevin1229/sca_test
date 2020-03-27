import React, { Component } from 'react';
import HeadNotAuth from "./include/HeadNotAuth";
import Wrapper from './Wrapper';
import Footer from './Footer';

class Login extends Component {
    render() {
        return (
            <div id="wrapper">
                <HeadNotAuth />
                <Wrapper />
            </div>
        )
    }
}

export default Login;