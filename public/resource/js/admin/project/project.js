
$(function() {

    /***************************************************************************
     * 변수
     ***************************************************************************/
    SearchOption = function() {
        this.projectName = null;
        this.checkerGroupIds = [];
        this.issueStatusGroupIds = [];
        this.allUserGroupYns = [];
        this.vcsCheckYns = [];
    };
    SearchOption.prototype = {
        clear : function() {
            this.projectName = null;
            this.checkerGroupIds = [];
            this.issueStatusGroupIds = [];
            this.allUserGroupYns = [];
            this.vcsCheckYns = [];
        }
    };
    var searchOption = new SearchOption();

    var $dropdownSearchOptionProjects = $('#dropdownSearchOptionProjects');
    var $buttonGroupDataTableProjects = $('#buttonGroupDataTableProjects');

    /******************************************************************
     * 주요 정보 표시
     ******************************************************************/
    // 프로젝트 사용자(관리자, 분석자, 열람자)
    $.ajaxRest({
        url : "/api/1/projects/count",
        type : "GET",
        success : function(data, textStatus, header) {
            var $divProjectCount = $('#divProjectCount');
            $divProjectCount.html($divProjectCount.clone().html().compose(data));
            $divProjectCount.css('visibility', 'visible');
        }
    });

    /******************************************************************
     * 공통
     ******************************************************************/
    // 체커 그룹
    $.ajaxRest({
        url : "/api/1/checkers/groups/items",
        type : "GET",
        success : function(data, textStatus, header) {
            $dropdownSearchOptionProjects.find('[name=checkerGroupIds]').select2Controller({ multiple: true, data: data });
        }
    });

    // 이슈 상태 그룹
    $.ajaxRest({
        url : "/api/1/issues/status/groups/items",
        type : "GET",
        success : function(data, textStatus, header) {
            $dropdownSearchOptionProjects.find('[name=issueStatusGroupIds]').select2Controller({ multiple: true, data: data });
        }
    });

    // 전체 공유
    $dropdownSearchOptionProjects.find('[name=allUserGroupYns]').select2Controller({
        multiple: true,
        data: [{
            id: "Y",
            text: messageController.get("item.user.group.all.Y")
        }, {
            id: "N",
            text: messageController.get("item.user.group.all.N")
        }]
    });

    // 이관 제어
    $dropdownSearchOptionProjects.find('[name=vcsCheckYns]').select2Controller({
        multiple: true,
        data: [{
            id: "Y",
            text: messageController.get("item.vcs.check.Y")
        }, {
            id: "N",
            text: messageController.get("item.vcs.check.N")
        }]
    });

    /******************************************************************
     * 검색
     ******************************************************************/
    $dropdownSearchOptionProjects.find('[name=txtSearchShort]').on('keydown', function(e) {
        var code = e.keyCode || e.which;
        if (code == 13) { // ENTER
            searchShort();
        }
    });

    $dropdownSearchOptionProjects.find('[name=btnSearchShort]').on('click', function() {
        searchShort();
    });

    function searchShort() {
        searchOption.clear();
        searchOption.projectName = $dropdownSearchOptionProjects.find('[name=txtSearchShort]').val();

        clearSearchOption();
        showSearchCondition();

        $dataTableProjects.draw();
    }

    // 검색  드롭다운 버튼 : 검색
    $dropdownSearchOptionProjects.find("[name=btnSearch]").on('click', function(e) {
        searchOption.clear();
        searchOption.projectName = $dropdownSearchOptionProjects.find('[name=projectName]').val();
        searchOption.checkerGroupIds = $dropdownSearchOptionProjects.find('[name=checkerGroupIds]').val();
        searchOption.issueStatusGroupIds = $dropdownSearchOptionProjects.find('[name=issueStatusGroupIds]').val();
        searchOption.allUserGroupYns = $dropdownSearchOptionProjects.find('[name=allUserGroupYns]').val();
        searchOption.vcsCheckYns = $dropdownSearchOptionProjects.find('[name=vcsCheckYns]').val();

        showSearchCondition();
        $dataTableProjects.draw();

        $dropdownSearchOptionProjects.find('[name=txtSearchShort]').val("");
        $dropdownSearchOptionProjects.removeClass('open');
    });

    // 검색  드롭다운 버튼 : 초기화
    $dropdownSearchOptionProjects.find("[name=btnClear]").on('click', function(e) {
        clearSearchOption();
    });

    function clearSearchOption() {
        $dropdownSearchOptionProjects.find('[name=txtSearchShort]').val("");
        $dropdownSearchOptionProjects.find('[name=projectName]').val("");
        $dropdownSearchOptionProjects.find('[name=checkerGroupIds]').val("").trigger('change');
        $dropdownSearchOptionProjects.find('[name=issueStatusGroupIds]').val("").trigger('change');
        $dropdownSearchOptionProjects.find('[name=allUserGroupYns]').val("").trigger('change');
        $dropdownSearchOptionProjects.find('[name=vcsCheckYns]').val("").trigger('change');
    }

    // 현재 검색 기준
    function showSearchCondition() {
        $('#searchCondition').hide();
        $('#searchCondition .searchConditionHead').hide();
        $('#searchCondition .searchCondition').text('');

        if(searchOption == null) {
            return false;
        }

        // 프로젝트명
        if(searchOption.projectName != null && searchOption.projectName != "") {
            $('#searchCondition [name=projectName]').text(searchOption.projectName);
            $('#searchCondition [name=projectName]').parent().show();
            $('#searchCondition').css('display', 'inline-block');
        }

        // 체커 그룹
        if(searchOption.checkerGroupIds != null && searchOption.checkerGroupIds.length != 0) {
            var texts = getSelectTexts($dropdownSearchOptionProjects.find("[name=checkerGroupIds]"), searchOption.checkerGroupIds);
            $('#searchCondition [name=checkerGroupIds]').text(texts.join(', '));
            $('#searchCondition [name=checkerGroupIds]').parent().show();
            $('#searchCondition').css('display', 'inline-block');
        }

        // 이슈 상태 그룹
        if(searchOption.issueStatusGroupIds != null && searchOption.issueStatusGroupIds.length != 0) {
            var texts = getSelectTexts($dropdownSearchOptionProjects.find("[name=issueStatusGroupIds]"), searchOption.issueStatusGroupIds);
            $('#searchCondition [name=issueStatusGroupIds]').text(texts.join(', '));
            $('#searchCondition [name=issueStatusGroupIds]').parent().show();
            $('#searchCondition').css('display', 'inline-block');
        }

        // 전체 공개
        if(searchOption.allUserGroupYns != null && searchOption.allUserGroupYns.length != 0) {
            var texts = getSelectTexts($dropdownSearchOptionProjects.find("[name=allUserGroupYns]"), searchOption.allUserGroupYns);
            $('#searchCondition [name=allUserGroupYns]').text(texts.join(', '));
            $('#searchCondition [name=allUserGroupYns]').parent().show();
            $('#searchCondition').css('display', 'inline-block');
        }

        // 이관 제어
        if(searchOption.vcsCheckYns != null && searchOption.vcsCheckYns.length != 0) {
            var texts = getSelectTexts($dropdownSearchOptionProjects.find("[name=vcsCheckYns]"), searchOption.vcsCheckYns);
            $('#searchCondition [name=vcsCheckYns]').text(texts.join(', '));
            $('#searchCondition [name=vcsCheckYns]').parent().show();
            $('#searchCondition').css('display', 'inline-block');
        }
    }

    // Dropdown 닫기 방지 : common.js
    stopHideDropDown($dropdownSearchOptionProjects);

    /***************************************************************************
     * 프로젝트 데이터 테이블 관련 버튼 이벤트
     ***************************************************************************/
    // 프로젝트 목록 : 일괄 수정 (모달 열림)
    $buttonGroupDataTableProjects.find('[name=btnModalModifyBatch]').on('click', function(e) {
        var selectedProjectIds = $dataTableProjects.getSelectedIds('projectId');

        if(selectedProjectIds.length == 0) {
            swal({
                type: "warning",
                title: messageController.get('405011')
            });
        } else if(selectedProjectIds.length == 1) {
            // 1건이면 1건 수정이 나온다.
            modalModifyProject.openModal(selectedProjectIds[0]);
        } else {
            modalBatchModifyProject.openModelProjectBatchModify(selectedProjectIds, searchOption);
        }
    });

    // 프로젝트 목록 : 일괄 삭제
    $buttonGroupDataTableProjects.find('[name=btnDeleteBatch]').on('click', function() {
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
     * 데이터 테이블
     ***************************************************************************/
    var $dataTableProjects = $("#dataTableProjects").dataTableController({
        url : "/api/1/projects/admin",
        searchOption : searchOption,
        buttonGroupId: "buttonGroupDataTableProjects",
        ordering: false,
        columnDefs : [ {
            targets: 0,
            orderable: false,
            className: 'select-checkbox',
            defaultContent : ""
        }, {
            targets: 1, // ID
            visible: false,
            orderable: false,
            data: "projectId",
            render : $.fn.dataTable.render.text()
        }, {
            targets: 2, // 프로젝트명
            orderable: false,
            data: "projectName",
            className: "name",
            render: function(data, type, row) {
                var title = null;
                if (row.parentProjectNamePath == null) {
                    title = '';
                } else {
                    title = ' title="' + row.parentProjectNamePath + '"';
                }
                return '<div class="project-tree idnt-' + row.parentProjectDepth + '"><i class="fa fa-caret-right"></i> <span data-toggle="tooltip" data-container="body"' + title + '>' + data.escapeHTML() + ' (' + row.projectKey + ')</span></div>';
            }
        }, {
            targets: 3, // 관리 전용
            orderable: false,
            data: "managementOnlyYn",
            className: "dt-head-center",
            render: function(data, type, row) {
                return data == "Y"? "ON":"OFF";
            }
        }, {
            targets: 4, // 분석 수
            orderable: false,
            data: "scanCount",
            className: "dt-head-right",
            render: function(data, type, row) {
                if (data == null)
                    return '-';
                return data.format();
            }
        }, {
            targets: 5, // 체커 그룹
            orderable: false,
            data: "checkerGroup",
            render: function(data, type, row) {
                return data.checkerGroupName;
            }
        }, {
            targets: 6, // 이슈 상태 그룹
            orderable: false,
            data: "issueStatusGroup",
            render: function(data, type, row) {
                if(data.sharingYn == "N") {
                    return '-';
                }
                return data.issueStatusGroupName;
            }
        }, {
            targets: 7, // 젠체 공유
            orderable: false,
            data: "allUserGroupYn",
            className: "dt-head-center",
            render: function(data, type, row) {
                return messageController.get("item.user.group.all." + data);
            }
        }, {
            targets: 8, // 이관 제어
            orderable: false,
            data: "vcsCheckYn",
            className: "dt-head-center",
            render: function(data, type, row) {
                return messageController.get("item.vcs.check." + data);
            }
        }, {
            targets: 9, // 생성 일시
            orderable: false,
            data: "insertDateTime",
            className: "dt-head-center",
            render: function(data, type, row) {
                return momentController.timestampFormat(data, 'YYYY-MM-DD HH:mm:ss');
            }
        }, {
            targets: 10,
            orderable: false,
            className: "extend-button",
            width: '60px',
            render: function(data, type, row, meta) {
                var html = '<span class="btn-modify" style="margin: 0 10px;" data-name="btnModify"><i class="fa fa-pencil-square-o active-hover" aria-hidden="true"></i></span>';
                html += '<span class="btn-delete" style="margin-right:10px;" data-name="btnDelete"><i class="fa fa-trash active-hover" aria-hidden="true"></i></span>';
                return html;
            }
        }],
        createdRow: function ( row, data, index ) {
            var $row = $(row);

            // 사용자 정보&수정 실행
            $row.on('click', function(e) {
                if(e.target.className.indexOf('select-checkbox') == -1
                    && e.target.className.indexOf('extend-button') == -1
                    && e.target.className.indexOf('btn') == -1) {
                    modalModifyProject.openModal(data.projectId);
                    e.stopPropagation();
                }
            });

            // 수정
            $row.find("[data-name=btnModify]").on("click", function(e) {
                modalModifyProject.openModal(data.projectId);
                e.stopPropagation();
            });

            // 삭제
            $row.find("[data-name=btnDelete]").on("click", function(e) {
                swalDelete({
                    url: "/api/1/projects/" + data.projectId,
                    dataTable: $dataTableProjects
                });
                e.stopPropagation();
            });
        }
    });

    // 데이터 테이블의 선택/선택해제 이벤트 리스너.
    $dataTableProjects.DataTable().on('select', function(e, dt, type, indexes) {
        changeButtonText();
    }).on('deselect', function ( e, dt, type, indexes ) {
        changeButtonText();
    });

    /**
     * 2개 이상의 ROW가 선택된 경우, 일괄삭제, 일괄수정으로 텍스트 변경.
     * 1개 이하의 ROW가 선택된 경우, 삭제, 수정으로 텍스트 변경.
     */
    function changeButtonText() {
        if($dataTableProjects.getSelectedIds().length > 1) {
            $buttonGroupDataTableProjects.find('[name=btnModalModifyBatch]').find('.btn-name').text(messageController.get("label.batch.modify"));
            $buttonGroupDataTableProjects.find('[name=btnDeleteBatch]').find('.btn-name').text(messageController.get("label.batch.delete"));
        } else {
            $buttonGroupDataTableProjects.find('[name=btnModalModifyBatch]').find('.btn-name').text(messageController.get("label.modify"));
            $buttonGroupDataTableProjects.find('[name=btnDeleteBatch]').find('.btn-name').text(messageController.get("label.delete"));
        }
    }

    /***************************************************************************
     * 모달:모달 화면하고 연결
     ***************************************************************************/
    modalAddProject.setDataTableProjects($dataTableProjects);
    modalModifyProject.setDataTableProjects($dataTableProjects);
    modalBatchModifyProject.setDataTableProjects($dataTableProjects);

    /**
     * 현재 검색 결과 초기화 이벤트
     */
    $('#searchOptionClear').click(function () {
        clearSearchOption();
        $('button[name=btnSearch]').trigger('click');
    });
});
