$(function() {

    /***************************************************************************
     * 변수
     **************************************************************************/
    SearchOption = function() {
        this.reportTypes = [];
        this.name = null;
        this.description= null;
        this.insertUserIds = [];
        this.updateUserIds = [];
        this.insertFromDateTime = null;
        this.insertToDateTime = null;
        this.updateFromDateTime = null;
        this.updateToDateTime = null;
    };
    SearchOption.prototype = {
        clear : function() {
            this.reportTypes = [];
            this.name = null;
            this.description= null;
            this.insertUserIds = [];
            this.updateUserIds = [];
            this.insertFromDateTime = null;
            this.insertToDateTime = null;
            this.updateFromDateTime = null;
            this.updateToDateTime = null;
        }
    };
    var searchOption = new SearchOption();

    var $dropdownSearchOption = $("#dropdownSearchOption");

    templateTypeData = {};
    var $buttonGroupDataTable = $("#buttonGroupDataTable");

    /***************************************************************************
     * 컨포넌트
     **************************************************************************/
    // 보고서 종류
    $.ajaxRest({
        url : "/api/1/report/templates/type/items",
        type : "GET",
        success : function (data, textStatus, jqXHR) {
            $dropdownSearchOption.find("[name=reportTypes]").select2Controller({multiple:true, data : data});
            templateTypeData = data;
        }
    });

    // 사용자
    $dropdownSearchOption.find('[name=insertUsers]').select2Controller({ multiple:true, url:"/api/1/users/items"});
    $dropdownSearchOption.find('[name=updateUsers]').select2Controller({ multiple:true, url:"/api/1/users/items"});

    stopHideDropDown($dropdownSearchOption);

    // 등록일
    $dropdownSearchOption.find('[name=insertDateTime]').daterangepickerController();
    $dropdownSearchOption.find('[name=updateDateTime]').daterangepickerController();

    /***************************************************************************
     * 검색
     **************************************************************************/
    // 간단 검색(엔터)
    $dropdownSearchOption.find('[name=txtSearchShort]').on('keydown', function(e) {
        var code = e.keyCode || e.which;
        if (code == 13) { // ENTER
            searchShort();
        }
    });

    // 간단 검색(돋보기)
    $dropdownSearchOption.find('[name=btnSearchShort]').on('click', function(e) {
        searchShort();
    });

    function searchShort() {
        searchOption.clear();
        searchOption.name = $dropdownSearchOption.find('[name=txtSearchShort]').val();
        clearSearchOption();
        showSearchCondition();

        $dataTable.draw();
    }

    // 상세 검색:검색
    $dropdownSearchOption.find('[name=btnSearch]').on('click', function(e) {
        searchOption.clear();
        searchOption.reportTypes = $dropdownSearchOption.find("[name=reportTypes]").val();
        searchOption.name = $dropdownSearchOption.find('[name=name]').val();
        searchOption.description= $dropdownSearchOption.find('[name=description]').val();
        searchOption.insertUserIds = $dropdownSearchOption.find("[name=insertUsers]").val();
        searchOption.updateUserIds = $dropdownSearchOption.find("[name=updateUsers]").val();
        if ($.trim($dropdownSearchOption.find("[name=insertDateTime]").val()) != '') {
            searchOption.insertFromDateTime = $dropdownSearchOption.find("[name=insertDateTime]").data('daterangepicker').startDate._d;
            searchOption.insertToDateTime = $dropdownSearchOption.find("[name=insertDateTime]").data('daterangepicker').endDate._d;
        }
        if ($.trim($dropdownSearchOption.find("[name=updateDateTime]").val()) != '') {
            searchOption.updateFromDateTime = $dropdownSearchOption.find("[name=updateDateTime]").data('daterangepicker').startDate._d;
            searchOption.updateToDateTime = $dropdownSearchOption.find("[name=updateDateTime]").data('daterangepicker').endDate._d;
        }

        showSearchCondition();
        $dataTable.draw();

        $dropdownSearchOption.find('[name=txtSearchShort]').val("");
        $dropdownSearchOption.removeClass('open');
    });

    // 상세 검색:초기화
    $dropdownSearchOption.find('[name=btnClear]').on('click', function(e) {
        clearSearchOption();
    });

    function clearSearchOption() {
        $dropdownSearchOption.find("[name=reportTypes]").val("").trigger('change');
        $dropdownSearchOption.find('[name=name]').val("");
        $dropdownSearchOption.find('[name=description]').val("");

        $dropdownSearchOption.find("[name=insertUsers]").val("").trigger('change');
        $dropdownSearchOption.find("[name=updateUsers]").val("").trigger('change');

        $dropdownSearchOption.find("[name=insertDateTime]").val("").trigger('change');
        $dropdownSearchOption.find("[name=updateDateTime]").val("").trigger('change');
    }

    // 현재 검색 기준
    function showSearchCondition() {
        $('#searchCondition').hide();
        $('#searchCondition .searchConditionHead').hide();
        $('#searchCondition .searchCondition').text('');

        if(searchOption == null) {
            return false;
        }

        if (searchOption.reportTypes != null && searchOption.reportTypes.length != 0) {
            var texts = getSelectTexts($dropdownSearchOption.find("[name=reportTypes]"), searchOption.reportTypes);
            $('#searchCondition [name=reportTypes]').text(texts.join(', '));
            $('#searchCondition [name=reportTypes]').parent().show();
            $('#searchCondition').css('display', 'inline-block');
        }

        if (searchOption.name != null && searchOption.name != "") {
            $('#searchCondition [name=name]').text(searchOption.name);
            $('#searchCondition [name=name]').parent().show();
            $('#searchCondition').css('display', 'inline-block');
        }

        if (searchOption.description != null && searchOption.description != "") {
            $('#searchCondition [name=description]').text(searchOption.description);
            $('#searchCondition [name=description]').parent().show();
            $('#searchCondition').css('display', 'inline-block');
        }

        if (searchOption.insertUserIds != null && searchOption.insertUserIds.length != 0) {
            var texts = getSelectTexts($dropdownSearchOption.find("[name=insertUsers]"), searchOption.insertUserIds);
            $('#searchCondition [name=insertUsers]').text(texts.join(', '));
            $('#searchCondition [name=insertUsers]').parent().show();
            $('#searchCondition').css('display', 'inline-block');
        }

        if (searchOption.updateUserIds != null && searchOption.updateUserIds.length != 0) {
            var texts = getSelectTexts($dropdownSearchOption.find("[name=updateUsers]"), searchOption.updateUserIds);
            $('#searchCondition [name=updateUsers]').text(texts.join(', '));
            $('#searchCondition [name=updateUsers]').parent().show();
            $('#searchCondition').css('display', 'inline-block');
        }

        if (searchOption.insertFromDateTime != null && searchOption.insertFromDateTime != "") {
            $('#searchCondition [name=insertFromDateTime]').text(moment(new Date(searchOption.insertFromDateTime)).format('YYYY-MM-DD HH:mm'));
            $('#searchCondition [name=insertFromDateTime]').parent().show();
            $('#searchCondition').css('display', 'inline-block');
        }

        if (searchOption.insertToDateTime != null && searchOption.insertToDateTime != "") {
            $('#searchCondition [name=insertToDateTime]').text(moment(new Date(searchOption.insertToDateTime)).format('YYYY-MM-DD HH:mm'));
            $('#searchCondition [name=insertToDateTime]').parent().show();
            $('#searchCondition').css('display', 'inline-block');
        }

        if (searchOption.updateFromDateTime != null && searchOption.updateFromDateTime != "") {
            $('#searchCondition [name=updateFromDateTime]').text(moment(new Date(searchOption.updateFromDateTime)).format('YYYY-MM-DD HH:mm'));
            $('#searchCondition [name=updateFromDateTime]').parent().show();
            $('#searchCondition').css('display', 'inline-block');
        }

        if (searchOption.updateToDateTime != null && searchOption.updateToDateTime != "") {
            $('#searchCondition [name=updateToDateTime]').text(moment(new Date(searchOption.updateToDateTime)).format('YYYY-MM-DD HH:mm'));
            $('#searchCondition [name=updateToDateTime]').parent().show();
            $('#searchCondition').css('display', 'inline-block');
        }
    }

    /***************************************************************************
     * 테이블 표시
     **************************************************************************/
    var $dataTable = $('#dataTable').dataTableController({
        url : "/api/1/report/templates",
        searchOption : searchOption,
        buttonGroupId: "buttonGroupDataTable",
        order : [ [ 1, 'desc' ] ],
        columnDefs: [{
            targets:   0,
            orderable: false,
            className: 'select-checkbox',
            defaultContent: ""
        }, {
            targets: 1, // ID
            data: "templateId"
        }, {
            targets: 2, // 보고서 종류
            data: "reportType",
            render: function(data, type, row) {
                return getTypeName(data);
            }
        }, {
            targets: 3, // 템플릿명
            data: 'name'
        }, {
            targets: 4, // 설명
            data: 'description',
            className :'table-inner-fixed-width-md',
            render: function(data, type, row) {
                if(data == null || data.length == 0) {
                    return '-';
                }
                return '<div title="'+ data +'">'+ data +'</div>'
            }
        }, {
            targets: 5, // 등록자
            data: "insertUser",
            visible: false,
            render: function(data, type, row) {
                if (row.insertUserId == null)
                    return '-';
                if(data == null || data.userName == null)
                    return row.insertUserId;
                return data.userName.escapeHTML() + "(" + row.insertUserId + ")";
            }
        }, {
            targets: 6, // 최근 변경자
            data: "updateUser",
            render: function(data, type, row) {
                if (row.updateUserId == null)
                    return '-';
                if(data == null || data.userName == null)
                    return row.updateUserId;
                return data.userName.escapeHTML() + "(" + row.updateUserId + ")";
            }
        }, {
            targets: 7, // 등록일
            data: "insertDateTime",
            render: function(data, type, row) {
                if(data == null) {
                    return '-';
                }
                return momentController.timestampFormat(data, 'YYYY-MM-DD HH:mm');
            }
        }, {
            targets: 8, // 등록일
            data: "updateDateTime",
            render: function(data, type, row) {
                if(data == null) {
                    return '-';
                }
                return momentController.timestampFormat(data, 'YYYY-MM-DD HH:mm');
            }
        }, {
            targets: 9,
            orderable: false,
            className: "extend-button",
            width: '60px',
            render: function(data, type, row, meta) {
                var html = '<span data-name="btnModify" class="btn-modify" style="margin-right:10px;"><i class="fa fa-pencil-square-o active-hover" aria-hidden="true"></i></span>';
                html += '<span data-name="btnDelete" class="btn-delete" style="margin-right:10px;"><i class="fa fa-trash active-hover" aria-hidden="true"></i></span>';
                return html;
            }
        }],
        createdRow: function (row, data, index) {

            var $row = $(row);

            // 수정
            $row.on('click', function(e) {
                if(e.target.className.indexOf('select-checkbox') == -1
                    && e.target.className.indexOf('extend-button') == -1
                    && e.target.className.indexOf('material-icons') == -1
                    && e.target.className.indexOf('btn') == -1) {
                    window.location.href = "/admin/report/templates/" + data.templateId + "/design";
                    e.stopPropagation();
                }
            });

            // 수정
            $row.find("[data-name=btnModify]").on("click", function(e) {
                window.location.href = "/admin/report/templates/" + data.templateId + "/design";
                e.stopPropagation();
            });

            // 삭제
            $row.find("[data-name=btnDelete]").on("click", function(e) {
                swalDelete({
                    url: "/api/1/report/templates/" + data.templateId,
                    dataTable: $dataTable
                });
                e.stopPropagation();
            });
        },
        initComplete: function(settings, json){
            changeButtonText();
        }
    });

    function getTypeName(type) {
        for(var i in templateTypeData){
            if(templateTypeData[i].id == type) return templateTypeData[i].text;
        }
        return "UNDEFINED";
    }

    /***************************************************************************
     * 테이블 버튼
     **************************************************************************/

    // 데이터 테이블의 선택/선택해제 이벤트 리스너.
    $dataTable.DataTable().on('select', function(e, dt, type, indexes) {
        changeButtonText();
    }).on('deselect', function ( e, dt, type, indexes ) {
        changeButtonText();
    });

    /**
     * 2개 이상의 ROW가 선택된 경우, 일괄삭제, 일괄수정으로 텍스트 변경.
     * 1개 이하의 ROW가 선택된 경우, 삭제, 수정으로 텍스트 변경.
     */
    function changeButtonText() {
        // 버튼 활성화
        if($dataTable.getSelectedIds().length == 0)
            $buttonGroupDataTable.parent().find('[name=btnDeleteBatch]').attr('disabled',true);
        else
            $buttonGroupDataTable.parent().find('[name=btnDeleteBatch]').attr('disabled',false);

        // 버튼 텍스트
        if($dataTable.getSelectedIds().length > 1) {
            $buttonGroupDataTable.parent().find('[name=btnDeleteBatch]').find('.btn-name').text(messageController.get("label.batch.delete"));
        } else {
            $buttonGroupDataTable.parent().find('[name=btnDeleteBatch]').find('.btn-name').text(messageController.get("label.delete"));
        }
    }

    // // 일괄 삭제
    $buttonGroupDataTable.find('[name=btnDeleteBatch]').on('click', function() {
        var selectedIds = $dataTable.getSelectedIds('templateId');
        if (selectedIds.length == 0) {
            swal(messageController.get('400025'));
            return;
        }

        var requestBody = {};
        if($dataTable.isAllSelected()) {
            requestBody.searchOption = searchOption;
        } else {
            requestBody.ids = selectedIds;
        }

        swalDelete({
            url: "/api/1/report/templates",
            dataTable: $dataTable,
            requestBody: requestBody
        });
    });

    /**
     * 현재 검색 결과 초기화 이벤트
     */
    $('#searchOptionClear').click(function () {
        clearSearchOption();
        $('button[name=btnSearch]').trigger('click');
    });
});