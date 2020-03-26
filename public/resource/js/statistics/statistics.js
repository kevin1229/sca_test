$(function() {

    /***************************************************************************
     * 변수
     ***************************************************************************/
    SearchOption = function() {
        this.projectIds = [];
        this.userIds = null;
        this.fromDateTime = null;
        this.toDateTime = null;
        this.includeChildren = null;
        this.checkerItemId = null;
        this.latestScanOnly = null;
        this.hideEmptyRow = null;
        this.hideEmptyIssueRow = null;
    };
    SearchOption.prototype = {
        clear : function() {
            this.projectIds = [];
            this.userIds = null;
            this.fromDateTime = null;
            this.toDateTime = null;
            this.includeChildren = null;
            this.checkerItemId = null;
            this.latestScanOnly = null;
            this.hideEmptyRow = null;
            this.hideEmptyIssueRow = null;
        }
    };
    var searchOption = new SearchOption();


    var statsType = 'P';  // P: 프로젝트, U: 사용자, C: 체커

    var $collapseStatsCondition = $("#collapseStatsCondition");

    var $dataTableWrapper = $("#dataTableWrapperProjects, #dataTableWrapperUsers, #dataTableWrapperCheckers");
    var $dataTableWrapperProjects = $("#dataTableWrapperProjects");
    var $dataTableWrapperUsers = $("#dataTableWrapperUsers");
    var $dataTableWrapperCheckers = $("#dataTableWrapperCheckers");
    var $dataTableStatsProjects = null;
    var $dataTableStatsUser = null;
    var $dataTableStatsCheckers = null;

    /******************************************************************
     * 컴포넌트
     ******************************************************************/
    // 항목
    $collapseStatsCondition.find('[name=statsTypeRadio]').on("change", function(){}, function() {
        changeStatsType($(this).val());
    });
    changeStatsType(statsType);

    // 프로젝트 트리
    $collapseStatsCondition.find("[name=statsProjectTree]").dropdownFancytreeController({
        ajax : {
            url : "/api/1/projects/fancytree"
        }
    });

    // 사용자
    $collapseStatsCondition.find("[name=statsUsers]").select2Controller({ multiple:true, url:"/api/1/users/items"});

    // 기간
    $collapseStatsCondition.find("[name=statsDate]").daterangepickerController({
        locale: {
            format: 'YYYY-MM-DD'
        },
        timePicker: false,
        alwaysShowCalendars: true
    });
    $collapseStatsCondition.find("[name=statsDate]").daterangepickerController().setStartEndDate(moment().subtract(6, 'days'), moment());

    // 보여줄 항목(위험도, 체커 카테고리, 체커 타입, 레퍼런스)
    $.ajaxRest({
        url : "/api/1/stats/group/items",
        type : "GET",
        success : function(data, textStatus, header) {
            $collapseStatsCondition.find("[name=checkerItemId]").select2({
                placeholder : messageController.get("info.common.6"),
                data : data,
                allowClear: true,
                closeOnSelect: false
            });
            var firstValue = $collapseStatsCondition.find('[name=checkerItemId] option:first-child').val();
            $collapseStatsCondition.find('[name=checkerItemId]').val(firstValue).trigger('change');
        }
    });

    /******************************************************************
     * 검색
     ******************************************************************/
    // 조회
    $collapseStatsCondition.find("[name=btnSearch]").on('click', function(){

        statsType = $collapseStatsCondition.find('[name=statsTypeRadio]:checked').val();

        searchOption.clear();

        // 기간
        if ($.trim($collapseStatsCondition.find('[name=statsDate]').val()) != '') {
            searchOption.fromDateTime = $collapseStatsCondition.find('[name=statsDate]').data('daterangepicker').startDate._d.getTime();
            searchOption.toDateTime = $collapseStatsCondition.find('[name=statsDate]').data('daterangepicker').endDate._d.getTime();
        }

        // 프로젝트
        var selNodes = $collapseStatsCondition.find('[name=statsProjectTree]').dropdownFancytreeController('getTree').getSelectedNodes();
        if(selNodes!= null && selNodes.length > 0) {
            searchOption.projectIds = [];
        }
        selNodes.forEach(function(node) {
            searchOption.projectIds.push(node.key);
        });

        // 하위프로젝트 결과
        searchOption.includeChildren = $collapseStatsCondition.find('[name=includeChildren]:checked').val() == 'Y';

        // 사용자
        searchOption.userIds = $collapseStatsCondition.find('[name=statsUsers]').val();

        // 통계
        searchOption.checkerItemId = $collapseStatsCondition.find('[name=checkerItemId]').val();

        // 데이터 유형 , 표시 옵션
        searchOption.latestScanOnly = $collapseStatsCondition.find('[name=latestScanOnly]:checked').val() == 'Y';
        searchOption.hideEmptyRow = $collapseStatsCondition.find('[name=hideEmptyRow]:checked').val() != 'Y';
        searchOption.hideEmptyIssueRow = $collapseStatsCondition.find('[name=hideEmptyIssueRow]:checked').val() != 'Y';

        // 테이블 표시
        drawDataTable();
    });

    stopHideDropDown();


    // 항목에 따른 화면 적용
    function changeStatsType(currentType) {

        // show all
        $collapseStatsCondition.find('.form-group').show();

        // hide by statsType
        if (currentType == 'P') { // 프로젝트
            $($collapseStatsCondition.find('[name=checkBoxHideEmptyRow]').parent().find('label')[0]).text(messageController.get("label.stats.hide.empty.project.row"));
            $($collapseStatsCondition.find('.form-group')[2]).hide(); // 대상 사용자
            $($collapseStatsCondition.find('.form-group')[6]).hide(); // 보여줄 항목
            $($collapseStatsCondition.find('.form-group')[8]).hide(); // 옵션
            $collapseStatsCondition.find('[name=checkBoxHideEmptyRow]').prop('checked', false);
        } else if (currentType == 'U') { // 분석자
            $($collapseStatsCondition.find('[name=checkBoxHideEmptyRow]').parent().find('label')[0]).text(messageController.get("label.stats.hide.empty.user.row"));
            $($collapseStatsCondition.find('.form-group')[1]).hide(); // 대상 프로젝트
            $($collapseStatsCondition.find('.form-group')[3]).hide(); // 하위 프로젝트 결과
            $($collapseStatsCondition.find('.form-group')[6]).hide(); // 보여줄 항목
            $($collapseStatsCondition.find('.form-group')[8]).hide(); // 옵션
            $collapseStatsCondition.find('[name=checkBoxHideEmptyRow]').prop('checked', false);
        } else if (currentType == 'C') { // 체커
            $($collapseStatsCondition.find('.form-group')[3]).hide(); // 하위 프로젝트 결과
            $($collapseStatsCondition.find('.form-group')[7]).hide(); // 옵션
            $collapseStatsCondition.find('[name=checkBoxHideEmptyRow]').prop('checked', false);
        }
    }

    /***************************************************************************
     * 테이블 버튼
     ***************************************************************************/
    $dataTableWrapper.find('[name=btnExportCSV]').on('click', function() {

        var url = null;
        if (statsType == 'P') {
            url = '/api/1/stats/project/export/csv';
        } else if (statsType == 'U') {
            url = '/api/1/stats/user/export/csv';
        } else if (statsType == 'C') {
            url = '/api/1/stats/checker/export/csv';
        }

        var requestBody = {};
        requestBody.searchOption = searchOption;

        $.ajaxRest({
            url : url,
            type : "POST",
            data : requestBody,
            error : function(hdr, status) {
                errorMsgHandler.swal(hdr.responseText);
            }
        });
    });

    /***************************************************************************
     * 테이블 표시
     ***************************************************************************/
    function drawDataTable(condition) {

        $dataTableWrapper.hide();

        if (statsType == 'P') {

            $dataTableWrapperProjects.show();

            if ($dataTableStatsProjects == null) {
                $dataTableStatsProjects = $("#dataTableStatsProjects").dataTableController({
                    url : "/api/1/stats/project",
                    searchOption : searchOption,
                    buttonGroupId : "buttonGroupDataTableStatsProjects",
                    order : [ [ 0, 'asc' ] ],
                    buttons : [],
                    stateSave : false,
                    columnDefs : [ {
                        targets: 0,
                        data: "projectName", // 프로젝트
                        render: function(data, type, row) {
                            return '<span data-toggle="tooltip" data-placement="right" data-container="body" title="' + messageController.get('label.project.key')
                                + " : " + row.projectKey.escapeHTML() + '" >' + data.escapeHTML()
                                + '</span>';
                        }
                    }, {
                        targets: 1,
                        data: "parentProject", // 상위 프로젝트
                        sortKey : "parentProjectName",
                        render: function(data, type, row) {
                            if (data == null) {
                                return "-";
                            }
                            return '<span data-toggle="tooltip" data-container="body" title="' + row.parentProjectNamePath.escapeHTML() + '">' + data.projectName.escapeHTML() + '</span>';
                        }
                    }, {
                        targets: 2,
                        data: "scanCount", // 분석 수
                        className: 'dt-head-right',
                        render: function(data, type, row) {
                            return data.format();
                        }
                    }, {
                        targets: 3,
                        data: "fileCount", // 소스 파일
                        className: 'dt-head-right separate-column',
                        render: function(data, type, row) {
                            return data.format();
                        }
                    }, {
                        targets: 4,
                        data: "buildLoc", // 빌드 라인
                        className: 'dt-head-right',
                        render: function(data, type, row) {
                            return data.format();
                        }
                    }, {
                        targets: 5,
                        data: "allIssueCount", // 검출된 이슈
                        className: 'dt-head-right separate-column',
                        render: function(data, type, row) {
                            return data.format();
                        }
                    }, {
                        targets: 6,
                        data: "excludedIssueCount", // 제외된 이슈
                        className: 'dt-head-right',
                        render: function(data, type, row) {
                            return data.format();
                        }
                    }, {
                        targets: 7,
                        data: "issueCount", // 총 이슈
                        className: 'dt-head-right',
                        render: function(data, type, row) {
                            return data.format();
                        }
                    }, {
                        targets: 8,
                        data: "risk1IssueCount", // 매우위험
                        className: 'dt-head-right separate-column',
                        render: function(data, type, row) {
                            return data.format();
                        }
                    }, {
                        targets: 9,
                        data: "risk2IssueCount", // 위험
                        className: 'dt-head-right',
                        render: function(data, type, row) {
                            return data.format();
                        }
                    }, {
                        targets: 10,
                        data: "risk3IssueCount", // 높음
                        className: 'dt-head-right',
                        render: function(data, type, row) {
                            return data.format();
                        }
                    }, {
                        targets: 11,
                        data: "risk4IssueCount", // 보통
                        className: 'dt-head-right',
                        render: function(data, type, row) {
                            return data.format();
                        }
                    }, {
                        targets: 12,
                        data: "risk5IssueCount", // 낮음
                        className: 'dt-head-right',
                        render: function(data, type, row) {
                            return data.format();
                        }
                    }, {
                        targets: 13,
                        data: "checkerTypeQ", // 품질
                        className: 'dt-head-right separate-column',
                        render: function(data, type, row) {
                            return data.format();
                        }
                    }, {
                        targets: 14,
                        data: "checkerTypeS", // 보안
                        className: 'dt-head-right',
                        render: function(data, type, row) {
                            return data.format();
                        }
                    }, {
                        targets: 15,
                        data: "checkerTypeC", // 코드 규칙
                        className: 'dt-head-right',
                        render: function(data, type, row) {
                            return data.format();
                        }
                    }]
                });
            } else {
                $dataTableStatsProjects.draw();
            }

        } else if (statsType == 'U') {

            $dataTableWrapperUsers.show();

            if ($dataTableStatsUser == null) {
                $dataTableStatsUser = $("#dataTableStatsUsers").dataTableController({
                    url : "/api/1/stats/user",
                    searchOption : searchOption,
                    buttonGroupId: "buttonGroupDataTableStatsUsers",
                    order : [ [ 0, 'asc' ] ],
                    buttons: [],
                    stateSave: false,
                    columnDefs: [ {
                        targets: 0,
                        data: "userName", // 분석자
                        render: function(data, type, row) {
                            if (data == null)
                                return row.userId;
                            return data.escapeHTML() + "(" + row.userId + ")";
                        }
                    }, {
                        targets: 1,
                        data: "scanCount", // 분석 수
                        className: 'dt-head-right',
                        render: function(data, type, row) {
                            return data.format();
                        }
                    }, {
                        targets: 2,
                        data: "fileCount", // 소스 파일
                        className: 'dt-head-right separate-column',
                        render: function(data, type, row) {
                            return data.format();
                        }
                    }, {
                        targets: 3,
                        data: "buildLoc", // 빌드 라인
                        className: 'dt-head-right',
                        render: function(data, type, row) {
                            return data.format();
                        }
                    }, {
                        targets: 4,
                        data: "allIssueCount", // 검출된 이슈
                        className: 'dt-head-right separate-column',
                        render: function(data, type, row) {
                            return data.format();
                        }
                    }, {
                        targets: 5,
                        data: "excludedIssueCount", // 제외된 이슈
                        className: 'dt-head-right',
                        render: function(data, type, row) {
                            return data.format();
                        }
                    }, {
                        targets: 6, // 총 이슈
                        data: "issueCount",
                        className: 'dt-head-right',
                        render: function(data, type, row) {
                            return data.format();
                        }
                    }, {
                        targets: 7, // 매우 위험
                        data: "risk1IssueCount",
                        className: 'dt-head-right separate-column',
                        render: function(data, type, row) {
                            return data.format();
                        }
                    }, {
                        targets: 8, // 위험
                        data: "risk2IssueCount",
                        className: 'dt-head-right',
                        render: function(data, type, row) {
                            return data.format();
                        }
                    }, {
                        targets: 9, // 높음
                        data: "risk3IssueCount",
                        className: 'dt-head-right',
                        render: function(data, type, row) {
                            return data.format();
                        }
                    }, {
                        targets: 10, // 보통
                        data: "risk4IssueCount",
                        className: 'dt-head-right',
                        render: function(data, type, row) {
                            return data.format();
                        }
                    }, {
                        targets: 11, // 낮음
                        data: "risk5IssueCount",
                        className: 'dt-head-right',
                        render: function(data, type, row) {
                            return data.format();
                        }
                    }, {
                        targets: 12,
                        data: "checkerTypeQ", // 품질
                        className: 'dt-head-right separate-column',
                        render: function(data, type, row) {
                            return data.format();
                        }
                    }, {
                        targets: 13,
                        data: "checkerTypeS", // 보안
                        className: 'dt-head-right',
                        render: function(data, type, row) {
                            return data.format();
                        }
                    }, {
                        targets: 14,
                        data: "checkerTypeC", // 코드 규칙
                        className: 'dt-head-right',
                        render: function(data, type, row) {
                            return data.format();
                        }
                    }]
                });
            } else {
                $dataTableStatsUser.draw();
            }

        } else if (statsType == 'C') {

            $dataTableWrapperCheckers.show();

            if ($dataTableStatsCheckers == null) {
                $dataTableStatsCheckers = $("#dataTableStatsCheckers").dataTableController({
                    url : "/api/1/stats/checker",
                    searchOption : searchOption,
                    buttonGroupId: "buttonGroupDataTableStatsCheckers",
                    order : [ [ 0, 'asc' ] ],
                    buttons: [],
                    stateSave: false,
                    columnDefs: [ {
                        targets: 0,
                        data: "itemGroupName" // 분류
                    }, {
                        targets: 1,
                        data: "itemName" // 항목
                    }, {
                        targets: 2,
                        data: "allIssueCount", // 검출된 이슈
                        className: 'dt-head-right',
                        render: function(data, type, row) {
                            if (data == null) {
                                return 0;
                            }
                            return data.format();
                        }
                    }, {
                        targets: 3,
                        data: "excludedIssueCount", // 제외된 이슈
                        className: 'dt-head-right',
                        render: function(data, type, row) {
                            if (data == null) {
                                return 0;
                            }
                            return data.format();
                        }
                    }, {
                        targets: 4,
                        data: "issueCount", // 총 이슈
                        className: 'dt-head-right',
                        render: function(data, type, row) {
                            if (data == null) {
                                return 0;
                            }
                            return data.format();
                        }
                    }],
                    drawCallback : function(settings, json) {
                        if (searchOption.checkerItemId == -2 || searchOption.checkerItemId == -3 || searchOption.checkerItemId == -4) {
                            $('#dataTableStatsCheckers').find('thead tr th:nth-child(2)').hide();
                            $('#dataTableStatsCheckers').find('tbody tr td:nth-child(2)').hide();
                        } else {
                            $('#dataTableStatsCheckers').find('thead tr th:nth-child(2)').show();
                            $('#dataTableStatsCheckers').find('tbody tr td:nth-child(2)').show();
                        }
                    }
                });
            } else {
                $dataTableStatsCheckers.draw();
            }
        }
    }

});
