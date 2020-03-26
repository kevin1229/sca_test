$(function() {

    /***********************************************************************
     * 초기 탭 설정
     ***********************************************************************/
    initTab("paths");

    /***********************************************************************
     * 공통
     ***********************************************************************/
    var $tabPaths = $("#tabPaths");
    var $tabFuncs = $("#tabFuncs");

    // 제외경로, 제외함수 가져오기
    $.ajaxRest({
        url : "/api/1/admin/globalExcludedTarget",
        type : "GET",
        success : function (data, textStatus, header) {
            $tabPaths.find('[name=paths]').val(data.paths);
            $tabFuncs.find('[name=funcs]').val(data.funcs);
        }
    });

    /***********************************************************************
     * 경로
     ***********************************************************************/
    // path 저장하기
    $tabPaths.find('[name=btnSave]').on('click', function(e) {
        swal({
            title : messageController.get('confirm.common.1'),
            text : messageController.get('info.common.2'),
            type : "warning",
            showCancelButton : true,
            confirmButtonText : messageController.get('label.ok'),
            cancelButtonText : messageController.get('label.cancel'),
            closeOnConfirm : true
        }, function(isConfirm) {
            if (isConfirm) {
                var requestBody = {}
                requestBody.paths = $tabPaths.find('[name=paths]').val()

                $.ajaxRest({
                    url: "/api/1/admin/globalExcludedTarget/paths",
                    data: requestBody,
                    type: "PUT",
                    block: true,
                    beforeSend: function(xhr, settings) {
                        errorMsgHandler.clear($tabPaths);
                    },
                    success: function (data, textStatus, header) {
                        $.toastGreen({
                            text: messageController.get("label.all.exclusion.from.analyses") + ' ' + messageController.get("label.exclude.path") + ' ' + messageController.get("label.has.been.modified")
                        });
                    },
                    error: function(hdr, status) {
                        errorMsgHandler.show($tabPaths, hdr.responseText);
                    }
                });
                return;
            }
        });
    });

    // path 기본값으로 변경
    $tabPaths.find('[name=btnDefault]').on('click', function(e) {
        $.ajaxRest({
            url: "/api/1/admin/globalExcludedTarget/paths/default",
            type: "GET",
            success: function (data, textStatus, header) {
                $tabPaths.find('[name=paths]').val(data.paths);
            }
        });
    });

    /***********************************************************************
     * 함수
     ***********************************************************************/
    // func 저장하기
    $tabFuncs.find('[name=btnSave]').on('click', function(e) {
        swal({
            title : messageController.get('confirm.common.1'),
            text : messageController.get('info.common.2'),
            type : "warning",
            showCancelButton : true,
            confirmButtonText : messageController.get('label.ok'),
            cancelButtonText : messageController.get('label.cancel'),
            closeOnConfirm : true
        }, function(isConfirm) {
            if (isConfirm) {

                var requestBody = {};
                requestBody.funcs = $tabFuncs.find('[name=funcs]').val()

                $.ajaxRest({
                    url : "/api/1/admin/globalExcludedTarget/funcs",
                    data : requestBody,
                    type : "PUT",
                    block : true,
                    beforeSend : function(xhr, settings) {
                        errorMsgHandler.clear($tabFuncs);
                    },
                    success : function (data, textStatus, header) {
                        $.toastGreen({
                            text: messageController.get("label.all.exclusion.from.analyses") + ' ' + messageController.get("label.exclude.function") + ' ' + messageController.get("label.has.been.modified")
                        });
                    },
                    error : function(hdr, status) {
                        errorMsgHandler.show($tabFuncs, hdr.responseText);
                    }
                });
            }
        });
    });

    // func 기본값으로 변경
    $tabFuncs.find('[name=btnDefault]').on('click', function(e) {
        $.ajaxRest({
            url : "/api/1/admin/globalExcludedTarget/funcs/default",
            type : "GET",
            block: true,
            success : function (data, textStatus, header) {
                $tabFuncs.find('[name=funcs]').val(data.funcs);
            }
        });
    });
});