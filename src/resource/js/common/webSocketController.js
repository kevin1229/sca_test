
var WebSocketController = (function() {

    function WebSocketController() {
    }

    WebSocketController.prototype = {
        pendingListeners : [],
        afterConnectedCallback : [],
        //this.stompClient : null,
        // 리스너 등록
        addListener : function(url, callback) {
            if(this.stompClient == null){
                this.pendingListeners.push({"url":url,"callback":callback});
            } else {
                this.stompClient.subscribe(url, callback);
            }
        },
        // 커넥션 완료 콜백
        registCallbackAfterConnected : function(callback){
            if(this.stompClient.connected == false){
                this.afterConnectedCallback.push(callback);
            } else {
                callback();
            }
        },
        // 연결
        connect : function () {
            var socket = new SockJS('/nestStomp');
            this.stompClient = Stomp.over(socket);
            var obj = this;
            this.stompClient.debug = null;
            this.stompClient.connect({}, function(frame) {
                // setConnected(true);

                // 팬딩중인 리스너 추가하기.
                for(index in WebSocketController.prototype.pendingListeners){
                    var listener = WebSocketController.prototype.pendingListeners[index];
                    stompClient.subscribe(listener.url, listener.callback);
                }

                // 커넥션 완료 콜백
                for(index in WebSocketController.prototype.afterConnectedCallback){
                    var callback = WebSocketController.prototype.afterConnectedCallback[index];
                    callback();
                }

            }, function(message) {
                // check message for disconnect
                swal({
                    title : messageController.get('400010'),
                    type : "warning",
                    confirmButtonClass : "btn-warning",
                    confirmButtonText : messageController.get('label.ok'),
                    closeOnConfirm : true
                }, function() {
                    // 현재 페이지가 다시 로딩 되도록 페이지 리로딩 리퀘스트를 한다.
                    window.location.reload();
                });
            });
        },
        // 연결 해제
        disconnect : function() {
            if (this.stompClient != null) {
                this.stompClient.disconnect();
            }
            // setConnected(false);
            console.log("Disconnected");
        },
        // stompClient 객체 반환
        getStompClient : function() {
            return this.stompClient;
        }
    }

    return WebSocketController;
})();

var webSocketController = new WebSocketController();
webSocketController.connect();