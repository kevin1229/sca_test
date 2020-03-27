
$(function() {

    (function($, window) {

        var ModalAddProject = (function() {

            var $dataTableProjects = null;

            var $modalAddProject = null;
            var $userOrGroup = null;
            var $projectRoleCode = null;
            var $dataTableUserOrGroup = null;

            var selectedUserOrGroupIds = [];

            function ModalAddProject(element, options) {

                /*************************************************************************
                 * 변수
                 *************************************************************************/
                $modalAddProject = $(element);

                $userOrGroup = $modalAddProject.find("[name=userOrGroup]");
                $projectRoleCode = $modalAddProject.find("[name=projectRoleCode]");

                /*************************************************************************
                 * 컴포넌트
                 *************************************************************************/

                // 프로젝트키
                $modalAddProject.find("[name=btnRandomProjectKey]").on("click", function() {
                    $modalAddProject.find("[name=projectKey]").val(getRandomProjectKey());
                });

                // 체커 그룹
                $modalAddProject.find('[name=checkerGroupId]').select2Controller({});

                // 이슈 상태 그룹
                $modalAddProject.find('[name=issueStatusGroupId]').select2Controller();
                $modalAddProject.find('[name=issueStatusGroupSharingYn]').on('change', function(e) {
                    if ($(this).val() == "Y") {
                        $modalAddProject.find("[data-row=issueStatusGroup]").show();
                    } else {
                        $modalAddProject.find("[data-row=issueStatusGroup]").hide();
                    }
                });

                // 상호작용 프로젝트
                if ($modalAddProject.find("[name=ihubProjectUid]").length > 0) {
                    $.ajaxRest({
                        url: "/api/1/ihub/projects/items",
                        type: "GET",
                        success: function (data, textStatus, header) {
                            data.unshift({id: 0, text: messageController.get('label.no.setting')});
                            $modalAddProject.find(".row-ihub-project-uid").show();
                            $modalAddProject.find('[name=ihubProjectUid]').select2Controller({data: data});
                        },
                        beforeError: function (hdr, status) {
                            return false;
                        }
                    });
                }

                // 프로젝트 구성원: 사용자 및 그룹
                $modalAddProject.find('[name=userOrGroup]').select2Controller({
                    multiple: true,
                    url: "/api/1/users/or/groups/items",
                    processResults: function(data) {
                        for(var i in data){
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
                    success: function(data, textStatus, header) {
                        $modalAddProject.find('[name=projectRoleCode]').select2Controller({
                            minimumResultsForSearch: -1,
                            data : data
                        });
                    }
                });

                // 프로젝트 구성원: 구성원 추가
                $modalAddProject.find("[name=btnAddUserOrGroup]").on('click', function(e) {

                    if ($userOrGroup.val() == null) {
                        //405019=구성원을 입력해 주세요.
                        swal(messageController.get('405019'));
                        return;
                    }
                    if ($projectRoleCode.val() == null ) {
                        // 405020=역할을 입력해 주세요.
                        swal(messageController.get('405020'));
                        return;
                    }

                    $.each($userOrGroup.select2('data'), function(i) {
                        // 아이디
                        var id = $userOrGroup.select2('data')[i].id;

                        // 구성원(사용자)
                        var userOrGroup = $userOrGroup.select2('data')[i].text;
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
                            projectRoleCode: $projectRoleCode.val() // 역할
                        });

                        $userOrGroup.find("option[value='" + id + "']").attr('disabled', true);
                    });
                    $dataTableUserOrGroup.draw();

                    $userOrGroup.val("").trigger('change');
                });

                // 프로젝트 구성원: 테이블
                $dataTableUserOrGroup = $modalAddProject.find("[data-name=dataTableUserOrGroup]").dataTableController({
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
                           return '<i class="fa fa-trash active-hover" value="' + row.id + '"></i>';
                       }
                    }],
                    drawCallback : function() {
                        //삭제 이벤트
                        $modalAddProject.find('[data-name=dataTableUserOrGroup]').find('td i.fa-trash').unbind( "click" );
                        $modalAddProject.find('[data-name=dataTableUserOrGroup] td i.fa-trash').on('click', function() {
                            $modalAddProject.find('[data-name=dataTableUserOrGroup]').DataTable().row($(this).parents('tr')).remove().draw();
                            //$modalAddProject.find('[name=userOrGroup]').find("option[value='" + $(this).attr('value') + "']").attr('disabled', false);
                            //$modalAddProject.find('[name=userOrGroup]').select2().trigger('change');
                            selectedUserOrGroupIds.splice( selectedUserOrGroupIds.indexOf($(this).attr('value')), 1 );
                        });
                    }
                });

                // 분석 결과 제외 대상
                $.ajaxRest({
                    url : "/api/1/admin/globalExcludedTarget",
                    type : "GET",
                    success : function(data, textStatus, header) {
                        $modalAddProject.find('[name=globalExcludedPaths]').text(data.paths);
                        $modalAddProject.find('[name=globalExcludedFuncs]').text(data.funcs);
                    }
                });

                /*************************************************************************
                 * 표시
                 *************************************************************************/
                function setInherit(data) {

                    // 체커 그룹
                    $modalAddProject.find("[name=checkerGroupId]").val(data.checkerGroupId).trigger("change");

                    // 이슈 상태 정보
                    $modalAddProject.find("[name=issueStatusGroupSharingYn]").parent().removeClass("active");
                    $modalAddProject.find("[name=issueStatusGroupSharingYn]").prop('checked', false);
                    $modalAddProject.find("[name=issueStatusGroupSharingYn][value=" + data.issueStatusGroup.sharingYn +"]").parent().addClass("active");
                    $modalAddProject.find("[name=issueStatusGroupSharingYn][value=" + data.issueStatusGroup.sharingYn +"]").prop('checked', true);
                    $modalAddProject.find("[name=issueStatusGroupSharingYn]").trigger("change");
                    $modalAddProject.find("[name=issueStatusGroupId]").val(data.issueStatusGroupId).trigger("change");
                    if(data.issueStatusGroup.sharingYn == "Y") {
                        $modalAddProject.find("[data-row=issueStatusGroup]").show();
                    } else {
                        $modalAddProject.find("[data-row=issueStatusGroup]").hide();
                    }

                    // 분석 보관 개수
                    $modalAddProject.find("[name=maxScans]").val(data.maxScans);

                    // 사용자 상위 프로젝트 선택 가능
                    var $userParentProjectYn = $modalAddProject.find("[name=userParentProjectYn]");
                    if (data.userParentProjectYn == "Y") {
                        $userParentProjectYn.bootstrapToggle('on');
                    } else {
                        $userParentProjectYn.bootstrapToggle('off');
                    }

                    // 이관 제어 대상
                    var $vcsCheckYn = $modalAddProject.find("[name=vcsCheckYn]");
                    if (data.vcsCheckYn == "Y") {
                        $vcsCheckYn.bootstrapToggle('on');
                    } else {
                        $vcsCheckYn.bootstrapToggle('off');
                    }

                    // 프로젝트 구성원:테이블
                    $dataTableUserOrGroup.clear();
                    $userOrGroup.find("option").attr('disabled', false);
                    $.each(data.projectUsers, function(i) {
                        if (data.projectUsers[i].userName == null) {
                            data.projectUsers[i].userName = getSelectText($userOrGroup, 'u:' + data.projectUsers[i].userId);
                        }
                        $dataTableUserOrGroup.addRow({
                            id: 'u:' + data.projectUsers[i].userId,
                            userOrGroup : data.projectUsers[i].userName + "(" + data.projectUsers[i].userId + ")",
                            type: "user",
                            projectRoleCode : data.projectUsers[i].projectRoleCode,
                            administrable : data.administrable
                        });
                        //$userOrGroup.find("option[value='u:" + data.projectUsers[i].userId + "']").attr('disabled', true);
                        selectedUserOrGroupIds.push("u:" + data.projectUsers[i].userId);
                    });
                    $.each(data.projectUserGroups, function(i) {
                        if (data.projectUserGroups[i].userGroupName == null) {
                            data.projectUserGroups[i].userGroupName = getSelectText($userOrGroup, 'g:' + data.projectUserGroups[i].userGroupId);
                        }
                        $dataTableUserOrGroup.addRow({
                            id: 'g:' + data.projectUserGroups[i].userGroupId,
                            userOrGroup: data.projectUserGroups[i].userGroupName,
                            type: "userGroup",
                            projectRoleCode: data.projectUserGroups[i].projectRoleCode,
                            administrable: data.administrable
                        });
                        //$userOrGroup.find("option[value='g:" + data.projectUserGroups[i].userGroupId + "']").attr('disabled', true);
                        selectedUserOrGroupIds.push("g:" + data.projectUserGroups[i].userGroupId);
                    });
                    $dataTableUserOrGroup.draw();

                    // 프로젝트 구성원 : 프로젝트 사용자 콤보 박스
                    $userOrGroup.val("").trigger('change');
                    //$userOrGroup.select2();

                    // 분석 결과 제외 대상
                    $modalAddProject.find("[name=excludePaths]").val(data.excludePaths);
                    $modalAddProject.find("[name=excludeFuncs]").val(data.excludeFuncs);

                    // 프로젝트 경로(고급옵션)
                    $modalAddProject.find("[name=advProjectPaths]").val(data.advProjectPaths);
                    $modalAddProject.find("[name=advSourcePaths]").val(data.advSourcePaths);
                    $modalAddProject.find("[name=advWebContentsPaths]").val(data.advWebContentsPaths);
                }


                function setDisabled(administrable) {

                    var disabled = false;

                    // 관리 가능 여부
                    if (administrable) {
                        $modalAddProject.find("[name=userOrGroup]").parent().show();
                        $modalAddProject.find("[name=projectRoleCode]").parent().show();
                        $modalAddProject.find("[name=btnAddUserOrGroup]").parent().show();
                        disabled = false;
                    } else {
                        $modalAddProject.find("[name=userOrGroup]").parent().hide();
                        $modalAddProject.find("[name=projectRoleCode]").parent().hide();
                        $modalAddProject.find("[name=btnAddUserOrGroup]").parent().hide();
                        disabled = true;
                    }

                    $modalAddProject.find("[name=checkerGroupId]").attr("disabled", disabled);

                    $modalAddProject.find("[name=issueStatusGroupSharingYn]").parent().attr("disabled", disabled);
                    $modalAddProject.find("[name=issueStatusGroupId]").attr("disabled", disabled);
                    if (disabled) {
                        $modalAddProject.find("[name=issueStatusGroupSharingYn]").parent().css("pointer-events", "none");
                    } else {
                        $modalAddProject.find("[name=issueStatusGroupSharingYn]").parent().css("pointer-events", "");
                    }

                    $modalAddProject.find("[name=maxScans]").attr("disabled", disabled);
                    $modalAddProject.find("[name=vcsCheckYn]").attr("disabled", disabled);
                    if (disabled) {
                        $modalAddProject.find("[name=vcsCheckYn]").siblings().find(".btn").addClass("disabled");
                    }

                    $modalAddProject.find("[name=excludePaths]").attr("disabled", disabled);
                    $modalAddProject.find("[name=excludeFuncs]").attr("disabled", disabled);

                    $modalAddProject.find("[name=advProjectPaths]").attr("disabled", disabled);
                    $modalAddProject.find("[name=advSourcePaths]").attr("disabled", disabled);
                    $modalAddProject.find("[name=advWebContentsPaths]").attr("disabled", disabled);
                }

                setDisabled(sessionUserController.isAdmin());


                /*************************************************************************
                 * 이벤트
                 *************************************************************************/
                // 열리때마다 리로딩
                var init = true;
                $modalAddProject.on('show.bs.modal', function() {

                    if (init) {
                         // 상위 프로젝트
                        $modalAddProject.find('[data-name=selProjectTree]').dropdownFancytreeController({
                            ajax: {
                                url: "/api/1/projects/fancytree",
                            },
                            fancytree: {
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
                                                setDisabled(data.administrable)
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

                                    if (sessionUserController.isAdmin()) {
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
                    } else {
                        // 상위 프로젝트
                        $modalAddProject.find('[data-name=selProjectTree]').dropdownFancytreeController().reload();
                    }
                    init = false;

                    // 체커 그룹
                    $.ajaxRest({
                        url: "/api/1/checkers/groups/items",
                        type: "GET",
                        success: function(data, textStatus, header) {
                            $modalAddProject.find('[name=checkerGroupId]').select2Controller().resetItems(data);
                        }
                    });

                    // 상태 그룹
                    $.ajaxRest({
                        url: "/api/1/issues/status/groups/items",
                        type: "GET",
                        success: function(data, textStatus, header) {
                            $modalAddProject.find('[name=issueStatusGroupId]').select2Controller().resetItems(data);
                        }
                    });
                });


                // 계속 추가
                $modalAddProject.find('[name=btnAddContinue]').on('click', function(e) {
                    addProject(true);
                });

                // Alt+W 저장하고 계속 이벤트
                $modalAddProject.on('keydown', function(key) {
                    if ((event.which === 87 && event.altKey)) {
                        addProject(true);
                    }
                });

                // 저장
                $modalAddProject.find('[name=btnAdd]').on('click', function(e) {
                    addProject(false);
                });

                function addProject(saveContinueMode) {

                    var requestBody  = {};
                    if (sessionUserController.isAdmin()) {
                        requestBody.managementOnlyYn = $modalAddProject.find("[name=managementOnlyYn]").is(':checked') ? "Y" : "N";
                    }
                    requestBody.projectName = $modalAddProject.find("[name=projectName]").val();
                    requestBody.projectKey = $modalAddProject.find("[name=projectKey]").val();
                    requestBody.projectComment = $modalAddProject.find("[name=projectComment]").val();

                    // 상위 프로젝트 아이디(프로젝트 트리 체크)
                    var activeNode = $modalAddProject.find("[data-name=projectTree]").fancytree("getActiveNode");
                    if(activeNode != null) {
                        requestBody.parentId = parseInt(activeNode.key);
                    }

                    // 체커 그룹 아이디
                    requestBody.checkerGroupId = $modalAddProject.find("[name=checkerGroupId]").val();

                    // 이슈 상태 그룹
                    requestBody.issueStatusGroup = {};
                    requestBody.issueStatusGroup.sharingYn = $modalAddProject.find("[name=issueStatusGroupSharingYn]:checked").val();
                    requestBody.issueStatusGroupId = $modalAddProject.find("[name=issueStatusGroupId]").val();

                    // 분석 보관 개수
                    requestBody.maxScans = $modalAddProject.find("[name=maxScans]").val();

                    // 사용자 상위 프로젝트 선택 가능
                    if (sessionUserController.isAdmin()) {
                        requestBody.userParentProjectYn = $modalAddProject.find("[name=userParentProjectYn]").is(':checked') ? "Y" : "N";
                    }

                    // 이관 제어 대상
                    requestBody.vcsCheckYn = $modalAddProject.find("[name=vcsCheckYn]").is(':checked') ? "Y" : "N";

                    // 상호작용 프로젝트
                    requestBody.ihubProjectUid = $modalAddProject.find("[name=ihubProjectUid]").val();

                    // 프로젝트 구성원 : 프로젝트 사용자, 권한, 테이블
                    requestBody.projectUsers = [];
                    requestBody.projectUserGroups = [];
                    var tableData = $modalAddProject.find('[data-name=dataTableUserOrGroup]').dataTable().api().data();
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
                    requestBody.excludePaths = $modalAddProject.find("[name=excludePaths]").val();
                    requestBody.excludeFuncs = $modalAddProject.find("[name=excludeFuncs]").val();

                    // 프로젝트 경로(고급옵션)
                    requestBody.advProjectPaths = $modalAddProject.find("[name=advProjectPaths]").val();
                    requestBody.advSourcePaths = $modalAddProject.find("[name=advSourcePaths]").val();
                    requestBody.advWebContentsPaths = $modalAddProject.find("[name=advWebContentsPaths]").val();

                    $.ajaxRest({
                        url: "/api/1/projects/0",
                        type: "POST",
                        data: requestBody,
                        block: true,
                        beforeSend : function(xhr, settings) {
                            errorMsgHandler.clear($modalAddProject);
                        },
                        success: function(data, textStatus, header) {

                            if (saveContinueMode) {
                                // 프로젝트명 재설정
                                $modalAddProject.find('[name=projectName]').val('');
                                $modalAddProject.find('[name=projectKey]').val('');
                            } else {
                                // 모달 닫기
                                $modalAddProject.modal('hide');
                                // 모달 클리어
                                modalAddProject.clearModal();
                            }

                            // 프로젝트 목록 리로딩
                            if ($dataTableProjects != null) {
                                $dataTableProjects.draw();
                            } else {
                                swal({
                                    title: messageController.get("confirm.project.3"),
                                    type: "success",
                                    showCancelButton: true,
                                    confirmButtonText: messageController.get("label.go"),
                                    cancelButtonText : messageController.get('label.cancel'),
                                    closeOnConfirm: false
                                }, function(isConfirm) {
                                    if (isConfirm) {
                                        location.href = "/results/projects";
                                    }
                                });
                            }

                            // 프로젝트 트리 재설정
                            $modalAddProject.find('[data-name=selProjectTree]').dropdownFancytreeController().reload();

                            // 메세지 표시
                            $.toastGreen({
                                text: messageController.get("label.project") + ' ' + data.projectName + ' ' + messageController.get("label.has.been.added")
                            });
                        },
                        error: function(hdr, status) {

                            var errors = JSON.parse(hdr.responseText);

                            var $selectedCollapse = null;
                            $modalAddProject.find(".collapse").each(function(){
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

                            errorMsgHandler.show($modalAddProject, errors);
                        }
                    });
                }
            }

            ModalAddProject.prototype.clearModal = function() {

                // 관리 전용
                $modalAddProject.find("[name=managementOnlyYn]").bootstrapToggle('off');
                // 프로젝트 이름
                $modalAddProject.find('[name=projectName]').val("");
                // 프로젝트 키
                $modalAddProject.find("[name=projectKey]").val("");
                // 설명
                $modalAddProject.find("[name=projectComment]").val("");
                // 상위 프로젝트 명 초기화
                $modalAddProject.find('[data-name=selProjectTree]').find(".tree-select").val("");
                // 상위 프로젝트(프로젝트 트리 체크)
                var projectTree = $modalAddProject.find('[data-name=projectTree]').fancytree("getTree");
                if(projectTree) {
                    projectTree.visit(function(node) {
                        node.setActive(false);
                    });
                }
                // 체커 그룹
                $modalAddProject.find('[name=checkerGroupId]').val("").trigger('change');
                // 이슈 상태 그룹
                $modalAddProject.find('[name=issueStatusGroupId]').val("").trigger('change');
                // 분석 보관수
                $modalAddProject.find("[name=maxScans]").val("");
                // 사용자 상위 프로젝트 선택 가능
                $modalAddProject.find("[name=userParentProjectYn]").bootstrapToggle('on');
                // 이관 제어 대상
                $modalAddProject.find("[name=vcsCheckYn]").bootstrapToggle('on');
                // 상호작용 프로젝트
                $modalAddProject.find("[name=ihubProjectUid]").val("").trigger('change');

                // 프로젝트 구성원 : 프로젝트 사용자, 권한, 테이블
                selectedUserOrGroupIds = [];
                $modalAddProject.find("[name=userOrGroup]").val("").trigger('change');
                $modalAddProject.find("[name=projectRoleCode]").val("").trigger('change');
                $modalAddProject.find("[data-name=dataTableUserOrGroup]").DataTable().clear();
                $modalAddProject.find("[data-name=dataTableUserOrGroup]").DataTable().draw();

                // 분석 결과 제외 대상
                $modalAddProject.find("[name=excludePaths]").val("");
                $modalAddProject.find("[name=excludeFuncs]").val("");

                // 프로젝트 경로(고급옵션)
                $modalAddProject.find("[name=advProjectPaths]").val("");
                $modalAddProject.find("[name=advSourcePaths]").val("");
                $modalAddProject.find("[name=advWebContentsPaths]").val("");
            }

            // 프로젝트 데이터 테이블 설정
            ModalAddProject.prototype.setDataTableProjects = function(dataTableProjects) {
                $dataTableProjects = dataTableProjects;
            }

            return ModalAddProject;
        })();

        $.fn.modalAddProject = function() {

            var $this = $(this);
            var data = $this.data("modalAddProject");

            //data가  없으면 Default로 새로 생성
            if(!data) {
                $this.data('modalAddProject', data = new ModalAddProject(this, arguments[0]));
            }

            return data;
        }

    })(window.jQuery, window);

    modalAddProject = $("#modalAddProject").modalAddProject();
});

var modalAddProject = null;