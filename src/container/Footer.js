import React, { Component } from 'react';
import bi from '../image/logo_sparrow_bi.png';

class Footer extends Component {
    render() {
        return (
            <div className="login-box-footer">
                <img src={bi} height="26" width="94" alt="" />
                <p className="desc"> 
                    (C) 2007-2020 Sparrow Co., Ltd. All rights reserved.
                </p>
            </div>
        )
    }
}

export default Footer;