$(function() {

    var scanId = $("#scanId").val();

    /***************************************************************************
     * 전역 변수
     ***************************************************************************/
    SearchOption = function() {
        this.scanId = null;
        this.scanSqlIds = [];
        this.fileName = null;
        this.normSqlStmt = null;
    };
    SearchOption.prototype = {
        clear : function() {
            this.scanSqlIds = [];
            this.fileName = null;
            this.normSqlStmt = null;
        }
    };
    var searchOption = new SearchOption();

    // 대상 scanId
    searchOption.scanId = scanId;

    var $dropdownSearchOptionScans = $('#dropdownSearchOptionScans');
    var $buttonGroupDataTableScans = $("#buttonGroupDataTableScans");
    var $modalViewSqlForm = $("#modalViewSql"); // SQL문 상세보기 modal
    var $modalViewXmlForm = $("#modalViewXml"); // 원문 상세보기 modal

    /******************************************************************
     * 검색
     ******************************************************************/
    // 간단 검색(엔터)
    $dropdownSearchOptionScans.find("[name=txtSearchShort]").on('keydown', function(e) {
        var code = e.keyCode || e.which;
        if (code == 13) { // ENTER
            searchShort();
        }
    });

    // 간단 검색(돋보기)
    $dropdownSearchOptionScans.find("[name=btnSearchShort]").on('click', function(e) {
        searchShort();
    });

    function searchShort() {
        searchOption.clear();
        searchOption.fileName = $dropdownSearchOptionScans.find("[name=txtSearchShort]").val();

        clearSearchOption();
        showSearchCondition();

        $dataTableScanSql.draw();
    }

    // 상세 검색:검색 버튼
    $dropdownSearchOptionScans.find('[name=btnSearch]').on('click', function(e) {
        // 검색 조건 클리어
        searchOption.clear();
        searchOption.fileName = $dropdownSearchOptionScans.find('[name=fileName]').val();
        searchOption.normSqlStmt = $dropdownSearchOptionScans.find('[name=normSqlStmt]').val();

        showSearchCondition();
        $dataTableScanSql.draw();

        $dropdownSearchOptionScans.find('[name=txtSearchShort]').val("");
        $dropdownSearchOptionScans.removeClass('open');
    });

    // 상세 검색:초기화
    $dropdownSearchOptionScans.find("[name=btnClear]").on('click', function(e) {
        clearSearchOption();
    });

    function clearSearchOption() {
        $dropdownSearchOptionScans.find('[name=fileName]').val(null);
        $dropdownSearchOptionScans.find('[name=normSqlStmt]').val(null);
    }

    // 현재 검색 기준
    function showSearchCondition() {
        $('#searchCondition').hide();
        $('#searchCondition .searchConditionHead').hide();
        $('#searchCondition .searchCondition').text('');

        if(searchOption == null) {
            return false;
        }

        // 파일명
        if(searchOption.fileName != null && searchOption.fileName != "") {
            $('#searchCondition [name=fileName]').text(searchOption.fileName);
            $('#searchCondition [name=fileName]').parent().show();
            $('#searchCondition').css('display', 'inline-block');
        }

        // 단축 SQL
        if(searchOption.normSqlStmt != null && searchOption.normSqlStmt != "") {
            $('#searchCondition [name=normSqlStmt]').text(searchOption.normSqlStmt);
            $('#searchCondition [name=normSqlStmt]').parent().show();
            $('#searchCondition').css('display', 'inline-block');
        }
    }
    // Dropdown 닫기 방지 : common.js
    stopHideDropDown($dropdownSearchOptionScans);

    /***************************************************************************
     * 테이블 버튼
     ***************************************************************************/
    // excel 내보내기
    $buttonGroupDataTableScans.find('[name=btnExportExcel]').on('click', function(e) {
        var requestBody = {};
        requestBody.searchOption = {};
        var selectedIds = $dataTableScanSql.getSelectedIds('scanSqlId');
        if ($dataTableScanSql.isAllSelected()) {
            requestBody.searchOption = searchOption;
        } else if (selectedIds.length > 0) {
            requestBody.searchOption.scanId = scanId;
            requestBody.searchOption.scanSqlIds = selectedIds;
        } else {
            // 전체 선택이 아니면서, 선택된 ID가 없는 경우는
            // 선택 안함으로 판단함.
            // (데이터가 없을 경우는 버튼 자체가 비활성화됨.)
            requestBody.searchOption = searchOption;
        }

        $.ajaxRest({
            url : "/api/1/scans/sql/export/excel",
            type : "POST",
            data : requestBody,
            error : function(hdr, status) {
                errorMsgHandler.swal(hdr.responseText);
            }
        });
    });

    /***************************************************************************
     * 데이터 테이블 표시
     ***************************************************************************/
    var $dataTableScanSql = $("#dataTableScanSql").dataTableController({
        url : "/api/1/scans/sql",
        searchOption : searchOption,
        buttonGroupId: "buttonGroupDataTableScans",
        order : [ [ 1, 'desc' ] ],
        columnDefs : [ {
            targets : 0,
            orderable : false,
            className : 'select-checkbox',
            defaultContent : ""
        }, {
            targets : 1, // ID
            data : "scanSqlId",
            className : "dt-head-right"
        }, {
            targets : 2,  // 경로명
            data : "filePath",
            className : 'filePath'
        }, {
            targets : 3, // 파일명
            data : "fileName",
            className : "fileName"
        }, {
            targets : 4, // 단축SQL
            data : "normSqlStmt",
            className : "normSqlStmt",
            render : function(data, type, row) {
                return '<div title="' + data + '" data-toggle="tooltip" data-container="body" class="ellipsis" style="width: 400px">' + data + '</div>';
            }
        }],
        createdRow : function (row, data, index) {

            var $row = $(row);

            // 상세 SQL 팝업
            $row.find(".fileName, .normSqlStmt").on('click', function(e) {
                // 체크 박스 제외
                if(e.target.className.indexOf('select-checkbox') == -1 && e.target.className.indexOf('extend-button') == -1) {
                    // $(window).attr('location','/scans/' + data.scanSqlId + '/info');

                    $.ajaxRest({
                        url: "/api/1/scans/sql/" + data.scanSqlId,
                        type: "GET",
                        success : function (data, status, header) {

                            $("#modalViewSql").modal("show");
                            setModalViewSqlForm(data);
                        },
                        error : function(hdr, status) {
                            errorMsgHandler.swal(data);
                        }
                    });

                }
            });

            // 원본 XML 팝업
            $row.find(".filePath").on('click', function(e) {
                // 체크 박스 제외
                if(e.target.className.indexOf('select-checkbox') == -1 && e.target.className.indexOf('extend-button') == -1) {

                    var requestXmlData = {
                        "sinkStoredPath" : data.storedPath,
                        "sinkFileEncoding" : data.fileEncoding
                    };

                    $.ajaxRest({
                        url: "/api/1/scans/sql/xml",
                        data : requestXmlData,
                        type: "POST",
                        success : function (data, status, header) {

                            $("#modalViewXml").modal("show");
                            setModalViewXmlForm(data);
                        },
                        error : function(hdr, status) {
                            errorMsgHandler.swal(data);
                        }
                    });
                }
            });
        }
    });

    /***************************************************************************
     * 모달
     ***************************************************************************/
    // dml 보기
    $("#OrigSQL").on('click', function() {
        viewDmlArea('OrigSQL');
        $("#OrigSQL").addClass('active');
        $("#NormSQL").removeClass('active');
    });
    $("#NormSQL").on('click', function() {
        viewDmlArea('NormSQL');
        $("#NormSQL").addClass('active');
        $("#OrigSQL").removeClass('active');
    });

    // SQL문 상세보기 setting
    function setModalViewSqlForm(data) {
        setModalViewSqlFormClear();
        $modalViewSqlForm.find("[data-name=scanId]").text(data.scanId);
        $modalViewSqlForm.find("[data-name=filePath]").text(data.filePath);
        $modalViewSqlForm.find("[data-name=fileName]").text(data.fileName);
        $modalViewSqlForm.find("[data-name=projectKey]").text(data.projectKey);
        $modalViewSqlForm.find("[data-name=sqlHash]").text(data.sqlHash);
        $modalViewSqlForm.find("[data-name=normSqlStmt]").text(data.normSqlStmt);

        $modalViewSqlForm.find(".aceArea").append('<pre id="dmlOrig' + data.scanSqlId + '"></pre><pre id="dmlNorm' + data.scanSqlId + '"></pre>');
        $modalViewSqlForm.find("#dmlOrig" + data.scanSqlId).text(data.origSqlStmt);
        $modalViewSqlForm.find("#dmlNorm" + data.scanSqlId).text(data.normSqlStmt);
        $modalViewSqlForm.find("#dmlOrig" + data.scanSqlId).show();
        $modalViewSqlForm.find("#dmlNorm" + data.scanSqlId).hide();

        // OrigSQL
        var oEditor = ace.edit("dmlOrig" + data.scanSqlId);
        oEditor.setTheme("ace/theme/xcode");
        oEditor.setReadOnly(true);
        oEditor.getSession().setMode("ace/mode/sql");
        oEditor.setAutoScrollEditorIntoView(true);
        oEditor.setShowPrintMargin(false);
        oEditor.setOption("maxLines", 15);
        oEditor.setOption("minLines", 10);
        oEditor.setFontSize(13);
        // $modalViewSqlForm.find("[id^=dmlOrig]").css('font-size', '13px');

        // NormSQL
        var nEditor = ace.edit("dmlNorm" + data.scanSqlId);
        nEditor.setTheme("ace/theme/xcode");
        nEditor.setReadOnly(true);
        nEditor.getSession().setMode("ace/mode/sql");
        nEditor.setWrapBehavioursEnabled(true);
        nEditor.setShowPrintMargin(false);
        nEditor.setOption("maxLines", 15);
        nEditor.setOption("minLines", 5);
        $modalViewSqlForm.find("[id^=dmlNorm]").css('font-size', '13px');

    }

    // SQL문 상세보기 초기화
    function setModalViewSqlFormClear() {
        $modalViewSqlForm.find("[name=scanSqlId]").val('');
        $modalViewSqlForm.find("[name=filePath]").val('');
        $modalViewSqlForm.find("[name=fileName]").val('');
        $modalViewSqlForm.find("[name=projectKey]").val('');
        $modalViewSqlForm.find("[name=sqlHash]").val('');
        $modalViewSqlForm.find("[name=normSqlStmt]").val('');
        $modalViewSqlForm.find(".aceArea").html('');
    }

    // 폼 초기화
    function setModalViewDdlFormClear() {
        $('.form-horizontal').each(function () {
            this.reset();
        });
    }

    // dml 버튼
    function viewDmlArea(elt) {
        if ("OrigSQL" == elt) {
            $modalViewSqlForm.find("[id^=dmlOrig]").show();
            $modalViewSqlForm.find("[id^=dmlNorm]").hide();
        }else{
            $modalViewSqlForm.find("[id^=dmlOrig]").hide();
            $modalViewSqlForm.find("[id^=dmlNorm]").show();
        }
    }

    //XML문 상세보기 setting
    function setModalViewXmlForm(data) {
        setModalViewXmlFormClear();
        $modalViewXmlForm.find(".aceArea").append('<pre id="xmlOrig"></pre>');
        $modalViewXmlForm.find("#xmlOrig").text(data[0].text);  //data[0].id = "xml"

        //OrigSQL
        var oEditor = ace.edit("xmlOrig");
        oEditor.setTheme("ace/theme/xcode");
        oEditor.setReadOnly(true);
        oEditor.getSession().setMode("ace/mode/sql");
        oEditor.setAutoScrollEditorIntoView(true);
        oEditor.setShowPrintMargin(false);
        oEditor.setOption("maxLines", 25);
        oEditor.setOption("minLines", 5);
        oEditor.setFontSize(13);
    }

    //SQL문 상세보기 초기화
    function setModalViewXmlFormClear() {
        $modalViewXmlForm.find(".aceArea").html('');
    }

    /**
     * 현재 검색 결과 초기화 이벤트
     */
    $('#searchOptionClear').click(function () {
        clearSearchOption();
        $('button[name=btnSearch]').trigger('click');
    });
});
