$(function() {

    var projectId = $("#projectId").val();

    // 최근 탐색 프로젝트 결과에 추가
    recentQueue.setItem("P", projectId);

    /***************************************************************************
     * 변수
     ***************************************************************************/
    SearchOption = function() {
        this.scanUserName = null;
        this.projectId = projectId;
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
            this.scanUserName = null;
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
    var $buttonGroupDataTableScans = $('#buttonGroupDataTableScans');

    /******************************************************************
     * 컨포넌트
     ******************************************************************/
    // 프로젝트 상세 검색 : 분석 시작 일시
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
    // 간단 검색
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
        searchOption.scanUserName = $dropdownSearchOptionScans.find("[name=txtSearchShort]").val();

        clearSearchOption();
        showSearchCondition();

        $dataTableScans.draw();
    }

    // 분석 결과 검색  드롭다운 버튼 : (분석 결과) 검색
    $dropdownSearchOptionScans.find("[name=btnSearch]").on('click', function(e) {
        searchOption.clear();
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

    // 분석 결과 검색  드롭다운 버튼 : (분석 결과) 재설정
    $dropdownSearchOptionScans.find("[name=btnClear]").on('click', function() {
        clearSearchOption();
    });

    function clearSearchOption() {
        $dropdownSearchOptionScans.find('[name=txtSearchShort]').val("");
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

        // 분석자명
        if(searchOption.scanUserName != null && searchOption.scanUserName != "") {
            $('#searchCondition [name=scanUserName]').text(searchOption.scanUserName);
            $('#searchCondition [name=scanUserName]').parent().show();
            $('#searchCondition').css('display', 'inline-block');
        }

        // 분석시작일시 from
        if(searchOption.fromDateTime != null && searchOption.fromDateTime != "") {
            $('#searchCondition [name=fromDateTime]').text(moment(new Date(searchOption.fromDateTime)).format('YYYY-MM-DD HH:mm'));
            $('#searchCondition [name=fromDateTime]').parent().show();
            $('#searchCondition').css('display', 'inline-block');
        }

        // 분석시작일시 to
        if(searchOption.toDateTime != null && searchOption.toDateTime != "") {
            $('#searchCondition [name=toDateTime]').text(moment(new Date(searchOption.toDateTime)).format('YYYY-MM-DD HH:mm'));
            $('#searchCondition [name=toDateTime]').parent().show();
            $('#searchCondition').css('display', 'inline-block');
        }

        // 관리자 권한
        if(searchOption.managerUserOrGroupIds != null && searchOption.managerUserOrGroupIds.length != 0) {
            var texts = getSelectTexts($dropdownSearchOptionScans.find("[name=managerUserOrGroupIds]"), searchOption.managerUserOrGroupIds);
            $('#searchCondition [name=managerUserOrGroupIds]').text(texts.join(', '));
            $('#searchCondition [name=managerUserOrGroupIds]').parent().show();
            $('#searchCondition').css('display', 'inline-block');
        }

        // 분석자 권한
        if(searchOption.analyzerUserOrGroupIds != null && searchOption.analyzerUserOrGroupIds.length != 0) {
            var texts = getSelectTexts($dropdownSearchOptionScans.find("[name=analyzerUserOrGroupIds]"), searchOption.analyzerUserOrGroupIds);
            $('#searchCondition [name=analyzerUserOrGroupIds]').text(texts.join(', '));
            $('#searchCondition [name=analyzerUserOrGroupIds]').parent().show();
            $('#searchCondition').css('display', 'inline-block');
        }

        // 프로그램 언어
        if(searchOption.programLangIds != null && searchOption.programLangIds.length != 0) {
            var texts = getSelectTexts($dropdownSearchOptionScans.find("[name=programLangIds]"), searchOption.programLangIds);
            $('#searchCondition [name=programLangIds]').text(texts.join(', '));
            $('#searchCondition [name=programLangIds]').parent().show();
            $('#searchCondition').css('display', 'inline-block');
        }

        // 분석자
        if(searchOption.scanUserIds != null && searchOption.scanUserIds.length != 0) {
            var texts = getSelectTexts($dropdownSearchOptionScans.find("[name=scanUserIds]"), searchOption.scanUserIds);
            $('#searchCondition [name=scanUserIds]').text(texts.join(', '));
            $('#searchCondition [name=scanUserIds]').parent().show();
            $('#searchCondition').css('display', 'inline-block');
        }

        // 체커 그룹명
        if(searchOption.checkerGroupNames != null && searchOption.checkerGroupNames.length != 0) {
            var texts = getSelectTexts($dropdownSearchOptionScans.find("[name=checkerGroupNames]"), searchOption.checkerGroupNames);
            $('#searchCondition [name=checkerGroupNames]').text(texts.join(', '));
            $('#searchCondition [name=checkerGroupNames]').parent().show();
            $('#searchCondition').css('display', 'inline-block');
        }

        // 클라이언트 IP
        if(searchOption.clientIps != null && searchOption.clientIps.length != 0) {
            var texts = getSelectTexts($dropdownSearchOptionScans.find("[name=clientIps]"), searchOption.clientIps);
            $('#searchCondition [name=clientIps]').text(texts.join(', '));
            $('#searchCondition [name=clientIps]').parent().show();
            $('#searchCondition').css('display', 'inline-block');
        }

        // 빌드 경로
        if(searchOption.buildPath != null && searchOption.buildPath != "") {
            $('#searchCondition [name=buildPath]').text(searchOption.buildPath);
            $('#searchCondition [name=buildPath]').parent().show();
            $('#searchCondition').css('display', 'inline-block');
        }
    }

    // Dropdown 닫기 방지 : common.js
    stopHideDropDown($dropdownSearchOptionScans);

    /***************************************************************************
     *  테이블 버튼
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
            className : "dt-head-center"
        }, {
            targets : 2, // 프로그램 언어
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
            targets : 3, // 분석자
            orderable : true,
            data : "scanUserName",
            render : function(data, type, row) {
                if (data == null)
                    return row.scanUserId;
                return data.escapeHTML() + "(" + row.scanUserId + ")";
            }
        }, {
            targets : 4, // 진행 사항
            orderable : true,
            data : "progressPercent",
            className : "dt-head-right",
            render : function(data, type, row) {
                if (data == null)
                    return '-';
                return data + "%";
            }
        }, {
            targets : 5, // 신규 이슈
            visible : false,
            data: "newIssueCount",
            className: "dt-head-right",
            render: function(data, type, row) {
                if (data == null)
                    return '-';
                return getLinkNewIssueCount(row);
            }
        }, {
            targets : 6, // 전체 이슈
            data : "issueCount",
            className : "dt-head-right",
            render : function(data, type, row) {
                if (data == null)
                    return '-';
                return getLinkAllIssueCount(row);
            }
        }, {
            targets : 7, // LV1
            data : "risk1IssueCount",
            className : "dt-head-right",
            render : function(data, type, row) {
                if (data == null)
                    return '-';
                return getLinkRiskIssueCount({risk: "1", value: data, scanId: row.scanId});
            }
        }, {
            targets : 8, // LV2
            data : "risk2IssueCount",
            className : "dt-head-right",
            render : function(data, type, row) {
                if (data == null)
                    return '-';
                return getLinkRiskIssueCount({risk: "2", value: data, scanId: row.scanId});
            }
        }, {
            targets : 9, // LV3
            data : "risk3IssueCount",
            className : "dt-head-right",
            render : function(data, type, row) {
                if (data == null)
                    return '-';
                return getLinkRiskIssueCount({risk: "3", value: data, scanId: row.scanId});
            }
        }, {
            targets : 10,
            data : "risk4IssueCount", // LV4
            className : "dt-head-right",
            render: function(data, type, row) {
                if (data == null)
                    return '-';
                return getLinkRiskIssueCount({risk: "4", value: data, scanId: row.scanId});
            }
        }, {
            targets : 11,
            data : "risk5IssueCount", // LV5
            className : "dt-head-right",
            render: function(data, type, row) {
                if (data == null)
                    return '-';
                return getLinkRiskIssueCount({risk: "5", value: data, scanId: row.scanId});
            }
        }, {
            targets : 12,  // 분석 시작 일시
            visible : false,
            data : "startDateTime",
            className : "dt-head-center",
            render : function(data, type, row) {
                if (data == null)
                    return '-';
                return momentController.timestampFormat(data, 'YYYY-MM-DD HH:mm:ss');
            }
        }, {
            targets : 13, // 분석 종료 일시
            data : "endDateTime",
            className : "dt-head-center",
            render : function(data, type, row) {
                if (data == null)
                    return '-';
                return momentController.timestampFormat(data, 'YYYY-MM-DD HH:mm:ss');
            }
        }, {
            targets : 14, // 분석 시간
            visible : false,
            data : "analysisTime",
            className : "dt-head-center",
            render : function(data, type, row) {
                if (row.endDateTime == null || row.startDateTime == null)
                    return '-';
                return momentController.durationTime(data);
            }
        }, {
            targets : 15, // 체커 그룹
            data : "checkerGroupText",
            sortKey: "checkerGroupName"
        }, {
            targets : 16, // 분석 방식
            visible: false,
            data : "scanModeCode",
            className : "dt-head-center",
            render : function(data, type, row) {
                return messageController.get("item.scan.mode." + data);
            }
        }, {
            targets : 17, // 클라이언트 IP
            visible: false,
            data : "clientIp"
        }, {
            targets : 18, // 소수 파일 수
            data : "fileCount",
            className : "dt-head-right",
            render : function(data, type, row) {
                if (data == null)
                    return '-';
                return getLinkFileCount(row);
            }
        }, {
            targets : 19, // 빌드 라인 수
            data : "buildLoc",
            className : "dt-head-center",
            render : function(data, type, row) {
                if (data == null)
                    return '-';
                return getLinkBuildLoc(row);
            }
        }, {
            targets : 20, // 빌드 경로
            visible : false,
            data : "buildPath"
        }, {
            targets : 21,
            orderable : false,
            className : "extend-button",
            width : '30px',
            render : function(data, type, row, meta) {
                return '<span data-name="btnDelete" class="btn-delete"><i class="fa fa-trash active-hover" aria-hidden="true"></i></span>';
            }
        } ],
        createdRow : function (row, data, index) {

            var $row = $(row);

            // 분석 요약 정보으로 이동
            $row.on('click', function(e) {
                if(e.target.className.indexOf('select-checkbox') == -1
                        && e.target.className.indexOf('extend-button') == -1) {
                    $(window).attr('location', '/scans/' + data.scanId + '/info');
                }
            });

            // 삭제
            $row.find("[data-name=btnDelete]").on("click", function(e) {
                var options = {
                    url: "/api/1/scans/" + data.scanId,
                    dataTable: $dataTableScans
                };
                if (data.progressPercent != 100) {
                    options.beforeSend = function() {
                        swalDelete({
                            title: messageController.get('confirm.scan.1'),
                            url: "/api/1/scans/" + data.scanId,
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
    }).on('deselect', function ( e, dt, type, indexes ) {
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
            return $dataTableScans.getSelectedIds('scanId');
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
