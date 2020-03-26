
$(function() {

    var $buttonGroupDataTableAgentServers = $("#buttonGroupDataTableAgentServers");

    /***************************************************************************
     * 테이블 버튼
     ***************************************************************************/
    // Agent 서버 상태 확인.
    $buttonGroupDataTableAgentServers.find('[name=btnRefreshServerStatus]').on('click', function(e){
        $dataTableAgentServers.draw();
    });

    /***************************************************************************
     * 테이블 표시
     ***************************************************************************/
    var $dataTableAgentServers = $("#dataTableAgentServers").dataTableController({
        url : "/api/1/agent/servers",
        buttonGroupId: "buttonGroupDataTableAgentServers",
        order : [ [ 2, 'desc' ] ],
        buttons : [],
        // dom : 'iB<"top">rt<"bottom"><"clear">',
        columnDefs: [{
            targets:   0,
            orderable: false,
            className: 'select-checkbox',
            defaultContent: ""
        }, {
            targets : 1, // ID
            data : "agentServerId",
            className : "dt-head-right"
        }, {
            targets : 2, // 상태
            orderable : false,
            className : "dt-head-center",
            width: '120px',
            render: function(data, type, row){
                return '<span data-name="status"><i class="fa fa-circle-o-notch fa-spin fa-3x fa-fw"></i></span>'
            }
        }, {
            targets: 3, // URL
            data: "url"
        }, {
            targets: 4, // 삭제 버튼
            className: "extend-button",
            width : "70px",
            render: function(data, type, row){
                var html ='<span data-name="btnDelete" class="btn-delete" style="margin-right:10px;"><i class="fa fa-trash active-hover" aria-hidden="true"></i></span>';
                return html;
            }
        }],
        createdRow: function(row, data, index) {
            var $row = $(row);

            // 연결 체크
            $.ajaxRest({
                url : "/api/1/agent/servers/health",
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

            // 삭제 이벤트 호출
            $row.find("[data-name=btnDelete]").on('click', function(e) {
                swalDelete({
                    url: "/api/1/agent/servers/" + data.agentServerId,
                    dataTable: $dataTableAgentServers
                });
                e.stopPropagation();
            });
        }
    });

    // 일괄 삭제
    $buttonGroupDataTableAgentServers.find('[name=btnDeleteBatch]').on('click', function() {
        var selectedIds = $dataTableAgentServers.getSelectedIds('agentServerId');
        if (selectedIds.length == 0) {
            swal(messageController.get('400025'));
            return;
        }

        var requestBody = {};
        if($dataTableAgentServers.isAllSelected()) {
            requestBody.searchOption = searchOption;
        } else {
            requestBody.ids = selectedIds;
        }

        swalDelete({
            url: "/api/1/agent/servers",
            dataTable: $dataTableAgentServers,
            requestBody: requestBody
        });
    });
});
