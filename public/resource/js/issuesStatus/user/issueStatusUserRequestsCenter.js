$(function() {

    /***************************************************************************
     * 변수
     ***************************************************************************/
    SearchOption = function() {
        this.requestUserName = null;
        this.requestUserIds = [];
        this.fromRequestDateTime = null;
        this.toRequestDateTime = null;
        this.issueComment = null;
        this.checkerNames = [];
        this.projectIds = [];
        this.sinkFileName = null;
    };
    SearchOption.prototype = {
        clear : function() {
            this.requestUserName = null;
            this.requestUserIds = [];
            this.fromRequestDateTime = null;
            this.toRequestDateTime = null;
            this.issueComment = null;
            this.checkerNames = [];
            this.projectIds = [];
            this.sinkFileName = null;
        }
    };
    var searchOption = new SearchOption();

    var $dropdownSearchOptionIssueStatus = $('#dropdownSearchOptionIssueStatus');
    var $buttonGroupDataTableIssueStatus = $("#buttonGroupDataTableIssueStatus");

    var $modalBatchRequestCancel = $("#modalBatchRequestCancel");
    var $formIssueStatus = $(".form-right");

    /******************************************************************
     * 컴포넌트
     ******************************************************************/
    // 신청자
    $dropdownSearchOptionIssueStatus.find('[name=requestUserIds]').select2Controller({ multiple:true, url:"/api/1/users/items"});

    // 체커
    $.ajaxRest({
        url : "/api/1/checkers/name/items",
        type : "GET",
        success : function(data, textStatus, header) {
            $dropdownSearchOptionIssueStatus.find('[name=checkerNames]').select2Controller({ multiple: true, data: data});
        }
    });

    // 신청일
    $dropdownSearchOptionIssueStatus.find('[name=requestDateTime]').daterangepickerController();

    // 프로젝트
    $.ajaxRest({
        url : "/api/1/projects/items",
        type : "GET",
        success : function(data, textStatus, header) {
            $dropdownSearchOptionIssueStatus.find('[name=projectIds]').select2Controller({ multiple: true, data: data });
        }
    });

    /******************************************************************
     * 검색
     ******************************************************************/
    // 간단 검색
    $dropdownSearchOptionIssueStatus.find("[name=txtSearchShort]").on('keydown', function(e) {
        var code = e.keyCode || e.which;
        if (code == 13) { // ENTER
            searchShort();
        }
    });

    // 간단 검색
    $dropdownSearchOptionIssueStatus.find("[name=btnSearchShort]").on('click', function(e) {
        searchShort();
    });

    // 신청자로만 검색
    function searchShort() {
        searchOption.clear();
        searchOption.requestUserName = $dropdownSearchOptionIssueStatus.find("[name=txtSearchShort]").val();

        clearSearchOption();
        showSearchCondition();

        $dataTableIssueStatus.draw();
    }

    // 목록 결과 검색  드롭다운 버튼 : (목록 결과) 검색
    $dropdownSearchOptionIssueStatus.find("[name=btnSearch]").on('click', function(e) {
        searchOption.clear();
        searchOption.requestUserIds = $dropdownSearchOptionIssueStatus.find('[name=requestUserIds]').val();
        if ($.trim($dropdownSearchOptionIssueStatus.find('[name=requestDateTime]').val()) != '') {
            searchOption.fromRequestDateTime = $dropdownSearchOptionIssueStatus.find('[name=requestDateTime]').data('daterangepicker').startDate._d;
            searchOption.toRequestDateTime = $dropdownSearchOptionIssueStatus.find('[name=requestDateTime]').data('daterangepicker').endDate._d;
        }
        searchOption.issueComment = $dropdownSearchOptionIssueStatus.find('[name=issueComment]').val();
        searchOption.checkerNames = $dropdownSearchOptionIssueStatus.find('[name=checkerNames]').val();
        searchOption.projectIds = $dropdownSearchOptionIssueStatus.find('[name=projectIds]').val();
        searchOption.sinkFileName = $dropdownSearchOptionIssueStatus.find('[name=sinkFileName]').val();

        showSearchCondition();

        $dataTableIssueStatus.draw();

        $dropdownSearchOptionIssueStatus.find("[name=txtSearchShort]").val("");
        $dropdownSearchOptionIssueStatus.removeClass('open');
    });

    // 목록 결과 검색  드롭다운 버튼 : (목록 결과) 재설정
    $dropdownSearchOptionIssueStatus.find("[name=btnClear]").on('click', function(e) {
        clearSearchOption();
    });

    // 검색 옵션 클리어
    function clearSearchOption() {
        // 신청자(간단 검색용)
        $dropdownSearchOptionIssueStatus.find("[name=txtSearchShort]").val("");
        // 신청자
        $dropdownSearchOptionIssueStatus.find('[name=requestUserIds]').val("").trigger('change');
        // 신청일
        $dropdownSearchOptionIssueStatus.find('[name=requestDateTime]').val("");
        // 신청의견
        $dropdownSearchOptionIssueStatus.find('[name=issueComment]').val("");
        // 체커
        $dropdownSearchOptionIssueStatus.find('[name=checkerNames]').val("").trigger('change');
        // 프로젝트
        $dropdownSearchOptionIssueStatus.find('[name=projectIds]').val("").trigger('change');
        // 파일명
        $dropdownSearchOptionIssueStatus.find('[name=sinkFileName]').val("");
    }

    // 현재 검색 기준
    function showSearchCondition() {
        $('#searchCondition').hide();
        $('#searchCondition .searchConditionHead').hide();
        $('#searchCondition .searchCondition').text('');

        if(searchOption == null) {
            return false;
        }

        // 신청자(간단 검색용)
        if(searchOption.requestUserName != null && searchOption.requestUserName != "") {
            $('#searchCondition [name=requestUserName]').text(searchOption.requestUserName);
            $('#searchCondition [name=requestUserName]').parent().show();
            $('#searchCondition').css('display', 'inline-block');
        }

        // 신청자
        if(searchOption.requestUserIds != null && searchOption.requestUserIds != "") {
            var texts = getSelectTexts($dropdownSearchOptionIssueStatus.find("[name=requestUserIds]"), searchOption.requestUserIds);
            $('#searchCondition [name=requestUserIds]').text(texts.join(', '));
            $('#searchCondition [name=requestUserIds]').parent().show();
            $('#searchCondition').css('display', 'inline-block');
        }

        // 신청일 from
        if(searchOption.fromRequestDateTime != null && searchOption.fromRequestDateTime != "") {
            $('#searchCondition [name=fromRequestDateTime]').text(moment(new Date(searchOption.fromRequestDateTime)).format('YYYY-MM-DD HH:mm'));
            $('#searchCondition [name=fromRequestDateTime]').parent().show();
            $('#searchCondition').css('display', 'inline-block');
        }

        // 신청일 to
        if(searchOption.toRequestDateTime != null && searchOption.toRequestDateTime != "") {
            $('#searchCondition [name=toRequestDateTime]').text(moment(new Date(searchOption.toRequestDateTime)).format('YYYY-MM-DD HH:mm'));
            $('#searchCondition [name=toRequestDateTime]').parent().show();
            $('#searchCondition').css('display', 'inline-block');
        }

        // 신청의견
        if(searchOption.issueComment != null && searchOption.issueComment != "") {
            $('#searchCondition [name=issueComment]').text(searchOption.issueComment);
            $('#searchCondition [name=issueComment]').parent().show();
            $('#searchCondition').css('display', 'inline-block');
        }

        // 체커
        if(searchOption.checkerNames != null && searchOption.checkerNames != "") {
            var texts = getSelectTexts($dropdownSearchOptionIssueStatus.find("[name=checkerNames]"), searchOption.checkerNames);
            $('#searchCondition [name=checkerNames]').text(texts.join(', '));
            $('#searchCondition [name=checkerNames]').parent().show();
            $('#searchCondition').css('display', 'inline-block');
        }

        // 프로젝트
        if(searchOption.projectIds != null && searchOption.projectIds != "") {
            var texts = getSelectTexts($dropdownSearchOptionIssueStatus.find("[name=projectIds]"), searchOption.projectIds);
            $('#searchCondition [name=projectIds]').text(texts.join(', '));
            $('#searchCondition [name=projectIds]').parent().show();
            $('#searchCondition').css('display', 'inline-block');
        }

        // 파일명
        if(searchOption.sinkFileName != null && searchOption.sinkFileName != "") {
            $('#searchCondition [name=sinkFileName]').text(searchOption.sinkFileName);
            $('#searchCondition [name=sinkFileName]').parent().show();
            $('#searchCondition').css('display', 'inline-block');
        }
    }

    // Dropdown 닫기 방지 : common.js
    stopHideDropDown($dropdownSearchOptionIssueStatus);

    /***************************************************************************
     * 테이블 버튼
     ***************************************************************************/
    // 신청취소 팝업 표시
    $buttonGroupDataTableIssueStatus.find("[name=btnOpenModelRequestCancelBatch]").on('click', function(e) {
        var selectedIssueStatusIds = $dataTableIssueStatus.getSelectedIds('issueStatusId');
        if(selectedIssueStatusIds.length == 0) {
            swal({
                type: "warning",
                title: messageController.get('411008')
            });
        } else {
            var issueStatusCode = $(this).data("issueStatusCode");
            $modalBatchRequestCancel.find(".modal-title").text(messageController.get("item.issue.status." + issueStatusCode));
            $modalBatchRequestCancel.find("[name=issueStatusCode]").val(issueStatusCode);
            $modalBatchRequestCancel.modal("show");
        }
    });

    /***************************************************************************
     * 테이블 표시
     ***************************************************************************/
    var selectedIssueStatusId = null;
    var $dataTableIssueStatus = $("#dataTableIssueStatus").dataTableController({
        url : "/api/1/issueStatus/user/requests",
        searchOption : searchOption,
        buttonGroupId: "buttonGroupDataTableIssueStatus",
        order : [ [ 3, 'desc' ] ],
        columnDefs: [ {
            targets : 0,
            orderable: false,
            className: 'select-checkbox',
            defaultContent : ""
        }, {
            targets : 1, // ID
            visible : false,
            data: "issueStatusId",
            className : "dt-head-right"
        }, {
            targets : 2, // 신청자
            data: "requestUserName",
            render : function(data, type, row) {
                if (data == null)
                    return row.requestUserId;
                return data.escapeHTML() + "(" + row.requestUserId + ")";
            }
        }, {
            targets : 3, // 신청일
            data : "requestDateTime",
            className : "dt-head-center",
            render: function(data, type, row) {
                return momentController.timestampFormat(data, 'YYYY-MM-DD HH:mm:ss');
            }
        }, {
            targets : 4, // 제외신청의견
            data : "issueComment",
            render : function(data, type, row) {
                if(data == null) {
                    return "";
                }
                var text = data.escapeHTML();
                return '<div title="' + text + '" data-toggle="tooltip" data-container="body" class="ellipsis" style="width: 300px">' + text + '</div>';
            }
        }, {
            targets : 5, // 프로젝트명
            data : "projectName",
            render : function(data, type, row) {
                return '<div title="' + messageController.get("label.project.key") + ' : '  + row.projectKey + '" data-toggle="tooltip" data-container="body" class="ellipsis" style="width: 200px">' + data.escapeHTML() + '</div>';
            }
        }, {
            targets : 6, // 이슈 상태 공유 여부
            data : "sharingYn",
            className : "dt-head-center",
            visible: false,
            render : function(data, type, row) {
                return messageController.get("item.issue.status.group.sharing." + data);
            }
        }, {
            targets : 7, // 이슈 ID
            data : "issueId",
            className : "dt-head-right",
            render : function(data, type, row) {
                if(data == null) {
                    return "-";
                }
                return data;
            }
        },{
            targets : 8, // 체커
            data : "checkerName",
            render : function(data, type, row) {
                var checkerName = "";
                if(data != null) {
                    checkerName = data;
                }  else {
                    checkerName = row.checkerKey;
                }
                return '<div class="ellipsis" data-toggle="tooltip" data-container="body" title="' + checkerName + '" style="width: 200px">' + checkerName + '</div>';
            }
        }, {
            targets : 9, // 파일명
            data : "sinkFileName",
            render : function(data, type, row) {
                return '<div title="' + data + '" data-toggle="tooltip" data-container="body" class="ellipsis" style="width: 200px">' + data + '</div>';
            }
        }, {
            targets : 10, // 라인
            visible : false,
            data : "sinkLine",
            className : "dt-head-right",
            render : function(data, type, row) {
                return data
            }
        }],
        createdRow : function(row, data, index) {
            var $row = $(row);

            $row.on("click", function(e) {
                if(e.target.className.indexOf('select-checkbox') == -1
                        && e.target.className.indexOf('extend-button') == -1) {

                    if ( $row.hasClass('row-selected') ) {
                        $row.removeClass('row-selected');

                        // 감추기
                        issueStatusRight.hide();

                        selectedIssueStatusId = null;
                    } else {
                        $row.parent().find('tr.row-selected').removeClass('row-selected');
                        $row.addClass('row-selected');

                        // 이슈 및 상태 정보
                        issueStatusRight.showIssueStatus(data.issueStatusId);
                        // 중복 이슈
                        issueStatusRight.showDuplicatedIssue(data.issueId);

                        selectedIssueStatusId = data.issueStatusId;
                    }
                }
            });

            if(selectedIssueStatusId == data.issueStatusId) {
                $row.addClass('row-selected');
            }
        }
    });

    /***************************************************************************
     * 모달
     ***************************************************************************/
    // 일괄 신청취소 버튼
    $modalBatchRequestCancel.find("[name=btnBatchRequestCancel]").on("click", function() {
        swal({
            title: messageController.get('confirm.issue.1'),
            type: "warning",
            showCancelButton: true,
            confirmButtonClass: "btn-warning",
            confirmButtonText: messageController.get('label.request.cancel'),
            cancelButtonText: messageController.get('label.close'),
            closeOnConfirm: true,
        }, function(isConfirm) {
            if (isConfirm) {
                var requestBody = {};

                if ($dataTableIssueStatus.isAllSelected()) {
                    requestBody.searchOption = searchOption;
                } else {
                    var issueStatusIds = $dataTableIssueStatus.getSelectedIds('issueStatusId');
                    if (typeof (issueStatusIds) == 'undefined' || issueStatusIds.constructor != Array) {
                        return;
                    }
                    requestBody.ids = issueStatusIds
                }

                requestBody.data = {};
                requestBody.data.statusCode = $modalBatchRequestCancel.find("[name=issueStatusCode]").val();
                requestBody.data.issueComment = $modalBatchRequestCancel.find("[name=issueComment]").val();

                $.ajaxRest({
                    url : "/api/1/issueStatus/user/requests",
                    type : "PUT",
                    data : requestBody,
                    block : true,
                    beforeSend : function(xhr, settings) {
                        errorMsgHandler.clear($modalBatchRequestCancel);
                    },
                    success : function(data, status, header) {
                        $modalBatchRequestCancel.find("[name=issueComment]").val("");
                        $modalBatchRequestCancel.modal("hide");

                        $dataTableIssueStatus.draw();
                        issueStatusRight.hide();

                        $.toastGreen({
                            text: messageController.get("label.issue.status.info") + ' ' + messageController.get("label.has.been.modified")
                        });
                    },
                    error : function(hdr, status) {
                        errorMsgHandler.show($modalBatchRequestCancel, hdr.responseText);
                    }
                });
            }
        });
    });

    /**
     * 현재 검색 결과 초기화 이벤트
     */
    $('#searchOptionClear').click(function () {
        clearSearchOption();
        $('button[name=btnSearch]').trigger('click');
    });

    $('[aria-controls=dataTableIssueStatus]').on('click', function(e) {
        var $dropdownMenu = $(this).parent().find('.dt-button-collection.dropdown-menu');
        $dropdownMenu.position().left = $dropdownMenu.position().left - 110;
        $dropdownMenu.css('left', $dropdownMenu.position().left - 110);
    });
});

var selectedIssueStatusId = null;