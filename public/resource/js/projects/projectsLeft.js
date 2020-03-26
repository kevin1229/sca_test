$(function(){

    var projectId = $("#projectId").val();

    // 프로젝트 정보 표시
    $.ajaxRest({
        url: "/api/1/projects/" + projectId,
        type: "GET",
        success : function (data, status, header) {

            // 왼쪽 프로젝트 정보
            var compareIssueCount = null;

            // 상태 정보 생성
            var statusDetailData = {};
            statusDetailData.parentProjectName = data.parentProject.projectName;
            statusDetailData.parentProjectKey = data.parentProject.projectKey;
            statusDetailData.projectId = data.projectId;
            statusDetailData.projectName = data.projectName.escapeHTML();
            statusDetailData.projectKey = data.projectKey;
            if(data.projectComment != null) {
                statusDetailData.projectComment = data.projectComment.escapeHTML();
            }
            if(data.lastScan != null) {
                if(data.lastScan.issueCount == null) {
                    statusDetailData.recentIssueCount = '-';
                } else {
                    statusDetailData.recentIssueCount = data.lastScan.issueCount.format();
                }
                if(data.preScan != null && data.preScan.issueCount != null && data.lastScan.issueCount != null) {
                    compareIssueCount = data.lastScan.issueCount - data.preScan.issueCount;
                    statusDetailData.compareIssueCount = compareIssueCount.format();
                }
                if(data.lastScan.endDateTime != null){
                    statusDetailData.recentAnalysisDate = moment(new Date(data.lastScan.endDateTime)).format('YYYY-MM-DD HH:mm:ss');
                } else {
                    statusDetailData.recentAnalysisDate = "-";
                }
            } else {
                statusDetailData.userName = "-";
                statusDetailData.recentIssueCount = "-";
                statusDetailData.recentAnalysisDate = "-";
            }
            statusDetailData.scanCount = data.scanCount;

            // 왼쪽 프로젝트 정보 표시
            var $statusDetail = $('#statusDetail');
            $statusDetail.html($statusDetail.html().compose(statusDetailData));
            if(compareIssueCount == null) {
                $statusDetail.find(".status-numeric-changing.increased").hide();
            } else if(compareIssueCount < 0) {
                $statusDetail.find(".status-numeric-changing.increased").find("i").removeClass("fa-caret-up").addClass("fa-caret-down");
                $statusDetail.find(".status-numeric-changing.increased").removeClass("increased").addClass("decreased")
            }
            $statusDetail.removeClass('hidden');

            // 중앙 네비게이터
            var $navigator = $("#navigator");
            $navigator.html($navigator.html().compose(statusDetailData));
            $navigator.removeClass("invisible");

            // 박스 헤드 타이틀
            var $boxHeaderTitle = $('#boxHeaderTitle');
            $boxHeaderTitle.html($boxHeaderTitle.html().compose(statusDetailData));
            $boxHeaderTitle.removeClass("invisible");
        },
        error : function(hdr, status) {
            errorMsgHandler.swal(data);
        }
    });

    /***********************************************************************
    * 단축키 등록
    ***********************************************************************/
   modelKeyboardShortCutInfo.setInfo({
       sections : [
           {
               title : messageController.get('label.table'),
               shortcuts : [
                   {
                       key : "i",
                       desc : messageController.get('label.analysis.details')
                   },
                   {
                       key : "↓, →",
                       desc : messageController.get('label.next.scan.result')
                   },
                   {
                       key : "↑, ←",
                       desc : messageController.get('label.previous.scan.result')
                   },
                   {
                       key : "Space",
                       desc : messageController.get('label.check.or.uncheck')
                   }
               ]
           }
       ]
   });


});