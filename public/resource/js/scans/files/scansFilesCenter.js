$(function () {

    var scanId = $("#scanId").val();

    recentQueue.setItem("S", scanId);

    /***************************************************************************
     * 전역 변수
     ***************************************************************************/
    SearchOption = function() {
        this.scanId = null;
        this.filePath = "";
        this.fileLangCodes = [];
        this.scanFileIds = [];
    };
    SearchOption.prototype = {
        clear : function() {
            this.filePath = "";
            this.fileLangCodes = [];
            this.scanFileIds = [];
        }
    };
    var searchOption = new SearchOption();
    searchOption.scanId = scanId;

    if(searchOption.filePath === "" && url('#path', document.URL) != undefined) {
        searchOption.filePath = url('#path', document.URL);
        showSearchCondition();
    }

    var $dropdownSearchOptionFiles = $('#dropdownSearchOptionFiles');
    var $modalScanFile = $('#modalScanFile');

    /***************************************************************************
     * 함수
     ***************************************************************************/
    function openModelFile(scanFileId) {

        // 소스 코드 출력
        var rest = $.ajaxRest({
            url: "/api/1/scans/files/" + scanFileId +"/source",
            type: "GET",
            success: function (data, textStatus, header) {

                // Tab 제목 출력
                $modalScanFile.find('[data-name=fileName]').text(' [ ' + data.fileName + ' ] ');
                $modalScanFile.find('[data-name=fileHash]').text(data.fileHash);

                // File hash 복사
                $modalScanFile.find('[data-name=fileHash]').click(function (t) {
                    var $temp = $("<input>");
                    $("body").append($temp);
                    $temp.val($('#fileHashText').text()).select();
                    document.execCommand("copy");
                    $temp.remove();

                    $.toastGreen({
                       heading: messageController.get('400067'),
                       text: $('#fileHashText').text(),
                       stack: 1,
                    });
                });

                // Tab content 스타일 변경
                var sourceCodeTemplate = $("#sourceCodeTemplate").clone().html().compose({
                    filePath : data.filePath,
                    fileContent : data.fileContent.escapeHTML()
                });

                // 소스코드 html 추가
                $modalScanFile.find(".code-content").html(sourceCodeTemplate);

                // 소스코드 scroll 추가
                $modalScanFile.find("#code").addClass("scrollbar-outer");

                // 스크롤 이동
                $modalScanFile.find("#code.scrollbar-outer").scrollbar();

                var lang = data.fileExtension;
                if (lang === 'js') {
                    lang = 'javascript';
                } else if (lang === 'c' || lang === 'h' || lang === 'cpp' ) {
                    lang = 'c_cpp';
                } else if (lang === 'cs') {
                    lang = 'csharp';
                } else if (lang === 'py') {
                    lang = 'python';
                } else if (lang === 'vb') {
                    lang = 'vbscript';
                } else {
                    lang = 'java';
                }

                var editor = ace.edit("code");
                editor.setTheme("ace/theme/xcode");
                editor.setReadOnly(true);
                // Editor 세로 줄 삭제
                editor.setShowPrintMargin(false);
                editor.getSession().setMode("ace/mode/" + lang);

                // 모달 오픈
                $modalScanFile.modal("show");

                $(".scroll-wrapper.code.scrollbar-outer").height($(window).height() / 2);
                $modalScanFile.find("#code.scrollbar-outer").scrollbar();
            },
            error: function(hdr, status) {
                errorMsgHandler.swal(hdr.responseText);
            }
        });
    }


    /******************************************************************
     * 컴포넌트
     ******************************************************************/
    // 언어
    $.ajaxRest({
        url : "/api/1/scans/" + scanId + "/lang/items",
        type : "GET",
        success : function(data, textStatus, header) {
            $dropdownSearchOptionFiles.find('[name=fileLangCodes]').select2Controller({ multiple: true, data: data });
        }
    });

    // 경로
    $.ajaxRest({
        url: "/api/1/scans/" + scanId + "/files/fancytree",
        type: "GET",
        success : function (data, status, header) {
            $dropdownSearchOptionFiles.find('#searchOptionFileTree').dropdownFancytreeController({
                data: data,
                fancytree: {
                    selectMode : 3
                }
            });
        }
    });

    /******************************************************************
     * 검색
     ******************************************************************/
    // 간단 검색 입력폼
    $dropdownSearchOptionFiles.find("[name=txtSearchShort]").on("keydown", function(e) {
        var code = e.keyCode || e.which;
        if (code == 13) { // ENTER
            searchShort();
        }
    });

    // 돋보기 버튼
    $dropdownSearchOptionFiles.find("[name=btnSearchShort]").on("click", function() {
        searchShort();
    });

    // 경로명으로만 검색
    function searchShort() {
        searchOption.filePath = $dropdownSearchOptionFiles.find("[name=txtSearchShort]").val();

        $dataTableFile.draw();
        searchFileCount();
        showSearchCondition();
    }

    // 상세 검색
    $dropdownSearchOptionFiles.find("[name=btnSearch]").on("click", function() {
        searchOption.clear();

        // 언어
        searchOption.fileLangCodes = $dropdownSearchOptionFiles.find('[name=fileLangCodes]').val();

        // 경로
        searchOption.scanFileIds = [];
        var selNodes = $dropdownSearchOptionFiles.find('#searchOptionFileTree').dropdownFancytreeController('getTree').getSelectedNodes();
        selNodes.forEach(function(node) {
            if (node.folder == false) {
                searchOption.scanFileIds.push(node.key);
            }
        });

        showSearchCondition();
        $dataTableFile.draw();

        $dropdownSearchOptionFiles.find('[name=txtSearchShort]').val("");
        $dropdownSearchOptionFiles.removeClass('open');

        // 파일 기본 정보
        searchFileCount();
    });


    $dropdownSearchOptionFiles.find("[name=btnClear]").on("click", function() {
        clearSearchOption();
    });

    function clearSearchOption() {
        // 경로(짧은 검색)
        $dropdownSearchOptionFiles.find('[name=txtSearchShort]').val("");
        // 언어
        $dropdownSearchOptionFiles.find('[name=fileLangCodes]').val("").trigger('change');
        // 경로
        $dropdownSearchOptionFiles.find('#searchOptionFileTree').dropdownFancytreeController().clear();
    }

    // 현재 검색 기준
    function showSearchCondition() {
        $('#searchCondition').hide();
        $('#searchCondition .searchConditionHead').hide();
        $('#searchCondition .searchCondition').text('');

        if(searchOption == null) {
            return false;
        }

        // 경로(짧은 검색)
        if(searchOption.filePath != null && searchOption.filePath != "") {
            $('#searchCondition [name=filePath]').text(searchOption.filePath);
            $('#searchCondition [name=filePath]').parent().show();
            $('#searchCondition').css('display', 'inline-block');
        }

        // 언어
        if(searchOption.fileLangCodes != null && searchOption.fileLangCodes.length > 0) {
            var texts = getSelectTexts($dropdownSearchOptionFiles.find('[name=fileLangCodes]'), searchOption.fileLangCodes);
            $('#searchCondition [name=fileLang]').text(texts.join(', '));
            $('#searchCondition [name=fileLang]').parent().show();
            $('#searchCondition').css('display', 'inline-block');
        }

        // 경로
        if(searchOption.scanFileIds != null && searchOption.scanFileIds != "") {
            var texts = [];
            $.each($('#searchOptionFileTree').dropdownFancytreeController('getTree').getSelectedNodes(), function(index, value) {
                if(value.children == undefined) {
                    texts.push(value.title);
                }
            });
            $('#searchCondition [name=scanFileIds]').text(texts.join(', '));
            $('#searchCondition [name=scanFileIds]').parent().show();
            $('#searchCondition').css('display', 'inline-block');
        }
    }

    // Dropdown 닫기 방지 : common.js
    stopHideDropDown($dropdownSearchOptionFiles);

    /**
     * 현재 검색 결과 초기화 이벤트
     */
    $('#searchOptionClear').click(function () {
        clearSearchOption();
        $('button[name=btnSearch]').trigger('click');
    });

    /******************************************************************
     * 파일 기본 정보
     ******************************************************************/
    function searchFileCount() {
        // File 정보 초기화
        $.ajaxRest({
            url: "/api/1/scans/" + scanId + "/file/count",
            type: "POST",
            data: {
                "searchOption" : searchOption
            },
            success : function(data, textStatus, header){

                var $tableScanFileCount = $('#tableScanFileCount');
                var $body = $('#tableScanFileCount').find('tbody');
                var $foot = $('#tableScanFileCount').find('tfoot');

                $body.find('tr:not(.templete)').remove();
                $foot.find('tr:not(.templete)').remove();

                var rowTemplete = $('<div>').append($body.find('.templete').clone().removeClass('templete hidden')).html();
                var footTemplete = $('<div>').append($foot.find('.templete').clone().removeClass('templete hidden')).html();

                var fileCountMap = {};

                var total = {
                    fileCount: 0,
                    physicalLoc: 0,
                    buildLoc: 0,
                    issueCount: 0,
                    risk1IssueCount: 0,
                    risk2IssueCount: 0,
                    risk3IssueCount: 0,
                    risk4IssueCount: 0,
                    risk5IssueCount: 0
                };

                $.each(data, function (index, value) {
                    var tmpData;
                    if (fileCountMap.hasOwnProperty(value.fileLang)) {
                        tmpData = fileCountMap[value.fileLang];
                    } else {
                        tmpData = $.extend({}, total);
                    }
                    tmpData.fileCount += value.fileCount;
                    tmpData.physicalLoc += value.physicalLoc;
                    tmpData.buildLoc += value.buildLoc;
                    tmpData.issueCount += value.issueCount;
                    tmpData.risk1IssueCount += value.risk1IssueCount;
                    tmpData.risk2IssueCount += value.risk2IssueCount;
                    tmpData.risk3IssueCount += value.risk3IssueCount;
                    tmpData.risk4IssueCount += value.risk4IssueCount;
                    tmpData.risk5IssueCount += value.risk5IssueCount;

                    fileCountMap[value.fileLang] = tmpData;
                });

                $.each(Object.keys(fileCountMap).sort(), function (index, key) {

                    fileLang = key;
                    value = fileCountMap[key];

                    //total.fileLang += value.fileLang;
                    total.fileCount += value.fileCount;
                    total.physicalLoc += value.physicalLoc;
                    total.buildLoc += value.buildLoc;
                    total.issueCount += value.issueCount;
                    total.risk1IssueCount += value.risk1IssueCount;
                    total.risk2IssueCount += value.risk2IssueCount;
                    total.risk3IssueCount += value.risk3IssueCount;
                    total.risk4IssueCount += value.risk4IssueCount;
                    total.risk5IssueCount += value.risk5IssueCount;

                    var newRow = rowTemplete.compose({
                        'fileLang': fileLang,
                        'fileCount': numTypeNullCheck(value.fileCount).format(),
                        'physicalLoc': numTypeNullCheck(value.physicalLoc).format(),
                        'buildLoc': numTypeNullCheck(value.buildLoc).format(),
                        'issueCount': numTypeNullCheck(value.issueCount).format(),
                        'risk1IssueCount': numTypeNullCheck(value.risk1IssueCount).format(),
                        'risk2IssueCount': numTypeNullCheck(value.risk2IssueCount).format(),
                        'risk3IssueCount': numTypeNullCheck(value.risk3IssueCount).format(),
                        'risk4IssueCount': numTypeNullCheck(value.risk4IssueCount).format(),
                        'risk5IssueCount': numTypeNullCheck(value.risk5IssueCount).format(),
                        'density': (numTypeNullCheck(value.issueCount) / numTypeNullCheck(value.buildLoc) * 1000).toFixed(2)
                    });

                    $body.append(newRow);
                });

                total.density = numTypeNullCheck(total.issueCount) / numTypeNullCheck(total.buildLoc) * 1000;

                var newRow = footTemplete.compose({
                    'fileLang': messageController.get('label.overall'),
                    'fileCount': numTypeNullCheck(total.fileCount).format(),
                    'physicalLoc': numTypeNullCheck(total.physicalLoc).format(),
                    'buildLoc': numTypeNullCheck(total.buildLoc).format(),
                    'issueCount': numTypeNullCheck(total.issueCount).format(),
                    'risk1IssueCount': numTypeNullCheck(total.risk1IssueCount).format(),
                    'risk2IssueCount': numTypeNullCheck(total.risk2IssueCount).format(),
                    'risk3IssueCount': numTypeNullCheck(total.risk3IssueCount).format(),
                    'risk4IssueCount': numTypeNullCheck(total.risk4IssueCount).format(),
                    'risk5IssueCount': numTypeNullCheck(total.risk5IssueCount).format(),
                    'density': total.density.toFixed(2)
                });

                $foot.append(newRow);

                $tableScanFileCount.show();
            },
            error: function(hdr, status) {
                errorMsgHandler.swal(data);
            }
        });
    }
    searchFileCount();

    /***************************************************************************
     * 테이블 버튼
     ***************************************************************************/
    // 내보내기
    $('#buttonGroupDataTableFile').find('[name=btnExportCsv]').on('click', function(e) {
        var requestBody = {};
        requestBody.searchOption = {};
        requestBody.searchOption = searchOption;

        $.ajaxRest({
            url : "/api/1/scans/files/export/csv",
            type : "POST",
            data: requestBody,
            error : function(hdr, status) {
                errorMsgHandler.swal(hdr.responseText);
            }
        });
    });

    /***************************************************************************
     * 테이블 표시
     ***************************************************************************/
    var displayScanFileUpdater = ($("#displayScanFileUpdater").val() == "true");

    var $dataTableFile = $("#dataTableFile").dataTableController({
        url : "/api/1/scans/files",
        searchOption : searchOption,
        buttonGroupId: "buttonGroupDataTableFile",
        order : [ [ 4, 'desc' ] ],
        columnDefs : [ {
            targets: 0,
            width: "2%",
            visible: false,
            data: "scanFileId",
            className: "dt-head-right"
        }, {
            targets: 1,
            width: "20px",
            data: "fileLang",
            render : $.fn.dataTable.render.text()
        }, {
            targets: 2,
            width: "300px",
            data: "filePath",
            visible: false,
            render : $.fn.dataTable.render.text()
        }, {
            targets: 3,
            width: "70px",
            data: "fileName",
            render : $.fn.dataTable.render.text()
        }, {
            targets: 4,
            width: "30px",
            data: "issueCount",
            className : "dt-head-right",
            render : function(data, type, row) {
                return getLinkAllIssueCount({scanId: scanId, issueCount: data, scanFileId: row.scanFileId});
            }
        }, {
            targets: 5,
            width: "30px",
            data: "risk1IssueCount",
            className : "dt-head-right",
            render : function (data, type, row) {
                return getLinkRiskIssueCount({risk: "1", value: data, scanId: scanId, scanFileId: row.scanFileId});
            }
        }, {
            targets: 6,
            width: "30px",
            data: "risk2IssueCount",
            className : "dt-head-right",
            render : function (data, type, row) {
                return getLinkRiskIssueCount({risk: "2", value: data, scanId: scanId, scanFileId: row.scanFileId});
            }
        }, {
            targets: 7,
            width: "30px",
            data: "risk3IssueCount",
            className : "dt-head-right",
            render : function (data, type, row) {
                return getLinkRiskIssueCount({risk: "3", value: data, scanId: scanId, scanFileId: row.scanFileId});
            }
        }, {
            targets: 8,
            width: "30px",
            data: "risk4IssueCount",
            className : "dt-head-right",
            render : function (data, type, row) {
                return getLinkRiskIssueCount({risk: "4", value: data, scanId: scanId, scanFileId: row.scanFileId});
            }
        }, {
            targets: 9,
            width: "30px",
            data: "risk5IssueCount",
            className : "dt-head-right",
            render : function (data, type, row) {
                return getLinkRiskIssueCount({risk: "5", value: data, scanId: scanId, scanFileId: row.scanFileId });
            }
        }, {
            targets: 10,
            width: "60px",
            data: "physicalLoc", // 전체 라인
            className : "dt-head-right",
            render : $.fn.dataTable.render.text()
        }, {
            targets: 11,
            width: "60px",
            data: "buildLoc", // 빌드라인
            className : "dt-head-right",
            render : $.fn.dataTable.render.text()
        }, {
            targets: 12,
            width: "60px",
            data: "commentLoc", // 주석 라인
            className : "dt-head-right",
            render : $.fn.dataTable.render.text()
        }, {
            targets: 13,
            width: "60px",
            data: "buildRate", // 빌드 라인 비율
            visible: false,
            className : "dt-head-right",
            render : function (data, type, row) {
                return '<div data-container="body" title="(' + messageController.get("label.build.loc") + '/' + messageController.get("label.physical.loc") + ')*100">' + data + '</div>';
            }
        }, {
            targets: 14,
            width: "60px",
            data: "commentRate", // 주석 라인 비율
            visible: false,
            className : "dt-head-right",
            render : function (data, type, row) {
                return '<div data-container="body" title="(' + messageController.get("label.comment.loc") + '/' + messageController.get("label.physical.loc") + ')*100">' + data + '</div>';
            }
        }, {
            targets: 15,
            width: "60px",
            data: "density", // 밀도
            visible: true,
            className : "dt-head-right",
            render : function (data, type, row) {
                return '<div data-container="body" title="(' + messageController.get("label.issues") + '/' + messageController.get("label.build.loc") + ')*1000">' + data + '</div>';
            }
        }, {
            targets: 16,
            width: "60px",
            data: "fileUpdateUserName", // 파일 수정자
            visible: false,
            colvis: displayScanFileUpdater,
            render: function (data, type, row) {
                if (data == null)
                    return row.fileUpdateUserId;
                return data.escapeHTML() + "(" + row.fileUpdateUserId + ")";
            }
        } ],
        createdRow: function (row, data, index) {
            $(row).on('click', function(e){
                openModelFile(data.scanFileId);
            });
        },
        drawCallback : function(settings, json) {
            if (displayScanFileUpdater == false) {
                // 파일 수정자
                $dataTableFile.DataTable().columns(16).visible(false);
            }
        }
    });

});
