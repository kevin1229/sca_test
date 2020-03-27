$(function () {

    var scanId = $("#scanId").val();

    recentQueue.setItem("S", scanId);

    var $tabChecker = $('#tabChecker');
    var $modalScanComplianceCount = $('#modalScanComplianceCount');

    /***********************************************************************
     * 초기 탭 설정
     ***********************************************************************/
    initTab("info");

    /***************************************************************************
     * 개요 및 현황
     ***************************************************************************/
    // 분석 정보
    $.ajaxRest({
        url: "/api/1/scans/" + scanId,
        type: "GET",
        success : function (data, status, header) {

            // 프로젝트명
            data.projectName = data.projectName.escapeHTML()

            // 분석자
            if (data.scanUserName == null) {
                data.scanUser = data.scanUserId;
            } else {
                data.scanUser = data.scanUserName.escapeHTML() + "(" + data.scanUserId + ")";
            }

            // 분석 방법
            data.scanMode = messageController.get('item.scan.mode.' + data.scanModeCode);

            // 클라이언트
            data.client = messageController.get('item.scan.client.' + data.clientCode);

            // 분석 정보
            var $scanAbstract = $('#scanAbstract');

            // 분석 정보 : 분석ID
            $scanAbstract.find("[data-name=scanId]").text(data.scanId);

            // 분석 정보 : 진행
            var $progressPercent = $scanAbstract.find("[data-name=progressPercent]");
            var progressPercent = data.progressPercent;
            if (progressPercent == null) {
                progressPercent = 0;
            }
            $progressPercent.attr("aria-valuenow", progressPercent);
            $progressPercent.text(progressPercent + "%");
            $progressPercent.css("width", progressPercent + "%")

            // 분석 정보 : 프로젝트명
            $scanAbstract.find("[data-name=projectName]").text(data.projectName);
            $scanAbstract.find("[data-name=projectName]").attr("data-original-title", messageController.get("label.project.key") + " : " + data.projectKey);

            // 분석 정보 : 분석자
            $scanAbstract.find("[data-name=scanUser]").text(data.scanUser);

            // 분석 정보 : 분석 방법
            $scanAbstract.find("[data-name=scanMode]").text(data.scanMode);

            // 분석 정보 : 클라이언트
            $scanAbstract.find("[data-name=client]").text(data.client);

            // 분석 정보 : 클라이언트 IP
            $scanAbstract.find("[data-name=clientIp]").text(data.clientIp);

            // 분석 정보 : 분석 명령어
            $scanAbstract.find("[data-name=whistleCommand]").text(data.whistleCommand);


            if (data.progressPercent == 100) {
                $scanAbstract.find("[name=btnDownloadLog]").attr('disabled',false);
            }
            $scanAbstract.find("[name=btnDownloadLog]").on('click', function() {
                downloadHandler.excute("/api/1/scans/"+ scanId + "/log/download");
            });

            // 이전 결과 표시
            var statusDetailData = {};
            if(data.prevScan == null){
                statusDetailData.comparedFileCount = data.fileCount;
                statusDetailData.comparedIssueCounts = data.issueCount;
                statusDetailData.comparedCheckerCount = data.checkerCount;
            } else {
                statusDetailData.comparedFileCount = data.fileCount - data.prevScan.fileCount;
                statusDetailData.comparedIssueCounts = data.issueCount - data.prevScan.issueCount;
                statusDetailData.comparedCheckerCount = data.checkerCount - data.prevScan.checkerCount;
            }

            var $scanTarget = $("#scanTarget");

            // 이전 결과 표시 - 이슈
            if(data.issueCount != null) {
                $scanTarget.find("[data-name=issueCount]").text(data.issueCount.format());
            }
            if(statusDetailData.comparedIssueCounts > 0) {
                $scanTarget.find("[data-name=scanIssueTable]").addClass("increase");
                $scanTarget.find("[data-name=issueCountIcon]").addClass("fa-arrow-right");
                $scanTarget.find("[data-name=compareIssueCountText]").html('<i class="fa fa-caret-down"></i> ' + statusDetailData.comparedIssueCounts.format() + " " + messageController.get("label.increase"));
            } else if(statusDetailData.comparedIssueCounts < 0) {
                $scanTarget.find("[data-name=scanIssueTable]").addClass("decrease");
                $scanTarget.find("[data-name=issueCountIcon]").addClass("fa-arrow-right");
                $scanTarget.find("[data-name=compareIssueCountText]").html('<i class="fa fa-caret-down"></i> ' + Math.abs(statusDetailData.comparedIssueCounts).format() + " " + messageController.get("label.decrease"));
            } else {
                $scanTarget.find("[data-name=scanIssueTable]").addClass("no-change");
                $scanTarget.find("[data-name=issueCountIcon]").addClass("fa-minus-circle");
                $scanTarget.find("[data-name=compareIssueCountText]").text("- " + messageController.get("label.no.change"));
            }

            // 이전 결과 표시 - 분석 대상
            if(data.fileCount != null){
                $scanTarget.find("[data-name=fileCount]").text(data.fileCount.format());
            }
            if(statusDetailData.comparedFileCount > 0) {
                $scanTarget.find("[data-name=scanTargetTable]").addClass("increase");
                $scanTarget.find("[data-name=fileCountIcon]").addClass("fa-arrow-right");
                $scanTarget.find("[data-name=compareFileCountText]").html('<i class="fa fa-caret-down"></i> ' + statusDetailData.comparedFileCount.format() + " " + messageController.get("label.increase"));
            } else if(statusDetailData.comparedFileCount < 0) {
                statusDetailData.comparedFileCount = Math.abs(statusDetailData.comparedFileCount);
                $scanTarget.find("[data-name=scanTargetTable]").addClass("decrease");
                $scanTarget.find("[data-name=fileCountIcon]").addClass("fa-arrow-right");
                $scanTarget.find("[data-name=compareFileCountText]").html('<i class="fa fa-caret-down"></i> ' + Math.abs(statusDetailData.comparedFileCount).format() + " " + messageController.get("label.decrease"));
            } else {
                $scanTarget.find("[data-name=scanTargetTable]").addClass("no-change");
                $scanTarget.find("[data-name=fileCountIcon]").addClass("fa-minus-circle");
                $scanTarget.find("[data-name=compareFileCountText]").text("- " + messageController.get("label.no.change"));
            }

            // 이전 결과 표시 - 체커
            if(data.checkerCount != null) {
                $scanTarget.find("[data-name=checkerCount]").text(data.checkerCount.format());
            }
            if(statusDetailData.comparedCheckerCount > 0) {
                $scanTarget.find("[data-name=checkerTable]").addClass("increase");
                $scanTarget.find("[data-name=checkerCountIcon]").addClass("fa-arrow-right");
                $scanTarget.find("[data-name=compareCheckerCountText]").html('<i class="fa fa-caret-down"></i> ' + statusDetailData.comparedCheckerCount.format() + " " + messageController.get("label.increase"));
            } else if(statusDetailData.comparedCheckerCount < 0) {
                $scanTarget.find("[data-name=checkerTable]").addClass("decrease");
                $scanTarget.find("[data-name=checkerCountIcon]").addClass("fa-arrow-right");
                $scanTarget.find("[data-name=compareCheckerCountText]").html('<i class="fa fa-caret-down"></i> ' + Math.abs(statusDetailData.comparedCheckerCount).format() + " " + messageController.get("label.decrease"));
            } else {
                $scanTarget.find("[data-name=checkerTable]").addClass("no-change");
                $scanTarget.find("[data-name=checkerCountIcon]").addClass("fa-minus-circle");
                $scanTarget.find("[data-name=compareCheckerCountText]").text("- " + messageController.get("label.no.change"));
            }

            // 분석 체커 - 체커 정보
            initCheckerInfo(data);
        }
    });

    // 체커별 검출 순위
    var $dataTableChecker = $("#dataTableChecker").dataTableController({
        url : "/api/1/issues/group/details",
        searchOption : {
            scanId : scanId,
            groupId : -1
        },
        dom : '<"top">rt<"bottom"><"clear">',
        pageLength: 10,
        stateSave: false,
        columnDefs : [ {
            targets : 0,
            orderable : false,
            searchable: false,
            defaultContent : "",
            width : "20px"
        } , {
            targets: 1,
            defaultContent : "",
            width: "100px",
            data: "text",
            searchable: true
        }, {
            targets: 2,
            defaultContent: "",
            width: "30px",
            data: "count",
            className : "dt-head-right",
            render : function(data, type, row) {
                return '<i class="fa fa-exclamation-triangle"></i>&nbsp' + data.format();
            }
        }],
        order : [ [ 2, 'desc' ] ],
        createdRow: function (row, data, index) {
            var $row = $(row);

            $row.attr('title', messageController.get('label.issue.detail'));

            $row.on('click', function(e) {
                window.location.href = '/scans/' + scanId + '/issues#checkerName=' + data.text;
            });
        }
    });
    $dataTableChecker.DataTable().on( 'order.dt search.dt', function () {
        $dataTableChecker.DataTable().column(0, {search:'applied', order:'applied'}).nodes().each( function (cell, i) {
            cell.innerHTML = i + 1;
        } );
    });

    // 파일별 검출 순위
    var $dataTableFile = $("#dataTableFile").dataTableController({
        url: "/api/1/scans/files",
        searchOption: {
            scanId: scanId,
            showZeroIssueCount: false,
        },
        dom: '<"top">rt<"bottom"><"clear">',
        stateSave: false,
        pageLength: 10,
        columnDefs : [  {
            orderable : false,
            searchable: false,
            defaultContent : "",
            targets : 0,
            width : "20px"
        }, {
            orderable : true,
            targets : 1,
            width : "70px",
            data : "fileName",
            render : $.fn.dataTable.render.text()
        }, {
            orderable : true,
            targets : 2,
            width : "30px",
            data : "issueCount",
            className : "dt-head-right",
            render : function(data, type, row) {
                return '<i class="fa fa-exclamation-triangle"></i>&nbsp' + data.format();
            }
        }],
        order : [ [ 2, 'desc' ] ],
        createdRow: function (row, data, index) {
            var $row = $(row);

            $row.attr('title', messageController.get('label.issue.detail'));

            $row.on('click', function(e) {
                window.location.href = '/scans/' + scanId + '/files#path=' + data.filePath;
            });
        }
    });
    $dataTableFile.DataTable().on('order.dt search.dt', function () {
        $dataTableFile.DataTable().column(0, {search:'applied', order:'applied'}).nodes().each( function (cell, i) {
            cell.innerHTML = i + 1;
        });
    });


    /***************************************************************************
     * 분석 체커
     ***************************************************************************/
    // 체커 정보
    function initCheckerInfo(scanData) {

        $tabChecker.find("[data-name=checkerGroupText]").text(scanData.checkerGroupText);

        // 체커 그룹명
        $modalScanComplianceCount.find("[data-name=checkerGroupName]").text(scanData.checkerGroupName);

        // 레퍼런스
        $.ajaxRest({
            url: "/api/1/compliance/count",
            type: "GET",
            success : function (data, status, header) {
                $modalScanComplianceCount.find("[data-name=complianceCount]").text(data);
            }
        });

        // 활성화 체커 - 개수 표시
        $.ajaxRest({
            url: "/api/1/scans/" + scanData.scanId  + "/checkers/count",
            type: "GET",
            success : function (data, status, header) {
                if ($.isEmptyObject(data)) {
                    $modalScanComplianceCount.find("[data-name=checkerEnabledCount]").text("-");
                    $modalScanComplianceCount.find("[data-name=checkerAllCount]").text("-");
                } else {
                    $modalScanComplianceCount.find("[data-name=checkerEnabledCount]").text(Number(data.enabledCount).format());
                    $modalScanComplianceCount.find("[data-name=checkerAllCount]").text(Number(data.allCount).format());
                }
            }
        });

        $.ajaxRest({
            url: "/api/1/scans/" + scanData.scanId + "/compliance/checkers/count",
            type: "GET",
            success : function (data, status, header) {

                if ($.isEmptyObject(data)) {
                    return;
                }

                var $complianceInfoLinkElement = $tabChecker.find('[name=btnShowModalScanComplianceCount]');
                var complianceNames = [];
                data.forEach(function(v, i){
                    complianceNames.push(v.complianceName);
                });
                $complianceInfoLinkElement.attr('title', complianceNames.join(','));

                var text = null;
                if(data.length > 1) {
                    text = messageController.get("label.item.etc", data[0].complianceName, data.length);
                } else {
                    text = data[0].complianceName;
                }
                $complianceInfoLinkElement.text(text);

                // 레퍼런스 갯수
                var complianceEnabledCount = null;
                if (data.length == 0) {
                    complianceEnabledCount = "-";
                } else if (data.length == 1) {
                    complianceEnabledCount = data[0].complianceName;
                } else {
                    complianceEnabledCount = messageController.get("label.item.etc", data[0].complianceName, data.length);
                }
                $modalScanComplianceCount.find("[data-name=complianceEnabledCount]").text(complianceEnabledCount);

                // 레퍼런스 테이블
                $("#dataTableScanComplianceCount").DataTable({
                    data: data,
                    processing : false,
                    serverSide : false,
                    paging : false,
                    info : false,
                    colReorder: false,
                    searching : false,
                    order : [
                        [1, 'desc'],
                        [2, 'desc'],
                        [0, 'asc']
                    ],
                    language : {
                        emptyTable : messageController.get('info.table.5')
                    },
                    columnDefs: [{
                        targets: 0,
                        data: "complianceName", // 레퍼런스
                        render : $.fn.dataTable.render.text()
                    }, {
                        targets : 1,
                        data: "enabledCheckerPercent", // 활성화 체커 비율
                        className: "dt-head-right",
                        render: function(data, type, row, meta) {
                            return data.toFixed(2) + '%';
                        }
                    }, {
                        targets : 2,
                        data: "enabledCheckerCount", // 활성화 체커수
                        className: "dt-head-right"
                    }, {
                        targets : 3,
                        className: "dt-head-right",
                        data: "disabledCheckerCount", // 비활성화 체커수
                        className: "dt-head-right"
                    }, {
                        targets : 4,
                        data: "allCheckerCount", // 지원 체커수
                        className: "dt-head-right"
                    }]
                });
            }
        });
    }

    // 체커 목록
    $.ajaxRest({
        url: "/api/1/scans/" + scanId + "/checkers",
        type: "GET",
        success : function (data, status, header) {

            // 체커 정보 - 체커 그룹
            var riskCount = {
                1: 0,
                2: 0,
                3: 0,
                4: 0,
                5: 0
            }
            for(var i in data) {
                riskCount[data[i].risk] += 1;
            }
            var buttonHtml = new StringBuffer();
            for(var risk = 1; risk <= 5; risk++) {
                buttonHtml.append('<span class="btn-risk risk' + risk + '" id="btn_risk_' + risk + '">').append(riskCount[risk].format()).append('</span>');
            }
            $tabChecker.find('[name=checkerGroupLevels]').html(buttonHtml.toString());

            // 체커 목록
            $("#dataTableScanChecker").DataTable({
                data: data,
                processing : false,
                serverSide : false,
                paging : false,
                info : false,
                colReorder: false,
                searching : false,
                order : [ [ 0, 'asc' ] ],
                columnDefs : [{
                    orderable : true,
                    targets : 0,
                    width : "70px",
                    data : "checkerName",
                    render : function(data, type, row) {
                        if (row.checkerName == null) {
                            return row.checkerKey + " [" + row.checkerLang + "]";
                        }
                        return data + " [" + row.checkerLang + "]";
                    }
                }, {
                    orderable : true,
                    targets : 1,
                    width : "30px",
                    data : "risk",
                    className: "dt-head-center",
                    render : function(data, type, row) {
                        return "<span class=hide>" + (6 - data) + "</span>" +  '<div class="table-inner-link risk' + data + '">'+messageController.get("item.checker.risk.level." + data)+'</div>';
                    }
                }],
                drawCallback : function(settings) {
                    this.find('.dataTables_empty').attr('colSpan', 2)
                },
                language : {
                    emptyTable : messageController.get('info.table.5')
                }
            });
        }
    });

    /***************************************************************************
     * 이전 분석과의 이슈 비교 가져오기
     **************************************************************************/
    $.ajaxRest({
        url : "/api/1/scans/" + scanId + "/checkers/comparison",
        type : "GET",
        success : function(data, status, header) {
            if (data.length > 0) {
                var maxCount = 0;
                for (var i = 0; i < data.length; i++) {
                    if (maxCount < data[i].preCount) {
                        maxCount = data[i].preCount;
                    }
                    if (maxCount < data[i].curCount) {
                        maxCount = data[i].curCount;
                    }
                }
                if (maxCount == 0) {
                    // 이전, 현재 분석의 이슈 개수가 모두 0개인 경우
                    $("#noDataComparison").show();
                    return;
                }

                var $table = $("table.chartComparison");

                var labelPreviousScan = messageController.get('label.previous.scan');
                var labelCurrentScan = messageController.get('label.current.scan');
                for (var i = 0; i < data.length; i++) {
                    var preRatio = data[i].preCount * 95 / maxCount;
                    var curRatio = data[i].curCount * 95 / maxCount;
                    var $tr1 = $("<tr></tr>");
                    var $th1 = $("<th>[" + data[i].checkerLang + "]</th>");
                    var $td1 = $("<td><span data-container='body' data-toggle='tooltip' title='" + labelPreviousScan.format() + ": " + data[i].preCount.format() + "'><span style='width:" + preRatio + "%' class='chart-before'>&nbsp;</span> " + data[i].preCount.format() + "</span></td>");
                    $tr1.append($th1);
                    $tr1.append($td1);
                    $table.append($tr1);

                    var $tr2 = $("<tr></tr>");
                    var $th2 = $("<th>" + data[i].checkerName + "</th>");
                    var $td2 = $("<td><span data-container='body' data-toggle='tooltip' title='" + labelCurrentScan.format() + ": " + data[i].curCount.format() + "'><span style='width:" + curRatio + "%' class='chart-current'>&nbsp;</span> " + data[i].curCount.format() + "</span></td>");
                    $tr2.append($th2);
                    $tr2.append($td2);
                    $table.append($tr2);

                    var $tr3 = $("<tr></tr>");
                    var $th3 = $("<th></th>");
                    var $td3 = $("<td style='height:10px;'></td>");
                    $tr3.append($th3);
                    $tr3.append($td3);
                    $table.append($tr3);
                }
                $("#tableComparison").show();
            } else {
                // 결과가 없음
                $("#noDataComparison").show();
            }
        }
    });

});

