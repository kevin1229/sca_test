$(function() {

    var $modalLicense = $("#modalLicense");

    var mode = 1;

    var init = false;
    $modalLicense.on('shown.bs.modal', function() {
        // 모달 창이 처음 열렸을 경우 설정
        if (init == false) {
            init = true;

            // 저장
            $modalLicense.find("[name=btnSave]").on("click", function(e) {
                // 라이선스 키 버전
                var requestBody = {};
                requestBody.key = $modalLicense.find('[name=key]').val();

                $.ajaxRest({
                    url: "/api/1/license/update/key",
                    type: "POST",
                    data: requestBody,
                    block: true,
                    beforeSend: function(xhr, settings) {
                        errorMsgHandler.clear($modalLicense);
                    },
                    success: function (data, status, header) {
                        $modalLicense.hide();
                        swal({
                            html: messageController.get('402219'),
                            confirmButtonText : messageController.get('label.ok')
                        }, function (isConfirm) {
                            if(isConfirm) {
                                location.reload();
                            }
                        });
                    },
                    error: function(hdr, status) {
                        errorMsgHandler.show($modalLicense, hdr.responseText);
                    }
                });
            });
        }
    });

});