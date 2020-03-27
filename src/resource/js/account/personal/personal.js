$(function() {

    var $formPersonal = $("#formPersonal");

    var userLang = sessionUserController.getUser().userLang;

    var items = [];

    // 언어
    items[0] = $.ajaxRest({
        url : "/api/1/users/userLang/items",
        type : "GET",
        success : function(data, textStatus, header) {
            $formPersonal.find("[name=userLang]").select2Controller({data : data});
        }
    });

    // 로그인시 기본 페이지
    items[1] = $.ajaxRest({
        url : "/api/1/users/pageStartUrl/items",
        type : "GET",
        success : function(data, textStatus, header) {
            $formPersonal.find("[name=pageStartUrl]").select2Controller({data : data});
        }
    });

    // 이슈 목록 기준 설정
    items[3] = $.ajaxRest({
        url : "/api/1/issues/group/items",
        type : "GET",
        success : function(data, textStatus, header) {
            $formPersonal.find("[name=issueGroupId]").select2Controller({data : data});
        }
    });

    // 링크 표시 방법
    items[4] = $.ajaxRest({
        url : "/api/1/issues/sourceLinkMethod/items",
        type : "GET",
        success : function(data, textStatus, header) {
            $formPersonal.find("[name=issueSourceLinkMethod]").select2Controller({data : data});
        }
    });

    // 소스 코드 테마
    items[5] = $.ajaxRest({
        url : "/api/1/issues/sourceTheme/items",
        type : "GET",
        success : function(data, textStatus, header) {
            $formPersonal.find("[name=issueSourceTheme]").select2Controller({data : data});
        }
    });

    // 소스 코드 폰트 크기
    items[6] = $.ajaxRest({
        url : "/api/1/issues/sourceFontSize/items",
        type : "GET",
        success : function(data, textStatus, header) {
            $formPersonal.find("[name=issueSourceFontSize]").select2Controller({data : data});
        }
    });


    $.when(items[0], items[1], items[2], items[3], items[4], items[5], items[6]).then(function() {
        // 표시하기
        $.ajaxRest({
            url : "/api/1/account/personal",
            type : "GET",
            success : function(data, textStatus, header) {

                // 화면
                $formPersonal.find("[name=userLang]").val(data.userLang).trigger('change');
                $formPersonal.find("[name=pageStartUrl]").val(data.personalDisplay.pageStartUrl).trigger('change');

                // 이슈
                $formPersonal.find("[name=issueGroupId]").val(data.personalDisplay.issueGroupId).trigger('change');
                $formPersonal.find("[name=issueSourceLinkMethod]").val(data.personalDisplay.issueSourceLinkMethod).trigger('change');
                if (data.personalDisplay.issueActiveSuggestion) {
                    $formPersonal.find("[name=issueActiveSuggestion]").bootstrapToggle('on');
                } else {
                    $formPersonal.find("[name=issueActiveSuggestion]").bootstrapToggle('off');
                }
                $formPersonal.find("[name=issueSourceTheme]").val(data.personalDisplay.issueSourceTheme).trigger('change');
                $formPersonal.find("[name=issueSourceFontSize]").val(data.personalDisplay.issueSourceFontSize).trigger('change');
                if(data.personalDisplay.issueSourceBranch){
                    $formPersonal.find("[name=issueSourceBranch]").bootstrapToggle('on');
                } else {
                    $formPersonal.find("[name=issueSourceBranch]").bootstrapToggle('off');
                }

                $formPersonal.show();
            }
        });

        // 저장하기
        $formPersonal.find("[name=btnSavePersonal]").on('click', function(e) {
            var requestBody = {};
            requestBody.userLang = $formPersonal.find("[name=userLang]").val();

            requestBody.personalDisplay = {};
            requestBody.personalDisplay.pageStartUrl = $formPersonal.find("[name=pageStartUrl]").val();
            requestBody.personalDisplay.issueGroupId = $formPersonal.find("[name=issueGroupId]").val();
            requestBody.personalDisplay.issueSourceLinkMethod = $formPersonal.find("[name=issueSourceLinkMethod]").val();
            requestBody.personalDisplay.issueActiveSuggestion = $formPersonal.find("[name=issueActiveSuggestion]").prop('checked');
            requestBody.personalDisplay.issueSourceTheme = $formPersonal.find("[name=issueSourceTheme]").val();
            requestBody.personalDisplay.issueSourceFontSize = $formPersonal.find("[name=issueSourceFontSize]").val();
            requestBody.personalDisplay.issueSourceBranch = $formPersonal.find("[name=issueSourceBranch]").prop('checked');

            $.ajaxRest({
                url : "/api/1/account/personal",
                type : "PUT",
                data : requestBody,
                block : true,
                success : function(data, textStatus, header) {
                    sessionUserController.reload();
                    if (userLang != data.userLang) {
                        location.reload();
                    }
                    currentUserLang = data.userLang;
                    $.toastGreen({
                        text: messageController.get("label.personalization") + ' ' + messageController.get("label.has.been.modified")
                    });
                }
            });
        });
    });
});
