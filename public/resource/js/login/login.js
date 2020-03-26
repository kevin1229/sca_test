
var login = null;

$(function() {

    sessionUserController.clear();

    var $form = $("#form");

    var $userId = $("#userId");
    var $password = $("#password");

    $userId.attr('placeholder', messageController.get("label.user.id"));
    $password.attr('placeholder', messageController.get("label.password"));

    // 라이선스
    $.ajaxRest({
        url: "/api/1/license/check",
        type: "GET",
        success: function(data, textStatus, header) {
            if (data.check == false) {
                // 모달 정보 표시
                var $modalLicense = $("#modalLicense");
                $modalLicense.find("#errorLicense").text(data.errorMessage);
                $modalLicense.find("#systemId").text(data.systemId);

                $modalLicense.modal('show');
                $modalLicense.find('.cmd-mode').hide();
                $modalLicense.find('.cmd-mode.license-add').show();
            }
        }
    });

    // 로그인
    login = function(force) {

        var requestBody = {};
        requestBody.userId = $userId.val();

        if ($password.val().trim().length > 0)
            requestBody.password = ":" + btoa(":" + $password.val());
        requestBody.force = force;

        $.ajaxRest({
            url: "/api/1/login",
            type: "POST",
            data: requestBody,
            block: true,
            beforeSend: function(xhr, settings) {
                $form.find("#errors").text("");
                errorMsgHandler.clear($form);
            },
            success: function(data, textStatus, jqXHR) {

                sessionUserController.reload();

                var redirectUrl = data.redirectUrl;

                if (data.modifyPassword === true) {
                    if (location.pathname == redirectUrl) {
                        if (location.hash != null) {
                            redirectUrl = location.pathname + location.hash;
                        } else {
                            redirectUrl = location.pathname;
                        }
                        redirectUrl = "/login/modifyPassword?nextUrl=" + encodeURIComponent(redirectUrl);
                    } else {
                        redirectUrl = "/login/modifyPassword";
                    }
                }

                if (location.pathname == redirectUrl || redirectUrl == null) {
                    location.reload();
                } else {
                    location.href = redirectUrl;
                }
            },
            error: function(hdr, status) {
                var error = JSON.parse(hdr.responseText);

                if (error[0].field == "userId" || error[0].field == "password") {
                    errorMsgHandler.show($form, hdr.responseText);
                } else if (error[0].code == "401011") {
                    // 중복 로그인
                    swal({
                        title : error[0].message,
                        type : "warning",
                        showCancelButton : true,
                        confirmButtonClass : "btn-danger",
                        confirmButtonText : messageController.get('label.ok'),
                        cancelButtonText : messageController.get('label.cancel'),
                        closeOnConfirm: false,
                        closeOnCancel: true
                    }, function(isConfirm) {
                        if (isConfirm) {
                            login(true);
                        }
                    });
                } else if (error[0].code == "401012") {
                    // 강제로 비밀번호를 변경해야 경우
                    $("#modalForceModifyPassword").modal('show');
                } else {
                    // 데이터베이스 접속을 실패했습니다.
                    $form.find("#errors").text(error[0].message);
                }
            }
        });
    }

    // 아이디 입력란 엔터
    $userId.on('keydown', function(e) {
        var code = e.keyCode || e.which;
        if (code == 13) { // ENTER
            if ($password.val().trim() == "") {
                $password.focus();
            } else {
                login(false);
            }
        }
    });

    // 패스워드 입력란 엔터
    $password.on('keydown', function(e) {
        var code = e.keyCode || e.which;
        if (code == 13) { // ENTER
            if ($userId.val().trim().length == 0) {
                $userId.focus();
            } else {
                login(false);
            }
        }
    });

    // 로그인 버튼
    $("[name=btnLogin]").on("click", function() {
        login(false);
    });

});