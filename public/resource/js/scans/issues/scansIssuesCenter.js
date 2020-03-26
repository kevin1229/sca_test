/**
 * Issue List table & Category list table
 *
 * 이슈 리스트와 이슈 그룹 리스트 출력 / 선택 event 를 다루는 코드가 담겨있다.
 *
 * @author : Byungho
 * @author : kimkc
 */
var savedGroupId = sessionUserController.getUser().personalDisplay.issueGroupId;
var savedGroupItemIds = new Array();
var activeSuggestionYn;
var codePathHeight;
var tabSeq = 0;


var Range = ace.require("ace/range").Range;
var LineWidgets = require("ace/line_widgets").LineWidgets;
var SearchHighlight = require("ace/search_highlight").SearchHighlight;
require("ace/config").setDefaultValue("session", "useWorker", false);
var issueActiveSuggestion = sessionUserController.getUser().personalDisplay.issueActiveSuggestion;
var issueSourceTheme = sessionUserController.getUser().personalDisplay.issueSourceTheme;
var issueSourceFontSize = sessionUserController.getUser().personalDisplay.issueSourceFontSize;
var inputText = false;  // 이슈 상태 변경 판단용
var position = 'Right'; //  링크 표시 방법 판단용

//DATA Table 이슈 검색 조건
var searchOption = {};
var searchGroupOption = {};

var $mainContent = null;
var $dataTableIssues = null;
var $dataTableIssueGroup = null;
var $modalIssueSearch = null;
var $formIssueStatus = null;

var scanId = null;
var selectedIssueId = null;

