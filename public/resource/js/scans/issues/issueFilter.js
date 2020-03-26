
function issueFilter() {

    /******************************************************************
     * 컴포넌트
     ******************************************************************/
    var rests = [];

    // 유형
    rests[0] = $.ajaxRest({
        url: "/api/1/issues/state/items",
        type: "GET",
        success: function (data, textStatus, header) {
            $modalIssueSearch.find('[name=stateCodes]').select2Controller({multiple:true, data: data});
        }
    });

    // 위험도
    rests[1] = $.ajaxRest({
        url: "/api/1/checkers/risk/items",
        type: "GET",
        success: function (data, textStatus, header) {
            $modalIssueSearch.find('[name=risks]').select2Controller({multiple:true, data: data});
        }
    });

    // 언어
    rests[2] = $.ajaxRest({
        url: "/api/1/checkers/lang/items",
        type: "GET",
        success: function (data, textStatus, header) {
            $modalIssueSearch.find('[name=checkerLangCodes]').select2Controller({multiple:true, data: data });
        }
    });

    // 레퍼런스
    rests[3] = $.ajaxRest({
        url: "/api/1/compliance/items",
        type: "GET",
        success: function (data, textStatus, header) {
            $modalIssueSearch.find('[name=ref]').select2Controller({
                multiple: false,
                width: "100%",
                allowClear: true,
                data: data
            });
            clearFilter();

            $modalIssueSearch.find('[name=ref]').on('select2:select', function (e) {
                // 레퍼런스 tree 만들기
                $.ajaxRest({
                    url: "/api/1/compliance/" + $modalIssueSearch.find('[name=ref]').val() + "/tree",
                    type: "GET",
                    success: function (data, textStatus, header) {

                        $("#searchOptionReferenceTree").remove();

                        var treeData = convertFromRefTreeToFancyTreeData(data);
                        var clone = $('#searchOptionReferenceTemp').clone();
                        clone.removeClass('hidden');
                        clone.attr('id', "searchOptionReferenceTree");

                        clone.dropdownFancytreeController({
                            data: treeData
                        });

                        $('#refForm').append(clone);

                        $('#searchOptionReferenceTree').find('.select-tree').click(function () {
                            $('#searchOptionFileTree').removeClass('open');
                        });
                    }
                });
            });

            $modalIssueSearch.find('[name=ref]').on('select2:unselect', function (e) {
                $('#searchOptionReferenceTree').empty();
            });
        }
    });


    // 경로 및 파일
    rests[4] = $.ajaxRest({
        url: "/api/1/scans/" + $("#scanId").val() + "/files/fancytree",
        type: "GET",
        success : function (data, status, header) {
            $modalIssueSearch.find('#searchOptionFileTree').dropdownFancytreeController({
                data: data,
                fancytree: {
                    selectMode : 3
                }
            });
        }
    });

    // 이슈 상태
    rests[5] = $.ajaxRest({
        url: "/api/1/issues/issueStatus/items",
        type: "GET",
        success: function (data, textStatus, header) {
            $modalIssueSearch.find('[name=statusCodes]').select2Controller({ multiple: true, data: data });
        }
    });

    // Active Suggestion 필터
    rests[6] = $modalIssueSearch.find('[name=activeSuggestion]').select2Controller({
        width: "100%",
        data: [
            {id: 'Y', text: 'Y'},
            {id: 'N', text: 'N'}
        ],
        multiple: true,
        minimumResultsForSearch: -1
    });

    // Aif 필터 시작
    // Aif 복사
    function createAif() {

        var aifClone = $('#aifTemp').clone();
        aifClone.attr('id', '');
        aifClone.removeClass('hidden');
        aifClone.find('[name=addAifTemp]').attr('name', 'addAif');

        // 검색 연산자 필터
        aifClone.find('[name=operator]').select2Controller({
            multiple: false,
            width: "70px",
            minimumResultsForSearch: -1,
            data: [
                { id: 1, text: messageController.get('item.issue.advance.andor.and') },
                { id: 2, text: messageController.get('item.issue.advance.andor.or') }
            ],
            placeholder: {
                id: 1,
                text: messageController.get('item.issue.advance.andor.and')
            }
        });
        aifClone.find('[name=operator]').next('.select2-container').attr('style', 'visibility:hidden;width: 70px;');

        // 분류 필터
        aifClone.find('[name=infoType]').select2Controller({
            multiple: false,
            width: "60px",
            minimumResultsForSearch: -1,
            data: [
                { id: 0, text: messageController.get('item.issue.advance.type.all') },
                { id: 1, text: messageController.get('item.issue.advance.type.call') },
                { id: 2, text: messageController.get('item.issue.advance.type.variable') },
                { id: 3, text: messageController.get('item.issue.advance.type.constant') },
            ],
            placeholder: {
                id: 0,
                text: messageController.get('item.issue.advance.type.all')
            }
        });

        // 이슈 내용 필터
        aifClone.find('[name=infoKind]').select2Controller({
            multiple: false,
            width: "110px",
            minimumResultsForSearch: -1,
            data: [
                { id: 0, text: messageController.get('item.issue.advance.kind.all') },
                { id: 3, text: messageController.get('item.issue.advance.kind.sink') },
                { id: 2, text: messageController.get('item.issue.advance.kind.source') },
                { id: 1, text: messageController.get('item.issue.advance.kind.general') }
            ],
            placeholder: {
                id: 0,
                text: messageController.get('item.issue.advance.kind.all')
            }
        });

        // 조건 필터
        aifClone.find('[name=condition]').select2Controller({
            multiple: false,
            width: "70px",
            minimumResultsForSearch: -1,
            data: [
                { id: 1, text: messageController.get('item.issue.advance.cond.include') },
                { id: 2, text: messageController.get('item.issue.advance.cond.not.include') }
            ],
            placeholder: {
                id: 1,
                text: messageController.get('item.issue.advance.cond.include')
            }
        });

        $('#aifParent').append(aifClone);

        return aifClone;
    }
    createAif();

    // Aif 필터 추가 event
    $modalIssueSearch.find('[name=addAif]').on('click', function (e) {
        var aifClone = createAif();
        aifClone.find('button').click(e.handleObj.handler);
        $(this).find('i').removeClass('fa-plus');
        $(this).find('i').addClass('fa-minus');
        $(this).addClass('btn-minus');
        $(this).attr('name', 'subAif' + Math.floor(Math.random() * 1000000));
        $(this).off('click');

        $.each($('#aifParent').children(), function (index, value) {
            if($(value).find('.fa-minus').html() != undefined) {
                $(value).find('[name=operator]').removeAttr('disabled');
                $(value).find('[name=infoKind]').removeAttr('disabled');
                $(value).find('[name=condition]').removeAttr('disabled');
                $(value).find('[name=infoType]').removeAttr('disabled');
                $(value).find('[name=searchSql]').removeAttr('disabled');
            }
            // 첫 검색 연산자 숨김
            if(index == 1) {
                $(value).find('[name=operator]').next('.select2-container').attr('style', 'visibility:hidden;width: 70px;');
            }
        });

        aifClone.find('[name=operator]').next('.select2-container').attr('style', 'visibility:visible;width: 70px;');

        $(this).click(function(e) {
            var name = $(this).attr('name');
            // 삭제 event
            $.each($('#aifParent').children(), function (index, value) {
                if($(value).find('[name=' + name + ']').html() != undefined) {
                    $(value).remove();
                }
            });

            // 첫 검색 연산자 숨김
            $.each($('#aifParent').children(), function (index, value) {
                if(index == 1) {
                    $(value).find('[name=operator]').next('.select2-container').attr('style', 'visibility:hidden;width: 70px;');
                }
            });
        });
    });


    /******************************************************************
     * 검색
     ******************************************************************/
    // (짧은 검색) 입력폼
    $("#txtSearchShort").on("keydown", function(e) {
        var code = e.keyCode || e.which;
        if (code == 13) { // ENTER
            searchShort();
        }
    });

    // (짧은 검색) 돋보기
    $("#btnSearchShort").on("click", function() {
        searchShort()
    });

    // 파일명으로만 검색
    function searchShort() {
        // 분류 table 초기화
        savedGroupItemIds = new Array();
        $('#dataTableIssueGroup').find('tr.row-selected').removeClass('row-selected');

        unselectedIssue();

        clearFilter();
        searchIssues();

        searchIsseuGroup();

        $('#txtSearchShort').val('');
    }

    // (상세 이슈) 초기화
    $modalIssueSearch.find("[name=btnClear]").on("click", function() {
        swal({
            confirmButtonClass: "btn btn-danger",
            confirmButtonText : messageController.get('label.clear'),
            cancelButtonClass: "btn btn-default",
            cancelButtonText : messageController.get('label.cancel'),
            closeOnConfirm : true,
            buttonsStyling: false,
            showCancelButton: true,
            title: messageController.get('confirm.common.7')
        }, function (result) {
            if(result) {
                clearFilter();
            }
        })
    });

    // (상세 이슈) 검색
    $modalIssueSearch.find("[name=btnSearch]").on("click", function() {
        var hash = document.location.hash.replace('#issueId','');

        if (hash != '') {
            document.location.hash = '';
            selectedIssueId = url('#issueId', document.URL);
            searchOption.issueId = '';
        }

        // 분류 table 초기화
        savedGroupItemIds = new Array();
        $('#dataTableIssueGroup').find('tr.row-selected').removeClass('row-selected');

        unselectedIssue();

        searchIssues();

        searchIsseuGroup();

        $("#txtSearchShort").val("");

        $modalIssueSearch.find('.dropdown-tree').removeClass('open');
    });

    /**
     * 현재 검색 결과 초기화 이벤트
     */
    $('#searchOptionClear').on('click', function() {
        clearFilter();
        $('button[name=btnSearch]').trigger('click');
    });

    return rests;
}

