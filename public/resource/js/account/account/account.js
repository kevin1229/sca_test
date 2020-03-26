$(function() {

    var $formAccount = $("#formAccount");

    // 계정 정보 가져오기
    $.ajaxRest({
        url : "/api/1/account",
        type : "GET",
        success : function(data, textStatus, header) {
            $formAccount.find('[name=userName]').val(data.userName);
            $formAccount.find('[name=email]').val(data.email)

            $formAccount.show();
        },
        error : function(hdr, status) {
            errorMsgHandler.swal(hdr.responseText);
        }
    });

    // 계정 정보 수정하기
    $formAccount.find('[name=btnSave]').on('click', function(e) {
        var requestData = {};
        requestData.userName = $formAccount.find('[name=userName]').val();
        requestData.email = $formAccount.find('[name=email]').val();

        $.ajaxRest({
            url: "/api/1/account",
            type: "PUT",
            data: requestData,
            block: true,
            beforeSend : function(xhr, settings) {
                errorMsgHandler.clear($formAccount);
            },
            success : function(data, textStatus, header) {
                sessionUserController.reload();
                $("#topUserName").text(data.userName);
                $.toastGreen({
                    text: messageController.get("label.setting.account") + ' ' + messageController.get("label.has.been.modified")
                });
            },
            error : function(hdr, status) {
                errorMsgHandler.show($tabAccount, hdr.responseText);
            }
        });
    });

});
