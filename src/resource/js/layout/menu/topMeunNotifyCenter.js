$(function() {

    var $dropdownNotifyCenter = $("#dropdownNotifyCenter");

    var $notifyTotalCount = $('#notifyTotalCount');
    var $dropdownNotify = $('#dropdownNotify');
    var $modalNotifyMsg = $('#modalNotifyMsg');

    /***********************************************************************
     * 자동 창 닫힘 방지
     ***********************************************************************/
     $dropdownNotifyCenter.on('hide.bs.dropdown', function(e) {
         if ( $(this).hasClass('do-not-auto-close') ){
             e.preventDefault();
         }
         $(this).removeClass('do-not-auto-close');
     });

    /***********************************************************************
     * 메세지 뱃지 카운트
     ***********************************************************************/
    // 초기 뱃지 카운트 표시
    $.ajaxRest({
        url : "/api/1/notifys/totalCount",
        type : "GET",
        success : function(data, textStatus, header) {
            showBadgeAllCount(parseInt(data));
        }
    });

    function reloadBadgeCount(parentEl) {
        var cards = $dropdownNotifyCenter.find('[id^=notifyMsg] .notify-center-card');
        showBadgeAllCount(cards.length);

        // 자기 자신의 카테고리 뱃지 카운트 감소.
        var labelNotifyCountInner = parentEl.parent().parent().find('.label-notify-count-inner');
        labelNotifyCountInner.text(parentEl.find('[id^=notifyMsg] .notify-center-card').length);
    }

    function showBadgeAllCount(count) {
        $notifyTotalCount.text(count);
        if (count > 0) {
            $notifyTotalCount.show();
        } else {
            $notifyTotalCount.hide();
        }
    }

    function reloadAllBadgeCount() {
        var $notifyAnalysis = $dropdownNotifyCenter.find("#notifyAnalysis");
        var $notifyIssueExclusion = $dropdownNotifyCenter.find("#notifyIssueExclusion");

        $notifyAnalysis.find('.label-notify-count-inner').text($notifyAnalysis.find('[id^=notifyMsg] .notify-center-card').length);
        $notifyIssueExclusion.find('.label-notify-count-inner').text($notifyIssueExclusion.find('[id^=notifyMsg] .notify-center-card').length);

        var cards = $dropdownNotifyCenter.find('[id^=notifyMsg] .notify-center-card');
        showBadgeAllCount(cards.length);
    }


    /***********************************************************************
     * 드럽다운 이벤트
     ***********************************************************************/
    var loading = false;
    $dropdownNotifyCenter.on('shown.bs.dropdown', function(e) {
        $dropdownNotifyCenter.off('shown.bs.dropdown');

        $.ajaxRest({
            url : "/api/1/notifys",
            type : "GET",
            success : function(data, textStatus, header) {
                $.each(data, function(index, value) {
                    addNotify(value);
                });
                loading = true;
            }
        });
    });

    // 전체 알림 삭제 처리.
    $dropdownNotifyCenter.find('[data-name=btnDeleteAll]').on('click', function(e) {
        var notifyIds = [];
        $.each($dropdownNotifyCenter.find(".box-body .col-xs-12:not(.hidden) [name=btnDelete]"), function(index, value) {
            var notifyId = $(value).data("notifyId");
            notifyIds.push(notifyId);
        });

        deleteBatch(notifyIds);

        e.stopPropagation();
    });

    // 분석 알림 전체 삭제 처리.
    $dropdownNotifyCenter.find('[data-name=btnDeleteAnalysis]').on('click', function(e) {
        var notifyIds = [];
        $.each($dropdownNotifyCenter.find("#collapseAnalysis .box-body .col-xs-12:not(.hidden) [name=btnDelete]"), function(index, value) {
            var notifyId = $(value).data("notifyId");
            notifyIds.push(notifyId);
        });

        deleteBatch(notifyIds);

        e.stopPropagation();
    });

    // 이슈 제외 알림 전체 삭제 처리.
    $dropdownNotifyCenter.find('[data-name=btnDeleteIssueExclusion]').on('click', function(e) {
        var notifyIds = [];
        $.each($dropdownNotifyCenter.find("#collapseIssueExclusion .box-body .col-xs-12:not(.hidden) [name=btnDelete]"), function(index, value) {
            var notifyId = $(value).data("notifyId");
            notifyIds.push(notifyId);
        });

        deleteBatch(notifyIds);

        e.stopPropagation();
    });

    // 전달받은 버튼 리스트를 클릭 하도록 하여, 삭제를 진행한다.
    function deleteBatch(notifyIds) {
        if (notifyIds.length <= 0) {
            return;
        }

        swal({
            title : messageController.get('confirm.common.6'),
            text : messageController.get('info.common.3'),
            type : "warning",
            showCancelButton : true,
            confirmButtonClass : "btn-warning",
            confirmButtonText : messageController.get('label.delete'),
            cancelButtonText : messageController.get('label.cancel'),
            closeOnConfirm : true
        }, function(isConfirm) {
            if (isConfirm) {
                $.ajaxRest({
                    url : "/api/1/notifys",
                    type : "DELETE",
                    data : notifyIds,
                    success : function(data, textStatus, header) {
                        $.each(notifyIds, function(index, value) {
                            $dropdownNotifyCenter.find('#notifyMsg' + value).remove();
                        });

                        reloadAllBadgeCount();

                        $.toastGreen({
                            text: messageController.get('423009')
                        });
                    }
                });
            }
        });
    }

    /***********************************************************************
     * 카드 관련 함수
     ***********************************************************************/
    // 한개의 알람에 대해 알림 추가 및 alert표시
    function addNotify(notify, broadCastFromSystem) {

        // 전송 메세지 객체 가져옴.
        var notifyMsg = notify.notifyMsg;

        // title & body 스트링 생성
        var strTitle = resourceMsgHandler.toString(notifyMsg.msgTitleJson);
        var strBody = resourceMsgHandler.toString(notifyMsg.msgBodyJson);

        // 헤더에 추가 필요할 경우 추가함.
        if (notifyMsg.msgNotifyAddHeaderYn == 'Y') {
            //console.log("메세지를 헤더에 추가 필요함.");
            addNotifyCard(notify, strTitle, strBody);
        }

        // 알림 메세지 발송 필요 없을 경우(시스템 메세지 이지만, 시스템으로 부터 발송된 순간이 아니다.)
        if (broadCastFromSystem) {

            if (notifyMsg.msgType == "AC") {
                strTitle = messageController.get('423000', strTitle);
            }

            $.toastController({
                heading: strTitle,
                text: strBody
            });
        } else {
            // 미 알림 메세지의 경우 메세지 표시함.
            if (notify.msgNotifyType == "E" || notify.notifyStatusYn == "N") {

                if (notifyMsg.msgNotifyMethod == "A") {
                    // flash alert로 메세지 표시함.
                    $.toastController({
                        heading: strTitle,
                        text: strBody
                    });
                } else if (notifyMsg.msgNotifyMethod == "P") {
                    // popup으로 메세지 표시함.
                    showPopupAlert(strTitle, strBody);
                }

                // 알림 완료 상태로 변경.
                var requestBody = {};
                requestBody.notifyStatusYn = "Y";

                $.ajaxRest({
                    url : "/api/1/notifys/" + notify.notifyId + "/status",
                    type : "PUT",
                    data : requestBody,
                    success : function(data, textStatus, header) {
                        //changeNotifyStatus(JSON.parse(frame.body));
                    }
                });
            }
        }
    }

    // 알림 객체 만들어 헤더에 추가함.
    function addNotifyCard(notify, strTitle, strBody){

        // 이미 추가 되어 있는 메세지 인지 여부 확인.
        // 타이밍의 문제로 중복 추가 방지.
        var notifyId = notify.notifyId;
        if ($('#notifyMsg' + notifyId).length != 0){
            return;
        }

        deleteNotifyCard(notifyId, false);

        // 전송 메세지 객체 가져옴.
        var notifyMsg = notify.notifyMsg;

        // 알림 템플릿 가져오기.
        var notifyTemplate = null;

        if (notifyMsg.msgType == "AC") { // 분석 완료
            notifyMsg.iconName = "fa fa-clock-o color-blue";
            notifyTemplate = $("#collapseAnalysis").find('.notify-template');
        } else if(notifyMsg.msgType == "ER") { // 이슈 제외 신청
            notifyMsg.iconName = "fa fa-eye-slash color-gray";
            notifyTemplate = $("#collapseIssueExclusion").find('.notify-template');
        } else if(notifyMsg.msgType == "EX") { // 이슈 제외 승인
            notifyMsg.iconName = "fa fa-check-circle color-green";
            notifyTemplate = $("#collapseIssueExclusion").find('.notify-template');
        } else if(notifyMsg.msgType == "ED") { // 이슈 제외 거부
            notifyMsg.iconName = "fa fa-ban color-red";
            notifyTemplate = $("#collapseIssueExclusion").find('.notify-template');
        } else if(notifyMsg.msgType == "SW") { // 시스템 경고
            notifyMsg.iconName = "fa fa-exclamation-triangle color-yellow";
            notifyTemplate = $("#collapseSystemWarning").find('.notify-template');
        } else {
            console.log("msgType must be set.. notifyTranseferId : " + notify.notifyId);
            return;
        }

        var cardEl = notifyTemplate.clone();

        // 메세지를 파싱하여 추가함.
        cardEl.html(cardEl.html().compose({
            "icon": notifyMsg.iconName,
            "notifyId": notify.notifyId,
            "notifyMsgTitle": strTitle.escapeHTML(),
            "notifyMsgBody": strBody.escapeHTML(),
            "msgLink" : notifyMsg.msgLink,
            "insertDateTime": momentController.timestampFormat(notify.insertDateTime, 'YYYY-MM-DD HH:mm')
        }));
        cardEl.removeClass('hidden');
        cardEl.removeClass('notify-template');
        cardEl.attr("id", "notifyMsg" + notify.notifyId);

        // link정보가 포함 되어 있지 않을경우, link버튼 Active처리.
        if (notifyMsg.msgLink != null && notifyMsg.msgLink != ""){
            cardEl.find('.notify-msg-Link').removeClass("hidden");

            cardEl.find("[name=btnNotifyLink]").on('click', function(e){
             var notifyId = $(this).data("notifyId");
             var msgLink = $(this).data("msgLink");

             $.ajaxRest({
                 url : "/api/1/notifys/" + notifyId,
                 type : "DELETE",
                 success : function(data, textStatus, header) {
                     deleteNotifyCard(notifyId, false);
                     location.href = msgLink;
                 }
             });
              location.href = $(this).data("msgLink");
              e.stopPropagation();
          });
        }

        // 알림 삭제 이벤트.
        cardEl.find('[name=btnDelete]').on('click',function(e){

            var notifyId = $(this).data("notifyId");
            $.ajaxRest({
                url : "/api/1/notifys/" + notifyId,
                type : "DELETE",
                success : function(data, textStatus, header) {
                    deleteNotifyCard(notifyId, true);
                }
            });

            e.stopPropagation();
        });

        var parentEl = notifyTemplate.parent();
        parentEl.prepend(cardEl);

        reloadBadgeCount(parentEl);
    }

    // 알림 삭제.
    function deleteNotifyCard(notifyId, isShowMsg) {

        var cardEl = $('#notifyMsg' + notifyId);

        if (cardEl.length > 0) {

            cardEl.remove();

            reloadBadgeCount(cardEl.parent());

            // 삭제 완료 메세지 표시 여부.
            if(isShowMsg){
                $.toastGreen({
                    text: messageController.get('423009')
                });
            }
        }
    }

    // popup 표시
    function showPopupAlert(title, msg) {
        $modalNotifyMsg.find('.modal-title').html(title);
        $modalNotifyMsg.find('.modal-body').html(msg);
        $modalNotifyMsg.modal('show');
    }

    // 한개의 알람에 대해 알림 추가 및 alert표시
    function notifyAlertOnly(notifyMsg) {

        var strTitle = resourceMsgHandler.toString(notifyMsg.msgTitleJson);
        var strBody = resourceMsgHandler.toString(notifyMsg.msgBodyJson);

        if (notifyMsg.msgNotifyMethod == "A") {
            // flash alert로 메세지 표시함.
            $.toastGreen({
                heading: strTitle,
                text: strBody
            });
        } else if (notifyMsg.msgNotifyMethod == "P") {
            // popup으로 메세지 표시함.
            showPopupAlert(strTitle, strBody);
        }
    }

    /***********************************************************************
     * 슬림 스크롤 삽입
     ***********************************************************************/
    $dropdownNotifyCenter.find(".notify-center-body").slimscroll({
        destroy: true
    }).slimscroll({
        position: 'right',
        railVisible: true,
        width: '100%',
        height: '500px',
        alwaysVisible: true
    });

    /***********************************************************************
     * Websocket 리스너 설정.
     ***********************************************************************/
    // 웹소캣 커넥션 완료후에 호출하도록 한다.
    webSocketController.registCallbackAfterConnected(function() {
        var userId = sessionUserController.getUser().userId;

        // 사용자별 알림 메세지 수신.
        webSocketController.addListener('/user/' + userId + '/notify', function(frame){
            var notifyList = JSON.parse(frame.body);
            $.each(notifyList, function(index, value) {
                if (loading) {
                    addNotify(value, true);
                } else {
                    showBadgeAllCount(parseInt($notifyTotalCount.text()) + 1);
                }
            });
        });

        // 사용자별 메세지만 표시하는 알림 수신.
        webSocketController.addListener('/user/' + userId + '/notify/alert', function(frame){
            // 알림 메세지 표시
            notifyAlertOnly(JSON.parse(frame.body));
        });

        // 시스템으로 부터 전송된 순간 수신.
        webSocketController.addListener('/notify', function(frame){
            var notifyList = JSON.parse(frame.body);
            $.each(notifyList, function(index, value) {
                if (loading) {
                    addNotify(value, true);
                } else {
                    showBadgeAllCount(parseInt($notifyTotalCount.text()) + 1);
                }
            });
        });

        // 전체 메세지만 표시하는 알림 수신.
        webSocketController.addListener('/notify/alert', function(frame){
            // 알림 메세지 표시
            notifyAlertOnly(JSON.parse(frame.body));
        });
    });
});