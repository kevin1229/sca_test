
var LogData = (function() {

    function LogData() {

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

        var $dropdownSearchOptionLogDatas = $('#dropdownSearchOptionLogDatas');

        /******************************************************************
         * 검색
         ******************************************************************/
        // 일시
        $dropdownSearchOptionLogDatas.find('[name=insertDateTime]').daterangepickerController();

        // 분류
        $.ajaxRest({
            url : "/api/1/logs/data/dataCategory/items",
            type : "GET",
            success : function(data, textStatus, header) {
                $dropdownSearchOptionLogDatas.find('[name=dataCategoryCodes]').select2Controller({multiple:true, data : data});
            }
        });

        // 동작
        $.ajaxRest({
            url : "/api/1/logs/data/action/items",
            type : "GET",
            success : function(data, textStatus, header) {
                $dropdownSearchOptionLogDatas.find('[name=actionCodes]').select2Controller({multiple:true, data : data});
            }
        });

        // 동작 결과
        $.ajaxRest({
            url : "/api/1/logs/common/actionResult/items",
            type : "GET",
            success : function(data, textStatus, header) {
                $dropdownSearchOptionLogDatas.find('[name=actionResultCodes]').select2Controller({multiple:true, data : data});
            }
        });


        // 간단 검색 : 프로젝트명 검색어 입력 필드 이벤트
        $dropdownSearchOptionLogDatas.find("[name=txtSearchShort]").on('keydown', function(e) {
            var code = e.keyCode || e.which;
            if (code == 13) { // ENTER
                searchShort();
            }
        });

        // 간단 검색 : 프로젝트명 검색(돋보기) 버튼 이벤트
        $dropdownSearchOptionLogDatas.find("[name=btnSearchShort]").on('click', function() {
            searchShort();
        });

        // 프로젝트명으로만 검색
        function searchShort() {

            searchOption.clear();
            searchOption.dataName = $dropdownSearchOptionLogDatas.find("[name=txtSearchShort]").val();

            // 검색 입력폼 클리어
            clearSearchOption();
            showSearchCondition();

            $dataTableLogDatas.draw();
        }

        // 결과 검색  드롭다운 버튼 : (결과) 검색
        $dropdownSearchOptionLogDatas.find("[name=btnSearch]").on('click', function() {
            searchOption.clear();

            if ($.trim($dropdownSearchOptionLogDatas.find('[name=insertDateTime]').val()) != '') {
                searchOption.fromInsertDateTime = $dropdownSearchOptionLogDatas.find('[name=insertDateTime]').data('daterangepicker').startDate._d;
                searchOption.toInsertDateTime = $dropdownSearchOptionLogDatas.find('[name=insertDateTime]').data('daterangepicker').endDate._d;
            }
            searchOption.dataName = $dropdownSearchOptionLogDatas.find('[name=dataName]').val();
            searchOption.userId = $dropdownSearchOptionLogDatas.find('[name=userId]').val();
            searchOption.userName = $dropdownSearchOptionLogDatas.find('[name=userName]').val();
            searchOption.dataCategoryCodes = $dropdownSearchOptionLogDatas.find('[name=dataCategoryCodes]').val();
            searchOption.dataName = $dropdownSearchOptionLogDatas.find('[name=dataName]').val();
            searchOption.actionCodes = $dropdownSearchOptionLogDatas.find('[name=actionCodes]').val();
            searchOption.actionResultCodes = $dropdownSearchOptionLogDatas.find('[name=actionResultCodes]').val();

            $dataTableLogDatas.draw();
            showSearchCondition();

            $dropdownSearchOptionLogDatas.find("[name=txtSearchShort]").val("");
            $dropdownSearchOptionLogDatas.removeClass('open');
        });

        // 상세 검색: 초기화
        $dropdownSearchOptionLogDatas.find("[name=btnClear]").on('click', function() {
            clearSearchOption();
        });

        function clearSearchOption() {
            // 일시
            $dropdownSearchOptionLogDatas.find('[name=insertDateTime]').val(null);
            // 사용자ID, 사용자명
            $dropdownSearchOptionLogDatas.find('[name=userId]').val(null);
            $dropdownSearchOptionLogDatas.find('[name=userName]').val(null);
            // 분류
            $dropdownSearchOptionLogDatas.find('[name=dataCategoryCodes]').val("").trigger('change');
            // 프로젝트 명
            $dropdownSearchOptionLogDatas.find('[name=dataName]').val(null);
            // 동작, 동작 결과
            $dropdownSearchOptionLogDatas.find('[name=actionCodes]').val("").trigger('change');
            $dropdownSearchOptionLogDatas.find('[name=actionResultCodes]').val("").trigger('change');
        }

        // 현재 검색 기준
        function showSearchCondition() {
            $('#searchConditionData').hide();
            $('#searchConditionData .searchConditionHead').hide();
            $('#searchConditionData .searchCondition').text('');

            if(searchOption == null) {
                return false;
            }

            // 일시 from
            if (searchOption.fromInsertDateTime != null && searchOption.fromInsertDateTime != "") {
                $('#searchConditionData [name=fromInsertDateTime]').text(moment(new Date(searchOption.fromInsertDateTime)).format('YYYY-MM-DD HH:mm'));
                $('#searchConditionData [name=fromInsertDateTime]').parent().show();
                $('#searchConditionData').css('display', 'inline-block');
            }

            // 일시 to
            if (searchOption.toInsertDateTime != null && searchOption.toInsertDateTime != "") {
                $('#searchConditionData [name=toInsertDateTime]').text(moment(new Date(searchOption.toInsertDateTime)).format('YYYY-MM-DD HH:mm'));
                $('#searchConditionData [name=toInsertDateTime]').parent().show();
                $('#searchConditionData').css('display', 'inline-block');
            }

            // 사용자 ID
            if (searchOption.userId != null && searchOption.userId != "") {
                $('#searchConditionData [name=userId]').text(searchOption.userId);
                $('#searchConditionData [name=userId]').parent().show();
                $('#searchConditionData').css('display', 'inline-block');
            }

            // 사용자 명
            if (searchOption.userName != null && searchOption.userName != "") {
                $('#searchConditionData [name=userName]').text(searchOption.userName);
                $('#searchConditionData [name=userName]').parent().show();
                $('#searchConditionData').css('display', 'inline-block');
            }

            // 분류
            if (searchOption.dataCategoryCodes != null && searchOption.dataCategoryCodes.length != 0) {
                var texts = getSelectTexts($dropdownSearchOptionLogDatas.find("[name=dataCategoryCodes]"), searchOption.dataCategoryCodes);
                $('#searchConditionData [name=dataCategoryCodes]').text(texts.join(', '));
                $('#searchConditionData [name=dataCategoryCodes]').parent().show();
                $('#searchConditionData').css('display', 'inline-block');
            }


            // 데이터 이름
            if (searchOption.dataName != null && searchOption.dataName != "") {
                $('#searchConditionData [name=dataName]').text(searchOption.dataName);
                $('#searchConditionData [name=dataName]').parent().show();
                $('#searchConditionData').css('display', 'inline-block');
            }

            // 동작
            if (searchOption.actionCodes != null && searchOption.actionCodes.length != 0) {
                var texts = getSelectTexts($dropdownSearchOptionLogDatas.find("[name=actionCodes]"), searchOption.actionCodes);
                $('#searchConditionData [name=actionCodes]').text(texts.join(', '));
                $('#searchConditionData [name=actionCodes]').parent().show();
                $('#searchConditionData').css('display', 'inline-block');
            }

            // 동작 결과
            if (searchOption.actionResultCodes != null && searchOption.actionResultCodes.length != 0) {
                var texts = getSelectTexts($dropdownSearchOptionLogDatas.find("[name=actionResultCodes]"), searchOption.actionResultCodes);
                $('#searchConditionData [name=actionResultCodes]').text(texts.join(', '));
                $('#searchConditionData [name=actionResultCodes]').parent().show();
                $('#searchConditionData').css('display', 'inline-block');
            }

            // 검색 box width 조정
            $.each($('.search-condition-box'), function (index, value) {
                $(value).width($('.tab-pane-data .search-box').width() - $('.search-input-box').width() - 12);
            });
        }

        // Dropdown 닫기 방지 : common.js
        stopHideDropDown($dropdownSearchOptionLogDatas);

        /****************************************
         * 내보내기
         ****************************************/
        $(".tab-pane-data").find('[name=btnExport]').on('click', function(e) {
            var requestBody = {};
            requestBody.searchOption = searchOption;

            $.ajaxRest({
                url : "/api/1/logs/data/export/csv",
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
        var $dataTableLogDatas = $("#dataTableLogDatas").dataTableController({
            url: "/api/1/logs/data",
            searchOption: searchOption,
            buttonGroupId: "buttonGroupDataTableLogDatas",
            order : [ [ 0, 'desc' ] ],
            columnDefs: [{
                targets: 0,
                data: "logId",
                render: function(data, type, row) {
                    return data;
                }
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
                    return data;
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
                data: "ipAddress",
                render: function(data, type, row) {
                    return data;
                }
            }, {
                targets: 5,
                data: "dataCategoryCode",
                render: function(data, type, row) {
                    var text = messageController.get("item.log.data.data_category." + data);
                    if(text == null || text.length == 0) {
                        return data;
                    }
                    return text;
                }
            }, {
                targets: 6,
                data: "dataName",
                render: function(data, type, row) {
                    if(data == null) {
                        return "-";
                    } else if(data.includes('/')) {
                        var list = data.split('/');
                        var value = '';
                        for (var i = 0; i < list.length; i++) {
                            if(list[i] === 'null') {
                                list[i] = '-';
                            }
                        }
                        for (var i = 0; i < list.length; i++) {
                            if(i != (list.length - 1)) {
                                value += list[i] + '/';
                            } else {
                                value += list[i];
                            }
                        }
                        return value.escapeHTML();
                    }
                    return data.escapeHTML();
                }
            }, {
                targets: 7,
                data: "actionCode",
                render: function(data, type, row) {
                    return messageController.get("item.log.data.action." + data);
                }
            }, {
                targets: 8,
                data: "actionResultCode",
                render: function(data, type, row) {
                    return messageController.get("item.log.common.action_result." + data);
                }
            }, {
                targets: 9,
                data: "content",
                render: function(data, type, row) {
                    if(data == null) {
                        return "";
                    }
                    return data.escapeHTML().replace(/(\n|\r\n)/g, '<br>');
                }
            }]
        });

        /**
         * 현재 검색 결과 초기화 이벤트
         */
        $('#searchOptionClearData').click(function () {
            clearSearchOption();
            $('button[name=btnSearch]').trigger('click');
        });
    }

    return LogData;

})();
