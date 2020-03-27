
var LogVcs = (function() {

    function LogVcs() {

        SearchOption = function() {
            this.resultCodes = [];
            this.insertDateTimeFrom = null;
            this.insertDateTimeTo = null
            this.ipAddress = null;
            this.projectName = null;
            this.file= null;
            this.hash = null;
            this.userId = null;
            this.systemName = null;
        };
        SearchOption.prototype = {
            clear : function() {
                this.resultCodes = [];
                this.insertDateTimeFrom = null;
                this.insertDateTimeTo = null
                this.ipAddress = null;
                this.projectName = null;
                this.file= null;
                this.hash = null;
                this.userId = null;
                this.systemName = null;
            }
        };
        var searchOption = new SearchOption();

        var $dropdownSearchOptionLogVcs = $('#dropdownSearchOptionLogVcs');

        /******************************************************************
         * 검색 관련
         ******************************************************************/
        // 결과코드
        $.ajaxRest({
            url : "/api/1/logs/vcs/file/inspect/resultCode/items",
            type : "GET",
            success : function(data, textStatus, header) {
                $dropdownSearchOptionLogVcs.find("[name=resultCodes]").select2Controller({multiple:true, data : data});
            }
        });

        // 신청일시
        $dropdownSearchOptionLogVcs.find('[name=insertDateTime]').daterangepickerController();


        // 간단 검색 : 검색어 입력 필드 이벤트
        $dropdownSearchOptionLogVcs.find("[name=txtSearchShort]").on('keydown', function(e) {
            var code = e.keyCode || e.which;
            if (code == 13) { // ENTER
                searchShort();
            }
        });

        // 간단 검색 : 검색(돋보기) 버튼 이벤트
        $dropdownSearchOptionLogVcs.find("[name=btnSearchShort]").on('click', function(e) {
            searchShort();
        });

        function searchShort() {
            searchOption.clear();
            searchOption.file = $dropdownSearchOptionLogVcs.find("[name=txtSearchShort]").val();

            clearSearchOption();
            showSearchCondition();

            $dataTableLogVcs.draw();
        }

        // 결과 검색  드롭다운 버튼 : (결과) 검색
        $dropdownSearchOptionLogVcs.find("[name=btnSearch]").on('click', function() {
            // 검색 조건 클리어
            searchOption.clear();
            searchOption.resultCodes = $dropdownSearchOptionLogVcs.find('[name=resultCodes]').val();
            // 일시
            if ($.trim($dropdownSearchOptionLogVcs.find('[name=insertDateTime]').val()) != '') {
                searchOption.insertDateTimeFrom = $dropdownSearchOptionLogVcs.find('[name=insertDateTime]').data('daterangepicker').startDate._d;
                searchOption.insertDateTimeTo = $dropdownSearchOptionLogVcs.find('[name=insertDateTime]').data('daterangepicker').endDate._d;
            }
            searchOption.ipAddress = $dropdownSearchOptionLogVcs.find('[name=ipAddress]').val();
            searchOption.projectName = $dropdownSearchOptionLogVcs.find('[name=projectName]').val();
            searchOption.file = $dropdownSearchOptionLogVcs.find('[name=file]').val();
            searchOption.hash = $dropdownSearchOptionLogVcs.find('[name=hash]').val();
            searchOption.userId = $dropdownSearchOptionLogVcs.find('[name=userId]').val();
            searchOption.systemName = $dropdownSearchOptionLogVcs.find('[name=systemName]').val();

            $dataTableLogVcs.draw();
            showSearchCondition();

            $dropdownSearchOptionLogVcs.find("[name=txtSearchShort]").val(null);
            $dropdownSearchOptionLogVcs.removeClass('open');
        });

        // 상세 검색: 초기화
        $dropdownSearchOptionLogVcs.find("[name=btnClear]").on('click', function() {
            clearSearchOption();
        });

        function clearSearchOption() {
            $dropdownSearchOptionLogVcs.find('[name=resultCodes]').val("").trigger('change');
            $dropdownSearchOptionLogVcs.find('[name=insertDateTime]').val("");
            $dropdownSearchOptionLogVcs.find('[name=ipAddress]').val("");
            $dropdownSearchOptionLogVcs.find('[name=projectName]').val("");
            $dropdownSearchOptionLogVcs.find('[name=file]').val("");
            $dropdownSearchOptionLogVcs.find('[name=hash]').val("");
            $dropdownSearchOptionLogVcs.find('[name=userId]').val("");
            $dropdownSearchOptionLogVcs.find('[name=systemName]').val("");
        }

        // 현재 검색 기준
        function showSearchCondition() {
            $('#searchConditionVcs').hide();
            $('#searchConditionVcs .searchConditionHead').hide();
            $('#searchConditionVcs .searchCondition').text('');

            if (searchOption == null) {
                return false;
            }

            // 상태 결과
            if (searchOption.resultCodes != null && searchOption.resultCodes.length != 0) {
                var texts = getSelectTexts($dropdownSearchOptionLogVcs.find("[name=resultCodes]"), searchOption.resultCodes);
                $('#searchConditionVcs [name=resultCodes]').text(texts.join(', '));
                $('#searchConditionVcs [name=resultCodes]').parent().show();
                $('#searchConditionVcs').css('display', 'inline-block');
            }

            // 신청 일시 from
            if (searchOption.insertDateTimeFrom != null && searchOption.insertDateTimeFrom != "") {
                $('#searchConditionVcs [name=insertDateTimeFrom]').text(moment(new Date(searchOption.insertDateTimeFrom)).format('YYYY-MM-DD HH:mm'));
                $('#searchConditionVcs [name=insertDateTimeFrom]').parent().show();
                $('#searchConditionVcs').css('display', 'inline-block');
            }

            // 신청 일시 to
            if (searchOption.insertDateTimeTo != null && searchOption.insertDateTimeTo != "") {
                $('#searchConditionVcs [name=insertDateTimeTo]').text(moment(new Date(searchOption.insertDateTimeTo)).format('YYYY-MM-DD HH:mm'));
                $('#searchConditionVcs [name=insertDateTimeTo]').parent().show();
                $('#searchConditionVcs').css('display', 'inline-block');
            }

            // ip
            if (searchOption.ipAddress != null && searchOption.ipAddress != "") {
                $('#searchConditionVcs [name=ipAddress]').text(searchOption.ipAddress);
                $('#searchConditionVcs [name=ipAddress]').parent().show();
                $('#searchConditionVcs').css('display', 'inline-block');
            }

            // 프로젝트 명
            if (searchOption.projectName != null && searchOption.projectName != "") {
                $('#searchConditionVcs [name=projectName]').text(searchOption.projectName);
                $('#searchConditionVcs [name=projectName]').parent().show();
                $('#searchConditionVcs').css('display', 'inline-block');
            }

            // 파일명
            if(searchOption.file != null && searchOption.file != "") {
                $('#searchConditionVcs [name=file]').text(searchOption.file);
                $('#searchConditionVcs [name=file]').parent().show();
                $('#searchConditionVcs').css('display', 'inline-block');
            }

            // hash
            if (searchOption.hash != null && searchOption.hash != "") {
                $('#searchConditionVcs [name=hash]').text(searchOption.hash);
                $('#searchConditionVcs [name=hash]').parent().show();
                $('#searchConditionVcs').css('display', 'inline-block');
            }

            // 신청자
            if (searchOption.userId != null && searchOption.userId != "") {
                $('#searchConditionVcs [name=userId]').text(searchOption.userId);
                $('#searchConditionVcs [name=userId]').parent().show();
                $('#searchConditionVcs').css('display', 'inline-block');
            }

            // 시스템명
            if (searchOption.systemName != null && searchOption.systemName != "") {
                $('#searchConditionVcs [name=systemName]').text(searchOption.systemName);
                $('#searchConditionVcs [name=systemName]').parent().show();
                $('#searchConditionVcs').css('display', 'inline-block');
            }

            // 검색 box width 조정
            $.each($('.search-condition-box'), function (index, value) {
                $(value).width($('.tab-pane-vcs .search-box').width() - $('.search-input-box').width() - 12);
            });
        }

        // Dropdown 닫기 방지 : common.js
        stopHideDropDown($dropdownSearchOptionLogVcs);

        /****************************************
         * 내보내기
         ****************************************/
        $(".tab-pane-vcs").find('[name=btnExport]').on('click', function(e) {

            var requestBody = {};
            requestBody.searchOption = searchOption;

            $.ajaxRest({
                url : "/api/1/logs/vcs/file/inspect/export/csv",
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
        var $dataTableLogVcs = $("#dataTableLogVcs").dataTableController({
            url: "/api/1/logs/vcs/file/inspect",
            searchOption: searchOption,
            buttonGroupId: "buttonGroupDataTableLogVcs",
            order : [ [ 0, 'desc' ] ],
            columnDefs: [ {
                targets: 0,
                data: "logVcsFileInspectId"
            }, {
                targets: 1,
                data: "resultCode",
                render: function(data, type, row) {
                    return messageController.get("item.vcs.result." + data)
                }
            }, {
                targets: 2,
                data: "insertDateTime",
                className: 'dt-head-center',
                render: function(data, type, row) {
                    return momentController.timestampFormat(data, 'YYYY-MM-DD HH:mm:ss');
                }
            }, {
                targets: 3,
                data: "ipAddress"
            }, {
                targets: 4,
                data: "projectName",
                render: function(data, type, row) {
                    if(data == null) {
                        return '-';
                    }
                    if(row.projectKey == null) {
                        return data.escapeHTML();
                    }
                    return '<span title="' + messageController.get('label.project.key') + " : " + row.projectKey.escapeHTML() + '" data-toggle="tooltip" data-container="body">' + data.escapeHTML() + '</span>';
                }
            }, {
                targets: 5,
                data: "file",
                render: function(data, type, row) {
                    return data.escapeHTML();
                }
            }, {
                targets: 6,
                data: "risk1",
                className : "dt-head-right",
                render: function(data, type, row) {
                    if (data == null) {
                        return '-';
                    }
                    return data;
                }
            }, {
                targets: 7,
                data: "risk2",
                className : "dt-head-right",
                render: function(data, type, row) {
                    if (data == null) {
                        return '-';
                    }
                    return data;
                }
            }, {
                targets: 8,
                data: "risk3",
                className : "dt-head-right",
                render: function(data, type, row) {
                    if (data == null) {
                        return '-';
                    }
                    return data;
                }
            }, {
                targets: 9,
                data: "risk4",
                className : "dt-head-right",
                render: function(data, type, row) {
                    if(data == null) {
                        return '-';
                    }
                    return data;
                }
            }, {
                targets: 10,
                data: "risk5",
                className : "dt-head-right",
                render: function(data, type, row) {
                    if (data == null) {
                        return '-';
                    }
                    return data;
                }
            }, {
                targets: 11,
                data: "hash",
                render: function(data, type, row) {
                    if (data == null) {
                        return '-';
                    }
                    return data.escapeHTML();
                }
            }, {
                targets: 12,
                data: "userId",
                render: function(data, type, row) {
                    if (data == null) {
                        return '-';
                    }
                    return data.escapeHTML();
                }
            }, {
                targets: 13,
                data: "systemName",
                render: function(data, type, row) {
                    if (data == null) {
                        return '-';
                    }
                    return data.escapeHTML();
                }
            }, {
                targets: 14,
                data: "urlPath" ,
                render: function(data, type, row) {
                    if (data == null) {
                        return '-';
                    }
                    return "<a href='"+ data + "'>" + data + "</a>";
                }
            }]
        });

        /**
         * 현재 검색 결과 초기화 이벤트
         */
        $('#searchOptionClearVcs').click(function () {
            clearSearchOption();
            $('button[name=btnSearch]').trigger('click');
        });
    }

    return LogVcs;
})();
