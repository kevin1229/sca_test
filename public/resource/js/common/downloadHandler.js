/**
 * Download Handler
 * @author kimkc
 */
var DownloadHandler = (function(){

    function DownloadHandler(){
    }

    DownloadHandler.prototype.excute = function (elm, successCallback) {
        //$.fileDownload($(elm).prop('href'), {
        $.fileDownload(elm, {
            httpMethod: "GET",
            prepareCallback: function (url) {
                // 다운로드 시작
                $.toastGreen({
                    text: messageController.get('400036')
                });
            },
            successCallback: function (url) {
                // 다운로드 완료
                $.toastGreen({
                    text: messageController.get('400037')
                });

                if(successCallback != null){
                    successCallback();
                }
                return false;
            },
            failCallback: function (responseHtml, url, error) {
                // 다운로드 fail
                var arrMatch = responseHtml.match("(\\[.*\\])");
                if(arrMatch == null)
                    arrMatch = responseHtml.match("({.*})");

                if(arrMatch != null) {
                    // parsing success
                    var msg = "";
                    var msgObj = JSON.parse(arrMatch[0]);
                    for (var i in msgObj) {
                        msg += msgObj[i].message + " [" + msgObj[i].code + "]";
                    }
                    //errorMsgHandler.swal(JSON.parse(arrMatch[0]));
                    $.toastRed({
                        text: msg
                    });
                } else {
                    // parsing fail
                    var detailText = "<div class='text-left'><br/>URL:" + url;
                    if (error != null)
                        detailText += "<br/>error:" + error;
                    else if (responseHtml != null)
                        detailText += "<br/>response:" + responseHtml;
                    detailText += "</div>";

                    swal({
                        html: messageController.get('400051') + detailText,
                    });
                }
                //window.removeEventListener('keydown', preventEscapeBtn);
                return false;
            }
        });

        return false; //this is critical to stop the click event which will trigger a normal file download!
    }

    return DownloadHandler;
})();

var downloadHandler = new DownloadHandler();
