$(function() {

    var scanId = $("#scanId").val();

    /***************************************************************************
     * 전역 변수
     ***************************************************************************/
    SearchOption = function() {
        this.scanId = null;
        this.scanDdlTblIds = [];
        this.fileName = null;
        this.tblName = null;
        this.normSqlStmt = null;
        this.scanDdlTblId = null;
    };
    SearchOption.prototype = {
        clear : function() {
            this.scanDdlTblIds = [];
            this.fileName = null;
            this.tblName = null;
            this.normSqlStmt = null;
            this.scanDdlTblId = null;
        }
    };
    var searchOption = new SearchOption();
    searchOption.scanId = scanId;

    var $dropdownSearchOptionScans = $('#dropdownSearchOptionScans');
    var $buttonGroupDataTableScans = $("#buttonGroupDataTableScans");
    var $modalViewDdlForm = $("#modalViewDdl"); //DDL 상세보기 modal
    var $modalViewXmlForm = $("#modalViewXml"); //원문 상세보기 modal

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

        $dataTableScanDll.draw();
    }

    // 상세 검색:검색 버튼
    $dropdownSearchOptionScans.find('[name=btnSearch]').on('click', function(e) {
        // 검색 조건 클리어
        searchOption.clear();
        searchOption.fileName = $dropdownSearchOptionScans.find('[name=fileName]').val();
        searchOption.tblName = $dropdownSearchOptionScans.find('[name=tblName]').val();

        showSearchCondition();
        $dataTableScanDll.draw();

        $dropdownSearchOptionScans.find('[name=txtSearchShort]').val("");
        $dropdownSearchOptionScans.removeClass('open');
    });

    // 상세 검색:초기화
    $dropdownSearchOptionScans.find("[name=btnClear]").on('click', function(e) {
        clearSearchOption();
    });

    function clearSearchOption() {
        $dropdownSearchOptionScans.find('[name=fileName]').val("");
        $dropdownSearchOptionScans.find('[name=tblName]').val("");
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
        if(searchOption.tblName != null && searchOption.tblName != "") {
            $('#searchCondition [name=tblName]').text(searchOption.tblName);
            $('#searchCondition [name=tblName]').parent().show();
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
        var selectedIds = $dataTableScanDll.getSelectedIds('scanDdlTblId');
        if ($dataTableScanDll.isAllSelected()) {
            requestBody.searchOption = searchOption;
        } else if (selectedIds.length > 0) {
            requestBody.searchOption.scanId = scanId;
            requestBody.searchOption.scanDdlTblIds = selectedIds;
        } else {
            // 전체 선택이 아니면서, 선택된 ID가 없는 경우는
            // 선택 안함으로 판단함.
            // (데이터가 없을 경우는 버튼 자체가 비활성화됨.)
            requestBody.searchOption = searchOption;
        }

        $.ajaxRest({
            url : "/api/1/scans/ddl/export/excel",
            type : "POST",
            data : requestBody,
            error : function(hdr, status) {
                errorMsgHandler.swal(hdr.responseText);
            }
        });
    });

    /***************************************************************************
     * 데이터 테이블
     ***************************************************************************/
    var $dataTableScanDll = $("#dataTableScanDll").dataTableController({
        url : "/api/1/scans/ddl",
        searchOption : searchOption,
        buttonGroupId: "buttonGroupDataTableScans",
        order : [ [ 1, 'asc' ] ],
        columnDefs : [ {
            targets : 0,
            orderable : false,
            className : 'select-checkbox',
            defaultContent : ""
        }, {
            targets : 1, // ID
            data : "scanDdlTblId",
            className : "dt-head-right"
        }, {
            targets : 2,
            data : "tblName", // 테이블명
            className : "tblName"
        }, {
            targets : 3, // 컬럼개수
            data : "colCnt",
            className : "dt-head-right"
        }, {
            targets : 4, // 경로명
            data : "filePath",
            className : 'filePath'
        }, {
            targets : 5, // 파일명
            data : "fileName",
            className : "fileName"
        }],
        createdRow : function (row, data, index) {

            // 상세 SQL 팝업
            $(row).find(".tblName, .fileName").on('click', function(e) {
                // 체크 박스 제외
                if(e.target.className.indexOf('select-checkbox') == -1 && e.target.className.indexOf('extend-button') == -1) {
                    // $(window).attr('location','/scans/' + data.scanSqlId + '/info');

                    $.ajaxRest({
                        url: "/api/1/scans/ddl/" + data.scanDdlTblId,
                        type: "GET",
                        success : function (data, status, header) {

                            $("#modalViewDdl").modal("show");
                            setModalViewDdlForm(data);

                        },
                        error : function(hdr, status) {
                            errorMsgHandler.swal(data);
                        }
                    });
                }
            });

            // 원본 XML 팝업
            $(row).find(".filePath").on('click', function(e) {
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
    // 테이블 상세보기 setting
    function setModalViewDdlForm(data) {
        $modalViewDdlForm.find(".aceArea").html('');
        $modalViewDdlForm.find(".aceArea").append('<pre id="editor"></pre>');
        $modalViewDdlForm.find("[data-name=tblName]").text(data.tblName);
        $modalViewDdlForm.find("[data-name=colCnt]").text(data.colCnt);
        $modalViewDdlForm.find("#editor").text(data.creStmt);

        //editor
        var editor = ace.edit("editor");
        editor.setTheme("ace/theme/xcode");
        editor.setReadOnly(true);
        editor.getSession().setMode("ace/mode/sql");
        editor.setAutoScrollEditorIntoView(true);
        editor.setShowPrintMargin(false);
        editor.setOption("maxLines", 10);
        $('#editor').css('font-size', '13px');

        setModalViewTblForm(data);
    }

    // 테이블 컬럼 리스트 뷰
    function setModalViewTblForm(data) {
        searchOption.scanDdlTblId = data.scanDdlTblId;

        var $dbTableGroupScans = $("#dbTableGroupScans").dataTableController({
            url : "/api/1/scans/ddl/tbl",
            searchOption : searchOption,
            buttonGroupId: "buttonGroupdbDataTableScans",
            // dom : '',    //컬럼 on/off 스위치
            scrollY : "300px",
            scrollCollapse: true,
            paging : false,
            sScrollX: "100%",
            sScrollXInner : "100%",
            searching : false,
            ordering : false,
            info : false,
            columnDefs : [ {
                targets : 0, // 컬럼명
                data : "colName",
                width: "200px",
                responsivePriority : 0,
                render : function(data, type, row) {
                    return data;
                }
            }, {
                targets : 1, // 타입
                data : "colType",
                width: "100px",
                responsivePriority : 0,
                render : function(data, type, row) {
                    return data;
                }
            }, {
                targets : 2, // 컬럼 길이
                data : "colLength",
                className : "dt-head-center",
                width: "100px",
                responsivePriority : 0,
                render : function(data, type, row) {
                    if (data == null) {
                        return '-';
                    }
                    return data;
                }
            }, {
                targets : 3, // 주석
                data : "colComment",
                responsivePriority : 0,
                render : function(data, type, row) {
                    if (data == null) {
                        return '-';
                    }
                    return '<div title="' + data + '" data-toggle="tooltip" data-container="body">' + data + '</div>';
                }
            }],
            fnInitComplete: function() {
                this.css("visibility", "visible");
                $('.dataTables_scrollHead').css('width', '100%'); //changing the width
                $('.dataTables_scrollHeadInner').css('width', '100%'); //changing the width
                $('.table').css('width', '100%'); //changing the width

            },
            fnDrawCallback: function () {
                $('.dataTables_scrollHead').css('width', '100%');//changing the width
                $('.dataTables_scrollHeadInner').css('width', '100%'); //changing the width
                $('.table').css('width', '100%'); //changing the width
                $('#dbTableGroupScans_wrapper').find('.dt-buttons').css('display', 'none');     //dom:'' option 을 쓰면 스크롤페이징 사용못함
            }
        });
        $dbTableGroupScans.draw();
    }

    // 폼 초기화
    function setModalViewDdlFormClear() {
        $('.form-horizontal').each(function () {
            this.reset();
        });
    }

    // XML문 상세보기 setting
    function setModalViewXmlForm(data) {
        setModalViewXmlFormClear();
        $modalViewXmlForm.find(".aceArea").append('<pre id="xmlOrig"></pre>');
        $modalViewXmlForm.find("#xmlOrig").text(data[0].text);  //data[0].id = "xml"

        // OrigSQL
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

    // SQL문 상세보기 초기화
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