$(function() {
    var isGroupSelection = false;
    var isCell = true;

    $mainContent = $("#mainContent");

    $mainContent.height(0);
    $mainContent.hide();

    $modalIssueSearch = $("#modalIssueSearch");
    $formIssueStatus = $("#formIssueStatus");

    var $settingDropdown = $('#settingDropdown');

    /***************************************************************************
     * 이슈 Setting 설정
     ***************************************************************************/
    // 링크 표시 방법
    $.ajaxRest({
        url : "/api/1/issues/sourceLinkMethod/items",
        type : "GET",
        success : function(data, textStatus, header) {
            $settingDropdown.find("[name=issueSourceLinkMethod]").select2Controller({data : data});
            $settingDropdown.find("[name=issueSourceLinkMethod]").val(sessionUserController.getUser().personalDisplay.issueSourceLinkMethod).trigger('change');

            // Select 이벤트 처리
            $settingDropdown.find('[name=issueSourceLinkMethod]').on('select2:select', function (e) {
                var value = $settingDropdown.find('select[name=issueSourceLinkMethod]').val();
                if (value === 'split') {
                    position = 'Right';
                } else {
                    position = 'Left';
                }
                sessionUserController.setPersonalIssueSourceLinkMethod(value);
            });

            // 초기 값 세팅
            var value = sessionUserController.getUser().personalDisplay.issueSourceLinkMethod;

            if(value === 'split') {
                position = 'Right';
            } else {
                position = 'Left';
            }
        }
    });

    // Active Suggestion 여부 확인
    if (issueActiveSuggestion) {
        $settingDropdown.find('[name=activeSuggestionYn]').bootstrapToggle('on');
        activeSuggestionYn = 'Y';
    } else {
        $settingDropdown.find('[name=activeSuggestionYn]').bootstrapToggle('off');
        activeSuggestionYn = 'N'
    }
    $settingDropdown.find('input[name=activeSuggestionYn]').change(function () {
        sessionUserController.setPersonalIssueActiveSuggestion($('#settingDropdown').find('input[name=activeSuggestionYn]').is(':checked'));
        if ($('#settingDropdown').find('input[name=activeSuggestionYn]').is(':checked')) {
            activeSuggestionYn = 'Y';
        } else {
            activeSuggestionYn = 'N'
        }
    });

    // 소스 코드 테마
    $.ajaxRest({
        url : "/api/1/issues/sourceTheme/items",
        type : "GET",
        success : function(data, textStatus, header) {
            $settingDropdown.find('[name=issueSourceTheme]').select2Controller({ data: data });
            $settingDropdown.find('[name=issueSourceTheme]').val(issueSourceTheme).trigger('change');
            $settingDropdown.find('[name=issueSourceTheme]').on('select2:select', function (e) {
                var codes = $mainContent.find('[id^=code]');
                $.each(codes, function (index, value) {
                    var themeEditor = ace.edit(value.id);
                    issueSourceTheme = $settingDropdown.find('select[name=issueSourceTheme]').val();
                    themeEditor.setTheme("ace/theme/" + issueSourceTheme);
                });
                sessionUserController.setPersonalIssueSourceTheme(issueSourceTheme);
            });
        }
    });

    // 소스 코드 폰트 크기
    $.ajaxRest({
        url : "/api/1/issues/sourceFontSize/items",
        type : "GET",
        success : function(data, textStatus, header) {
            $settingDropdown.find('[name=issueSourceFontSize]').select2Controller({data: data});
            $settingDropdown.find('[name=issueSourceFontSize]').val(issueSourceFontSize).trigger('change');
            $settingDropdown.find('[name=issueSourceFontSize]').on('select2:select', function (e) {
                var codes = $mainContent.find('[id^=code]');
                $.each(codes, function (index, value) {
                    var fontEditor = ace.edit(value.id);
                    issueSourceFontSize = $settingDropdown.find('[name=issueSourceFontSize]').val();
                    fontEditor.setFontSize(parseInt(issueSourceFontSize));
                });
                sessionUserController.setPersonalIssueSourceFontSize(parseInt(issueSourceFontSize));
            });
        }
    });


    /***************************************************************************
     * 검색 필터
     ***************************************************************************/
    // Scan type & issue type 초기화
    selectedIssueId = url('#issueId', document.URL);
    scanId = $("#scanId").val();

    searchOption.issueIds = new Array();
    searchOption.statusCodes = new Array();

    initIssueList();

    showSearchCondition(searchOption);

    if (selectedIssueId != undefined) {
        searchOption.selectedIssueId = selectedIssueId;
        searchOption.statusCodes.push("NA");
        searchOption.statusCodes.push("OK");
        searchOption.statusCodes.push("EX");
        searchOption.statusCodes.push("ER");
        searchOption.statusCodes.push("ED");
        showSearchCondition(searchOption);
    }

    var rests = issueFilter();
    $.when(rests[0], rests[1], rests[2], rests[3], rests[4], rests[5], rests[6]).then(function() {

        if (searchOption.stateCodes) {
            $modalIssueSearch.find('[name=stateCodes]').val(searchOption.stateCodes).trigger('change');
        }

        if (searchOption.risks) {
            $modalIssueSearch.find('[name=risks]').val(searchOption.risks).trigger('change');
        }

        if (searchOption.scanFileIds) {
            var tree = $modalIssueSearch.find('#searchOptionFileTree').dropdownFancytreeController("getTree");
            $.each(searchOption.scanFileIds, function(index, value) {
                var node = tree.getNodeByKey(value);
                node.setSelected(true);
            });
        }

        if (searchOption.statusCodes) {
            $modalIssueSearch.find('[name=statusCodes]').val(searchOption.statusCodes).trigger('change');
        }

        showSearchCondition(searchOption);
    });

    var displayScanFileUpdater = ($("#displayScanFileUpdater").val() == "true");

    /***************************************************************************
     * 이슈 데이터 테이블 표시
     ***************************************************************************/
    // 이슈 목록
    // #전체순서 : 이슈 ID, 상태,  위험도, 체커, 함수, 라인, 경로(툴팁으로모든관계표시)
    $dataTableIssues = $("#dataTableIssues").dataTableController({
        url: "/api/1/issues",
        //url: "/api/1/scans/" + scanId + "/issues",
        //type: "GET",
        searchOption : searchOption,
        buttonGroupId: "buttonGroupDataTableIssues",
        autoWidth: false,
        stateSave: true,
        order: [ [ 3, 'asc' ] ],
        columnDefs: [ {
            targets: 0,
            orderable : false,
            width : "10px",
            className : 'select-checkbox',
            defaultContent : ""
        }, {
            targets: 1, // 이슈 아이디
            data: "issueId",
            width: "50px",
            className: "dt-head-right"
        }, {
            targets: 2, // 유형
            data: "stateCode",
            width: "50px",
            className: "dt-head-center",
            render: function(data, type, row) {
                return messageController.get("item.issue.state." +  data);
            }
        }, {
            targets: 3, // 위험도
            data: "risk",
            width: "80px",
            className: "dt-head-center",
            render: function (data, type, row) {
                return '<div class="table-inner-link risk' + data +'">' +  messageController.get("item.checker.risk.level." +  data) + '</div>';
            }
        }, {
            targets: 4, // 체커 언어
            sortKey: 'checkerLang',
            className: "dt-head-center",
            width: "80px",
            visible: false,
            data: "data",
            render: function(data, type, row) {
                var checkerLang = "";
                if (row.checker != null) {
                    checkerLang = row.checker.checkerLang;
                }  else {
                    checkerLang = 'etc'
                }
                return '<div class="ellipsis" title="' + checkerLang + '">' + checkerLang + '</div>';
            }
        }, {
            targets: 5, // 레퍼런스
            data: "complianceItemName",
            width: "150px",
            render: function(data, type, row) {
                if(data == null) {
                    return '-';
                }

                var text = null;
                if(row.complianceItemCount > 1) {
                    text = messageController.get("label.item.etc", data, row.complianceItemCount);
                } else {
                    text = data;
                }
                return '<div class="ellipsis" title="' + text + '">' + text + '</div>';
            }
        }, {
            targets: 6, // 체커 명
            data: "checkerKey",
            width: "150px",
            render: function(data, type, row) {
                var checkerName = "";
                if(row.checker != null) {
                    checkerName = row.checker.checkerName;
                }  else {
                    checkerName = row.checkerKey;
                }
                return '<div class="ellipsis" title="' + checkerName + '">' + checkerName + '</div>';
            }
        }, {
            targets: 7, // 파일명
            data: "sinkFileName",
            width: "200px",
            render: function(data, type, row) {
                if(data === null) {
                    data = "";
                }
                return '<div class="ellipsis" title="' + data + '">' + data + '</div>';
            }
        }, {
            targets: 8, // 라인
            data: "sinkLine",
            width: "50px",
            className: "dt-head-right"
        }, {
            targets: 9, // 함수/메소드
            width: "100px",
            data: "sinkFunc",
            render: function(data, type, row) {
                if(data === null) {
                    data = "";
                }
                return '<div class="ellipsis" title="' + data.escapeHTML()  + '">' + data.escapeHTML() + '</div>';
            }
        }, {
            targets: 10, // 경로
            data: "sinkFilePath",
            width: "350px",
            visible: false,
            render: function(data, type, row) {
                return '<div class="ellipsis" title="' + data + '">' + data + '</div>';
            }
        }, {
            targets: 11, // 파일 수정자
            data: "fileUpdateUserName",
            width: "100px",
            visible: false,
            colvis: displayScanFileUpdater,
            render: function (data, type, row) {
                if (data == null)
                    return row.fileUpdateUserId;
                return data.escapeHTML() + "(" + row.fileUpdateUserId + ")";
            }
        }, {
            targets: 12, // AS 존재여부
            data: "activeSuggestionYn",
            width: "40px",
            className: "dt-head-center",
            visible: false,
            render: function(data, type, row) {
                return '<div class="ellipsis" title="' + data + '">' + data + '</div>';
            }
        }, {
            targets: 13, // 이슈 상태
            data: "issueStatus",
            width: "80px",
            className: "dt-head-center",
            render: function(data, type, row) {
                var status;
                if(data == null || data.statusCode == null) {
                    status = messageController.get('item.issue.status.NA');
                } else {
                    status = messageController.get('item.issue.status.' + data.statusCode);
                }

                return '<div class="ellipsis" title="' + status + '">' + status + '</div>';
            }
        }, {
            targets: 14, // 이슈 담당자
            data: "issueStatus",
            width: "60px",
            className: "dt-head-center",
            sortKey: 'issueUserName',
            visible: false,
            render: function(data, type, row) {
                var owner = null;
                if(data == null || data.issueUserId == null) {
                    owner = "-";
                } else if(data.issueUserId != null && data.issueUserName == null){
                    owner = data.issueUserId;
                } else {
                    owner = data.issueUserName.escapeHTML() + "(" + data.issueUserId + ")";
                }

                return '<div class="ellipsis" title="' + owner + '">' + owner + '</div>';
            }
        }, {
            targets: 15, // 이슈 의견
            data: "issueStatus",
            width: "150px",
            className: "dt-head-center",
            sortKey: 'issueComment',
            visible: false,
            render: function(data, type, row) {
                if(data == null || data.issueComment == null) {
                    return "-";
                }
                var text = data.issueComment.escapeHTML()
                return '<div class="ellipsis" title="' + text + '">' + text + '</div>';
            }
        }, {
            targets: 16, // 검출 시각
            data: "insertDateTime",
            width: "150px",
            className: "dt-head-center",
            visible: false,
            orderable: false,
            render: function(data, type, row) {
                var time = '-';
                if (data != null) {
                    time = momentController.timestampFormat(data, 'YYYY-MM-DD HH:mm:ss');
                }
                return '<div class="ellipsis" title="' + time + '">' + time + '</div>';
            }
        }, {
            targets: 17, // 체커 설명
            data: "checkerDesc",
            width: "150px",
            visible: false,
            orderable: false,
            render: function(data, type, row) {
                return '<div class="ellipsis" title="' + data.escapeHTML() + '">' + data.escapeHTML() + '</div>';
            }
        }],
        createdRow: function(row, data, index) {

            var $row = $(row);

            $row.on('click', function(e) {
                //체크 박스 제외
                if(e.target.className.indexOf('select-checkbox') == -1 && e.target.className.indexOf('extend-button') == -1) {
                    selectedIssue(row, data);
                    isCell = false;
                } else {
                    isCell = true;
                }
            });

            if (selectedIssueId === data.issueId.toString()) {
                selectedIssue(row, data);
            }
        },
        drawCallback : function(settings, json) {
            if (displayScanFileUpdater == false) {
                // 파일 수정자
                $dataTableIssues.DataTable().columns(11).visible(false);
            }
        },
        initComplete : function (settings, json) {
            searchOption.selectedIssueId = "";
            if(json.pageNo) {
                $dataTableIssues.DataTable().page(json.pageNo - 1).draw(false);
            }
            initLayout();
        }
    });

    /***************************************************************************
     * 테이블 버튼
     ***************************************************************************/
    // 일괄 수정 (모달 열림)
    $('#buttonGroupDataTableIssues').find("[name=btnModalModifyBatch]").on('click', function(e) {
        var selectedProjectIds = $dataTableIssues.getSelectedIds('issueId');

        if(selectedProjectIds.length == 0) {
            swal(messageController.get('400025'));
        } else {
            modalBatchModifyIssue.openModelIssueBatchModify(selectedProjectIds, searchOption);
        }
    });

    // 이슈 목록 체크 박스 : select 이벤트
    $dataTableIssues.DataTable().on('select', function (e, dt, type, indexes) {
        if($dataTableIssues.getSelectedIds("issueId").length > 0) {
            $formIssueStatus.find("[name=btnSaveIssueStatus]").attr('disabled', 'disabled');   //저장 버튼 비활성화
            $formIssueStatus.find("[name=btnSaveIssueStatusNext]").attr('disabled', 'disabled');  //저장하고 다음 버튼 비활성화
            $('#rightSideBar').css('pointer-events', 'none');
        }
    });

    // 이슈 목록 체크 박스 : deselect 이벤트
    $dataTableIssues.DataTable().on('deselect', function (e, dt, type, indexes) {
        if($dataTableIssues.getSelectedIds("issueId").length == 0) {
            $formIssueStatus.find("[name=btnSaveIssueStatus]").removeAttr('disabled');   //저장 버튼 활성화
            $formIssueStatus.find("[name=btnSaveIssueStatusNext]").removeAttr('disabled');  //저장하고 다음 버튼 활성화
            $('#rightSideBar').css('pointer-events', '');
        }
    });

    // modal export result용
    $("#modalExportResult").modalExportResult({
        page : "issues",
        searchOption : searchOption,
        dataTable : $dataTableIssues,
        fnGetSelectedIds : function(){
            return $dataTableIssues.getSelectedIds("issueId");
        },
    });

    // 이슈 그룹 리스트 초기화 : 기본값 101
    searchGroupOption = searchOption;
    searchGroupOption.scanId = scanId;
    searchGroupOption.groupId = savedGroupId;

    // 체커 타입 || 위험도
    if(savedGroupId == -2 || savedGroupId == -3) {
        $('#searchGroupInput').hide();
    }

    /***************************************************************************
     * 이슈 그룹 데이터 테이블 표시
     ***************************************************************************/
    // Issue Group Filter 설정
    $.ajaxRest({
        url : "/api/1/issues/group/items",
        type : "GET",
        success : function (data, textStatus, jqXHR) {
            var $groupSelect = $("#groupSelect").select2({
                minimumResultsForSearch : Infinity,
                data : data,
                dropdownAutoWidth : true,
                width : '100%',
            });
            $groupSelect.val(savedGroupId).trigger('change');
        }
    });

    // 이슈 그룹 목록
    // #전체순서 : 분류, 항목, 이슈 개수
    $dataTableIssueGroup = $("#dataTableIssueGroup").dataTableController({
        url : "/api/1/issues/group/details",
        searchOption : searchGroupOption,
        dom : 'B<"top">rt<"bottom"><"clear">',
        buttonGroupId: "buttonGroupDataTableIssueGroup",
        autoWidth: false,
        stateSave: false,
        select : {
            style : 'single',
            selector : 'td.select-checkbox'
        },
        columnDefs : [ {
            targets : 0,
            orderable : false,
            className : 'select-checkbox hidden',
            width : "1%",
            defaultContent : ""
        }, {
            targets : 1,
            orderable : true,
            defaultContent : "",
            className : 'group-text',
            width : "60px",
            data : "groupText",
            render : function(data, type, row) {
                if (data == null) {
                    return '-';
                }
                return '<div class="ellipsis" title="' + data + '">' + data + '</div>';
            }
        }, {
            orderable : true,
            targets : 2,
            defaultContent : "",
            width : "140px",
            data : "text",
            render : function(data, type, row) {
                return '<div class="ellipsis" title="' + data + '">' + data + '</div>';
            }
        }, {
            orderable : true,
            targets : 3,
            defaultContent : "",
            className : "dt-head-right",
            width : "20px",
            data : "count"
        }],
        createdRow: function(row, data, index) {
            var $row = $(row);

            // 분류 Table 에서 row 이벤트 핸들러
            $row.on('click', function(e) {

                savedGroupItemIds = [];
                $('#txtSearchShort').val('');

                // 이슈 그룹 중 row 선택 시 이벤트
                if ($row.hasClass('row-selected')) {
                    $row.removeClass('row-selected');
                } else {
                    $row.parent().find('tr.row-selected').removeClass('row-selected');
                    $row.addClass('row-selected');
                }

                if ($row.hasClass('row-selected')) {
                    savedGroupItemIds.push(data.id);
                }

                unselectedIssue();

                searchIssues();
            });

            var categoryId = url('#categoryId', document.URL);
            if(categoryId != undefined && categoryId == data.id) {
                $row.trigger('click');
            }
        },
        order : [ [ 2, 'asc' ] ],
        drawCallback : function(settings, json) {

            if (isGroupSelection) {
                searchIssues();
                isGroupSelection = false;
            }

            savedGroupItemIds = new Array();
            if (savedGroupId == -2 || savedGroupId == -3) {
                $('#dataTableIssueGroup').find('.group-text').css('visibility', 'hidden');
                $('#dataTableIssueGroup').find('.group-text').width(0);
                $('#dataTableIssueGroup').find('.group-text').css('padding', 0);
            } else {
                $('#dataTableIssueGroup').find('.group-text').css('visibility', 'visible');
                $('#dataTableIssueGroup').find('.group-text').css('padding', '6px 10px');
                $('#dataTableIssueGroup').find('.group-text').width(60);
            }
        },
        keys : false
    });

    // 이슈 그룹 ID 변경 시 이벤트
    $('#groupSelect').on("select2:select", function(e) {
        // 테이블 초기화
        savedGroupId = e.params.data.id;

        // 체커타입 || 위험도 일 경우
        if(e.params.data.id == -2 || e.params.data.id == -3) {
            $('#searchGroupInput').val('');
            searchGroupOption.text = '';
            searchGroupOption.groupText = '';
            $('#searchGroupInput').hide();
        } else {
            $('#searchGroupInput').show();
        }

        searchGroupOption.groupId = savedGroupId;
        searchGroupOption.groupItemId = null;
        if(searchGroupOption.groupItemIds != undefined) {
            searchGroupOption.groupItemIds = null;
        }
        savedGroupItemIds = new Array();

        sessionUserController.setPersonalIssueGroupId(savedGroupId);

        searchGroupOption.fileName = '';

        $('#searchGroupInput').removeAttr('disabled');
        isGroupSelection = true;
        $dataTableIssueGroup.draw();
        initLayout();

    });

    $dataTableIssueGroup.DataTable().on('column-visibility.dt', function (e, settings, column, state) {
        if(savedGroupId < 10 && savedGroupId > 1) {
            state = false;
            return false;
        }
    });

    // 이슈 목록 전체 선택 event
    $('#dataTableIssues').find('input[name=datatable_select_all]').click(function (e) {
        // 전체 선택 시 우측 상단에 전체 개수 표시
        $('#dataTableIssues').find('.select-all').click(function () {
            $('#selectedIssueCount').text(messageController.get('info.table.3', $dataTableIssues.DataTable().settings()[0].fnRecordsTotal()));
        });
    });

    // 이슈 분류 검색 이벤트
    $('#searchGroupInput').on('keyup blur', function(e) {
        var $this = $(this);
        var value =  $this.val();

        if (e.type === 'blur' && $this.next().hasClass('close-btn') && value.length == 0) {
            $(this).next().trigger('click');
        }

        // 이벤트가 여러번 호출되는 것을 방지한다.
        if (searchGroupOption.text == undefined) {
            searchGroupOption.text = '';
        }
        if (searchGroupOption.text == value) {
            return;
        }

        // 이슈 그룹 필터 초기화
        searchGroupOption.groupId = savedGroupId;
        searchGroupOption.text = value;
        searchGroupOption.groupText = value;

        searchGroupOption.groupItemIds = [];
        savedGroupItemIds = [];
        isGroupSelection = true;

        $dataTableIssueGroup.draw();
    });

    // 화면 전체 Layout 초기화
    $("#dataTableIssues").on('init.dt', function() {
        initLayout();
    });

    $("#groupDetailTable").on('init.dt', function() {
        initLayout();
    });

    // 이슈 테이블 colvis drop-down 을 drop-up으로 변경
    $('#dataTableIssues_wrapper').find('.buttons-collection').on("click", function() {
        if($('#mainContent').css('display') != 'none') {
            $('.dt-button-collection').css('top', $('.dt-button-collection').position().top - $('.dt-button-collection').height() - $('.buttons-colvis').height() - 15);
        }
        $('.dt-button-collection.dropdown-menu').position().left = $('.dt-button-collection.dropdown-menu').position().left - 110;
        $('.dt-button-collection.dropdown-menu').css('left', $('.dt-button-collection.dropdown-menu').position().left - 110);
        setTimeout(function(){$('.dt-button-collection.dropdown-menu').css('top', 30);}, 100);
    });

    // 단축 키 등록 : 이슈 상세 페이지
    issueHotkey();

    // Dropdown 닫기 방지 : common.js
    stopHideDropDown();

    // 최근 탐색 분석 결과에 추가
    recentQueue.setItem("I", selectedIssueId);
    recentQueue.setItem("S", scanId);

    /**
     * 이슈 상세 페이지 단축키
     */
    function issueHotkey() {
        /***********************************************************************
         * 단축키 등록
         ***********************************************************************/
        var info =  {
            sections : [
                {
                    title : messageController.get('label.issue.list'),
                    shortcuts : [
                        {
                            key : "l",
                            desc : messageController.get('label.go.to.issues')
                        },
                        {
                            key : "e",
                            desc : messageController.get('label.show.all')
                        },
                        {
                            key : "n",
                            desc : messageController.get('label.previous.scan.result')
                        },
                        {
                            key : "b",
                            desc : messageController.get('label.next.scan.result')
                        },
                        {
                            key : "t",
                            desc : messageController.get('label.issue.true.and.next')
                        },
                        {
                            key : "f",
                            desc : messageController.get('label.issue.false.and.next')
                        }
                    ]
                }
            ]
        };
        modelKeyboardShortCutInfo.setInfo(info);

        $.hotkey({
            // 분류 표시
            68: function () {
                $("#toggleCategory").trigger('click');
            },
            // 상태 표시
            82: function () {
                $("#toggleStatus").trigger('click');
            },
            // 목록 펼침
            77: function() {
                $("#toggleList").trigger('click');
            },
            // 소스 펼침
            83: function() {
                $("#toggleCode").trigger('click');
            },
            // 이전 navi node 로 이동
            75 : function () {
                $("#btnPrevNavi").trigger('click');
            },
            // 다음 Navi node 로 이동
            74 : function () {
                $("#btnNextNavi").trigger('click');
            },
            // 다음 이슈 보기
            76 : function() {
                $("#btnNextIssue").trigger('click');
            },
            // 이전 이슈 보기
            72 : function () {
                $("#btnPrevIssue").trigger('click');
            },
            // 정탐 처리 후 다음 이슈로 이동
            84 : function () {
                $("#btnOk").trigger('click');
            },
            // 오탐 처리 후 다음 이슈로 이동
            70 : function () {
                $("#btnExclude").trigger('click');
            }
        });
    }

    // 여기
    var fnChangeEvent = function(e) {

        if($(e.target).hasClass('disabled')) {
            e.stopPropagation();
            e.preventDefault();
            return;
        }
        inputText = true;
        // 체크 박스 선택 여부 확인
        if($dataTableIssues.getSelectedIds('issueId').length > 0) {
            $formIssueStatus.find("[name=btnSaveIssueStatus]").removeAttr("disabled");   //저장 버튼 활성화
        } else if($dataTableIssues.DataTable().rows('.row-selected').data()[0].length == 0){
            e.stopPropagation();
        }
        // 전체 이슈 상태 초기화
        $formIssueStatus.find(':radio[name=statusCode]').removeAttr('checked');
        // 선택 이슈 상태 변경
        $(this).find(':radio[name=statusCode]').attr('checked', 'checked');
    }

    $formIssueStatus.find("#users").on("change", fnChangeEvent);
    $formIssueStatus.find(".statusCode").on("click", fnChangeEvent);

});

