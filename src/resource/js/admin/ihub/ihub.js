$(function() {

    var $formIhub = $("#formIhub");

    $.ajaxRest({
        url : "/api/1/ihub/setting",
        type : "GET",
        success : function(data, textStatus, header) {
            if(data.enable){
                $formIhub.find("[name=enable]").bootstrapToggle('on');
            } else {
                $formIhub.find("[name=enable]").bootstrapToggle('off');
            }
            $formIhub.find('[name=serverUrl]').val(data.serverUrl);
            $formIhub.find('[name=toolId]').val(data.toolId);
            $formIhub.find('[name=toolPw]').val(data.toolPw);
        },
        error : function(hdr, status) {
            errorMsgHandler.swal(hdr.responseText);
        }
    });


    $formIhub.find('[name=btnHealth]').on('click', function(e) {
        var requestBody = {};
        requestBody.serverUrl = $formIhub.find('[name=serverUrl]').val();
        requestBody.toolId = $formIhub.find('[name=toolId]').val();
        requestBody.toolPw = $formIhub.find('[name=toolPw]').val();

        $.ajaxRest({
            url : "/api/1/ihub/health",
            type : "POST",
            data : requestBody,
            beforeSend : function(xhr, settings) {
                errorMsgHandler.clear($formIhub);
                swal({
                    title: messageController.get('info.common.9'),
                    text: messageController.get('info.common.10'),
                    html: "<i class='fa fa-circle-o-notch fa-spin fa-3x fa-fw'></i>",
                    showCancelButton: false,
                    showConfirmButton: false,
                    allowOutsideClick: false,
                    allowEscapeKey: false,
                    closeOnCancel: false,
                    closeOnConfirm: false
                });
            },
            success : function(data, textStatus, header) {
                swal({
                    title: messageController.get('400043'),
                    type: "success",
                    closeOnCancel: true
                });
            },
            error : function(hdr, status) {
                errorMsgHandler.show($formIhub, hdr.responseText);
            }
        });
    });

    $formIhub.find('[name=btnSave]').on('click', function(e) {
        var requestBody = {};
        requestBody.enable = $formIhub.find("[name=enable]").prop('checked');
        requestBody.serverUrl = $formIhub.find('[name=serverUrl]').val();
        requestBody.toolId = $formIhub.find('[name=toolId]').val();
        requestBody.toolPw = $formIhub.find('[name=toolPw]').val();

        $.ajaxRest({
            url : "/api/1/ihub/setting",
            type : "PUT",
            data : requestBody,
            block: true,
            beforeSend : function(xhr, settings) {
                errorMsgHandler.clear($formIhub);
            },
            success : function(data, textStatus, header) {
                $.toastGreen({
                    text: messageController.get('400017')
                });
            },
            error : function(hdr, status) {
                errorMsgHandler.show($formIhub, hdr.responseText);
            }
        });
    });

});