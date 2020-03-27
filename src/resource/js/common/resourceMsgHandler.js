/**
 * Resource Message Handler
 * @author kimkc
 */
var ResourceMsgHandler = (function(){

    function ResourceMsgHandler(){
    }

    ResourceMsgHandler.prototype.toString = function(msgString) {
        var msg = "";
        if(msgString != "" && msgString != null) {

            // 메세지 Json 파싱
            var msgJson = null;

            // JSON 형식이 아닌 일반 TEXT도 지원함.
            // 이때는 전달받은 인자를 그대로 리턴함.
            try {
                msgJson = JSON.parse(msgString);
                if(msgJson.resourceId == null && msgJson.params == null) {
                    return msgString;
                }
            } catch (e) {
                return msgString;
            }

            // resrouceId 취득
            var resId = msgJson.resourceId;

            // 파라메터 취득
            var params = msgJson.params;

            if(resId == null && params != null){

                // 메세지 에 파라메터 삽입.
                for(var i = 0; i < params.length; i++) {
                    if(params[i].type == "R") {
                        msg += messageController.get(params[i].value);
                    } else {
                        msg += params[i].value;
                    }
                    if(params.length != i + 1){
                        msg += " > ";
                    }
                }
            } else {
                // 리소스ID가 취득 실패했을 경우, 전달받은 메세지를 그대로 리턴함.
                if (!resId)
                    return msgString;

                // 리소스 취득
                var msg = messageController.get(resId);

                // 리소스 취득 실패 처리.
                if (msg == null || msg == "" ) {
                    return "undefine resource. resourceId:" + resId;
                }

                // 메세지 에 파라메터 삽입.
                if (params != null) {
                    for(var i = 0; i < params.length; i++) {
                        if(params[i].type == "R") {
                            msg = msg.replace('{' + i + '}', messageController.get(params[i].value));
                        } else {
                            msg = msg.replace('{' + i + '}', params[i].value);
                        }
                    }
                }
            }
        }
        return msg;
    }
    return ResourceMsgHandler;
})();

var resourceMsgHandler = new ResourceMsgHandler();