/**
 * Issue 를 선택 했을 때 소스코드 및 데이터 HTML 에 저장
 *
 * @param row
 * @param data
 */
function selectedIssue(row, data) {
    var $row = $(row);

    $row.parent().find('tr.row-selected').removeClass('row-selected');
    $row.addClass('row-selected');

    recentQueue.setItem("I", data.issueId);

    searchOption.issueId = data.issueId;

    // 오른쪽 화면 이슈 상태 초기화
    $('#headerIssueStatus').find('[name="selectedIssueStatus"]').text('');
    $('#headerIssueStatus').find('[name="issueStatusDate"]').text('');
    $('#headerIssueStatus').find('.fa-history').addClass('hidden');
    $("#tabListLeft").empty();
    $("#tabContentLeft").empty();
    $("#tabContentRight").empty();

    // 가운데 bar 표시
    $('#sourceCodeHrizontalBar').removeClass('hidden');
    $dataTableIssues.DataTable().rows().deselect();
    scansIssuesRight.clearIssueStatus();
    // 체커 명 출력
    $("#checkerName").text(data.checkerKey);
    $("#checkerIssueId").removeClass('hidden');
    $("#checkerIssueId").text(data.issueId + " ");
    $("#selectedSastIssueId").val(data.issueId);
    selectedIssueId = data.issueId;
    $("#selectedDeterminant").val(data.determinant);
    scansIssuesRight.showCheckerDesc(data.checkerId);
    scansIssuesRight.showDuplicatedIssue(data.issueId);
    document.location.href.split("#")[0] += '#issueId=' + data.issueId;
    var issueUrl;
    if(document.location.href.includes('#')) {
        issueUrl = document.location.href.split("#")[0];
    } else {
        issueUrl = document.location;
    }

    // 이슈 상태 열기
    if(!$('#collapseIssueStatus').hasClass('in')) {
        $('#headerIssueStatus a[data-toggle="collapse"]').trigger('click');
    }

    document.location = issueUrl + '#issueId=' + data.issueId;

    // Tab sequence 초기화
    if (tabSeq >= 1) {
        tabSeq = 0;
    }

    // 리모트 버튼 활성화
    $('.remote-control .box-body').find('.btn-expand').removeAttr('disabled');

    // 오른쪽 탭 창 초기화
    clearRightContent();

    // 이슈에 대한 소스 코드 출력
    scansIssuesSourceCode.showSourceCode(data, false, "left");

    // 오른쪽 메뉴 표시
    scansIssuesRight.showIssueStatus(data.issueId);
    scansIssuesRight.showIssueNavigator(data.issueId);
    scansIssuesRight.showIssueStatusHistory(data);

    // Active Suggestion 여부 검사
    if(activeSuggestionYn === 'Y' || activeSuggestionYn == null) {
        scansIssuesSourceCode.showActiveSuggestion(data);
    }

    // 오른쪽 탭 상태 변경
    $('#checkerPanel').removeClass('hidden');
    $('#naviPanel').removeClass('hidden');

    $('#selectedIssuePanel').addClass('hidden');
    $formIssueStatus.find(".statusCode").removeAttr('disabled');             // 이슈 상태 활성화
    $formIssueStatus.find("[name=btnSaveIssueStatus]").removeAttr("disabled");   //저장 버튼 비활성화
    $formIssueStatus.find("[name=btnSaveIssueStatusNext]").removeAttr("disabled");   //저장하고 다음 버튼 비활성화

    // 이슈 선택 시 선택 row 로 이동
    goTableScrollLine(100);

    $('#toggleList').removeClass('active');

    $('td.select-checkbox:before').css('visibility', 'hidden');
    initLayout();
}

