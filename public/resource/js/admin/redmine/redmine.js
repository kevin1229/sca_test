$(function() {

    var $buttonGroupDataTableRedmineServers = $("#buttonGroupDataTableRedmineServers");
    var $modalAddRedmineServer = $("#modalAddRedmineServer");
    var $modalModifyRedmineServer = $("#modalModifyRedmineServer");

    /***************************************************************************
     * 테이블 버튼
     ***************************************************************************/
    $buttonGroupDataTableRedmineServers.find("[name=btnDeleteBatch]").on('click', function() {
        var selectedIds = $dataTableRedmineServers.getSelectedIds('redmineServerId');
        if (selectedIds.length == 0) {
            swal(messageController.get('400025'));
            return;
        }

        var requestBody = {};
        if($dataTableRedmineServers.isAllSelected()) {
            requestBody.searchOption = searchOption;
        } else {
            requestBody.ids = selectedIds;
        }

        swalDelete({
            url: "/api/1/redmine/servers",
            dataTable: $dataTableRedmineServers,
            requestBody: requestBody
        });
    });

    /***************************************************************************
     * 테이블 표시
     ***************************************************************************/
    var $dataTableRedmineServers = $("#dataTableRedmineServers").dataTableController({
        url : "/api/1/redmine/servers",
        buttonGroupId: "buttonGroupDataTableRedmineServers",
        order : [ [ 2, 'desc' ] ],
        columnDefs: [{
            targets :   0,
            orderable : false,
            className : 'select-checkbox',
            defaultContent: ""
        }, {
            targets: 1,     // ID
            visible: false,
            data: "redmineServerId"
        }, {
            targets : 2,     // 이름
            data : "redmineServerName",
        }, {
            targets : 3,     // URL
            data: 'url'
        }, {
            targets : 4,
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

            // 수정 모달 열기
            $row.on('click', function(e) {
                if(e.target.className.indexOf('select-checkbox') == -1
                    && e.target.className.indexOf('extend-button') == -1) {
                    openModalModifyRedmineServer(data.redmineServerId);
                    e.stopPropagation();
                }
            });

            // 수정
            $row.find("[data-name=btnModify]").on("click", function(e) {
                openModalModifyRedmineServer(data.redmineServerId);
                e.stopPropagation();
            });

            // 삭제
            $row.find("[data-name=btnDelete]").on("click", function(e) {
                swalDelete({
                    url: "/api/1/redmine/servers/" + data.redmineServerId,
                    dataTable: $dataTableRedmineServers
                });
                e.stopPropagation();
            });
        }
    });

    // 데이터 테이블의 선택/선택해제 이벤트 리스너.
    $dataTableRedmineServers.DataTable().on('select', function(e, dt, type, indexes) {
        changeButtonText();
    }).on('deselect', function(e, dt, type, indexes) {
        changeButtonText();
    });

    /**
     * 2개 이상의 ROW가 선택된 경우, 일괄삭제, 일괄수정으로 텍스트 변경.
     * 1개 이하의 ROW가 선택된 경우, 삭제, 수정으로 텍스트 변경.
     */
    function changeButtonText() {
        if($dataTableRedmineServers.getSelectedIds().length > 1){
            $buttonGroupDataTableRedmineServers.find('[name=btnDeleteBatch]').find('.btn-name').text(messageController.get("label.batch.delete"));
        } else {
            $buttonGroupDataTableRedmineServers.find('[name=btnDeleteBatch]').find('.btn-name').text(messageController.get("label.delete"));
        }
    }

    /***************************************************************************
     * 연결테스트 (이슈 컬럼 맵핑 항목 받아오기)
     ***************************************************************************/
    function getIssueColumnItem($modal) {

        var requestBody = {};
        requestBody.redmineServerName = $modal.find('[name=redmineServerName]').val();
        requestBody.url = $modal.find('[name=url]').val();
        requestBody.userName = $modal.find('[name=userName]').val();
        requestBody.password = $modal.find('[name=password]').val();

        $.ajaxRest({
            url : "/api/1/redmine/servers/issueColumnItems",
            type : "POST",
            data : requestBody,
            beforeSend : function(xhr, settings) {
                errorMsgHandler.clear($modal);
                $modal.find("[data-name=issueColumnMapping] select").attr("disabled", true);
            },
            success : function (data, textStatus, jqXHR) {
                $modal.find("[data-name=issueColumnMapping] select").attr("disabled", false);

                $modal.find("[name=trackerCode]").select2Controller({data : data.trackers});
                $modal.find("[name=priorityLevel1Code]").select2Controller({data : data.issuePriorities});
                $modal.find("[name=priorityLevel2Code]").select2Controller({data : data.issuePriorities});
                $modal.find("[name=priorityLevel3Code]").select2Controller({data : data.issuePriorities});
                $modal.find("[name=priorityLevel4Code]").select2Controller({data : data.issuePriorities});
                $modal.find("[name=priorityLevel5Code]").select2Controller({data : data.issuePriorities});

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
    $modalAddRedmineServer.find("[name=trackerCode]").select2Controller();
    $modalAddRedmineServer.find("[name=priorityLevel1Code]").select2Controller();
    $modalAddRedmineServer.find("[name=priorityLevel2Code]").select2Controller();
    $modalAddRedmineServer.find("[name=priorityLevel3Code]").select2Controller();
    $modalAddRedmineServer.find("[name=priorityLevel4Code]").select2Controller();
    $modalAddRedmineServer.find("[name=priorityLevel5Code]").select2Controller();

    // 연결 테스트
    $modalAddRedmineServer.find('[name=btnHealth]').on('click', function(e) {
        getIssueColumnItem($modalAddRedmineServer);
    });

    // 저장
    $modalAddRedmineServer.find('[name=btnSave]').on('click', function() {
          var requestBody = {};
          requestBody.redmineServerName = $modalAddRedmineServer.find('[name=redmineServerName]').val();
          requestBody.url = $modalAddRedmineServer.find('[name=url]').val();
          requestBody.userName = $modalAddRedmineServer.find('[name=userName]').val();
          requestBody.password = $modalAddRedmineServer.find('[name=password]').val();

          requestBody.trackerCode = $modalAddRedmineServer.find('[name=trackerCode]').val();
          requestBody.priorityLevel1Code = $modalAddRedmineServer.find('[name=priorityLevel1Code]').val();
          requestBody.priorityLevel2Code = $modalAddRedmineServer.find('[name=priorityLevel2Code]').val();
          requestBody.priorityLevel3Code = $modalAddRedmineServer.find('[name=priorityLevel3Code]').val();
          requestBody.priorityLevel4Code = $modalAddRedmineServer.find('[name=priorityLevel4Code]').val();
          requestBody.priorityLevel5Code = $modalAddRedmineServer.find('[name=priorityLevel5Code]').val();

          $.ajaxRest({
              url : "/api/1/redmine/servers/0",
              type : "POST",
              data : requestBody,
              beforeSend : function(xhr, settings) {
                  errorMsgHandler.clear($modalAddRedmineServer);
              },
              success : function (data, textStatus, jqXHR) {
                  $modalAddRedmineServer.modal('hide');
                  $dataTableRedmineServers.draw();
                  clearModalAddRedmineServer();

                  // 클리어 필요
                  $.toastGreen({
                      text: messageController.get("label.redmine.plugin") + ' ' + data.redmineServerName + ' ' + messageController.get("label.has.been.added")
                  });
              },
              error : function(hdr, status) {
                  errorMsgHandler.show($modalAddRedmineServer, hdr.responseText);
              }
          });
    });

    // 모달창 클리어
    function clearModalAddRedmineServer() {
        $modalAddRedmineServer.find('[name=redmineServerName]').val("");
        $modalAddRedmineServer.find('[name=url]').val("");
        $modalAddRedmineServer.find('[name=userName]').val("");
        $modalAddRedmineServer.find('[name=password]').val("");

        $modalAddRedmineServer.find("[name=trackerCode]").select2Controller({refresh : true});
        $modalAddRedmineServer.find("[name=priorityLevel1Code]").select2Controller({refresh : true});
        $modalAddRedmineServer.find("[name=priorityLevel2Code]").select2Controller({refresh : true});
        $modalAddRedmineServer.find("[name=priorityLevel3Code]").select2Controller({refresh : true});
        $modalAddRedmineServer.find("[name=priorityLevel4Code]").select2Controller({refresh : true});
        $modalAddRedmineServer.find("[name=priorityLevel5Code]").select2Controller({refresh : true});

        $modalAddRedmineServer.find("[data-name=issueColumnMapping] select").attr("disabled", true);
    }

    /***************************************************************************
     * 수정 모달
     ***************************************************************************/
    $modalModifyRedmineServer.find("[name=trackerCode]").select2Controller();
    $modalModifyRedmineServer.find("[name=priorityLevel1Code]").select2Controller();
    $modalModifyRedmineServer.find("[name=priorityLevel2Code]").select2Controller();
    $modalModifyRedmineServer.find("[name=priorityLevel3Code]").select2Controller();
    $modalModifyRedmineServer.find("[name=priorityLevel4Code]").select2Controller();
    $modalModifyRedmineServer.find("[name=priorityLevel5Code]").select2Controller();

    function openModalModifyRedmineServer(redmineServerId) {
        $.ajaxRest({
            url: "/api/1/redmine/servers/" + redmineServerId,
            type: "GET",
            beforeSend: function(xhr, settings) {
                errorMsgHandler.clear($modalModifyRedmineServer);
            },
            success: function(data, textStatus, header) {
                $modalModifyRedmineServer.modal('show');

                $modalModifyRedmineServer.find('[name=redmineServerId]').val(data.redmineServerId);
                $modalModifyRedmineServer.find('#txtRedmineServerId').text(data.redmineServerId);
                $modalModifyRedmineServer.find('[name=redmineServerName]').val(data.redmineServerName);
                $modalModifyRedmineServer.find('[name=url]').val(data.url);
                $modalModifyRedmineServer.find('[name=userName]').val(data.userName);
                $modalModifyRedmineServer.find('[name=password]').val("");

                $.ajaxRest({
                    url : "/api/1/redmine/servers/" + data.redmineServerId + "/issueColumnItems",
                    type : "GET",
                    beforeSend : function(xhr, settings) {
                        $modalModifyRedmineServer.find("[data-name=issueColumnMapping] select").attr("disabled", true);
                    },
                    success : function (items, textStatus, jqXHR) {
                        $modalModifyRedmineServer.find("[data-name=issueColumnMapping] select").attr("disabled", false);

                        $modalModifyRedmineServer.find("[name=trackerCode]").select2Controller({data : items.trackers, val : data.trackerCode});
                        $modalModifyRedmineServer.find("[name=priorityLevel1Code]").select2Controller({data: items.issuePriorities, val: data.priorityLevel1Code});
                        $modalModifyRedmineServer.find("[name=priorityLevel2Code]").select2Controller({data: items.issuePriorities, val: data.priorityLevel2Code});
                        $modalModifyRedmineServer.find("[name=priorityLevel3Code]").select2Controller({data: items.issuePriorities, val: data.priorityLevel3Code});
                        $modalModifyRedmineServer.find("[name=priorityLevel4Code]").select2Controller({data: items.issuePriorities, val: data.priorityLevel4Code});
                        $modalModifyRedmineServer.find("[name=priorityLevel5Code]").select2Controller({data: items.issuePriorities, val: data.priorityLevel5Code});

                        $.toastGreen({
                            text: messageController.get('400043')
                        });
                    },
                    error: function(hdr, status) {
                        errorMsgHandler.show($modalModifyRedmineServer, hdr.responseText);
                    }
                });
            }
        });
    }

    // 연결 테스트
    $modalModifyRedmineServer.find('[name=btnHealth]').on('click', function(e) {
        getIssueColumnItem($modalModifyRedmineServer);
    });

    // 삭제
    $modalModifyRedmineServer.find('[name=btnDelete]').on('click', function() {
        var redmineServerId = $modalModifyRedmineServer.find('[name=redmineServerId]').val();
        swalDelete({
            url: "/api/1/redmine/servers/" + redmineServerId,
            dataTable: $dataTableRedmineServers
        });
    });

    // 수정
    $modalModifyRedmineServer.find('[name=btnModify]').on('click', function() {

        var requestBody = {};
        requestBody.redmineServerId = $modalModifyRedmineServer.find('[name=redmineServerId]').val();
        requestBody.redmineServerName = $modalModifyRedmineServer.find('[name=redmineServerName]').val();
        requestBody.url = $modalModifyRedmineServer.find('[name=url]').val();
        requestBody.userName = $modalModifyRedmineServer.find('[name=userName]').val();
        requestBody.password = $modalModifyRedmineServer.find('[name=password]').val();

        requestBody.trackerCode = $modalModifyRedmineServer.find('[name=trackerCode]').val();
        requestBody.priorityLevel1Code = $modalModifyRedmineServer.find('[name=priorityLevel1Code]').val();
        requestBody.priorityLevel2Code = $modalModifyRedmineServer.find('[name=priorityLevel2Code]').val();
        requestBody.priorityLevel3Code = $modalModifyRedmineServer.find('[name=priorityLevel3Code]').val();
        requestBody.priorityLevel4Code = $modalModifyRedmineServer.find('[name=priorityLevel4Code]').val();
        requestBody.priorityLevel5Code = $modalModifyRedmineServer.find('[name=priorityLevel5Code]').val();

         $.ajaxRest({
             url: "/api/1/redmine/servers/" + requestBody.redmineServerId,
             type: "PUT",
             data: requestBody,
             block: true,
             beforeSend: function(xhr, settings) {
                 errorMsgHandler.clear($modalModifyRedmineServer);
             },
             success: function (data, textStatus, jqXHR) {
                 $modalModifyRedmineServer.modal('hide');
                 $dataTableRedmineServers.draw();
                 $.toastGreen({
                     text: messageController.get("label.redmine.plugin") + ' ' + data.redmineServerName + ' ' + messageController.get("label.has.been.modified")
                 });
             },
             error: function(hdr, status) {
                 errorMsgHandler.show($modalModifyRedmineServer, hdr.responseText);
             }
         });
    });
});