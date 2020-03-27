$(function() {
    var cookieKey = "boardNoticePopupClose";

    if ($.cookie(cookieKey) != "true") {

        // 테이블 표시
        var currentTime = new Date().getTime();
        var $dataTable = $("#dataTableDialogNotice").dataTableController({
            url : "/api/1/boards/notice",
            searchOption : {
                popupYn: "Y"
            },
            iDisplayLength : 10,
            order : [ [ 1, 'desc' ] ],
            dom : 'i<"top">rt<"bottom"fip><"clear">',
            buttons: [],
            colReorder: false,
            searching : false,
            columnDefs: [{
                targets: 0,
                data: "subject",
                render : function(data, type, row, meta) {
                    var text = data.escapeHTML();
                    var html = "";
                    if (row.attachCount > 0) { // 첨부파일이 1개 이상이면 아이콘 표시
                        html += ' <i class="fa fa-paperclip subject-icon"></i>';
                    }
                    if ((currentTime - row.insertDateTime) < (60 * 60 * 24 * 1000)) { // 글 작성 시간이 1일 이내라면 new
                        html += " <i class='material-icons subject-icon'>fiber_new</i>";
                    }
                    return '<div title="' + text + '" data- class="ellipsis" style="width: 350px">' + text + html +'</div>';
                }
            }, {
                targets: 1,
                data: "updateDateTime",
                className: "dt-head-center",
                render: function(data, type, row, meta) {
                    return momentController.timestampFormat(data, 'YYYY-MM-DD HH:mm');
                }
            }],
            createdRow : function(row, data, index) {
                $(row).on("click", function(e) {
                    location.href = "/boards/notice/" + data.noticeId;
                });
            },
            drawCallback : function(settings, dataTable) {
                if (dataTable.api().data().length <= 0) {
                    return;
                }

                // 다이얼 로그 표시
                var dialogNotice = $("#dialogNotice").dialog({
                    position: { at: "left top" },
                    minWidth : 520,
                    resizable: false,
                    buttons: [{
                        text : messageController.get('label.hide.for.a.week'),
                        click : function() {
                            $.cookie(cookieKey, "true",  { path: '/', expires: 7 });
                            dialogNotice.dialog("close");
                        }
                    }, {
                        text : messageController.get('label.hide.for.a.day'),
                        click : function() {
                            $.cookie(cookieKey, "true",  { path: '/', expires: 1 });
                            dialogNotice.dialog("close");
                        }
                    }, {
                        text : messageController.get('label.close'),
                        click : function() {
                            dialogNotice.dialog("close");
                        }
                    }]
                });
                $('.ui-dialog').css('z-index',99999);
                $('.ui-widget-overlay').css('z-index',99998);
                $('.ui-dialog-buttonset button').addClass("btn btn-primary");
            }
        });

    }
});