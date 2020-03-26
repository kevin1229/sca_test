$(function() {

    /***************************************************************************
     * 변수
     **************************************************************************/
    SearchOption = function() {
        this.issueStatusGroupName = null;
        this.issueStatusGroupComment = null;
        this.projectIds = [];
        this.insertUserIds = [];
        this.updateUserIds = [];
        this.fromUpdateDateTime = null;
        this.toUpdateDateTime = null;
        this.sharingYns = [];
    };
    SearchOption.prototype = {
        clear : function() {
            this.issueStatusGroupName = null;
            this.issueStatusGroupComment = null;
            this.projectIds = [];
            this.insertUserIds = [];
            this.updateUserIds = [];
            this.fromUpdateDateTime = null;
            this.toUpdateDateTime = null;
            this.sharingYns = [];
        }
    };
    var searchOption = new SearchOption();

    var $dropdownSearchOptionIssueStatusGroup = $("#dropdownSearchOptionIssueStatusGroup");
    var $modalAddIssueStatusGroup = $("#modalAddIssueStatusGroup");
    var $modalModifyIssueStatusGroup = $("#modalModifyIssueStatusGroup");
    var $modalBatchModifyIssueStatusGroup = $("#modalBatchModifyIssueStatusGroup");

    /***************************************************************************
     * 컴포넌트
     **************************************************************************/
    // 사용 중인 프로젝트
    $.ajaxRest({
        url : "/api/1/projects/fancytree",
        type : "GET",
        success : function (data, textStatus, jqXHR) {
            $dropdownSearchOptionIssueStatusGroup.find('#searchOptionProjectTree').dropdownFancytreeController({ data : data });
            $modalAddIssueStatusGroup.find('#modalAddProjectTree').dropdownFancytreeController({
                data : data,
                fancytree : {
                    selectMode: 1,
                    checkbox: false
                }
            });
        }
    });
    // 공유 여부
    $dropdownSearchOptionIssueStatusGroup.find('[name=sharingYns]').select2Controller({
        multiple: true,
        data: [{
            id : 'Y',
            text : messageController.get('item.issue.status.group.sharing.Y')
        }, {
            id : 'N',
            text : messageController.get('item.issue.status.group.sharing.N')
        }]
    });

    /***************************************************************************
     * 검색
     **************************************************************************/
    // 엔터
    $dropdownSearchOptionIssueStatusGroup.find('[name=txtSearchShort]').on('keydown', function(e) {
        var code = e.keyCode || e.which;
        if (code == 13) { // ENTER
            searchShort();
        }
    });

    // 돋보기 버튼
    $dropdownSearchOptionIssueStatusGroup.find('[name=btnSearchShort]').on('click', function(e) {
        searchShort();
    });

    function searchShort() {
        searchOption.clear();
        searchOption.issueStatusGroupName = $dropdownSearchOptionIssueStatusGroup.find('[name=txtSearchShort]').val();

        clearSearchOption();
        showSearchCondition();

        $dataTableIssueStatusGroups.draw();
    }

    // 상세 검색:검색
    $dropdownSearchOptionIssueStatusGroup.find('[name=btnSearch]').on('click', function(e) {

        searchOption.clear();
        searchOption.issueStatusGroupName = $dropdownSearchOptionIssueStatusGroup.find("[name=issueStatusGroupName]").val();
        searchOption.issueStatusGroupComment = $dropdownSearchOptionIssueStatusGroup.find("[name=issueStatusGroupComment]").val();
        // 선택한 프로젝트 아이디
        var selNodes =  $('#searchOptionProjectTree').dropdownFancytreeController('getTree').getSelectedNodes();
        selNodes.forEach(function(node) {
            searchOption.projectIds.push(node.key);
        });
        searchOption.sharingYns = $dropdownSearchOptionIssueStatusGroup.find("[name=sharingYns]").val();

        $dataTableIssueStatusGroups.draw();

        showSearchCondition();

        $dropdownSearchOptionIssueStatusGroup.find('[name=txtSearchShort]').val("");
        $dropdownSearchOptionIssueStatusGroup.removeClass('open');
    });

    $dropdownSearchOptionIssueStatusGroup.find('[name=btnClear]').on('click', function(e) {
        clearSearchOption();
    });

    function clearSearchOption() {
        $dropdownSearchOptionIssueStatusGroup.find("[name=issueStatusGroupName]").val("");
        $dropdownSearchOptionIssueStatusGroup.find("[name=issueStatusGroupComment]").val("");
        $dropdownSearchOptionIssueStatusGroup.find('#searchOptionProjectTree').dropdownFancytreeController().clear();
        $dropdownSearchOptionIssueStatusGroup.find("[name=sharingYns]").val("").trigger('change');
    }

    function showSearchCondition() {

        $('#searchCondition').hide();
        $('#searchCondition .searchConditionHead').hide();
        $('#searchCondition .searchCondition').text('');

        if (searchOption == null) {
            return false;
        }

        if (searchOption.issueStatusGroupName != null && searchOption.issueStatusGroupName != "") {
            $('#searchCondition [name=issueStatusGroupName]').text(searchOption.issueStatusGroupName);
            $('#searchCondition [name=issueStatusGroupName]').parent().show();
            $('#searchCondition').css('display', 'inline-block');
        }

        if (searchOption.issueStatusGroupComment != null && searchOption.issueStatusGroupComment != "") {
            $('#searchCondition [name=issueStatusGroupComment]').text(searchOption.issueStatusGroupComment);
            $('#searchCondition [name=issueStatusGroupComment]').parent().show();
            $('#searchCondition').css('display', 'inline-block');
        }

        // 프로젝트 아이디
        if (searchOption.projectIds != null && searchOption.projectIds.length != 0) {
            var texts = [];
            $.each(searchOption.projectIds, function(index, value) {
                var node = $('#searchOptionProjectTree').dropdownFancytreeController('getTree').getNodeByKey(value);
                texts.push(node.title.unescapeHTML());
            });

            $('#searchCondition [name=projectIds]').text(texts.join(', '));
            $('#searchCondition [name=projectIds]').parent().show();
            $('#searchCondition').css('display', 'inline-block');
        }

        if (searchOption.insertUserIds != null && searchOption.insertUserIds.length != 0) {
            var texts = getSelectTexts($dropdownSearchOptionIssueStatusGroup.find("[name=insertUserIds]"), searchOption.insertUserIds);
            $('#searchCondition [name=insertUserIds]').text(texts.join(', '));
            $('#searchCondition [name=insertUserIds]').parent().show();
            $('#searchCondition').css('display', 'inline-block');
        }

        if (searchOption.updateUserIds != null && searchOption.updateUserIds.length != 0) {
            var texts = getSelectTexts($dropdownSearchOptionIssueStatusGroup.find("[name=updateUserIds]"), searchOption.updateUserIds);
            $('#searchCondition [name=updateUserIds]').text(texts.join(', '));
            $('#searchCondition [name=updateUserIds]').parent().show();
            $('#searchCondition').css('display', 'inline-block');
        }

        if (searchOption.fromUpdateDateTime != null && searchOption.fromUpdateDateTime != "") {
            $('#searchCondition [name=fromUpdateDateTime]').text(moment(new Date(searchOption.fromUpdateDateTime)).format('YYYY-MM-DD'));
            $('#searchCondition [name=fromUpdateDateTime]').parent().show();
            $('#searchCondition').css('display', 'inline-block');
        }

        if (searchOption.toUpdateDateTime != null && searchOption.toUpdateDateTime != "") {
            $('#searchCondition [name=toUpdateDateTime]').text(moment(new Date(searchOption.toUpdateDateTime)).format('YYYY-MM-DD'));
            $('#searchCondition [name=toUpdateDateTime]').parent().show();
            $('#searchCondition').css('display', 'inline-block');
        }

        if (searchOption.sharingYns != null && searchOption.sharingYns.length != 0) {
            var texts = getSelectTexts($dropdownSearchOptionIssueStatusGroup.find("[name=sharingYns]"), searchOption.sharingYns);
            $('#searchCondition [name=sharingYns]').text(texts.join(', '));
            $('#searchCondition [name=sharingYns]').parent().show();
            $('#searchCondition').css('display', 'inline-block');
        }
    }

    // Dropdown 닫기 방지 : common.js
    stopHideDropDown($dropdownSearchOptionIssueStatusGroup);

    /***************************************************************************
     * 테이블 표시
     **************************************************************************/
    var $dataTableIssueStatusGroups = $("#dataTableIssueStatusGroups").dataTableController({
        url : "/api/1/issues/status/groups",
        searchOption : searchOption,
        order : [ [ 2, 'asc' ] ],
        columnDefs: [{
            targets: 0, // ID
            orderable: true,
            visible: false,
            data: "issueStatusGroupId"
        }, {
            targets: 1, // 상태
            data: "sharingYn",
            render: function(data, type, row, meta) {
                var text = messageController.get("item.issue.status.group.sharing." + data);
                if (data != "N") {
                    return text;
                }
                if (row.ownerProject == null || row.ownerProject.projectKey == null || row.ownerProject.projectName == null) {
                    return "[ERROR]";
                }
                return '<span data-toggle="tooltip" data-container="body" data-html="true" title="'
                    + messageController.get('label.project.key') + " : " + row.ownerProject.projectKey.escapeHTML() + '">'
                    + text + " (" +  row.ownerProject.projectName.escapeHTML() + ")" + '</span>';
            }
        }, {
            targets: 2, // 이슈 공유 그룹명
            orderable: true,
            data: "issueStatusGroupName",
            render: function(data, type, row, meta) {
                if (row.sharingYn == "N") {
                    return '-';
                }
                return data.escapeHTML();
            }
        }, {
            targets: 3, // 설명
            data: "issueStatusGroupComment",
            render: function(data, type, row, meta) {
                if (data == null) {
                    return '';
                }
                var text = data.escapeHTML();
                return '<div title="' + text + '" data-toggle="tooltip" data-container="body" class="ellipsis" style="width: 300px">' + text + '</div>';
            }
        }, {
            targets: 4, // 사용중인 프로젝트
            data: "projectKey",
            render: function(data, type, row, meta) {
                if(data == null) {
                    return '-';
                }
                if(row.projectCount > 1) {
                    return messageController.get("label.item.etc", data, row.projectCount);
                }
                return data;
            }
        }, {
            targets: 5, // 이슈 공유 항목 수
            data: "issueStatusCount",
            className: 'dt-head-right',
            render: function(data, type, row, meta) {
                return data;
            }
        }, {
            targets: 6, // 최근 수정 일시
            data: "updateDateTime",
            className: 'dt-head-center',
            render: function(data, type, row, meta) {
                return momentController.timestampFormat(data, 'YYYY-MM-DD HH:mm:ss');
            }
        }, {
            targets: 7,
            orderable: false,
            className: "extend-button",
            width: '60px',
            render: function(data, type, row, meta) {
                var html = '<span class="btn-modify" style="margin: 0 10px;" data-name="btnModify"><i class="fa fa-pencil-square-o active-hover" aria-hidden="true"></i></span>';
                if(row.issueStatusGroupId != 0) {
                    html += '<span class="btn-delete" style="margin-right:10px;" data-name="btnDelete"><i class="fa fa-trash active-hover" aria-hidden="true"></i></span>';
                }
                return html;
            }
        }],
        createdRow: function (row, data, index) {

            var $row = $(row);

            //  정보&수정 실행
            $row.on('click', function(e) {
                if(e.target.className.indexOf('select-checkbox') == -1
                    && e.target.className.indexOf('extend-button') == -1
                    && e.target.className.indexOf('material-icons') == -1
                    && e.target.className.indexOf('btn') == -1) {
                    openModalModifyIssueStatusGroup(data.issueStatusGroupId);
                    e.stopPropagation();
                }
            });

            // 수정
            $row.find("[data-name=btnModify]").on("click", function(e) {
                openModalModifyIssueStatusGroup(data.issueStatusGroupId);
                e.stopPropagation();
            });

            // 삭제
            $row.find("[data-name=btnDelete]").on("click", function(e) {
                swalDelete({
                    url: "/api/1/issues/status/groups/" + data.issueStatusGroupId,
                    dataTable: $dataTableIssueStatusGroups
                });
                e.stopPropagation();
            });
        }
    });


    /***************************************************************************
     * 추가 모달
     **************************************************************************/
    // 추가
    $modalAddIssueStatusGroup.find('[name=btnAdd]').on('click', function(e) {
        addIssueStatusGroup(false);
    });

    // 추가 계속
    $modalAddIssueStatusGroup.find('[name=btnAddContinue]').on('click', function(e) {
        addIssueStatusGroup(true);
    });

    // Alt+W 저장하고 계속 이벤트
    $modalAddIssueStatusGroup.on('keydown', function(key) {
        if (event.which === 87 && event.altKey) {
            addIssueStatusGroup(true);
        }
    });

    // 공유 여부
    $modalAddIssueStatusGroup.find('[name=sharingYn]').on('change', function(e) {
        if ($(this).val() == "Y") {
            $modalAddIssueStatusGroup.find("[data-row=project]").hide();
            $modalAddIssueStatusGroup.find("[data-row=issueStatusGroupName]").show();
        } else {
            $modalAddIssueStatusGroup.find("[data-row=project]").show();
            $modalAddIssueStatusGroup.find("[data-row=issueStatusGroupName]").hide();
        }
    });

    function addIssueStatusGroup(addContinueMode) {

        var requestBody = {};
        requestBody.sharingYn = $modalAddIssueStatusGroup.find("[name=sharingYn]:checked").val();
        if (requestBody.sharingYn == "N") {
            // 프로젝트 아이디(프로젝트 트리 체크)
            var activeNode = $modalAddIssueStatusGroup.find("#modalAddProjectTree .tree-area").fancytree("getActiveNode");
            if(activeNode != null) {
                requestBody.ownerProjectId = parseInt(activeNode.key);
            }
        } else {
            requestBody.issueStatusGroupName = $modalAddIssueStatusGroup.find('[name=issueStatusGroupName]').val();
        }
        requestBody.issueStatusGroupComment = $modalAddIssueStatusGroup.find('[name=issueStatusGroupComment]').val();

        $.ajaxRest({
            url : "/api/1/issues/status/groups/0",
            type : "POST",
            data : requestBody,
            block : true,
            beforeSend : function(xhr, settings) {
                errorMsgHandler.clear($modalAddIssueStatusGroup);
            },
            success : function(data, textStatus, jqXHR) {

                // 공유 여부
                $modalAddIssueStatusGroup.find("[name=sharingYn][value=Y]").click();

                // 이슈 상태 그룹명
                $modalAddIssueStatusGroup.find('[name=issueStatusGroupName]').val('');

                // 프로젝트
                $modalAddIssueStatusGroup.find('[name=ownerProjectId]').val('');
                $modalAddIssueStatusGroup.find('#modalAddProjectTree .tree-search').val('');
                var projectTree = $modalAddIssueStatusGroup.find("#modalAddProjectTree .tree-area").fancytree("getTree");
                if(projectTree) {
                    projectTree.visit(function(node) {
                        node.setActive(false);
                    });
                }

                if(addContinueMode) {
                    $modalAddIssueStatusGroup.find('[name=issueStatusGroupName]').focus();
                } else {
                    $modalAddIssueStatusGroup.find('[name=issueStatusGroupComment]').val('');
                    $modalAddIssueStatusGroup.modal('hide');
                }

                if (data.sharingYn == "Y") {
                    // 단독
                    $.toastGreen({
                        text: messageController.get("label.issue.status.group") + ' ' + data.issueStatusGroupName + ' ' + messageController.get("label.has.been.added")
                    });
                } else {
                    // 공유
                    $.toastGreen({
                        text: messageController.get("label.issue.status.group") + ' ' + messageController.get("label.has.been.added")
                    });
                }

                $dataTableIssueStatusGroups.draw();
            },
            error : function(hdr, status) {
                errorMsgHandler.show($modalAddIssueStatusGroup, hdr.responseText);
            }
        });
    }

    /***************************************************************************
     * 수정 모달
     **************************************************************************/
    function openModalModifyIssueStatusGroup(issueStatusGroupId) {
        $.ajaxRest({
            url: "/api/1/issues/status/groups/" + issueStatusGroupId,
            type: "GET",
            beforeSend: function(xhr, settings) {
                errorMsgHandler.clear($modalModifyIssueStatusGroup);
            },
            success: function(data, textStatus, header) {
                // 공유 여부
                var txtSharing = messageController.get("item.issue.status.group.sharing." + data.sharingYn);
                if (data.sharingYn == "Y") {
                    $modalModifyIssueStatusGroup.find("[data-row=issueStatusGroupName]").show();
                } else {
                    if (data.ownerProject == null || data.ownerProject.projectKey == null || data.ownerProject.projectName == null) {
                        txtSharing = "[ERROR]";
                    } else {
                        txtSharing = '<span data-toggle="tooltip" data-container="body" title="'
                            + messageController.get('label.project.key') + " : " + data.ownerProject.projectKey.escapeHTML() + '">'
                            + txtSharing + " (" +  data.ownerProject.projectName.escapeHTML() + ")" + '</span>';
                    }
                    $modalModifyIssueStatusGroup.find("[data-row=issueStatusGroupName]").hide();
                }
                $modalModifyIssueStatusGroup.find('[data-name=sharingYn]').html(txtSharing);

                $modalModifyIssueStatusGroup.find('[name=issueStatusGroupId]').val(data.issueStatusGroupId);
                $modalModifyIssueStatusGroup.find('[name=issueStatusGroupName]').val(data.issueStatusGroupName);
                $modalModifyIssueStatusGroup.find('[name=issueStatusGroupComment]').val(data.issueStatusGroupComment);

                // 사용 중인 프로젝트
                if (data.projects.length != 0) {
                    $modalModifyIssueStatusGroup.find('[data-name=projectCount]').text(data.projects.length + messageController.get('label.count'));
                    var projects = "";
                    for (var i = 0; i < data.projects.length; i ++) {
                        projects += "<span data-toggle='tooltip' title='" + messageController.get('label.project.key') + " : " + data.projects[i].projectKey + "'>" + data.projects[i].projectName.escapeHTML() + "</span><br/>";
                    }
                    $modalModifyIssueStatusGroup.find("[data-name=projects]").html(projects);
                    $modalModifyIssueStatusGroup.find('[data-name=projects]').show();
                } else {
                    $modalModifyIssueStatusGroup.find('[data-name=projectCount]').text(messageController.get('label.none'));
                    $modalModifyIssueStatusGroup.find('[data-name=projects]').hide();
                }

                // 이슈 상태 항목 수
                $modalModifyIssueStatusGroup.find('[data-name=issueStatusCount]').text(data.issueStatusCount);
                if (data.issueStatusCount == 0) {
                    $modalModifyIssueStatusGroup.find('[name=btnInit]').prop("disabled", true);
                } else {
                    $modalModifyIssueStatusGroup.find('[name=btnInit]').prop("disabled", false);
                }

                if (data.issueStatusGroupId == 0) {
                    $modalModifyIssueStatusGroup.find('[name=btnDelete]').hide();

                } else {
                    $modalModifyIssueStatusGroup.find('[name=btnDelete]').show();

                }
                $modalModifyIssueStatusGroup.modal('show');
            }
        });
    }

    // 삭제
    $modalModifyIssueStatusGroup.find('[name=btnDelete]').on('click', function() {
        var issueStatusGroupId = $modalModifyIssueStatusGroup.find('[name=issueStatusGroupId]').val();
        swalDelete({
            url: "/api/1/issues/status/groups/" + issueStatusGroupId,
            dataTable: $dataTableIssueStatusGroups
        });
    });

    // 이슈 항목 초기화
    $modalModifyIssueStatusGroup.find('[name=btnInit]').on('click', function() {

        var issueStatusGroupId = $modalModifyIssueStatusGroup.find('[name=issueStatusGroupId]').val();

        swal({
            title: messageController.get('confirm.common.8'),
            type : "warning",
            showCancelButton : true,
            confirmButtonClass: "btn btn-danger",
            confirmButtonText : messageController.get('label.initialize'),
            cancelButtonClass: "btn btn-default",
            cancelButtonText : messageController.get('label.cancel'),
            closeOnConfirm : false,
            buttonsStyling: false,
        }, function(isConfirm) {
            // 삭제중 상태
            if (isConfirm) {
                keyEventHandler.addPreventEscape();
                swal({
                    html : '<i class="fa fa-fw fa-5x fa-spinner fa-pulse "></i><h2 style="margin-top:30px;"">' + messageController.get('400023') + '</h2>',
                    showCancelButton: false,
                    showConfirmButton: false,
                    allowOutsideClick: false,
                    allowEscapeKey: false,
                    closeOnCancel: false,
                    closeOnConfirm: false
                });

                $.ajaxRest({
                    url: "/api/1/issues/status/groups/" + issueStatusGroupId + "/init",
                    type: "DELETE",
                    block: true,
                    success: function(data, textStatus, header) {

                        // 테이블 다시 로딩.
                        $dataTableIssueStatusGroups.draw();

                        // swal 메세지 제거
                        swal.closeModal();
                        keyEventHandler.removePreventEscape();

                        // 삭제 완료 메세지 표시
                        $.toastRed({
                            // 400016=초기화되었습니다.
                            text: messageController.get("400016")
                        });
                        $('.modal').modal('hide');
                    },
                    error: function(hdr, status) {
                        swal({
                            title: messageController.get(hdr.responseJSON[0].code),
                            type: "error",
                            closeOnConfirm: true,
                        });
                    }
                });
            }
        });
    });

    // 수정
    $modalModifyIssueStatusGroup.find('[name=btnModify]').on('click', function() {
        var requestBody = {};
        requestBody.issueStatusGroupId = $modalModifyIssueStatusGroup.find('[name=issueStatusGroupId]').val();
        requestBody.issueStatusGroupName = $modalModifyIssueStatusGroup.find('[name=issueStatusGroupName]').val();
        requestBody.issueStatusGroupComment = $modalModifyIssueStatusGroup.find('[name=issueStatusGroupComment]').val();

        $.ajaxRest({
            url : "/api/1/issues/status/groups/"  + requestBody.issueStatusGroupId,
            type : "PUT",
            data : requestBody,
            block : true,
            beforeSend : function(xhr, settings) {
                errorMsgHandler.clear($modalModifyIssueStatusGroup);
            },
            success : function (data, textStatus, jqXHR) {

                if (data.sharingYn == "Y") {
                    // 단독
                    $.toastGreen({
                        text: messageController.get("label.issue.status.group") + ' ' + data.issueStatusGroupName + ' ' + messageController.get("label.has.been.modified")
                    });
                } else {
                    // 공유
                    $.toastGreen({
                        text: messageController.get("label.issue.status.group") + ' ' + messageController.get("label.has.been.modified")
                    });
                }

                $modalModifyIssueStatusGroup.modal('hide');
                $dataTableIssueStatusGroups.draw();
            },
            error : function(hdr, status) {
                errorMsgHandler.show($modalModifyIssueStatusGroup, hdr.responseText);
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