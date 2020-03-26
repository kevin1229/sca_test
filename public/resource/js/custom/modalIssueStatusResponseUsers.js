$(function(){

    var scanId = $("#scanId").val();

    var $modalIssueStatusResponseUsers = $('#modalIssueStatusResponseUsers');
    var $divResponseUserIds = $("[data-name=divResponseUserIds]");
    var $dataTableIssueStatusResponseUsers = null;
    var selectIndex = -1;

    /***************************************************************************
     * 변수
     **************************************************************************/
    SearchOption = function() {
        this.searchText = null;
    };
    SearchOption.prototype = {
        clear : function() {
            this.searchText = null;
        }
    };
    var issueStatusResponseSearchOption = new SearchOption();

    $modalIssueStatusResponseUsers.find('[name=btnSearch]').on('click', function(e) {
        issueStatusResponseSearchOption.clear();
        issueStatusResponseSearchOption.searchText = $modalIssueStatusResponseUsers.find("[name=searchText]").val();
        $dataTableIssueStatusResponseUsers.draw();
    });

    $divResponseUserIds.find('[name=responseUserNameId],[name=btnSelectResponseUser]').on('click', function(e) {

        selectIndex = $(this).data("index");

        if ($dataTableIssueStatusResponseUsers == null) {
            $dataTableIssueStatusResponseUsers = $("#dataTableIssueStatusResponseUsers").dataTableController({
                url : "/api/1/custom/scans/" + scanId+ "/manager",
                searchOption : issueStatusResponseSearchOption,
                processing : false,
                //serverSide : false,
                //paging : false,
                info : false,
                colReorder: false,
                searching : false,
                buttons : [],
                stateSave: false,
                columnDefs: [{
                    targets: 0, // 사용자 ID
                    orderable: false,
                    data: "userId"
                }, {
                    targets: 1, // 사용자 이름
                    orderable: false,
                    data: "userName",
                    render: function(data, type, row, meta) {
                        if (data == null) {
                            return "";
                        }
                        var text = data.escapeHTML();
                        return '<div title="' + text + '" data-toggle="tooltip" data-container="body" class="ellipsis" style="max-width: 200px">' + text + '</div>';
                    }
                }, {
                    targets: 2, // 부서
                    orderable: false,
                    data: 'groupName'
                }, {
                    targets: 3, // 직책
                    orderable: false,
                    data: 'rankName'
                }, {
                    targets: 4,
                    orderable: false,
                    className: "extend-button",
                    width: '60px',
                    render: function(data, type, row, meta) {
                        return '<button name="btnSelect" class="btn btn-primary">' + messageController.get('label.select') + '</button>';
                    }
                }],
                createdRow: function (row, data, index) {

                    var $row = $(row);

                    $row.find("[name=btnSelect]").on("click", function(e) {

                        $($divResponseUserIds.find("[name=responseUserNameId]").get(selectIndex)).val(data.userName + "(" + data.userId + ")");
                        $($divResponseUserIds.find("[name=responseUserId]").get(selectIndex)).val(data.userId);

                        $modalIssueStatusResponseUsers.modal('toggle');

                        e.stopPropagation();
                    });
                }
            });

        } else {
            $modalIssueStatusResponseUsers.find("[name=searchText]").val("");
            issueStatusResponseSearchOption.clear();
            $dataTableIssueStatusResponseUsers.draw();
        }

        $modalIssueStatusResponseUsers.modal("show");

        e.stopPropagation();
    });


});