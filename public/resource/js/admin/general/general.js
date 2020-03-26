$(function() {

    var $tabPanePersonal = $("#tabPanePersonal");
    var	$tabPaneAccess = $("#tabPaneAccess");
    var $tabPaneDisplay = $("#tabPaneDisplay");

    /***********************************************************************
     * 초기 탭 설정
     ***********************************************************************/
    initTab("personal");

    /***********************************************************************
     * 개인화
     ***********************************************************************/
    var rests = [];

    // 신규 사용자 개인화:사용자 - 로그인시 기본 페이지
    rests[0] = $.ajaxRest({
        url : "/api/1/users/pageStartUrl/items",
        type : "GET",
        success : function(data, textStatus, header) {
            $tabPanePersonal.find("[name=pageStartUrl]").select2Controller({data : data});
        }
    });

    // 신규 사용자 개인화:사용자 - 로그인시 기본 페이지
    rests[1] = $.ajaxRest({
        url : "/api/1/users/userLang/items",
        type : "GET",
        success : function (data, textStatus, jqXHR) {
            $tabPanePersonal.find("[name=userLang]").select2Controller({data : data, allowClear : true});
        }
    });


    // 신규 사용자 개인화:이슈 상세보기 - 이슈 목록 기준 설정
    rests[2] = $.ajaxRest({
        url : "/api/1/issues/group/items",
        type : "GET",
        success : function(data, textStatus, header) {
            $tabPanePersonal.find("[name=issueGroupId]").select2Controller({data : data});
        }
    });

    // 신규 사용자 개인화:이슈 상세보기 - 링크 표시 방법
    rests[3] = $.ajaxRest({
        url : "/api/1/issues/sourceLinkMethod/items",
        type : "GET",
        success : function(data, textStatus, header) {
            $tabPanePersonal.find("[name=issueSourceLinkMethod]").select2Controller({data : data});
        }
    });

    // 신규 사용자 개인화:이슈 상세보기 - 소스 코드 테마
    rests[4] = $.ajaxRest({
        url : "/api/1/issues/sourceTheme/items",
        type : "GET",
        success : function(data, textStatus, header) {
            $tabPanePersonal.find("[name=issueSourceTheme]").select2Controller({data : data});
        }
    });

    // 신규 사용자 개인화:이슈 상세보기 - 소스 코드 폰트 크기
    rests[5] = $.ajaxRest({
        url : "/api/1/issues/sourceFontSize/items",
        type : "GET",
        success : function(data, textStatus, header) {
            $tabPanePersonal.find("[name=issueSourceFontSize]").select2Controller({data : data});
        }
    });


    // 표시 정보
    $.when(rests[0], rests[1], rests[2], rests[3], rests[4], rests[5]).done(function() {
        $.ajaxRest({
            url : "/api/1/admin/general/personal",
            type : "GET",
            success : function(data, textStatus, header) {
                // 표시
                $tabPanePersonal.find("[name=pageStartUrl]").val(data.pageStartUrl).trigger('change');
                $tabPanePersonal.find("[name=userLang]").val(data.userLang).trigger('change');

                // 이슈
                $tabPanePersonal.find("[name=issueGroupId]").val(data.issueGroupId).trigger('change');
                $tabPanePersonal.find("[name=issueSourceLinkMethod]").val(data.issueSourceLinkMethod).trigger('change');
                if (data.issueActiveSuggestion) {
                    $tabPanePersonal.find("[name=issueActiveSuggestion]").bootstrapToggle('on');
                } else {
                    $tabPanePersonal.find("[name=issueActiveSuggestion]").bootstrapToggle('off');
                }
                $tabPanePersonal.find("[name=issueSourceTheme]").val(data.issueSourceTheme).trigger('change');
                $tabPanePersonal.find("[name=issueSourceFontSize]").val(data.issueSourceFontSize).trigger('change');
                if (data.issueSourceBranch) {
                    $tabPanePersonal.find("[name=issueSourceBranch]").bootstrapToggle('on');
                } else {
                    $tabPanePersonal.find("[name=issueSourceBranch]").bootstrapToggle('off');
                }
            }
        });
    });

    // 표시 저장하기
    $tabPanePersonal.find('[name=btnSave]').on('click',function(e){
        var requestBody = {};

        // 사용자
        requestBody.pageStartUrl = $tabPanePersonal.find("[name=pageStartUrl]").val();
        requestBody.userLang = $tabPanePersonal.find("[name=userLang]").val();

        // 이슈 상세보기
        requestBody.issueGroupId = $tabPanePersonal.find("[name=issueGroupId]").val();
        requestBody.issueSourceLinkMethod = $tabPanePersonal.find("[name=issueSourceLinkMethod]").val();
        requestBody.issueActiveSuggestion = $tabPanePersonal.find("[name=issueActiveSuggestion]").prop('checked');
        requestBody.issueSourceTheme = $tabPanePersonal.find("[name=issueSourceTheme]").val();
        requestBody.issueSourceFontSize = $tabPanePersonal.find("[name=issueSourceFontSize]").val();
        requestBody.issueSourceBranch = $tabPanePersonal.find("[name=issueSourceBranch]").prop('checked');

        $.ajaxRest({
            url: "/api/1/admin/general/personal",
            type: "PUT",
            data: requestBody,
            block: true,
            beforeSend: function(xhr, settings) {
                errorMsgHandler.clear($tabPanePersonal);
            },
            success: function(data, textStatus, jqXHR) {
                $.toastGreen({
                    text: messageController.get('400017')
                });
            },
            error: function(hdr, status) {
                errorMsgHandler.show($tabPanePersonal, hdr.responseText);
            }
        });
    });


   /***********************************************************************
    * 인증
    ***********************************************************************/
    // 인증 정보
    $.ajaxRest({
        url : "/api/1/admin/general/access",
        type : "GET",
        success : function(data, textStatus, header) {
            $tabPaneAccess.find("[name=sessionTimeout]").val(data.sessionTimeout);
            $tabPaneAccess.find('[name=allowAdminIpList]').val(getTextByList(data.allowAdminIpList));
        }
    });

    // 인증 저장하기
    $tabPaneAccess.find('[name=btnSave]').on('click', function(e){

        var requestBody = {};
        requestBody.sessionTimeout = $tabPaneAccess.find("[name=sessionTimeout]").val();
        requestBody.allowAdminIpList = $tabPaneAccess.find('[name=allowAdminIpList]').val().split('\n');

        $.ajaxRest({
            url: "/api/1/admin/general/access",
            type: "PUT",
            data: requestBody,
            block: true,
            beforeSend : function(xhr, settings) {
                errorMsgHandler.clear($tabPaneAccess);
            },
            success : function (data, textStatus, jqXHR) {
                $.toastGreen({
                    text: messageController.get('400017')
                });
            },
            error : function(hdr, status) {
                errorMsgHandler.show($tabPaneAccess, hdr.responseText);
            }
        });
    });

    /***********************************************************************
     * 표시
     ***********************************************************************/
    $tabPaneDisplay.find("[name=issueStatusResponseCount]").select2Controller({
        data: [
            { id: 0, text: messageController.get('item.issue.status.response.step.0') },
            { id: 1, text: messageController.get('item.issue.status.response.step.1') },
            { id: 2, text: messageController.get('item.issue.status.response.step.2') },
            { id: 3, text: messageController.get('item.issue.status.response.step.3') },
            { id: 4, text: messageController.get('item.issue.status.response.step.4') },
            { id: 5, text: messageController.get('item.issue.status.response.step.5') },
        ],
        width: "120px"
    });

    $.ajaxRest({
        url : "/api/1/admin/general/display",
        type : "GET",
        success : function(data, textStatus, header) {
            // 이슈
            $tabPaneDisplay.find("[name=issueStatusResponseCount]").val(data.issueStatusResponseCount).trigger('change');

            // 게시판
            if (data.boardNoticePopup) {
                $tabPaneDisplay.find("[name=boardNoticePopup]").bootstrapToggle('on');
            } else {
                $tabPaneDisplay.find("[name=boardNoticePopup]").bootstrapToggle('off');
            }

            // 시스템
            if (data.systemResourceInfo) {
                $tabPaneDisplay.find("[name=systemResourceInfo]").bootstrapToggle('on');
            } else {
                $tabPaneDisplay.find("[name=systemResourceInfo]").bootstrapToggle('off');
            }
        }
    });

    $tabPaneDisplay.find('[name=btnSave]').on('click', function(e) {
        var requestBody = {};
        requestBody.issueStatusResponseCount = $tabPaneDisplay.find("[name=issueStatusResponseCount]").val();
        requestBody.boardNoticePopup = $tabPaneDisplay.find("[name=boardNoticePopup]").prop('checked');
        requestBody.systemResourceInfo=$tabPaneDisplay.find("[name=systemResourceInfo]").prop('checked');

        $.ajaxRest({
            url: "/api/1/admin/general/display",
            type: "PUT",
            data: requestBody,
            block: true,
            beforeSend : function(xhr, settings) {
                errorMsgHandler.clear($tabPaneDisplay);
            },
            success : function(data, textStatus, jqXHR) {
                $.toastGreen({
                    text: messageController.get('400017')
                });
            },
            error : function(hdr, status) {
                errorMsgHandler.show($tabPaneDisplay, hdr.responseText);
            }
        });
    });

});