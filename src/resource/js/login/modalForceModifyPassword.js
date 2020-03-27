$(function() {

    var $modalForceModifyPassword = $("#modalForceModifyPassword");
    var $password1 = $modalForceModifyPassword.find("[name=password1]");
    var $password2 = $modalForceModifyPassword.find("[name=password2]");

    // 수정
    function modify() {
        var requestBody = {};
        requestBody.password1 = $modalForceModifyPassword.find("[name=password1]").val();
        requestBody.password2 = $modalForceModifyPassword.find("[name=password2]").val();
        requestBody.userId = $("#userId").val();
        requestBody.password = $("#password").val();

        $.ajaxRest({
            url: "/api/1/login/password",
            type: "PUT",
            data: requestBody,
            block: true,
            beforeSend: function(xhr, settings) {
                errorMsgHandler.clear($modalForceModifyPassword);
            },
            success: function(data, textStatus, jqXHR) {
                $("#password").val(requestBody.password1);
                login(false);
            },
            error: function(hdr, status) {
                errorMsgHandler.show($modalForceModifyPassword, hdr.responseText);
            }
        });

    }

    // 패스워드1 입력란 엔터
    $password1.on('keydown', function(e) {
        var code = e.keyCode || e.which;
        if (code == 13) { // ENTER
            if ($password2.val().trim() == "") {
                $password2.focus();
            } else {
                modify();
            }
        }
    });

    // 패스워드2 입력란 엔터
    $password2.on('keydown', function(e) {
        var code = e.keyCode || e.which;
        if (code == 13) { // ENTER
            if ($password1.val().trim().length == 0) {
                $password1.focus();
            } else {
                modify();
            }
        }
    });

    // 저장
    $modalForceModifyPassword.find("[name=btnModify]").on("click", function(){
        modify();
    });

});