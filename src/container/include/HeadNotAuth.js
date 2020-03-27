import React from 'react';
import { Helmet } from "react-helmet";
import styleLogin from '../../resource/css/login.css';
import materialIcons from '../../resource/lib/material-design-icons-2.2.0/iconfont/material-icons.css';
import jqueryUiMin from '../../resource/lib/jquery-ui/jquery-ui.min.css' ;
import select2Min from '../../resource/lib/select2/css/select2.min.css'; 
import bootstrapMin from '../../resource/lib/bootstrap/css/bootstrap.min.css'; 
//import admingLTEMin from '../../resource/lib/adminLte/dist/css/AdminLTE.min.css'; 
import sweetAlert2 from '../../resource/lib/sweetalert2/dist/sweetalert2.css'; 
import fileInputMin from '../../resource/lib/bootstrap-fileinput/css/fileinput.min.css';
import jqueryToast from '../../resource/lib/jquery-toast/jquery.toast.css'; 
import fonAwesomeMin from '../../resource/lib/adminLte/plugins/font-awesome/css/font-awesome.min.css'; 
import skinLight from '../../resource/css/skin-light.css'; 
import baseLayout from '../../resource/css/base-layout.css';
import sweetAlertCustom from '../../resource/css/sweet-alert-custom.css'; 
import modal from '../../resource/css/modal.css'; 

import shortcutIcon from '../../resource/favicon.ico';

class HeadNotAuth extends React.Component {
    render() {
        return (
            <Helmet>
                <title>Sparrow SCA v1.0</title>
                <meta http-equiv="X-UA-Compatible" content="IE=Edge" />
                <meta content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" name="viewport" />
            </Helmet>
        )
    }
}

export default HeadNotAuth;