function unselectedIssue() {
    var infoSpan = document.createElement('span');
    var textNode = document.createTextNode(messageController.get("label.checker.name"));

    // 이슈 테이블 colvis drop-down 을 복구
    // $('#dataTableIssues_wrapper').find('.buttons-collection').off('click');

    searchOption.issueIds = new Array();

    // 가운데 bar 숨김
    $('#sourceCodeHrizontalBar').addClass('hidden');

    // 리모트 버튼 비 활성화
    $('.remote-control .box-body').find('.btn-expand').attr("disabled", "disabled");

    // 체커 명 출력
    $("#checkerName").html(infoSpan);
    $("#checkerName").append(textNode);
    $("#checkerDesc").hide();
    $("#selectedSastIssueId").val("");
    $("#checkerIssueId").addClass('hidden');

    // 이슈 정보 초기화
    scansIssuesRight.clearIssueStatus();

    // 이슈 상태 닫기
    if($("#collapseIssueStatus").attr("aria-expanded") == 'true') {
        $('#headerIssueStatus a[data-toggle="collapse"]').trigger('click');
    }

    // Branch 표시 숨기기
    $('#collapseIssueNavigator').find('.checkbox').addClass('hidden');

    // 중복 이슈 숨기기
    $('#duplicatedIssuePanel').addClass('hidden');
    $('#naviPanel').addClass('hidden');

    // 오른쪽 탭 창 초기화
    clearRightContent();

    var hash = document.location.hash.replace('#issueId','');

    if(hash != '') {
        document.location.hash = '';
    }

    $formIssueStatus.find(".statusCode").attr("disabled", "disabled");             // 이슈 상태 비활성화
    $formIssueStatus.find("[name=btnSaveIssueStatus]").attr("disabled", "disabled");   //저장 버튼 비활성화
    $formIssueStatus.find("[name=btnSaveIssueStatusNext]").attr("disabled", "disabled");   //저장하고 다음 버튼 비활성화

    $('#mainContent').height(0);
    $('#mainContent').hide();

    initLayout();
}

