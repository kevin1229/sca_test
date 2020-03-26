$(function() {

    var $buttonGroupDataTableJiraServers = $("#buttonGroupDataTableJiraServers");
    var $modalAddJiraServer = $("#modalAddJiraServer");
    var $modalModifyJiraServer = $("#modalModifyJiraServer");

    /***************************************************************************
     * 테이블 버튼
     ***************************************************************************/
    $buttonGroupDataTableJiraServers.find("[name=btnDeleteBatch]").on('click', function() {
        var selectedIds = $dataTableJiraServers.getSelectedIds('jiraServerId');
        if (selectedIds.length == 0) {
            swal(messageController.get('400025'));
            return;
        }

        var requestBody = {};
        if($dataTableJiraServers.isAllSelected()) {
            requestBody.searchOption = searchOption;
        } else {
            requestBody.ids = selectedIds;
        }

        swalDelete({
            url: "/api/1/jira/servers",
            dataTable: $dataTableJiraServers,
            requestBody: requestBody
        });
    });

    /***************************************************************************
     * 테이블 표시
     ***************************************************************************/
    var $dataTableJiraServers = $("#dataTableJiraServers").dataTableController({
        url : "/api/1/jira/servers",
        buttonGroupId: "buttonGroupDataTableJiraServers",
        order : [ [ 2, 'desc' ] ],
        columnDefs: [{
            targets: 0,
            orderable: false,
            className: 'select-checkbox',
            defaultContent: ""
        }, {
            targets: 1, // ID
            visible: false,
            data: "jiraServerId"
        }, {
            targets: 2, // 이름
            data: "jiraServerName",
        }, {
            targets: 3, // Jira Project
            data: "jiraProjectKey",
        }, {
            targets: 4, // URL
            data: 'url'
        }, {
            targets : 5,
            orderable : false,
            className : "extend-button",
            width: '60px',
            render: function(data, type, row, meta) {
                var html = '<span class="btn-modify" style="margin: 0 10px;" data-name="btnModify"><i class="fa fa-pencil-square-o active-hover" aria-hidden="true"></i></span>';
                html += '<span class="btn-delete" style="margin-right:10px;" data-name="btnDelete"><i class="fa fa-trash active-hover" aria-hidden="true"></i></span>';
                return html;
            }
        }],
        createdRow: function(row, data, index) {

            var $row = $(row);

            // 사용자 수정 모달 열기
            $row.on('click', function(e) {
                if(e.target.className.indexOf('select-checkbox') == -1
                    && e.target.className.indexOf('extend-button') == -1) {
                    $modalModifyJiraServer.find('[name=chkChangePassword]').on("change", function() {
                        var disabled = $(this).prop('checked') == false;
                        $modalModifyJiraServer.find('[name=password]').attr('disabled', disabled);
                    });
                    openModalModifyJiraServer(data.jiraServerId);
                }
            });

            // 수정
            $row.find("[data-name=btnModify]").on("click", function(e) {
                openModalModifyJiraServer(data.jiraServerId);
                e.stopPropagation();
            });

            // 삭제
            $row.find("[data-name=btnDelete]").on("click", function(e) {
                swalDelete({
                    url: "/api/1/jira/servers/" + data.jiraServerId,
                    dataTable: $dataTableJiraServers
                });
                e.stopPropagation();
            });
        }
    });

    // 데이터 테이블의 선택/선택해제 이벤트 리스너.
    $dataTableJiraServers.DataTable().on('select', function(e, dt, type, indexes) {
        changeButtonText();
    }).on('deselect', function(e, dt, type, indexes) {
        changeButtonText();
    });

    /**
     * 2개 이상의 ROW가 선택된 경우, 일괄삭제, 일괄수정으로 텍스트 변경.
     * 1개 이하의 ROW가 선택된 경우, 삭제, 수정으로 텍스트 변경.
     */
    function changeButtonText() {
        if($dataTableJiraServers.getSelectedIds().length > 1){
            $buttonGroupDataTableJiraServers.find('[name=btnDeleteBatch]').find('.btn-name').text(messageController.get("label.batch.delete"));
        } else {
            $buttonGroupDataTableJiraServers.find('[name=btnDeleteBatch]').find('.btn-name').text(messageController.get("label.delete"));
        }
    }

    /***************************************************************************
     * 연결테스트 (이슈 컬럼 맵핑 항목 받아오기)
     ***************************************************************************/
    function getIssueColumnItem($modal, projectKey) {

        var requestBody = {};
        requestBody.jiraServerId = $modal.find('[name=jiraServerId]').val();
        requestBody.jiraServerName = $modal.find('[name=jiraServerName]').val();
        requestBody.jiraProjectKey = projectKey;
        requestBody.url = $modal.find('[name=url]').val();
        requestBody.userName = $modal.find('[name=userName]').val();
        requestBody.password = $modal.find('[name=password]').val();

        $.ajaxRest({
            url : "/api/1/jira/servers/issueColumnItems",
            type : "POST",
            data : requestBody,
            beforeSend : function(xhr, settings) {
                errorMsgHandler.clear($modal);
                $modal.find("[data-name=issueColumnMapping] select").attr("disabled", true);
            },
            success : function (data, textStatus, jqXHR) {
                $modal.find("[data-name=issueColumnMapping] select").attr("disabled", false);

                $modal.find("[name=issueTypeStandardCode]").select2Controller({data : data.issueTypeStandards});
                $modal.find("[name=issueTypeSubtaskCode]").select2Controller({data : data.issueTypeSubtasks});

                $modal.find("[name=priorityLevel1Code]").select2Controller({data : data.priorities});
                $modal.find("[name=priorityLevel2Code]").select2Controller({data : data.priorities});
                $modal.find("[name=priorityLevel3Code]").select2Controller({data : data.priorities});
                $modal.find("[name=priorityLevel4Code]").select2Controller({data : data.priorities});
                $modal.find("[name=priorityLevel5Code]").select2Controller({data : data.priorities});

                $modal.find("[name=customPathCode]").select2Controller({data : data.customfields});
                $modal.find("[name=customFileCode]").select2Controller({data : data.customfields});
                $modal.find("[name=customFunctionCode]").select2Controller({data : data.customfields});
                $modal.find("[name=customCheckerCode]").select2Controller({data : data.customfields});
                $modal.find("[name=customStateCode]").select2Controller({data : data.customfields});
                $modal.find("[name=customCheckerDescCode]").select2Controller({data : data.customfields});

                $.toastGreen({
                    text: messageController.get('400043')
                });
            },
            error : function(hdr, status) {
                errorMsgHandler.show($modal, hdr.responseText);
            }
        });
    }

    /***************************************************************************
     * 추가 모달
     ***************************************************************************/
    $modalAddJiraServer.find("[name=issueTypeStandardCode]").select2Controller();
    $modalAddJiraServer.find("[name=jiraProjects]").select2Controller();

    $modalAddJiraServer.find("[name=priorityLevel1Code]").select2Controller();
    $modalAddJiraServer.find("[name=priorityLevel2Code]").select2Controller();
    $modalAddJiraServer.find("[name=priorityLevel3Code]").select2Controller();
    $modalAddJiraServer.find("[name=priorityLevel4Code]").select2Controller();
    $modalAddJiraServer.find("[name=priorityLevel5Code]").select2Controller();

    $modalAddJiraServer.find("[name=customPathCode]").select2Controller();
    $modalAddJiraServer.find("[name=customFileCode]").select2Controller();
    $modalAddJiraServer.find("[name=customFunctionCode]").select2Controller();
    $modalAddJiraServer.find("[name=customCheckerCode]").select2Controller();
    $modalAddJiraServer.find("[name=customStateCode]").select2Controller();
    $modalAddJiraServer.find("[name=customCheckerDescCode]").select2Controller();

    // 연결 테스트
    $modalAddJiraServer.find('[name=btnHealth]').on('click', function(e) {
        getAllProjectsItem($modalAddJiraServer);
    });

    // 저장
    $modalAddJiraServer.find('[name=btnSave]').on('click', function(e) {
        var requestBody = {};
        requestBody.jiraServerName = $modalAddJiraServer.find('[name=jiraServerName]').val();
        requestBody.jiraProjectKey = $modalAddJiraServer.find('[name=jiraProjects]').val();
        requestBody.url = $modalAddJiraServer.find('[name=url]').val();
        requestBody.userName = $modalAddJiraServer.find('[name=userName]').val();
        requestBody.password = $modalAddJiraServer.find('[name=password]').val();

        requestBody.issueTypeStandardCode = $modalAddJiraServer.find('[name=issueTypeStandardCode]').val();
        requestBody.issueTypeSubtaskCode = $modalAddJiraServer.find('[name=issueTypeSubtaskCode]').val();

        requestBody.priorityLevel1Code = $modalAddJiraServer.find('[name=priorityLevel1Code]').val();
        requestBody.priorityLevel2Code = $modalAddJiraServer.find('[name=priorityLevel2Code]').val();
        requestBody.priorityLevel3Code = $modalAddJiraServer.find('[name=priorityLevel3Code]').val();
        requestBody.priorityLevel4Code = $modalAddJiraServer.find('[name=priorityLevel4Code]').val();
        requestBody.priorityLevel5Code = $modalAddJiraServer.find('[name=priorityLevel5Code]').val();

        requestBody.customPathCode = $modalAddJiraServer.find('[name=customPathCode]').val();
        requestBody.customFileCode = $modalAddJiraServer.find('[name=customFileCode]').val();
        requestBody.customFunctionCode = $modalAddJiraServer.find('[name=customFunctionCode]').val();
        requestBody.customCheckerCode = $modalAddJiraServer.find('[name=customCheckerCode]').val();
        requestBody.customStateCode = $modalAddJiraServer.find('[name=customStateCode]').val();
        requestBody.customCheckerDescCode = $modalAddJiraServer.find('[name=customCheckerDescCode]').val();

        $.ajaxRest({
            url : "/api/1/jira/servers/0",
            type : "POST",
            data : requestBody,
            block: true,
            beforeSend : function(xhr, settings) {
                errorMsgHandler.clear($modalAddJiraServer);
            },
            success : function (data, textStatus, jqXHR) {
                $modalAddJiraServer.modal('hide');
                $dataTableJiraServers.draw();
                clearModalAddJiraServer();

                // 클리어 필요
                $.toastGreen({
                    text: messageController.get("label.jira.plugin") + ' ' + data.jiraServerName + ' ' + messageController.get("label.has.been.added")
                });
            },
            error : function(hdr, status) {
                errorMsgHandler.show($modalAddJiraServer, hdr.responseText);
            }
        });
    });

    // 모달창 클리어
    function clearModalAddJiraServer() {
        $modalAddJiraServer.find('[name=jiraServerName]').val("");
        $modalAddJiraServer.find('[name=url]').val("");
        $modalAddJiraServer.find('[name=userName]').val("");
        $modalAddJiraServer.find('[name=password]').val("");

        $modalAddJiraServer.find('[name=issueTypeStandardCode]').select2Controller({refresh : true});
        $modalAddJiraServer.find('[name=issueTypeSubtaskCode]').select2Controller({refresh : true});

        $modalAddJiraServer.find('[name=priorityLevel1Code]').select2Controller({refresh : true});
        $modalAddJiraServer.find('[name=priorityLevel2Code]').select2Controller({refresh : true});
        $modalAddJiraServer.find('[name=priorityLevel3Code]').select2Controller({refresh : true});
        $modalAddJiraServer.find('[name=priorityLevel4Code]').select2Controller({refresh : true});
        $modalAddJiraServer.find('[name=priorityLevel5Code]').select2Controller({refresh : true});

        $modalAddJiraServer.find('[name=customPathCode]').select2Controller({refresh : true});
        $modalAddJiraServer.find('[name=customFileCode]').select2Controller({refresh : true});
        $modalAddJiraServer.find('[name=customFunctionCode]').select2Controller({refresh : true});
        $modalAddJiraServer.find('[name=customCheckerCode]').select2Controller({refresh : true});
        $modalAddJiraServer.find('[name=customStateCode]').select2Controller({refresh : true});
        $modalAddJiraServer.find('[name=customCheckerDescCode]').select2Controller({refresh : true});

        $modalAddJiraServer.find("[data-name=issueColumnMapping] select").attr("disabled", true);
    }

    /***************************************************************************
     * 수정 모달
     ***************************************************************************/
    $modalModifyJiraServer.find("[name=issueTypeStandardCode]").select2Controller();
    $modalModifyJiraServer.find("[name=priorityLevel1Code]").select2Controller();
    $modalModifyJiraServer.find("[name=priorityLevel2Code]").select2Controller();
    $modalModifyJiraServer.find("[name=priorityLevel3Code]").select2Controller();
    $modalModifyJiraServer.find("[name=priorityLevel4Code]").select2Controller();
    $modalModifyJiraServer.find("[name=priorityLevel5Code]").select2Controller();

    $modalModifyJiraServer.find("[name=customPathCode]").select2Controller();
    $modalModifyJiraServer.find("[name=customFileCode]").select2Controller();
    $modalModifyJiraServer.find("[name=customFunctionCode]").select2Controller();
    $modalModifyJiraServer.find("[name=customCheckerCode]").select2Controller();
    $modalModifyJiraServer.find("[name=customStateCode]").select2Controller();
    $modalModifyJiraServer.find("[name=customCheckerDescCode]").select2Controller();

    function openModalModifyJiraServer(jiraServerId) {

        $.ajaxRest({
            url: "/api/1/jira/servers/" + jiraServerId,
            type: "GET",
            beforeSend : function(xhr, settings) {
                errorMsgHandler.clear($modalModifyJiraServer);
            },
            success: function(data, textStatus, header) {
                $modalModifyJiraServer.modal('show');

                $modalModifyJiraServer.find('[name=jiraServerId]').val(data.jiraServerId);
                $modalModifyJiraServer.find('#txtJiraServerId').text(data.jiraServerId);
                $modalModifyJiraServer.find('[name=jiraServerName]').val(data.jiraServerName);
                $modalModifyJiraServer.find('[name=url]').val(data.url);
                $modalModifyJiraServer.find('[name=userName]').val(data.userName);
                $modalModifyJiraServer.find('[name=password]').val("");

                getAllProjectsItem($modalModifyJiraServer);

                $modalModifyJiraServer.find('[name=jiraProjects]').val(data.jiraProjectKey).trigger('change');

                $.ajaxRest({
                    url: "/api/1/jira/servers/" + data.jiraServerId + "/issueColumnItems",
                    type: "GET",
                    beforeSend : function(xhr, settings) {
                        $modalModifyJiraServer.find("[data-name=issueColumnMapping] select").attr("disabled", true);
                    },
                    success: function (items, textStatus, jqXHR) {

                        console.log(items);

                        $modalModifyJiraServer.find("[data-name=issueColumnMapping] select").attr("disabled", false);

                        $modalModifyJiraServer.find("[name=issueTypeStandardCode]").select2Controller({data: items.issueTypeStandards, val: data.issueTypeStandardCode});

                        $modalModifyJiraServer.find("[name=priorityLevel1Code]").select2Controller({data: items.priorities, val: data.priorityLevel1Code});
                        $modalModifyJiraServer.find("[name=priorityLevel2Code]").select2Controller({data: items.priorities, val: data.priorityLevel2Code});
                        $modalModifyJiraServer.find("[name=priorityLevel3Code]").select2Controller({data: items.priorities, val: data.priorityLevel3Code});
                        $modalModifyJiraServer.find("[name=priorityLevel4Code]").select2Controller({data: items.priorities, val: data.priorityLevel4Code});
                        $modalModifyJiraServer.find("[name=priorityLevel5Code]").select2Controller({data: items.priorities, val: data.priorityLevel5Code});

                        $modalModifyJiraServer.find("[name=customPathCode]").select2Controller({data: items.customfields, val: data.customPathCode});
                        $modalModifyJiraServer.find("[name=customFileCode]").select2Controller({data: items.customfields, val: data.customFileCode});
                        $modalModifyJiraServer.find("[name=customFunctionCode]").select2Controller({data: items.customfields, val: data.customFunctionCode});
                        $modalModifyJiraServer.find("[name=customCheckerCode]").select2Controller({data: items.customfields, val: data.customCheckerCode});
                        $modalModifyJiraServer.find("[name=customStateCode]").select2Controller({data: items.customfields, val: data.customStateCode});
                        $modalModifyJiraServer.find("[name=customCheckerDescCode]").select2Controller({data: items.customfields, val: data.customCheckerDescCode});

                        $.toastGreen({
                            text: messageController.get('400043')
                        });
                    },
                    error : function(hdr, status) {
                        errorMsgHandler.show($modalModifyJiraServer, hdr.responseText);
                    }
                });
            }
        });
    }

    function getAllProjectsItem($modal) {
        var requestBody = {};
        requestBody.jiraServerId = $modal.find('[name=jiraServerId]').val();
        requestBody.jiraServerName = $modal.find('[name=jiraServerName]').val();
        requestBody.url = $modal.find('[name=url]').val();
        requestBody.userName = $modal.find('[name=userName]').val();
        requestBody.password = $modal.find('[name=password]').val();

        $.ajaxRest({
            url : "/api/1/jira/servers/projectItems",
            type : "POST",
            async: false,
            data : requestBody,
            beforeSend : function(xhr, settings) {
                errorMsgHandler.clear($modal);
            },
            success : function (data, textStatus, jqXHR) {

                $modal.find("[name=jiraProjects]").select2Controller({data : data});

                $modal.find("[name=jiraProjects]").on('select2:select', function (e) {
                    getIssueColumnItem($modal, e.params.data.id);
                });

                $.toastGreen({
                    text: messageController.get('400043')
                });
            },
            error : function(hdr, status) {
                errorMsgHandler.show($modal, hdr.responseText);
            }
        });
    }

    function getProjectsItem($modal) {
        $.ajaxRest({
            url : "/api/1/jira/servers/" + $modal.find('[name=jiraServerId]').val() + "/projectItems",
            type : "GET",
            beforeSend : function(xhr, settings) {
                errorMsgHandler.clear($modal);
            },
            success : function (data, textStatus, jqXHR) {

                $modal.find("[name=jiraProjects]").select2Controller({data : data});

                $modal.find("[name=jiraProjects]").on('change', function (e) {

                });

                $.toastGreen({
                    text: messageController.get('400043')
                });
            },
            error : function(hdr, status) {
                errorMsgHandler.show($modal, hdr.responseText);
            }
        });
    }

    // 연결 테스트
    $modalModifyJiraServer.find('[name=btnHealth]').on('click', function(e) {
        // getIssueColumnItem($modalModifyJiraServer);
        getProjectsItem($modalModifyJiraServer);
    });

    // 삭제
    $modalModifyJiraServer.find('[name=btnDelete]').on('click', function() {
        var jiraServerId = $modalModifyJiraServer.find('[name=jiraServerId]').val();
        swalDelete({
            url: "/api/1/jira/servers/" + jiraServerId,
            dataTable: $dataTableJiraServers
        });
    });

    // 수정
    $modalModifyJiraServer.find('[name=btnModify]').on('click', function() {
        var requestBody = {};
        requestBody.jiraServerId = $modalModifyJiraServer.find('[name=jiraServerId]').val();
        requestBody.jiraServerName = $modalModifyJiraServer.find('[name=jiraServerName]').val();
        requestBody.jiraProjectKey = $modalModifyJiraServer.find('[name=jiraProjects]').val();
        requestBody.url = $modalModifyJiraServer.find('[name=url]').val();
        requestBody.userName = $modalModifyJiraServer.find('[name=userName]').val();
        requestBody.password = $modalModifyJiraServer.find('[name=password]').val();

        requestBody.issueTypeStandardCode = $modalModifyJiraServer.find('[name=issueTypeStandardCode]').val();

        requestBody.priorityLevel1Code = $modalModifyJiraServer.find('[name=priorityLevel1Code]').val();
        requestBody.priorityLevel2Code = $modalModifyJiraServer.find('[name=priorityLevel2Code]').val();
        requestBody.priorityLevel3Code = $modalModifyJiraServer.find('[name=priorityLevel3Code]').val();
        requestBody.priorityLevel4Code = $modalModifyJiraServer.find('[name=priorityLevel4Code]').val();
        requestBody.priorityLevel5Code = $modalModifyJiraServer.find('[name=priorityLevel5Code]').val();

        requestBody.customPathCode = $modalModifyJiraServer.find('[name=customPathCode]').val();
        requestBody.customFileCode = $modalModifyJiraServer.find('[name=customFileCode]').val();
        requestBody.customFunctionCode = $modalModifyJiraServer.find('[name=customFunctionCode]').val();
        requestBody.customCheckerCode = $modalModifyJiraServer.find('[name=customCheckerCode]').val();
        requestBody.customStateCode = $modalModifyJiraServer.find('[name=customStateCode]').val();
        requestBody.customCheckerDescCode = $modalModifyJiraServer.find('[name=customCheckerDescCode]').val();

        $.ajaxRest({
             url : "/api/1/jira/servers/" + requestBody.jiraServerId,
             type : "PUT",
             data : requestBody,
             block : true,
             beforeSend : function(xhr, settings) {
                 errorMsgHandler.clear($modalModifyJiraServer);
             },
             success : function (data, textStatus, jqXHR) {
                 $modalModifyJiraServer.modal('hide');
                 $dataTableJiraServers.draw();
                 $.toastGreen({
                     text: messageController.get("label.jira.plugin") + ' ' + data.jiraServerName + ' ' + messageController.get("label.has.been.modified")
                 });
             },
             error : function(hdr, status) {
                 errorMsgHandler.show($modalModifyJiraServer, hdr.responseText);
             }
         });
    });

});