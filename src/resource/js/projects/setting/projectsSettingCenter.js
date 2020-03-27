$(function() {

    var projectId = $("#projectId").val();

    // 최근 탐색 프로젝트 결과에 추가
    recentQueue.setItem("P", projectId);

    /***************************************************************************
     * 변수
     ***************************************************************************/
    var $formProject = $("#formProject");

    var $projectTree = $formProject.find('[data-name=projectTree]');

    var selectedUserOrGroupIds = [];

    /***************************************************************************
     * 컴포넌트
     ***************************************************************************/

    var items = [];

    // 체커 그룹
    items[0] = $.ajaxRest({
        url : "/api/1/checkers/groups/items",
        type : "GET",
        success : function(data, textStatus, header) {
            $formProject.find('[name=checkerGroupId]').select2Controller({ data : data });
        }
    });

    // 이슈 상태 그룹
    items[1] = $.ajaxRest({
        url : "/api/1/issues/status/groups/items",
        type: "GET",
        success: function(data, textStatus, header) {
            $formProject.find('[name=issueStatusGroupId]').select2Controller({ data : data });
        }
    });
    items[2] = $formProject.find('[name=issueStatusGroupSharingYn]').on('change', function(e) {
        if($(this).val() == "Y") {
            $formProject.find("[data-row=issueStatusGroup]").show();
        } else {
            $formProject.find("[data-row=issueStatusGroup]").hide();
        }
    });

    // 상호작용 프로젝트
    if ($formProject.find("[name=ihubProjectUid]").length > 0) {
        items[3] = $.ajaxRest({
            url: "/api/1/ihub/projects/items",
            type: "GET",
            success: function (data, textStatus, header) {
                data.unshift({id: 0, text: messageController.get('label.no.setting')});
                $formProject.find(".row-ihub-project-uid").show();
                $formProject.find('[name=ihubProjectUid]').select2Controller({data: data});
            },
            beforeError: function (hdr, status) {
                return false;
            }
        });
    }

    // 프로젝트 구성원: 사용자 목록
    $formProject.find("[name=userOrGroup]").select2Controller({
        multiple: true,
        url: "/api/1/users/or/groups/items",
        processResults: function(data) {
            for (var i in data) {
                if (selectedUserOrGroupIds.includes(data[i].id)) {
                    data[i].disabled = true;
                }
            }
            return data;
        }
    });

    // 프로젝트 구성원 : 역활
    items[4] = $.ajaxRest({
        url : "/api/1/projects/role/items",
        type : "GET",
        success : function(data, textStatus, header) {
            $formProject.find('[name=projectRoleCode]').select2Controller({
                minimumResultsForSearch: -1,
                data : data
            });
        }
    });

    // 프로젝트 구성원 : 추가 버튼
    $formProject.find("[name=btnAddUserOrGroup]").on('click', function(e) {

        if($formProject.find("[name=userOrGroup]").val() == null) {
            //405019=구성원을 입력해 주세요.
            swal(messageController.get('405019'));
            return;
        }
        if($formProject.find("[name=projectRoleCode]").val() == null ) {
            // 405020=역할을 입력해 주세요.
            swal(messageController.get('405020'));
            return;
        }

        $.each($formProject.find("[name=userOrGroup]").select2('data'), function(i) {
            // 아이디
            var id = $formProject.find("[name=userOrGroup]").select2('data')[i].id;
            // 구성원(사용자)
            var userOrGroup = $formProject.find("[name=userOrGroup]").select2('data')[i].text;
            userOrGroup = userOrGroup.substring(userOrGroup.indexOf(":") + 2);

            // 유형
            var type = null;
            if (id.substring(0, 1) == 'u') {
                type = "user";
            } else {
                type = "userGroup";
            }

            // 추가
            $dataTableUserOrGroup.addRow({
                id : id,
                userOrGroup : userOrGroup, // 구성원(사용자)
                type : type, // 유형
                projectRoleCode : $formProject.find("[name=projectRoleCode]").val(), // 역할
            });
            selectedUserOrGroupIds.push(id);
        });
        $dataTableUserOrGroup.draw();

        $formProject.find("[name=userOrGroup]").val("").trigger('change');
    });

    // 구성원 테이블
    var $dataTableUserOrGroup = $formProject.find("[data-name=dataTableUserOrGroup]").dataTableController({
        order : [ [1, 'asc'] ],
        columnDefs : [{
            targets: 0, // 유형
            data: "type",
            width: "20px",
            render: function(data, type, row, meta) {
                if(data == "userGroup") {
                    return '<i class="fa fa-fw fa-users"></i>' +  messageController.get("label.user.group");
                } else if (data == "user") {
                    return '<i class="fa fa-fw fa-user"></i>' +  messageController.get("label.user");
                }
                return "";
            }
        }, {
            targets: 1, // 구성원(사용자)
            data: "userOrGroup",
            render: function(data, type, row, meta) {
                return data;
            }
        }, {
            targets: 2, // 역할
            data: "projectRoleCode",
            render: function(data, type, row, meta) {
               return messageController.get("item.project.role." + data);
            }
        }, {
            targets: 3, // 확장 버튼
            orderable: false,
            className: "extend-button text-center",
            render: function(data, type, row, meta) {
                if(row.administrable == false) {
                    return "";
                }
                return '<i class="fa fa-trash active-hover" value="' + row.id + '" aria-hidden="true"></i>'
            }
        } ],
        drawCallback : function() {
            //삭제 이벤트
            $formProject.find('[data-name=dataTableUserOrGroup]').find('td i.fa-trash').unbind( "click" );
            $formProject.find('[data-name=dataTableUserOrGroup] td i.fa-trash').on('click', function() {
                $formProject.find('[data-name=dataTableUserOrGroup]').DataTable().row($(this).parents('tr')).remove().draw();
                selectedUserOrGroupIds.splice( selectedUserOrGroupIds.indexOf($(this).attr('value')), 1 );
            });
        }
    });

    // 분석 결과 제외 대상
    $.ajaxRest({
        url : "/api/1/admin/globalExcludedTarget",
        type : "GET",
        success : function(data, textStatus, header) {
            $formProject.find('[name=globalExcludedPaths]').val(data.paths);
            $formProject.find('[name=globalExcludedFuncs]').val(data.funcs);
        }
    });

    /***************************************************************************
     * 정보 표시
     ***************************************************************************/
    $.when(items[0], items[1], items[2], items[3], items[4]).done(function() {
        $.ajaxRest({
            url: "/api/1/projects/" + projectId,
            type: "GET",
            success : function(data, status, header) {

                var project = data;

                // 프로젝트 아이디
                $formProject.find("[name=projectId]").val(project.projectId);
                $formProject.find("#txtProjectId").text(project.projectId);

                // 관리 전용
                var $managementOnlyYn = $formProject.find("[name=managementOnlyYn]");
                if (project.managementOnlyYn == "Y") {
                    $managementOnlyYn.bootstrapToggle('on');
                } else {
                    $managementOnlyYn.bootstrapToggle('off');
                }

                // 프로젝트명
                $formProject.find("[name=projectName]").val(project.projectName);
                // 프로젝트 키
                $formProject.find("[name=projectKey]").val(project.projectKey);
                // 설명
                $formProject.find("[name=projectComment]").val(project.projectComment);

                // 상위 프로젝트
                var $selProjectTree = $formProject.find("[data-name=selProjectTree]");
                $selProjectTree.dropdownFancytreeController("destroy");
                $selProjectTree.dropdownFancytreeController({
                    ajax : {
                        url : "/api/1/projects/fancytree",
                        afterSuccess : function(data, textStatus, header) {
                            var node = $selProjectTree.find("[data-name=projectTree]").fancytree("getNodeByKey", project.parentId.toString());
                            if (node != null) {
                                node.setActive(true);
                            }
                        }
                    },
                    fancytree : {
                        selectMode: 1,
                        checkbox: false,
                        afterClick: function(event, treeData) {

                            var parentId = treeData.node.key;

                            function getInherit(parentId) {
                                $.ajaxRest({
                                    url: "/api/1/projects/" + parentId,
                                    type: "GET",
                                    success: function(data, status, header) {
                                        setInherit(data);
                                        swal.closeModal();
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

                            if (sessionUserController.isAdmin() || project.administrable) {
                                swal({
                                    title: messageController.get('confirm.project.2'),
                                    type : "warning",
                                    showCancelButton : true,
                                    confirmButtonClass: "btn btn-primary",
                                    confirmButtonText : messageController.get("label.ok"),
                                    cancelButtonClass: "btn btn-default",
                                    cancelButtonText : messageController.get('label.cancel'),
                                    closeOnConfirm : false,
                                    buttonsStyling: false,
                                }, function(isConfirm) {
                                    if (isConfirm) {
                                        getInherit(parentId);
                                    }
                                });
                            } else {
                                getInherit(parentId);
                            }
                        }
                    }
                });
                $selProjectTree.find(".tree-select").val(project.parentProject.projectName +" (" + project.parentProject.projectKey + ")");
                $formProject.find("[name=parentId]").val(project.parentId);

                // 상속 대상 정보 설정
                function setInherit(project) {

                    // 체커 그룹
                    $formProject.find("[name=checkerGroupId]").val(project.checkerGroupId).trigger("change");

                    // 이슈 상태 그룹
                    $formProject.find("[name=issueStatusGroupSharingYn]").parent().removeClass("active");
                    $formProject.find("[name=issueStatusGroupSharingYn]").prop('checked', false);
                    $formProject.find("[name=issueStatusGroupSharingYn][value=" + project.issueStatusGroup.sharingYn +"]").parent().addClass("active");
                    $formProject.find("[name=issueStatusGroupSharingYn][value=" + project.issueStatusGroup.sharingYn +"]").prop('checked', true);
                    $formProject.find("[name=issueStatusGroupSharingYn]").trigger("change");
                    $formProject.find("[name=issueStatusGroupId]").val(project.issueStatusGroupId).trigger("change");
                    if(project.issueStatusGroup.sharingYn == "Y") {
                        $formProject.find("[data-row=issueStatusGroup]").show();
                    } else {
                        $formProject.find("[data-row=issueStatusGroup]").hide();
                    }

                    // 분석 보관 개수
                    $formProject.find("[name=maxScans]").val(project.maxScans);

                    // 사용자 상위 프로젝트 선택 가능
                    var $userParentProjectYn = $formProject.find("[name=userParentProjectYn]");
                    if (project.userParentProjectYn == "Y") {
                        $userParentProjectYn.bootstrapToggle('on');
                    } else {
                        $userParentProjectYn.bootstrapToggle('off');
                    }

                    // 이관 제어 대상
                    var $vcsCheckYn = $formProject.find("[name=vcsCheckYn]");
                    if (project.vcsCheckYn == "Y") {
                        $vcsCheckYn.bootstrapToggle('on');
                    } else {
                        $vcsCheckYn.bootstrapToggle('off');
                    }

                    // 상호작용 프로젝트
                    $formProject.find("[name=ihubProjectUid]").val(project.ihubProjectUid).trigger("change");


                    // 프로젝트 구성원 : 프로젝트 사용자 콤보 박스
                    $formProject.find("[name=userOrGroup]").find('option').attr('disabled', false);

                    // 프로젝트 구성원 : 테이블 - 사용자
                    $dataTableUserOrGroup.clear();
                    selectedUserOrGroupIds = [];
                    $.each(project.projectUsers, function(i) {
                        if (project.projectUsers[i].userName == null) {
                            project.projectUsers[i].userName = getSelectText($formProject.find("[name=userOrGroup]"), 'u:' + project.projectUsers[i].userId);
                        }
                        $dataTableUserOrGroup.addRow({
                            id: 'u:' + project.projectUsers[i].userId,
                            userOrGroup : project.projectUsers[i].userName + "(" + project.projectUsers[i].userId + ")",
                            type : "user",
                            projectRoleCode : project.projectUsers[i].projectRoleCode,
                            administrable : project.administrable
                        });
                        $formProject.find("[name=userOrGroup]").find("option[value='u:" + project.projectUsers[i].userId + "']").attr('disabled', true);
                    });
                    // 프로젝트 구성원 : 테이블 - 사용자 그룹
                    $.each(project.projectUserGroups, function(i) {
                        if(project.projectUserGroups[i].userGroupName == null) {
                            project.projectUserGroups[i].userGroupName = getSelectText($formProject.find("[name=userOrGroup]"), 'g:' + project.projectUserGroups[i].userGroupId);
                        }
                        $dataTableUserOrGroup.addRow({
                            id : 'g:' + project.projectUserGroups[i].userGroupId,
                            userOrGroup : project.projectUserGroups[i].userGroupName,
                            type : "userGroup",
                            projectRoleCode : project.projectUserGroups[i].projectRoleCode,
                            administrable : project.administrable
                        });
                        $formProject.find("[name=userOrGroup]").find("option[value='g:" + project.projectUserGroups[i].userGroupId + "']").attr('disabled', true);
                    });
                    $dataTableUserOrGroup.draw();

                    // 프로젝트 구성원 : 프로젝트 사용자 콤보 박스
                    $formProject.find("[name=userOrGroup]").val("").trigger('change');

                    // 분석 결과 제외 대상
                    $formProject.find("[name=excludePaths]").val(project.excludePaths);
                    $formProject.find("[name=excludeFuncs]").val(project.excludeFuncs);

                    // 프로젝트 경로(고급옵션)
                    $formProject.find("[name=advProjectPaths]").val(project.advProjectPaths);
                    $formProject.find("[name=advSourcePaths]").val(project.advSourcePaths);
                    $formProject.find("[name=advWebContentsPaths]").val(project.advWebContentsPaths);
                }
                setInherit(project);

                // 편집 가능 여부
                var disabled = false;
                if(project.editable) {
                    $formProject.find("[name=btnModify]").show();
                    disabled = false;
                } else {
                    $formProject.find("[name=btnModify]").hide();
                    disabled = true;
                }
                $formProject.find("[name=projectName]").prop("disabled", disabled);
                $formProject.find("[name=projectKey]").prop("disabled", disabled);
                $formProject.find("[name=projectComment]").prop("disabled", disabled);
                $formProject.find("[name=parentProjectKey]").prop("disabled", disabled);

                // 관리 가능 여부
                if (project.administrable) {
                    $formProject.find("[name=userOrGroup]").parent().show();
                    $formProject.find("[name=projectRoleCode]").parent().show();
                    $formProject.find("[name=btnAddUserOrGroup]").parent().show();
                    disabled = false;
                } else {
                    $formProject.find("[name=userOrGroup]").parent().hide();
                    $formProject.find("[name=projectRoleCode]").parent().hide();
                    $formProject.find("[name=btnAddUserOrGroup]").parent().hide();
                    disabled = true;
                }

                $formProject.find("[name=checkerGroupId]").attr("disabled", disabled);

                $formProject.find("[name=issueStatusGroupSharingYn]").parent().attr("disabled", disabled);
                $formProject.find("[name=issueStatusGroupId]").attr("disabled", disabled);
                if (disabled) {
                    $formProject.find("[name=issueStatusGroupSharingYn]").parent().css("pointer-events", "none");
                } else {
                    $formProject.find("[name=issueStatusGroupSharingYn]").parent().css("pointer-events", "");
                }

                $formProject.find("[name=maxScans]").attr("disabled", disabled);
                $formProject.find("[name=vcsCheckYn]").attr("disabled", disabled);
                if (disabled) {
                    $formProject.find("[name=vcsCheckYn]").siblings().find(".btn").addClass("disabled");
                }

                $formProject.find("[name=excludePaths]").attr("disabled", disabled);
                $formProject.find("[name=excludeFuncs]").attr("disabled", disabled);

                $formProject.find("[name=advProjectPaths]").attr("disabled", disabled);
                $formProject.find("[name=advSourcePaths]").attr("disabled", disabled);
                $formProject.find("[name=advWebContentsPaths]").attr("disabled", disabled);

                $formProject.css('visibility', 'visible');
            },
            error : function(hdr, status) {
                errorMsgHandler.swal(data);
            }
        });
    });

    /***************************************************************************
     * 버튼
     ***************************************************************************/
    // 수정
    $formProject.find('[name=btnModify]').on('click', function(e) {

        var requestBody = {};
        // 프로젝트ID
        requestBody.projectId = $formProject.find("[name=projectId]").val();
        // 관리 전용
        if (sessionUserController.isAdmin()) {
            requestBody.managementOnlyYn = $formProject.find("[name=managementOnlyYn]").is(':checked') ? "Y" : "N";
        }
        // 프로젝트명
        requestBody.projectName = $formProject.find("[name=projectName]").val();
        // 프로젝트키
        requestBody.projectKey = $formProject.find("[name=projectKey]").val();
        // 설명
        requestBody.projectComment = $formProject.find("[name=projectComment]").val();

        // 상위 프로젝트 아이디(프로젝트 트리 체크)
        var activeNode = $projectTree.fancytree("getActiveNode");
        if (activeNode != null) {
            requestBody.parentId = parseInt(activeNode.key);
        } else {
            requestBody.parentId = $formProject.find("[name=parentId]").val();
        }

        // 체커 그룹
        requestBody.checkerGroupId = $formProject.find("[name=checkerGroupId]").val();

        // 이슈 상태 그룹
        requestBody.issueStatusGroup = {};
        requestBody.issueStatusGroup.sharingYn = $formProject.find("[name=issueStatusGroupSharingYn]:checked").val()
        requestBody.issueStatusGroupId = $formProject.find("[name=issueStatusGroupId]").val();

        // 분석 보관 개수
        requestBody.maxScans = $formProject.find("[name=maxScans]").val();

        // 사용자 상위 프로젝트 선택 가능
        if (sessionUserController.isAdmin()) {
            requestBody.userParentProjectYn = $formProject.find("[name=userParentProjectYn]").is(':checked') ? "Y" : "N";
        }

        // 이관 제어 대상
        requestBody.vcsCheckYn = $formProject.find("[name=vcsCheckYn]").is(':checked') ? "Y" : "N";

        // 상호작용 프로젝트
        requestBody.ihubProjectUid = $formProject.find("[name=ihubProjectUid]").val();

        // 프로젝트 구성원 : 프로젝트 사용자, 권한, 테이블
        requestBody.projectUsers = [];
        requestBody.projectUserGroups = [];
        var tableData = $formProject.find('[data-name=dataTableUserOrGroup]').dataTable().api().data();
        $.each(tableData, function(index) {
            var temp = tableData[index].id.substring(0, 1);
            if (temp == 'u') {
                requestBody.projectUsers.push({
                    userId : tableData[index].id.substring(2),
                    projectRoleCode: tableData[index].projectRoleCode
                });
            } else if (temp == 'g') {
                requestBody.projectUserGroups.push({
                    userGroupId: parseInt(tableData[index].id.substring(2)),
                    projectRoleCode: tableData[index].projectRoleCode
                });
            }
        });

        // 분석 결과 제외 대상
        requestBody.excludePaths = $formProject.find("[name=excludePaths]").val();
        requestBody.excludeFuncs = $formProject.find("[name=excludeFuncs]").val();

        // 프로젝트 경로(고급옵션)
        requestBody.advProjectPaths = $formProject.find("[name=advProjectPaths]").val();
        requestBody.advSourcePaths = $formProject.find("[name=advSourcePaths]").val();
        requestBody.advWebContentsPaths = $formProject.find("[name=advWebContentsPaths]").val();

        $.ajaxRest({
            url: "/api/1/projects/" + requestBody.projectId,
            type: "PUT",
            data: requestBody,
            block: true,
            beforeSend : function(xhr, settings) {
                errorMsgHandler.clear($formProject);
            },
            success: function(data, status, header) {

//                showData(data);
//                $.toastGreen({
//                    text: messageController.get("label.project") + ' ' + data.projectName + ' ' + messageController.get("label.has.been.modified")
//                });

                location.reload();
            },
            error: function(hdr, status) {

                var errors = JSON.parse(hdr.responseText);

                var $selectedCollapse = null;
                $formProject.find(".collapse").each(function(){
                    var $collapse = $(this);
                    var show = false;
                    for (var i in errors) {
                        var $item = errorMsgHandler.getErrorItems($collapse, errors[i]);
                        if ($item != null && $item.length != 0) {
                            $selectedCollapse = $collapse;
                            return false;
                        }
                    }
                });
                if($selectedCollapse != null && $selectedCollapse.hasClass("in") == false){
                    $selectedCollapse.collapse('toggle');
                }

                errorMsgHandler.show($formProject, errors);
            }
        });
    });
});