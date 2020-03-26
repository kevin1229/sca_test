$(function() {

    /***************************************************************************
     * 변수
     **************************************************************************/
    var SearchOption = function() {
        this.checkerGroupName = null;
        this.checkerGroupComment = null;
        this.projectIds = [];
        this.checkerLangCodes = [];
        this.complianceIds = [];
        this.insertUserIds = [];
        this.updateUserIds = [];
        this.fromUpdateDateTime = null;
        this.toUpdateDateTime = null;
        this.useYns = null;
    };
    SearchOption.prototype = {
        clear : function() {
            this.checkerGroupName = null;
            this.checkerGroupComment = null;
            this.projectIds = [];
            this.checkerLangCodes = [];
            this.complianceIds = [];
            this.insertUserIds = [];
            this.updateUserIds = [];
            this.fromUpdateDateTime = null;
            this.toUpdateDateTime = null;
            this.useYns = null;
        }
    };
    var searchOption = new SearchOption();

    var $dropdownSearchOptionCheckerGroups = $('#dropdownSearchOptionCheckerGroups');
    var $buttonGroupDataTableCheckerGroups = $('#buttonGroupDataTableCheckerGroups');
    var $modalAddCheckerGroup = $("#modalAddCheckerGroup");
    var $modalModifyCheckerGroup = $("#modalModifyCheckerGroup");
    var $modalSaveAsCheckerGroup = $("#modalSaveAsCheckerGroup");

    /***************************************************************************
     * 컴포넌트
     **************************************************************************/
    // 체커 언어
    $.ajaxRest({
        url: "/api/1/checkers/lang/items",
        type: "GET",
        success: function(data, textStatus, header) {
            $dropdownSearchOptionCheckerGroups.find('[name=checkerLangCodes]').select2Controller({multiple: true, data: data});
        }
    });

    // 레퍼런스
    $.ajaxRest({
        url: "/api/1/compliance/items",
        type: "GET",
        success: function(data, textStatus, header) {
            $dropdownSearchOptionCheckerGroups.find('[name=complianceIds]').select2Controller({multiple: true, data: data});
            $modalAddCheckerGroup.find('[name=complianceIds]').select2Controller({multiple: true, data: data});
            $modalModifyCheckerGroup.find("[name=complianceIds]").select2Controller({multiple:true, data : data});
        }
    });

    // 등록자
    $dropdownSearchOptionCheckerGroups.find('[name=insertUserIds]').select2Controller({ multiple:true, url:"/api/1/users/items"});
    // 최근 수정자
    $dropdownSearchOptionCheckerGroups.find('[name=updateUserIds]').select2Controller({ multiple:true, url:"/api/1/users/items"});

    // 위험도
    $.ajaxRest({
        url: "/api/1/checkers/risk/items",
        type: "GET",
        success: function(data, textStatus, header) {
            $modalAddCheckerGroup.find('[name=risks]').select2Controller({multiple: true, data: data});
            $modalModifyCheckerGroup.find("[name=risks]").select2Controller({multiple: true, data : data});
        }
    });

    // 최근 수정 일시
    $dropdownSearchOptionCheckerGroups.find('[name=updateDateTime]').daterangepickerController();

    // 사용중인 프로젝트
    $dropdownSearchOptionCheckerGroups.find('#searchOptionProjectTree').dropdownFancytreeController({
        ajax : {
            url : "/api/1/projects/fancytree"
        }
    });

    // 상태
    $dropdownSearchOptionCheckerGroups.find('[name=useYns]').select2Controller({
        multiple: true,
        data: [{
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
    // 간단 입력
    $dropdownSearchOptionCheckerGroups.find('[name=txtSearchShort]').on('keydown', function(e) {
        var code = e.keyCode || e.which;
        if (code == 13) { // ENTER
            searchShort();
        }
    });

    // 돋보기 검색
    $dropdownSearchOptionCheckerGroups.find('[name=btnSearchShort]').on('click', function(e) {
        searchShort();
    });

    function searchShort() {
        searchOption.clear();
        searchOption.checkerGroupName = $dropdownSearchOptionCheckerGroups.find('[name=txtSearchShort]').val();

        clearSearchOption();
        showSearchCondition();

        $dataTableCheckerGroups.draw();
    }

    // 검색
    $dropdownSearchOptionCheckerGroups.find('[name=btnSearch]').on('click', function(e) {
        searchOption.clear();
        searchOption.checkerGroupName = $dropdownSearchOptionCheckerGroups.find('[name=checkerGroupName]').val();
        searchOption.checkerLangCodes = $dropdownSearchOptionCheckerGroups.find('[name=checkerLangCodes]').val();
        searchOption.complianceIds = $dropdownSearchOptionCheckerGroups.find('[name=complianceIds]').val();
        searchOption.insertUserIds = $dropdownSearchOptionCheckerGroups.find('[name=insertUserIds]').val();

        // 선택한 프로젝트 아이디
        var selNodes = $dropdownSearchOptionCheckerGroups.find('#searchOptionProjectTree').dropdownFancytreeController('getTree').getSelectedNodes();
        selNodes.forEach(function(node) {
            searchOption.projectIds.push(node.key);
        });
        searchOption.updateUserIds = $dropdownSearchOptionCheckerGroups.find('[name=updateUserIds]').val();

        searchOption.checkerGroupComment = $dropdownSearchOptionCheckerGroups.find('[name=checkerGroupComment]').val();
        searchOption.useYns = $dropdownSearchOptionCheckerGroups.find('[name=useYns]').val();

        // 체커 수정일시
        if ($.trim($dropdownSearchOptionCheckerGroups.find('[name=updateDateTime]').val()) != '') {
            searchOption.fromUpdateDateTime = $dropdownSearchOptionCheckerGroups.find('[name=updateDateTime]').data('daterangepicker').startDate._d;
            searchOption.toUpdateDateTime = $dropdownSearchOptionCheckerGroups.find('[name=updateDateTime]').data('daterangepicker').endDate._d;
        }

        $dataTableCheckerGroups.draw();

        showSearchCondition();

        $dropdownSearchOptionCheckerGroups.find('[name=txtSearchShort]').val("");
        $dropdownSearchOptionCheckerGroups.removeClass('open');
    });

    // 초기화
    $dropdownSearchOptionCheckerGroups.find('[name=btnClear]').on('click', function(e) {
        clearSearchOption();
    });

    function clearSearchOption() {
        $dropdownSearchOptionCheckerGroups.find('[name=checkerGroupName]').val("");
        $dropdownSearchOptionCheckerGroups.find('[name=checkerGroupComment]').val("");
        $dropdownSearchOptionCheckerGroups.find('#searchOptionProjectTree').dropdownFancytreeController().clear();
        $dropdownSearchOptionCheckerGroups.find('[name=checkerLangCodes]').val("").trigger('change');
        $dropdownSearchOptionCheckerGroups.find('[name=complianceIds]').val("").trigger('change');
        $dropdownSearchOptionCheckerGroups.find('[name=insertUserIds]').val("").trigger('change');
        $dropdownSearchOptionCheckerGroups.find('[name=updateUserIds]').val("").trigger('change');
        $dropdownSearchOptionCheckerGroups.find('[name=updateDateTime]').val("");
        $dropdownSearchOptionCheckerGroups.find('[name=useYns]').val("").trigger('change');
    }

    // 현재 검색 기준
    function showSearchCondition() {
        $("#searchCondition").hide();
        $('#searchCondition .searchConditionHead').hide();
        $('#searchCondition .searchCondition').text('');

        if(searchOption == null) {
            return false;
        }

        // 체커 그룹명
        if (searchOption.checkerGroupName != null && searchOption.checkerGroupName != "") {
            $('#searchCondition [name=checkerGroupName]').text(searchOption.checkerGroupName);
            $('#searchCondition [name=checkerGroupName]').parent().show();
            $('#searchCondition').css('display', 'inline-block');
        }

        // 설명
        if (searchOption.checkerGroupComment != null && searchOption.checkerGroupComment != "") {
            $('#searchCondition [name=checkerGroupComment]').text(searchOption.checkerGroupComment);
            $('#searchCondition [name=checkerGroupComment]').parent().show();
            $('#searchCondition').css('display', 'inline-block');
        }

        // 사용중인 프로젝트
        if (searchOption.projectIds != null && searchOption.projectIds.length != 0) {
            var tree = $dropdownSearchOptionCheckerGroups.find('#searchOptionProjectTree').dropdownFancytreeController('getTree');
            var tempArray = $.map(searchOption.projectIds, function(data, i) {
                return tree.getNodeByKey(data).title
            });
            $('#searchCondition [name=projectIds]').text(tempArray.join(', '));
            $('#searchCondition [name=projectIds]').parent().show();
            $('#searchCondition').css('display', 'inline-block');
        }

        // 언어
        if (searchOption.checkerLangCodes != null && searchOption.checkerLangCodes.length != 0) {
            var texts = getSelectTexts($dropdownSearchOptionCheckerGroups.find("[name=checkerLangCodes]"), searchOption.checkerLangCodes);
            $('#searchCondition [name=checkerLangCodes]').text(texts.join(', '));
            $('#searchCondition [name=checkerLangCodes]').parent().show();
            $('#searchCondition').css('display', 'inline-block');
        }

        // 레퍼런스
        if (searchOption.complianceIds != null && searchOption.complianceIds.length != 0) {
            var texts = getSelectTexts($dropdownSearchOptionCheckerGroups.find("[name=complianceIds]"), searchOption.complianceIds);
            $('#searchCondition [name=complianceIds]').text(texts.join(', '));
            $('#searchCondition [name=complianceIds]').parent().show();
            $('#searchCondition').css('display', 'inline-block');
        }

        // 등록자
        if (searchOption.insertUserIds != null && searchOption.insertUserIds.length != 0) {
            var texts = getSelectTexts($dropdownSearchOptionCheckerGroups.find("[name=insertUserIds]"), searchOption.insertUserIds);
            $('#searchCondition [name=insertUserIds]').text(texts.join(', '));
            $('#searchCondition [name=insertUserIds]').parent().show();
            $('#searchCondition').css('display', 'inline-block');
        }

        // 최근 수정자
        if (searchOption.updateUserIds != null && searchOption.updateUserIds.length != 0) {
            var texts = getSelectTexts($dropdownSearchOptionCheckerGroups.find("[name=updateUserIds]"), searchOption.updateUserIds);
            $('#searchCondition [name=updateUserIds]').text(texts.join(', '));
            $('#searchCondition [name=updateUserIds]').parent().show();
            $('#searchCondition').css('display', 'inline-block');
        }

        // 최근 수정 일시:시작일
        if (searchOption.fromUpdateDateTime != null && searchOption.fromUpdateDateTime != "") {
            var temp = moment(new Date(searchOption.fromUpdateDateTime)).format('YYYY-MM-DD HH:mm');
            $('#searchCondition [name=fromUpdateDateTime]').text(temp);
            $('#searchCondition [name=fromUpdateDateTime]').parent().show();
            $('#searchCondition').css('display', 'inline-block');
        }

        // 최근 수정 일시:종료일
        if (searchOption.toUpdateDateTime != null && searchOption.toUpdateDateTime != "") {
            var temp = moment(new Date(searchOption.toUpdateDateTime)).format('YYYY-MM-DD HH:mm');
            $('#searchCondition [name=toUpdateDateTime]').text(temp);
            $('#searchCondition [name=toUpdateDateTime]').parent().show();
            $('#searchCondition').css('display', 'inline-block');
        }

        // 상태
        if (searchOption.useYns != null && searchOption.useYns.length != 0) {
            var texts = getSelectTexts($dropdownSearchOptionCheckerGroups.find("[name=useYns]"), searchOption.useYns);
            $('#searchCondition [name=useYns]').text(texts.join(', '));
            $('#searchCondition [name=useYns]').parent().show();
            $('#searchCondition').css('display', 'inline-block');
        }
    }

    // Dropdown 닫기 방지 : common.js
    stopHideDropDown('#dropdownSearchOptionCheckerGroups');

    /***************************************************************************
     * 추가 모달
     **************************************************************************/
    // 모달창 클리어
    function clearModalAddCheckerGroup() {
        // 초기화
        $modalAddCheckerGroup.find('[name=checkerGroupName]').val('');
        $modalAddCheckerGroup.find('[name=checkerGroupComment]').val('');
        $modalAddCheckerGroup.find('[name=risks]').val('').trigger('change');
        $modalAddCheckerGroup.find('[name=complianceIds]').val('').trigger('change');
    }

    // 추가
    $modalAddCheckerGroup.find('[name=btnAdd]').on('click', function(e) {
        addCheckerGroup(false);
    });

    // 추가하고 체커 편집 이동
    $modalAddCheckerGroup.find('[name=btnAddSetting]').on('click', function(e) {
        addCheckerGroup(true);
    });

    function addCheckerGroup(addContinueMode) {
        var requestBody = {};
        requestBody.checkerGroupName = $modalAddCheckerGroup.find('[name=checkerGroupName]').val();
        requestBody.checkerGroupComment = $modalAddCheckerGroup.find('[name=checkerGroupComment]').val();
        requestBody.risks = $modalAddCheckerGroup.find('[name=risks]').val();
        requestBody.complianceIds = $modalAddCheckerGroup.find('[name=complianceIds]').val();

        $.ajaxRest({
            url : "/api/1/checkers/groups/0",
            type : "POST",
            data : requestBody,
            block: true,
            beforeSend : function(xhr, settings) {
                errorMsgHandler.clear($modalAddCheckerGroup);
            },
            success : function(data, textStatus, header) {
                if (addContinueMode) {
                    // 만들고 편집
                    window.location.href = '/admin/checkers/groups/' + data.checkerGroupId + "/design";
                } else {
                    $dataTableCheckerGroups.draw();
                }
                $modalAddCheckerGroup.modal('hide');
                clearModalAddCheckerGroup();

                $.toastGreen({
                    text: messageController.get("label.checker.group") + ' ' + data.checkerGroupName + ' ' + messageController.get("label.has.been.added")
                });
            },
            error : function(hdr, status) {
                errorMsgHandler.show($modalAddCheckerGroup, hdr.responseText);
            }
        });
    }

    /***************************************************************************
     * 수정 모달
     **************************************************************************/
    function openModalModifyCheckerGroup(checkerGroupId) {
        $.ajaxRest({
            url: "/api/1/checkers/groups/" + checkerGroupId,
            type: "GET",
            beforeSend: function(xhr, settings) {
                errorMsgHandler.clear($modalModifyCheckerGroup);
                $modalModifyCheckerGroup.find("[name=complianceIds]").val('').trigger('change');
                $modalModifyCheckerGroup.find("[name=risks]").val('').trigger('change');
            },
            success: function(data, textStatus, header) {

                $modalModifyCheckerGroup.find("[data-name=txtCheckerGroupName]").text(data.checkerGroupName);

                $modalModifyCheckerGroup.find("[name=checkerGroupId]").val(data.checkerGroupId);
                $modalModifyCheckerGroup.find("[name=checkerGroupName]").val(data.checkerGroupName);
                $modalModifyCheckerGroup.find("[name=checkerGroupComment]").val(data.checkerGroupComment);

                // 사용 중인 프로젝트
                if (data.projects.length != 0) {
                    $modalModifyCheckerGroup.find('[data-name=projectCount]').text(data.projects.length + messageController.get('label.count'));
                    var projects = "";
                    for (var i = 0; i < data.projects.length; i ++) {
                        projects += "<span data-toggle='tooltip' title='" + messageController.get('label.project.key') + " : " + data.projects[i].projectKey + "'>" + data.projects[i].projectName.escapeHTML() + "</span><br/>";
                    }
                    $modalModifyCheckerGroup.find("[data-name=projects]").html(projects);
                    $modalModifyCheckerGroup.find('[data-name=projects]').show();
                } else {
                    $modalModifyCheckerGroup.find('[data-name=projectCount]').text(messageController.get('label.none'));
                    $modalModifyCheckerGroup.find('[data-name=projects]').hide();
                }


                if (data.checkerGroupId == 0) {
                    $modalModifyCheckerGroup.find("[data-hide-default=true]").hide();
                } else {
                    $modalModifyCheckerGroup.find("[data-hide-default=true]").show();
                }

                $modalModifyCheckerGroup.modal('show');
            }
        });
    }

    // 삭제
    $modalModifyCheckerGroup.find('[name=btnDelete]').on('click', function(e) {
        var checkerGroupId = $modalModifyCheckerGroup.find("input[name=checkerGroupId]").val();
        swalDelete({
            url: "/api/1/checkers/groups/" + checkerGroupId,
            dataTable: $dataTableCheckerGroups
        });
    });

    // 체커 편집 이동
    $modalModifyCheckerGroup.find('[name=btnGoCheckersGroupsDesign]').on('click', function(e) {
        var checkerGroupId = $modalModifyCheckerGroup.find("input[name=checkerGroupId]").val();
        location.href = "/admin/checkers/groups/" + checkerGroupId + "/design";
    });

    // 수정
    $modalModifyCheckerGroup.find('[name=btnModify]').on('click',function(e) {

        var requestBody = {};
        requestBody.checkerGroupId = $modalModifyCheckerGroup.find('[name=checkerGroupId]').val();
        requestBody.checkerGroupName = $modalModifyCheckerGroup.find('[name=checkerGroupName]').val();
        requestBody.checkerLangCodes =  $modalModifyCheckerGroup.find('[name=checkerLangCodes]').val();
        requestBody.risks =  $modalModifyCheckerGroup.find('[name=risks]').val();
        requestBody.complianceIds =  $modalModifyCheckerGroup.find('[name=complianceIds]').val();
        requestBody.checkerGroupComment =  $modalModifyCheckerGroup.find('[name=checkerGroupComment]').val();

        $.ajaxRest({
            url: "/api/1/checkers/groups/" + requestBody.checkerGroupId,
            type: "PUT",
            data: requestBody,
            block: true,
            beforeSend: function(xhr, settings) {
                errorMsgHandler.clear($modalModifyCheckerGroup);
            },
            success: function(data, textStatus, header) {
                $.toastGreen({
                    text: messageController.get("label.checker.group") + ' ' + data.checkerGroupName + ' ' + messageController.get("label.has.been.modified")
                });

                $modalModifyCheckerGroup.modal('hide');

                $dataTableCheckerGroups.draw();
            },
            error: function(hdr, status) {
                errorMsgHandler.show($modalModifyCheckerGroup, hdr.responseText);
            }
        });
    });

    /***********************************************************************
     * 다른 이름으로 저장 모달
     **********************************************************************/
    function openSaveAs(checkerGroup) {
        errorMsgHandler.clear($modalSaveAsCheckerGroup);

        $modalSaveAsCheckerGroup.find("input[name=checkerGroupId]").val(checkerGroup.checkerGroupId);
        $modalSaveAsCheckerGroup.find("span[data-name=orgCheckerGroupName]").text(checkerGroup.checkerGroupName);
        $modalSaveAsCheckerGroup.find("input[name=checkerGroupName]").val("");
        $modalSaveAsCheckerGroup.find("textarea[name=checkerGroupComment]").val("");
    }

    // 다른 이름으로 저장
    $modalSaveAsCheckerGroup.find('[name=btnSaveAs]').on('click', function(e) {
        saveAsCheckerGroup(false);
    });

    // 다른 이름으로 저장하고 체커 편집하기
    $modalSaveAsCheckerGroup.find('[name=btnSaveAsSetting]').on('click', function(e) {
        saveAsCheckerGroup(true);
    });

    function saveAsCheckerGroup(isContinue) {

        var requestBody = {};
        requestBody.checkerGroupId = $modalSaveAsCheckerGroup.find('[name=checkerGroupId]').val();
        requestBody.checkerGroupName = $modalSaveAsCheckerGroup.find('[name=checkerGroupName]').val();
        requestBody.checkerGroupComment = $modalSaveAsCheckerGroup.find('[name=checkerGroupComment]').val();

        $.ajaxRest({
            url : "/api/1/checkers/groups/" + requestBody.checkerGroupId + "/saveAs",
            type : "post",
            data : requestBody,
            block: true,
            beforeSend : function(xhr, settings) {
                errorMsgHandler.clear($modalSaveAsCheckerGroup);
            },
            success : function(data, textstatus, header) {
                $.toastGreen({
                    text: messageController.get("label.checker.group") + ' ' + data.checkerGroupName + ' ' + messageController.get("label.has.been.added")
                });
                $modalSaveAsCheckerGroup.modal('hide');

                // 만들고 편집
                if (isContinue) {
                    window.location.href = '/admin/checkers/groups/' + data.checkerGroupId + "/design";
                } else {
                    $dataTableCheckerGroups.draw();
                }
            },
            error : function(hdr, status) {
                errorMsgHandler.show($modalSaveAsCheckerGroup, hdr.responseText);
            }
        });
    }

    /***************************************************************************
     * 테이블 버튼
     **************************************************************************/
    // 엑셀 내보내기
    $buttonGroupDataTableCheckerGroups.find('[name=btnExportExcel]').on('click', function(e) {
        var requestBody = {};
        requestBody.searchOption = {};
        var selectedIds = $dataTableCheckerGroups.getSelectedIds('checkerGroupId');
        if($dataTableCheckerGroups.isAllSelected()) {
            requestBody.searchOption = searchOption;
        } else if(selectedIds.length > 0) {
            requestBody.searchOption.checkerGroupIds = selectedIds;
        } else {
            // 전체 선택이 아니면서, 선택된 ID가 없는 경우는
            // 선택 안함으로 판단함.
            // (데이터가 없을 경우는 버튼 자체가 비활성화됨.)
            requestBody.searchOption = searchOption;
        }

        $.ajaxRest({
            url : "/api/1/checkers/groups/export/excel",
            data : requestBody,
            type : "POST",
            error : function(hdr, status) {
                errorMsgHandler.swal(hdr.responseText);
            }
        });
    });

    // 일괄 삭제 : 체크항목 검사 후 확인창 표시
    $buttonGroupDataTableCheckerGroups.find('[name=btnDeleteBatch]').on('click', function(e) {
        var selectedIds = $dataTableCheckerGroups.getSelectedIds('checkerGroupId');
        if (selectedIds.length == 0) {
            swal(messageController.get('400025'));
            return;
        }

        var requestBody = {};
        if($dataTableCheckerGroups.isAllSelected()) {
            requestBody.searchOption = searchOption;
        } else {
            requestBody.ids = selectedIds;
        }

        swalDelete({
            url: "/api/1/checkers/groups",
            dataTable: $dataTableCheckerGroups,
            requestBody: requestBody
        });
    });

    /***************************************************************************
     * 테이블 표시
     **************************************************************************/
    var $buttonRowDataTableCheckerGroup = $('#buttonRowDataTableCheckerGroup').clone().html();
    var $dataTableCheckerGroups = $("#dataTableCheckerGroups").dataTableController({
        url: "/api/1/checkers/groups",
        searchOption : searchOption,
        buttonGroupId: "buttonGroupDataTableCheckerGroups",
        iDisplayLength : 20,
        order : [ [1, 'desc'] ],
        columnDefs: [{
            targets : 0,
            orderable : false,
            className : 'select-checkbox',
            defaultContent : ""
        }, {
            targets : 1, // ID
            visible: false,
            data : "checkerGroupId",
            className: "dt-head-right",
            render : $.fn.dataTable.render.text()
        }, {
            targets : 2, // 체커 그룹명
            data : "checkerGroupName",
        }, {
            targets : 3, // 설명
            visible: false,
            data : "checkerGroupComment",
            render: function(data, type, row) {
                if (data == null) {
                    return '-';
                }
                var text = data.escapeHTML();
                return '<div title="' + text + '" data-toggle="tooltip" data-container="body" class="ellipsis" style="width: 300px">' + text + '</div>';
            }
        }, {
            targets : 4, // 사용중인 프로젝트
            data : "projectName",
            render : function(data, type, row, meta) {
                if(data == null) {
                    return '-';
                }
                var text = null;
                if(row.projectCount > 1) {
                    text = messageController.get("label.item.etc", data.escapeHTML(), row.projectCount);
                } else {
                    text = data.escapeHTML();
                }
                return '<div title="' + text + '">' + text + '</div>';
            }
        }, {
            targets : 5, // 언어
            data : "checkerLangCode",
            render : function(data, type, row, meta) {
                if(data == null) {
                    return '-';
                }

                var checkerLang = null;

                var title = null
                var checkerLangNames = [];
                row.checkerLangs.forEach(function(v, i) {
                    checkerLangNames.push(v.checkerLang);
                    if(v.checkerLangCode == data) {
                        checkerLang = v.checkerLang;
                    }
                });
                title = checkerLangNames.join(', ');

                var text = null;
                if(row.checkerLangCount > 1) {
                    text = messageController.get("label.item.etc", checkerLang, row.checkerLangCount);
                } else {
                    text = checkerLang;
                }

                return '<div title="'+ title +'">'+ text +'</div>';
            }
        }, {
            targets : 6, // 활성화 체커
            data : "enabledCheckers",
            className : "dt-head-right",
            render : function(data, type, row) {
                if (row == null || row.enabledCheckers == null)
                    return '-';
                return getAllCheckerCount(row);
            }
        },  {
            targets : 7, // LV1
            data : "enabledCheckersRisk1",
            className : "dt-head-right",
            render : function(data, type, row) {
                if (data == null)
                    return '-';
                var issueCount = {name : "risk1", value : data}
                return getRiskCount(issueCount);
            }
        }, {
            targets : 8, // LV2
            data : "enabledCheckersRisk2",
            className : "dt-head-right",
            render : function(data, type, row) {
                if (data == null)
                    return '-';
                var issueCount = {name : "risk2", value : data}
                return getRiskCount(issueCount);
            }
        }, {
            targets : 9, // LV3
            data : "enabledCheckersRisk3",
            className : "dt-head-right",
            render : function(data, type, row) {
                if (data == null)
                    return '-';
                var issueCount = {name : "risk3", value : data}
                return getRiskCount(issueCount);
            }
        }, {
            targets : 10, // LV4
            data : "enabledCheckersRisk4",
            className : "dt-head-right",
            render : function(data, type, row) {
                if (data == null)
                    return '-';
                var issueCount = {name : "risk4", value : data}
                return getRiskCount(issueCount);
            }
        }, {
            targets : 11, // LV5
            data : "enabledCheckersRisk5",
            className : "dt-head-right",
            render : function(data, type, row) {
                if (data == null)
                    return '-';
                var issueCount = {name : "risk5", value : data}
                return getRiskCount(issueCount);
            }
        }, {
            targets: 12, // 레퍼런스
            data: "complianceName",
            className: "extend-button",
            render: function(data, type, row, meta) {
                if(data == null) {
                    return '-';
                }

                var title = null;
                var complianceNames = [];
                row.compliances.forEach(function(v, i) {
                    complianceNames.push(v.complianceName);
                });
                title = complianceNames.join(',');

                var text = null;
                if(row.complianceCount > 1) {
                    text = messageController.get("label.item.etc", data, row.complianceCount);
                } else {
                    text = data;
                }
                return '<a data-target="modalComplianceCount" title="'+ title +'" href="javascript:void(0);">'+ text +'</a>';
            }
        }, {
            targets: 13, // 등록자
            data: "insertUserName",
            render: function(data, type, row, meta) {
                if (data == null)
                    return row.insertUserId;
                return data.escapeHTML() + "(" + row.insertUserId + ")";
            }
        }, {
            targets: 14, // 최근 수정자
            data: "updateUserName",
            render: function(data, type, row, meta) {
                if (data == null)
                    return row.updateUserId;
                return data.escapeHTML() + "(" + row.updateUserId + ")";
            }
        }, {
            targets: 15,
            data: "updateDateTime",
            render: function(data, type, row, meta) {
                return momentController.timestampFormat(data, 'YYYY-MM-DD HH:mm:ss');
            }
        }, {
            targets: 16, // 상태
            data: "useYn",
            className: "extend-button dt-head-center",
            render: function(data, type, row, meta) {
                //if (row.checkerGroupId != 0)
                    return '<input name="useYn" type="checkbox" />';
                //return "ON";
            }
        }, {
            targets: 17,
            orderable: false,
            className: "extend-button",
            render: function(data, type, row, meta) {
                return $buttonRowDataTableCheckerGroup.compose({checkerGroupId: row.checkerGroupId});
            }
        }],
        createdRow: function(row, data, index) {

            var $row = $(row);

            // 테이블 row 클릭시 체커 수정 모달 페이지 오픈
            $row.find('td:not(.select-checkbox, .extend-button, .prevent-row-click)').on('click',function() {
                openModalModifyCheckerGroup(data.checkerGroupId);
            });

            // 활성화 상태
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
                requestBody.checkerGroupName = data.checkerGroupName;

                $.ajaxRest({
                    url : "/api/1/checkers/groups/" + data.checkerGroupId + "/useYn",
                    type : "PUT",
                    data: requestBody,
                    block : true,
                    success : function(data, textStatus, jqXHR) {
                        $.toastGreen({
                            text: messageController.get("label.checker.group") + ' ' + data.checkerGroupName + ' ' + messageController.get("label.has.been.modified")
                        });
                    },
                    error : function(hdr, status) {
                        $useYn.off("change");
                        $useYn.bootstrapToggle('on');
                        $useYn.on("change", fnUseYn);

                        swal({
                            title: messageController.get(hdr.responseJSON[0].code),
                            type: "error",
                            closeOnConfirm: true,
                        }); // 415012
                    }
                });
            }
            $useYn.on("change", fnUseYn);

            // 디폴트이거나 사용중인 프로젝트가 있는 경우
            if (data.checkerGroupId == 0 || data.projectCount > 0) {
                $useYn.attr("disabled", false);
                $useYn.siblings().find(".btn").addClass("disabled");
            }

            // 다른 이름으로 저장
            $row.find("[data-name=btnSaveAs]").on("click", function(e) {
                openSaveAs(data);
            });

            // 수정 버튼
            $row.find("[data-name=btnModify]").on("click", function(e) {
                openModalModifyCheckerGroup(data.checkerGroupId);
            });

            // 삭제 버튼
            if (data.checkerGroupId == 0) {
                // 디폴트 데이터는 삭제 버튼은 없앤다.
                $row.find('[data-name=btnDelete]').remove();
            } else {
                $row.find("[data-name=btnDelete]").on("click", function(e) {
                    swalDelete({
                        url: "/api/1/checkers/groups/" + data.checkerGroupId,
                        dataTable: $dataTableCheckerGroups
                    });
                });
            }

            // 체커 그룹 컴플라이언스 정보 모달 이벤트
            $row.find("a[data-target=modalComplianceCount]").on("click", function(e) {
                $.modalComplianceCount.showModalComplianceInfo(data.checkerGroupId, data.checkerGroupName);
            });
        },
        drawCallback : function() {
            $("#dataTableCheckerGroups").show();
        }
    });

    /**
     * 총 이슈, 위험도 별 체커 수 링크 출력
     *
     * @param data
     * @returns {StringBuffer}
     */
    function getAllCheckerCount(data) {
        return '<span class="total-count"><span class="table-inner-link total">' + data.enabledCheckers.format() + '</span></span>';
    }

    // 클릭시 파일 상세로 이동하는 오브젝트 생성.
    function getRiskCount(data) {
        return ' <span class="table-inner-link ' + data.name + '">' + data.value.format() + '</span>'
    }

    // 데이터 테이블의 선택/선택해제 이벤트 리스너.
    $dataTableCheckerGroups.DataTable().on( 'select', function ( e, dt, type, indexes ) {
        changeButtonText();
    }).on('deselect', function ( e, dt, type, indexes ) {
        changeButtonText();
    });

    /**
     * 2개 이상의 ROW가 선택된 경우, 일괄삭제, 일괄수정으로 텍스트 변경.
     * 1개 이하의 ROW가 선택된 경우, 삭제, 수정으로 텍스트 변경.
     * @param length
     */
    function changeButtonText(length) {
        if($dataTableCheckerGroups.getSelectedIds().length > 1) {
            $buttonGroupDataTableCheckerGroups.find('[name=btnDeleteBatch]').find('.btn-name').text(messageController.get("label.batch.delete"));
        } else {
            $buttonGroupDataTableCheckerGroups.find('[name=btnDeleteBatch]').find('.btn-name').text(messageController.get("label.delete"));
        }
    }

    /**
     * 현재 검색 결과 초기화 이벤트
     */
    $('#searchOptionClear').click(function () {
        clearSearchOption();
        $('button[name=btnSearch]').trigger('click');
    });
});
