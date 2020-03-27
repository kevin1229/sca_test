$(function(){

    /***********************************************************************
     * 초기 탭 설정
     ***********************************************************************/
    initTab("scan");

    /***********************************************************************
     * 탭 내용
     ***********************************************************************/
    var logScan = null;
    var logData = null;
    var logAuth = null;
    var logSystem = null;
    var logWarn = null;
    var logVcs = null;

    function showTabContent() {
        switch($('#tabRoot li.active a').data('category')) {
            case "scan":
                if (logScan == null)
                    logScan = new LogScan();
                break;
            case "data":
                if (logData == null)
                    logData = new LogData();
                break;
            case "auth":
                if (logAuth == null)
                    logAuth = new LogAuth();
                break;
            case "system":
                if (logSystem == null)
                    logSystem = new LogSystem();
                break;
            case "warn":
                if (logWarn == null) {
                    logWarn = new LogWarn();
                }
                break;
            case "vcs":
                if (logVcs == null)
                    logVcs = new LogVcs();
                break;
        }
    }
    showTabContent();

    // 이벤트 관리
    $("#tabRoot a[data-toggle=tab]").on('shown.bs.tab', function(e) {
        showTabContent();
        resizeScrollbarOuter();
    });

});