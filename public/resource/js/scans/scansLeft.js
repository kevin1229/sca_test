
$(function() {

    var scanId = $("#scanId").val();

    // 분석 정보 표시
    $.ajaxRest({
        url: "/api/1/scans/" + scanId,
        type: "GET",
        success : function (data, status, header) {

            // 왼쪽 프로젝트 정보
            var statusDetailData = {};
            statusDetailData.projectId = data.projectId;
            statusDetailData.projectName = data.projectName.escapeHTML();
            statusDetailData.projectKey = data.projectKey;
            statusDetailData.scanId = data.scanId;

            if(data.projectComment != null) {
                statusDetailData.projectComment = data.projectComment;
            } else {
                statusDetailData.projectComment = '-';
            }

            $('.status-project-name').attr("href", "/projects/" + data.projectId + "/info");

            if (data != null) {
                if(data.fileCount != null){
                    statusDetailData.fileCount = data.fileCount.format();
                } else {
                    statusDetailData.fileCount = "-";
                }

                if(data.buildLoc != null){
                    statusDetailData.buildLoc = data.buildLoc.format();
                } else {
                    statusDetailData.buildLoc = "-";
                }

                if(data.issueCount != null) {
                    statusDetailData.issueCount = data.issueCount.format();
                } else {
                    statusDetailData.issueCount = '-';
                }

                if(data.checkerCount != null) {
                    statusDetailData.checkerCount = data.checkerCount.format();
                } else {
                    statusDetailData.checkerCount = '-';
                }

                if (data.startDateTime != null){
                    statusDetailData.startDateTime = moment(new Date(data.startDateTime)).format('YYYY-MM-DD HH:mm:ss');
                } else {
                    statusDetailData.startDateTime = "-";
                }

                if (data.endDateTime != null){
                    statusDetailData.endDateTime = moment(new Date(data.endDateTime)).format('YYYY-MM-DD HH:mm:ss');
                } else {
                    statusDetailData.endDateTime = "-";
                }

                if (data.checkerGroupText != null){
                    statusDetailData.checkerGroupText = data.checkerGroupText;
                } else {
                    statusDetailData.checkerGroupText = "-";
                }
            }

            // 왼쪽 프로젝트 정보 표시
            var $statusDetail = $('#statusDetail');
            $statusDetail.html($statusDetail.html().compose(statusDetailData));

            // 왼쪽 작은 프로젝트 정보 표시
            var $statusDetailSmall = $('#sm_statusDetail');
            $statusDetailSmall.html($statusDetailSmall.html().compose(statusDetailData));
            $statusDetailSmall.removeClass('hidden');

            $('.left-side-menu').on("click", function () {
                if ($(this).hasClass('open')) {
                    $(this).removeClass('open');
                    $statusDetail.addClass('hidden');
                    $statusDetailSmall.removeClass('hidden');
                } else {
                    $statusDetail.removeClass('hidden');
                    $statusDetailSmall.addClass('hidden');
                    $(this).addClass('open');
                }
            });

            if ($('.left-side-fixed-menu').width() > 50) {
                $('#statusDetail').removeClass('hidden');
                $statusDetailSmall.addClass('hidden');
            }

            var buttonHtml = new StringBuffer();
            var aHtml = new StringBuffer();
            var spanHtml = new StringBuffer();

            // 총 이슈 표시
            if (data.issueCount != null && data.issueCount != 0) {
                buttonHtml.append('<button class="info-all-risk">').append(data.issueCount.format()).append('</button>');
                aHtml.append('<a class="risk info-all-risk" href="/scans/' + scanId + '/issues">').append(data.issueCount.format()).append('</a>');
            }

            // 위험도 표시
            for (var risk = 1; risk <= 5; risk++) {
                var target = "risk" + risk + "IssueCount";
                var riskIssueCount = data[target];
                if (!riskIssueCount) {
                    riskIssueCount = 0;
                }
                var preRiskIssueCount = 0;
                if (data.prevScan != null) {
                    preRiskIssueCount = data.prevScan[target];
                    if (!preRiskIssueCount) {
                        preRiskIssueCount = 0;
                    }
                }

                var compareCount;
                if (riskIssueCount == null || riskIssueCount == 0) {
                    compareCount = "0";
                } else {
                    compareCount = riskIssueCount - preRiskIssueCount;
                }

                var riskElement = "";
                if (compareCount > 0) {
                    riskElement = '<i class="fa fa-caret-up"></i> ' + compareCount.format();
                } else if (compareCount < 0) {
                    riskElement = '<i class="fa fa-caret-down"></i> ' + (compareCount * -1).format();
                } else {
                    riskElement = '-' ;
                }

                buttonHtml.append('<button class="info-risk' + risk + '" id="btn_risk_' + risk + '" href="/scans/' + scanId + '/issues#riskLevel=' + risk + '">').append(riskIssueCount.format()).append('</button>');
                var aHtmlTmp = '<a class="risk info-risk' + risk + '" href="/scans/' + scanId + '/issues#riskLevel=' + risk + '">' + riskIssueCount.format() + '</a>';
                aHtml.append(aHtmlTmp);
                spanHtml.append('<div class="scan-risk' + risk + '"><div>').append(aHtmlTmp).append('</div>').append('<div>').append(riskElement).append('</div></div>');
            }

            // html에 표시
            var $boxRiskContents = $('#box_riskContents');
            var $labelRiskContents = $('#label_riskContents');
            $boxRiskContents.html(aHtml.toString());
            $labelRiskContents.html(buttonHtml.toString());
            $('#scan_riskContents').html(spanHtml.toString());

            // 위험도 링크 이벤트
            $boxRiskContents.find('.risk').on("click", function(e) {
                var value = e.target.hash.split('=')[1];
                $modalIssueSearch.find('[name=risks]').val(value);
                searchIssues();
                searchIsseuGroup();
            });

            $labelRiskContents.find('button').on("click", function(e) {
                clearFilter();
                // 분류 table 초기화
                savedGroupItemIds = new Array();

                if($(e.target).attr('href') == undefined) {
                    $modalIssueSearch.find('[name=risks]').val(null);
                    window.history.replaceState(null, null, window.location.pathname);
                } else {
                    var value = $(e.target).attr('href').split('=')[1];
                    $modalIssueSearch.find('[name=risks]').val(value);
                }

                searchIssues();
                searchIsseuGroup();
                e.stopPropagation();
            });

            // 이슈 상태 표시
            var $statusDetail = $('#statusDetail');
            $statusDetail.find("[name=scanIssuesByStatusCodeNALink]").text(Number(data.statusNaIssueCount).format());
            $statusDetail.find("[name=scanIssuesByStatusCodeOKLink]").text(Number(data.statusOkIssueCount).format());
            $statusDetail.find("[name=scanIssuesByStatusCodeEXLink]").text(Number(data.statusExIssueCount).format());
            $statusDetail.find("[name=scanIssuesByStatusCodeERLink]").text(Number(data.statusErIssueCount).format());
            $statusDetail.find("[name=scanIssuesByStatusCodeEDLink]").text(Number(data.statusEdIssueCount).format());
            // 이슈 상태 링크 이벤트
            $statusDetail.find('[name^=scanIssuesByStatusCode]').on("click", function(e) {
                var value = url('#statusCode', e.target.href);
                $modalIssueSearch.find('[name=statusCodes]').val(value);
                if (url('#issueId', document.URL) == undefined) {
                    searchOption.issueIds = [];
                }
                searchIssues();
                searchIsseuGroup();
            });

            // 중앙 상단 네비게이터
            var $navigator = $("#navigator");
            if ($navigator.html() != undefined) {
                $navigator.html($navigator.html().compose(statusDetailData))
                $navigator.removeClass("invisible");
            }
        },
        error : function(hdr, status) {
            errorMsgHandler.swal(data);
        }
    });
});

