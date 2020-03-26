import React from 'react';
import './login.css'

function App() {
  return <div class="wrapper" >

             <div class="row login-wrapperBox">

                 <div class="login-box-body">
               
                     <form id="form">
                         <p class="logo">
                              <img src={require('./image/login_logo_sast_saqt.png')}/>
                         </p>
                         <p class="version">
                              v1.0
                         </p>
                         <div class="form-group">
                             <i class="fa fa-user"></i>
                             <input type="text" id="userId" name="userId" maxlength="40" class="form-control not-close"/>
                         </div>
                         <div class="form-group">
                             <i class="fa fa-lock"></i>
                             <input type="password" id="password" name="password" maxlength="16" class="form-control not-close"/>
                         </div>
                         <div class="row">
                             <div class="col-xs-12">
                                 <button name="btnLogin" type="button" class="btn btn-primary btn-block btn-fla btn-login">인증서 로그인</button>

                             </div>
                         </div>
                     </form>
                  </div>
              </div>
          </div>;
}

export default App;