/**
 * Clear Right side content view
 */
function clearRightContent() {
    $("#leftBox").removeClass("col-xs-6");
    $("#leftBox").addClass("col-xs-12");
    $("#rightBox").attr("style", "display:none");
    $("#tabListRight").empty();
}

/**
 * 이슈 이동 함수
 */
function movingIssue(index) {
    // Navi Position 초기화
    currentPos = -1;
    var selectedRow = $dataTableIssues.DataTable().rows('.row-selected');
    var nextIndex = selectedRow.indexes()[0] + index;
    // 선택되어  있을 경우만 동작
    if(selectedRow.count() > 0) {
        // 페이지 내에 있을 경우
        if($dataTableIssues.DataTable().rows().count() > nextIndex && nextIndex >= 0) {
            changeSelection($dataTableIssues, nextIndex);
        } else if(nextIndex == -1) {
            // 페이지 넘김
            $dataTableIssues.DataTable().page('previous').draw('page');
            changeSelectionNextPage($dataTableIssues, $dataTableIssues.DataTable().rows().count() - 1);
        } else {
            // 페이지 넘김
            $dataTableIssues.DataTable().page('next').draw(false);
            changeSelectionNextPage($dataTableIssues, 0);
        }
        setTimeout(function(){
            goTableScrollLine(100);
        },10);
    }
}


