
$(function() {

    (function($, window) {

        var ModalBatchModifyProject = (function() {

            var $modalBatchModifyProject = null;
            var $dataTableUserOrGroup = null;

            var $dataTableProjects = null;
            var $searchOption = null;
            var selectedProjectIds = null;

            var selectedUserOrGroupIds = [];

            function ModalBatchModifyProject(element, options) {

                /*************************************************************************
                 * 변수
                 *************************************************************************/
                $modalBatchModifyProject = $(element);

                /*************************************************************************
                 * 컴포넌트
                 *************************************************************************/
                // 상위 프로젝트
                $modalBatchModifyProject.find('[data-name=selProjectTree]').dropdownFancytreeController({
                    ajax: {
                        url: "/api/1/projects/fancytree",
                    },
                    fancytree: {
                        selectMode: 1,
                        checkbox: false
                    }
                });

                // 체커 그룹
                $.ajaxRest({
                    url: "/api/1/checkers/groups/items",
                    type: "GET",
                    success: function(data, textStatus, header) {
                        $modalBatchModifyProject.find('[name=checkerGroupId]').select2Controller({ data : data });
                    }
                });
                $modalBatchModifyProject.find('[name=issueStatusGroupSharingYn]').on('change', function(e) {
                    if ($(this).val() == "Y") {
                        $modalBatchModifyProject.find("[data-row=issueStatusGroup]").show();
                    } else {
                        $modalBatchModifyProject.find("[data-row=issueStatusGroup]").hide();
                    }
                });

                // 이슈 상태 그룹
                $.ajaxRest({
                    url: "/api/1/issues/status/groups/items",
                    type: "GET",
                    success: function(data, textStatus, header) {
                        $modalBatchModifyProject.find('[name=issueStatusGroupId]').select2Controller({ data : data });
                    }
                });

                // 상호작용 프로젝트
                if ($modalBatchModifyProject.find("[name=ihubProjectUid]").length > 0) {
                    $.ajaxRest({
                        url: "/api/1/ihub/projects/items",
                        type: "GET",
                        success: function (data, textStatus, header) {
                            data.unshift({id: 0, text: messageController.get('label.no.setting')});
                            $modalBatchModifyProject.find(".row-ihub-project-uid").show();
                            $modalBatchModifyProject.find('[name=ihubProjectUid]').select2Controller({data: data});
                        },
                        beforeError: function (hdr, status) {
                            return false;
                        }
                    });
                }

                // 프로젝트 구성원: 사용자 및 그룹
                $modalBatchModifyProject.find('[name=userOrGroup]').select2Controller({
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
                        $modalBatchModifyProject.find("[name=projectRoleCode]").select2Controller({ minimumResultsForSearch: -1, data : data });
                    }
                });

                // 추가 버튼
                $modalBatchModifyProject.find("[name=btnAddUserOrGroup]").on('click', function(e) {

                    if($modalBatchModifyProject.find("[name=userOrGroup]").val() == null) {
                        //405019=구성원을 입력해 주세요.
                        swal(messageController.get('405019'));
                        return;
                    }
                    if($modalBatchModifyProject.find("[name=projectRoleCode]").val() == null ) {
                        // 405020=역할을 입력해 주세요.
                        swal(messageController.get('405020'));
                        return;
                    }

                    $.each($modalBatchModifyProject.find("[name=userOrGroup]").select2('data'), function(i) {
                        // 아이디
                        var id = $modalBatchModifyProject.find("[name=userOrGroup]").select2('data')[i].id;

                        // 구성원(사용자)
                        var userOrGroup = $modalBatchModifyProject.find("[name=userOrGroup]").select2('data')[i].text;
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
                            projectRoleCode: $modalBatchModifyProject.find("[name=projectRoleCode]").val() // 역할
                        });

                        selectedUserOrGroupIds.push(id);
                    });
                    $dataTableUserOrGroup.draw();

                    $modalBatchModifyProject.find("[name=userOrGroup]").val("").trigger('change');
                });

                // 프로젝트 구성원:테이블
                $dataTableUserOrGroup = $modalBatchModifyProject.find("[data-name=dataTableUserOrGroup]").dataTableController({
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
                           return '<i class="fa fa-trash active-hover" value="' + row.id + '"></i>';
                       }
                    }],
                    drawCallback : function() {
                        //삭제 이벤트
                        $modalBatchModifyProject.find('[data-name=dataTableUserOrGroup]').find('td i.fa-trash').unbind( "click" );
                        $modalBatchModifyProject.find('[data-name=dataTableUserOrGroup] td i.fa-trash').on('click', function() {
                            $modalBatchModifyProject.find('[data-name=dataTableUserOrGroup]').DataTable().row($(this).parents('tr')).remove().draw();
                            selectedUserOrGroupIds.splice( selectedUserOrGroupIds.indexOf($(this).attr('value')), 1 );
                        });
                    }
                });

                // 분석 결과 제외 대상
                $.ajaxRest({
                    url: "/api/1/admin/globalExcludedTarget",
                    type: "GET",
                    success: function(data, textStatus, header) {
                        $modalBatchModifyProject.find('[name=globalExcludedPaths]').text(data.paths);
                        $modalBatchModifyProject.find('[name=globalExcludedFuncs]').text(data.funcs);
                    }
                });


                /*************************************************************************
                 * 이벤트
                 *************************************************************************/
                $modalBatchModifyProject.on('show.bs.modal', function() {
                    $modalBatchModifyProject.find('[data-name=selProjectTree]').dropdownFancytreeController().reload();
                });

                // 일괄 수정
                $modalBatchModifyProject.find('[name=btnBatchModify]').on('click', function(e) {

                    var selectedIds = $dataTableProjects.getSelectedIds('projectId');
                    var requestBody = {};
                    if($dataTableProjects.isAllSelected()) {
                        requestBody.searchOption = $searchOption;
                    } else {
                        requestBody.ids = selectedIds
                    }

                    requestBody.data = {};

                    var isModify = false;
                    if ($modalBatchModifyProject.find('[name=chkProjectComment]').is(':checked')) {
                        requestBody.data.projectComment = $modalBatchModifyProject.find("[name=projectComment]").val();
                        isModify = true;
                    }

                    if ($modalBatchModifyProject.find('[name=chkParentId]').is(':checked')) {
                        var activeNode = $modalBatchModifyProject.find("[data-name=projectTree]").fancytree("getActiveNode");
                        if(activeNode != null) {
                            requestBody.data.parentId = parseInt(activeNode.key);
                            isModify = true;
                        }
                    }

                    if ($modalBatchModifyProject.find('[name=chkCheckerGroupId]').is(':checked')) {
                        requestBody.data.checkerGroupId = $modalBatchModifyProject.find("[name=checkerGroupId]").val();
                        isModify = true;
                    }
                    if ($modalBatchModifyProject.find('[name=chkIssueStatusGroupId]').is(':checked')) {
                        requestBody.data.issueStatusGroup = {};
                        requestBody.data.issueStatusGroup.sharingYn = $modalBatchModifyProject.find("[name=issueStatusGroupSharingYn]:checked").val();
                        requestBody.data.issueStatusGroupId = $modalBatchModifyProject.find("[name=issueStatusGroupId]").val();
                        isModify = true;
                    }
                    if ($modalBatchModifyProject.find('[name=chkMaxScans]').is(':checked')) {
                        requestBody.data.maxScans = $modalBatchModifyProject.find("[name=maxScans]").val();
                        isModify = true;
                    }
                    if ($modalBatchModifyProject.find('[name=chkVcsCheckYn]').is(':checked')) {
                        requestBody.data.vcsCheckYn = $modalBatchModifyProject.find("[name=vcsCheckYn]").prop('checked') ? "Y" : "N";
                        isModify = true;
                    }
                    if ($modalBatchModifyProject.find('[name=chkIhubProjectUidYn]').is(':checked')) {
                        requestBody.data.ihubProjectUid = $modalBatchModifyProject.find("[name=ihubProjectUid]").val();
                        isModify = true;
                    }
                    if ($modalBatchModifyProject.find('[name=chkUserOrGroup]').is(':checked')) {
                        requestBody.data.projectUsers = [];
                        requestBody.data.projectUserGroups = [];
                        var tableData = $modalBatchModifyProject.find('[data-name=dataTableUserOrGroup]').dataTable().api().data();
                        $.each(tableData, function(index) {
                            var temp = tableData[index].id.substring(0, 1);
                            if (temp == 'u') {
                                requestBody.data.projectUsers.push({
                                    userId : tableData[index].id.substring(2),
                                    projectRoleCode : tableData[index].projectRoleCode
                                });
                            } else if (temp == 'g') {
                                requestBody.data.projectUserGroups.push({
                                    userGroupId : parseInt(tableData[index].id.substring(2)),
                                    projectRoleCode : tableData[index].projectRoleCode
                                });
                            }
                        });
                        isModify = true;
                    }
                    if ($modalBatchModifyProject.find('[name=chkExcludePath]').is(':checked')) {
                        requestBody.data.excludePaths = $modalBatchModifyProject.find("[name=excludePaths]").val();
                        isModify = true;
                    }
                    if ($modalBatchModifyProject.find('[name=chkExcludeFunc]').is(':checked')) {
                        requestBody.data.excludeFuncs = $modalBatchModifyProject.find("[name=excludeFuncs]").val();
                        isModify = true;
                    }

                    if ($modalBatchModifyProject.find('[name=chkAdvPaths]').is(':checked')) {
                        requestBody.data.advProjectPaths = $modalBatchModifyProject.find("[name=advProjectPaths]").val();
                        requestBody.data.advSourcePaths = $modalBatchModifyProject.find("[name=advSourcePaths]").val();
                        requestBody.data.advWebContentsPaths = $modalBatchModifyProject.find("[name=advWebContentsPaths]").val();
                        isModify = true;
                    }

                    // 체크된 항목 없으면 알림
                    if (isModify == false){
                        swal(messageController.get('400025'));
                        return false;
                    }

                    // 일괄 수정
                    $.ajaxRest({
                        url: "/api/1/projects",
                        type: "PUT",
                        data: requestBody,
                        block: true,
                        beforeSend: function(xhr, settings) {
                            errorMsgHandler.clear($modalBatchModifyProject);
                        },
                        success: function(data, textStatus, header) {
                            $modalBatchModifyProject.modal('hide');
                            $dataTableProjects.draw();
                            $.toastGreen({
                                text: messageController.get("label.project") + " " + messageController.get("label.has.been.modified")
                            });
                        },
                        error: function(hdr, status) {

                            var errors = JSON.parse(hdr.responseText);

                            var $selectedCollapse = null;
                            $modalBatchModifyProject.find(".collapse").each(function(){
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

                            errorMsgHandler.show($modalBatchModifyProject, errors);
                        }
                    });
                });
            }

            ModalBatchModifyProject.prototype.clearModal = function() {

                // 에러 메세지 제거
                errorMsgHandler.clear($modalBatchModifyProject);

                // 일괄 수정 : 체크 박스
                $modalBatchModifyProject.find(".checkbox input[type=checkbox]").prop('checked', false);

                // 설명
                $modalBatchModifyProject.find("[name=projectComment]").val("");
                // 상위 프로젝트 명 초기화
                $modalBatchModifyProject.find('[data-name=selProjectTree]').find(".tree-select").val("");
                // 체커 그룹 아이디
                $modalBatchModifyProject.find("[name=checkerGroupId]").val("").trigger('change');
                // 이슈 상태 정보 그룹 아이디
                $modalBatchModifyProject.find("[name=issueStatusGroupId]").val("").trigger('change');
                // 분석 결과 개수
                $modalBatchModifyProject.find("[name=maxScans]").val("");
                // 이관 제어 대상
                $modalBatchModifyProject.find("[name=vcsCheckYn]").bootstrapToggle('on');

                // 프로젝트 구성원 : 프로젝트 사용자, 권한, 테이블
                selectedUserOrGroupIds = [];
                $modalBatchModifyProject.find("[name=userOrGroup]").val("").trigger('change');
                $modalBatchModifyProject.find("[name=projectRoleCode]").val("").trigger('change');
                $modalBatchModifyProject.find("[data-name=dataTableUserOrGroup]").DataTable().clear();
                $modalBatchModifyProject.find("[data-name=dataTableUserOrGroup]").DataTable().draw();

                // 분석 결과 제외 대상 : 제외 경로, 제외 함수
                $modalBatchModifyProject.find("[name=excludePaths]").val("");
                $modalBatchModifyProject.find("[name=excludeFuncs]").val("");

                // 프로젝트 경로(고급 옵션)
                $modalBatchModifyProject.find("[name=advProjectPaths]").val("");
                $modalBatchModifyProject.find("[name=advSourcePaths]").val("");
                $modalBatchModifyProject.find("[name=advWebContentsPaths]").val("");
            }

            // 프로젝트 일괄 수정 버튼 눌렸을 때
            ModalBatchModifyProject.prototype.openModelProjectBatchModify = function(projectIds, searchOption) {

                if (projectIds.length == 0) {
                    swal(messageController.get('405011'));
                    return;
                }

                // 선택한 프로젝트
                selectedProjectIds = projectIds;

                $searchOption = searchOption;

                modalBatchModifyProject.clearModal();
                $modalBatchModifyProject.modal("show");
            }

            // 프로젝트 데이터 테이블 설정
            ModalBatchModifyProject.prototype.setDataTableProjects = function(dataTableProjects) {
                $dataTableProjects = dataTableProjects;
            }

            return ModalBatchModifyProject;
        })();

        $.fn.modalBatchModifyProject = function() {

            var $this = $(this);
            var data = $this.data("modalBatchModifyProject");

            //data가  없으면 Default로 새로 생성
            if (!data) {
                $this.data('modalBatchModifyProject', data = new ModalBatchModifyProject(this, arguments[0]));
            }

            return data;
        }

    })(window.jQuery, window);

    modalBatchModifyProject = $("#modalBatchModifyProject").modalBatchModifyProject();
});

var modalBatchModifyProject = null;