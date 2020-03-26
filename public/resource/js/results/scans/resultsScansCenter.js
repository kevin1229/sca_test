$(function() {

    /***************************************************************************
     * 변수
     ***************************************************************************/
    SearchOption = function() {
        this.project = null;
        this.projectIds = [];
        this.fromDateTime = null;
        this.toDateTime = null;
        this.programLangIds = [];
        this.scanUserIds = [];
        this.checkerGroupNames = [];
        this.clientIps = [];
        this.buildPath = null;
    };
    SearchOption.prototype = {
        clear : function() {
            this.project = null;
            this.projectIds = [];
            this.fromDateTime = null;
            this.toDateTime = null;
            this.programLangIds = [];
            this.scanUserIds = [];
            this.checkerGroupNames = [];
            this.clientIps = [];
            this.buildPath = null;
        }
    };
    var searchOption = new SearchOption();

    var $dropdownSearchOptionScans = $('#dropdownSearchOptionScans');
    var $buttonGroupDataTableScans = $("#buttonGroupDataTableScans");

    /******************************************************************
     * 컴포넌트
     ******************************************************************/
    // 프로젝트
    $dropdownSearchOptionScans.find('#searchOptionProjectTree').dropdownFancytreeController({
        ajax : {
            url : "/api/1/projects/fancytree"
        }
    });

    // 분석 시작 일시
    $dropdownSearchOptionScans.find('[name=startDateTime]').daterangepickerController();

    // 프로그램 언어
    $.ajaxRest({
        url: "/api/1/scans/programs/lang/items",
        type: "GET",
        success : function (data, textStatus, header) {
            $dropdownSearchOptionScans.find('[name=programLangIds]').select2Controller({ multiple: true, data: data });
        }
    });

    // 분석자
    $dropdownSearchOptionScans.find('[name=scanUserIds]').select2Controller({ multiple:true, url:"/api/1/users/items"});

    // 체커 그룹
    $dropdownSearchOptionScans.find("[name=checkerGroupNames]").select2Controller({
        multiple: true,
        tags: true,
        placeholder: messageController.get('info.common.7')
    });

    // 클라이언트 IP
    $dropdownSearchOptionScans.find("[name=clientIps]").select2Controller({
        multiple: true,
        tags: true,
        validator : validateIPaddress,
        placeholder: messageController.get('info.common.7')
    });

    /******************************************************************
     * 검색
     ******************************************************************/
    // 간단 검색 버튼
    $dropdownSearchOptionScans.find("[name=txtSearchShort]").on('keydown', function(e) {
        var code = e.keyCode || e.which;
        if (code == 13) { // ENTER
            searchShort();
        }
    });

    // 돋보기 버튼
    $dropdownSearchOptionScans.find("[name=btnSearchShort]").on('click', function(e) {
        searchShort();
    });

    // 프로젝트명으로만 검색
    function searchShort() {
        searchOption.clear();
        searchOption.project = $dropdownSearchOptionScans.find("[name=txtSearchShort]").val();

        clearSearchOption();
        showSearchCondition();

        $dataTableScans.draw();
    }

    // 검색 버튼
    $dropdownSearchOptionScans.find("[name=btnSearch]").on('click', function() {
        // 검색 조건 클리어
        searchOption.clear();
        searchOption.project = $dropdownSearchOptionScans.find('[name=project]').val();

        // 선택한 프로젝트 아이디
        var selNodes =  $('#searchOptionProjectTree').dropdownFancytreeController('getTree').getSelectedNodes();
        selNodes.forEach(function(node) {
            searchOption.projectIds.push(node.key);
        });
        if ($.trim($dropdownSearchOptionScans.find('[name=startDateTime]').val()) != '') {
            searchOption.fromDateTime = $dropdownSearchOptionScans.find('[name=startDateTime]').data('daterangepicker').startDate._d;
            searchOption.toDateTime = $dropdownSearchOptionScans.find('[name=startDateTime]').data('daterangepicker').endDate._d;
        }
        searchOption.programLangIds = $dropdownSearchOptionScans.find('[name=programLangIds]').val();
        searchOption.scanUserIds = $dropdownSearchOptionScans.find('[name=scanUserIds]').val();
        searchOption.checkerGroupNames = $dropdownSearchOptionScans.find('[name=checkerGroupNames]').val();
        searchOption.clientIps = $dropdownSearchOptionScans.find('[name=clientIps]').val();
        searchOption.buildPath = $dropdownSearchOptionScans.find('[name=buildPath]').val();

        showSearchCondition();
        $dataTableScans.draw();

        $dropdownSearchOptionScans.find('[name=txtSearchShort]').val("");
        $dropdownSearchOptionScans.removeClass('open');
    });

    // 초기화 버튼
    $dropdownSearchOptionScans.find("[name=btnClear]").on('click', function() {
        clearSearchOption();
    });

    function clearSearchOption() {
        $dropdownSearchOptionScans.find('[name=txtSearchShort]').val("");
        // 프로젝트 아이디
        $dropdownSearchOptionScans.find('#searchOptionProjectTree').dropdownFancytreeController().clear();
        // 분석 시작 일시
        $dropdownSearchOptionScans.find('[name=startDateTime]').val("");
        // 프로그램 언어
        $dropdownSearchOptionScans.find('[name=programLangIds]').val("").trigger('change');
        // 분석자
        $dropdownSearchOptionScans.find('[name=scanUserIds]').val("").trigger('change');
        // 체커 그룹
        $dropdownSearchOptionScans.find('[name=checkerGroupNames]').val("").trigger('change');
        // 클라이언트 IP
        $dropdownSearchOptionScans.find('[name=clientIps]').val("").trigger('change');
        // 빌드 경로
        $dropdownSearchOptionScans.find('[name=buildPath]').val("");
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
        if (searchOption.project != null && searchOption.project != "") {
            $('#searchCondition [name=project]').text(searchOption.project);
            $('#searchCondition [name=project]').parent().show();
            $('#searchCondition').css('display', 'inline-block');
        }

        // 프로젝트 아이디
        if (searchOption.projectIds != null && searchOption.projectIds.length != 0) {
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

        // 분석시작일시
        if (searchOption.fromDateTime != null && searchOption.fromDateTime != "") {
            $('#searchCondition [name=fromDateTime]').text(moment(new Date(searchOption.fromDateTime)).format('YYYY-MM-DD HH:mm'));
            $('#searchCondition [name=fromDateTime]').parent().show();
            $('#searchCondition').css('display', 'inline-block');
        }
        if (searchOption.toDateTime != null && searchOption.toDateTime != "") {
            $('#searchCondition [name=toDateTime]').text(moment(new Date(searchOption.toDateTime)).format('YYYY-MM-DD HH:mm'));
            $('#searchCondition [name=toDateTime]').parent().show();
            $('#searchCondition').css('display', 'inline-block');
        }

        // 프로그램 언어
        if (searchOption.programLangIds != null && searchOption.programLangIds.length != 0) {
            var texts = getSelectTexts($dropdownSearchOptionScans.find("[name=programLangIds]"), searchOption.programLangIds);
            $('#searchCondition [name=programLangIds]').text(texts.join(', '));
            $('#searchCondition [name=programLangIds]').parent().show();
            $('#searchCondition').css('display', 'inline-block');
        }

        // 분석자
        if (searchOption.scanUserIds != null && searchOption.scanUserIds.length != 0) {
            var texts = getSelectTexts($dropdownSearchOptionScans.find("[name=scanUserIds]"), searchOption.scanUserIds);
            $('#searchCondition [name=scanUserIds]').text(texts.join(', '));
            $('#searchCondition [name=scanUserIds]').parent().show();
            $('#searchCondition').css('display', 'inline-block');
        }

        // 체커 그룹명
        if (searchOption.checkerGroupNames != null && searchOption.checkerGroupNames.length != 0) {
            var texts = getSelectTexts($dropdownSearchOptionScans.find("[name=checkerGroupNames]"), searchOption.checkerGroupNames);
            $('#searchCondition [name=checkerGroupNames]').text(texts.join(', '));
            $('#searchCondition [name=checkerGroupNames]').parent().show();
            $('#searchCondition').css('display', 'inline-block');
        }

        // 클라이언트 IP
        if (searchOption.clientIps != null && searchOption.clientIps.length != 0) {
            var texts = getSelectTexts($dropdownSearchOptionScans.find("[name=clientIps]"), searchOption.clientIps);
            $('#searchCondition [name=clientIps]').text(texts.join(', '));
            $('#searchCondition [name=clientIps]').parent().show();
            $('#searchCondition').css('display', 'inline-block');
        }

        // 빌드 경로
        if (searchOption.buildPath != null && searchOption.buildPath != "") {
            $('#searchCondition [name=buildPath]').text(searchOption.buildPath);
            $('#searchCondition [name=buildPath]').parent().show();
            $('#searchCondition').css('display', 'inline-block');
        }
    }

    // Dropdown 닫기 방지 : common.js
    stopHideDropDown($dropdownSearchOptionScans);

    /***************************************************************************
     * 테이블 버튼
     ***************************************************************************/
    // 분석 결과 : 일괄 삭제
    $buttonGroupDataTableScans.find("[name=btnDeleteBatch]").on('click', function(e) {
        var selectedIds = $dataTableScans.getSelectedIds('scanId');
        if (selectedIds.length == 0) {
            swal(messageController.get('400025'));
            return;
        }

        var requestBody = {};
        if($dataTableScans.isAllSelected()) {
            requestBody.searchOption = searchOption;
        } else {
            requestBody.ids = selectedIds;
        }

        swalDelete({
            url: "/api/1/scans",
            dataTable: $dataTableScans,
            requestBody: requestBody
        });
    });

    /***************************************************************************
     * 테이블 표시
     ***************************************************************************/
    var $dataTableScans = $("#dataTableScans").dataTableController({
        url : "/api/1/scans",
        searchOption : searchOption,
        buttonGroupId: "buttonGroupDataTableScans",
        order : [ [ 1, 'desc' ] ],
        columnDefs : [ {
            targets : 0,
            orderable : false,
            className : 'select-checkbox',
            defaultContent : ""
        }, {
            targets : 1, // ID
            data : "scanId",
            className : "dt-head-right"
        }, {
            targets : 2, // 프로젝트명
            data : "projectName",
            render : function(data, type, row) {
                return getLinkProjectName(row);
            }
        }, {
            targets : 3, // 상위 프로젝트
            visible: false,
            orderable : true,
            data : "parentProject",
            sortKey : "parentProjectKey",
            render : function(data, type, row) {
                return getParentProject(row);
            }
        }, {
            targets : 4, // 프로그램 언어
            visible: false,
            orderable : false,
            data : "programLangs",
            render : function(data, type, row) {
                if (data == null || data.length == 0) {
                    return '-';
                }

                var title = data.join(', ');

                var text = null;
                if (data.length > 1) {
                    text = messageController.get("label.item.etc", data[0], data.length);
                } else {
                    text = data[0];
                }

                return '<div title="'+ title +'">'+ text +'</div>';
            }
        }, {
            targets : 5, // 분석자
            data : "scanUserName",
            render : function(data, type, row) {
                if (data == null)
                    return row.scanUserId;
                return data.escapeHTML() + "(" + row.scanUserId + ")";
            }
        }, {
            targets : 6, // 진행 사항
            data : "progressPercent",
            className : "dt-head-right",
            render : function(data, type, row) {
                if (data == null)
                    return '-';
                return data + "%";
            }
        }, {
            targets : 7, // 신규 이슈
            data : "newIssueCount",
            className : "dt-head-right",
            render : function(data, type, row) {
                if (data == null)
                    return '-';
                return getLinkNewIssueCount(row);
            }
        }, {
            targets : 8, // 전체 이슈
            data : "issueCount",
            className : "dt-head-right",
            render : function(data, type, row) {
                if (data == null)
                    return '-';
                return getLinkAllIssueCount(row);
            }
        }, {
            targets : 9, // LV1
            data : "risk1IssueCount",
            className : "dt-head-right",
            render : function(data, type, row) {
                if (data == null)
                    return '-';
                return getLinkRiskIssueCount({risk: "1", value: data, scanId: row.scanId});
            }
        }, {
            targets : 10, // LV2
            data : "risk2IssueCount",
            className : "dt-head-right",
            render : function(data, type, row) {
                if (data == null)
                    return '-';
                return getLinkRiskIssueCount({risk: "2", value: data, scanId: row.scanId});
            }
        }, {
            targets : 11, // LV3
            data : "risk3IssueCount",
            className : "dt-head-right",
            render : function(data, type, row) {
                if (data == null)
                    return '-';
                return getLinkRiskIssueCount({risk: "3", value : data, scanId: row.scanId});
            }
        }, {
            targets : 12, // LV4
            data : "risk4IssueCount",
            className : "dt-head-right",
            render : function(data, type, row) {
                if (data == null)
                    return '-';
                return getLinkRiskIssueCount({risk: "4", value: data, scanId: row.scanId});
            }
        }, {
            targets : 13, // LV5
            data : "risk5IssueCount",
            className : "dt-head-right",
            render : function(data, type, row) {
                if (data == null)
                    return '-';
                return getLinkRiskIssueCount({risk: "5", value: data, scanId: row.scanId});
            }
        }, {
            targets : 14, // 분석 시작 일시
            data : "startDateTime",
            className : "dt-head-center",
            render : function(data, type, row) {
                if (data == null)
                    return '-';
                return momentController.timestampFormat(data, 'YYYY-MM-DD HH:mm:ss');
            }
        }, {
            targets : 15, // 분석 종료 일시
            data : "endDateTime",
            className : "dt-head-center",
            render : function(data, type, row) {
                if (data == null)
                    return '-';
                return momentController.timestampFormat(data, 'YYYY-MM-DD HH:mm:ss');
            }
        }, {
            targets : 16, // 분석 시간
            data : "analysisTime",
            render : function(data, type, row) {
                if (row.endDateTime == null || row.startDateTime == null)
                    return '-';
                return momentController.durationTime(data);
            }
        }, {
            targets : 17, // 체커 그룹
            data : "checkerGroupText",
            sortKey: "checkerGroupName"
        }, {
            targets : 18, // 분석 방식
            visible: false,
            data : "scanModeCode",
            className : "dt-head-center",
            render : function(data, type, row) {
                return messageController.get("item.scan.mode." + data);
            }
        }, {
            targets : 19, // 클라이언트 IP
            visible: false,
            data : "clientIp"
        }, {
            targets : 20, // 파일 수
            data : "fileCount",
            className : "dt-head-right",
            render : function(data, type, row) {
                if (data == null)
                    return '-';
                return getLinkFileCount(row);
            }
        }, {
            targets : 21, // 빌드 라인 수
            visible: false,
            data : "buildLoc",
            className : "dt-head-right",
            render : function(data, type, row) {
                if (data == null)
                    return '-';
                return getLinkBuildLoc(row);
            }
        }, {
            targets : 22, // 빌드 경로
            visible: false,
            data : "buildPath"
        }, {
            targets: 23,
            orderable: false,
            className: "extend-button",
            width: '30px',
            render: function(data, type, row, meta) {
                return '<span data-name="btnDelete" class="btn-delete"><i class="fa fa-trash active-hover" aria-hidden="true"></i></span>';
            }
        } ],
        createdRow : function (row, data, index) {

            var $row = $(row);

            // 분석 요약 정보으로 이동
            $row.on('click', function(e) {
                if(e.target.className.indexOf('select-checkbox') == -1
                    && e.target.className.indexOf('extend-button') == -1) {
                    $(window).attr('location','/scans/' + data.scanId + '/info');
                    e.stopPropagation();
                }
            });

            // 삭제
            $row.find("[data-name=btnDelete]").on('click', function(e) {
                var options = {
                    url: "/api/1/scans/" + data.scanId,
                    dataTable: $dataTableScans
                };
                if (data.progressPercent != 100) {
                    options.beforeSend = function() {
                        swalDelete({
                            title: messageController.get('confirm.scan.1'),
                            url: "/api/1/projects/" + data.projectId,
                            dataTable: $dataTableScans
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
    $dataTableScans.DataTable().on('select', function(e, dt, type, indexes) {
        changeButtonText();
    }).on('deselect', function (e, dt, type, indexes) {
        changeButtonText();
    });

    /**
     * 2개 이상의 ROW가 선택된 경우, 일괄삭제, 일괄수정으로 텍스트 변경.
     * 1개 이하의 ROW가 선택된 경우, 삭제, 수정으로 텍스트 변경.
     */
    function changeButtonText() {
        if($dataTableScans.getSelectedIds().length > 1){
            $buttonGroupDataTableScans.find('[name=btnDeleteBatch]').find('.btn-name').text(messageController.get("label.batch.delete"));
        } else {
            $buttonGroupDataTableScans.find('[name=btnDeleteBatch]').find('.btn-name').text(messageController.get("label.delete"));
        }
    }

    /***********************************************************************
     * 모달
     ***********************************************************************/
    // modal export result용
    $("#modalExportResult").modalExportResult({
        page : "scans",
        searchOption : searchOption,
        dataTable : $dataTableScans,
        fnGetSelectedIds : function() {
            return $dataTableScans.getSelectedIds("scanId");
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
