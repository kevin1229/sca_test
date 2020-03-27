
$(function() {

    var $buttonGroupDataTableEngineServers = $("#buttonGroupDataTableEngineServers");
    var $modalAddEngineServer = $("#modalAddEngineServer");
    var $modalModifyEngineServer = $("#modalModifyEngineServer");

    /***************************************************************************
     * 테이블 버튼
     ***************************************************************************/
    // 엔진 서버 상태 확인.
    $buttonGroupDataTableEngineServers.find('[name=btnRefreshServerStatus]').on('click', function(e){
        $dataTableEngineServers.draw();
    });

    /***************************************************************************
     * 테이블 표시
     ***************************************************************************/
    var $dataTableEngineServers = $("#dataTableEngineServers").dataTableController({
        url : "/api/1/engine/servers",
        buttonGroupId: "buttonGroupDataTableEngineServers",
        order : [ [ 2, 'desc' ] ],
        buttons : [],
        dom : 'iB<"top">rt<"bottom"><"clear">',
        columnDefs: [{
            targets : 0, // ID
            data : "engineServerId",
            className : "dt-head-right"
        }, {
            targets : 1,
            orderable : false,
            className : "dt-head-center",
            width: '120px',
            render: function(data, type, row){
                return '<span data-name="status"><i class="fa fa-circle-o-notch fa-spin fa-3x fa-fw"></i></span>'
            }
        }, {
            targets: 2, // 이름
            data: "url",
        }, {
            targets: 3, // URL
            data: 'engineServerComment',
        }, {
            targets: 4, // 수정 삭제 버튼
            className: "extend-button",
            width : "70px",
            render: function(data, type, row){
                var html = '<span data-name="btnModify" class="btn-modify" style="margin-right:10px;"><i class="fa fa-pencil-square-o active-hover" aria-hidden="true"></i></span>';
                html += '<span data-name="btnDelete" class="btn-delete" style="margin-right:10px;"><i class="fa fa-trash active-hover" aria-hidden="true"></i></span>';
                return html;
            }
        }],
        createdRow: function(row, data, index) {
            var $row = $(row);

            // 연결 체크
            $.ajaxRest({
                url : "/api/1/engine/servers/health",
                type : "POST",
                data: { url: data.url },
                success : function(data, textStatus, jqXHR) {
                    var html = null;
                    if(data) {
                        html = '<span class="connection connection-success">' + messageController.get('label.connection.success') + '</span>';
                    } else{
                        html = '<span class="connection connection-fail">' + messageController.get('label.connection.failed') + '</span>';
                    }
                    $row.find("[data-name=status]").html(html);
                }
            });

            // 수정 모달 열기
            $row.on('click', function(e) {
                if(e.target.className.indexOf('select-checkbox') == -1
                            && e.target.className.indexOf('extend-button') == -1) {
                    openModalModifyEngineServer(data.engineServerId);
                }
            });

            // 수정
            $row.find("[data-name=btnModify]").on("click", function(e) {
                openModalModifyEngineServer(data.engineServerId);
                e.stopPropagation();
            });

            // 삭제 이벤트 호출
            $row.find("[data-name=btnDelete]").on('click', function(e) {
                swalDelete({
                    url: "/api/1/engine/servers/" + data.engineServerId,
                    dataTable: $dataTableEngineServers
                });
                e.stopPropagation();
            });
        }
    });

    /***************************************************************************
     * 추가 모달
     ***************************************************************************/
    $modalAddEngineServer.find("[name=btnSaveContinue]").on('click', function(e) {
        createEngineServer(true);
    });

    // Alt+W 저장하고 계속 이벤트
    $modalAddEngineServer.on('keydown', function(key) {
        if ((event.which === 87 && event.altKey)) {
            createEngineServer(true);
        }
    });

    $modalAddEngineServer.find('[name=btnSave]').on('click', function() {
        createEngineServer(false);
    });

    function createEngineServer(saveContinueMode) {
        var requestBody = {};
        requestBody.url = $modalAddEngineServer.find('[name=url]').val();
        requestBody.engineServerComment = $modalAddEngineServer.find('[name=engineServerComment]').val();

        $.ajaxRest({
            url: "/api/1/engine/servers/0",
            type: "POST",
            data: requestBody,
            block: true,
            beforeSend: function (xhr, settings) {
                errorMsgHandler.clear($modalAddEngineServer);
            },
            success: function (data, textStatus, jqXHR) {

                // 모달 클리어
                $modalAddEngineServer.find('[name=url]').val("");
                $modalAddEngineServer.find('[name=engineServerComment]').val("");

                // 추가하고 다음
                if (saveContinueMode == false) {
                    $modalAddEngineServer.modal('hide');
                }
                $dataTableEngineServers.draw();

                $.toastGreen({
                    text: messageController.get("label.remote.engine")  + ' ' + requestBody.url + ' ' + messageController.get("label.has.been.added")
                });
            },
            error: function (hdr, status) {
                errorMsgHandler.show($modalAddEngineServer, hdr.responseText);
            }
        });
    }

    /***************************************************************************
     * 수정 모달
     ***************************************************************************/
    function openModalModifyEngineServer(engineServerId) {
        $.ajaxRest({
            url : "/api/1/engine/servers/" + engineServerId,
            type : "GET",
            beforeSend : function(xhr, settings) {
                errorMsgHandler.clear($modalModifyEngineServer);
            },
            success : function(data, textStatus, header) {
                $modalModifyEngineServer.modal('show');

                $modalModifyEngineServer.find('[name=engineServerId]').val(data.engineServerId);
                $modalModifyEngineServer.find('#txtEngineServerId').text(data.engineServerId);
                $modalModifyEngineServer.find('[name=url]').val(data.url);
                $modalModifyEngineServer.find('[name=engineServerComment]').val(data.engineServerComment);
            }
        });
    }

    $modalModifyEngineServer.find('[name=btnModify]').on('click', function() {
        var requestBody = {};
        requestBody.engineServerId = $modalModifyEngineServer.find('[name=engineServerId]').val();
        requestBody.url = $modalModifyEngineServer.find('[name=url]').val();
        requestBody.engineServerComment = $modalModifyEngineServer.find('[name=engineServerComment]').val();

         $.ajaxRest({
             url : "/api/1/engine/servers/" + requestBody.engineServerId,
             type : "PUT",
             data : requestBody,
             block : true,
             beforeSend : function(xhr, settings) {
                 errorMsgHandler.clear($modalModifyEngineServer);
             },
             success : function (data, textStatus, jqXHR) {
                 $.toastGreen({
                     text: messageController.get("label.remote.engine") + ' ' + requestBody.engineServerId + ' ' + messageController.get("label.has.been.modified")
                 });
                 $modalModifyEngineServer.modal('hide');
                 $dataTableEngineServers.draw();
             },
             error : function(hdr, status) {
                 errorMsgHandler.show($modalModifyEngineServer, hdr.responseText);
             }
         });
    });

    $modalModifyEngineServer.find('[name=btnDelete]').on('click', function() {
        swalDelete({
            url: "/api/1/engine/servers/" + $modalModifyEngineServer.find('[name=engineServerId]').val(),
            dataTable: $dataTableEngineServers
        });
    });
});
