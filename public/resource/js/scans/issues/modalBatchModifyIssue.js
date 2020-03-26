
$(function() {

    (function($, window) {

        var ModalBatchModifyIssue = (function() {

            var $dataTableIssue = null;
            var $searchOption = null;
            var selectedIssueIds = null;

            var $modalBatchModifyIssue = null;

            function ModalBatchModifyIssue(element, options) {

                /*************************************************************************
                 * 변수
                 *************************************************************************/
                $modalBatchModifyIssue = $(element);

                var scanId = $("#scanId").val();

                /*************************************************************************
                 * 컴포넌트
                 *************************************************************************/

                // 이슈 상태
                $modalBatchModifyIssue.find("[name=statusCode]").on("change", function(){
                    var statusCode = $(this).val();
                    if (statusCode == "ER") {
                        // 제외 신청
                        $modalBatchModifyIssue.find("[data-name=divResponseUserIds]").show();
                    } else {
                        $modalBatchModifyIssue.find("[data-name=divResponseUserIds]").hide();
                    }
                });


                // 승인자
                if ($modalBatchModifyIssue.find("select[name=responseUserId]").length > 0) {
                    $.ajaxRest({
                        url : "/api/1/scans/" + scanId + "/manager/items",
                        type : "GET",
                        success : function (data, textStatus, jqXHR) {
                            $modalBatchModifyIssue.find("select[name=responseUserId]").select2Controller({
                                data : data,
                                allowClear : true,
                                placeholder : messageController.get('label.unselect')
                            });
                        },
                        error : function(hdr, status) {
                            errorMsgHandler.swal(hdr.responseText);
                        }
                    });
                }

                // 이슈 담당자
                $modalBatchModifyIssue.find("[name=issueUserId]").select2Controller({
                    url:"/api/1/users/items",
                    allowClear : true,
                    placeholder : messageController.get('label.unselect')
                });

                /*************************************************************************
                 * 이벤트
                 *************************************************************************/
                // Status code 버튼 이벤트
                $modalBatchModifyIssue.find(".statusCode").on("click", function(e) {

                    if($(e.target).hasClass('disabled')) {
                        e.stopPropagation();
                        e.preventDefault();
                        return;
                    }
                    // 전체 이슈 상태 선택 초기화
                    $modalBatchModifyIssue.find(':radio[name=statusCode]').removeAttr('checked');
                    // 선택 이슈 상태 변경
                    $(this).find(':radio[name=statusCode]').attr('checked', 'checked');
                });


                /**
                 * 이슈 상태 정보 일괄 저장
                 */
                $modalBatchModifyIssue.find('[name=btnBatchModify]').on('click', function(e) {

                    var $dataTableIssues = $("#dataTableIssues").dataTableController();

                    var requestBody = {};

                    // ids 체크
                    var selectedIds = $dataTableIssues.getSelectedIds('issueId');
                    if (typeof(selectedIds) == 'undefined' || selectedIds.constructor != Array) {
                        return;
                    }
                    if($dataTableIssues.isAllSelected()) {
                        requestBody.searchOption = $dataTableIssues.getOptions().searchOption;
                    } else {
                        requestBody.ids = selectedIds;
                    }

                    requestBody.data = {};

                    var isModify = false;
                    // 이슈 상태 변경
                    if ($modalBatchModifyIssue.find('[name=chkIssueStatus]').is(':checked')) {
                        if($modalBatchModifyIssue.find(':radio[name=statusCode][checked=checked]').val() == undefined) {
                            swal({
                                type: "warning",
                                title: messageController.get("411024") // 411024=이슈 상태를 선택해주세요.
                            });
                            return;
                        }

                        // 이슈 상태
                        requestBody.data.statusCode = $modalBatchModifyIssue.find(':radio[name=statusCode][checked=checked]').val();

                        // 제외 승인 담당자
                        requestBody.data.responseUserIds = [];
                        $modalBatchModifyIssue.find("[name=responseUserId]").each(function(index, item) {
                            requestBody.data.responseUserIds.push($(item).val());
                        });

                        isModify = true;
                    }

                    if ($modalBatchModifyIssue.find('[name=chkIssueComment]').is(':checked')) {
                        // 이슈 의견
                        requestBody.data.issueComment = $modalBatchModifyIssue.find("[name=issueComment]").val();
                        isModify = true;
                    }

                    if ($modalBatchModifyIssue.find('[name=chkOwner]').is(':checked')) {
                        // 이슈 담당자
                        requestBody.data.issueUserId = $modalBatchModifyIssue.find("[name=issueUserId]").val();
                        if (requestBody.data.issueUserId == null) {
                            requestBody.data.issueUserId = "";
                        }
                        isModify = true;
                    }

                    // 체크된 항목 없으면 알림
                    if (isModify == false){
                        swal(messageController.get('400025'));
                        return false;
                    }

                    $.ajaxRest({
                        url: "/api/1/issues/status",
                        type: "PUT",
                        data: requestBody,
                        block: true,
                        beforeSend : function(xhr, settings) {
                            errorMsgHandler.clear($modalBatchModifyIssue);
                        },
                        success: function (data, status, header) {
                            searchIssues();

                            $.toastGreen({
                                heading: messageController.get("label.issue.status.info"),
                                text: messageController.get("411009")
                            });
                            $modalBatchModifyIssue.modal("hide");
                        },
                        error: function (hdr, status) {
//                            $.toastRed({
//                                heading: messageController.get("label.issue.status.info"),
//                                text: hdr.responseJSON[0].message
//                            });

                            //errorMsgHandler.show($modalBatchModifyIssue, errors);

                            errorMsgHandler.show($modalBatchModifyIssue, hdr.responseText);
                        }
                    });

                });
            }

            ModalBatchModifyIssue.prototype.clearModal = function() {

                // 에러 메세지 제거
                errorMsgHandler.clear($modalBatchModifyIssue);

                // 일괄 수정 : 체크 박스 초기화
                $modalBatchModifyIssue.find(".checkbox input[type=checkbox]").prop('checked', false);
                $modalBatchModifyIssue.find("[data-name=divResponseUserIds]").hide();

                // 이슈 상태
                $modalBatchModifyIssue.find('.statusCode').removeClass('active');

                // 이슈 의견
                $modalBatchModifyIssue.find("[name=issueComment]").val("");

                // 의슈 담당자
                $modalBatchModifyIssue.find("[name=issueUserId]").val("").trigger('change');
            }

            // 이슈 일괄 수정 버튼 눌렸을 때
            ModalBatchModifyIssue.prototype.openModelIssueBatchModify = function(issueIds, searchOption) {

                if (issueIds.length == 0) {
                    swal(messageController.get('405011'));
                    return;
                }

                // 선택한 프로젝트
                selectedIssueIds = issueIds;

                $searchOption = searchOption;

                modalBatchModifyIssue.clearModal();
                $modalBatchModifyIssue.modal("show");
            }

            // 프로젝트 데이터 테이블 설정
            ModalBatchModifyIssue.prototype.setDataTableProjects = function(dataTableProjects) {
                $dataTableIssue = dataTableProjects;
            }

            return ModalBatchModifyIssue;
        })();

        $.fn.modalBatchModifyIssue = function() {

            var $this = $(this);
            var data = $this.data("modalBatchModifyIssue");

            //data가  없으면 Default로 새로 생성
            if (!data) {
                $this.data('modalBatchModifyIssue', data = new ModalBatchModifyIssue(this, arguments[0]));
            }

            return data;
        }

    })(window.jQuery, window);

    modalBatchModifyIssue = $("#modalBatchModifyIssue").modalBatchModifyIssue();
});

var modalBatchModifyIssue = null;