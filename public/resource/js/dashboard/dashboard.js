$(function() {

    var charts = [];
    var searchOption = {};

    function search() {
        // 검색 초기화
        for(var chart in charts) {
            charts[chart].destroy();
            delete charts[chart];
        }
        searchOption = {};

        // 선택한 날짜
        if($searchPeriodDateTime.val()) {
            searchOption['fromDateTime'] = Date.parse($searchPeriodDateTime.data('daterangepicker').startDate._d);
            searchOption['toDateTime'] = Date.parse($searchPeriodDateTime.data('daterangepicker').endDate._d);
        }

        // 선택한 프로젝트 아이디
        var projectIds = [];
        var $projectTree = $searchProjectTree.dropdownFancytreeController('getTree');
        if($projectTree != null) {
            var selNodes = $projectTree.getSelectedNodes();
            selNodes.forEach(function(node) {
                projectIds.push(node.key);
            });
        }
        searchOption['projectIds'] = projectIds;
        $searchProjectTree.removeClass("open");

        // 검색 진행
        searchTotalCount();
        searchIssueTotalCount();
        searchCheckerTopIssueCount();
        searchProjectTopIssueCount();
        searchIssues();
        searchScans();
    }

    // 검색 조건: 기간 지정
    var $searchPeriodDateTime = $('#searchPeriodDateTime');
    $searchPeriodDateTime.daterangepickerController({
        timePicker: false,
        locale: {
            format : "YYYY-MM-DD",
            applyLabel: messageController.get("label.search"),
            cancelLabel: messageController.get("label.clear")
        },
        startDate:  moment().subtract(6, 'days').hour(0).minute(0).second(0),
        endDate: moment().hour(23).minute(59).second(59),
        autoUpdateInput: true,
    });
    $searchPeriodDateTime.on('apply.daterangepicker cancel.daterangepicker' ,function(e, picker){
        search();
    });

    // 검색 조건: 프로젝트 트리
    var $searchProjectTree = $('#searchProjectTree');
    $searchProjectTree.dropdownFancytreeController({
        ajax : {
            url : "/api/1/projects/fancytree"
        }
    });
    $searchProjectTree.find("[name=btnSearch]").on("click", function (e) {
        search();
    });

    $searchProjectTree.find("[name=btnClear]").on('click', function(e) {
        // 프로젝트 아이디
        $searchProjectTree.dropdownFancytreeController().clear();

        search();
    });

    // 총 개수 요약정보
    function searchTotalCount() {
        $.ajaxRest({
            url: "/api/1/results/totalCount",
            type: "POST",
            data: searchOption,
            success : function (data, status, header) {

                $("#txtTotalProjects").text(data.totalProjects.format());
                $("#txtTotalScans").text(data.totalScans.format());

                if(data.lastScanFilesByProject) {
                    $("#txtLastScanFilesByProject").text(data.lastScanFilesByProject.format());
                } else {
                    $("#txtLastScanFilesByProject").text("-");
                }

                if(data.totalScanFilesByProject) {
                    $("#txtTotalScanFilesByProject").text(data.totalScanFilesByProject.format());
                } else {
                    $("#txtTotalScanFilesByProject").text("-");
                }

                if(data.lastScanIssuesByProject) {
                    $("#txtLastScanIssuesByProject").text(data.lastScanIssuesByProject.format());
                } else {
                    $("#txtLastScanIssuesByProject").text("-");
                }

                if(data.totalScanIssuesByProject) {
                    $("#txtTotalScanIssuesByProject").text(data.totalScanIssuesByProject.format());
                } else {
                    $("#txtTotalScanIssuesByProject").text("-");
                }
            }
        });
    }

    // 위험도별 분석 결과
    function searchIssueTotalCount() {
        var viewMode = $(':radio[name="viewModeIssueCountByLevel"]:checked').val();
        var chartId = null;
        //var scanData = null;

        var scanType = null;

        if(viewMode == "totalScan") {
            chartId = "chartIssueCountOfTotalScanByLevel";
            scanType = "all";
        } else if(viewMode == "lastScan") {
            chartId = "chartIssueCountOfLastScanByLevel";
            scanType = "last";
        } else {
            console.log("error view mode:" + viewMode);
            return;
        }
        $(".chart-issue-level-line").hide();

        $("#" + chartId).hide();
        $('#' + chartId).parent().find('.no-data').addClass('hidden');

        if (chartController.isCanvasBlank(chartId) == false){
            if (charts[chartId]) {
                $("#" + chartId).show();
            }
            return;
        }

        $.ajaxRest({
            url: "/api/1/results/issues/totalCount/" + scanType,
            type: "POST",
            data: searchOption,
            success : function (data, status, header) {
                if (data.issueCount == null || data.issueCount == 0) {
                    $('#' + chartId).parent().find('.no-data').removeClass('hidden');
                    return;
                }
                $("#" + chartId).show();

                charts[chartId] = new Chart(document.getElementById(chartId), {
                    type: 'doughnutLabels',
                    //type: 'doughnut',
                    data: {
                        datasets: [{
                            data: [
                                data.risk1IssueCount,
                                data.risk2IssueCount,
                                data.risk3IssueCount,
                                data.risk4IssueCount,
                                data.risk5IssueCount
                            ],
                            backgroundColor: [
                                "#D32F2F",
                                "#F57C00",
                                "#FBC02D",
                                "#9E9D24",
                                "#616161"
                            ],
                            label: 'Dataset 1'
                        }],
                        labels: [
                            messageController.get("item.checker.risk.level.1"),
                            messageController.get("item.checker.risk.level.2"),
                            messageController.get("item.checker.risk.level.3"),
                            messageController.get("item.checker.risk.level.4"),
                            messageController.get("item.checker.risk.level.5")
                        ]
                    },
                    options: {
                        responsive: true,
                        legend: {
                            display: true,
                            position: 'right',
                            labels: {
                                boxWidth: 12,
                                fontSize: 13,
                               fontFamily: "'Nanum Gothic', 'Open Sans', sans-serif"
                            }
                        },
                        segmentLabel: {
                            type: 'no'
                        }
                    }
                });
            }
        });
    }
    $(":radio[name=viewModeIssueCountByLevel]").on("change", function() {
        searchIssueTotalCount();
    });

    // 체커별 검출된 순위
    function searchCheckerTopIssueCount() {
        $.ajaxRest({
            url: "/api/1/results/checkers/topIssueCount",
            type: "POST",
            data: searchOption,
            success : function (data, status, header) {
                $("#tableCheckerTopIssueCount tbody tr").remove();
                if (data.length <= 0) {
                    $("#tableCheckerTopIssueCount").parent().find('.no-data').removeClass('hidden');
                } else {
                    $("#tableCheckerTopIssueCount").parent().find('.no-data').addClass('hidden');
                    $.each(data, function(i) {
                        $("#tableCheckerTopIssueCount tbody").append(
                            "<tr><td style='padding: 2px 8px;width:90px;'><span class='btn-primary program-lang'>" + data[i].checkerLangCode.toUpperCase() + "</span>" +
                            "</td><td style='word-break:break-all;' title='" + data[i].checkerName + "'>" + data[i].checkerName +
                            "</td><td align='right' style='width:120px;'>" + data[i].issueCount.format() +
                            "</td></tr>");
                    });
                }
            }
        });
    }

    // 프로젝트별 검출 순위
    function searchProjectTopIssueCount() {

        var $tableProjectTopIssueCount = $("#tableProjectTopIssueCount");

        $.ajaxRest({
            url: "/api/1/results/projects/topIssueCount",
            type: "POST",
            data: searchOption,
            success : function (data, status, header) {
                $tableProjectTopIssueCount.find("tbody tr").remove();
                if (data.length <= 0) {
                    $tableProjectTopIssueCount.parent().find('.no-data').removeClass('hidden');
                } else {
                    $tableProjectTopIssueCount.parent().find('.no-data').addClass('hidden');

                    var $tbody = $tableProjectTopIssueCount.find("tbody");

                    $.each(data, function(i) {
                        var scanUser = null;
                        if (data[i].scanUserId == null) {
                            scanUser = messageController.get('label.unknown');
                        } else if (data[i].scanUserName == null) {
                            scanUser = data[i].scanUserId;
                        } else {
                            scanUser = data[i].scanUserName.escapeHTML() + "(" + data[i].scanUserId + ")";
                        }

                        var tr = "<tr>";
                        tr += '<td><a href="/projects/' + data[i].projectId + '/info" data-toggle="tooltip" data-container="body" data-html="true" title="';
                        tr += messageController.get('label.go.to.project.summary') + '<br/>' + messageController.get('label.project.key') + " : " + data[i].projectKey.escapeHTML() + '">'
                        tr += data[i].projectName.escapeHTML() + '</a></td>';
                        tr += "<td style='word-break:break-all;width:180px;' title='" + scanUser + "'><i class=\"fa fa-user\"></i>" + scanUser + "</td>";
                        tr += "<td align='right' style='width:100px'>" + data[i].issueCount.format() + "</td>";
                        tr += "</tr>";

                        $tbody.append(tr);
                    });
                }
            }
        });
    }

    // 이슈 추이
    function searchIssues() {
        var viewMode = $(':radio[name="viewModeIssueCount"]:checked').val();
        var viewUrl = null;
        var chartId = null;
        if(viewMode == "all") {
            viewUrl = "";
            chartId = "chartIssueAll";
        } else if(viewMode == "day") {
            viewUrl = "/day";
            chartId = "chartIssueDay";
        } else if(viewMode == "week") {
            viewUrl = "/week";
            chartId = "chartIssueWeek";
        } else if(viewMode == "month") {
            viewUrl = "/month";
            chartId = "chartIssueMonth";
        } else if(viewMode == "year") {
            viewUrl = "/year";
            chartId = "chartIssueYear";
        } else {
            console.log("error view mode:" + viewMode);
            return;
        }

        $(".chart-issue-line").hide();
        $("#" + chartId).show();

        if (chartController.isCanvasBlank(chartId) == false) {
            return;
        }

        $.ajaxRest({
            url: "/api/1/results/issues/count" + viewUrl,
            type: "POST",
            data: searchOption,
            success : function (data, status, header) {
                var dataLine = {
                   labels: [],
                   datasets : [],
                   mode: 'nearest',
                };
                dataLine.datasets.push(chartController.getLineDatasets(messageController.get("item.checker.risk.level.1"), "#D32F2F"));
                dataLine.datasets.push(chartController.getLineDatasets(messageController.get("item.checker.risk.level.2"), "#F57C00"));
                dataLine.datasets.push(chartController.getLineDatasets(messageController.get("item.checker.risk.level.3"), "#FBC02D"));
                dataLine.datasets.push(chartController.getLineDatasets(messageController.get("item.checker.risk.level.4"), "#9E9D24"));
                dataLine.datasets.push(chartController.getLineDatasets(messageController.get("item.checker.risk.level.5"), "#616161"));

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
                        if (i == 1) {
                            dataLine.datasets[0].data.unshift(value.risk1IssueCount == null? 0 : value.risk1IssueCount);
                        } else if (i == 2) {
                            dataLine.datasets[1].data.unshift(value.risk2IssueCount == null? 0 : value.risk2IssueCount);
                        } else if (i == 3) {
                            dataLine.datasets[2].data.unshift(value.risk3IssueCount == null? 0 : value.risk3IssueCount);
                        } else if (i == 4) {
                            dataLine.datasets[3].data.unshift(value.risk4IssueCount == null? 0 : value.risk4IssueCount);
                        } else if (i == 5) {
                            dataLine.datasets[4].data.unshift(value.risk5IssueCount == null? 0 : value.risk5IssueCount);
                        }
                    }
                });

                charts[chartId] = new Chart(document.getElementById(chartId), {
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
    }
    $(":radio[name=viewModeIssueCount]").on("change", function(e) {
        searchIssues();
    });

    // 분석 횟수
    function searchScans() {
        var viewMode = $(':radio[name="viewModeScanCount"]:checked').val();
        var chartId = null;
        if (viewMode == "week") {
            chartId = "chartScanWeek";
        } else if (viewMode == "month") {
            chartId = "chartScanMonth";
        } else if (viewMode == "year") {
            chartId = "chartScanYear";
        } else if (viewMode == "day") {
            chartId = "chartScanDay";
        } else {
            console.log("error view mode:" + viewMode);
            return;
        }

        $(".chart-scan-line").hide();
        $("#" + chartId).show();

        if (chartController.isCanvasBlank(chartId) == false) {
            return;
        }

        $.ajaxRest({
            url: "/api/1/results/scans/count/" + viewMode,
            type: "POST",
            data: searchOption,
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

                charts[chartId] = new Chart(document.getElementById(chartId), {
                    type: 'line',
                    data: dataLine,
                    options : chartController.getLineOption()
                });
            },
            error : function(hdr, status) {
                errorMsgHandler.swal(data);
            }
        });
    }
    $(":radio[name=viewModeScanCount]").on("change", function() {
        searchScans();
    });

    // 초기 검색
    search();

});