//});

/**
 * 필터 초기화
 */
function clearFilter() {
    // 레퍼런스 트리 초기화
    if ($('#searchOptionReferenceTree').html() != undefined) {
        if($('#searchOptionDirectoryTree').dropdownFancytreeController('getTree') != null) {
            $('#searchOptionReferenceTree').dropdownFancytreeController('getTree').clearFilter();
            $('#searchOptionReferenceTree').dropdownFancytreeController('getTree').visit(function(node) {
                node.setSelected(false);
            });
            $('#searchOptionReferenceTree').dropdownFancytreeController('getTree').reload();
        }
    }

    // 경로 트리 초기화
    if ($('#searchOptionFileTree').dropdownFancytreeController('getTree') != null) {
        $('#searchOptionFileTree').dropdownFancytreeController('getTree').clearFilter();
        $('#searchOptionFileTree').dropdownFancytreeController('getTree').visit(function(node) {
            node.setSelected(false);
        });
        $('#searchOptionFileTree').dropdownFancytreeController('getTree').reload();
    }
    $("#searchOptionReferenceTree").remove();

    // 입력 필터 초기화
    $modalIssueSearch.find('[name=function]').val('');
    $modalIssueSearch.find('[name=user]').val('');
    $modalIssueSearch.find('[name=comment]').val('');

    // select 필터 초기화
    var emptyArray = [];
    $modalIssueSearch.find('[name=stateCodes]').val(emptyArray).trigger('change');
    $modalIssueSearch.find('[name=risks]').val(emptyArray).trigger('change');
    $modalIssueSearch.find('[name=checkerLangCodes]').val(emptyArray).trigger('change');
    $modalIssueSearch.find('[name=statusCodes]').val(emptyArray).trigger('change');
    $modalIssueSearch.find('[name=activeSuggestion]').val(emptyArray).trigger('change');
    $modalIssueSearch.find('[name=stateCodes]').val(emptyArray).trigger('change');
    $modalIssueSearch.find('[name=ref]').val(emptyArray).trigger('change');
    $modalIssueSearch.find('.dropdown-tree').removeClass('open');

    // Aif 필터 초기화
    clearAifFilter();
}

/**
 * Aif 필터 초기화
 */
function clearAifFilter() {
    $.each($('#aifParent').children(), function (index, value) {
        $(value).find('[name^=subAif]').trigger('click');
    });
}