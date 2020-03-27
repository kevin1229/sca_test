$(function() {

    $("#liMenuQna").addClass("active");

    /***************************************************************************
     * 변수
     ***************************************************************************/
    var $formQna = $("#formQna");
    var $attachQna = $("#attachQna");
    var editor = new Editor("div[data-name=content]");

    var requestBody = {};

    /***************************************************************************
     * 함수
     ***************************************************************************/
    function addQna() {
        requestBody.attachFiles = getAttachFiles();
        if (requestBody.attachFiles.length == 0)
            requestBody.attachFiles = null;

        $.ajaxRest({
            url : "/api/1/boards/qna/0",
            type : "POST",
            data : requestBody,
            block : true,
            success : function(data, textStatus, header) {
                location.href = "/boards/qna/" + data.qnaId;
            },
            error : function(hdr, status) {
                errorMsgHandler.show($formQna, hdr.responseText);
            }
        });
    }



    /***************************************************************************
     * 컴포넌트
     ***************************************************************************/
    // 상태
    $.ajaxRest({
        url : "/api/1/boards/qna/status/items",
        type : "GET",
        success : function(data, textStatus, header) {
            $formQna.find("[name=statusCode]").select2Controller({data : data, minimumResultsForSearch: Infinity});
        }
    });

    // 첨부 파일
    makeFileInput($attachQna, addQna);

    /***************************************************************************
     * 버튼
     ***************************************************************************/
    $formQna.find("[name=btnCancel]").on("click", function() {
        swal({
            title : messageController.get('confirm.common.3'),
            type : "warning",
            showCancelButton : true,
            confirmButtonClass : "btn-danger",
            confirmButtonText : messageController.get('label.ok'),
            cancelButtonText : messageController.get('label.cancel'),
            closeOnConfirm: false,
            closeOnCancel: true
        }, function(isConfirm) {
            if (isConfirm) {
                history.back();
            }
        });
    });

    $formQna.find("[name=btnOk]").on("click", function() {
        requestBody.subject = $formQna.find("[name=subject]").val();
        requestBody.statusCode = $formQna.find("[name=statusCode]").val();
        requestBody.privateYn = $formQna.find('[name=privateYn]').prop('checked') ? "Y" : "N";
        requestBody.content = editor.get();

        if ($attachQna.fileinput("getFilesCount") > 0) {
            // 아직 첨부하지 않은 첨부파일이 있다면 valid먼저 체크 후 업로드 진행
            $.ajaxRest({
                url : "/api/1/boards/qna/validate",
                type : "POST",
                data : requestBody,
                block : true,
                success : function(data, textStatus, header) {
                    $attachQna.fileinput("upload"); // 전체 업로드 진행 후 콜백
                },
                error : function(hdr, status) {
                    errorMsgHandler.show($formQna, hdr.responseText);
                }
            });
        } else {
            addQna();
        }
    });

});