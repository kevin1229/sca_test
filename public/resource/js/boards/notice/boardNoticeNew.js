$(function() {

    $("#liMenuNotice").addClass("active");

    /***************************************************************************
     * 변수
     ***************************************************************************/
    var $formNotice = $("#formNotice");
    var $attachNotice = $("#attachNotice");

    var editor = new Editor("div[data-name=content]");

    var requestBody = {};

    /***************************************************************************
     * 함수
     ***************************************************************************/
    function addNotice() {
        requestBody.attachFiles = getAttachFiles();
        if (requestBody.attachFiles.length == 0)
            requestBody.attachFiles = null;

        $.ajaxRest({
            url : "/api/1/boards/notice/0",
            type : "POST",
            data : requestBody,
            block : true,
            success : function(data, textStatus, header) {
                location.href = "/boards/notice/" + data.noticeId;
            },
            error : function(hdr, status) {
                errorMsgHandler.show($formNotice, hdr.responseText);
            }
        });
    }

    /***************************************************************************
     * 컴포넌트
     ***************************************************************************/
    // 상태
    $.ajaxRest({
        url : "/api/1/boards/notice/status/items",
        type : "GET",
        success : function(data, textStatus, header) {
            $("select[name=statusCode]").select2Controller({data : data, minimumResultsForSearch: Infinity});
        }
    });

    // 첨부 파일
    makeFileInput($attachNotice, addNotice);

    /***************************************************************************
     * 버튼
     ***************************************************************************/
    $formNotice.find("[name=btnCancel]").on("click", function() {
        swal({
            title : messageController.get('confirm.common.3'),
            type : "warning",
            showCancelButton : true,
            confirmButtonClass : "btn-danger",
            confirmButtonText : messageController.get('label.ok'),
            cancelButtonText : messageController.get('label.cancel'),
            closeOnConfirm: false,
            closeOnCancel: true
        }, function (isConfirm) {
            if (isConfirm) {
                history.back();
            }
        });
    });

    $formNotice.find("[name=btnOk]").on("click", function() {
        requestBody.subject = $formNotice.find("[name=subject]").val();
        requestBody.statusCode = $formNotice.find("[name=statusCode]").val();
        var $popupYn = $formNotice.find('[name=popupYn]');
        if ($popupYn.length > 0) {
            requestBody.popupYn = $popupYn.prop('checked') ? "Y" : "N";
        } else {
            requestBody.popupYn = null;
        }
        requestBody.content = editor.get();

        if ($attachNotice.fileinput("getFilesCount") > 0) {
            // 아직 첨부하지 않은 첨부파일이 있다면 valid먼저 체크 후 업로드 진행
            $.ajaxRest({
                url : "/api/1/boards/notice/validate",
                type : "POST",
                data : requestBody,
                block : true,
                success : function(data, textStatus, header) {
                    $attachNotice.fileinput("upload"); // 전체 업로드 진행 후 콜백
                },
                error : function(hdr, status) {
                    errorMsgHandler.show($formNotice, hdr.responseText);
                }
            });
        } else {
            addNotice();
        }
    });

});