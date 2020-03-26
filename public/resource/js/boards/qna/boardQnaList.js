$(function() {

    $("#liMenuQna").addClass("active");

    /***************************************************************************
     * 변수
     **************************************************************************/
    SearchOption = function() {
        this.statusCodes = [];
        this.subjectContent = null;
        this.userIds = [];
    };
    SearchOption.prototype = {
        clear : function() {
            this.statusCodes = [];
            this.subjectContent = null;
            this.userIds = [];
        }
    };
    var searchOption = new SearchOption();

    var currentTime = new Date().getTime();

    var $dropdownSearchOptionBoard = $("#dropdownSearchOptionBoard");
    var $buttonGroupDataTableQna = $("#buttonGroupDataTableQna")


    /***************************************************************************
     * 컴포넌트
     **************************************************************************/
    // 구분
    $.ajaxRest({
        url : "/api/1/boards/qna/status/items",
        type : "GET",
        success : function(data, textStatus, header) {
            $dropdownSearchOptionBoard.find("[name=statusCodes]").select2Controller({multiple:true, data : data});
        }
    });

    // 작성자
    $dropdownSearchOptionBoard.find("[name=userIds]").select2Controller({ multiple:true, url:"/api/1/users/items"});

    /***************************************************************************
     * 검색
     **************************************************************************/
    // 제목 또는 내용 검색 입력
    $dropdownSearchOptionBoard.find('[name=txtSearchShort]').on('keydown', function(e){
        var code = e.keyCode || e.which;
        if (code == 13) { // ENTER
            searchShort();
        }
    });

    // 제목 또는 내용 검색
    $dropdownSearchOptionBoard.find('[name=btnSearchShort]').on("click", function() {
        searchShort();
    });

    function searchShort() {
        searchOption.clear();
        searchOption.subjectContent = $dropdownSearchOptionBoard.find('[name=txtSearchShort]').val();

        clearSearchOption();
        showSearchCondition();

        $dataTableQna.draw();
    }

    // 상세 검색:검색
    $dropdownSearchOptionBoard.find('[name=btnSearch]').on("click", function() {

        searchOption.clear();
        searchOption.statusCodes = $dropdownSearchOptionBoard.find("[name=statusCodes]").val();
        searchOption.subjectContent = $dropdownSearchOptionBoard.find("[name=subjectContent]").val();
        searchOption.userIds = $dropdownSearchOptionBoard.find("[name=userIds]").val();

        $dataTableQna.draw();

        showSearchCondition();

        $dropdownSearchOptionBoard.find('[name=txtSearchShort]').val("");
        $dropdownSearchOptionBoard.removeClass('open');
    });

    // 상세 검색:초기화
    $dropdownSearchOptionBoard.find('[name=btnClear]').on("click", function() {
        clearSearchOption();
    });

    // 검색 필터 재설정
    function clearSearchOption() {
        $dropdownSearchOptionBoard.find('[name=txtSearchShort]').val("");
        $dropdownSearchOptionBoard.find("[name=statusCodes]").val("").trigger('change');
        $dropdownSearchOptionBoard.find("[name=subjectContent]").val("");
        $dropdownSearchOptionBoard.find("[name=userIds]").val("").trigger('change');
    }

    // 현재 검색 기준 표시
    function showSearchCondition() {
        $("#searchCondition").hide();
        $("#searchCondition .searchConditionHead").hide();
        $("#searchCondition .searchCondition").text("");

        // 구분
        if(searchOption.statusCodes != null && searchOption.statusCodes.length > 0){
            var texts = getSelectTexts($dropdownSearchOptionBoard.find("[name=statusCodes]"), searchOption.statusCodes);
            $("#searchCondition [name=statusCodes]").text(texts.join(", "));
            $("#searchCondition [name=statusCodes]").parent().show();
            $('#searchCondition').css('display', 'inline-block');
        }

        // 제목 + 내용
        if(searchOption.subjectContent != null && searchOption.subjectContent.trim().length > 0) {
            $('#searchCondition [name=subjectContent]').text(searchOption.subjectContent);
            $('#searchCondition [name=subjectContent]').parent().show();
            $('#searchCondition').css('display', 'inline-block');
        }

        // 작성자
        if(searchOption.userIds != null && searchOption.userIds.length > 0){
            var texts = getSelectTexts($dropdownSearchOptionBoard.find("[name=userIds]"), searchOption.userIds);
            $("#searchCondition [name=userIds]").text(texts.join(", "));
            $("#searchCondition [name=userIds]").parent().show();
            $('#searchCondition').css('display', 'inline-block');
        }
    }

    // Dropdown 닫기 방지 : common.js
    stopHideDropDown($dropdownSearchOptionBoard);

    /***************************************************************************
     * 추가
     **************************************************************************/
    $("#btnAddBoard").on("click", function(e) {
        location.href = "/boards/qna/new";
    });

    /***************************************************************************
     * 일괄 삭제
     **************************************************************************/
    $buttonGroupDataTableQna.find("[name=btnDelete]").on("click", function(e) {
        var selectedIds = $dataTableQna.getSelectedIds('qnaId');
        if (selectedIds.length == 0) {
            swal(messageController.get("400025"));
            return;
        }

        var requestBody = {};
        if($dataTableQna.isAllSelected()) {
            requestBody.searchOption = searchOption;
        } else {
            requestBody.ids = selectedIds;
        }

        swalDelete({
            url: "/api/1/boards/qna",
            dataTable: $dataTableQna,
            requestBody: requestBody
        });
    });

    /***************************************************************************
     * 테이블 표시
     **************************************************************************/
    var $dataTableQna = $("#dataTableQna").dataTableController({
        url : "/api/1/boards/qna",
        searchOption : searchOption,
        buttonGroupId: "buttonGroupDataTableQna",
        order : [ [ 1, 'desc' ] ],
        columnDefs : [{
            targets:   0,
            orderable: false,
            width : "1%",
            className: "select-checkbox",
            defaultContent: "",
        }, {
            targets: 1,
            data : "qnaId",
            width : "2%",
            className : "dt-head-right",
        }, {
            targets: 2,
            data : "statusCode",
            width : "5%",
            className : "dt-head-center",
            render : function(data, type, row, meta) {
                if (data == null)
                    return "";
                var className = null;
                if (data == "C") {
                    className = "label-board-qna-status-complete";
                } else if (data == "R") {
                    className = "label-board-qna-status-request";
                } else if (data == "E") {
                    className = "label-board-qna-status-etc";
                }
                return "<div class='label-board " + className + "'>" + messageController.get("item.board.qna.status." + data) + "</div>";
            }
        }, {
            targets: 3,
            data : "privateYn",
            width : "5%",
            className : "dt-head-center",
            render : function(data, type, row, meta) {
                if (data != "Y") {
                    return "-";
                }
                return "<div class='label-board label-board-qna-private'>" + messageController.get("label.private") + "</div>";
            }
        }, {
            targets: 4,
            width : "80%",
            data : "subject",
            render : function(data, type, row, meta) {
                var subject = data;
                var title = null;
                if (subject.length > 50) {
                    subject = subject.substring(0, 100) + " ..";
                    title = subject.escapeHTML();;
                }

                subject = subject.escapeHTML();
                if (row.attachCount > 0) { // 첨부파일이 1개 이상이면 아이콘 표시
                    subject += ' <i class="fa fa-paperclip subject-icon"></i>';
                }
                if ((currentTime - row.insertDateTime) < (60 * 60 * 24 * 1000)) { // 글 작성 시간이 1일 이내라면 new
                    subject += " <i class='material-icons subject-icon'>fiber_new</i>";
                }
                if (title != null) {
                    return "<span class='subject-span' title='" + title + "'>" + subject + "</span>";
                }
                return subject;
            }
        }, {
            targets: 5,
            data : "userId",
            width : "15%",
            render : function(data, type, row, meta) {
                var userName = row.userName;
                if (userName == null)
                    return data;
                return userName.escapeHTML() + "(" + data + ")";
            }
        }, {
            targets: 6,
            data : "insertDateTime",
            width : "10%",
            bVisible: false,
            className : "dt-head-center",
            render : function(data, type, row, meta) {
                return momentController.timestampFormat(data, 'YYYY-MM-DD HH:mm');
            }
        }, {
            targets: 7,
            data : "updateDateTime",
            responsivePriority : 2,
            width : "10%",
            className : "dt-head-center",
            render : function(data, type, row, meta) {
                return momentController.timestampFormat(data, 'YYYY-MM-DD HH:mm');
            }
        }, {
            targets: 8,
            data : "viewCount",
            width : "3%",
            className : "dt-head-right",
            render : function(data, type, row, meta) {
                if (data == null)
                    return 0;
                return data;
            }
        }, {
            targets: 9,
            data : "replyCount",
            width : "3%",
            className : "dt-head-right",
            render : function(data, type, row, meta) {
                if (data == null)
                    return 0;
                return data;
            }
        }],
        createdRow : function(row, data, index) {
            $(row).on("click", function(e) {
                var $targetObj = $(e.target);
                if ($targetObj.hasClass("board-status")
                        || $targetObj.hasClass("subject-icon")
                        || $targetObj.hasClass("subject-span")
                        || ($targetObj.parent().attr("role") == "row"
                            && !$targetObj.parent().hasClass("extend-button")
                            && !$targetObj.hasClass("select-checkbox")
                            && !$targetObj.hasClass("extend-button"))) {
                    location.href = "/boards/qna/" + data.qnaId;
                }
            });
        }
    });

    /**
     * 현재 검색 결과 초기화 이벤트
     */
    $('#searchOptionClear').click(function () {
        clearSearchOption();
        $('button[name=btnSearch]').trigger('click');
    });
});