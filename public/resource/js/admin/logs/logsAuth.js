
var LogAuth = (function() {

    function LogAuth() {

        SearchOption = function() {
            this.fromInsertDateTime = null;
            this.toInsertDateTime = null;
            this.userId = null
            this.userName = null;
            this.dataCategoryCodes = [];
            this.dataName= null;
            this.actionCodes = [];
            this.actionResultCodes = [];
        };
        SearchOption.prototype = {
            clear : function() {
                this.fromInsertDateTime = null;
                this.toInsertDateTime = null;
                this.userId = null
                this.userName = null;
                this.dataCategoryCodes = [];
                this.dataName= null;
                this.actionCodes = [];
                this.actionResultCodes = [];
            }
        };
        var searchOption = new SearchOption();

        var $dropdownSearchOptionLogAuths = $('#dropdownSearchOptionLogAuths');

        /******************************************************************
         * 컴포넌트
         ******************************************************************/
        // 일시
        $dropdownSearchOptionLogAuths.find('[name=insertDateTime]').daterangepickerController();

        // 데이터 분류
        $.ajaxRest({
            url: "/api/1/logs/auth/dataCategory/items",
            type: "GET",
            success: function(data, textStatus, header) {
                $dropdownSearchOptionLogAuths.find('[name=dataCategoryCodes]').select2Controller({ multiple:true, data : data });
            }
        });

        // 동작
        $.ajaxRest({
            url: "/api/1/logs/auth/action/items",
            type: "GET",
            success: function(data, textStatus, header) {
                $dropdownSearchOptionLogAuths.find('[name=actionCodes]').select2Controller({ multiple:true, data : data });
            }
        });

        // 동작 결과
        $.ajaxRest({
            url: "/api/1/logs/common/actionResult/items",
            type: "GET",
            success: function(data, textStatus, header) {
                $dropdownSearchOptionLogAuths.find('[name=actionResultCodes]').select2Controller({ multiple:true, data : data });
            }
        });

        /******************************************************************
         * 검색
         ******************************************************************/
        // 간단 검색
        $dropdownSearchOptionLogAuths.find("[name=txtSearchShort]").on('keydown', function(e) {
            var code = e.keyCode || e.which;
            if (code == 13) { // ENTER
                searchShort();
            }
        });

        // 간단 검색
        $dropdownSearchOptionLogAuths.find("[name=btnSearchShort]").on('click', function() {
            searchShort();
        });

        function searchShort() {
            searchOption.clear();
            searchOption.userId = $dropdownSearchOptionLogAuths.find("[name=txtSearchShort]").val();

            clearSearchOption();
            showSearchCondition();

            $dataTableLogAuths.draw();
        }

        // 결과 검색  드롭다운 버튼 : (결과) 검색
        $dropdownSearchOptionLogAuths.find("[name=btnSearch]").on('click', function() {
            // 검색 조건 클리어
            searchOption.clear();

            // 일시
            if ($dropdownSearchOptionLogAuths.find('[name=insertDateTime]').val() != '') {
                searchOption.fromInsertDateTime = $dropdownSearchOptionLogAuths.find('[name=insertDateTime]').data('daterangepicker').startDate._d;
                searchOption.toInsertDateTime = $dropdownSearchOptionLogAuths.find('[name=insertDateTime]').data('daterangepicker').endDate._d;
            }

            searchOption.userId = $dropdownSearchOptionLogAuths.find('[name=userId]').val();
            searchOption.userName = $dropdownSearchOptionLogAuths.find('[name=userName]').val();
            searchOption.dataCategoryCodes = $dropdownSearchOptionLogAuths.find('[name=dataCategoryCodes]').val();
            searchOption.actionCodes = $dropdownSearchOptionLogAuths.find('[name=actionCodes]').val();
            searchOption.actionResultCodes = $dropdownSearchOptionLogAuths.find('[name=actionResultCodes]').val();

            // 데이터 테이블 다시 그리기
            $dataTableLogAuths.draw();
            showSearchCondition();

            $dropdownSearchOptionLogAuths.find("[name=txtSearchShort]").val("");
            $dropdownSearchOptionLogAuths.removeClass('open');
        });


        // 상세 검색: 초기화
        $dropdownSearchOptionLogAuths.find("[name=btnClear]").on('click', function() {
            clearSearchOption();
        });

        function clearSearchOption() {
            // 일시
            $dropdownSearchOptionLogAuths.find('[name=insertDateTime]').val("");
            // 사용자ID, 사용자명
            $dropdownSearchOptionLogAuths.find('[name=userId]').val("");
            $dropdownSearchOptionLogAuths.find('[name=userName]').val("");
            // 분류
            $dropdownSearchOptionLogAuths.find('[name=dataCategoryCodes]').val("").trigger('change');
            // 동작, 동작 결과
            $dropdownSearchOptionLogAuths.find('[name=actionCodes]').val("").trigger('change');
            $dropdownSearchOptionLogAuths.find('[name=actionResultCodes]').val("").trigger('change');
        }

        // 현재 검색 기준
        function showSearchCondition() {
            $('#searchConditionAuth').hide();
            $('#searchConditionAuth .searchConditionHead').hide();
            $('#searchConditionAuth .searchCondition').text('');

            if (searchOption == null) {
                return false;
            }

            // 일시 from
            if (searchOption.fromInsertDateTime != null && searchOption.fromInsertDateTime != "") {
                $('#searchConditionAuth [name=fromInsertDateTime]').text(moment(new Date(searchOption.fromInsertDateTime)).format('YYYY-MM-DD HH:mm'));
                $('#searchConditionAuth [name=fromInsertDateTime]').parent().show();
                $('#searchConditionAuth').css('display', 'inline-block');
            }

            // 일시 to
            if (searchOption.toInsertDateTime != null && searchOption.toInsertDateTime != "") {
                $('#searchConditionAuth [name=toInsertDateTime]').text(moment(new Date(searchOption.toInsertDateTime)).format('YYYY-MM-DD HH:mm'));
                $('#searchConditionAuth [name=toInsertDateTime]').parent().show();
                $('#searchConditionAuth').css('display', 'inline-block');
            }

            // 사용자 ID
            if (searchOption.userId != null && searchOption.userId != "") {
                $('#searchConditionAuth [name=userId]').text(searchOption.userId);
                $('#searchConditionAuth [name=userId]').parent().show();
                $('#searchConditionAuth').css('display', 'inline-block');
            }

            // 사용자명
            if (searchOption.userName != null && searchOption.userName != "") {
                $('#searchConditionAuth [name=userName]').text(searchOption.userName);
                $('#searchConditionAuth [name=userName]').parent().show();
                $('#searchConditionAuth').css('display', 'inline-block');
            }

            // 분류
            if(searchOption.actionCodes != null && searchOption.actionCodes.length != 0) {
                var texts = getSelectTexts($dropdownSearchOptionLogAuths.find("[name=actionCodes]"), searchOption.actionCodes);
                $('#searchConditionAuth [name=actionCodes]').text(texts.join(', '));
                $('#searchConditionAuth [name=actionCodes]').parent().show();
                $('#searchConditionAuth').css('display', 'inline-block');
            }

            // 동작
            if(searchOption.dataCategoryCodes != null && searchOption.dataCategoryCodes.length != 0) {
                var texts = getSelectTexts($dropdownSearchOptionLogAuths.find("[name=dataCategoryCodes]"), searchOption.dataCategoryCodes);
                $('#searchConditionAuth [name=dataCategoryCodes]').text(texts.join(', '));
                $('#searchConditionAuth [name=dataCategoryCodes]').parent().show();
                $('#searchConditionAuth').css('display', 'inline-block');
            }

            // 동작 결과
            if (searchOption.actionResultCodes != null && searchOption.actionResultCodes.length != 0) {
                var texts = getSelectTexts($dropdownSearchOptionLogAuths.find("[name=actionResultCodes]"), searchOption.actionResultCodes);
                $('#searchConditionAuth [name=actionResultCodes]').text(texts.join(', '));
                $('#searchConditionAuth [name=actionResultCodes]').parent().show();
                $('#searchConditionAuth').css('display', 'inline-block');
            }

            // 검색 box width 조정
            $.each($('.search-condition-box'), function (index, value) {
                $(value).width($('.tab-pane-auth .search-box').width() - $('.search-input-box').width() - 12);
            });
        }

        // Dropdown 닫기 방지 : common.js
        stopHideDropDown($dropdownSearchOptionLogAuths);

        /****************************************
         * 내보내기
         ****************************************/
        $(".tab-pane-auth").find('[name=btnExport]').on('click', function(e) {

            var requestBody = {};
            requestBody.searchOption = searchOption;

            $.ajaxRest({
                url : "/api/1/logs/auth/export/csv",
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
        var $dataTableLogAuths = $("#dataTableLogAuths").dataTableController({
            url: "/api/1/logs/auth",
            searchOption: searchOption,
            buttonGroupId: "buttonGroupDataTableLogAuths",
            order : [ [ 0, 'desc' ] ],
            columnDefs: [ {
                targets: 0,
                data: "logId"
            }, {
                targets: 1,
                data: "insertDateTime",
                className: 'dt-head-center',
                render: function(data, type, row) {
                    return momentController.timestampFormat(data, 'YYYY-MM-DD HH:mm:ss');
                }
            }, {
                targets: 2,
                data: "userId",
                render: function(data, type, row) {
                    if(data == null || data.length == 0) {
                        return '-';
                    }
                    return data.escapeHTML();
                }
            }, {
                targets: 3,
                data: "userName",
                render: function(data, type, row) {
                    if(data == null || data.length == 0) {
                        return '-';
                    }
                    return data.escapeHTML();
                }
            }, {
                targets: 4,
                data: "ipAddress"
            }, {
                targets: 5,
                data: "dataCategoryCode",
                render: function(data, type, row) {
                    if(data == null)
                        return "-";
                    return messageController.get("item.log.auth.data_category." + data);
                }
            }, {
                targets: 6,
                data: "actionCode",
                render: function(data, type, row) {
                    return messageController.get("item.log.auth.action." + data);
                }
            }, {
                targets: 7,
                data: "actionResultCode",
                render: function(data, type, row) {
                    return messageController.get("item.log.common.action_result." + data);
                }
            }, {
                targets: 8,
                data: "content",
                render: function(data, type, row) {
                    return data;
                }
            }]
        });

        /**
         * 현재 검색 결과 초기화 이벤트
         */
        $('#searchOptionClearAuth').click(function () {
            clearSearchOption();
            $('button[name=btnSearch]').trigger('click');
        });
    }

    return LogAuth;

})();