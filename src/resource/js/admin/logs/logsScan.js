
var LogScan = (function() {

    function LogScan() {

        SearchOption = function() {
            this.fromInsertDateTime = null;
            this.toInsertDateTime = null;
            this.userId = null
            this.userName = null;
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
                this.dataName= null;
                this.actionCodes = [];
                this.actionResultCodes = [];
            }
        };
        var searchOption = new SearchOption();

        var $dropdownSearchOptionLogScans = $('#dropdownSearchOptionLogScans');

        /******************************************************************
         * 검색 관련
         ******************************************************************/
        // 일시
        $dropdownSearchOptionLogScans.find('[name=insertDateTime]').daterangepickerController();

        // 동작
        $.ajaxRest({
            url : "/api/1/logs/scan/action/items",
            type : "GET",
            success : function(data, textStatus, header) {
                $dropdownSearchOptionLogScans.find('[name=actionCodes]').select2Controller({multiple:true, data : data});
            }
        });

        // 동작 결과
        $.ajaxRest({
            url : "/api/1/logs/common/actionResult/items",
            type : "GET",
            success : function(data, textStatus, header) {
                $dropdownSearchOptionLogScans.find('[name=actionResultCodes]').select2Controller({multiple:true, data : data});
            }
        });

        // 간단 검색 : 데이터 이름 검색어 입력 필드 이벤트
        $dropdownSearchOptionLogScans.find("[name=txtSearchShort]").on('keydown', function(e) {
            var code = e.keyCode || e.which;
            if (code == 13) { // ENTER
                searchShort();
            }
        });

        // 간단 검색 : 데이터 이름 검색(돋보기) 버튼 이벤트
        $dropdownSearchOptionLogScans.find("[name=btnSearchShort]").on('click', function() {
            searchShort();
        });

        // 데이터 이름으로만 검색
        function searchShort() {
            searchOption.clear();
            searchOption.dataName = $dropdownSearchOptionLogScans.find("[name=txtSearchShort]").val();

            clearSearchOption();
            showSearchCondition();

            $dataTableLogScans.draw();
        }

        // 결과 검색  드롭다운 버튼 : (결과) 검색
        $dropdownSearchOptionLogScans.find("[name=btnSearch]").on('click', function(e) {
            searchOption.clear();

            // 일시
            if ($.trim($dropdownSearchOptionLogScans.find('[name=insertDateTime]').val()) != '') {
                searchOption.fromInsertDateTime = $dropdownSearchOptionLogScans.find('[name=insertDateTime]').data('daterangepicker').startDate._d;
                searchOption.toInsertDateTime = $dropdownSearchOptionLogScans.find('[name=insertDateTime]').data('daterangepicker').endDate._d;
            }
            // 사용자 ID
            searchOption.userId = $dropdownSearchOptionLogScans.find('[name=userId]').val();
            // 사용자명
            searchOption.userName = $dropdownSearchOptionLogScans.find('[name=userName]').val();
            // 프로젝트명
            searchOption.dataName = $dropdownSearchOptionLogScans.find('[name=dataName]').val();
            // 동작
            searchOption.actionCodes = $dropdownSearchOptionLogScans.find('[name=actionCodes]').val();
            // 동작 결과
            searchOption.actionResultCodes = $dropdownSearchOptionLogScans.find('[name=actionResultCodes]').val();

            showSearchCondition();
            $dataTableLogScans.draw();

            $dropdownSearchOptionLogScans.find("[name=txtSearchShort]").val("");
            $dropdownSearchOptionLogScans.removeClass('open');
        });

        // 상세 검색: 초기화
        $dropdownSearchOptionLogScans.find("[name=btnClear]").on('click', function(e) {
            clearSearchOption();
        });

        function clearSearchOption() {
            // 일시
            $dropdownSearchOptionLogScans.find('[name=insertDateTime]').val("");
            // 사용자ID, 사용자명
            $dropdownSearchOptionLogScans.find('[name=userId]').val("");
            $dropdownSearchOptionLogScans.find('[name=userName]').val("");
            // 프로젝트 명
            $dropdownSearchOptionLogScans.find('[name=dataName]').val("");
            // 동작, 동작 결과
            $dropdownSearchOptionLogScans.find('[name=actionCodes]').val("").trigger('change');
            $dropdownSearchOptionLogScans.find('[name=actionResultCodes]').val("").trigger('change');
        }

        // 현재 검색 기준
        function showSearchCondition() {
            $('#searchConditionScan').hide();
            $('#searchConditionScan .searchConditionHead').hide();
            $('#searchConditionScan .searchCondition').text('');

            if (searchOption == null) {
                return false;
            }

            // 일시 from
            if (searchOption.fromInsertDateTime != null && searchOption.fromInsertDateTime != "") {
                $('#searchConditionScan [name=fromInsertDateTime]').text(moment(new Date(searchOption.fromInsertDateTime)).format('YYYY-MM-DD HH:mm'));
                $('#searchConditionScan [name=fromInsertDateTime]').parent().show();
                $('#searchConditionScan').css('display', 'inline-block');
            }

            // 일시 to
            if (searchOption.toInsertDateTime != null && searchOption.toInsertDateTime != "") {
                $('#searchConditionScan [name=toInsertDateTime]').text(moment(new Date(searchOption.toInsertDateTime)).format('YYYY-MM-DD HH:mm'));
                $('#searchConditionScan [name=toInsertDateTime]').parent().show();
                $('#searchConditionScan').css('display', 'inline-block');
            }

            // 사용자 ID
            if (searchOption.userId != null && searchOption.userId != "") {
                $('#searchConditionScan [name=userId]').text(searchOption.userId);
                $('#searchConditionScan [name=userId]').parent().show();
                $('#searchConditionScan').css('display', 'inline-block');
            }

            // 사용자 명
            if (searchOption.userName != null && searchOption.userName != "") {
                $('#searchConditionScan [name=userName]').text(searchOption.userName);
                $('#searchConditionScan [name=userName]').parent().show();
                $('#searchConditionScan').css('display', 'inline-block');
            }

            // 데이터 이름
            if (searchOption.dataName != null && searchOption.dataName != "") {
                $('#searchConditionScan [name=dataName]').text(searchOption.dataName);
                $('#searchConditionScan [name=dataName]').parent().show();
                $('#searchConditionScan').css('display', 'inline-block');
            }

            // 동작
            if (searchOption.actionCodes != null && searchOption.actionCodes.length != 0) {
                var texts = getSelectTexts($dropdownSearchOptionLogScans.find("[name=actionCodes]"), searchOption.actionCodes);
                $('#searchConditionScan [name=actionCodes]').text(texts.join(', '));
                $('#searchConditionScan [name=actionCodes]').parent().show();
                $('#searchConditionScan').css('display', 'inline-block');
            }

            // 동작 결과
            if (searchOption.actionResultCodes != null && searchOption.actionResultCodes.length != 0) {
                var texts = getSelectTexts($dropdownSearchOptionLogScans.find("[name=actionResultCodes]"), searchOption.actionResultCodes);
                $('#searchConditionScan [name=actionResultCodes]').text(texts.join(', '));
                $('#searchConditionScan [name=actionResultCodes]').parent().show();
                $('#searchConditionScan').css('display', 'inline-block');
            }

            // 검색 box width 조정
            $.each($('.search-condition-box'), function (index, value) {
                $(value).width($('.tab-pane-scan .search-box').width() - $('.search-input-box').width() - 12);
            });
        }

        // Dropdown 닫기 방지 : common.js
        stopHideDropDown($dropdownSearchOptionLogScans);


        /****************************************
         * 내보내기
         ****************************************/
        $(".tab-pane-scan").find('[name=btnExport]').on('click', function(e) {

            var requestBody = {};
            requestBody.searchOption = searchOption;

            $.ajaxRest({
                url : "/api/1/logs/scan/export/csv",
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
        var $dataTableLogScans = $("#dataTableLogScans").dataTableController({
            url: "/api/1/logs/scan",
            searchOption: searchOption,
            buttonGroupId: "buttonGroupDataTableLogScans",
            order : [ [ 0, 'desc' ] ],
            columnDefs: [ {
                targets: 0, // ID
                data: "logId"
            }, {
                targets: 1, // 일시
                data: "insertDateTime",
                className: 'dt-head-center',
                render: function(data, type, row) {
                    return momentController.timestampFormat(data, 'YYYY-MM-DD HH:mm:ss');
                }
            }, {
                targets: 2,
                data: "userId", // 사용자ID
                render: function(data, type, row) {
                    if(data == null || data.length == 0) {
                        return '-';
                    }
                    return data.escapeHTML();
                }
            }, {
                targets: 3,
                data: "userName", // 사용자명
                render: function(data, type, row) {
                    if(data == null || data.length == 0) {
                        return '-';
                    }
                    return data.escapeHTML();
                }
            }, {
                targets: 4,
                data: "ipAddress" // 사용자IP
            }, {
                targets: 5,
                data: "dataName" // 프로젝트 키
            }, {
                targets: 6,
                data: "dataId"
            }, {
                targets: 7,
                data: "actionCode",
                render: function(data, type, row) {
                    return messageController.get("item.log.scan.action." + data);
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
                    return data;
                }
            }]
        });

        /**
         * 현재 검색 결과 초기화 이벤트
         */
        $('#searchOptionClearScan').click(function () {
            clearSearchOption();
            $('button[name=btnSearch]').trigger('click');
        });
    }

    return LogScan;
})();
