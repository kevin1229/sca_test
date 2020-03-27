
var LogWarn = (function() {

    function LogWarn() {

        SearchOption = function() {
            this.fromInsertDateTime = null;
            this.toInsertDateTime = null;
            this.userId = null
            this.userName = null;
            this.dataCategoryCodes = null;
            this.content= null;
        };
        SearchOption.prototype = {
            clear : function() {
                this.fromInsertDateTime = null;
                this.toInsertDateTime = null;
                this.userId = null
                this.userName = null;
                this.dataCategoryCodes = null;
                this.content= null;
            }
        };
        var searchOption = new SearchOption();

        var $dropdownSearchOptionLogWarns = $('#dropdownSearchOptionLogWarns');

        /******************************************************************
         * 검색
         ******************************************************************/
        // 일시
        $dropdownSearchOptionLogWarns.find('[name=insertDateTime]').daterangepickerController();

        // 데이터 분류
        $.ajaxRest({
            url : "/api/1/logs/warn/dataCategory/items",
            type : "GET",
            success : function(data, textStatus, header) {
                $dropdownSearchOptionLogWarns.find('[name=dataCategoryCodes]').select2Controller({multiple:true, data : data});
            }
        });

        // 간단 검색 : 데이터 이름 검색어 입력 필드 이벤트
        $dropdownSearchOptionLogWarns.find("[name=txtSearchShort]").on('keydown', function(e) {
            var code = e.keyCode || e.which;
            if (code == 13) { // ENTER
                searchShort();
            }
        });

        // 간단 검색 : 데이터 이름 검색(돋보기) 버튼 이벤트
        $dropdownSearchOptionLogWarns.find("[name=btnSearchShort]").on('click', function() {
            searchShort();
        });


        // 데이터 이름으로만 검색
        function searchShort() {
            searchOption.clear();
            searchOption.content = $dropdownSearchOptionLogWarns.find("[name=txtSearchShort]").val();

            clearSearchOption();
            showSearchCondition();

            $dataTableLogWarns.draw();
        }

        // 결과 검색  드롭다운 버튼 : (결과) 검색
        $dropdownSearchOptionLogWarns.find("[name=btnSearch]").on('click', function() {
            searchOption.clear();

            if ($.trim($dropdownSearchOptionLogWarns.find('[name=insertDateTime]').val()) != '') {
                searchOption.fromInsertDateTime = $dropdownSearchOptionLogWarns.find('[name=insertDateTime]').data('daterangepicker').startDate._d;
                searchOption.toInsertDateTime = $dropdownSearchOptionLogWarns.find('[name=insertDateTime]').data('daterangepicker').endDate._d;
            }
            searchOption.userId = $dropdownSearchOptionLogWarns.find('[name=userId]').val();
            searchOption.userName = $dropdownSearchOptionLogWarns.find('[name=userName]').val();
            searchOption.dataCategoryCodes = $dropdownSearchOptionLogWarns.find('[name=dataCategoryCodes]').val();
            searchOption.content = $dropdownSearchOptionLogWarns.find('[name=content]').val();

            showSearchCondition();
            $dataTableLogWarns.draw();

            $dropdownSearchOptionLogWarns.find("[name=txtSearchShort]").val("");
            $dropdownSearchOptionLogWarns.removeClass('open');
        });

        // 상세 검색: 초기화
        $dropdownSearchOptionLogWarns.find("[name=btnClear]").on('click', function() {
            clearSearchOption();
        });

        function clearSearchOption() {
            // 일시
            $dropdownSearchOptionLogWarns.find('[name=insertDateTime]').val("");
            // 사용자ID
            $dropdownSearchOptionLogWarns.find('[name=userId]').val("");
            // 사용자명
            $dropdownSearchOptionLogWarns.find('[name=userName]').val("");
            // 분류
            $dropdownSearchOptionLogWarns.find('[name=dataCategoryCodes]').val("").trigger('change');
            // 비고
            $dropdownSearchOptionLogWarns.find('[name=content]').val("");
        }

        // 현재 검색 기준
        function showSearchCondition() {
            $("#searchConditionWarn").hide();
            $('#searchConditionWarn .searchConditionHead').hide();
            $('#searchConditionWarn .searchCondition').text('');

            if (searchOption == null) {
                return false;
            }

            // 일시 from
            if (searchOption.fromInsertDateTime != null && searchOption.fromInsertDateTime != "") {
                $('#searchConditionWarn [name=fromInsertDateTime]').text(moment(new Date(searchOption.fromInsertDateTime)).format('YYYY-MM-DD HH:mm'));
                $('#searchConditionWarn [name=fromInsertDateTime]').parent().show();
                $('#searchConditionWarn').css('display', 'inline-block');
            }

            // 일시 to
            if (searchOption.toInsertDateTime != null && searchOption.toInsertDateTime != "") {
                $('#searchConditionWarn [name=toInsertDateTime]').text(moment(new Date(searchOption.toInsertDateTime)).format('YYYY-MM-DD HH:mm'));
                $('#searchConditionWarn [name=toInsertDateTime]').parent().show();
                $('#searchConditionWarn').css('display', 'inline-block');
            }

            // 사용자 ID
            if (searchOption.userId != null && searchOption.userId != "") {
                $('#searchConditionWarn [name=userId]').text(searchOption.userId);
                $('#searchConditionWarn [name=userId]').parent().show();
                $('#searchConditionWarn').css('display', 'inline-block');
            }

            // 사용자 명
            if (searchOption.userName != null && searchOption.userName != "") {
                $('#searchConditionWarn [name=userName]').text(searchOption.userName);
                $('#searchConditionWarn [name=userName]').parent().show();
                $('#searchConditionWarn').css('display', 'inline-block');
            }

            // 분류
            if (searchOption.dataCategoryCodes != null && searchOption.dataCategoryCodes.length != 0) {
                var texts = getSelectTexts($dropdownSearchOptionLogWarns.find("[name=dataCategoryCodes]"), searchOption.dataCategoryCodes);
                $('#searchConditionWarn [name=dataCategoryCodes]').text(texts.join(', '));
                $('#searchConditionWarn [name=dataCategoryCodes]').parent().show();
                $('#searchConditionWarn').css('display', 'inline-block');
            }

            // 비고
            if (searchOption.content != null && searchOption.content != "") {
                $('#searchConditionWarn [name=content]').text(searchOption.content);
                $('#searchConditionWarn [name=content]').parent().show();
                $('#searchConditionWarn').css('display', 'inline-block');
            }

            // 검색 box width 조정
            $.each($('.search-condition-box'), function (index, value) {
                $(value).width($('.tab-pane-warn .search-box').width() - $('.search-input-box').width() - 12);
            });
        }

        // Dropdown 닫기 방지 : common.js
        stopHideDropDown($dropdownSearchOptionLogWarns);

        /****************************************
         * 내보내기
         ****************************************/
        $(".tab-pane-warn").find('[name=btnExport]').on('click', function(e) {
            $.ajaxRest({
                url : "/api/1/logs/warn/export/csv",
                type : "POST",
                data : searchOption,
                error : function(hdr, status) {
                    errorMsgHandler.swal(hdr.responseText);
                }
            });
        });

        /****************************************
         * 목록
         ****************************************/
        var $dataTableLogWarns = $("#dataTableLogWarns").dataTableController({
            url: "/api/1/logs/warn",
            searchOption: searchOption,
            buttonGroupId: "buttonGroupDataTableLogWarns",
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
                    return messageController.get("item.log.warn.data_category." + data);
                }
            }, {
                targets: 6,
                data: "content",
                render: function(data, type, row) {
                    return data;
                }
            }]
        });

        /**
         * 현재 검색 결과 초기화 이벤트
         */
        $('#searchOptionClearWarn').click(function () {
            clearSearchOption();
            $('button[name=btnSearch]').trigger('click');
        });
    }

    return LogWarn;
})();
