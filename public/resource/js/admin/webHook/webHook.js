$(function() {

    var $buttonGroupDataTableWebHook = $("#buttonGroupDataTableWebHook");
    var $modalAddWebHook = $("#modalAddWebHook");
    var $modalModifyWebHook = $("#modalModifyWebHook");
    var rowTpl = $('#webhookHeaderTableTpl').find('tbody');

    /***************************************************************************
     * 컨포넌트
     **************************************************************************/
    var methodData = [{id: "GET", text: "GET"} , {id: "POST", text: "POST"}, {id: "PUT", text: "PUT"}, {id: "DELETE", text: "DELETE"}];
    $modalAddWebHook.find("[name=httpMethod]").select2Controller({data:methodData, width: '100%'});
    $modalModifyWebHook.find("[name=httpMethod]").select2Controller({data:methodData, width: '100%'});

    $.ajaxRest({
        url: "/api/1/webhooks/event/items",
        type: "GET",
        success: function (data, textStatus, jqXHR) {
            $modalAddWebHook.find("[name=eventCodes]").select2Controller({ multiple: true, data: data, width: '100%'});
            $modalModifyWebHook.find("[name=eventCodes]").select2Controller({ multiple: true, data: data, width: '100%'});
        }
    });

    /***************************************************************************
     * 테이블 버튼
     **************************************************************************/
    $buttonGroupDataTableWebHook.find("[name=btnDeleteWebHook]").on('click', function(e) {
        var requestBody = {ids: $dataTableWebHook.getSelectedIds('webhookId')};
        swalDelete({
            url: "/api/1/webhooks/",
            requestBody: requestBody,
            dataTable: $dataTableWebHook
        });
        e.stopPropagation();
    });

    /***************************************************************************
     * 테이블 표시
     ***************************************************************************/
    var $dataTableWebHook = $("#dataTableWebHook").dataTableController({
        url : "/api/1/webhooks",
        buttonGroupId: "buttonGroupDataTableWebHook",
        order : [ [ 1, 'asc' ] ],
        buttons : [{
            extend : "colvis",
        }],
        keys : true,
        paging : true,
        lengthChange : true,
        searching : false,
        ordering : true,
        stateSave: false,
        info : true,
        //dom : 'iB<"top">rt<"bottom"><"clear">',

        columnDefs: [{
            targets : 0,
            orderable : false,
            className : 'select-checkbox',
            visible: true,
            defaultContent : ""
        }, {
            targets : 1, // ID
            data : "webhookId",
            width: "50px",
            className : "dt-head-right"
        }, {
            targets: 2, // 이름
            data: "webhookName",
        }, {
            targets: 3, // URL
            data: "url"
        }, {
            targets: 4, // Http Header
            data: 'httpHeaderJson',
            orderable : false
        }, {
            targets: 5, // Http Method
            data: 'httpMethod',
        }, {
            targets: 6, // 이벤트
            data: 'eventCodes',
            render: function(data, type, row) {
                // 이벤트 목록에서 해당하는 이벤트 선택
                var html = '<div class="info">';
                $.each(data, function(index, item){
                    html += '&nbsp;<span class="info-event">' + messageController.get("item.webhook.event." + item) + '</span>'
                });
                html += '</div>'
                return html;
            }
        }, {
            targets: 7, // 삭제 버튼
            className: "extend-button",
            width : "70px",
            render: function(data, type, row){
                return '<span data-name="btnDelete" class="btn-delete" style="margin-right:10px;"><i class="fa fa-trash active-hover" aria-hidden="true"></i></span>';
            }
        }],
        createdRow: function(row, data, index) {
            var $row = $(row);

            // 수정 모달 열기
            $row.on('click', function(e) {
                if(e.target.className.indexOf('select-checkbox') == -1
                    && e.target.className.indexOf('extend-button') == -1) {
                    openModalModifyWebHook(data);
                }
            });

            // 삭제 이벤트 호출
            $row.find("[data-name=btnDelete]").on('click', function(e) {
                swalDelete({
                    url: "/api/1/webhooks/" + data.webhookId,
                    dataTable: $dataTableWebHook
                });
                e.stopPropagation();
            });
        },

    });

    /***************************************************************************
     * 추가 모달
     ***************************************************************************/
    $modalAddWebHook.find('[name=btnAddWebhook]').on('click', function() {

        var httpHeader = [];
        var $webhookHeaderTable = $modalAddWebHook.find('#webhookHeaderTable');
        $webhookHeaderTable.find('tr').each(function(){
            var headerItem = {'key' : '', 'value' : ''};
            $(this).find('td').each(function(index){
                if($(this).find('input').val() == '') {
                    return false;
                } else if(index == 0){
                    headerItem['key'] = $(this).find('input').val();
                } else if(index == 1){
                    headerItem['value'] = $(this).find('input').val();
                    httpHeader.push(headerItem);
                }
            });
        });

        var requestBody = {};
        requestBody.webhookGroupId = 0;
        requestBody.webhookName = $modalAddWebHook.find('[name=webhookName]').val();
        requestBody.url = $modalAddWebHook.find('[name=url]').val();
        requestBody.httpMethod = $modalAddWebHook.find('[name=httpMethod] :selected').text();
        requestBody.httpHeaderJson = JSON.stringify(httpHeader)
        requestBody.eventCodes = $modalAddWebHook.find('[name=eventCodes]').val();
        requestBody.parameterUnicodeYn = $modalAddWebHook.find("[name=parameterUnicodeYn]").prop('checked') ? "Y" : "N";

        $.ajaxRest({
            url: "/api/1/webhooks/0",
            type: "POST",
            data: requestBody,
            block: true,
            beforeSend: function (xhr, settings) {
                errorMsgHandler.clear($modalAddWebHook);
            },
            success: function (data, textStatus, jqXHR) {

                // 모달 클리어
                $modalAddWebHook.find('[name=webhookName]').val("");
                $modalAddWebHook.find('[name=url]').val("");
                initWebhookHeaderTable($modalAddWebHook.find('#webhookHeaderTable'));
                $modalAddWebHook.find('[name=httpMethod]').val("").trigger('change');
                $modalAddWebHook.find('[name=eventCodes]').val("").trigger('change');

                $dataTableWebHook.draw();

                $modalAddWebHook.modal('hide');

                $.toastGreen({
                    text: messageController.get("label.web.hook.name") + ' ' + requestBody.webhookName + ' ' + messageController.get("label.has.been.added")
                });
            },
            error: function (hdr, status) {
                errorMsgHandler.show($modalAddWebHook, hdr.responseText);
            }
        });
    });

    // 웹훅 모달의 헤더 초기화
    initWebhookHeaderTable($modalAddWebHook.find('#webhookHeaderTable'));

    function initWebhookHeaderTable(target) {
        addHeaderRowInModal(target, true);
    }

    // 헤더 ROW추가.
    function addHeaderRowInModal($webhookHeaderTable, clear){
        var tbody = $webhookHeaderTable.find('tbody');

        // 테이블 클리어의 경우 로우 전부 삭제.
        if(clear) {
            tbody.children().remove();
        }

        // 모든 ROW이외에는 삭제 버튼 활성화. 아직 마지막 ROW추가전임.
        var otherRows = tbody.find('tr');
        otherRows.find('td button[name=addHeader]').removeClass('hidden');
        tbody.find('tr').find('[name=header-key]').unbind('focusout');

        // 마지막 ROW추가.
        tbody.append(rowTpl.html());
        var addedRow = tbody.find('tr:last-child');
        // 마지막 ROW의 key의 Focusout에서 입력 값이 있으면 새로운 ROW 추가.
        addedRow.find('[name=header-key]').on('focusout', function(e){
            if(e.target.value) {
                addHeaderRowInModal($webhookHeaderTable, false);
            }
        });
        // 마지막 ROW의 삭제 이벤트 추가.(단 비활성화 되어 있어 누룰수 없음)
        addedRow.find('td button[name=addHeader]').on('click', function(e){
            $(e.target).closest('tr').remove();
        });

    }

    // 웹훅 수정 모달의 헤더 테이블 초기화로 행 데이터를 이용해 초기화.
    function addHeaderRowWithData(rowData){
        var tbody = $modalModifyWebHook.find('#modifyWebhookHeaderTable').find('tbody');
        tbody.children().remove();
        rowData.forEach(function (item){
            if(item.key=='' || item.value==''){
                return false;
            } else {
                tbody.append(rowTpl.html());
            }
        });

        rowData.forEach(function (item, index){
            var nIndex = index+1;
            tbody.find('tr:nth-child(' + nIndex +')').find('td').each(function(index){
                if(item.key=='' || item.value==''){
                    return false;
                } else if(index == 0){
                    $(this).find('input').val(item.key);
                } else if(index == 1){
                    $(this).find('input').val(item.value);
                }
            });
        });

        var otherRows = tbody.find('tr');
        otherRows.find('td button[name=addHeader]').removeClass('hidden');
        otherRows.find('td button[name=addHeader]').on('click', function(e){
            $(e.target).closest('tr').remove();
        });

        //포커스 아웃 제거
        tbody.find('tr').find('[name=header-key]').unbind('focusout');
        // 마지막 ROW추가.
        tbody.append(rowTpl.html());

        var addedRow = tbody.find('tr:last-child');
        // 마지막 ROW의 key의 Focusout에서 입력 값이 있으면 새로운 ROW 추가.
        addedRow.find('[name=header-key]').on('focusout', function(e){
            if(e.target.value) {
                addHeaderRowInModal($modalModifyWebHook.find('#modifyWebhookHeaderTable'), false);
            }
        });
        // 마지막 ROW의 삭제 이벤트 추가.(단 비활성화 되어 있어 누룰수 없음)
        addedRow.find('td button[name=addHeader]').on('click', function(e){
            $(e.target).closest('tr').remove();
        });
    }

    /***************************************************************************
     * 수정 모달
     ***************************************************************************/
    function openModalModifyWebHook(data) {
        $modalModifyWebHook.find('[name=webhookId]').val(data.webhookId);
        $modalModifyWebHook.find('[name=webhookName]').val(data.webhookName);
        $modalModifyWebHook.find('[name=url]').val(data.url);
        $modalModifyWebHook.find('[name=httpMethod]').val(data.httpMethod).trigger('change');
        addHeaderRowWithData(JSON.parse(data.httpHeaderJson));
        $modalModifyWebHook.find('[name=eventCodes]').val(data.eventCodes).trigger('change');
        if (data.parameterUnicodeYn == "Y") {
            $modalModifyWebHook.find('[name=parameterUnicodeYn]').bootstrapToggle('on');
        } else {
            $modalModifyWebHook.find('[name=parameterUnicodeYn]').bootstrapToggle('off');
        }
        $modalModifyWebHook.modal('show');
    }

    $modalModifyWebHook.find('[name=btnModify]').on('click', function() {

        var httpHeader = [];
        var $webhookHeaderTable = $modalModifyWebHook.find('#modifyWebhookHeaderTable');
        $webhookHeaderTable.find('tr').each(function(){
            var headerItem = {'key' : '', 'value' : ''};
            $(this).find('td').each(function(index){
                if($(this).find('input').val() == '') {
                    return false;
                } else if(index == 0){
                    headerItem['key'] = $(this).find('input').val();
                } else if(index == 1){
                    headerItem['value'] = $(this).find('input').val();
                    httpHeader.push(headerItem);
                }
            });
        });

        var requestBody = {};
        requestBody.webhookGroupId = 0;
        requestBody.webhookName = $modalModifyWebHook.find('[name=webhookName]').val();
        requestBody.url = $modalModifyWebHook.find('[name=url]').val();
        requestBody.httpMethod = $modalModifyWebHook.find('[name=httpMethod] :selected').text();
        requestBody.httpHeaderJson = JSON.stringify(httpHeader)
        requestBody.eventCodes = $modalModifyWebHook.find('[name=eventCodes]').val();
        requestBody.parameterUnicodeYn = $modalModifyWebHook.find("[name=parameterUnicodeYn]").prop('checked') ? "Y" : "N";

         $.ajaxRest({
             url: "/api/1/webhooks/" + $modalModifyWebHook.find('[name=webhookId]').val(),
             type : "PUT",
             data : requestBody,
             block : true,
             beforeSend : function(xhr, settings) {
                 errorMsgHandler.clear($modalModifyWebHook);
             },
             success : function (data, textStatus, jqXHR) {
                 $.toastGreen({
                     text: messageController.get("label.web.hook.name") + ' ' + requestBody.webhookName + ' ' + messageController.get("label.has.been.modified")
                 });
                 $modalModifyWebHook.modal('hide');
                 $dataTableWebHook.draw();
             },
             error : function(hdr, status) {
                 errorMsgHandler.show($modalModifyWebHook, hdr.responseText);
             }
         });
    });
});
