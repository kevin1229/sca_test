$(function() {

    function showSelectedProjectCount() {
        var selected = $('#exceptionProjectTree').fancytree('getTree').getSelectedNodes().length;
        var projectCount = $('#exceptionProjectTree').fancytree('getTree').count();
        var message = messageController.get("label.vcs.exception.format", selected.toString(), projectCount.toString());
        $('#txtSelectedProjectCount').text(message);
    }

    // 이관제어기준 변경시 from -> to
    function perLineYnOperation(toStatus, perLine) {
        //from('검출갯수':N) -> to('빌드 라인당 평균 개수':Y)
        var textEle = $('[name=perLineText]')[0];
        if (toStatus == 'Y') {
            if(typeof(perLine) == 'undefined') {
                if($(textEle).data('data') == null){
                    $(textEle).data('data', 1000);
                }
                $(textEle).val($(textEle).data('data'));
            } else {
                $('[name=perLineText]').val(perLine);
            }
            $(textEle).attr('placeholder', '1000');
            $(textEle).removeAttr('readonly');
            $(textEle).parents('.form-group').show();

        } else if (toStatus == 'N') {
            $(textEle).data('data', $(textEle).val());
            $(textEle).attr('readonly', 'readonly');
            $(textEle).removeAttr('placeholder');
            $(textEle).val('');
            $(textEle).parents('.form-group').hide();
        }
    }

    var	$tabPaneControl = $("#tabPaneControl");
    var $tabPaneException = $("#tabPaneException");

    /***********************************************************************
     * 초기 탭 설정
     ***********************************************************************/
    initTab("control");

    /***********************************************************************
     * 이관 제어
     ***********************************************************************/
    // 이관제어 기준
    $tabPaneControl.find('.perLine').on('click', function(e) {
        perLineYnOperation($(e.target).find('[name=perLineYn]').val());
    });

    $.ajaxRest({
        url: "/api/1/vcs/setting/control",
        type: "GET",
        success: function(data, textStatus, header) {
            // 접속 허용 IP 인증
            $tabPaneControl.find('[name=allowIps]').val(getTextByList(data.allowIps));


            // 포함 파일
            if (data.includeFiles != null && data.includeFiles.length != 0) {
                $tabPaneControl.find('[name=includeFiles]').val(getTextByList(data.includeFiles));
            }

            // 1000라인당
            if (data.perLine != null && data.perLine > 0) {
                $('[name=perLineYn][value="Y"]').parent().trigger('click');
                perLineYnOperation('Y', data.perLine);
            } else {
                $('[name=perLineYn][value="N"]').parent().trigger('click');
            }

            // 위험도
            $tabPaneControl.find('[name=risk1]').val(data.risk1);
            $tabPaneControl.find('[name=risk2]').val(data.risk2);
            $tabPaneControl.find('[name=risk3]').val(data.risk3);
            $tabPaneControl.find('[name=risk4]').val(data.risk4);
            $tabPaneControl.find('[name=risk5]').val(data.risk5);
        }
    });

    // 대상 파일:기본 값 변경
    $tabPaneControl.find("[name=btnIncludeFileDefault]").on('click', function() {
        $.ajaxRest({
            url : "/api/1/vcs/setting/control/default/include/files",
            type : "GET",
            success : function(data, textStatus, header) {
                $tabPaneControl.find('[name=includeFiles]').val(getTextByList(data));
            }
        });
    });


    // 저장
    $tabPaneControl.find("[name=btnSave]").on('click', function() {
        var requestBody = {};

        // 접속 허용 IP
        requestBody.allowIps = $tabPaneControl.find('[name=allowIps]').val().split('\n');

        // 대상 파일
        requestBody.includeFiles = $tabPaneControl.find('[name=includeFiles]').val().split('\n');

        // 기준
        requestBody.usePerLine = $tabPaneControl.find("[name=perLineYn]:checked").val() == 'Y';
        // 빌드 라인
        if (requestBody.usePerLine) {
            requestBody.perLine = $tabPaneControl.find('[name=perLineText]').val();
        } else {
            requestBody.perLine = null;
        }
        // 위험도 기준
        requestBody.risk1 = $tabPaneControl.find('[name=risk1]').val();
        requestBody.risk2 = $tabPaneControl.find('[name=risk2]').val();
        requestBody.risk3 = $tabPaneControl.find('[name=risk3]').val();
        requestBody.risk4 = $tabPaneControl.find('[name=risk4]').val();
        requestBody.risk5 = $tabPaneControl.find('[name=risk5]').val();

        $.ajaxRest({
            url: "/api/1/vcs/setting/control",
            type: "PUT",
            data: requestBody,
            block: true,
            beforeSend: function() {
                errorMsgHandler.clear($tabPaneControl);
            },
            success: function(data, textStatus, header) {
                $.toastGreen({
                    text: messageController.get("400017")
                });
            },
            error: function(hdr, status) {
                errorMsgHandler.show($tabPaneControl, hdr.responseText);
            }
        });
    });

    /***********************************************************************
     * 이관 제어 예외 구성
     ***********************************************************************/
    var rests = [];

    //예외 프로젝트 트리
    rests[0] = $.ajaxRest({
        url : "/api/1/projects/fancytree",
        type : "GET",
        success : function(data, textStatus, header) {
            $('#exceptionProjectTree').fancytreeController({
                checkbox: true,
                selectMode: 2,
                source: data,
                select: function(event, data){
                    showSelectedProjectCount();
                    return true;
                }
            });
        }
    });

    $tabPaneException.find('[name=interval]').daterangepickerController({
        timePicker : false,
        drops : 'up',
        locale : {
            format : "YYYY-MM-DD",
            cancelLabel : messageController.get('label.clear'),
        }
    });

    // 제외 파일:기본 값 변경
    $tabPaneException.find("[name=btnExceptionFileDefault]").on('click', function() {
        $.ajaxRest({
            url : "/api/1/vcs/setting/exception/default/files",
            type : "GET",
            success : function(data, textStatus, header) {
                $tabPaneException.find('[name=files]').val(getTextByList(data));
            }
        });
    });

    $.when(rests[0]).then(function() {

        $.ajaxRest({
            url : "/api/1/vcs/setting/exception",
            type : "GET",
            success : function(data, textStatus, header) {

                // 제외 - 파일
                if (data.files != null && data.files.length != 0) {
                    $tabPaneException.find('[name=files]').val(getTextByList(data.files));
                }

                // 제외 - 사용자
                if (data.userIds != null && data.userIds.length != 0) {
                    $tabPaneException.find('[name=userIds]').val(getTextByList(data.userIds));
                }

                // 제외 - 시스템
                if (data.systems != null && data.systems.length != 0) {
                    $tabPaneException.find('[name=systems]').val(getTextByList(data.systems));
                }

                // 제외 - 날짜
                if (data.dates != null && data.dates.length != 0) {
                    $tabPaneException.find('[name=dates]').val(getTextByList(data.dates));
                }

                // 제외 - 요일
                if (data.dayOfWeek != null && data.dayOfWeek.length != 0) {
                    for (var i = 0; i < data.dayOfWeek.length; i++) {
                        $($tabPaneException.find("[name=dayOfWeek]")[i]).prop('checked', data.dayOfWeek[i]);
                    }
                }

                // 제외 기간
                if ((data.intervalFrom != null && data.intervalFrom != 0) && (data.intervalTo != null && data.intervalTo != 0)) {
                    $tabPaneException.find("[name=interval]").data('daterangepicker').setStartDate(moment(data.intervalFrom));
                    $tabPaneException.find("[name=interval]").data('daterangepicker').setEndDate(moment(data.intervalTo));
                    var toDate = momentController.timestampFormat(data.intervalFrom, 'YYYY-MM-DD');
                    var fromDate = momentController.timestampFormat(data.intervalTo, 'YYYY-MM-DD');
                    $tabPaneException.find("[name=interval]").val(toDate + ' - ' + fromDate);
                }

                // 제외 시간
                if (data.timeFrom != null && data.timeTo != null) {
                    $tabPaneException.find("[name=fromHour]").val(data.timeFrom.substr(0, 2))
                    $tabPaneException.find("[name=fromMinute]").val(data.timeFrom.substr(2, 2))
                    $tabPaneException.find("[name=toHour]").val(data.timeTo.substr(0, 2))
                    $tabPaneException.find("[name=toMinute]").val(data.timeTo.substr(2, 2))
                }

                // 제외 프로젝트
                if (data.projectIds != null){
                    for(var i = 0; i < data.projectIds.length; i++) {  //체크
                        $('#exceptionProjectTree').fancytree('getTree').getNodeByKey(data.projectIds[i].toString()).setSelected(true);
                    }
                }
                showSelectedProjectCount();  //선택된 노드 수
            }
        });
    });


    // 저장
    $tabPaneException.find("[name=btnSave]").on('click', function() {
        var requestBody = {};

        requestBody.files = $tabPaneException.find('[name=files]').val().split('\n');
        requestBody.userIds = $tabPaneException.find('[name=userIds]').val().split('\n');
        requestBody.systems = $tabPaneException.find('[name=systems]').val().split('\n');
        requestBody.timeFrom = $tabPaneException.find("[name=fromHour]").val() + $tabPaneException.find("[name=fromMinute]").val();
        requestBody.timeTo = $tabPaneException.find("[name=toHour]").val() + $tabPaneException.find("[name=toMinute]").val();

        requestBody.dayOfWeek = [];
        requestBody.dayOfWeek.push($($tabPaneException.find("[name=dayOfWeek]")[0]).prop('checked'));
        requestBody.dayOfWeek.push($($tabPaneException.find("[name=dayOfWeek]")[1]).prop('checked'));
        requestBody.dayOfWeek.push($($tabPaneException.find("[name=dayOfWeek]")[2]).prop('checked'));
        requestBody.dayOfWeek.push($($tabPaneException.find("[name=dayOfWeek]")[3]).prop('checked'));
        requestBody.dayOfWeek.push($($tabPaneException.find("[name=dayOfWeek]")[4]).prop('checked'));
        requestBody.dayOfWeek.push($($tabPaneException.find("[name=dayOfWeek]")[5]).prop('checked'));
        requestBody.dayOfWeek.push($($tabPaneException.find("[name=dayOfWeek]")[6]).prop('checked'));

        requestBody.dates = $('#dates').val().split('\n');
        if($('form [name=interval]').val() != null && $('form [name=interval]').val() != "") {
            requestBody.intervalFrom = $('form [name=interval]').data('daterangepicker').startDate._d;
            requestBody.intervalTo = $('form [name=interval]').data('daterangepicker').endDate._d;
        }else {
            requestBody.intervalFrom = 0;
            requestBody.intervalTo = 0;
        }

        // 예외 프로젝트
        var projectIds = [];
        var selectedNodes = $('#exceptionProjectTree').fancytree('getTree').getSelectedNodes();
        for(var i=0; i<selectedNodes.length; i++) {
            projectIds.push(parseInt(selectedNodes[i].key));
        }
        requestBody.projectIds = projectIds;

        $.ajaxRest({
            url: "/api/1/vcs/setting/exception",
            type: "PUT",
            data: requestBody,
            block: true,
            beforeSend: function() {
                errorMsgHandler.clear($tabPaneException);
            },
            success : function(data, textStatus, header) {
                $.toastGreen({
                    text: messageController.get("400017")
                });
            },
            error : function(hdr, status) {
                errorMsgHandler.show($tabPaneException, hdr.responseText);
            }
        });
    });
});

