$(function() {

    $("#liMenuQna").addClass("active");

    /***************************************************************************
     * 변수
     ***************************************************************************/
    var qnaId = $("#qnaId").val();
    var addMaxFileCount = defaultMaxFileCount; // 더 추가할 수 있는 최대 첨부 파일 개수

    var $formQna = $("#formQna");
    var $attachQna = $("#attachQna");

    var editor = null;
    var requestBody = {}
    requestBody.deleteAttachIds = [];

    /***************************************************************************
     * 함수
     ***************************************************************************/
    function modifyQna() {
        requestBody.attachFiles = getAttachFiles();
        if (requestBody.attachFiles.length == 0)
            requestBody.attachFiles = null;
        if (requestBody.deleteAttachIds.length == 0)
            requestBody.deleteAttachIds = [];

        $.ajaxRest({
            url : "/api/1/boards/qna/" + qnaId,
            type : "PUT",
            data : requestBody,
            block : true,
            success : function(data, textStatus, header) {
                location.href = "/boards/qna/" + qnaId;
            },
            error : function(hdr, status) {
                errorMsgHandler.show($formQna, hdr.responseText);
            }
        });
    }


    /***************************************************************************
     * 컴포넌트
     ***************************************************************************/
    var rests = [];

    // 상태
    rests[0] = $.ajaxRest({
        url : "/api/1/boards/qna/status/items",
        type : "GET",
        success : function(data, textStatus, header) {
            $formQna.find("[name=statusCode]").select2Controller({data : data, minimumResultsForSearch: Infinity});
        }
    });

    // 첨부 파일
    makeFileInput($attachQna, modifyQna, addMaxFileCount);

    /***************************************************************************
     * 정보 표시
     ***************************************************************************/
    // 기존 첨부 파일
    $.ajaxRest({
        url : "/api/1/boards/qna/" + qnaId + "/attach",
        type : "GET",
        success : function(data, textStatus, header) {
            var tplBoardAttachFileDelete = $("div[data-name=tplBoardAttachFileDelete]").clone().html();
            var $attachedFilesDelete = $("div[data-name=attachedFilesDelete]");

            addMaxFileCount = addMaxFileCount - data.length;
            if (data.length == 0) {
                $attachedFilesDelete.append("-");
            } else {
                for (var i in data) {
                    var attachQna = data[i];
                    var attachedFileDelete = tplBoardAttachFileDelete.compose({
                        attachId: attachQna.qnaAttachId,
                        fileName: attachQna.fileName,
                        fileSize: getDisplaySize(attachQna.fileSize)
                    });
                    $attachedFilesDelete.append(attachedFileDelete);
                }
            }

            $attachedFilesDelete.find("[name=btnDeleteAttachedFile]").on("click", function() {
                var $this = $(this);
                swal({
                    title: messageController.get("confirm.common.2"),
                    type : "warning",
                    showCancelButton : true,
                    confirmButtonClass : "btn-danger",
                    confirmButtonText : messageController.get('label.delete'),
                    cancelButtonText : messageController.get('label.cancel'),
                    closeOnConfirm: true,
                    closeOnCancel: true
                }, function(isConfirm) {
                    if (isConfirm) {
                        // 첨부파일 삭제를 선택하면 삭제할 첨부파일 아이디를 저장한다.
                        requestBody.deleteAttachIds.push($this.data("attachId"));
                        $this.parent().remove();
                        addMaxFileCount = addMaxFileCount + 1;
                        updateFileInput($attachQna, addMaxFileCount);
                    }
                });
            });


        }
    });

    // 내용 표시
    $.when(rests[0]).done(function() {
        $.ajaxRest({
            url : "/api/1/boards/qna/" + qnaId,
            type : "GET",
            success : function(data, textStatus, header) {
                var subject = data.subject;
                if (subject.length > 30) {
                    subject = "<span title='" + subject.escapeHTML() + "'>" + subject.substring(0, 30).escapeHTML() + " ..</span>";
                } else {
                    subject = subject.escapeHTML();
                }
                $(".breadcrumb span[data-name=subject]").html(subject);
                $(".board span[data-name=subject]").text(data.subject);

                $formQna.find("[name=subject]").val(data.subject);
                $formQna.find("[name=statusCode]").val(data.statusCode).trigger("change");
                $formQna.find('[name=privateYn]').prop('checked', data.privateYn == "Y");
                editor = new Editor("div[data-name=content]", data.content);

                $formQna.show();
            }
        });
    });

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
                location.href = "/boards/qna/" + qnaId;
            }
        });
    });

    $formQna.find("[name=btnOk]").on("click", function() {
        requestBody.subject = $("input[name=subject]").val();
        requestBody.statusCode = $("select[name=statusCode]").val();
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
            modifyQna();
        }
    });
});