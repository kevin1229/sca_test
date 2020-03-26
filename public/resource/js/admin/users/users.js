$(function() {

    /***************************************************************************
     * 변수
     **************************************************************************/
    SearchOption = function() {
        this.userId = null;
        this.userName = null;
        this.email= null;
        this.userLangs = [];
        this.userAuthorityIds = [];
        this.fromExpireDateTime = null;
        this.toExpireDateTime = null;
        this.userGroupIds = [];
    };
    SearchOption.prototype = {
        clear : function() {
            this.userId = null;
            this.userName = null;
            this.email= null;
            this.userLangs = [];
            this.userAuthorityIds = [];
            this.fromExpireDateTime = null;
            this.toExpireDateTime = null;
            this.userGroupIds = [];
        }
    };
    var searchOption = new SearchOption();

    var $dropdownSearchOptionUsers = $("#dropdownSearchOptionUsers");
    var $buttonGroupDataTableUsers = $("#buttonGroupDataTableUsers");
    var $modalAddUser = $("#modalAddUser");
    var $modalModifyUser = $("#modalModifyUser");
    var $modalBatchModifyUser = $("#modalBatchModifyUser");

    var personalDisplayUserLang = $("#personalDisplayUserLang").val();

    /***************************************************************************
     * 컨포넌트
     **************************************************************************/
    $.ajaxRest({
        url : "/api/1/users/userLang/items",
        type : "GET",
        success : function (data, textStatus, jqXHR) {
            $modalAddUser.find("[name=userLang]").select2Controller({data : data});
            $modalAddUser.find('[name=userLang]').val(personalDisplayUserLang).trigger('change');
            $modalModifyUser.find("[name=userLang]").select2Controller({data : data});
            $modalBatchModifyUser.find("[name=userLang]").select2Controller({data : data});
            $dropdownSearchOptionUsers.find("[name=userLangs]").select2Controller({multiple:true, data : data});
        },
    });

    $.ajaxRest({
        url : "/api/1/userAuthority/items",
        type : "GET",
        success : function (data, textStatus, jqXHR) {
            $modalAddUser.find("[name=userAuthorityId]").select2Controller({data : data});
            $modalModifyUser.find("[name=userAuthorityId]").select2Controller({data : data});
            $modalBatchModifyUser.find("[name=userAuthorityId]").select2Controller({data : data});
            $dropdownSearchOptionUsers.find("[name=userAuthorityIds]").select2Controller({multiple:true, data : data});
        },
    });

    $.ajaxRest({
        url : "/api/1/userGroups/items",
        type : "GET",
        success : function (data, textStatus, jqXHR) {

            for (var i in data) {
                if (data[i].id == 0) {
                    data.splice(i,1);
                    break;
                }
            }

            $modalAddUser.find("[name=userGroupIds]").select2Controller({multiple:true, data : data});
            $modalModifyUser.find("[name=userGroupIds]").select2Controller({multiple:true, data : data});
            $modalBatchModifyUser.find("[name=userGroupIds]").select2Controller({multiple:true, data : data});
            $dropdownSearchOptionUsers.find("[name=userGroupIds]").select2Controller({multiple:true, data : data});
        },
    });

    $.ajaxRest({
        url : "/api/1/auth/servers/items",
        type : "GET",
        success : function(data, textStatus, header) {
            data.unshift({id: 0, text : messageController.get("label.internal")});
            $modalAddUser.find("[name=authServerId]").select2Controller({data : data});
            $modalAddUser.find("[name=authServerId]").val("0").trigger('change');
            $modalModifyUser.find("[name=authServerId]").select2Controller({data : data});
            $modalBatchModifyUser.find("[name=authServerId]").select2Controller({data : data});
            $dropdownSearchOptionUsers.find("[name=authServerIds]").select2Controller({multiple:true, data : data});
        }
    });

    // 만료일
    $dropdownSearchOptionUsers.find('[name=expireDateTime]').daterangepickerController();
    $modalAddUser.find('[name=expireDateTime]').daterangepickerController({
        singleDatePicker : true,
        ranges : false,
        startDate : moment()
    });
    $modalModifyUser.find('[name=expireDateTime]').daterangepickerController({
        singleDatePicker : true,
        ranges : false,
        startDate : moment()
    });
    $modalAddUser.find('[name=expireDateTime]').daterangepickerController({
        singleDatePicker : true,
        ranges : false,
        startDate : moment()
    });
    $modalBatchModifyUser.find('[name=expireDateTime]').daterangepickerController({
        singleDatePicker : true,
        ranges : false,
        startDate : moment()
    });

    // 상태
    $dropdownSearchOptionUsers.find('[name=useYns]').select2Controller({
        multiple:true,
        data : [{
            id: 'Y',
            text: messageController.get('label.on')
        }, {
            id: 'N',
            text: messageController.get('label.off')
        }]
    });

    /***************************************************************************
     * 검색
     **************************************************************************/
    // 간단 검색(엔터)
    $dropdownSearchOptionUsers.find('[name=txtSearchShort]').on('keydown', function(e) {
        var code = e.keyCode || e.which;
        if (code == 13) { // ENTER
            searchShort();
        }
    });

    // 간단 검색(돋보기)
    $dropdownSearchOptionUsers.find('[name=btnSearchShort]').on('click', function(e) {
        searchShort();
    });

    function searchShort() {
        searchOption.clear();
        searchOption.userName = $dropdownSearchOptionUsers.find('[name=txtSearchShort]').val();

        clearSearchOption();
        showSearchCondition();

        $dataTableUsers.draw();
    }

    // 상세 검색:검색
    $dropdownSearchOptionUsers.find('[name=btnSearch]').on('click', function(e) {
        searchOption.clear();
        searchOption.userId = $dropdownSearchOptionUsers.find("[name=userId]").val();
        searchOption.userName = $dropdownSearchOptionUsers.find("[name=userName]").val();
        searchOption.email= $dropdownSearchOptionUsers.find("[name=email]").val();;
        searchOption.userLangs = $dropdownSearchOptionUsers.find("[name=userLangs]").val();
        searchOption.userAuthorityIds = $dropdownSearchOptionUsers.find("[name=userAuthorityIds]").val();
        if ($.trim($dropdownSearchOptionUsers.find('[name=expireDateTime]').val()) != '') {
            searchOption.fromExpireDateTime = $dropdownSearchOptionUsers.find('[name=expireDateTime]').data('daterangepicker').startDate._d;
            searchOption.toExpireDateTime = $dropdownSearchOptionUsers.find('[name=expireDateTime]').data('daterangepicker').endDate._d;
        }
        searchOption.userGroupIds = $dropdownSearchOptionUsers.find("[name=userGroupIds]").val();
        searchOption.authServerIds = $dropdownSearchOptionUsers.find("[name=authServerIds]").val();
        searchOption.useYns = $dropdownSearchOptionUsers.find("[name=useYns]").val();

        showSearchCondition();
        $dataTableUsers.draw();

        $dropdownSearchOptionUsers.find('[name=txtSearchShort]').val("");
        $dropdownSearchOptionUsers.removeClass('open');
    });

    // 상세 검색:초기화
    $dropdownSearchOptionUsers.find('[name=btnClear]').on('click', function(e) {
        clearSearchOption();
    });

    function clearSearchOption() {
        $dropdownSearchOptionUsers.find('[name=txtSearchShort]').val("");
        $dropdownSearchOptionUsers.find("[name=userId]").val("");
        $dropdownSearchOptionUsers.find("[name=userName]").val("");
        $dropdownSearchOptionUsers.find("[name=email]").val("");
        $dropdownSearchOptionUsers.find("[name=userLangs]").val("").trigger('change');
        $dropdownSearchOptionUsers.find("[name=userAuthorityIds]").val("").trigger('change');
        $dropdownSearchOptionUsers.find("[name=expireDateTime]").val("").trigger('change');
        $dropdownSearchOptionUsers.find("[name=userGroupIds]").val("").trigger('change');
        $dropdownSearchOptionUsers.find("[name=authServerIds]").val("").trigger('change');
        $dropdownSearchOptionUsers.find("[name=useYns]").val("").trigger('change');
    }

    // 현재 검색 기준
    function showSearchCondition() {
        $('#searchCondition').hide();
        $('#searchCondition .searchConditionHead').hide();
        $('#searchCondition .searchCondition').text('');

        if(searchOption == null) {
            return false;
        }

        if (searchOption.userId != null && searchOption.userId != "") {
            $('#searchCondition [name=userId]').text(searchOption.userId);
            $('#searchCondition [name=userId]').parent().show();
            $('#searchCondition').css('display', 'inline-block');
        }

        if (searchOption.userName != null && searchOption.userName != "") {
            $('#searchCondition [name=userName]').text(searchOption.userName);
            $('#searchCondition [name=userName]').parent().show();
            $('#searchCondition').css('display', 'inline-block');
        }

        if (searchOption.email != null && searchOption.email != "") {
            $('#searchCondition [name=email]').text(searchOption.email);
            $('#searchCondition [name=email]').parent().show();
            $('#searchCondition').css('display', 'inline-block');
        }

        if (searchOption.userLangs != null && searchOption.userLangs.length != 0) {
            var texts = getSelectTexts($dropdownSearchOptionUsers.find("[name=userLangs]"), searchOption.userLangs);
            $('#searchCondition [name=userLangs]').text(texts.join(', '));
            $('#searchCondition [name=userLangs]').parent().show();
            $('#searchCondition').css('display', 'inline-block');
        }

        if (searchOption.fromExpireDateTime != null && searchOption.fromExpireDateTime != "") {
            $('#searchCondition [name=fromExpireDateTime]').text(moment(new Date(searchOption.fromExpireDateTime)).format('YYYY-MM-DD HH:mm'));
            $('#searchCondition [name=fromExpireDateTime]').parent().show();
            $('#searchCondition').css('display', 'inline-block');
        }

        if (searchOption.toExpireDateTime != null && searchOption.toExpiredDateTime != "") {
            $('#searchCondition [name=toExpireDateTime]').text(moment(new Date(searchOption.toExpireDateTime)).format('YYYY-MM-DD HH:mm'));
            $('#searchCondition [name=toExpireDateTime]').parent().show();
            $('#searchCondition').css('display', 'inline-block');
        }

        if (searchOption.userAuthorityIds != null && searchOption.userAuthorityIds.length != 0) {
            var texts = getSelectTexts($dropdownSearchOptionUsers.find("[name=userAuthorityIds]"), searchOption.userAuthorityIds);
            $('#searchCondition [name=userAuthorityIds]').text(texts.join(', '));
            $('#searchCondition [name=userAuthorityIds]').parent().show();
            $('#searchCondition').css('display', 'inline-block');
        }

        if (searchOption.userGroupIds != null && searchOption.userGroupIds.length != 0) {
            var texts = getSelectTexts($dropdownSearchOptionUsers.find("[name=userGroupIds]"), searchOption.userGroupIds);
            $('#searchCondition [name=userGroupIds]').text(texts.join(', '));
            $('#searchCondition [name=userGroupIds]').parent().show();
            $('#searchCondition').css('display', 'inline-block');
        }

        if (searchOption.authServerIds != null && searchOption.authServerIds.length != 0) {
            var texts = getSelectTexts($dropdownSearchOptionUsers.find("[name=authServerIds]"), searchOption.authServerIds);
            $('#searchCondition [name=authServerIds]').text(texts.join(', '));
            $('#searchCondition [name=authServerIds]').parent().show();
            $('#searchCondition').css('display', 'inline-block');
        }

        if (searchOption.useYns != null && searchOption.useYns.length != 0) {
            var texts = getSelectTexts($dropdownSearchOptionUsers.find("[name=useYns]"), searchOption.useYns);
            $('#searchCondition [name=useYns]').text(texts.join(', '));
            $('#searchCondition [name=useYns]').parent().show();
            $('#searchCondition').css('display', 'inline-block');
        }
    }

    // Dropdown 닫기 방지 : common.js
    stopHideDropDown($dropdownSearchOptionUsers);


    /***************************************************************************
     * 테이블 버튼
     **************************************************************************/
    // 내보내기
    $buttonGroupDataTableUsers.find('[name=btnExportCsv]').on('click', function(e) {
        var requestBody = {};
        requestBody.searchOption = {};
        var selectedIds = $dataTableUsers.getSelectedIds('userId');
        if ($dataTableUsers.isAllSelected()) {
            requestBody.searchOption = searchOption;
        } else if (selectedIds.length > 0) {
            requestBody.searchOption.userIds = selectedIds
        } else {
            // 전체 선택이 아니면서, 선택된 ID가 없는 경우는
            // 선택 안함으로 판단함.
            // (데이터가 없을 경우는 버튼 자체가 비활성화됨.)
            requestBody.searchOption = searchOption;
        }

        $.ajaxRest({
            url : "/api/1/users/export/csv",
            type : "POST",
            data : requestBody,
            error : function(hdr, status) {
                errorMsgHandler.swal(hdr.responseText);
            }
        });
    });

    // 일괄 수정
    $buttonGroupDataTableUsers.find('[name=btnModalBatchModify]').on('click', function(e) {
        var selectedIds = $dataTableUsers.getSelectedIds('userId');
        if (selectedIds.length == 0) {
            swal(messageController.get('400025'));
            return;
        } else if (selectedIds.length == 1) {
            openModalModifyUser(selectedIds[0]);
        } else {
            //$modalBatchModifyUser.modal('show');
            openModalBatchModifyUser();
        }
    });

    // 일괄 삭제
    $buttonGroupDataTableUsers.find('[name=btnDeleteBatch]').on('click', function() {
        var selectedIds = $dataTableUsers.getSelectedIds('userId');
        if (selectedIds.length == 0) {
            swal(messageController.get('400025'));
            return;
        }

        var requestBody = {};
        if($dataTableUsers.isAllSelected()) {
            requestBody.searchOption = searchOption;
        } else {
            requestBody.ids = selectedIds;
        }

        swalDelete({
            url: "/api/1/users",
            dataTable: $dataTableUsers,
            requestBody: requestBody
        });
    });

    /***************************************************************************
     * 테이블 표시
     **************************************************************************/
    var $dataTableUsers = $("#dataTableUsers").dataTableController({
        url : "/api/1/users",
        searchOption : searchOption,
        buttonGroupId: "buttonGroupDataTableUsers",
        order : [ [ 2, 'asc' ] ],
        columnDefs: [{
            targets:   0,
            orderable: false,
            className: 'select-checkbox',
            defaultContent: ""
        }, {
            targets: 1, // 사용자 ID
            data: "userId"
        }, {
            targets: 2, // 사용자 이름
            data: "userName"
        }, {
            targets: 3, // 이메일
            data: 'email'
        }, {
            targets: 4, // 언어
            data: 'userLang',
            render: function(data, type, row) {
                if(data == null || data.length == 0) {
                    return '-';
                }
                return messageController.get("item.user.lang." + data);
            }
        }, {
            targets: 5, // 권한
            data: "userAuthority",
            sortKey: "userAuthorityName",
            render: function(data, type, row) {
                return data.userAuthorityName;
            }
        }, {
            targets: 6, // 만료일
            data: "expireDateTime",
            className: 'dt-head-center',
            render: function(data, type, row) {
                if(data == null) {
                    return '-';
                }
                return momentController.timestampFormat(data, 'YYYY-MM-DD HH:mm');
            }
        }, {
            targets: 7, // 사용자 그룹
            data: "userGroupName",
            render: function(data, type, row) {
                if(data == null) {
                    return '-';
                }
                var text = null;
                if(row.userGroupCount > 1) {
                    text = messageController.get("label.item.etc", data.escapeHTML(), row.userGroupCount);
                } else {
                    text = data.escapeHTML();
                }
                return '<div title="' + text + '">' + text + '</div>';
            }
        }, {
            targets: 8, // 인증 공급자
            data: "authServerId",
            sortKey: "authServerName",
            render: function(data, type, row) {
                if(data == null) {
                    return messageController.get("label.internal");
                }
                return row.authServer.authServerName;
            }
        }, {
            targets: 9, // 최근 수정일
            data: "updateDateTime",
            className: 'dt-head-center',
            render: function(data, type, row) {
                if(data == null) {
                    return '-';
                }
                return momentController.timestampFormat(data, 'YYYY-MM-DD HH:mm:ss');
            }
        }, {
            targets: 10, // 설명
            visible: false,
            data: "userComment",
            render: function(data, type, row) {
                if (data == null) {
                    return '';
                }
                var text = data.escapeHTML();
                return '<div title="' + text + '" data-toggle="tooltip" data-container="body" class="ellipsis" style="width: 200px">' + text + '</div>';
            }
        }, {
            targets: 11, // 상태
            data: "useYn",
            className: "extend-button dt-head-center",
            render: function(data, type, row, meta) {
                return '<input name="useYn" type="checkbox"/>';
            }
        }, {
            targets: 12,
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

            // 상태
            var $useYn = $row.find("[name=useYn]");
            $useYn.bootstrapToggle({
                on : messageController.get('label.on'),
                off : messageController.get('label.off'),
                size : "mini",
                onstyle : "warning",
                offstyle : "default",
                width : "70px"
            });
            if (data.useYn == "Y") {
                $useYn.bootstrapToggle('on');
            } else {
                $useYn.bootstrapToggle('off');
            }
            var fnUseYn = function(e) {
                var requestBody = {};
                requestBody.useYn = $(this).is(":checked") ? "Y" : "N";
                requestBody.userName = data.userName;

                $.ajaxRest({
                    url : "/api/1/users/" + data.userId + "/useYn",
                    type : "PUT",
                    data : requestBody,
                    block : true,
                    success : function(data, textStatus, jqXHR) {
                        $.toastGreen({
                            text: messageController.get("label.user") + ' ' + data.userName + ' ' + messageController.get("label.has.been.modified")
                        });
                    } ,
                    error : function(hdr, status) {
                        $useYn.off("change");
                        if (requestBody.useYn == "Y") {
                            $useYn.bootstrapToggle('off');
                        } else {
                            $useYn.bootstrapToggle('on');
                        }
                        $useYn.on("change", fnUseYn);

                        errorMsgHandler.swal(hdr.responseText);
                    }
                });
            }

            $useYn.on("change", fnUseYn);

            // 사용자 정보&수정 모달 열기
            $row.on('click', function(e) {
                if(e.target.className.indexOf('select-checkbox') == -1
                    && e.target.className.indexOf('extend-button') == -1
                    && e.target.className.indexOf('material-icons') == -1
                    && e.target.className.indexOf('btn') == -1) {
                    openModalModifyUser(data.userId);
                    e.stopPropagation();
                }
            });

            // 수정
            $row.find("[data-name=btnModify]").on("click", function(e) {
                openModalModifyUser(data.userId);
                e.stopPropagation();
            });

            // 삭제
            $row.find("[data-name=btnDelete]").on("click", function(e) {
                swalDelete({
                    url: "/api/1/users/" + encodeURIComponent(data.userId),
                    dataTable: $dataTableUsers
                });

                e.stopPropagation();
            });
        }
    });

    // 데이터 테이블의 선택/선택해제 이벤트 리스너.
    $dataTableUsers.DataTable().on('select', function(e, dt, type, indexes) {
        changeButtonText();
    }).on('deselect', function ( e, dt, type, indexes ) {
        changeButtonText();
    });

    /**
     * 2개 이상의 ROW가 선택된 경우, 일괄삭제, 일괄수정으로 텍스트 변경.
     * 1개 이하의 ROW가 선택된 경우, 삭제, 수정으로 텍스트 변경.
     */
    function changeButtonText() {
        if($dataTableUsers.getSelectedIds().length > 1) {
            $buttonGroupDataTableUsers.find('[name=btnDeleteBatch]').find('.btn-name').text(messageController.get("label.batch.delete"));
            $buttonGroupDataTableUsers.find('[name=btnModalBatchModify]').find('.btn-name').text(messageController.get("label.batch.modify"));
        } else {
            $buttonGroupDataTableUsers.find('[name=btnDeleteBatch]').find('.btn-name').text(messageController.get("label.delete"));
            $buttonGroupDataTableUsers.find('[name=btnModalBatchModify]').find('.btn-name').text(messageController.get("label.modify"));
        }
    }

    /***************************************************************************
     * 추가 모달
     **************************************************************************/
    // 모달창 클리어
    function clearModalAddUser() {
        $modalAddUser.find('[name=userId]').val("");
        $modalAddUser.find('[name=password1]').val("");
        $modalAddUser.find('[name=password2]').val("");
        $modalAddUser.find('[name=userName]').val("");
        $modalAddUser.find('[name=userLang]').val(personalDisplayUserLang).trigger('change');
        $modalAddUser.find('[name=email]').val("");
        $modalAddUser.find('[name=userAuthorityId]').val("").trigger('change');
        $modalAddUser.find('[name=expireDateTime]').val(""),
        $modalAddUser.find('[name=expireDateTime]').daterangepickerController().setDate(moment());
        $modalAddUser.find('[name=userGroupIds]').val("");
        $modalAddUser.find("[name=authServerId]").val(0);
        $modalAddUser.find('[name=userComment]').val("");
        $modalAddUser.find("[name=useYn]").bootstrapToggle('on');
    }

    // 추가 계속
    $modalAddUser.find('[name=btnAddContinue]').on('click', function(e) {
        addUser(true);
    });

    // Alt+W 저장하고 계속 이벤트
    $modalAddUser.on('keydown', function(key) {
        if ((event.which === 87 && event.altKey)) {
            addUser(true);
        }
    });

    // 추가
    $modalAddUser.find('[name=btnAdd]').on('click', function() {
        addUser(false);
    });

    function addUser(saveContinueMode) {

        var requestBody = {};
        requestBody.userId = $modalAddUser.find('[name=userId]').val();
        requestBody.password1 = $modalAddUser.find('[name=password1]').val();
        requestBody.password2 = $modalAddUser.find('[name=password2]').val();
        requestBody.userName = $modalAddUser.find('[name=userName]').val();
        requestBody.userLang = $modalAddUser.find('[name=userLang]').val();
        requestBody.email = $modalAddUser.find('[name=email]').val();
        requestBody.userAuthorityId = $modalAddUser.find('[name=userAuthorityId]').val();
        if ($.trim($modalAddUser.find('[name=expireDateTime]').val()) != '') {
            requestBody.expireDateTime = $modalAddUser.find('[name=expireDateTime]').data('daterangepicker').startDate._d;
        } else {
            requestBody.expireDateTime = 0;
        }
        requestBody.userGroupIds = $modalAddUser.find('[name=userGroupIds]').val();
        requestBody.authServerId = $modalAddUser.find("[name=authServerId]").val();
        requestBody.userComment = $modalAddUser.find('[name=userComment]').val();
        requestBody.useYn = $modalAddUser.find("[name=useYn]").prop('checked') ? "Y" : "N";

        $.ajaxRest({
            url: "/api/1/users/0",
            type: "POST",
            data: requestBody,
            block: true,
            beforeSend: function(xhr, settings) {
                errorMsgHandler.clear($modalAddUser);
            },
            success: function (data, textStatus, jqXHR) {
                if(saveContinueMode) {
                    $modalAddUser.find('[name=userId]').val('');
                    $modalAddUser.find('[name=userName]').val('');
                    $modalAddUser.find('[name=userId]').focus();
                } else {
                    $modalAddUser.modal('hide');
                    clearModalAddUser();
                }
                $dataTableUsers.draw();

                $.toastGreen({
                    text: messageController.get("label.user") + ' ' + data.userName + ' ' + messageController.get("label.has.been.added")
                });
            },
            error: function(hdr, status) {
                errorMsgHandler.show($modalAddUser, hdr.responseText);
            }
        });
    }

    /***************************************************************************
     * 수정 모달
     **************************************************************************/
    function openModalModifyUser(userId) {

        $modalModifyUser.find('[name=password1]').val('').trigger('change');
        $modalModifyUser.find('[name=password2]').val('').trigger('change');

        $.ajaxRest({
            url: "/api/1/users/" + encodeURIComponent(userId),
            type: "GET",
            beforeSend: function(xhr, settings) {
                errorMsgHandler.clear($modalModifyUser);
            },
            success: function(data, textStatus, header) {
                $modalModifyUser.find("[name=userId]").val(data.userId);
                $modalModifyUser.find("#txtUserId").text(data.userId);
                $modalModifyUser.find('[name=userName]').val(data.userName);
                $modalModifyUser.find('[name=userLang]').val(data.userLang).trigger('change');
                $modalModifyUser.find('[name=email]').val(data.email);
                $modalModifyUser.find('[name=userAuthorityId]').val(data.userAuthorityId).trigger('change');
                $modalModifyUser.find('[name=expireDateTime]').val(momentController.timestampFormat(data.expireDateTime, "YYYY-MM-DD HH:mm"));
                $modalModifyUser.find('[name=expireDateTime]').daterangepickerController().setDate(data.expireDateTime, 'YYYY-MM-DD HH:mm');
                $modalModifyUser.find('[name=userGroupIds]').val(data.userGroupIds).trigger('change');
                $modalModifyUser.find("[name=authServerId]").val(data.authServerId == null ? 0 : data.authServerId).trigger('change');
                $modalModifyUser.find('[name=userComment]').val(data.userComment);
                var $toggleBtn = $modalModifyUser.find("[name=useYn]");
                if (data.useYn == "Y") {
                    $toggleBtn.bootstrapToggle('on');
                } else {
                    $toggleBtn.bootstrapToggle('off');
                }

                $modalModifyUser.modal('show');
            }
        });
    }

    // 사용자 삭제
    $modalModifyUser.find('[name=btnDelete]').on('click', function() {
        var userId = $modalModifyUser.find('[name=userId]').val();
        swalDelete({
            url: "/api/1/users/" + encodeURIComponent(userId),
            dataTable: $dataTableUsers
        });
    });

    // 사용자 수정
    $modalModifyUser.find('[name=btnModify]').on('click', function() {

         var requestBody = {};
         requestBody.userId = $modalModifyUser.find('[name=userId]').val();
         requestBody.password1 = $modalModifyUser.find('[name=password1]').val();
         requestBody.password2 = $modalModifyUser.find('[name=password2]').val();
         requestBody.userName = $modalModifyUser.find('[name=userName]').val();
         requestBody.userLang = $modalModifyUser.find('[name=userLang]').val();
         requestBody.email = $modalModifyUser.find('[name=email]').val();
         requestBody.userAuthorityId = $modalModifyUser.find('[name=userAuthorityId]').val();
         if ($.trim($modalModifyUser.find('[name=expireDateTime]').val()) != '') {
             requestBody.expireDateTime = $modalModifyUser.find('[name=expireDateTime]').data('daterangepicker').startDate._d;
         } else {
             requestBody.expireDateTime = 0;
         }
         requestBody.userGroupIds = $modalModifyUser.find('[name=userGroupIds]').val();
         requestBody.authServerId = $modalModifyUser.find("[name=authServerId]").val();
         requestBody.userComment = $modalModifyUser.find('[name=userComment]').val();
         requestBody.useYn = $modalModifyUser.find("[name=useYn]").prop('checked') ? "Y" : "N";

         if(requestBody.userGroupIds == null)
             requestBody.userGroupIds = [];

         $.ajaxRest({
             url: "/api/1/users/" + encodeURIComponent(requestBody.userId),
             type: "PUT",
             data: requestBody,
             block: true,
             beforeSend: function(xhr, settings) {
                 errorMsgHandler.clear($modalModifyUser);
             },
             success: function (data, textStatus, jqXHR) {
                 $modalModifyUser.modal('hide');
                 $dataTableUsers.draw();

                 if (data.userId == sessionUserController.getUser().userId) {
                     sessionUserController.reload();
                     $("#topUserName").text(data.userName);
                 }

                 $.toastGreen({
                     text: messageController.get("label.user") + ' ' + data.userName + ' ' + messageController.get("label.has.been.modified")
                 });
             },
             error: function(hdr, status) {
                 errorMsgHandler.show($modalModifyUser, hdr.responseText);
             }
         });
    });

    /***************************************************************************
     * 일괄 수정 모달
     **************************************************************************/
    function openModalBatchModifyUser() {
        // 에러 메세지 제거
        errorMsgHandler.clear($modalBatchModifyUser);

        // 일괄 수정 : 체크 박스
        $modalBatchModifyUser.find(".checkbox input[type=checkbox]").prop('checked', false);

        $modalBatchModifyUser.find('[name=password1]').val("");
        $modalBatchModifyUser.find('[name=password2]').val("");
        $modalBatchModifyUser.find('[name=userLang]').val("").trigger('change');
        $modalBatchModifyUser.find('[name=userAuthorityId]').val("").trigger('change');
        $modalBatchModifyUser.find('[name=expireDateTime]').val("");
        $modalBatchModifyUser.find('[name=userGroupIds]').val("").trigger('change');
        $modalBatchModifyUser.find('[name=authServerId]').val("").trigger('change');
        $modalBatchModifyUser.find('[name=useYn]').bootstrapToggle('off');

        $modalBatchModifyUser.modal('show');
    }

    // 일괄수정 실행
    $modalBatchModifyUser.find('[name=btnBatchModify]').on('click', function() {
        // 체크된 항목이 있는지 확인
        if ($modalBatchModifyUser.find('input[type=checkbox]:checked').length == 0) {
            swal(messageController.get('400025'));
            return false;
        }

        var requestBody = {};

        // ids 체크
        var selectedIds = $dataTableUsers.getSelectedIds('userId');
        if (typeof (selectedIds) == 'undefined' || selectedIds.constructor != Array) {
            return;
        }

        if($dataTableUsers.isAllSelected()) {
            requestBody.searchOption = searchOption;
        } else {
            requestBody.ids = selectedIds
        }

        requestBody.data = {};
        if ($modalBatchModifyUser.find('[name=chkPassword]').prop('checked')) {
            requestBody.data.password1 = $modalBatchModifyUser.find('[name=password1]').val();
            requestBody.data.password2 = $modalBatchModifyUser.find('[name=password2]').val();
        }
        if ($modalBatchModifyUser.find('[name=chkUserLang]').prop('checked')) {
            requestBody.data.userLang = $modalBatchModifyUser.find('[name=userLang]').val();
        }
        if ($modalBatchModifyUser.find('[name=chkUserAuthority]').prop('checked')) {
            requestBody.data.userAuthorityId = $modalBatchModifyUser.find('[name=userAuthorityId]').val();
        }
        if ($modalBatchModifyUser.find('[name=chkExpireDateTime]').prop('checked')) {
            requestBody.data.expireDateTime = $modalBatchModifyUser.find('[name=expireDateTime]').data('daterangepicker').startDate._d
        }
        if ($modalBatchModifyUser.find('[name=chkUserGroupIds]').prop('checked')) {
            requestBody.data.userGroupIds = $modalBatchModifyUser.find('[name=userGroupIds]').val();
            if(requestBody.data.userGroupIds == null)
                requestBody.data.useruserGroupIds = [];
        }
        if ($modalBatchModifyUser.find('[name=chkAuthServerId]').prop('checked')) {
            requestBody.data.authServerId = $modalBatchModifyUser.find('[name=authServerId]').val();
        }
        if ($modalBatchModifyUser.find('[name=chkUseYn]').prop('checked')) {
            requestBody.data.useYn = $modalBatchModifyUser.find('[name=useYn]').prop('checked') ? "Y" : "N";
        }

        $.ajaxRest({
            url: "/api/1/users",
            type: "PUT",
            data: requestBody,
            block: true,
            beforeSend: function(xhr, settings) {
                errorMsgHandler.clear($modalBatchModifyUser);
            },
            success: function (data, textStatus, jqXHR) {
                $modalBatchModifyUser.modal('hide');
                $dataTableUsers.draw();

                $.toastGreen({
                    text: messageController.get("label.has.been.modified")
                });
            },
            error: function(hdr, status) {
                errorMsgHandler.show($modalBatchModifyUser, hdr.responseText);
            }
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