$(function() {

    // 검색용 파일 정보 리스트
    var fileInfoListForSearch = [];

    // 드럽다운 표시 여부
    var shownDropdown = false;

    // 카테고리
    var constCategoryId = {
            CREATE_DONE 	: "#collapseCreateDone",
            DOWNLOAD_DONE	: "#collapseDownloadDone",
            CREATING		: "#collapseCreating"
    }

    var $dropdownDownloadCenter = $('#dropdownDownloadCenter');
    var $downloadCenterCount = $("#downloadCenterCount");
    var $searchFileResult = $('#searchFileResult');
    var $collapseAllStatus = $("#collapseAllStatus");

    /***********************************************************************
     * 메세지 뱃지 카운트
     ***********************************************************************/
    // 뱃지 카운트 표시
    function reloadBadgeCount() {
        $.ajaxRest({
            url : "/api/1/exportedFile/totalCount",
            type : "GET",
            success : function(data, textStatus, header) {
                var count = parseInt(data);
                $downloadCenterCount.text(count);
                if (count > 0) {
                    $downloadCenterCount.show();
                } else {
                    $downloadCenterCount.hide();
                }
            }
        });
    }
    reloadBadgeCount();

    /***********************************************************************
     * 드럽다운 이벤트
     ***********************************************************************/
    $dropdownDownloadCenter.on('shown.bs.dropdown', function(e) {
        $dropdownDownloadCenter.off('shown.bs.dropdown');

        $.ajaxRest({
            url : "/api/1/exportedFile",
            type : "GET",
            success : function(data, textStatus, header) {
                shownDropdown = true;

                $.each(data, function(index, value) {
                    addExportedFileCard(value);
                });
            }
        });
    });

    // 자동 창 닫힘 방지
    $dropdownDownloadCenter.on('hide.bs.dropdown', function(e) {
        if ($(this).hasClass('do-not-auto-close')) {
            e.preventDefault();
        }
        $(this).removeClass('do-not-auto-close');
    });

    // 전체 삭제 버튼 이벤트 처리.
    $dropdownDownloadCenter.find('[data-name=btnDeleteAll]').on('click', function(e) {
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
                    url: "/api/1/exportedFile",
                    type: "DELETE",
                    success: function (data, textStatus, header) {
                        $.each($(".download-center-body .col-xs-12:not(.hidden) [data-name=btnDelete]"), function (index, value) {
                            deleteExportedFileCard(parseInt($(value).data('exportedFileId')));
                        });
                    },
                    error: function (hdr, status) {
                        errorMsgHandler.swal(data);
                    }
                });
            }
        });
    });

    /***********************************************************************
     * 파일 검색
     ***********************************************************************/
    // Search input keyup event
    $dropdownDownloadCenter.find('[name=txtSearchFile]').on('keyup', function(e){
        // ignore enter key
        if (e.which == 13) {
            return;
        }

        // ignore arrow keys
        if (e.which >= 37 && e.which <= 40) {
            return;
        }

        this.focus();

        // Run search
        // Search when the keyboard input stops for more than 0.1 second
        var $this = $(this);

        delay(function(){
            $('.download-center-body > div').addClass('hidden');

            var keyword = $this.val().trim();

            // 검색 키워드가 없어지면 전체 파일 보여준다.
            if (keyword == "") {
                $collapseAllStatus.parent().removeClass('hidden');
                $searchFileResult.parent().addClass('hidden');
                return;
            } else {
                $collapseAllStatus.parent().addClass('hidden');
                $searchFileResult.parent().removeClass('hidden');
            }

            // 검색 결과 리스트를 반환.
            var searchResultList = [];
            $.each(fileInfoListForSearch, function(idx, v){
                var searchResult = $.extend({}, v);
                var isSearched = false;

                var title = v.notifyMsgTitle;
                if (title.toUpperCase().indexOf(keyword.toUpperCase()) >= 0){
                    searchResult.notifyMsgTitle = getHighlightHtml(title, keyword);
                    isSearched = true;
                }

                var body = v.notifyMsgBody;
                if (body.toUpperCase().indexOf(keyword.toUpperCase()) >= 0){
                    searchResult.notifyMsgBodyTitle = body;
                    searchResult.notifyMsgBody = getHighlightHtml(body, keyword);
                    isSearched = true;
                }

                if (isSearched) {
                    searchResultList.push(searchResult);
                }
            });

            // 검색결과 클리어.
            $searchFileResult.find('.file-manager-template > div:not(.empty)').remove();

            if (searchResultList.length <= 0) {
                $searchFileResult.find('[name=empty]').removeClass('hidden');
            } else {
                $searchFileResult.find('[name=empty]').addClass('hidden');
                var parentEl = $searchFileResult.find('.file-manager-template');
                $.each(searchResultList, function(idx,v) {
                    var cardEl = createFileCard(v, v.category);
                    parentEl.prepend(cardEl);
                });
            }

        }, 100)
    });

    /**
     * Get highlighted html.
     * @param data
     * @param keyword
     * @returns {*}
     */
    function getHighlightHtml(data, keyword) {
        var i = data.toUpperCase().indexOf(keyword.toUpperCase());

        if (i >= 0) {
            return data.substring(0, i)
                + "<span class='result-highlight'>"
                + data.substring(i, keyword.length + i)
                + '</span>'
                + getHighlightHtml(data.substring(i + keyword.length , data.length), keyword);
        } else {
            return data;
        }
    }

    /**
     * set timer for execute function.
     */
    var delay = (function(){
        var timer = 0;
        return function(callback, ms){
            clearTimeout (timer);
            timer = setTimeout(callback, ms);
        };
    })();


    /***********************************************************************
     * 카드 관련 함수
     ***********************************************************************/
    // 카드 추가
    function addExportedFileCard(fileInfo) {
        // 다운로드 센터에 카드 추가 및 수정.
        // 수정의 경우는 삭제후에 다시 Insert하는 것으로 한다.
        var category = null;
        var notifyMsgBody = null;

        // 내보내기 파일의 상태를 반환한다.
        if (fileInfo.progressPercent == -2) {
            // 생성실패
            category = constCategoryId.CREATING;
            // 실패 : 423008={0} 내보낼 데이터가 없습니다.
            notifyMsgBody = messageController.get("423008", resourceMsgHandler.toString(fileInfo.messageJson));
        } else if (fileInfo.progressPercent < 0) {
            // 생성실패
            category = constCategoryId.CREATING;
            // 실패 : 423007={0} 내보내기를 실패했습니다.
            if (fileInfo.responseFileName)
                notifyMsgBody = fileInfo.responseFileName + " " + messageController.get("423007", resourceMsgHandler.toString(fileInfo.messageJson));
            else
                notifyMsgBody = messageController.get("423007", resourceMsgHandler.toString(fileInfo.messageJson));
        } else if (fileInfo.progressPercent < 100) {
            // 생성중
            category = constCategoryId.CREATING;
            // 생성중 : 423010=생성중 입니다.
            if(fileInfo.responseFileName)
                notifyMsgBody = fileInfo.responseFileName + " " + messageController.get("423010");
            else
                notifyMsgBody = messageController.get("423010");
        } else if (fileInfo.downloadDateTime == null || fileInfo.downloadDateTime == "" ) {
            category = constCategoryId.CREATE_DONE; // 생성완료
            notifyMsgBody = fileInfo.responseFileName;
        } else {
            category = constCategoryId.DOWNLOAD_DONE; // 다운로드 완료
            notifyMsgBody = fileInfo.responseFileName;
        }

        if (fileInfo.waitingNo || fileInfo.waitingNo > 0) {
            // 423031= (대기 {0}건)
            notifyMsgBody = messageController.get("423031", fileInfo.waitingNo) + " " + notifyMsgBody;
        }

        // 드럽다운가 표시 된 경우만 HTML을 추가한다.
        if (shownDropdown) {
            // 이미 추가 되어 있는 파일 삭제.
            $dropdownDownloadCenter.find('[name=downloadFile' + fileInfo.exportedFileId + ']').remove();

            // 파일 정보 검색을 위해 저장한다.
            fileInfo = $.extend(fileInfo, {
                "notifyMsgTitle": resourceMsgHandler.toString(fileInfo.messageJson),
                "notifyMsgBodyTitle": notifyMsgBody,
                "notifyMsgBody": notifyMsgBody,
                "category": category
            });
            fileInfoListForSearch.push(fileInfo);

            var cardEl = createFileCard(fileInfo, category);
            $collapseAllStatus.find('.file-manager-template').prepend(cardEl);
        }

        // 알림이 되지 않은 flash alert은 표시 해주고, 알림 완료 상태로 변경한다.
        if (fileInfo.showAlert && (fileInfo.alertDateTime == null || fileInfo.alertDateTime == "")) {
            // 알림 완료 상태로 변경 요청.
            $.ajaxRest({
                url : "/api/1/exportedFile/" + fileInfo.exportedFileId + "/alerted",
                type : "PUT",
                success : function(data, textStatus, header) {
                    // alert 표시
                    if (fileInfo.progressPercent == -2) {
                        $.toastRed({
                            heading: messageController.get("label.file.create.failed.title"),
                            text: messageController.get("423008", resourceMsgHandler.toString(fileInfo.messageJson))
                        });
                    } else if (fileInfo.progressPercent < 0) {
                        $.toastRed({
                            heading: messageController.get("label.file.create.failed.title"),
                            text: messageController.get("423007", resourceMsgHandler.toString(fileInfo.messageJson))
                        });
                    } else if (category == constCategoryId.CREATING) {
                        $.toastGreen({
                            text: messageController.get("423005", resourceMsgHandler.toString(fileInfo.messageJson))
                        });
                    } else if (category == constCategoryId.CREATE_DONE) {
                        $.toastGreen({
                            text: messageController.get("423006", resourceMsgHandler.toString(fileInfo.messageJson))
                        });
                    }
                }
            });
        }

        // 메세지 뱃지 리로드 카운트
        reloadBadgeCount();
    }

    function createFileCard(fileInfo, category) {
        // 파일 카드 템플릿 가져오기.
        var cardTemplate = $(category).find('.file-manager-template');
        var cardEl = cardTemplate.clone();

        // 파일 확장자
        var fileExt = null;
        if (fileInfo.responseFileName != null && fileInfo.responseFileName != "") {
            var fileName = fileInfo.responseFileName;
            fileExt = fileName.substring(fileName.lastIndexOf(".") + 1, fileName.length);
        }

        // 파일 아이콘 클래스
        var iconClass = null;
        var progressClass = null;
        if(fileExt != null) {
            switch(fileExt.toLowerCase()) {
            case "xls" :
            case "xlsx" :
                iconClass = "fa-file-excel-o";
                progressClass = "progress-bar-excel";
                break;
            case "doc" :
            case "docx" :
                iconClass = "fa-file-word-o";
                progressClass = "progress-bar-word";
                break;
            case "pdf" :
                iconClass = "fa-file-pdf-o";
                progressClass = "progress-bar-pdf";
                break;
            default :
                iconClass = "fa-file-text-o";
                progressClass = "progress-bar-csv";
            }
        }

        if (fileInfo.progressPercent < 0) {
            iconClass = "fa-times";
        }


        // 메세지를 파싱하여 추가한다.
        var cardHtml = cardEl.html().compose({
            "exportedFileId": fileInfo.exportedFileId,
            "iconClass" : iconClass,
            "progressClass" : progressClass,
            "notifyMsgTitle": fileInfo.notifyMsgTitle,   // 메세지 가져오기(타이틀)
            "notifyMsgBodyTitle": fileInfo.notifyMsgBodyTitle,
            "notifyMsgBody": fileInfo.notifyMsgBody,
            "progressPercent": fileInfo.progressPercent,
            "insertDateTime": moment(new Date(fileInfo.insertDateTime)).format("YYYY/MM/DD HH:mm") // 알림 날짜
        });

        cardEl.html(cardHtml);
        cardEl.removeClass('hidden');
        cardEl.removeClass('file-manager-template');
        cardEl.attr("name", "downloadFile" + fileInfo.exportedFileId);
        cardEl.find('.progress-bar').width(fileInfo.progressPercent + "%");

        // 카드의 퍼센트가 0보다 작을경우 프로그래스 바 영역 숨긴다.
        if (fileInfo.progressPercent <= 0) {
            cardEl.find('.progress-bar').hide();
        }

        // 다운로드 이벤트
        cardEl.find('a.download-link').attr("href", "/api/1/exportedFile/" + fileInfo.exportedFileId + "/download");
        cardEl.find('a.download-link').on('click', function(e) {
            downloadHandler.excute("/api/1/exportedFile/" + fileInfo.exportedFileId + "/download");
            e.stopPropagation();
            return false;
        });

        // 알림 삭제 이벤트.
        cardEl.find('[data-name=btnDelete]').on('click', function(e) {
            $.ajaxRest({
                url : "/api/1/exportedFile/" + fileInfo.exportedFileId,
                type : "DELETE",
                success : function(data, textStatus, header) {
                    deleteExportedFileCard(fileInfo.exportedFileId);
                    if (category == constCategoryId.CREATING) {
                        $.toastGreen({
                            text: messageController.get('432000')
                        });
                    } else {
                        $.toastGreen({
                            text: messageController.get('400024')
                        });
                    }
                }
            });
            e.stopPropagation();
        });

        return cardEl;
    }

    // 카드 삭제.
    function deleteExportedFileCard(exportedFileId) {
        $dropdownDownloadCenter.find('[name=downloadFile' + exportedFileId + ']').remove();
        reloadBadgeCount();

        // 파일 검색 객체에서 삭제된 파일 카드 정보 삭제.
        fileInfoListForSearch = fileInfoListForSearch.filter(function(value){
            return value.exportedFileId != exportedFileId;
        });
    }

    /***********************************************************************
     * 슬림 스크롤 삽입
     ***********************************************************************/
    $dropdownDownloadCenter.find('.download-center-body').slimscroll({
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
    webSocketController.registCallbackAfterConnected(function() {
        var userId = sessionUserController.getUser().userId;

        // 개별 다운로드 센터 알림 가져오기 수신.
        webSocketController.addListener('/user/' + userId + '/add/exportedFile', function(frame) {
            var fileList = JSON.parse(frame.body);
            $.each(fileList, function(index, value) {
                addExportedFileCard(value);
            });
        });
    });
});