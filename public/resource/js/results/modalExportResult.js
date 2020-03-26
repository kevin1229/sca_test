/**
 * Modal Export Result
 *
 * @author kimkc
 * @author wjdgusdh
 */
$(function () {
    (function ($, window) {
        var isReportTemplateEnable = ($('#isReportTemplateEnable').val() === 'true');

        $.fn.modalExportResult = function () {

            var $modalExport = $(this);
            var options = arguments[0];

            var $tabPaneExportProjects = $modalExport.find("#tabPaneExportProjects");
            var $tabPaneExportScans = $modalExport.find("#tabPaneExportScans");
            var $tabPaneExportIssues = $modalExport.find("#tabPaneExportIssues");

            // 메인 화면에서 내보내기 버튼 클릭 이벤트
            $('#btnModalExportResults').on('click', function () {
                $modalExport.modal('show');
            });

            // 모달 오픈
            $modalExport.on('show.bs.modal', function () {

                if (options.page == "projects") {
                    var activeTab = "tabPaneExportProjects";
                }
                else if (options.page == "scans") {
                    $tabPaneExportProjects.remove();
                    $modalExport.find("#tabExportProjectList").remove();

                    activeTab = "tabPaneExportScans";
                }
                else if (options.page == "issues") {
                    $tabPaneExportProjects.remove();
                    $modalExport.find("#tabExportProjectList").remove();

                    $tabPaneExportScans.remove();
                    $modalExport.find("#tabExportScanList").remove();

                    $modalExport.find("#jiraFormat").show();
                    activeTab = "tabPaneExportIssues";
                }

                if ($modalExport.find(".nav.nav-tabs .active").length == 0) {
                    $modalExport.find('.nav-tabs a[data-target="#' + activeTab + '"]').tab('show');
                }

                // 내보 파일 목록 설정 및 파일 형식 변경
                var $exportDataSelecteds = $modalExport.find(':radio[name="exportData"][value="selected"]');
                if (options.fnGetSelectedIds().length == 0) {
                    // 선택이 된 목록이 없다면, 기존에 "선택된 목록"을 "전체 목록"으로 변경한다.
                    $modalExport.find(':radio[name="exportData"][value="selected"]:checked').parent().parent().find(':radio[name="exportData"][value="all"]').prop("checked", true);
                    $exportDataSelecteds.attr("disabled", true);
                    $modalExport.find(':radio[name="fileFormat"]').prop("checked", false);
                }
                else {
                    $exportDataSelecteds.attr("disabled", false);
                    $modalExport.find(':radio[name="fileFormat"]').prop("checked", false);
                }

                // 내보내기 선택 항목 초기화 (활성화 비활성화 등 처리)
                // 이슈 화면과 그외 화면으로 분리 처리함.
                // 이슈는 이슈화면 이외에서는 전체 및 필터 내보내기 불가능 하도록 처리함.
                if (options.page == "issues") {
                    $tabPaneExportIssues.find('[name="radio-all"]').attr('disabled', false).show();
                    $tabPaneExportIssues.find('[name="radio-filtered"]').attr('disabled', false).show();

                    if (options.fnGetSelectedIds().length == 0) {
                        // 선택이 된 목록이 없다면, 기존에 "선택된 목록"을 "전체 목록"으로 변경한다.
                        $tabPaneExportIssues.find(':radio[name="exportData"][value="selected"]:checked').parent().parent().find(':radio[name="exportData"][value="all"]').prop("checked", true);
                        $tabPaneExportIssues.find(':radio[name="exportData"][value="selected"]').attr('disabled', true);
                    }
                    else {
                        $tabPaneExportIssues.find(':radio[name="exportData"][value="selected"]').attr('disabled', false);
                    }
                }
                else {
                    // 이슈 내보내기 파일 목록 설정 및 파일 형식 변경
                    if (options.fnGetSelectedIds().length == 0) {
                        // 선택이 된 목록이 없다면, 기존에 "선택된 목록"을 "전체 목록"으로 변경한다.
                        $tabPaneExportIssues.find(':radio[name="exportData"]').attr('disabled', true);
                        $tabPaneExportIssues.find(':radio[name="exportData"]').prop("checked", false);

                        $tabPaneExportIssues.find(':radio[name="fileFormat"]').attr('disabled', true);
                        $tabPaneExportIssues.find(':radio[name="fileFormat"]').prop("checked", false);
                    }
                    else {
                        $tabPaneExportIssues.find(':radio[name="exportData"]').attr('disabled', false);
                        $tabPaneExportIssues.find(':radio[name="exportData"][value="selected"]').prop("checked", true);

                        $tabPaneExportIssues.find(':radio[name="fileFormat"]').attr('disabled', false);
                        // $tabPaneExportIssues.find(':radio[name="fileFormat"][value="excel"]').prop("checked", true);
                    }
                }

                $tabPaneExportIssues.find(".row-report-template").hide();
                var selectedFileFormat = $tabPaneExportIssues.find(':radio[name="fileFormat"]:checked').val();
                if (selectedFileFormat == "docx" || selectedFileFormat == "pdf"
                    || selectedFileFormat == "pptx" || selectedFileFormat == "odt" ) {
                    if(isReportTemplateEnable == true) {
                        $tabPaneExportIssues.find(".row-report-template").show();
                    }
                }

                $tabPaneExportIssues.find(".row-jira").hide();

                function changeExportData() {
                    var $fileFormatIPlatform = $tabPaneExportScans.find(':radio[name="fileFormat"][value="ihub"]');
                    var $fileFormatRedmine = $tabPaneExportScans.find(':radio[name="fileFormat"][value="redmine"]');
                    var $fileFormatJira = $tabPaneExportScans.find(':radio[name="fileFormat"][value="jira"]');

                    if ($tabPaneExportScans.find(':radio[name="exportData"]:checked').val() != "selected") {
                        // 선택이 된 목록이 없다면, 기존에 "통합 관리 시스템"을 "Excel"로 변경한다.
                        $modalExport.find(':radio[name="fileFormat"][value="ihub"]:checked').parent().parent().find(':radio[name="fileFormat"][value="excel"]').prop("checked", true);
                        $fileFormatIPlatform.attr("disabled", true);
                        $fileFormatRedmine.attr("disabled", true);
                        $fileFormatJira.attr("disabled", true);
                    } else {
                        $exportDataSelecteds.attr("disabled", false);
                        $fileFormatIPlatform.attr("disabled", false);
                        $fileFormatRedmine.attr("disabled", false);
                        $fileFormatJira.attr("disabled", false);
                    }
                }

                changeExportData();

                $tabPaneExportScans.find(':radio[name=exportData]').on('change', function () {
                    changeExportData();
                });

                $tabPaneExportScans.find(':radio[name=fileFormat]').on('change', function () {

                    var $this = $(this);

                    $tabPaneExportScans.find(".row-ihub").hide();
                    $tabPaneExportScans.find(".row-redmine").hide();
                    $tabPaneExportScans.find(".row-jira").hide();

                    if ($this.val() == "ihub") {
                        $("#row-ihub").show();
                        $.ajaxRest({
                            url: "/api/1/ihub/projects/items",
                            type: "GET",
                            success: function (data, textStatus, header) {
                                $tabPaneExportScans.find(".row-ihub-project-uid").show();
                                $tabPaneExportScans.find('[name=projectUid]').select2Controller({data: data});
                            },
                            beforeError: function (hdr, status) {
                                return false;
                            }
                        });
                    }
                    else if ($this.val() == "redmine") {

                        $tabPaneExportScans.find('[name=redmineServerId]').off('change');

                        $.ajaxRest({
                            url: "/api/1/redmine/servers/items",
                            type: "GET",
                            success: function (data, textStatus, header) {

                                $tabPaneExportScans.find(".row-redmine-server-id").show();

                                var $redmineServerId = $tabPaneExportScans.find('[name=redmineServerId]');
                                $redmineServerId.select2Controller({data: data, refresh: true});
                                $redmineServerId.on("change", function () {

                                    if ($redmineServerId.val() == null || $redmineServerId.val() == "")
                                        return;

                                    $.ajaxRest({
                                        url: "/api/1/redmine/servers/" + $redmineServerId.val() + "/projectItems",
                                        type: "GET",
                                        block: true,
                                        beforeSend: function (xhr, settings) {
                                            errorMsgHandler.clear($tabPaneExportScans);
                                        },
                                        success: function (data, textStatus, header) {

                                            $tabPaneExportScans.find(".row-redmine-project-id").show();

                                            var $redmineProjectId = $tabPaneExportScans.find('[name=redmineProjectId]');
                                            $redmineProjectId.select2Controller({data: data});
                                            $redmineProjectId.on("change", function () {

                                                if ($redmineProjectId.val() == null || $redmineProjectId.val() == "")
                                                    return;

                                                $.ajaxRest({
                                                    url: "/api/1/redmine/servers/" + $redmineServerId.val() + "/projects/" + $redmineProjectId.val() + "/assigneeItems",
                                                    type: "GET",
                                                    success: function (data, textStatus, header) {
                                                        $tabPaneExportScans.find(".row-redmine-assignee-id").show();
                                                        $tabPaneExportScans.find('[name=redmineAssigneeId]').select2Controller({data: data});
                                                    },
                                                    error: function (hdr, status) {
                                                        errorMsgHandler.swal(hdr.responseText);
                                                    }
                                                });
                                            });
                                        },
                                        error: function (hdr, status) {
                                            errorMsgHandler.swal(hdr.responseText);
                                        }
                                    });
                                });

                            },
                            error: function (hdr, status) {
                                errorMsgHandler.swal(hdr.responseText);
                            }
                        });
                    }
                });

                $tabPaneExportIssues.find(':radio[name=fileFormat]').on('change', function () {

                    var $this = $(this);

                    $tabPaneExportIssues.find(".row-report-template").hide();
                    $tabPaneExportIssues.find(".row-jira").hide();
                    $tabPaneExportIssues.find(':radio[name=fileFormat]').prop("checked", false);
                    $this.prop("checked", true);
                    if ($this.val() == "docx" || $this.val() == "pdf" || $this.val() == "pptx"|| $this.val() == "odt") {
                        if(isReportTemplateEnable == true) {
                            $tabPaneExportIssues.find(".row-report-template").show();
                        }
                    } else if ($this.val() == "jira") {

                        $tabPaneExportIssues.find('[name=jiraServerId]').off('change');

                        $.ajaxRest({
                            url: "/api/1/jira/servers",
                            type: "POST",
                            success: function (data, textStatus, header) {

                                $tabPaneExportIssues.find(".row-jira-server-id").show();
                                var list = [];
                                $.each(data.list, function (index, value) {
                                    list.push({
                                        id: value.jiraServerId,
                                        text: value.jiraServerName + '(' + value.jiraProjectKey + ')',
                                        key: value.jiraProjectKey
                                    })
                                });

                                var $jiraServerId = $tabPaneExportIssues.find('[name=jiraServerId]');
                                $jiraServerId.select2Controller({data: list, refresh: true});
                                $jiraServerId.on("change", function (e) {

                                    if ($jiraServerId.val() == null || $jiraServerId.val() == "")
                                        return;

                                    var data = {
                                        jiraServerId: $jiraServerId.val(),
                                        jiraProjectKey: $(e.target).select2('data')[0].key
                                    };

                                    $.ajaxRest({
                                        url: "/api/1/jira/servers/projectUserItems/",
                                        type: "POST",
                                        data: data,
                                        block: true,
                                        beforeSend: function (xhr, settings) {
                                            errorMsgHandler.clear($tabPaneExportScans);
                                        },
                                        success: function (data, textStatus, header) {
                                            $tabPaneExportIssues.find(".row-jira-assignee-name").show();
                                            $tabPaneExportIssues.find("[name=jiraAssigneeName]").empty();
                                            $tabPaneExportIssues.find("[name=jiraAssigneeName]").select2Controller({data: data, refresh: true, allowClear: true});
                                        },
                                        error: function (hdr, status) {
                                            errorMsgHandler.swal(hdr.responseText);
                                        }
                                    });
                                });

                            },
                            error: function (hdr, status) {
                                errorMsgHandler.swal(hdr.responseText);
                            }
                        });
                    }
                });

                // 보고서 템플릿 아이템 로딩.
                $.ajaxRest({
                    url: "/api/1/report/templates/items",
                    type: "GET",
                    success: function (data, textStatus, header) {
                        var $select2 = $tabPaneExportIssues.find('[name=reportTemplateId]').select2Controller(
                            {
                                data: data.sort(
                                    function sortByName(a,b) {
                                        return b.text < a.text ? 1 : b.text > a.text ? -1 : 0;
                                    }),
                                minimumResultsForSearch: 0
                            });

                        if(isReportTemplateEnable !== true) {
                            $select2.val(1000000).trigger('change.select2');
                        }
                    },
                    error: function (hdr, status) {
                        errorMsgHandler.swal(hdr.responseText);
                    }
                });

            });


            // 모달안에서 내보내기 버튼 클릭
            $modalExport.find('[name=btnExport]').on('click', function () {
                var tabPaneId = $modalExport.find(".tab-pane.active").attr("id");

                var $tabPane = $("#" + tabPaneId);

                var fileFormat = $tabPane.find(':radio[name="fileFormat"]:checked').val();
                var exportData = $tabPane.find(':radio[name="exportData"]:checked').val();

                // 파일 포멧 과 내보내기 데이터를 선택 하지 않은 경우 에러.
                if( !(exportData && fileFormat) ){
                    swal(messageController.get('400025'));
                    return;
                }

                var url = null;
                var requestBody = null;

                if (options.page == "projects") { // 화면 [전체결과 > 전체 프로젝트]

                    if (tabPaneId == "tabPaneExportProjects") {
                        // 프로젝트 목록
                        url = "/api/1/projects/export/" + fileFormat;
                    } else if (tabPaneId == "tabPaneExportScans") {
                        // 분석 목록
                        url = "/api/1/projects/export/" + fileFormat + "/scans";
                    } else if (tabPaneId == "tabPaneExportIssues") {
                        //이슈 목록
                        url = "/api/1/projects/export/" + fileFormat + "/issues";
                    }

                    // 내보내기 포멧 설정
                    if (exportData == "filtered" || options.dataTable.isAllSelected()) {
                        // 필터된 목록
                        requestBody = {
                            sortList : [],
                            searchOption : options.searchOption
                        };
                    } else if (exportData == "selected") {
                        // 선택된 목록
                        requestBody = {
                            sortList: [],
                            searchOption: {
                                projectIds: options.fnGetSelectedIds()
                            }
                        };
                    }

                } else if (options.page == "scans") { // 화면 [전체결과 > 분석 목록], [프로젝트 > 분석 목록]
                    if (tabPaneId == "tabPaneExportScans") {
                        // 분석 목록
                        url = "/api/1/scans/export/" + fileFormat;
                    } else if (tabPaneId == "tabPaneExportIssues") {
                        // 이슈 목록
                        url = "/api/1/scans/export/" + fileFormat + "/issues"
                    }

                    // 내보내기 포멧 설정
                    if(exportData == "all") {
                        // 모든 목록
                        requestBody = {
                            sortList : [],
                            searchOption : {
                                projectId : options.searchOption.projectId
                            }
                        };
                    } else if (exportData == "filtered" || options.dataTable.isAllSelected()) {
                        // 필터된 목록
                        requestBody = {
                            sortList : [],
                            searchOption : options.searchOption
                        };
                    } else if (exportData == "selected") {
                        // 선택된 목록
                        requestBody = {
                            sortList: [],
                            searchOption: {
                                projectId: options.searchOption.projectId,
                                scanIds: options.fnGetSelectedIds()
                            }
                        };
                    }

                } else if (options.page == "issues") {
                    // 화면 [분석 결과 > 이슈 목록]
                    // 이슈 목록
                    url = "/api/1/issues/export/" + fileFormat;

                    // 내보내기 포멧 설정
                    if (exportData == "all") {
                        // 모든 목록
                        requestBody = {
                            "sortList": [],
                            "searchOption": {
                                scanId: options.searchOption.scanId,
                                groupId: options.searchOption.groupId
                            }
                        };
                    }  else if (exportData == "filtered" || options.dataTable.isAllSelected()) {
                        // 필터된 목록
                        requestBody = {
                            "sortList": [],
                            "searchOption": options.searchOption
                        };
                    } else if (exportData == "selected") {
                        // 선택된 목록
                        requestBody = {
                            "sortList": [],
                            "searchOption": {
                                scanId: options.searchOption.scanId,
                                issueIds: options.fnGetSelectedIds()
                            }
                        };
                    }
                }

                if (fileFormat == "docx" || fileFormat == "pdf" || fileFormat == "pptx" || fileFormat == "odt") {
                    var templateId = $tabPaneExportIssues.find('[name=reportTemplateId]').val();
                    if (templateId == null) {
                        var errors = [];
                        errors.push({field: "reportTemplateId", message: messageController.get(400002)});
                        errorMsgHandler.show($tabPane.find("form"), errors);
                        return;
                    }
                    url += "/template/" + templateId;
                }

                if (fileFormat == "ihub") {
                    var projectUid = $tabPane.find("[name=projectUid]").val();
                    if (projectUid == null) {
                        var errors = [];
                        errors.push({field: "projectUid", message: messageController.get(400002)});
                        errorMsgHandler.show($tabPane.find("form"), errors);
                        return;
                    }
                    requestBody.projectUid = projectUid;
                } else if (fileFormat == "redmine") {
                    requestBody.redmineServerId = $tabPane.find("[name=redmineServerId]").val();
                    requestBody.redmineProjectId = $tabPane.find("[name=redmineProjectId]").val();
                    requestBody.redmineAssigneeId = $tabPane.find("[name=redmineAssigneeId]").val();
                } else if (fileFormat == "jira") {
                    requestBody.jiraServerId = $tabPane.find("[name=jiraServerId]").val();
                    requestBody.jiraProjectKey = $($tabPane.find("[name=jiraServerId]")).select2('data')[0].key;
                    requestBody.jiraAssigneeName = $tabPane.find("[name=jiraAssigneeName]").select2('data')[0].text;
                }

                $.ajaxRest({
                    url: url,
                    type: "POST",
                    data: requestBody,
                    block: true,
                    beforeSend: function (xhr, settings) {
                        errorMsgHandler.clear($tabPaneExportScans.find("form"));
                        xhr.setRequestHeader("timeZoneOffset", new Date().getTimezoneOffset());
                    },
                    success: function (data, status, header) {
                        $modalExport.modal('hide');
                    },
                    error: function (hdr, status) {
                        errorMsgHandler.show($tabPaneExportScans, hdr.responseText);
                    }
                });
            });

           // jira 프로젝트를 선택해서 값이 변경될 경우 해당 프로젝트의 사용자 목록을 가져온다
            $tabPaneExportScans.find("[name=jiraProjectKey]").on('change', function () {
                var jiraServerId = $tabPaneExportScans.find("[name=jiraServerId]").val();
                var jiraProjectKey = $tabPaneExportScans.find("[name=jiraProjectKey]").find(":selected").val();
                $tabPaneExportScans.find("[name=jiraAssigneeName]").empty();

                if (jiraProjectKey != undefined) {
                    $.ajaxRest({
                        url: "/api/1/jira/servers/users/items/"+jiraServerId+"/"+jiraProjectKey,
                        type: "GET",
                        success: function (data, textStatus, header) {
                            $tabPaneExportScans.find("[name=jiraAssigneeName]").select2Controller({data: data, refresh: true});
                        },
                        beforeError: function (hdr, status) {
                            return false;
                        }
                    });
                }
            });
        }
    })(window.jQuery, window);
});