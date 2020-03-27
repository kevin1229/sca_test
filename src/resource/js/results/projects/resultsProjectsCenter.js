$(function() {

    /***************************************************************************
     * 변수
     ***************************************************************************/
    SearchOption = function() {
        this.project = null;
        this.projectIds = [];
        this.fromDateTime = null;
        this.toDateTime = null;
        this.checkerGroupIds = [];
        this.scanUserIds = [];
        this.managerUserIds = [];
        this.myProjectRoleCode = null;
    };
    SearchOption.prototype = {
        clear : function() {
            this.project = null;
            this.projectIds = [];
            this.fromDateTime = null;
            this.toDateTime = null;
            this.checkerGroupIds = [];
            this.scanUserIds = [];
            this.managerUserIds = [];
            this.myProjectRoleCode = null;
        }
    };
    var searchOption = new SearchOption();

    var $dropdownSearchOptionProjects = $('#dropdownSearchOptionProjects');
    var $buttonGroupDataTableProjects = $('#buttonGroupDataTableProjects');

    /******************************************************************
     * 컴포넌트
     ******************************************************************/
    // 상세 검색 : 프로젝트
    $dropdownSearchOptionProjects.find('#searchOptionProjectTree').dropdownFancytreeController({
        ajax: {
            url: "/api/1/projects/fancytree"
        }
    });

    // 상세 검색 : 분석 시작 일시
    $dropdownSearchOptionProjects.find('[name=startDateTime]').daterangepickerController();

    // 상세 검색 : 체커 그룹
    $.ajaxRest({
        url: "/api/1/checkers/groups/items",
        type: "GET",
        success: function(data, textStatus, header) {
            $dropdownSearchOptionProjects.find('[name=checkerGroupIds]').select2Controller({ multiple: true, data: data });
        }
    });

    // 상세 검색 : 최근 분석자
    $dropdownSearchOptionProjects.find('[name=scanUserIds]').select2Controller({ multiple:true, url:"/api/1/users/items"});

    // 상세 검색 : 역할
    $.ajaxRest({
        url: "/api/1/projects/role/items",
        type: "GET",
        success: function(data, textStatus, header) {
            $dropdownSearchOptionProjects.find("[name=myProjectRoleCode]").select2Controller({ multiple: false, data: data });
        }
    });

    // 상세 검색 : 관리자
    $dropdownSearchOptionProjects.find('[name=managerUserIds]').select2Controller({ multiple:true, url:"/api/1/users/items"});

    /******************************************************************
     * 검색
     ******************************************************************/
    // 간단 검색 입력폼
    $dropdownSearchOptionProjects.find("[name=txtSearchShort]").on('keydown', function(e) {
        var code = e.keyCode || e.which;
        if (code == 13) { // ENTER
            searchShort();
        }
    });

    // 돋보기 버튼
    $dropdownSearchOptionProjects.find("[name=btnSearchShort]").on('click', function() {
        searchShort();
    });

    // 프로젝트명 또는 프로젝트키만으로 검색
    function searchShort() {
        searchOption.clear();
        searchOption.project = $dropdownSearchOptionProjects.find("[name=txtSearchShort]").val();

        clearSearchOption();
        showSearchCondition();

        $dataTableProjects.draw();
    }

    // 검색 버튼
    $dropdownSearchOptionProjects.find("[name=btnSearch]").on('click', function(e) {
        searchOption.clear();

        // 선택한 프로젝트 아이디
        var selNodes =  $('#searchOptionProjectTree').dropdownFancytreeController('getTree').getSelectedNodes();
        selNodes.forEach(function(node) {
            searchOption.projectIds.push(node.key);
        });
        // 체커 그룹
        searchOption.checkerGroupIds = $dropdownSearchOptionProjects.find('[name=checkerGroupIds]').val();
        // 최근 분석자
        searchOption.scanUserIds = $dropdownSearchOptionProjects.find('[name=scanUserIds]').val();
        // 분석 시작일
        if ($.trim($dropdownSearchOptionProjects.find('[name=startDateTime]').val()) != '') {
            searchOption.fromDateTime = $dropdownSearchOptionProjects.find('[name=startDateTime]').data('daterangepicker').startDate._d;
            searchOption.toDateTime = $dropdownSearchOptionProjects.find('[name=startDateTime]').data('daterangepicker').endDate._d;
        }

        searchOption.myProjectRoleCode = $dropdownSearchOptionProjects.find('[name=myProjectRoleCode]').val();

        searchOption.managerUserIds = $dropdownSearchOptionProjects.find('[name=managerUserIds]').val();

        showSearchCondition();
        $dataTableProjects.draw();

        $dropdownSearchOptionProjects.find('[name=txtSearchShort]').val("");
        $dropdownSearchOptionProjects.removeClass('open');
    });

    // 분석 결과 검색  드롭다운 버튼 : (분석 결과) 재설정
    $dropdownSearchOptionProjects.find("[name=btnClear]").on('click', function(e) {
        clearSearchOption();
    });

    function clearSearchOption() {
        // 프로젝트
        $dropdownSearchOptionProjects.find('[name=txtSearchShort]').val("");
        // 프로젝트 아이디
        $dropdownSearchOptionProjects.find('#searchOptionProjectTree').dropdownFancytreeController().clear();
        // 체커 그룹
        $dropdownSearchOptionProjects.find('[name=checkerGroupIds]').val("").trigger('change');
        // 최근 분석자
        $dropdownSearchOptionProjects.find('[name=scanUserIds]').val("").trigger('change');
        // 분석 시작 일시
        $dropdownSearchOptionProjects.find('[name=startDateTime]').val("");
        // 내 역할
        $dropdownSearchOptionProjects.find('[name=myProjectRoleCode]').val("").trigger('change');
        // 관리자
        $dropdownSearchOptionProjects.find('[name=managerUserIds]').val("").trigger('change');
    }

    // 현재 검색 기준
    function showSearchCondition() {
        $('#searchCondition').hide();
        $('#searchCondition .searchConditionHead').hide();
        $('#searchCondition .searchCondition').text('');

        if(searchOption == null) {
            return false;
        }

        // 프로젝트
        if(searchOption.project != null && searchOption.project != "") {
            $('#searchCondition [name=project]').text(searchOption.project);
            $('#searchCondition [name=project]').parent().show();
            $('#searchCondition').css('display', 'inline-block');
        }

        // 프로젝트 아이디
        if(searchOption.projectIds != null && searchOption.projectIds.length != 0) {
            var texts = [];
            $.each(searchOption.projectIds, function(index, value) {
                if(value != 0) {
                    var node = $('#searchOptionProjectTree').dropdownFancytreeController('getTree').getNodeByKey(value);
                    texts.push(node.title.unescapeHTML());
                }
            });

            $('#searchCondition [name=projectIds]').text(texts.join(', '));
            $('#searchCondition [name=projectIds]').parent().show();
            $('#searchCondition').css('display', 'inline-block');
        }

        // 체커 그룹
        if(searchOption.checkerGroupIds != null && searchOption.checkerGroupIds.length != 0) {
            var texts = getSelectTexts($dropdownSearchOptionProjects.find("[name=checkerGroupIds]"), searchOption.checkerGroupIds);
            $('#searchCondition [name=checkerGroupIds]').text(texts.join(', '));
            $('#searchCondition [name=checkerGroupIds]').parent().show();
            $('#searchCondition').css('display', 'inline-block');
        }

        // 분석시작일시
        if(searchOption.fromDateTime != null && searchOption.fromDateTime != "") {
            $('#searchCondition [name=fromDateTime]').text(moment(new Date(searchOption.fromDateTime)).format('YYYY-MM-DD HH:mm'));
            $('#searchCondition [name=fromDateTime]').parent().show();
            $('#searchCondition').css('display', 'inline-block');
        }
        if(searchOption.toDateTime != null && searchOption.toDateTime != "") {
            $('#searchCondition [name=toDateTime]').text(moment(new Date(searchOption.toDateTime)).format('YYYY-MM-DD HH:mm'));
            $('#searchCondition [name=toDateTime]').parent().show();
            $('#searchCondition').css('display', 'inline-block');
        }

        // 최근 분석자
        if(searchOption.scanUserIds != null && searchOption.scanUserIds.length != 0) {
            var texts = getSelectTexts($dropdownSearchOptionProjects.find("[name=scanUserIds]"), searchOption.scanUserIds);
            $('#searchCondition [name=scanUserIds]').text(texts.join(', '));
            $('#searchCondition [name=scanUserIds]').parent().show();
            $('#searchCondition').css('display', 'inline-block');
        }

        // 역할
        if(searchOption.myProjectRoleCode != null && searchOption.myProjectRoleCode != "") {
            $('#searchCondition [name=myProjectRoleCode]').text(messageController.get('item.project.role.' + searchOption.myProjectRoleCode));
            $('#searchCondition [name=myProjectRoleCode]').parent().show();
            $('#searchCondition').css('display', 'inline-block');
        }

        // 관리자
        if(searchOption.managerUserIds != null && searchOption.managerUserIds.length != 0) {
            var texts = getSelectTexts($dropdownSearchOptionProjects.find("[name=managerUserIds]"), searchOption.managerUserIds);
            $('#searchCondition [name=managerUserIds]').text(texts.join(', '));
            $('#searchCondition [name=managerUserIds]').parent().show();
            $('#searchCondition').css('display', 'inline-block');
        }
    }

    // Dropdown 닫기 방지 : common.js
    stopHideDropDown($dropdownSearchOptionProjects);

    /***************************************************************************
     * 테이블 버튼
     ***************************************************************************/
    // 일괄 수정 (모달 열림)
    $buttonGroupDataTableProjects.find("[name=btnModalModifyBatch]").on('click', function(e) {
        var selectedProjectIds = $dataTableProjects.getSelectedIds('projectId');

        if(selectedProjectIds.length == 0) {
            swal(messageController.get('400025'));
        } else if(selectedProjectIds.length == 1) {
            // 1건이면 1건 수정이 나온다.
            modalModifyProject.openModal(selectedProjectIds[0]);
        } else {
            modalBatchModifyProject.openModelProjectBatchModify(selectedProjectIds, searchOption);
        }
    });

    // 일괄 삭제
    $buttonGroupDataTableProjects.find("[name=btnDeleteBatch]").on('click', function(e) {
        var selectedIds = $dataTableProjects.getSelectedIds('projectId');
        if (selectedIds.length == 0) {
            swal(messageController.get('400025'));
            return;
        }

        var requestBody = {};
        if($dataTableProjects.isAllSelected()) {
            requestBody.searchOption = searchOption;
        } else {
            requestBody.ids = selectedIds;
        }

        swalDelete({
            url: "/api/1/projects",
            dataTable: $dataTableProjects,
            requestBody: requestBody
        });
    });

    /***************************************************************************
     * 테이블 표시
     ***************************************************************************/
    // 프로젝트 목록
    var $dataTableProjects = $("#dataTableProjects").dataTableController({
        url : "/api/1/projects",
        searchOption : searchOption,
        buttonGroupId: "buttonGroupDataTableProjects",
        order : [ [ 19, 'desc' ] ],
        columnDefs : [ {
            targets: 0,
            orderable : false,
            className: 'select-checkbox',
            defaultContent : ""
        }, {
            targets: 1,
            visible: false,
            data: "projectId",
            className: "dt-head-right"
        }, {
            targets: 2, // 프로젝트명
            data: "projectName",
            render: function(data, type, row) {
                return getLinkProjectName(row);
            }
        }, {
            targets: 3, // 프로젝트키
            visible: false,
            data: "projectKey",
            render: function(data, type, row) {
                return getLinkProjectKey(row);
            }
        }, {
            targets: 4, // 설명
            visible: false,
            data: "projectComment",
            render: function(data, type, row) {
                if (data == null) {
                    return "";
                }
                var text = data.escapeHTML();
                return '<div title="' + text + '" data-toggle="tooltip" data-container="body" class="ellipsis" style="max-width: 200px">' + text + '</div>';
            }
        }, {
            targets: 5, // 상위 프로젝트
            data: "parentProject",
            sortKey: "parentProjectNamePath",
            render: function(data, type, row) {
                return getParentProject(row);
            }
        }, {
            targets: 6, // 체커 그룹
            visible: false,
            data: "checkerGroup",
            sortKey: "checkerGroupName",
            render: function(data, type, row) {
                var text = data.checkerGroupName + '(' + data.enabledCheckers + '/' + data.totalCheckers + ')';

                // 관리자 인지 체크
                if(sessionUserController.isAdmin() == false)
                    return text;

                return '<a href="/admin/checkers/groups/' + row.checkerGroupId + '/design" title="'
                    + messageController.get('label.go.to.checker.edit') + '" data-toggle="tooltip" data-container="body">' + text + '</a>';
            }
        }, {
            targets: 7, // 내 역할
            data: "myProjectRoleCode",
            className: "dt-head-center",
            render: function(data, type, row) {
                if (data == null)
                    return '-';
                return messageController.get('item.project.role.' + data);
            }
        }, {
            targets: 8, // 관리자
            visible: false,
            data: "managerUserName",
            render: function(data, type, row) {
                if (data == null)
                    return '-';

                var text = null;
                if(row.managerUserCount > 0) {
                    text = messageController.get("label.item.user", data.escapeHTML() + "(" + row.managerUserId + ")", row.managerUserCount);
                } else {
                    text = data.escapeHTML();
                }
                return text;
            }
        }, {
            targets: 9, // 분석 수
            data: "scanCount",
            className: "dt-head-right",
            render: function(data, type, row) {
                if (data == null)
                    return '-';
                return '<a href="/projects/' + row.projectId + '/scans" title="' + messageController.get('label.go.to.scans') + '" data-toggle="tooltip" data-container="body">' + data + '</a>';
            }
        }, {
            targets: 10, // 최근 분석자
            visible: false,
            data: "lastScan",
            sortKey: "lastScanScanUserName",
            render: function(data, type, row) {
                if (data == null || data.scanUserId == null)
                    return '-';
                if (data.scanUserName == null)
                    return data.scanUserId;
                return data.scanUserName.escapeHTML() + "(" + data.scanUserId + ")";
            }
        }, {
            targets: 11, // 진행 사항(Progress)
            data: "lastScan",
            sortKey: "lastScanProgressPercent",
            className: "dt-head-right",
            render: function(data, type, row) {
                if (data == null || data.progressPercent == null)
                    return '-';
                return data.progressPercent + "%";
            }
        }, {
            targets: 12, // 신규 이슈
            visible: false,
            data: "lastScan",
            sortKey: "lastScanNewIssueCount",
            className: "dt-head-right",
            render: function(data, type, row) {
                if (data == null || data.newIssueCount == null)
                    return '-';
                return getLinkNewIssueCount(data);
            }
        }, {
            targets: 13, // 총 이슈
            data: "lastScan",
            sortKey: "lastScanIssueCount",
            className: "dt-head-right",
            render: function(data, type, row) {
                if (data == null || data.issueCount == null)
                    return '-';
                return getLinkAllIssueCount(data);
            }
        }, {
            targets: 14, // LV1
            data: "lastScan",
            sortKey: "lastScanRisk1IssueCount",
            className: "dt-head-right",
            render: function(data, type, row) {
                if (data == null || data.risk1IssueCount == null)
                    return '-';
                return getLinkRiskIssueCount({risk: "1", value: data.risk1IssueCount, scanId: data.scanId});
            }
        }, {
            targets: 15, // LV2
            data: "lastScan",
            sortKey: "lastScanRisk2IssueCount",
            className: "dt-head-right",
            render: function(data, type, row) {
                if (data == null || data.risk2IssueCount == null)
                    return '-';
                return getLinkRiskIssueCount({risk: "2", value: data.risk2IssueCount, scanId: data.scanId});
            }
        }, {
            targets: 16, // LV3
            data: "lastScan",
            sortKey: "lastScanRisk3IssueCount",
            className: "dt-head-right",
            render: function(data, type, row) {
                if (data == null || data.risk3IssueCount == null)
                    return '-';
                return getLinkRiskIssueCount({risk: "3", value: data.risk3IssueCount, scanId: data.scanId});
            }
        }, {
            targets: 17, // LV4
            data: "lastScan",
            sortKey: "lastScanRisk4IssueCount",
            className: "dt-head-right",
            render: function(data, type, row) {
                if (data == null || data.risk4IssueCount == null)
                    return '-';
                return getLinkRiskIssueCount({risk: "4", value: data.risk4IssueCount, scanId: data.scanId});
            }
        }, {
            targets: 18, // LV5
            data: "lastScan",
            sortKey: "lastScanRisk5IssueCount",
            className: "dt-head-right",
            render: function(data, type, row) {
                if (data == null || data.risk5IssueCount == null)
                    return '-';
                return getLinkRiskIssueCount({risk: "5", value: data.risk5IssueCount, scanId: data.scanId});
            }
        }, {
            targets: 19, // 분석 시작 일시
            data: "lastScan",
            sortKey: "lastScanStartDateTime",
            className: "dt-head-center",
            render: function(data, type, row) {
                if (data == null || data.startDateTime == null)
                    return '-';
                return momentController.timestampFormat(data.startDateTime, 'YYYY-MM-DD HH:mm:ss');
            }
        }, {
            targets: 20, // 분석 종료 일시
            visible: false,
            data: "lastScan",
            sortKey: "lastScanEndDateTime",
            className: "dt-head-center",
            render: function(data, type, row) {
                if (data == null || data.endDateTime == null)
                    return '-';
                return momentController.timestampFormat(data.endDateTime, 'YYYY-MM-DD HH:mm:ss');
            }
        }, {
            targets: 21, // 분석 소요 시간
            data: "lastScan",
            sortKey: "lastAnalysisTime",
            className: "dt-head-center",
            render: function(data, type, row) {
                if (data == null || data.endDateTime == null || data.startDateTime == null) {
                    return '-';
                }
                return momentController.durationTime(data.endDateTime - data.startDateTime);
            }
        }, {
            targets: 22, // 소수 파일 수
            data: "lastScan",
            sortKey: "lastScanFileCount",
            className: "dt-head-right",
            render: function(data, type, row) {
                if (data == null || data.fileCount == null)
                    return '-';
                return getLinkFileCount(data);
            }
        }, {
            targets: 23, // 빌드 라인 수
            visible: false,
            data: "lastScan",
            sortKey: "lastScanBuildLoc",
            className: "dt-head-right",
            render: function(data, type, row) {
                if (data == null || data.buildLoc == null)
                    return '-';
                return getLinkBuildLoc(data);
            }
        }, {
            targets: 24,
            orderable: false,
            className: "extend-button",
            width: '60px',
            render: function(data, type, row, meta) {
                var html = '<span data-name="btnModify" class="btn-modify" style="margin-right:10px;"><i class="fa fa-pencil-square-o active-hover" aria-hidden="true"></i></span>';
                html += '<span data-name="btnDelete" class="btn-delete" style="margin-right:10px;"><i class="fa fa-trash active-hover" aria-hidden="true"></i></span>';
                return html;
            }
        } ],
        createdRow: function (row, data, index) {

            var $row = $(row);

            // 프로젝트 요약 정보으로 이동
            $row.on('click', function(e) {
                if(e.target.className.indexOf('select-checkbox') == -1
                    && e.target.className.indexOf('extend-button') == -1) {
                    $(window).attr('location','/projects/' + data.projectId + '/info');
                    e.stopPropagation();
                }
            });

            // 수정
            $row.find("[data-name=btnModify]").on('click', function(e) {
                modalModifyProject.openModal(data.projectId);
                e.stopPropagation();
            });

            // 삭제
            $row.find("[data-name=btnDelete]").on('click', function(e) {
                var options = {
                    url: "/api/1/projects/" + data.projectId,
                    dataTable: $dataTableProjects
                };
                if (data.lastScan != null && data.lastScan.progressPercent != 100) {
                    options.beforeSend = function() {
                        swalDelete({
                            title: messageController.get('confirm.project.1'),
                            url: "/api/1/projects/" + data.projectId,
                            dataTable: $dataTableProjects
                        });
                        return false;
                    }
                }
                swalDelete(options);
                e.stopPropagation();
            });
        }
    });

    // 데이터 테이블의 선택/선택해제 이벤트 리스너.
    $dataTableProjects.DataTable().on('select', function(e, dt, type, indexes) {
        changeButtonText();
    }).on('deselect', function(e, dt, type, indexes) {
        changeButtonText();
    });

    /**
     * 2개 이상의 ROW가 선택된 경우, 일괄삭제, 일괄수정으로 텍스트 변경.
     * 1개 이하의 ROW가 선택된 경우, 삭제, 수정으로 텍스트 변경.
     */
    function changeButtonText() {
        if($dataTableProjects.getSelectedIds().length > 1){
            $buttonGroupDataTableProjects.find('[name=btnDeleteBatch]').find('.btn-name').text(messageController.get("label.batch.delete"));
            $buttonGroupDataTableProjects.find('[name=btnModalModifyBatch]').find('.btn-name').text(messageController.get("label.batch.modify"));
        } else {
            $buttonGroupDataTableProjects.find('[name=btnDeleteBatch]').find('.btn-name').text(messageController.get("label.delete"));
            $buttonGroupDataTableProjects.find('[name=btnModalModifyBatch]').find('.btn-name').text(messageController.get("label.modify"));
        }
    }

    /******************************************************************
     * 모달
     ******************************************************************/
    // 프로젝트 모달 수정화면하고 연결
    modalAddProject.setDataTableProjects($dataTableProjects);
    modalModifyProject.setDataTableProjects($dataTableProjects);
    modalBatchModifyProject.setDataTableProjects($dataTableProjects);

    // modal export result용
    $("#modalExportResult").modalExportResult({
        page : "projects",
        searchOption : searchOption,
        dataTable : $dataTableProjects,
        fnGetSelectedIds : function() {
            return $dataTableProjects.getSelectedIds('projectId');
        }
    });

    /**
     * 현재 검색 결과 초기화 이벤트
     */
    $('#searchOptionClear').click(function () {
       clearSearchOption();
       $('button[name=btnSearch]').trigger('click');
    });
});
