$(function() {

    /***************************************************************************
     * 변수
     ***************************************************************************/
    SearchOption = function() {
        this.requestUserName = null;
        this.responseUserIds = [];
        this.fromResponseDateTime = null;
        this.toResponseDateTime = null;
        this.responseComment = null;
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
            this.responseUserIds = [];
            this.fromResponseDateTime = null;
            this.toResponseDateTime = null;
            this.responseComment = null;
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
    var $formIssueStatus = $(".form-right");

    /******************************************************************
     * 컴포넌트
     ******************************************************************/
    // 신청자
    $dropdownSearchOptionIssueStatus.find('[name=requestUserIds]').select2Controller({ multiple:true, url:"/api/1/users/items"});

    // 처리자
    $dropdownSearchOptionIssueStatus.find('[name=responseUserIds]').select2Controller({ multiple:true, url:"/api/1/users/items"});

    // 체커
    $.ajaxRest({
        url: "/api/1/checkers/name/items",
        type: "GET",
        success: function(data, textStatus, header) {
            $dropdownSearchOptionIssueStatus.find('[name=checkerNames]').select2Controller({ multiple: true, data: data });
        }
    });

    // 신청일
    $dropdownSearchOptionIssueStatus.find('[name=responseDateTime]').daterangepickerController();
    $dropdownSearchOptionIssueStatus.find('[name=requestDateTime]').daterangepickerController();

    // 이슈상태
    $.ajaxRest({
        url: "/api/1/issueStatus/results/items",
        type: "GET",
        success: function(data, textStatus, header) {
            $dropdownSearchOptionIssueStatus.find('[name=statusCodes]').select2Controller({  multiple: true, data: data });
        }
    });

    // 프로젝트
    $.ajaxRest({
        url : "/api/1/projects/items",
        type : "GET",
        success : function(data, textStatus, header) {
            var selection = $dropdownSearchOptionIssueStatus.find('[name=projectIds]').select2Controller({ multiple: true, data : data });
        }
    });

    /******************************************************************
     * 검색
     ******************************************************************/
    // 간단 검색 : 검색어 입력 필드 이벤트
    $dropdownSearchOptionIssueStatus.find("[name=txtSearchShort]").on('keydown', function(e) {
        var code = e.keyCode || e.which;
        if (code == 13) { // ENTER
            searchShort();
        }
    });

    // 간단 검색 : 파일명 검색(돋보기) 버튼 이벤트
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

    // 목록 결과 검색 드롭다운 버튼 : (목록 결과) 검색
    $dropdownSearchOptionIssueStatus.find("[name=btnSearch]").on('click', function(e) {
        searchOption.clear();

        // 처리
        searchOption.responseUserIds = $dropdownSearchOptionIssueStatus.find('[name=responseUserIds]').val();
        if ($.trim($dropdownSearchOptionIssueStatus.find('[name=responseDateTime]').val()) != '') {
            searchOption.fromResponseDateTime = $dropdownSearchOptionIssueStatus.find('[name=responseDateTime]').data('daterangepicker').startDate._d;
            searchOption.toResponseDateTime = $dropdownSearchOptionIssueStatus.find('[name=responseDateTime]').data('daterangepicker').endDate._d;
        }
        searchOption.responseComment = $dropdownSearchOptionIssueStatus.find('[name=responseComment]').val();

        // 신청
        searchOption.requestUserIds = $dropdownSearchOptionIssueStatus.find('[name=requestUserIds]').val();
        if ($.trim($dropdownSearchOptionIssueStatus.find('[name=requestDateTime]').val()) != '') {
            searchOption.fromRequestDateTime = $dropdownSearchOptionIssueStatus.find('[name=requestDateTime]').data('daterangepicker').startDate._d;
            searchOption.toRequestDateTime = $dropdownSearchOptionIssueStatus.find('[name=requestDateTime]').data('daterangepicker').endDate._d;
        }
        searchOption.issueComment = $dropdownSearchOptionIssueStatus.find('[name=issueComment]').val();

        searchOption.checkerNames = $dropdownSearchOptionIssueStatus.find('[name=checkerNames]').val();
        searchOption.statusCodes = $dropdownSearchOptionIssueStatus.find('[name=statusCodes]').val();
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

        // 처리자
        $dropdownSearchOptionIssueStatus.find('[name=responseUserIds]').val("").trigger('change');
        // 처리일
        $dropdownSearchOptionIssueStatus.find('[name=responseDateTime]').val("");
        // 처리 의견
        $dropdownSearchOptionIssueStatus.find('[name=responseComment]').val("");

        // 신청자
        $dropdownSearchOptionIssueStatus.find('[name=requestUserIds]').val("").trigger('change');
        // 신청일
        $dropdownSearchOptionIssueStatus.find('[name=requestDateTime]').val("");
        // 신청의견
        $dropdownSearchOptionIssueStatus.find('[name=issueComment]').val("");

        // 체커
        $dropdownSearchOptionIssueStatus.find('[name=checkerNames]').val("").trigger('change');
        // 이슈 상태
        $dropdownSearchOptionIssueStatus.find('[name=statusCodes]').val("").trigger('change');
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

        // 처리자
        if(searchOption.responseUserIds != null && searchOption.responseUserIds != "") {
            var texts = getSelectTexts($dropdownSearchOptionIssueStatus.find("[name=responseUserIds]"), searchOption.responseUserIds);
            $('#searchCondition [name=responseUserIds]').text(texts.join(', '));
            $('#searchCondition [name=responseUserIds]').parent().show();
            $('#searchCondition').css('display', 'inline-block');
        }

        // 처리 일시 to
        if(searchOption.toResponseDateTime != null && searchOption.toResponseDateTime != "") {
            $('#searchCondition [name=toResponseDateTime]').text(moment(new Date(searchOption.toResponseDateTime)).format('YYYY-MM-DD HH:mm'));
            $('#searchCondition [name=toResponseDateTime]').parent().show();
            $('#searchCondition').css('display', 'inline-block');
        }

        // 처리 일시 from
        if(searchOption.fromResponseDateTime != null && searchOption.fromResponseDateTime != "") {
            $('#searchCondition [name=fromResponseDateTime]').text(moment(new Date(searchOption.fromResponseDateTime)).format('YYYY-MM-DD HH:mm'));
            $('#searchCondition [name=fromResponseDateTime]').parent().show();
            $('#searchCondition').css('display', 'inline-block');
        }

        // 처리 의견
        if(searchOption.responseComment != null && searchOption.responseComment != "") {
            $('#searchCondition [name=responseComment]').text(searchOption.responseComment);
            $('#searchCondition [name=responseComment]').parent().show();
            $('#searchCondition').css('display', 'inline-block');
        }

        // 신청자
        if(searchOption.requestUserIds != null && searchOption.requestUserIds != "") {
            var texts = getSelectTexts($dropdownSearchOptionIssueStatus.find("[name=requestUserIds]"), searchOption.requestUserIds);
            $('#searchCondition [name=requestUserIds]').text(texts.join(', '));
            $('#searchCondition [name=requestUserIds]').parent().show();
            $('#searchCondition').css('display', 'inline-block');
        }

        // 신청 일시 to
        if(searchOption.toRequestDateTime != null && searchOption.toRequestDateTime != "") {
            $('#searchCondition [name=toRequestDateTime]').text(moment(new Date(searchOption.toRequestDateTime)).format('YYYY-MM-DD HH:mm'));
            $('#searchCondition [name=toRequestDateTime]').parent().show();
            $('#searchCondition').css('display', 'inline-block');
        }

        // 신청 일시 from
        if(searchOption.fromRequestDateTime != null && searchOption.fromRequestDateTime != "") {
            $('#searchCondition [name=fromRequestDateTime]').text(moment(new Date(searchOption.fromRequestDateTime)).format('YYYY-MM-DD HH:mm'));
            $('#searchCondition [name=froRequestmDateTime]').parent().show();
            $('#searchCondition').css('display', 'inline-block');
        }

        // 신청 의견
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

        // 이슈 상태
        if(searchOption.statusCodes != null && searchOption.statusCodes != "") {
            var texts = getSelectTexts($dropdownSearchOptionIssueStatus.find("[name=statusCodes]"), searchOption.statusCodes);
            $('#searchCondition [name=statusCodes]').text(texts.join(', '));
            $('#searchCondition [name=statusCodes]').parent().show();
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
     * 테이블 표시
     ***************************************************************************/
    var selectedIssueStatusId = null;
    var $dataTableIssueStatus = $("#dataTableIssueStatus").dataTableController({
        url : "/api/1/issueStatus/user/results",
        searchOption : searchOption,
        buttonGroupId: "buttonGroupDataTableScans",
        order : [ [ 2, 'desc' ] ],
        columnDefs : [ {
            targets : 0, // ID
            visible: false,
            data : "issueStatusId",
            className : "dt-head-right"
        }, {
            targets : 1, // 이슈 상태
            data : "statusCode",
            className : "dt-head-center",
            render : function(data, type, row) {
                var text = null;
                if (row.statusCode) {
                    text = messageController.get("item.issue.status." + row.statusCode)
                } else {
                    text = messageController.get("item.issue.status.NA");
                }
                return text;
            }
        }, {
            targets : 2, // 처리 일시
            data : "lastIssueStatusResponse",
            sortKey : "responseDateTime",
            className : "dt-head-center",
            render : function(data, type, row) {
                return momentController.timestampFormat(data.responseDateTime, 'YYYY-MM-DD HH:mm:ss');
            }
        }, {
            targets : 3, // 처리자
            data : "lastIssueStatusResponse",
            sortKey : "responseUserName",
            render : function(data, type, row) {
                if (data.responseUserName == null)
                    return data.responseUserId;
                return data.responseUserName.escapeHTML() + "(" + data.responseUserId + ")";
            }
        }, {
            targets : 4, // 처리 의견
            data : "lastIssueStatusResponse",
            sortKey : "responseComment",
            render : function(data, type, row) {
                if(data.responseComment == null) {
                    return "";
                }
                var text = data.responseComment.escapeHTML();
                return '<div title="' + text + '" data-toggle="tooltip" data-container="body" class="ellipsis" style="width: 300px">' + text + '</div>';
            }
        }, {
            targets : 5, // 신청일
            visible : false,
            data : "requestDateTime",
            className : "dt-head-center",
            render: function(data, type, row) {
                return momentController.timestampFormat(data, 'YYYY-MM-DD HH:mm:ss');
            }
        }, {
            targets : 6, // 신청자
            data : "requestUserName",
            render : function(data, type, row) {
                if (data == null)
                    return row.requestUserId;
                return data.escapeHTML() + "(" + row.requestUserId + ")";
            }
        }, {
            targets : 7, // 신청 의견
            data: "issueComment",
            render : function(data, type, full) {
                if(data == null) {
                    return "";
                }
                var text = data.escapeHTML();
                return '<div title="' + text + '" data-toggle="tooltip" data-container="body" class="ellipsis" style="width: 300px">' + text + '</div>';
            }
        }, {
            targets : 8, // 프로젝트명
            data : "projectName",
            render : function(data, type, row) {
                return '<div title="' + messageController.get("label.project.key") + ' : '  + row.projectKey + '" data-toggle="tooltip" data-container="body" class="ellipsis" style="width: 200px">' + data.escapeHTML() + '</div>';
            }
        }, {
            targets : 9, // 이슈 상태 공유 여부
            data : "sharingYn",
            className : "dt-head-center",
            visible: false,
            render : function(data, type, row) {
                return messageController.get("item.issue.status.group.sharing." + data);
            }
        }, {
            targets : 10, // 이슈 ID
            visible : false,
            data : "issueId",
            className : "dt-head-right",
            render : function(data, type, row) {
                if(data == null) {
                    return "-";
                }
                return data;
            }
        },{
            targets : 11, // 위험도
            data : "risk",
            render : function(data, type, row) {
                if(data == null) {
                    return "-";
                }
                return messageController.get("item.checker.risk.level." +  data);
            }
        },{
            targets : 12, // 체커
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
            targets : 13, // 파일명
            data : "sinkFileName",
            render : function(data, type, row) {
                if(data == null) {
                    return "-";
                }
                return '<div title="' + data + '" data-toggle="tooltip" data-container="body" class="ellipsis" style="width: 200px">' + data + '</div>';
            }
        }, {
            targets : 14, // 라인
            visible : false,
            data : "sinkLine",
            className : "dt-head-right",
            render : function(data, type, row) {
                if(data == null) {
                    return "-";
                }
                return data
            }
        }],
        createdRow : function (row, data, index) {

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
