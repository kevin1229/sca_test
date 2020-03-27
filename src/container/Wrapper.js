import React, { Component } from 'react';
import Footer from './Footer';

import logo from '../image/login_logo_sast_saqt.png'

class Wrapper extends Component {
    render() {
        return (
                <div className="row login-wrapperBox">
                    <div className="login-box-body">
                        <form id="form">
                            <p className="logo">
                                <img src={logo} alt="" />
                            </p>
                            <p className="version">v1.0</p>
                            <div className="form-group">
                                <i className="fa fa-user"></i>
                                <input type="text" id="userId" name="userId" maxLength="40" className="form-control not-close" />
                            </div>
                            <div className="form-group">
                                <i className="fa fa-lock"></i>
                                <input type="password" id="password" name="password" maxLength="16" className="form-control not-close" />
                            </div>
                            <div className="row">
                                <div className="col-xs-12">
                                    <button name="btnLogin" type="button" className="btn btn-primary btn-block btn-fla btn-login">인증서 로그인</button>
                                </div>
                            </div>
                        </form>
                    </div>
                    <Footer />
                </div>
        )
    }
}

export default Wrapper;