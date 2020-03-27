
$(function() {

    (function($, window) {

        var ModalModifyProject = (function() {

            var $modalModifyProject = null;
            var $dataTableUserOrGroup = null;

            var $dataTableProjects = null;

            var selectedUserOrGroupIds = [];

            // 생성자
            function ModalModifyProject(element, options) {

                /*************************************************************************
                 * 변수
                 *************************************************************************/
                $modalModifyProject = $(element);

                /*************************************************************************
                 * 컴포넌트
                 *************************************************************************/
                // 체커 그룹
                $.ajaxRest({
                    url: "/api/1/checkers/groups/items",
                    type: "GET",
                    success: function(data, textStatus, header) {
                        $modalModifyProject.find('[name=checkerGroupId]').select2Controller({ data : data });
                    }
                });

                // 이슈 상태 그룹
                $.ajaxRest({
                    url: "/api/1/issues/status/groups/items",
                    type: "GET",
                    success: function(data, textStatus, header) {
                        $modalModifyProject.find('[name=issueStatusGroupId]').select2Controller({ data : data });
                    }
                });
                $modalModifyProject.find('[name=issueStatusGroupSharingYn]').on('change', function(e) {
                    if ($(this).val() == "Y") {
                        $modalModifyProject.find("[data-row=issueStatusGroup]").show();
                    } else {
                        $modalModifyProject.find("[data-row=issueStatusGroup]").hide();
                    }
                });

                // 상호작용 프로젝트
                if ($modalModifyProject.find("[name=ihubProjectUid]").length > 0) {
                    $.ajaxRest({
                        url: "/api/1/ihub/projects/items",
                        type: "GET",
                        success: function (data, textStatus, header) {
                            data.unshift({id: 0, text: messageController.get('label.no.setting')});
                            $modalModifyProject.find(".row-ihub-project-uid").show();
                            $modalModifyProject.find('[name=ihubProjectUid]').select2Controller({data: data});
                        },
                        beforeError: function (hdr, status) {
                            return false;
                        }
                    });
                }

                // 프로젝트 구성원: 사용자 목록
                $modalModifyProject.find("[name=userOrGroup]").select2Controller({
                    multiple: true,
                    url: "/api/1/users/or/groups/items",
                    processResults: function(data) {
                        for (var i in data) {
                            if(selectedUserOrGroupIds.includes(data[i].id)){
                                data[i].disabled = true;
                            }
                        }
                        return data;
                    }
                });

                // 프로젝트 구성원: 역할
                $.ajaxRest({
                    url: "/api/1/projects/role/items",
                    type: "GET",
                    success : function(data, textStatus, header) {
                        $modalModifyProject.find('[name=projectRoleCode]').select2Controller({
                            minimumResultsForSearch: -1,
                            data : data,
                        });
                    }
                });

                // 프로젝트 구성원: 구성원 추가
                $modalModifyProject.find("[name=btnAddUserOrGroup]").on('click', function(e) {

                    if($modalModifyProject.find("[name=userOrGroup]").val() == null) {
                        //405019=구성원을 입력해 주세요.
                        swal(messageController.get('405019'));
                        return;
                    }
                    if($modalModifyProject.find("[name=projectRoleCode]").val() == null ) {
                        // 405020=역할을 입력해 주세요.
                        swal(messageController.get('405020'));
                        return;
                    }

                    $.each($modalModifyProject.find("[name=userOrGroup]").select2('data'), function(i) {
                        // 아이디
                        var id = $modalModifyProject.find("[name=userOrGroup]").select2('data')[i].id;
                        // 구성원(사용자)
                        var userOrGroup = $modalModifyProject.find("[name=userOrGroup]").select2('data')[i].text;
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
                            id: id,
                            userOrGroup: userOrGroup, // 구성원(사용자)
                            type: type, // 유형
                            projectRoleCode: $modalModifyProject.find("[name=projectRoleCode]").val() // 역할
                        });
                        selectedUserOrGroupIds.push(id);
                    });
                    $dataTableUserOrGroup.draw();

                    $modalModifyProject.find("[name=userOrGroup]").val("").trigger('change');
                });

                // 프로젝트 구성원: 테이블
                $dataTableUserOrGroup = $modalModifyProject.find("[data-name=dataTableUserOrGroup]").dataTableController({
                    order: [ [1, 'asc'] ],
                    columnDefs: [{
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
                           return '<i class="fa fa-trash active-hover" value="' + row.id + '"></i>';
                       }
                    }],
                    drawCallback: function() {
                        // 삭제 이벤트
                        $modalModifyProject.find('[data-name=dataTableUserOrGroup]').find('td i.fa-trash').unbind( "click" );
                        $modalModifyProject.find('[data-name=dataTableUserOrGroup] td i.fa-trash').on('click', function() {
                            $modalModifyProject.find('[data-name=dataTableUserOrGroup]').DataTable().row($(this).parents('tr')).remove().draw();
                            selectedUserOrGroupIds.splice( selectedUserOrGroupIds.indexOf($(this).attr('value')), 1 );
                        });
                    }
                });

                // 분석 결과 제외 대상
                $.ajaxRest({
                    url: "/api/1/admin/globalExcludedTarget",
                    type: "GET",
                    success: function(data, textStatus, header) {
                        $modalModifyProject.find('[name=globalExcludedPaths]').text(data.paths);
                        $modalModifyProject.find('[name=globalExcludedFuncs]').text(data.funcs);
                    }
                });

                /*************************************************************************
                 * 버튼
                 *************************************************************************/
                // 수정
                $modalModifyProject.find('[name=btnModify]').on('click', function(e) {

                    var requestBody  = {};
                    requestBody.projectId = $modalModifyProject.find("[name=projectId]").val();
                    if (sessionUserController.isAdmin()) {
                        requestBody.managementOnlyYn = $modalModifyProject.find("[name=managementOnlyYn]").is(':checked') ? "Y" : "N";
                    }
                    requestBody.projectName = $modalModifyProject.find("[name=projectName]").val();
                    requestBody.projectKey = $modalModifyProject.find("[name=projectKey]").val();
                    requestBody.projectComment = $modalModifyProject.find("[name=projectComment]").val();

                    // 상위 프로젝트(프로젝트 트리 체크)
                    if (requestBody.projectId != 0) { // ROOT 프로젝트 제외
                        var activeNode = $modalModifyProject.find("[data-name=projectTree]").fancytree("getActiveNode");
                        if(activeNode != null) {
                            requestBody.parentId = parseInt(activeNode.key);
                        } else {
                            requestBody.parentId = $modalModifyProject.find("[name=parentId]").val();
                        }
                    }

                    // 체커 그룹
                    requestBody.checkerGroupId = $modalModifyProject.find("[name=checkerGroupId]").val();

                    // 이슈 상태 그룹
                    requestBody.issueStatusGroup = {};
                    requestBody.issueStatusGroup.sharingYn = $modalModifyProject.find("[name=issueStatusGroupSharingYn]:checked").val();
                    requestBody.issueStatusGroupId = $modalModifyProject.find("[name=issueStatusGroupId]").val();

                    // 분석 보관 개수
                    requestBody.maxScans = $modalModifyProject.find("[name=maxScans]").val();

                    // 사용자 상위 프로젝트 선택 가능
                    if (sessionUserController.isAdmin()) {
                        requestBody.userParentProjectYn = $modalModifyProject.find("[name=userParentProjectYn]").is(':checked') ? "Y" : "N";
                    }

                    // 이관 제어 대상
                    requestBody.vcsCheckYn = $modalModifyProject.find("[name=vcsCheckYn]").is(':checked') ? "Y" : "N";

                    // 상호작용 프로젝트
                    requestBody.ihubProjectUid = $modalModifyProject.find("[name=ihubProjectUid]").val();

                    // 프로젝트 구성원 : 프로젝트 사용자, 권한, 테이블
                    requestBody.projectUsers = [];
                    requestBody.projectUserGroups = [];
                    var tableData = $modalModifyProject.find('[data-name=dataTableUserOrGroup]').dataTable().api().data();
                    $.each(tableData, function(index) {
                        var temp = tableData[index].id.substring(0, 1);
                        if (temp == 'u') {
                            requestBody.projectUsers.push({
                                userId: tableData[index].id.substring(2),
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
                    requestBody.excludePaths = $modalModifyProject.find("[name=excludePaths]").val();
                    requestBody.excludeFuncs = $modalModifyProject.find("[name=excludeFuncs]").val();

                    // 프로젝트 경로(고급옵션)
                    requestBody.advProjectPaths = $modalModifyProject.find("[name=advProjectPaths]").val();
                    requestBody.advSourcePaths = $modalModifyProject.find("[name=advSourcePaths]").val();
                    requestBody.advWebContentsPaths = $modalModifyProject.find("[name=advWebContentsPaths]").val();

                    $.ajaxRest({
                        url:"/api/1/projects/" + requestBody.projectId,
                        type: "PUT",
                        data: requestBody,
                        block: true,
                        beforeSend: function(xhr, settings) {
                            errorMsgHandler.clear($modalModifyProject);
                        },
                        success: function(data, status, header) {
                            $modalModifyProject.modal('hide');
                            $dataTableProjects.draw();
                            $.toastGreen({
                                text: messageController.get("label.project") + ' ' + data.projectName + ' ' + messageController.get("label.has.been.modified")
                            });
                        },
                        error: function(hdr, status) {

                            var errors = JSON.parse(hdr.responseText);

                            var $selectedCollapse = null;
                            $modalModifyProject.find(".collapse").each(function(){
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

                            errorMsgHandler.show($modalModifyProject, errors);
                        }
                    });
                });
            }

            // 모달 열기:프로젝트 목록에서 수정 버튼 눌렸을 때
            ModalModifyProject.prototype.openModal = function(projectId) {

                $.ajaxRest({
                    url: "/api/1/projects/" + projectId,
                    type: "GET",
                    beforeSend: function(xhr, settings) {
                        errorMsgHandler.clear($modalModifyProject);
                    },
                    success: function(data, status, header) {

                        // 프로젝트 아이디
                        $modalModifyProject.find("[name=projectId]").val(data.projectId);
                        $modalModifyProject.find("#txtProjectId").text(data.projectId);

                        // 관리 전용
                        var $managementOnlyYn = $modalModifyProject.find("[name=managementOnlyYn]");
                        if (data.managementOnlyYn == "Y") {
                            $managementOnlyYn.bootstrapToggle('on');
                        } else {
                            $managementOnlyYn.bootstrapToggle('off');
                        }

                        // 프로젝트 이름
                        $modalModifyProject.find("[name=projectName]").val(data.projectName);
                        // 프로젝트 키
                        $modalModifyProject.find("[name=projectKey]").val(data.projectKey);
                        // 설명
                        $modalModifyProject.find("[name=projectComment]").val(data.projectComment)

                        // 상위 프로젝트
                        if(data.projectId == 0) {
                            // 프로젝트가 ROOT이면 상위 프로젝트를 수정할 수 없다.
                            $modalModifyProject.find("[data-row=parentProject]").hide();
                        } else {
                            $modalModifyProject.find("[data-row=parentProject]").show();

                            var $selProjectTree = $modalModifyProject.find("[data-name=selProjectTree]");
                            $selProjectTree.dropdownFancytreeController("destroy");
                            $selProjectTree.dropdownFancytreeController({
                                ajax : {
                                    url : "/api/1/projects/fancytree",
                                    afterSuccess : function(data2, textStatus, header) {
                                        var node = $selProjectTree.find("[data-name=projectTree]").fancytree("getNodeByKey", data.parentId.toString());
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

                                        if (sessionUserController.isAdmin() || data.administrable) {
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
                            $selProjectTree.find(".tree-select").val(data.parentProject.projectName +" (" + data.parentProject.projectKey + ")");
                        }
                        $modalModifyProject.find("[name=parentId]").val(data.parentId);

                        function setInherit(data) {

                            // 체커 그룹
                            $modalModifyProject.find("[name=checkerGroupId]").val(data.checkerGroupId).trigger("change");

                            // 이슈 상태 정보
                            $modalModifyProject.find("[name=issueStatusGroupSharingYn]").parent().removeClass("active");
                            $modalModifyProject.find("[name=issueStatusGroupSharingYn]").prop('checked', false);
                            $modalModifyProject.find("[name=issueStatusGroupSharingYn][value=" + data.issueStatusGroup.sharingYn +"]").parent().addClass("active");
                            $modalModifyProject.find("[name=issueStatusGroupSharingYn][value=" + data.issueStatusGroup.sharingYn +"]").prop('checked', true);
                            $modalModifyProject.find("[name=issueStatusGroupSharingYn]").trigger("change");
                            $modalModifyProject.find("[name=issueStatusGroupId]").val(data.issueStatusGroupId).trigger("change");
                            if(data.issueStatusGroup.sharingYn == "Y") {
                                $modalModifyProject.find("[data-row=issueStatusGroup]").show();
                            } else {
                                $modalModifyProject.find("[data-row=issueStatusGroup]").hide();
                            }

                            // 분석 보관 개수
                            $modalModifyProject.find("[name=maxScans]").val(data.maxScans);

                            // 사용자 상위 프로젝트 선택 가능
                            var $userParentProjectYn = $modalModifyProject.find("[name=userParentProjectYn]");
                            if (data.userParentProjectYn == "Y") {
                                $userParentProjectYn.bootstrapToggle('on');
                            } else {
                                $userParentProjectYn.bootstrapToggle('off');
                            }

                            // 이관 제어 대상
                            var $vcsCheckYn = $modalModifyProject.find("[name=vcsCheckYn]");
                            if (data.vcsCheckYn == "Y") {
                                $vcsCheckYn.bootstrapToggle('on');
                            } else {
                                $vcsCheckYn.bootstrapToggle('off');
                            }

                            // 상호작용 프로젝트
                            $modalModifyProject.find("[name=ihubProjectUid]").val(data.ihubProjectUid).trigger("change");

                            // 프로젝트 구성원:테이블
                            $dataTableUserOrGroup.clear();
                            selectedUserOrGroupIds = [];
                            $.each(data.projectUsers, function(i) {
                                if (data.projectUsers[i].userName == null) {
                                    data.projectUsers[i].userName = getSelectText($modalModifyProject.find("[name=userOrGroup]"), 'u:' + data.projectUsers[i].userId);
                                }
                                $dataTableUserOrGroup.addRow({
                                    id: 'u:' + data.projectUsers[i].userId,
                                    userOrGroup : data.projectUsers[i].userName + "(" + data.projectUsers[i].userId + ")",
                                    type: "user",
                                    projectRoleCode : data.projectUsers[i].projectRoleCode,
                                    administrable : data.administrable
                                });
                                selectedUserOrGroupIds.push("u:" + data.projectUsers[i].userId);
                            });
                            $.each(data.projectUserGroups, function(i) {
                                if (data.projectUserGroups[i].userGroupName == null) {
                                    data.projectUserGroups[i].userGroupName = getSelectText($modalModifyProject.find("[name=userOrGroup]"), 'g:' + data.projectUserGroups[i].userGroupId);
                                }
                                $dataTableUserOrGroup.addRow({
                                    id: 'g:' + data.projectUserGroups[i].userGroupId,
                                    userOrGroup: data.projectUserGroups[i].userGroupName,
                                    type: "userGroup",
                                    projectRoleCode: data.projectUserGroups[i].projectRoleCode,
                                    administrable: data.administrable
                                });
                                selectedUserOrGroupIds.push("g:" + data.projectUserGroups[i].userGroupId);
                            });
                            $dataTableUserOrGroup.draw();

                            // 프로젝트 구성원 : 프로젝트 사용자 콤보 박스
                            $modalModifyProject.find("[name=userOrGroup]").val("").trigger('change');

                            // 분석 결과 제외 대상
                            $modalModifyProject.find("[name=excludePaths]").val(data.excludePaths);
                            $modalModifyProject.find("[name=excludeFuncs]").val(data.excludeFuncs);

                            // 프로젝트 경로(고급옵션)
                            $modalModifyProject.find("[name=advProjectPaths]").val(data.advProjectPaths);
                            $modalModifyProject.find("[name=advSourcePaths]").val(data.advSourcePaths);
                            $modalModifyProject.find("[name=advWebContentsPaths]").val(data.advWebContentsPaths);
                        }
                        setInherit(data);

                        // 편집 가능 여부
                        var disabled = false;
                        if (data.editable) {
                            $modalModifyProject.find("[name=btnModify]").show();
                            disabled = false;
                        } else {
                            $modalModifyProject.find("[name=btnModify]").hide();
                            disabled = true;
                        }
                        $modalModifyProject.find("[name=projectName]").prop("disabled", disabled);
                        $modalModifyProject.find("[name=projectKey]").prop("disabled", disabled);
                        $modalModifyProject.find("[name=projectComment]").prop("disabled", disabled);
                        $modalModifyProject.find("[name=parentProjectKey]").prop("disabled", disabled);

                        // 관리 가능 여부
                        if (data.administrable) {
                            $modalModifyProject.find("[name=userOrGroup]").parent().show();
                            $modalModifyProject.find("[name=projectRoleCode]").parent().show();
                            $modalModifyProject.find("[name=btnAddUserOrGroup]").parent().show();
                            disabled = false;
                        } else {
                            $modalModifyProject.find("[name=userOrGroup]").parent().hide();
                            $modalModifyProject.find("[name=projectRoleCode]").parent().hide();
                            $modalModifyProject.find("[name=btnAddUserOrGroup]").parent().hide();
                            disabled = true;
                        }

                        $modalModifyProject.find("[name=checkerGroupId]").attr("disabled", disabled);

                        $modalModifyProject.find("[name=issueStatusGroupSharingYn]").parent().attr("disabled", disabled);
                        $modalModifyProject.find("[name=issueStatusGroupId]").attr("disabled", disabled);
                        if (disabled) {
                            $modalModifyProject.find("[name=issueStatusGroupSharingYn]").parent().css("pointer-events", "none");
                        } else {
                            $modalModifyProject.find("[name=issueStatusGroupSharingYn]").parent().css("pointer-events", "");
                        }

                        $modalModifyProject.find("[name=maxScans]").attr("disabled", disabled);
                        $modalModifyProject.find("[name=vcsCheckYn]").attr("disabled", disabled);
                        if (disabled) {
                            $modalModifyProject.find("[name=vcsCheckYn]").siblings().find(".btn").addClass("disabled");
                        }

                        $modalModifyProject.find("[name=excludePaths]").attr("disabled", disabled);
                        $modalModifyProject.find("[name=excludeFuncs]").attr("disabled", disabled);

                        $modalModifyProject.find("[name=advProjectPaths]").attr("disabled", disabled);
                        $modalModifyProject.find("[name=advSourcePaths]").attr("disabled", disabled);
                        $modalModifyProject.find("[name=advWebContentsPaths]").attr("disabled", disabled);

                        $modalModifyProject.modal("show");
                    },
                    error: function(hdr, status) {
                        errorMsgHandler.swal(data);
                    }
                });
            }

            // 프로젝트 데이터 테이블 설정
            ModalModifyProject.prototype.setDataTableUserOrGroup = function(dataTableUserOrGroup) {
                $dataTableUserOrGroup = dataTableUserOrGroup;
            }

            // 프로젝트 데이터 테이블 설정
            ModalModifyProject.prototype.setDataTableProjects = function(dataTableProjects) {
                $dataTableProjects = dataTableProjects;
            }

            return ModalModifyProject;
        })();

        $.fn.modalModifyProject = function() {

            var $this = $(this);
            var data = $this.data("modalModifyProject");

            //data가  없으면 Default로 새로 생성
            if (!data) {
                $this.data('modalModifyProject', data = new ModalModifyProject(this, arguments[0]));
            }

            return data;
        }

    })(window.jQuery, window);

    modalModifyProject = $("#modalModifyProject").modalModifyProject();
});

var modalModifyProject = null;