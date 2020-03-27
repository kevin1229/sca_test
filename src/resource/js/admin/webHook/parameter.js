$(function() {
    /***************************************************************************
     * 테이블 표시
     ***************************************************************************/

    var $dataTableWebHook = $("#parameterTable").dataTableController({
        url : "/api/1/webhooks/parameter/items",
        buttonGroupId: "buttonGroupDataTableWebHook",
        order : [ [ 1, 'desc' ] ],
        type : 'POST',
        buttons : [],
        dom : 'iB<"top">rt<"bottom"><"clear">',
        columnDefs: [{
            targets : 0,
            data: 'id',
            render: function(data, type, row){
                return messageController.get("item.webhook.event." + data);
            }
        }, {
            targets : 1,
            data: 'text'
        }, {
            targets : 2,
            data: 'text',
            orderable: false,
            render: function(data, type, row){
                return messageController.get("item.webhook.parameter." + data);
            }
        }],
        infoCallback : function(settings, start, end, max, total, pre) {
            if(end == 0) {
                start = 0;
            }
            var result = messageController.get('label.table.total') + " " + total + " "  + messageController.get('label.table.ea');
            return result;
        },
    });

});