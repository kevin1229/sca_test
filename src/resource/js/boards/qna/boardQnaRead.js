$(function() {

    $("#liMenuQna").addClass("active");

    /***************************************************************************
     * 변수
     ***************************************************************************/
    var qnaId = $("#qnaId").val();
    var $replyList = $("[data-name=replyList]");

    var replyEditor = null;
    var replyModifyEditor = null;

    var tplReply = $("[data-name=tplReply]").clone().html();
    var tplReplyReply = $("[data-name=tplReplyReply]").clone().html();
    var tplReplyReplyNew = $("[data-name=tplReplyReplyNew]").clone().html();

    /***************************************************************************
     * 함수
     ***************************************************************************/
    function loadReplys() {
        // 댓글 표시
        $.ajaxRest({
            url : "/api/1/boards/qna/" + qnaId + "/reply",
            type : "GET",
            beforeSend : function(xhr, settings) {
                $replyList.text("");
            },
            success : function(data, textStatus, header) {
                var totalCount = 0;
                if (data.totalCount > 0) {

                    // 대댓글은 따로 분리해둠
                    var replyReplyMap = new CustomMap();
                    var replyReplyList = null;
                    for (var i in data.list) {
                        if (data.list[i].parentId != null) {
                            replyReplyList = replyReplyMap.get(data.list[i].parentId);
                            if (replyReplyList == null) {
                                replyReplyList = [];
                            }
                            replyReplyList.push(data.list[i]);
                            replyReplyMap.put(data.list[i].parentId, replyReplyList);
                        }
                    }

                    // 댓글 표시
                    for (var i in data.list) {
                        if (data.list[i].parentId == null) {
                            if (data.list[i].content != null) {

                                var $replyContent = $(tplReply.compose({
                                    replyId: data.list[i].qnaReplyId,
                                    user : data.list[i].userName == null? data.list[i].userId : data.list[i].userName.escapeHTML() + "(" + data.list[i].userId + ")",
                                    updateDateTime : momentController.timestampFormat(data.list[i].updateDateTime, 'YYYY-MM-DD HH:mm:ss'),
                                    content : data.list[i].content
                                }));

                                if (data.list[i].userId != sessionUserController.getUser().userId) {
                                    $replyContent.find("[data-name=replyBtns] [name=btnReplyModify]").parent().remove();
                                }
                                if (sessionUserController.isAdmin() == false && data.list[i].userId != sessionUserController.getUser().userId) {
                                    $replyContent.find("[data-name=replyBtns] [name=btnReplyDelete]").parent().remove();
                                }

                                $replyList.append($replyContent);
                                totalCount++;

                            } else {
                                // 삭제된 댓글인 경우
                                var $deleteReply = $(tplReply.compose({
                                    replyId: data.list[i].qnaReplyId,
                                    user : "",
                                    updateDateTime : momentController.timestampFormat(data.list[i].updateDateTime, 'YYYY-MM-DD HH:mm:ss'),
                                    content : "<span class='deleted'>" + messageController.get("info.board.3") + "<span>"
                                }));
                                $deleteReply.find("[data-name=replyBtns]").remove();
                                $deleteReply.find("[data-name=replyUpdateBtns]").remove();
                                $replyList.append($deleteReply);
                            }

                            // 대댓글 표시
                            replyReplyList = replyReplyMap.get(data.list[i].qnaReplyId);
                            if (replyReplyList != null) {
                                for (var j in replyReplyList) {

                                    var $replyReplyContent = $(tplReplyReply.compose({
                                        replyId: replyReplyList[j].qnaReplyId,
                                        parentId: replyReplyList[j].parentId,
                                        user : replyReplyList[j].userName == null? replyReplyList[j].userId : replyReplyList[j].userName.escapeHTML() + "(" + replyReplyList[j].userId + ")",
                                        updateDateTime : momentController.timestampFormat(replyReplyList[j].updateDateTime, 'YYYY-MM-DD HH:mm:ss'),
                                        content : replyReplyList[j].content,
                                        parentId : replyReplyList[j].parentId
                                    }));

                                    if (replyReplyList[j].userId != sessionUserController.getUser().userId) {
                                        $replyReplyContent.find("[data-name=replyBtns] [name=btnReplyModify]").parent().remove();
                                    }
                                    if (sessionUserController.isAdmin() == false && replyReplyList[j].userId != sessionUserController.getUser().userId) {
                                        $replyReplyContent.find("[data-name=replyBtns] [name=btnReplyDelete]").parent().remove();
                                    }

                                    $replyList.append($replyReplyContent);
                                    totalCount++;
                                }
                            }
                        }
                    }
                }
                $("[data-name=replyCount]").text(messageController.get("label.reply").replace("{0}", totalCount));
                $("[data-name=replyInput]").show();
                $("[data-name=replyBtns]").show();
            }
        });
        replyEditor = new Editor("[data-name=replyNewContent]", null, 120);
        replyEditor.clear();
    }

    /***************************************************************************
     * 정보 표시
     ***************************************************************************/
    // 첨부파일 다운로드 표시
    $.ajaxRest({
        url : "/api/1/boards/qna/" + qnaId + "/attach",
        type : "GET",
        success : function(data, textStatus, header) {
            var tplAttachedFile = $("[data-name=tplAttachedFile]").clone().html();
            var $attachedFiles = $("[data-name=attachedFiles]");

            for (var i in data) {
                var qnaAttach = data[i];
                var attachedFile = tplAttachedFile.compose({
                    qnaAttachId: qnaAttach.qnaAttachId,
                    qnaId: qnaAttach.qnaId,
                    fileName: qnaAttach.fileName,
                    fileSize: getDisplaySize(qnaAttach.fileSize)
                });
                $attachedFiles.append(attachedFile);
            }
        }
    });

    // 내용 로딩
    $.ajaxRest({
        url : "/api/1/boards/qna/" + qnaId,
        type : "GET",
        success : function(data, textStatus, header) {
            if (data == null)
                return;

            var subject = data.subject;
            if (subject.length > 30) {
                subject = "<span title='" + subject.escapeHTML() + "'>" + subject.substring(0, 30).escapeHTML() + " ..</span>";
            } else {
                subject = subject.escapeHTML();
            }
            $(".breadcrumb span[data-name=subject]").html(subject);

            $(".board span[data-name=subject]").text(data.subject);
            $("span[data-name=content]").html(data.content);
            $("span[data-name=user]").text(data.userName == null? data.userId : data.userName + "(" + data.userId + ")");

            var $qnaStatus = $("span[data-name=qnaStatus]");
            $qnaStatus.text(messageController.get("item.board.qna.status." + data.statusCode));
            $qnaStatus.attr("data-statusCode", data.statusCode);
            if (data.statusCode == "C") {
                $qnaStatus.addClass("label-board-qna-status-complete");
            } else if (data.statusCode == "R") {
                $qnaStatus.addClass("label-board-qna-status-request");
            } else if (data.statusCode == "E") {
                $qnaStatus.addClass("label-board-qna-status-etc");
            }
            if ((data.statusCode == "C" || data.statusCode == "R") && sessionUserController.isAdmin()) {
                $qnaStatus.on("click", function() {
                    var requestBody = {};
                    requestBody.qnaId = qnaId;
                    var statusCode = $qnaStatus.attr("data-statusCode");
                    if (statusCode == "R") {
                        requestBody.statusCode = "C";
                    } else if (statusCode == "C") {
                        requestBody.statusCode = "R";
                    } else {
                        return;
                    }

                    $.ajaxRest({
                        url : "/api/1/boards/qna/" + qnaId + "/status",
                        type : "PUT",
                        data : requestBody,
                        block : true,
                        success : function(data, textStatus, header) {
                            if (data.statusCode == "R") {
                                $qnaStatus.addClass("label-board-qna-status-request")
                                $qnaStatus.removeClass("label-board-qna-status-complete");
                                $qnaStatus.attr("data-statusCode", "R");
                                $qnaStatus.text(messageController.get("item.board.qna.status.R"));
                            } else if (data.statusCode == "C") {
                                $qnaStatus.removeClass("label-board-qna-status-request")
                                $qnaStatus.addClass("label-board-qna-status-complete");
                                $qnaStatus.attr("data-statusCode", "C");
                                $qnaStatus.text(messageController.get("item.board.qna.status.C"));
                            }
                        },
                        error : function(hdr, status) {
                            errorMsgHandler.swal(hdr.responseText);
                        }
                    });
                });
            }
            if (data.privateYn == "Y") {
                $("span[data-name=privateYn]").show();
            }
            $("span[data-name=updateDateTime]").text(momentController.timestampFormat(data.updateDateTime, 'YYYY-MM-DD HH:mm:ss'));
            $("span[data-name=viewCount]").text(Number(data.viewCount).format());
        }
    });

    // 댓글 표시
    loadReplys();

    /***************************************************************************
     * 버튼
     ***************************************************************************/
    $("button[name=btnQna]").on("click", function() {
        location.href = "/boards/qna";
    });

    $("button[name=btnQnaNew]").on("click", function() {
        location.href = "/boards/qna/new";
    });

    $("button[name=btnQnaModify]").on("click", function() {
        location.href = "/boards/qna/" + qnaId + "/modify";
    });

    $("button[name=btnQnaDelete]").on("click", function() {
        swal({
            title: messageController.get("confirm.common.2"),
            type : "warning",
            showCancelButton : true,
            confirmButtonClass : "btn-danger",
            confirmButtonText : messageController.get('label.delete'),
            cancelButtonText : messageController.get('label.cancel'),
            closeOnConfirm: false,
            closeOnCancel: true
        }, function(isConfirm) {
            if (isConfirm) {
                $.ajaxRest({
                    url : "/api/1/boards/qna/" + qnaId,
                    type : "DELETE",
                    block : true,
                    success : function(data, textStatus, header) {
                        location.href = "/boards/qna";
                    }
                });
            }
        });
    });

    $("[name=btnQnaNewReply]").on("click", function() {
        var content = replyEditor.get();
        if (content == null || content.trim().length == 0) {
            swal({
                title: messageController.get("info.board.2"),
                confirmButtonText : messageController.get('label.ok'),
                type : "warning"
            });
            return;
        }

        $.ajaxRest({
            url : "/api/1/boards/qna/" + qnaId + "/reply",
            type : "POST",
            data : { content: content },
            block : true,
            success : function(data, textStatus, header) {
                if (data) {
                    loadReplys();
                }
            }
        });
    });

    $("[name=btnScrollTop]").on("click", function() {
        $(".scrollbar-outer").scrollTo(0);
    });

    $replyList.on("click", "[name=btnReplyDelete]", function() {
        var $thisObj = $(this);
        var $reply = $thisObj.parent().parent().parent().parent();
        var qnaReplyId = $reply.attr("data-replyId");
        if (qnaReplyId == null) {
            // 대댓글 삭제하는 경우
            $reply = $thisObj.parent().parent().parent().parent().parent().parent().parent().parent();
            qnaReplyId = $reply.attr("data-replyId");
        }

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
                $.ajaxRest({
                    url : "/api/1/boards/qna/" + qnaId + "/reply/" + qnaReplyId,
                    type : "DELETE",
                    block : true,
                    success : function(data, textStatus, header) {
                        loadReplys();
                    }
                });
            }
        });
    });

    $replyList.on("click", "[name=btnReplyModify]", function() {
        var $thisObj = $(this);
        var $reply = $thisObj.parent().parent().parent().parent();
        var qnaReplyId = $reply.attr("data-replyId");
        if (qnaReplyId == null) {
            // 대댓글 수정하려는 경우
            $reply = $thisObj.parent().parent().parent().parent().parent().parent().parent().parent();
            qnaReplyId = $reply.attr("data-replyId");
        }

        $("[data-name=replyInput]").hide();
        $("[data-name=replyBtns]").hide();

        replyModifyEditor = new Editor("[data-name=replyContent" + qnaReplyId + "]", null, 120);
        $reply.find("[data-name=replyUpdateBtns]").show();
    });


    $replyList.on("click", "[name=btnReplyModifyCancel]", function() {
        // 댓글 수정 취소
        swal({
            title: messageController.get("confirm.board.1"),
            type : "warning",
            showCancelButton : true,
            confirmButtonClass : "btn-danger",
            confirmButtonText : messageController.get('label.ok'),
            cancelButtonText : messageController.get('label.cancel'),
            closeOnConfirm: true,
            closeOnCancel: true
        }, function(isConfirm) {
            if (isConfirm) {
                loadReplys();
            }
        });
    });

    $replyList.on("click", "[name=btnReplyModifyConfirm]", function() {
        var $thisObj = $(this);
        var $reply = $thisObj.parent().parent();
        var qnaReplyId = $reply.attr("data-replyId");
        if (qnaReplyId == null) {
            // 대댓글 수정하려는 경우
            $reply = $thisObj.parent().parent().parent().parent().parent().parent();
            qnaReplyId = $reply.attr("data-replyId");
        }

        var content = replyModifyEditor.get();
        if (content == null || content.trim().length == 0) {
            swal({
                title: messageController.get("info.board.2"),
                confirmButtonText : messageController.get('label.ok'),
                type : "warning"
            });
            return;
        }

        var requestBody = {};
        requestBody.qnaReplyId = qnaReplyId;
        requestBody.content = content;

        $.ajaxRest({
            url : "/api/1/boards/qna/" + qnaId + "/reply/" + qnaReplyId,
            data : requestBody,
            type : "PUT",
            block : true,
            success : function(data, textStatus, header) {
                if (data != null) {
                    $("[data-name=replyInput]").show();
                    $("[data-name=replyBtns]").show();
                    $reply.find("[data-name=replyUpdateBtns]").hide();
                    replyModifyEditor.destroy();
                    $reply.find("[data-name=updateDateTime]").text(momentController.timestampFormat(data.updateDateTime, 'YYYY-MM-DD HH:mm:ss'));
                }
            }
        });
    });

    // 답글
    $replyList.on("click", "[name=btnReplyReply]", function() {
        $("[data-name=replyInput]").hide();
        $("[data-name=replyBtns]").hide();

        var $thisObj = $(this);
        var $reply = $thisObj.parent().parent().parent().parent();
        var qnaReplyId = $reply.attr("data-replyId");

        if (qnaReplyId == null) {
            // 대댓글에서 대댓글을 클릭한 경우
            $reply = $thisObj.parent().parent().parent().parent().parent().parent().parent().parent();
            qnaReplyId = $reply.attr("data-parentId");
        }

        var replyReplyNew = tplReplyReplyNew.compose({
            parentId : qnaReplyId
        });

        $reply.after(replyReplyNew);
        replyEditor = new Editor("[data-name=replyReplyContent" + qnaReplyId + "]", null, 120);
    });

    // 답글 입력 취소
    $replyList.on("click", "[name=btnReplyReplyCancel]", function() {
        var content = replyEditor.get();
        if (content == null || content.trim().length == 0) {
            loadReplys();
            return;
        }

        swal({
            title: messageController.get("confirm.board.2"),
            type : "warning",
            showCancelButton : true,
            confirmButtonClass : "btn-danger",
            closeOnConfirm: true,
            closeOnCancel: true
        }, function(isConfirm) {
            if (isConfirm) {
                loadReplys();
            }
        });
    });

    // 답글 등록
    $replyList.on("click", "[name=btnReplyReplyConfirm]", function() {

        var content = replyEditor.get();
        if (content == null || content.trim().length == 0) {
            swal({
                title: messageController.get("info.board.2"),
                confirmButtonText : messageController.get('label.ok'),
                type : "warning"
            });
            return;
        }

        var requestBody = {};
        requestBody.parentId = $(this).attr("data-parentId");
        requestBody.content = content;

        $.ajaxRest({
            url : "/api/1/boards/qna/" + qnaId + "/reply",
            type : "POST",
            data : requestBody,
            block : true,
            success : function(data, textStatus, header) {
                if (data) {
                    loadReplys();
                }
            }
        });
    });


});