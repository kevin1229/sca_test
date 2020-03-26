$(function() {

    /***************************************************************************
     * 변수
     ***************************************************************************/
    SearchOption = function() {
        this.userGroupName = null;
        this.userIds = [];
    };
    SearchOption.prototype = {
        clear: function() {
            this.userGroupName = null;
            this.userIds = [];
        }
    };
    var searchOption = new SearchOption();

    var $dropdownSearchOptionUserGroup = $("#dropdownSearchOptionUserGroup");
    var $buttonGroupDataTableUserGroups = $("#buttonGroupDataTableUserGroups");
    var $modalAddUserGroup = $('#modalAddUserGroup');
    var $modalModifyUserGroup = $('#modalModifyUserGroup');
    var $modalBatchModifyUserGroup = $('#modalBatchModifyUserGroup');

    /***************************************************************************
     * 컨포넌트
     ***************************************************************************/
    $dropdownSearchOptionUserGroup.find('[name=userIds]').select2Controller({ multiple:true, url:"/api/1/users/items"});
    $modalAddUserGroup.find('[name=userIds]').select2Controller({ multiple:true, url:"/api/1/users/items"});
    $modalModifyUserGroup.find('[name=userIds]').select2Controller({ multiple:true, url:"/api/1/users/items"});
    $modalBatchModifyUserGroup.find('[name=userIds]').select2Controller({ multiple:true, url:"/api/1/users/items"});

    /***************************************************************************
     * 검색
     ***************************************************************************/
    $dropdownSearchOptionUserGroup.find('[name=txtSearchShort]').on('keydown', function(e) {
        var code = e.keyCode || e.which;
        if (code == 13) { // ENTER
            searchShort();
        }
    });

    // 돋보기
    $dropdownSearchOptionUserGroup.find('[name=btnSearchShort]').on('click', function(e) {
        searchShort();
    });

    function searchShort() {
        searchOption.clear();
        searchOption.userGroupName = $dropdownSearchOptionUserGroup.find('[name=txtSearchShort]').val();

        clearSearchOption();
        showSearchCondition();

        $dataTableUserGroups.draw();
    }

    // 상세 검색:검색
    $dropdownSearchOptionUserGroup.find('[name=btnSearch]').on('click', function(e) {
        searchOption.clear();
        searchOption.userGroupName = $dropdownSearchOptionUserGroup.find("[name=userGroupName]").val();
        searchOption.userIds = $dropdownSearchOptionUserGroup.find("[name=userIds]").val();

        $dataTableUserGroups.draw();

        showSearchCondition();

        $dropdownSearchOptionUserGroup.find('[name=txtSearchShort]').val("");
        $dropdownSearchOptionUserGroup.removeClass('open');
    });

    $dropdownSearchOptionUserGroup.find('[name=btnClear]').on('click', function(e) {
        clearSearchOption();
    });

    function clearSearchOption() {
        $dropdownSearchOptionUserGroup.find('[name=txtSearchUserGroupName]').val("");
        $dropdownSearchOptionUserGroup.find("[name=userGroupName]").val("");
        $dropdownSearchOptionUserGroup.find("[name=userIds]").val("").trigger('change');
    }

    // 현재 검색 기준
    function showSearchCondition() {
        $('#searchCondition').hide();
        $('#searchCondition .searchConditionHead').hide();
        $('#searchCondition .searchCondition').text('');

        // 아이디
        if (searchOption.userGroupName != null && searchOption.userGroupName != "") {
            $('#searchCondition [name=userGroupName]').text(searchOption.userGroupName);
            $('#searchCondition [name=userGroupName]').parent().show();
            $('#searchCondition').css('display', 'inline-block');
        }

        // 사용자 아이디
        if (searchOption.userIds != null && searchOption.userIds.length != 0) {
            var texts = getSelectTexts($dropdownSearchOptionUserGroup.find("[name=userIds]"), searchOption.userIds);
            $('#searchCondition [name=userIds]').text(texts.join(', '));
            $('#searchCondition [name=userIds]').parent().show();
            $('#searchCondition').css('display', 'inline-block');
        }
    }

    // Dropdown 닫기 방지 : common.js
    stopHideDropDown($dropdownSearchOptionUserGroup);

    /***************************************************************************
     * 테이블 버튼
     **************************************************************************/
    // csv 내보내기
    $buttonGroupDataTableUserGroups.find('[name=btnExportCsv]').on('click', function(e) {
        var requestBody = {};
        requestBody.searchOption = {};

        var selectedIds = $dataTableUserGroups.getSelectedIds('userGroupId');
        if( $dataTableUserGroups.isAllSelected() ) {
            requestBody.searchOption = searchOption;
        } else if(selectedIds.length > 0) {
            requestBody.searchOption.userGroupIds = selectedIds
        } else {
            // 전체 선택이 아니면서, 선택된 ID가 없는 경우는
            // 선택 안함으로 판단함.
            // (데이터가 없을 경우는 버튼 자체가 비활성화됨.)
            requestBody.searchOption = searchOption;
        }

        $.ajaxRest({
            url: "/api/1/userGroups/export/csv",
            type: "POST",
            block: true,
            data: requestBody,
            error: function(hdr, status) {
                errorMsgHandler.swal(hdr.responseText);
            }
        });
    });

    // 수정
    $buttonGroupDataTableUserGroups.find('[name=btnModalBatchModify]').on('click', function(e) {
        var selectedIds = $dataTableUserGroups.getSelectedIds('userGroupId');
        if (selectedIds.length == 0) {
            swal(messageController.get('400025'));
        } else if (selectedIds.length == 1) {
            openModalModifyUserGroup(selectedIds[0]);
        } else {
            $modalBatchModifyUserGroup.modal('show');
        }
    });

    // 삭제
    $buttonGroupDataTableUserGroups.find('[name=btnDeleteBatch]').on('click', function(e) {
        var selectedIds = $dataTableUserGroups.getSelectedIds('userGroupId');
        if (selectedIds.length == 0) {
            swal(messageController.get('400025'));
            return;
        }

        var requestBody = {};
        if($dataTableUserGroups.isAllSelected()) {
            requestBody.searchOption = searchOption;
        } else {
            requestBody.ids = selectedIds;
        }

        swalDelete({
            url: "/api/1/userGroups",
            dataTable: $dataTableUserGroups,
            requestBody: requestBody
        });
    });

    /***************************************************************************
     * 테이블 표시
     **************************************************************************/
    var $dataTableUserGroups = $("#dataTableUserGroups").dataTableController({
        url: "/api/1/userGroups",
        searchOption: searchOption,
        buttonGroupId: "buttonGroupDataTableUserGroups",
        order: [ [ 2, 'asc' ] ],
        columnDefs: [{
            targets : 0,
            orderable : false,
            className : 'select-checkbox',
            defaultContent : ""
        }, {
            targets : 1,
            visible: false,
            data : "userGroupId"
        }, {
            targets : 2,
            data : "userGroupName",
            sortKey : "userGroupName",
            render : function(data, type, row) {
                var text = data.escapeHTML();
                return '<span data-toggle="tooltip" data-container="body" data-placement="top" title="' + text + '">' + text + '</span>'
            }
        }, {
            targets : 3,
            data : "userCount",
            className : 'dt-head-right',
            render : function(data, type, row) {
                if(row.userGroupId == 0)
                    return messageController.get("label.all.users");
                if (data == null)
                    return 0;
                return data;
            }
        }, {
            targets: 4, // 최근 수정일
            data: "updateDateTime",
            className: 'dt-head-center',
            render: function(data, type, row) {
                if(data == null)
                    return '-';
                return momentController.timestampFormat(data, 'YYYY-MM-DD HH:mm:ss');
            }
        }, {
            targets: 5,     // 수정 삭제 버튼
            orderable: false,
            className: "extend-button",
            width: "70px",
            render: function(data, type, row) {
                var html = '<span data-name="btnModify" class="btn-modify" style="margin-right:10px;"><i class="fa fa-pencil-square-o active-hover" aria-hidden="true"></i></span>';
                if(row.userGroupId != 0) {
                    html += '<span data-name="btnDelete" class="btn-delete" style="margin-right:10px;"><i class="fa fa-trash active-hover" aria-hidden="true"></i></span>';
                }
                return html;
            }
        }],
        createdRow: function(row, data, index) {

            var $row = $(row);

            // 사용자 그룹 정보 & 수정 실행
            $row.on('click', function(e) {
                if(e.target.className.indexOf('select-checkbox') == -1
                    && e.target.className.indexOf('extend-button') == -1
                    && e.target.className.indexOf('material-icons') == -1
                    && e.target.className.indexOf('btn') == -1) {
                    openModalModifyUserGroup(data.userGroupId);
                    e.stopPropagation();
                }
            });

            // 수정
            $row.find("[data-name=btnModify]").on("click", function(e) {
                openModalModifyUserGroup(data.userGroupId);
                e.stopPropagation();
            });

            // 삭제
            $row.find("[data-name=btnDelete]").on('click', function(e) {
                swalDelete({
                    url: "/api/1/userGroups/" + data.userGroupId,
                    dataTable: $dataTableUserGroups
                });
                e.stopPropagation();
            });

        },
        buttons: []
    });

    // 데이터 테이블의 선택/선택해제 이벤트 리스너.
    $dataTableUserGroups.DataTable().on('select', function(e, dt, type, indexes) {
        changeButtonText();
    }).on('deselect', function(e, dt, type, indexes) {
        changeButtonText();
    });

    /**
     * 2개 이상의 ROW가 선택된 경우, 일괄삭제, 일괄수정으로 텍스트 변경.
     * 1개 이하의 ROW가 선택된 경우, 삭제, 수정으로 텍스트 변경.
     */
    function changeButtonText() {
        if($dataTableUserGroups.getSelectedIds().length > 1) {
            $('#btnDeleteBatchUserGroup').find('.btn-name').text(messageController.get("label.batch.delete"));
            $('#btnModalBatchModifyUserGroup').find('.btn-name').text(messageController.get("label.batch.modify"));
        } else {
            $('#btnDeleteBatchUserGroup').find('.btn-name').text(messageController.get("label.delete"));
            $('#btnModalBatchModifyUserGroup').find('.btn-name').text(messageController.get("label.modify"));
        }
    }

    /***************************************************************************
     * 추가 모달
     ***************************************************************************/
    // 추가
    $modalAddUserGroup.find("[name=btnAdd]").on('click', function(e) {
        addUserGroup(false);
    });

    // 추가 계속
    $modalAddUserGroup.find("[name=btnAddContinue]").on('click', function(e) {
        addUserGroup(true);
    });

    // Alt+W 저장하고 계속 이벤트
    $modalAddUserGroup.on('keydown', function(key) {
        if ((event.which === 87 && event.altKey)) {
            addUserGroup(true);
        }
    });

    function addUserGroup(saveContinueMode) {

        var requestBody = {};
        requestBody.userGroupName = $modalAddUserGroup.find('[name=userGroupName]').val();
        requestBody.userIds = $modalAddUserGroup.find('[name="userIds"]').val();

        $.ajaxRest({
            url: "/api/1/userGroups/0",
            type: "POST",
            data: requestBody,
            block: true,
            beforeSend: function(xhr, settings) {
                errorMsgHandler.clear($modalAddUserGroup);
            },
            success: function(data, textStatus, jqXHR) {

                $modalAddUserGroup.find('[name=userGroupName]').val('');

                if(saveContinueMode == false) {
                    $modalAddUserGroup.find('[name=userIds]').val("").trigger('change');
                    $modalAddUserGroup.modal('hide');
                }
                $dataTableUserGroups.draw();
                $.toastGreen({
                    text: messageController.get("label.user.group") + ' ' + requestBody.userGroupName + ' ' + messageController.get("label.has.been.added")
                });
            },
            error: function(hdr, status) {
                errorMsgHandler.show($modalAddUserGroup, hdr.responseText);
            }
        });
    }

    /***************************************************************************
     * 수정 모달
     ***************************************************************************/
    function openModalModifyUserGroup(userGroupId) {
        $.ajaxRest({
            url: "/api/1/userGroups/" + userGroupId,
            type: "GET",
            success: function(data, textStatus, header) {

                $modalModifyUserGroup.find("[name=userGroupId]").val(data.userGroupId);
                $modalModifyUserGroup.find("#txtUserGroupId").text(data.userGroupId);
                $modalModifyUserGroup.find('[name=userGroupName]').val(data.userGroupName);

                $modalModifyUserGroup.find('[name="userIds"]').empty();
                if (data.users != null && data.users.length > 0) {
                    for (var i in data.users) {
                        var newOption = new Option(data.users[i].userName, data.users[i].userId, true, true);
                        $modalModifyUserGroup.find('[name="userIds"]').append(newOption).trigger('change');
                   }
                   $modalModifyUserGroup.find('[name="userIds"]').trigger({
                       type: 'select2:select',
                       params: {
                           data: data.userIds
                       }
                   });
                }

                if (data.userGroupId == 0) {
                    $modalModifyUserGroup.find('[name=btnDelete]').hide();
                    $modalModifyUserGroup.find('[name=userIds]').parent().hide();
                    $modalModifyUserGroup.find('[data-name=allUsers]').show();
                } else {
                    $modalModifyUserGroup.find('[name=btnDelete]').show();
                    $modalModifyUserGroup.find('[name=userIds]').parent().show();
                    $modalModifyUserGroup.find('[data-name=allUsers]').hide();
                }

                $modalModifyUserGroup.modal('show');
            }
        });
    }

    // 사용자 그룹 삭제 이벤트.
    $modalModifyUserGroup.find("[name=btnDelete]").on('click', function(e) {
        swalDelete({
            url: "/api/1/userGroups/" + $modalModifyUserGroup.find("[name=userGroupId]").val(),
            dataTable: $dataTableUserGroups
        });
    });

    // 그룹 정보 & 그룹 수정 레이아웃
    $modalModifyUserGroup.find("[name=btnModify]").on('click', function(e) {

        var requestBody = {};
        requestBody.userGroupId = $modalModifyUserGroup.find('[name=userGroupId]').val();
        requestBody.userGroupName = $modalModifyUserGroup.find('[name=userGroupName]').val();
        requestBody.userIds = $modalModifyUserGroup.find('[name="userIds"]').val();

        $.ajaxRest({
            url: "/api/1/userGroups/" + requestBody.userGroupId,
            type: "PUT",
            data: requestBody,
            block: true,
            beforeSend : function(xhr, settings) {
                errorMsgHandler.clear($modalModifyUserGroup);
            },
            success : function(data, textStatus, jqXHR) {
                $modalModifyUserGroup.modal('hide');
                $dataTableUserGroups.draw();
                $.toastGreen({
                    text: messageController.get("label.user.group") + ' ' + messageController.get("label.has.been.modified")
                });
            },
            error : function(hdr, status) {
                errorMsgHandler.show($modalModifyUserGroup, hdr.responseText);
            }
        });
    });

    /***************************************************************************
     * 일괄 수정 모달
     ***************************************************************************/
    $modalBatchModifyUserGroup.find("[name=btnBatchModify]").on('click', function(e) {

        var selectedIds = $dataTableUserGroups.getSelectedIds('userGroupId');
        var selectedMethod = $modalBatchModifyUserGroup.find('li.active a').data('requestMethod');
        var selectedUserIds = $modalBatchModifyUserGroup.find('.tab-content .tab-pane.active select[name=userIds]').val();

        var requestBody = {};
        if($dataTableUserGroups.isAllSelected()) {
            requestBody.searchOption = searchOption;
        } else {
            requestBody.ids = selectedIds
        }
        requestBody.method = selectedMethod;
        requestBody.data = {}
        requestBody.data.userIds = selectedUserIds

        $.ajaxRest({
            url: "/api/1/userGroups",
            type: "PUT",
            data: requestBody,
            block: true,
            beforeSend: function(xhr, settings) {
                errorMsgHandler.clear($modalBatchModifyUserGroup);
            },
            success: function(data, textStatus, jqXHR) {
                $modalBatchModifyUserGroup.modal('hide');
                $modalBatchModifyUserGroup.find("[name=userIds]").val("").trigger('change');
                $modalBatchModifyUserGroup.find(".nav-tabs a[data-request-method=ADD]").tab('show');
                $dataTableUserGroups.draw();
                $.toastGreen({
                    text: messageController.get("label.user.group") + ' ' + messageController.get("label.has.been.modified")
                });
            },
            error: function(hdr, status) {
                errorMsgHandler.show($modalBatchModifyUserGroup, hdr.responseText);
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

