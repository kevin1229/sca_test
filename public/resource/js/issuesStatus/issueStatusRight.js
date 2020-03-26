$(function() {

    (function($, window) {

        var IssueStatusRight = (function() {

            var $panelDuplicatedIssue = null;
            var $panelIssueStatusResponse = null;

            var $collapseIssue = null;
            var $collapseDuplicateIssue = null;
            var $collapseIssueStatusResponse = null;
            var $collapseIssueStatus = null;

            var $headerIssueStatus = null;

            var $dataTableDuplicatedIssue = null;
            var $dataTableIssueStatusResponse = null;
            var $dataTableIssueHistory = null;

            var $modalIssueStatusHistory = null;

            var historySearchOption = {};
            var oriStatusCode = null;

            var userType = null;
            var dataType = null;

            function IssueStatusRight() {

                $panelDuplicatedIssue = $("#panelDuplicatedIssue");
                $panelIssueStatusResponse = $("#panelIssueStatusResponse");

                $collapseIssue = $("#collapseIssue");
                $collapseDuplicateIssue = $("#collapseDuplicateIssue");
                $collapseIssueStatusResponse = $("#collapseIssueStatusResponse");
                $collapseIssueStatus = $("#collapseIssueStatus");

                $headerIssueStatus = $("#headerIssueStatus");

                $modalIssueStatusHistory = $("#modalIssueStatusHistory");

                userType = $("#userType").val();
                dataType = $("#dataType").val();

                // 저장
                function saveIssueStatus(next) {

                    var requestBody= {};
                    requestBody.issueStatusId = $collapseIssueStatus.find("[name=issueStatusId]").val();
                    requestBody.statusCode = $collapseIssueStatus.find("[name=statusCode]:checked").val();

                    if (userType == "manage") {
                        requestBody.responseComment = $collapseIssueStatus.find("[name=responseComment]").val();
                    } else {
                        requestBody.issueComment = $collapseIssueStatus.find("[name=issueComment]").val();
                    }

                    $.ajaxRest({
                        url : "/api/1/issueStatus/" + requestBody.issueStatusId + "/" + userType + "/" + dataType,
                        type : "PUT",
                        data : requestBody,
                        block : true,
                        beforeSend : function(xhr, settings) {
                            errorMsgHandler.clear($collapseIssueStatus);
                        },
                        success : function(data, status, header) {

                            if (next) {
                                var $dataTableIssueStatus = $("#dataTableIssueStatus").dataTableController();

                                var dataTableIssueStatus = $dataTableIssueStatus.DataTable();
                                var selectedRow = dataTableIssueStatus.rows('.row-selected');

                                var curIndex = parseInt(selectedRow.indexes()[0]);
                                var nextIndex = parseInt(curIndex + 1);

                                var curPage = parseInt(dataTableIssueStatus.page());
                                var nextPage = parseInt(curPage + 1);
                                var lastPage = parseInt(dataTableIssueStatus.page.info().pages - 1);

                                // 선택되어  있을 경우만 동작
                                if (selectedRow.count() == 1) {
                                    // 페이지 내에 있을 경우
                                    if (parseInt(dataTableIssueStatus.rows().count()) > nextIndex) {
                                        // 다음 페이지로 넘어가지 않는 경우
                                        $(dataTableIssueStatus.row(nextIndex).node()).click();
                                        $dataTableIssueStatus.drawPage();
                                    } else if (curPage == lastPage) {
                                        // 마지막 페이지인 경우
                                        $(dataTableIssueStatus.row(curIndex).node()).click();
                                        issueStatusRight.hide();
                                        dataTableIssueStatus.draw();
                                    } else {
                                        // 다음 페이지로 넘어가는 경우
                                        dataTableIssueStatus.page('next').draw('page');
                                        dataTableIssueStatus.on('draw.dt',  function(settings, json) {
                                            dataTableIssueStatus.off('draw.dt');
                                            $(dataTableIssueStatus.row(0).node()).click();
                                        });
                                    }
                                }

                            } else {
                                if ((userType == "user" && dataType == "requests" && requestBody.statusCode != "ER")
                                    || (userType == "manage" && dataType == "requests")) {
                                    issueStatusRight.hide();
                                } else {
                                    issueStatusRight.showIssueStatus(data.issueStatusId);
                                }
                                $("#dataTableIssueStatus").DataTable().draw();
                            }

                            $.toastGreen({
                                text: messageController.get("label.issue.status.info") + ' ' + messageController.get("label.has.been.modified")
                            });
                        },
                        error : function(hdr, status) {
                            errorMsgHandler.show($collapseIssueStatus, hdr.responseText);
                        }
                    });
                }

                // 저장
                $collapseIssueStatus.find("[name=btnSave]").on("click", function(){
                    saveIssueStatus(false);
                });

                // 저장 후 다음
                $collapseIssueStatus.find("[name=btnSaveNext]").on("click", function() {
                    saveIssueStatus(true);
                });
            }

            /**
             * 이슈 상태 정보를 감춘다.
             */
            IssueStatusRight.prototype.hide = function (){
                $collapseIssue.hide();

                $panelDuplicatedIssue.hide();

                $collapseIssueStatusResponse.hide();

                $headerIssueStatus.find('.select-issue-status').text("");
                $headerIssueStatus.find('.issue-status-date').text("");
                $headerIssueStatus.find('.fa-history').addClass('hidden');
                $collapseIssueStatus.hide();
            }

            /**
             * 이슈 상태 정보 표시
             */
            IssueStatusRight.prototype.showIssueStatus = function(issueStatusId) {
                $.ajaxRest({
                    url: "/api/1/issueStatus/" + issueStatusId,
                    type: "GET",
                    success : function (data, status, header) {

                        // 이슈 정보 -----------------------------
                        $collapseIssue.find("[data-name=issueStatusId]").text(data.issueStatusId);
                        $collapseIssue.find("[data-name=issueId]").html('<a href="/scans/' + data.scanId + '/issues#issueId=' + data.issueId +'" target="_black">' + data.issueId + '</a>');
                        $collapseIssue.find("[data-name=projectName]").text(data.projectName);
                        $collapseIssue.find("[data-name=projectName]").attr("title", messageController.get("label.project.key") + " : " + data.projectKey);
                        $collapseIssue.find("[data-name=risk]").text(messageController.get("item.checker.risk.level." +  data.risk));
                        if (data.checkerName == null) {
                            $collapseIssue.find("[data-name=checkerName]").text(data.checkerKey);
                        } else {
                            $collapseIssue.find("[data-name=checkerName]").text(data.checkerName);
                        }
                        $collapseIssue.find("[data-name=sinkFileName]").text(data.sinkFileName);
                        $collapseIssue.find("[data-name=requestDateTime]").text(momentController.timestampFormat(data.requestDateTime, 'YYYY-MM-DD HH:mm:ss'));
                        if(data.requestUserName) {
                            $collapseIssue.find("[data-name=requestUser]").text(data.requestUserName + " (" + data.requestUserId + ")");
                        } else {
                            $collapseIssue.find("[data-name=requestUser]").text(data.requestUserId);
                        }
                        $collapseIssue.find("[data-name=issueComment]").text(data.issueComment);
                        $collapseIssue.css("display", "");

                        // 이슈 제외 승인 현황 --------------------------
                        if (data.issueStatusResponses != null && data.issueStatusResponses.length > 0) {
                            $collapseIssueStatusResponse.css("display", "");
                            if ($dataTableIssueStatusResponse == null) {
                                 $dataTableIssueStatusResponse = $("#dataTableIssueStatusResponse").dataTableController({
                                     keys: true,
                                     paging: false,
                                     lengthChange: false,
                                     searching: false,
                                     select: false,
                                     ordering: false,
                                     info: false,
                                     dom: "",
                                     columnDefs: [{
                                         targets: 0, // 응답자
                                         data: "responseUserName",
                                         className: "dt-head-center",
                                         render: function(data, type, row, index) {
                                             return '<span data-toggle="tooltip" data-container="body" title="' + row.responseUserName.escapeHTML() + '('+ row.responseUserId + ')">' + data.escapeHTML() + '</span>';
                                         }
                                     }, {
                                         targets: 1, // 상태
                                         data: "responseStatusCode",
                                         className: "dt-head-center",
                                         render: function(data, type, row, index) {
                                             var text = null;
                                             if(data == null) {
                                                 text = messageController.get('item.issue.status.NA');
                                             } else {
                                                 text = messageController.get('item.issue.status.' + data);
                                             }
                                             return '<div class="ellipsis" data-toggle="tooltip" data-container="body" title="' + text + '">' + text + '</div>';
                                         }
                                     }, {
                                         targets: 2, // 의견
                                         data: "responseComment",
                                         className: "dt-head-center",
                                         render: function(data, type, row, index) {
                                             if(data == null) {
                                                 return "-";
                                             }
                                             return '<div class="ellipsis" data-toggle="tooltip" data-container="body" title="' + data.escapeHTML() + '">' + data.escapeHTML() + '</div>';
                                         }
                                     }]
                                 });
                            }
                            $dataTableIssueStatusResponse.clear();
                            $.each(data.issueStatusResponses, function(index, value){
                                $dataTableIssueStatusResponse.addRow(value);
                            });
                            $dataTableIssueStatusResponse.draw();

                            $panelIssueStatusResponse.show();
                        } else {
                            $panelIssueStatusResponse.hide();
                        }

                        // 이슈 상태 --------------------
                        $collapseIssueStatus.find("[name=issueStatusId]").val(data.issueStatusId);
                        $collapseIssueStatus.find("[name=statusCode]").parent().removeClass("active");
                        $collapseIssueStatus.find("[name=statusCode]").prop('checked', false);
                        $collapseIssueStatus.find("[name=statusCode][value=" + data.statusCode +"]").parent().addClass("active");
                        $collapseIssueStatus.find("[name=statusCode][value=" + data.statusCode +"]").prop('checked', true);
                        $collapseIssueStatus.find("[name=issueComment]").val(data.issueComment);
                        $collapseIssueStatus.find("[name=responseComment]").val(data.responseComment);

                        if (userType == "manage" && dataType == "results") {
                            $collapseIssueStatus.find("[name=responseComment]").val(data.lastIssueStatusResponse.responseComment);
                            if (data.lastIssueStatusResponse.responseUserId == sessionUserController.getUser().userId) {
                                $collapseIssueStatus.find("[name=responseComment]").removeAttr("readonly");
                                $collapseIssueStatus.find("[name=btnSaveNext]").removeAttr("disabled");
                                $collapseIssueStatus.find("[name=btnSave]").removeAttr("disabled");
                            } else {
                                $collapseIssueStatus.find("[name=responseComment]").attr("readonly", true);
                                $collapseIssueStatus.find("[name=btnSaveNext]").attr("disabled", true);
                                $collapseIssueStatus.find("[name=btnSave]").attr("disabled", true);
                            }
                        }

                        $collapseIssueStatus.css("display", "");

                        oriStatusCode = data.statusCode;


                        // 이슈 상태 이력 ----------------
                        $headerIssueStatus.find('.select-issue-status').text('[' + messageController.get("item.issue.status." + data.statusCode) + ']');

                        // 초기화
                        $("#dataTableIssueHistory").find("thead").html("");
                        $("#dataTableIssueHistory").find("tbody").html("");
                        $("#dataTableIssueHistory").removeClass("hidden");

                        historySearchOption.issueStatusId = issueStatusId;

                        if ($dataTableIssueHistory == null) {
                            // #전체순서 : 신청자, 신청일, 제외신청의견
                            $dataTableIssueHistory = $("#dataTableIssueHistory").dataTableController({
                                url: "/api/1/issueStatusHistories",
                                searchOption: historySearchOption,
                                buttonGroupId: "",
                                order: [[0, 'desc']],
                                keys: true,
                                paging: true,
                                lengthChange: false,
                                searching: false,
                                select: false,
                                ordering: false,
                                info: false,
                                dom: "",
                                columnDefs: [{
                                    targets: 0,
                                    data: "issueStatusHistoryId",
                                    className: "dt-head-center",
                                    render: function (data, type, row, index) {

                                        if (index.row == 0) {
                                            $headerIssueStatus.find('.issue-status-date').text(momentController.timestampFormat(row.insertDateTime, 'YYYY-MM-DD HH:mm:ss'));
                                            $headerIssueStatus.find('.fa-history').removeClass('hidden');
                                        }

                                        var html = "";

                                        // 날짜
                                        html += '<div class="row"><div class="col-xs-4 control-label">' + messageController.get("label.date") + '</div><div class="col-xs-8 control-label">' + momentController.timestampFormat(row.insertDateTime, 'YYYY-MM-DD HH:mm:ss') + '</div></div>'
                                        // 변경자 userId(userName)
                                        var userName = "";
                                        if (row.insertUserName == null) {
                                            userName = row.insertUserId;
                                        } else {
                                            userName = row.insertUserId + "(" + row.insertUserName.escapeHTML() + ")";
                                        }
                                        html += '<div class="row" title="' + userName + '"><div class="col-xs-4 control-label">' + messageController.get("label.updator") + '</div><div class="col-xs-8 control-label">' + userName + '</div></div>'
                                        // 이슈 상태
                                        if (row.statusCode) {
                                            html += '<div class="row"><div class="col-xs-4 control-label">' + messageController.get("label.issue.status") + '</div><div class="col-xs-8 control-label">' + messageController.get("item.issue.status." + row.statusCode) + '</div></div>'
                                        }
                                        // 이슈 의견
                                        if (row.issueComment) {
                                            html += '<div class="row" style="word-break:break-all;"><div class="col-xs-4 control-label">'
                                                + messageController.get("label.issue.comment")
                                                + ' </div><div class="col-xs-8 control-label">'
                                                + row.issueComment.escapeHTML().replace(/\n/g, "<br/>")
                                                + '</div></div>';
                                        }

                                        // 처리 상태
                                        if (row.responseStatusCode) {
                                            html += '<div class="row"><div class="col-xs-4 control-label">' + messageController.get("label.response.status") + '</div><div class="col-xs-8 control-label">' + messageController.get("item.issue.status." + row.responseStatusCode) + '</div></div>'
                                        }
                                        // 처리 의견
                                        if (row.responseComment) {
                                            html += '<div class="row" style="word-break:break-all;"><div class="col-xs-4 control-label">'
                                                + messageController.get("label.response.comment")
                                                + ' </div><div class="col-xs-8 control-label">'
                                                + row.responseComment.escapeHTML().replace(/\n/g, "<br/>")
                                                + '</div></div>';
                                        }

                                        return html;
                                    }
                                }]
                            });
                        } else {
                            $dataTableIssueHistory.draw();
                        }

                        $modalIssueStatusHistory.find('.form-history').addClass('scrollbar-outer');
                        $modalIssueStatusHistory.find('.form-history').scrollbar();
                        $modalIssueStatusHistory.find(".scroll-wrapper.form-history.scrollbar-outer").css('max-height', $(window).height() / 2);
                    }
                });
            }

            /**
             * 중복 이슈 표시
             */
            IssueStatusRight.prototype.showDuplicatedIssue = function(issueId) {
                if ($dataTableDuplicatedIssue == null) {
                    $dataTableDuplicatedIssue = $("#dataTableDuplicatedIssue").dataTableController({
                        url: "/api/1/issues/" + issueId + "/duplicated",
                        type: "GET",
                        order: [[1, 'desc']],
                        keys: true,
                        paging: false,
                        lengthChange: false,
                        searching: false,
                        select: false,
                        ordering: false,
                        info: false,
                        dom: "",
                        columnDefs: [{
                            targets: 0, // 이슈 ID
                            data: "issueId",
                            className: "dt-head-center"
                        }, {
                            targets: 1, // 프로젝트 명
                            data: "projectName",
                            render: function (data, type, row, index) {
                                return '<span title="' + messageController.get("label.project.key") + " : " + row.projectKey + '" data-toggle="tooltip" data-container="body">' + data + '</span>';
                            }
                        }],
                        drawCallback: function (settings) {
                            if(settings.json.totalCount > 0 ){
                                $('#duplicatedIssueCount').text(settings.json.totalCount);
                                $panelDuplicatedIssue.show();
                            } else {
                                $panelDuplicatedIssue.hide();
                            }
                        },
                        createdRow: function(row, data, index) {
                            var $row = $(row);
                            if (data.duplicatedIssueAuthority || sessionUserController.isAdmin()) {
                                $row.on('click', function(e) {
                                    window.open("/scans/" + data.scanId + "/issues#issueId=" + data.issueId);
                                });
                            } else {
                                $row.attr("title", messageController.get('400009'));
                            }
                        }
                    });
                } else {
                    $dataTableDuplicatedIssue.loadUrl("/api/1/issues/" + issueId + "/duplicated");
                }

                $('#divDuplicatedIssue').slimscroll({
                    height: '145px'
                });
            }

            return IssueStatusRight;
        })();

        $.fn.issueStatusRight = function(){
            return new IssueStatusRight();
        }

        issueStatusRight = $("#rightSideBar").issueStatusRight();

    })(window.jQuery, window);
});

var issueStatusRight = null;