/******************************************************************************
 * Scroll functions
 ******************************************************************************/
/**
 * Scroll 이동
 * @param target
 * @param scrollLine
 * @param time
 */
function goTableScrollLine(time) {
    if($("#dataTableIssues tr.row-selected").position() != undefined) {

        var xPos = $("#dataTableIssues tr.row-selected").position().top - 20;

        $('#issueBox').stop().scrollTo(xPos, time, {
            axis : 'y'
        });
    }
}

/**
 * 이슈 검색 & refresh table
 */
function searchIssues() {
    initIssueList();
    showSearchCondition();
    $dataTableIssues.draw();
    $.each($('#searchCondition .searchConditionHead'), function (index, value) {
        if(!$(value).css('display').includes('none')) {
            $(value).css('display', 'inline');
        }
    });
}

/**
 * 이슈 목록 검색
 */
function searchIsseuGroup() {
    // 이슈 목록 검색
    searchGroupOption = searchOption;
    searchGroupOption.groupId = savedGroupId;
    searchGroupOption.text = $('#searchGroupInput').val()
    searchGroupOption.groupText = $('#searchGroupInput').val();
    $dataTableIssueGroup.reloadOption(searchGroupOption);
}

// 현재 검색 기준
function showSearchCondition() {
    $("#searchCondition").hide();
    $('#searchCondition .searchConditionHead').hide();
    $('#searchCondition .searchCondition').text('');

    if (searchOption == null) {
        return false;
    }

    var separator = ", ";
    $.each(Object.keys(searchOption), function (index, value) {
        // 체커 그룹명
        if (searchOption[value] != null && searchOption[value]!= "") {
            if ($('#searchCondition [name=' + value + ']').html() != undefined) {
                var text = "";
                var length = $modalIssueSearch.find('[name=' + value + ']').find(':selected').length - 1;
                if ($modalIssueSearch.find('[name=' + value + ']').find(':selected').length > 0) {
                    $.each($modalIssueSearch.find('[name=' + value + ']').find(':selected'), function(index, option) {
                        if(index < length) {
                            text += option.label + separator;
                        } else {
                            text += option.label;
                        }
                    });
                } else if (value === 'stateCodes') {
                    length = searchOption[value].length - 1;
                    $.each(searchOption[value], function(index, option) {
                        if (index < length) {
                            text += messageController.get('item.issue.state.' + option) + separator;
                        } else {
                            text += messageController.get('item.issue.state.' + option);
                        }
                    });
                } else if (value === 'statusCodes') {
                    length = searchOption[value].length - 1;
                    $.each(searchOption[value], function(index, option){
                        if(index < length) {
                            text += messageController.get('item.issue.status.' + option) + separator;
                        } else {
                            text += messageController.get('item.issue.status.' + option);
                        }
                    });
                } else if (value === 'risks') {
                    length = searchOption[value].length - 1;
                    $.each(searchOption[value], function(index, option){
                        if(index < length) {
                            text += messageController.get('item.checker.risk.level.' + option) + separator;
                        } else {
                            text += messageController.get('item.checker.risk.level.' + option);
                        }
                    });
                } else {
                    text += searchOption[value];
                }
                if (text != "") {
                    $('#searchCondition [name=' + value + ']').text("[" + text + "]");
                    $('#searchCondition [name=' + value + ']').parent().show();
                    $('#searchCondition').css('display', 'inline-block');
                }
            }
        }
    });

    if($('#searchOptionReferenceTree').html() != undefined) {
        var text = "";
        length = $('#searchOptionReferenceTree').dropdownFancytreeController('getTree').getSelectedNodes().length - 1;
        $.each($('#searchOptionReferenceTree').dropdownFancytreeController('getTree').getSelectedNodes(), function (index, value) {
            if(index < length) {
                text += value.title + separator;
            } else {
                text += value.title;
            }
        });
        if (text != "") {
            $('#searchCondition [name=complianceItemIds]').text("[" + text + ']');
            $('#searchCondition [name=complianceItemIds]').parent().show();
            $('#searchCondition').css('display', 'inline-block');
        }
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

    // 이슈 내용
    var kindData = [messageController.get('item.issue.advance.kind.all'),
        messageController.get('item.issue.advance.kind.general'),
        messageController.get('item.issue.advance.kind.source'),
        messageController.get('item.issue.advance.kind.sink')
    ]

    // 분류 목록
    var typeList = [messageController.get('item.issue.advance.type.all'),
        messageController.get('item.issue.advance.type.call'),
        messageController.get('item.issue.advance.type.variable'),
        messageController.get('item.issue.advance.type.constant')];

    // 조건 필터
    var conditionData = [messageController.get('item.issue.advance.cond.include'),
        messageController.get('item.issue.advance.cond.not.include')];

    // AIF 검색 내용 출력
    $.each(searchOption.aifList, function (index, value) {
        var aifSearchClone = $('#aifSearchConditionHead').clone();
        aifSearchClone.attr('id', '');
        aifSearchClone.find('[name=infoType]').text('[' + typeList[value.infoType] + ']');
        aifSearchClone.find('[name=infoKind]').text('[' + kindData[value.infoKind] + ']');
        aifSearchClone.find('[name=condition]').text('[' + conditionData[value.condition - 1] + ']');
        aifSearchClone.find('[name=searchSql]').text('[' + value.searchSql + ']');
        aifSearchClone.show();
        $('#searchCondition .search-condition').append(aifSearchClone);
        $('#searchCondition').css('display', 'inline-block');
    });
}

/**
 *  이슈 검색 필터 초기화
 */
function initIssueList() {
    $("#searchCondition").hide(); // TODO 이렇게 해도 되는것인가..

    searchOption.scanId = scanId;
    searchOption.groupId = savedGroupId;
    searchOption.groupItemIds = savedGroupItemIds;

    // 파일명(짧은 검색)
    searchOption.fileName = $("#txtSearchShort").val();

    // 유형
    if ($modalIssueSearch.find('[name=stateCodes]').val() != null) {
        searchOption.stateCodes = $modalIssueSearch.find('[name=stateCodes]').val();
    } else {
        var stateCode = url('#stateCode', document.URL)
        if (stateCode) {
            searchOption.stateCodes = [stateCode];
        } else {
            searchOption.stateCodes = [];
        }
    }

    // 위험도
    searchOption.risks = [];
    if ($modalIssueSearch.find('[name=risks]').val() != null) {
        searchOption.risks = $modalIssueSearch.find('[name=risks]').val();
    } else {
        var risk = url('#riskLevel', document.URL)
        if (risk) {
            searchOption.risks = [risk];
        }
    }

    // 언어
    searchOption.checkerLangCodes = $modalIssueSearch.find('[name=checkerLangCodes]').val();

    // 경로 및 파일
    searchOption.scanFileIds = [];
    if($('#searchOptionFileTree').dropdownFancytreeController('getTree') != null) {
        var selNodes = $('#searchOptionFileTree').dropdownFancytreeController('getTree').getSelectedNodes();
        selNodes.forEach(function(node) {
            if (node.folder == false) {
                searchOption.scanFileIds.push(Number(node.key));
            }
        });
    } else {
        var scanFileId = url('#scanFileId', document.URL)
        if(scanFileId) {
            searchOption.scanFileIds.push(scanFileId);
        }
    }

    // 함수
    searchOption.func = $modalIssueSearch.find('[name=function]').val();

    // 이슈 상태
    searchOption.statusCodes = new Array();
    if($modalIssueSearch.find('[name=statusCodes]').val() != null) {
        searchOption.statusCodes = $modalIssueSearch.find('[name=statusCodes]').val();
    } else {
        var statusCode = url('#statusCode', document.URL)
        if(statusCode) {
            searchOption.statusCodes = [statusCode];
        }
    }

    // TODO 체커??
    searchOption.checkerIds = $("#checker").val();
    searchOption.checkerName = url('#checkerName', document.URL);

    // ActiveSuggestion
    if($modalIssueSearch.find('[name=activeSuggestion]').val() != null
        && $modalIssueSearch.find('[name=activeSuggestion]').val().length == 1) {
        searchOption.activeSuggestionYn = $modalIssueSearch.find('[name=activeSuggestion]').val()[0];
    } else {
        searchOption.activeSuggestionYn = "";
    }

    // 레퍼런스
    searchOption.complianceItemIds = [];

    // 레퍼런스(트리)
    if($('#searchOptionReferenceTree').html() != undefined) {
        searchOption.complianceId = $modalIssueSearch.find('[name=ref]').val();
        var selNodes =  $('#searchOptionReferenceTree').dropdownFancytreeController('getTree').getSelectedNodes();
        selNodes.forEach(function(node) {
            if(!node.key.startsWith('G')) {
                searchOption.complianceItemIds.push(node.key);
            }
        });
    }

    // 이슈 담당자
    searchOption.user = $modalIssueSearch.find('[name=user]').val();

    // 의견
    searchOption.comment = $modalIssueSearch.find('[name=comment]').val();

    // Advanced Issue Filter
    searchOption.aifList = new Array();
    $.each($('#aifParent').children(), function (index, value) {
        if($(value).find('.fa-minus').html() != undefined) {
            var aif = new Object();
            aif.condition = $(value).find('[name=condition]').val() == null ? 1 : $(value).find('[name=condition]').val();
            aif.operator = $(value).find('[name=operator]').val() == null ? 1 : $(value).find('[name=operator]').val();
            aif.searchSql = $(value).find('[name=searchSql]').val();
            aif.infoType = $(value).find('[name=infoType]').val() == null ? 0 : $(value).find('[name=infoType]').val();;
            aif.infoKind = $(value).find('[name=infoKind]').val() == null ? 0 : $(value).find('[name=infoKind]').val();;
            if(aif.searchSql.trim() != '' ) {
                searchOption.aifList.push(aif);
            }
        }
    });

    // 의견
    $formIssueStatus.find("input[name=issueComment]").on("change", function(e) {
        inputText = true;
        $("#btnSaveIssueStatus").removeClass("disabled"); //저장 버튼 활성화
    });
}

/**
 * 이슈 테이블 row 변경 이벤트 처리
 *
 * @param table
 * @param index
 */
function changeSelection(table, index) {

    if(index == -1) {
        index = 0;
    }
    var nextRow = table.DataTable().rows(index);
    var nextRowData = nextRow.data()[0];

    if (nextRowData == null) {
        // 테이블에 표시되는 이슈가 없을 경우
        unselectedIssue();
    } else {
        selectedIssue(nextRow.nodes(), nextRowData);
    }
}

/**
 * 다음 페이지로 넘어가는 이벤트 처리
 *
 * @param table
 * @param index
 */
function changeSelectionNextPage(table, index) {
    table.DataTable().on('draw.dt',  function(settings, json) {
        // 선택 변경
        changeSelection(table, index);
        // 이전 table draw 이벤트 off
        table.DataTable().off('draw.dt');
        // table draw 이벤트 원상 복구
        table.DataTable().on('draw.dt', function(settings, json) {
            // 이슈 아이디 저장된 곳 select 처리
            $.each($('#dataTableIssues tbody tr'),function() {
                if(this.cells[2] != null) {
                    if(this.cells[2].innerHTML == selectedIssueId) {
                        selectedIssue($(this));
                    }
                }
            });
        });
    });
}
