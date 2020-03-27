$(function(){

    var projectId = $("#projectId").val();

    // 최근 탐색 프로젝트 결과에 추가
    recentQueue.setItem("P", projectId);

    $(".sidebar #link-menu-info").parent().addClass("active");

    /***************************************************************************
     * 프로젝트 정보
     ***************************************************************************/
    $.ajaxRest({
        url: "/api/1/projects/" + projectId,
        type: "GET",
        success : function (data, status, header) {

            var $boxHeaderTitle = $('#boxHeaderTitle');
            $boxHeaderTitle.html(
                $boxHeaderTitle.html().compose({
                    'projectKey': data.projectKey
                })
            );
            $boxHeaderTitle.show();

            // 프로젝트 정보
            if (typeof(data) == 'undefined') {
                return null;
            }

            var enabledCheckersRisks = new StringBuffer();
            for (var i = 0; i <= 5; i++) {
                var risk = data.checkerGroup["enabledCheckersRisk" + i];
                if(risk > 0) {
                    enabledCheckersRisks.append("<span class='btn-risk risk" + i + "'>" + risk.format() + "</span>&nbsp;");
                }
            }

            var $boxProjectInfo = $('#boxProjectInfo');
            $boxProjectInfo.html($boxProjectInfo.clone().html().compose({
                'projectId': data.projectId,
                'projectKey': data.projectKey,
                'parentProjectNamePath' : data.parentProjectNamePath,
                'parentProjectKeyPath' : data.parentProjectKeyPath,
                'checkerGroup.checkerGroupName' : data.checkerGroup.checkerGroupName,
                'checkerGroup.enabledCheckers' : data.checkerGroup.enabledCheckers.format(),
                'enabledCheckersRisks' : enabledCheckersRisks
            })).show();

            // 프로젝트 구성원
            var managers = [];
            var analyzers = [];
            var viewers = [];

            var showCount = 5;
            var managerMore = "";
            var analyzerMore = "";
            var viewerMore = "";

            var startSpan = '<span style="white-space: nowrap;">';
            var endSpan = '</span>'

            var groupIcon = '<i class="fa fa-users"></i> ';
            $.each(data.projectUserGroups, function(i) {
                var html = '<span style="white-space: nowrap;"><i class="fa fa-users"></i> ' + data.projectUserGroups[i].userGroupName.escapeHTML() + '</span>';
                if (data.projectUserGroups[i].projectRoleCode == 'M') {
                    if(managers.length < showCount) {
                        managers.push(html);
                    } else if(managers.length >= showCount) {
                        managerMore = "...<a href='/projects/" + projectId + "/setting'>" + messageController.get("label.show.more") + "</a>";
                    }
                } else if (data.projectUserGroups[i].projectRoleCode == 'A') {
                    if(analyzers.length < showCount) {
                        analyzers.push(html);
                    } else if(analyzers.length >= showCount) {
                        analyzerMore = "...<a href='/projects/" + projectId + "/setting'>" + messageController.get("label.show.more") + "</a>";
                    }
                } else if (data.projectUserGroups[i].projectRoleCode == 'V') {
                    if(viewers.length < showCount) {
                        viewers.push(html);
                    }else if(viewers.length >= showCount) {
                        viewerMore = "...<a href='/projects/" + projectId + "/setting'>" + messageController.get("label.show.more") + "</a>";
                    }
                }
            });

            var userIcon = '<i class="fa fa-user"></i> ';
            $.each(data.projectUsers, function(i) {
                var html = '<span style="white-space: nowrap;"><i class="fa fa-user"></i> ' + data.projectUsers[i].userName.escapeHTML() + '(' + data.projectUsers[i].userId + ')' + '</span>';
                if (data.projectUsers[i].projectRoleCode == 'M') {
                    if(managers.length < showCount) {
                        managers.push(html);
                    } else if(managers.length >= showCount) {
                        managerMore = "...<a href='/projects/" + projectId + "/setting'>" + messageController.get("label.show.more") + "</a>";
                    }
                } else if (data.projectUsers[i].projectRoleCode == 'A') {
                    if (analyzers.length < showCount) {
                        analyzers.push(html);
                    } else if (analyzers.length >= showCount) {
                        analyzerMore = "...<a href='/projects/" + projectId + "/setting'>" + messageController.get("label.show.more") + "</a>";
                    }
                } else if (data.projectUsers[i].projectRoleCode == 'V') {
                    if (viewers.length < showCount) {
                        viewers.push(html);
                    } else if(viewers.length >= showCount) {
                        viewerMore = "...<a href='/projects/" + projectId + "/setting'>" + messageController.get("label.show.more") + "</a>";
                    }
                }
            });

            var $boxProjectUser = $('#boxProjectUser');
            $boxProjectUser.html($boxProjectUser.clone().html().compose({
                myProjectRole : messageController.get('item.project.role.' + data.myProjectRoleCode),
                managers : managers.join(', ') + managerMore,
                analyzers : analyzers.join(', ') + analyzerMore,
                viewers : viewers.join(', ') + viewerMore
            })).show();
        },
        error : function(hdr, status) {
            errorMsgHandler.swal(data);
        }
    });


    /***************************************************************************
     * 이슈 추이
     ***************************************************************************/
    $(":radio[name=viewModeIssueCount]").on("change", function() {
        var viewMode = $(':radio[name="viewModeIssueCount"]:checked').val();
        var viewUrl = null;
        var chartId = null;
        if(viewMode == "all") {
            viewUrl = "";
            chartId = "chartIssueAll";
        } else if(viewMode == "week") {
            viewUrl = "/week";
            chartId = "chartIssueWeek";
        } else if(viewMode == "month") {
            viewUrl = "/month";
            chartId = "chartIssueMonth";
        } else if(viewMode == "year") {
            viewUrl = "/year";
            chartId = "chartIssueYear";
        } else if(viewMode == "day") {
            viewUrl = "/day";
            chartId = "chartIssueDay";
        } else {
            console.log("error view mode:" + viewMode);
            return;
        }

        $(".chart-issue-line").hide();
        $("#" + chartId).show();

        if (chartController.isCanvasBlank(chartId) == false){
            return;
        }

        $.ajaxRest({
            url: "/api/1/projects/" + projectId + "/issues/count" + viewUrl,
            type: "GET",
            success : function (data, status, header) {
                var dataLine = {
                    labels: [],
                    datasets : [],
                    mode: 'nearest'
                };
                dataLine.datasets.push(chartController.getLineDatasets(messageController.get("item.checker.risk.level.1"), "#d32f2f"));
                dataLine.datasets.push(chartController.getLineDatasets(messageController.get("item.checker.risk.level.2"), "#d35501"));
                dataLine.datasets.push(chartController.getLineDatasets(messageController.get("item.checker.risk.level.3"), "#e59701"));
                dataLine.datasets.push(chartController.getLineDatasets(messageController.get("item.checker.risk.level.4"), "#827717"));
                dataLine.datasets.push(chartController.getLineDatasets(messageController.get("item.checker.risk.level.5"), "#4a5061"));

                $.each(data, function(index, value) {
                    if (viewMode == "all") {
                        dataLine.labels.unshift(messageController.get("label.scan") + " [" + value.scanId + "]");
                    } else if (viewMode == "week") {
                        dataLine.labels.unshift(momentController.timestampFormat(value.startDate, "YYYY-MM-DD") + " ~ " + momentController.timestampFormat(value.endDate, "MM-DD"));
                    } else {
                        var dateFormate = null;
                        if (viewMode == "day") {
                            dateFormate = "YYYY-MM-DD";
                        } else if (viewMode == "month") {
                            dateFormate = "YYYY-MM";
                        } else if (viewMode == "year") {
                            dateFormate = "YYYY";
                        }
                        dataLine.labels.unshift(momentController.timestampFormat(value.startDate, dateFormate));
                    }

                    for (var i = 1; i <= dataLine.datasets.length; i++) {
                        if(i == 1) {
                            dataLine.datasets[0].data.unshift(value.risk1IssueCount == null? 0 : value.risk1IssueCount);
                        } else if(i == 2) {
                            dataLine.datasets[1].data.unshift(value.risk2IssueCount == null? 0 : value.risk2IssueCount);
                        } else if(i == 3) {
                            dataLine.datasets[2].data.unshift(value.risk3IssueCount == null? 0 : value.risk3IssueCount);
                        } else if(i == 4) {
                            dataLine.datasets[3].data.unshift(value.risk4IssueCount == null? 0 : value.risk4IssueCount);
                        } else if(i == 5) {
                            dataLine.datasets[4].data.unshift(value.risk5IssueCount == null? 0 : value.risk5IssueCount);
                        }
                    }
                });

                new Chart(document.getElementById(chartId), {
                    type: 'line',
                    data: dataLine,
                    options : $.extend(chartController.getLineOption(), {
                        legend: {
                            display: true,
                            position: 'right',
                            labels: {
                                boxWidth: 12,
                                fontSize: 13,
                                fontFamily: "'Nanum Gothic', 'Open Sans', sans-serif"
                            }
                        }
                    })
                });
            },
            error : function(hdr, status) {
                errorMsgHandler.swal(data);
            }
        });

    });
    $(":radio[name='viewModeIssueCount']:checked").trigger("change");

    // 분석 추이
    $(":radio[name=viewModeScanCount]").on("change", function() {
        var viewMode = $(':radio[name="viewModeScanCount"]:checked').val();
        var chartId = null;
        if(viewMode == "day") {
            chartId = "chartScanDay";
        } else if(viewMode == "week") {
            chartId = "chartScanWeek";
        } else if(viewMode == "month") {
            chartId = "chartScanMonth";
        } else if(viewMode == "year") {
            chartId = "chartScanYear";
        } else {
            console.log("error view mode:" + viewMode);
            return;
        }

        $(".chart-scan-line").hide();
        $("#" + chartId).show();

        if (chartController.isCanvasBlank(chartId) == false){
            return;
        }

        $.ajaxRest({
            url: "/api/1/projects/" + projectId + "/scans/count/" + viewMode,
            type: "GET",
            success : function (data, status, header) {
                var dataLine = {
                   labels: [],
                   datasets : []
                };
                dataLine.datasets.push(chartController.getLineDatasets(messageController.get('label.scan'), "#007acc"));

                $.each(data, function(index, value) {

                    if (viewMode == "week") {
                        dataLine.labels.unshift(momentController.timestampFormat(value.startDate, "YYYY-MM-DD") + " ~ " + momentController.timestampFormat(value.endDate, "MM-DD"));
                    } else {
                        var dateFormate = null;
                        if (viewMode == "day") {
                            dateFormate = "YYYY-MM-DD";
                        } else if (viewMode == "month") {
                            dateFormate = "YYYY-MM";
                        } else if (viewMode == "year") {
                            dateFormate = "YYYY";
                        }
                        dataLine.labels.unshift(momentController.timestampFormat(value.startDate, dateFormate));
                    }

                    dataLine.datasets[0].data.unshift(value.count);
                });

                new Chart(document.getElementById(chartId), {
                    type: 'line',
                    data: dataLine,
                    options : chartController.getLineOption()
                });
            },
            error : function(hdr, status) {
                errorMsgHandler.swal(data);
            }
        });
    });
    $(":radio[name='viewModeScanCount']:checked").trigger("change");

    /***************************************************************************
     * 최근 분석
     ***************************************************************************/
    var $projectInfoTable = $("#projectInfoTable").dataTableController({
        url : "/api/1/scans",
        searchOption : {
            projectIds : [projectId]
        },
        order : [ [ 0, 'desc' ] ],
        ordering : false,
        dom : "" + ']<"top">rt<"bottom"><"clear">',
        iDisplayLength : 5,
        columnDefs : [ {
            targets : 0, // ID
            orderable : false,
            data : "scanId",
            className : "dt-head-right"
        }, {
            targets : 1, // 분석자
            orderable : false,
            data : "scanUserName",
            render : function(data, type, row) {
                if(data == null)
                    return row.scanUserId;
                return data.escapeHTML() + "(" + row.scanUserId + ")";
            }
        }, {
            targets : 2, // 진행 사항
            orderable : false,
            data : "progressPercent",
            className : "dt-head-right",
            render : function(data, type, row) {
                if (data == null)
                    return '-';
                return data + "%";
            }
        }, {
            targets : 3, // 전체 이슈
            orderable : false,
            data : "issueCount",
            className : "dt-head-right",
            render : function(data, type, row) {
                if (data == null)
                    return '-';
                return getLinkAllIssueCount(row);
            }
        }, {
            targets : 4, // LV1
            orderable : false,
            data : "risk1IssueCount",
            className : "dt-head-right",
            render : function(data, type, row) {
                if (data == null)
                    return '-';
                return getLinkRiskIssueCount({risk: "1", value: data, scanId: row.scanId});
            }
        }, {
            targets : 5, // LV2
            orderable : false,
            data : "risk2IssueCount",
            className : "dt-head-right",
            render : function(data, type, row) {
                if (data == null)
                    return '-';
                return getLinkRiskIssueCount({risk: "2", value: data, scanId: row.scanId});
            }
        }, {
            targets : 6, // LV3
            orderable : false,
            data : "risk3IssueCount",
            className : "dt-head-right",
            render : function(data, type, row) {
                if (data == null)
                    return '-';
                return getLinkRiskIssueCount({risk: "3", value: data, scanId: row.scanId});
            }
        }, {
            targets : 7, // LV4
            orderable : false,
            data : "risk4IssueCount",
            className : "dt-head-right",
            render : function(data, type, row) {
                if (data == null)
                    return '-';
                return getLinkRiskIssueCount({risk: "4", value: data, scanId: row.scanId});
            }
        }, {
            targets : 8, // LV5
            orderable : false,
            data : "risk5IssueCount",
            className : "dt-head-right",
            render : function(data, type, row) {
                if (data == null)
                    return '-';
                return getLinkRiskIssueCount({risk: "5", value: data, scanId: row.scanId});
            }
        }, {
            targets : 9,  // 분석 시작 일시
            orderable : false,
            data : "startDateTime",
            className : "dt-head-center",
            render : function(data, type, row) {
                if (data == null)
                    return '-';
                return momentController.timestampFormat(data, 'YYYY-MM-DD HH:mm:ss');
            }
        }, {
            targets : 10, // 분석 종료 일시
            orderable : false,
            data : "endDateTime",
            className : "dt-head-center",
            render : function(data, type, row) {
                if (data == null)
                    return '-';
                return momentController.timestampFormat(data, 'YYYY-MM-DD HH:mm:ss');
            }
        }, {
            targets : 11, // 분석 시간
            orderable : false,
            data : "analysisTime",
            className : "dt-head-center",
            render : function(data, type, row) {
                if (row.endDateTime == null || row.startDateTime == null)
                    return '-';
                return momentController.durationTime(data);
            }
        }, {
            targets : 12, // 체커 그룹
            orderable : false,
            data : "checkerGroupText",
            sortKey : "checkerGroupName"
        }, {
            targets : 13, // 소수 파일 수
            orderable : false,
            data : "fileCount",
            className : "dt-head-right",
            render : function(data, type, row) {
                if (data == null)
                    return '-';
                return getLinkFileCount(row);
            }
        }, {
            targets : 14, // 빌드 라인 수
            orderable : false,
            data : "buildLoc",
            className : "dt-head-right",
            render : function(data, type, row) {
                if (data == null)
                    return '-';
                return getLinkBuildLoc(row);
            }
        }],
        createdRow : function (row, data, index) {
            // 분석 요약 정보으로 이동
            $(row).on('click', function(e) {
                if(e.target.className.indexOf('select-checkbox') == -1
                    && e.target.className.indexOf('extend-button') == -1) {
                    $(window).attr('location','/scans/' + data.scanId + '/info');
                }
            });
        }
    });
});