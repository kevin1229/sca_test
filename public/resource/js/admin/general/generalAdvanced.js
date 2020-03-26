$(function() {

    var $tabPaneDto = $("#tabPaneDto");
    var $tabPaneDisplay = $("#tabPaneDisplay");

    /***********************************************************************
     * 초기 탭 설정
     ***********************************************************************/
    initTab("dto");

    /***********************************************************************
     * DTO
     ***********************************************************************/
    $tabPaneDto.find('[name=dateTime]').daterangepickerController();

    // 내보내기
    $tabPaneDto.find('[name=btnExportDto]').on('click', function(e) {

        var url = "/api/1/system/usage/export/download"

        // 날짜 범위
        if ($.trim($tabPaneDto.find('[name=dateTime]').val()) != '') {
            url += "?startDateTime=" + encodeURIComponent($tabPaneDto.find('[name=dateTime]').data('daterangepicker').startDate.format("YYYY-MM-DD HH:mm:ss"));
            url += "&endDateTime=" + encodeURIComponent($tabPaneDto.find('[name=dateTime]').data('daterangepicker').endDate.format("YYYY-MM-DD HH:mm:ss"));
        }

        downloadHandler.excute(url);
        e.stopPropagation();
        return false;
    });


    /***********************************************************************
     * 표시
     ***********************************************************************/
    $.ajaxRest({
        url : "/api/1/admin/general/advanced/display",
        type : "GET",
        success : function(data, textStatus, header) {
            // 프로젝트: 프로젝트 경로(고급 옵션)
            if (data.projectAdvPaths) {
                $tabPaneDisplay.find("[name=projectAdvPaths]").bootstrapToggle('on');
            } else {
                $tabPaneDisplay.find("[name=projectAdvPaths]").bootstrapToggle('off');
            }

            // 분석: 파일 수정자
            if (data.scanFileUpdater) {
                $tabPaneDisplay.find("[name=scanFileUpdater]").bootstrapToggle('on');
            } else {
                $tabPaneDisplay.find("[name=scanFileUpdater]").bootstrapToggle('off');
            }
            // 분석: 메트릭
            if (data.scanMetric) {
                $tabPaneDisplay.find("[name=scanMetric]").bootstrapToggle('on');
            } else {
                $tabPaneDisplay.find("[name=scanMetric]").bootstrapToggle('off');
            }
        }
    });


    $tabPaneDisplay.find('[name=btnSave]').on('click', function(e) {
        var requestBody = {};
        requestBody.projectAdvPaths = $tabPaneDisplay.find("[name=projectAdvPaths]").prop('checked');
        requestBody.scanFileUpdater = $tabPaneDisplay.find("[name=scanFileUpdater]").prop('checked');
        requestBody.scanMetric = $tabPaneDisplay.find("[name=scanMetric]").prop('checked');

        $.ajaxRest({
            url: "/api/1/admin/general/advanced/display",
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