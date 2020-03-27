
var LogSystem = (function() {

    function LogSystem(){

        SearchOption = function() {
            this.fromInsertDateTime = null;
            this.toInsertDateTime = null;
            this.dataCategoryCodes = [];
            this.actionCodes = [];
            this.actionResultCodes = [];
            this.content= null;
        };
        SearchOption.prototype = {
            clear : function(){
                this.fromInsertDateTime = null;
                this.toInsertDateTime = null;
                this.dataCategoryCodes = [];
                this.actionCodes = [];
                this.actionResultCodes = [];
                this.content= null;
            }
        };
        var searchOption = new SearchOption();

        var $dropdownSearchOptionLogSystems = $('#dropdownSearchOptionLogSystems');

        /******************************************************************
         * 컴포넌트
         ******************************************************************/
        // 일시
        $dropdownSearchOptionLogSystems.find('[name=insertDateTime]').daterangepickerController();

        // 분류
        $.ajaxRest({
            url : "/api/1/logs/system/dataCategory/items",
            type : "GET",
            success : function(data, textStatus, header) {
                // 분류
                $dropdownSearchOptionLogSystems.find('[name=dataCategoryCodes]').select2Controller({multiple:true, data : data});
            }
        });

        // 동작
        $.ajaxRest({
            url : "/api/1/logs/system/action/items",
            type : "GET",
            success : function(data, textStatus, header) {
                // 동작
                $dropdownSearchOptionLogSystems.find('[name=actionCodes]').select2Controller({multiple:true, data : data});
            }
        });

        // 동작 결과
        $.ajaxRest({
            url : "/api/1/logs/common/actionResult/items",
            type : "GET",
            success : function(data, textStatus, header) {
                // 동작 결과
                $dropdownSearchOptionLogSystems.find('[name=actionResultCodes]').select2Controller({multiple:true, data : data});
            }
        });

        /******************************************************************
         * 검색
         ******************************************************************/
        $dropdownSearchOptionLogSystems.find("[name=txtSearchShort]").on('keydown', function(e) {
            var code = e.keyCode || e.which;
            if (code == 13) { // ENTER
                searchShort();
            }
        });

        $dropdownSearchOptionLogSystems.find("[name=btnSearchShort]").on('click', function() {
            searchShort();
        });

        function searchShort() {
            searchOption.clear();
            searchOption.content = $dropdownSearchOptionLogSystems.find("[name=txtSearchShort]").val();

            clearSearchOption();
            showSearchCondition();

            $dataTableLogSystems.draw();
        }

        // 결과 검색  드롭다운 버튼 : (결과) 검색
        $dropdownSearchOptionLogSystems.find("[name=btnSearch]").on('click', function() {
            searchOption.clear();

            if ($.trim($dropdownSearchOptionLogSystems.find('[name=insertDateTime]').val()) != '') {
                searchOption.fromInsertDateTime = $dropdownSearchOptionLogSystems.find('[name=insertDateTime]').data('daterangepicker').startDate._d;
                searchOption.toInsertDateTime = $dropdownSearchOptionLogSystems.find('[name=insertDateTime]').data('daterangepicker').endDate._d;
            }
            searchOption.dataCategoryCodes = $dropdownSearchOptionLogSystems.find('[name=dataCategoryCodes]').val();
            searchOption.actionCodes = $dropdownSearchOptionLogSystems.find('[name=actionCodes]').val();
            searchOption.actionResultCodes = $dropdownSearchOptionLogSystems.find('[name=actionResultCodes]').val();
            searchOption.content = $dropdownSearchOptionLogSystems.find('[name=content]').val();

            $dataTableLogSystems.draw();
            showSearchCondition();

            $dropdownSearchOptionLogSystems.find("[name=txtSearchShort]").val("");
            $dropdownSearchOptionLogSystems.removeClass('open');
        });

        // 상세 검색: 초기화
        $dropdownSearchOptionLogSystems.find("[name=btnClear]").on('click', function() {
            clearSearchOption();
        });

        function clearSearchOption() {
            $dropdownSearchOptionLogSystems.find('[name=txtSearchShort]').val("");
            // 일시
            $dropdownSearchOptionLogSystems.find('[name=insertDateTime]').val("");
            // 분류
            $dropdownSearchOptionLogSystems.find('[name=dataCategoryCodes]').val("").trigger('change');
            // 동작, 동작 결과
            $dropdownSearchOptionLogSystems.find('[name=actionCodes]').val("").trigger('change');
            $dropdownSearchOptionLogSystems.find('[name=actionResultCodes]').val("").trigger('change');
            // 비고
            $dropdownSearchOptionLogSystems.find('[name=content]').val("");
        }

        // 현재 검색 기준
        function showSearchCondition() {
            $('#searchConditionSystem').hide();
            $('#searchConditionSystem .searchCondition').text('');
            $('#searchConditionSystem .searchConditionHead').hide();

            if(searchOption == null){
                return false;
            }

            // 일시 from
            if (searchOption.fromInsertDateTime != null && searchOption.fromInsertDateTime != "") {
                $('#searchConditionSystem [name=fromInsertDateTime]').text(moment(new Date(searchOption.fromInsertDateTime)).format('YYYY-MM-DD HH:mm'));
                $('#searchConditionSystem [name=fromInsertDateTime]').parent().show();
                $('#searchConditionSystem').css('display', 'inline-block');
            }

            // 일시 to
            if (searchOption.toInsertDateTime != null && searchOption.toInsertDateTime != "") {
                $('#searchConditionSystem [name=toInsertDateTime]').text(moment(new Date(searchOption.toInsertDateTime)).format('YYYY-MM-DD HH:mm'));
                $('#searchConditionSystem [name=toInsertDateTime]').parent().show();
                $('#searchConditionSystem').css('display', 'inline-block');
            }

            // 분류
            if (searchOption.dataCategoryCodes != null && searchOption.dataCategoryCodes.length != 0) {
                var texts = getSelectTexts($dropdownSearchOptionLogSystems.find("[name=dataCategoryCodes]"), searchOption.dataCategoryCodes);
                $('#searchConditionSystem [name=dataCategoryCodes]').text(texts.join(', '));
                $('#searchConditionSystem [name=dataCategoryCodes]').parent().show();
                $('#searchConditionSystem').css('display', 'inline-block');
            }

            // 동작
            if (searchOption.actionCodes != null && searchOption.actionCodes.length != 0) {
                var texts = getSelectTexts($dropdownSearchOptionLogSystems.find("[name=actionCodes]"), searchOption.actionCodes);
                $('#searchConditionSystem [name=actionCodes]').text(texts.join(', '));
                $('#searchConditionSystem [name=actionCodes]').parent().show();
                $('#searchConditionSystem').css('display', 'inline-block');
            }

            // 동작 결과
            if (searchOption.actionResultCodes != null && searchOption.actionResultCodes.length != 0) {
                var texts = getSelectTexts($dropdownSearchOptionLogSystems.find("[name=actionResultCodes]"), searchOption.actionResultCodes);
                $('#searchConditionSystem [name=actionResultCodes]').text(texts.join(', '));
                $('#searchConditionSystem [name=actionResultCodes]').parent().show();
                $('#searchConditionSystem').css('display', 'inline-block');
            }

            // 비고
            if (searchOption.content != null && searchOption.content != "") {
                $('#searchConditionSystem [name=content]').text(searchOption.content);
                $('#searchConditionSystem [name=content]').parent().show();
                $('#searchConditionSystem').css('display', 'inline-block');
            }

            // 검색 box width 조정
            $.each($('.search-condition-box'), function (index, value) {
                $(value).width($('.tab-pane-system .search-box').width() - $('.search-input-box').width() - 12);
            });
        }

        // Dropdown 닫기 방지 : common.js
        stopHideDropDown($dropdownSearchOptionLogSystems);

        /****************************************
         * 내보내기
         ****************************************/
        $(".tab-pane-system").find('[name=btnExport]').on('click', function(e){

            var requestBody = {};
            requestBody.searchOption = searchOption;

            $.ajaxRest({
                url : "/api/1/logs/system/export/csv",
                type : "POST",
                data : requestBody,
                error : function(hdr, status) {
                    errorMsgHandler.swal(hdr.responseText);
                }
            });
        });

        /****************************************
         * 목록
         ****************************************/
        var $dataTableLogSystems = $("#dataTableLogSystems").dataTableController({
            url: "/api/1/logs/system",
            searchOption: searchOption,
            buttonGroupId: "buttonGroupDataTableLogSystems",
            order : [ [ 0, 'desc' ] ],
            columnDefs: [ {
                targets: 0,
                data: "logId"
            }, {
                targets: 1,
                data: "insertDateTime",
                className: 'dt-head-center',
                render: function(data, type, row){
                    return momentController.timestampFormat(data, 'YYYY-MM-DD HH:mm:ss');
                }
            }, {
                targets: 2,
                data: "dataCategoryCode",
                render: function(data, type, row){
                    return messageController.get("item.log.system.data_category." + data);
                }
            }, {
                targets: 3,
                data: "actionCode",
                render: function(data, type, row){
                    return messageController.get("item.log.system.action." + data);
                }
            }, {
                targets: 4,
                data: "actionResultCode",
                render: function(data, type, row){
                    return messageController.get("item.log.common.action_result." + data);
                }
            }, {
                targets: 5,
                data: "content"
            }]
        });

        /**
         * 현재 검색 결과 초기화 이벤트
         */
        $('#searchOptionClearSystem').click(function () {
            clearSearchOption();
            $('button[name=btnSearch]').trigger('click');
        });
    }

    return LogSystem;
})();
