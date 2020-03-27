$(function(){

    (function($, window) {

        var ScansIssuesRight = (function(){

            var $modalIssueAdvance = null;
            var $dataTableIssueHistory = null;
            var $element = null;
            var $formIssueStatus = null;
            var $headerIssueStatus = null;
            var $dataTableDuplicatedIssue = null;
            var $dataTableIssueAdvance = null;
            var $navigator = null;

            var aifList = null;

            var $panelDuplicatedIssue = null;

            function ScansIssuesRight(element){

                $element = $(element);

                $modalIssueAdvance = $("#modalIssueAdvance");
                $headerIssueStatus = $element.find("#headerIssueStatus");
                $formIssueStatus = $element.find("#formIssueStatus");
                $panelDuplicatedIssue = $("#panelDuplicatedIssue");
                $navigator = $("#navigator");

                $element.find("[name=issueUserId]").select2Controller({
                    url:"/api/1/users/items",
                    allowClear : true,
                    placeholder : messageController.get('label.unselect')
                });

                if ($element.find("select[name=responseUserId]").length > 0) {
                    $.ajaxRest({
                        url : "/api/1/scans/" + scanId + "/manager/items",
                        type : "GET",
                        success : function (data, textStatus, jqXHR) {
                            $element.find("select[name=responseUserId]").select2Controller({
                                data : data,
                                allowClear : true,
                                placeholder : messageController.get('label.unselect')
                            });
                        },
                        error : function(hdr, status) {
                            errorMsgHandler.swal(hdr.responseText);
                        }
                    });
                }

                // 접기 메뉴 설정
                function initAndEventCollapsed(target) {
                    if($(target + ' a[data-toggle="collapse"]').hasClass('collapsed')) {
                        $(target).css('background', '#eeeeee');
                    } else {
                        $(target).css('background', '#ffffff');
                    }

                    $(target + ' a[data-toggle="collapse"]').click(function() {
                        if($(this).hasClass('collapsed')) {
                            $(target).css('background', '#ffffff');
                            $(target).css('color', '#252525');
                        } else {
                            $(target).css('background', '#eeeeee');
                            $(target).css('color', '#666666');
                        }
                    });
                }
                initAndEventCollapsed('#headerCheckerDesc');
                initAndEventCollapsed('#headerIssueStatus');
                initAndEventCollapsed('#headerIssueNavigator');
                initAndEventCollapsed('#headerIssueStatusHistory');
                initAndEventCollapsed('#headerDuplicatedIssue');

                $formIssueStatus.find("[name=statusCode]").on("change", function(){
                    var statusCode = $(this).val();
                    if (statusCode == "ER") {
                        // 제외 신청
                        $formIssueStatus.find("[data-name=divResponseUserIds]").show();
                    } else {
                        $formIssueStatus.find("[data-name=divResponseUserIds]").hide();
                    }
                });

                /**
                 * 이슈 상태 정보 저장
                 */
                function saveIssueStatus(row, nextIndex) {

                    var requestBody = {};
                    // 이슈 번호
                    requestBody.issueId = row.issueId;
                    // 이슈 상태
                    requestBody.statusCode = $formIssueStatus.find(':radio[name=statusCode][checked=checked]').val();
                    // 제외 승인 담당자
                    requestBody.responseUserIds = [];
                    $formIssueStatus.find("[name=responseUserId]").each(function(index, item) {
                        requestBody.responseUserIds.push($(item).val());
                    });
                    // 이슈 의견
                    requestBody.issueComment = $formIssueStatus.find("[name=issueComment]").val();
                    // 이슈 담당자
                    requestBody.issueUserId = $formIssueStatus.find("[name=issueUserId]").val();
                    if(requestBody.issueUserId === 'null') {
                        requestBody.issueUserId = "";
                    }

                    var nextIssueId = null;
                    if (nextIndex != undefined) {
                        if (requestBody.statusCode === 'EX') {
                            nextIndex -= 1;
                        }

                        // 필터 확인 후 next index 결정
                        if ($modalIssueSearch.find('[name=statusCodes]').val() != null
                            && !$modalIssueSearch.find('[name=statusCodes]').val().includes(requestBody.statusCode)) {
                            nextIndex -= 1;
                        }

                        if (nextIndex > 0) {
                            nextIssueId = $("#dataTableIssues").DataTable().rows().data()[nextIndex].issueId;
                        }
                    }

                    // 커스텀 URL 있는지 확인
                    var url = $("#urlPutIssueStatus").val();
                    if (url != null) {
                        url = url.compose({
                            issueId : row.issueId,
                        });
                    } else {
                        url = "/api/1/issues/" + row.issueId + "/status";
                    }

                    var rest = $.ajaxRest({
                        url: url,
                        type: "PUT",
                        data: requestBody,
                        block: true,
                        beforeSend : function(xhr, settings) {
                            errorMsgHandler.clear($formIssueStatus);
                        },
                        success: function (data, status, header) {
                            if (nextIndex != undefined) {
                                if (nextIssueId) {
                                    // 저장 후 다음 상태 보여 주기 위한 조치
                                    scansIssuesRight.showIssueStatus(nextIssueId);
                                } else {
                                    scansIssuesRight.showIssueStatus(row.issueId);
                                }
                                var currentPage = $('#dataTableIssues').DataTable().page();

                                $.when($dataTableIssues.getOptions().ajax).then(function () {
                                    $('#dataTableIssues').DataTable().page(currentPage).draw(false);
                                    $('#dataTableIssues').on('draw.dt', function(event, settings){
                                        changeSelection($dataTableIssues, nextIndex);
                                        $('#dataTableIssues').off('draw.dt');
                                    });
                                });
                            }

                            $.toastGreen({
                                heading: messageController.get("label.issue.status.info"),
                                text: messageController.get("411009")
                            });
                        },
                        error: function (hdr, status) {
                            errorMsgHandler.show($formIssueStatus, hdr.responseText);
                        }
                    });

                    return rest;
                }

                // 이슈 상태:저장 버튼
                $formIssueStatus.find("[name=btnSaveIssueStatus]").on("click", function() {
                    var dataTableIssues = $("#dataTableIssues").DataTable();

                    // 1건 수정
                    var selectedRow = dataTableIssues.rows('.row-selected');
                    if (selectedRow.count() > 0) {
                        saveIssueStatus(selectedRow.data()[0], selectedRow[0]);
                    } else {
                        swal({
                            type: "warning",
                            title: messageController.get("411002") // 411002=이슈를 선택하세요.
                        });
                    }
                });

                // 이슈 상태:저장 후 다음
                $formIssueStatus.find("[name=btnSaveIssueStatusNext]").on("click", function() {
                    var dataTableIssues = $("#dataTableIssues").DataTable();
                    var selectedRow = dataTableIssues.rows('.row-selected');
                    var nextIndex = parseInt(selectedRow.indexes()[0] + 1);
                    var nextPage = parseInt(dataTableIssues.page() + 1);
                    var lastPage = parseInt(dataTableIssues.page.info().pages);
                    var currentPage = parseInt(dataTableIssues.page());

                    // 선택되어  있을 경우만 동작
                    if(selectedRow.count() == 1) {

                        // 저장
                        if(parseInt(dataTableIssues.rows().count()) > nextIndex) {
                            // 페이지 내에 있을 경우
                            saveIssueStatus(selectedRow.data()[0], nextIndex);
                        } else {
                            var rest = saveIssueStatus(selectedRow.data()[0]);
                            $.when(rest).then(function() {
                                if (nextPage != lastPage) {
                                    $dataTableIssues.DataTable().page(nextPage).draw(false);
                                    changeSelectionNextPage($dataTableIssues, 0);
                                } else {
                                    dataTableIssues.page(lastPage - 1).draw(false);
                                }
                            });
                        }
                    }
                });
            }

            /**
             * 체커 표시
             */
            ScansIssuesRight.prototype.showCheckerDesc = function(checkerId) {

                var $checkerDesc = $("#checkerDesc");
                var $checkerDescNotFound = $("#checkerDescNotFound");
                var $checkerDescEmpty = $("#checkerDescEmpty");

                $checkerDesc.hide();
                $checkerDescNotFound.hide();
                $checkerDescEmpty.hide();

                if (checkerId == null) {
                    $checkerDescNotFound.show();
                    return;
                }

                $.ajaxRest({
                    url: "/api/1/checkers/" + checkerId + "/desc",
                    type: "GET",
                    success : function (data, status, header) {
                        // 설명
                        $checkerDesc.find("div[data-name=description] span[data-name=value]").text(data.description);

                        // 상세보기
                        $checkerDesc.find("[data-name=linkDetail]").attr('href', "/checkers/" + data.checkerId);

                        // 설명 표시하고 스크롤 넣기
                        $checkerDesc.show();
                        $checkerDesc.find(".box-body").slimscroll({
                            scrollTo: 0,
                            height: '100px'
                        });
                    }
                });
            }

            /**
             * 이슈 상태 표시
             */
            ScansIssuesRight.prototype.showIssueStatus = function(issueId) {

                $.ajaxRest({
                    url : "/api/1/issues/" + issueId,
                    type : "GET",
                    beforeSend : function(xhr, settings) {
                        errorMsgHandler.clear($formIssueStatus);
                        $formIssueStatus.find("input:radio[name=statusCode]").parent(".btn").removeClass('active');
                    },
                    success : function(data, textStatus, header) {

                        if (data.issueStatus == null) {
                            $headerIssueStatus.find('[name="selectedIssueStatus"]').text('[' + messageController.get("item.issue.status.NA") + ']');

                            $formIssueStatus.find("input:radio[name=statusCode][value=NA]").attr('checked', 'checked');
                            $formIssueStatus.find("input:radio[name=statusCode][value=NA]").parent(".btn").addClass('active');
                            $formIssueStatus.find("[name=issueComment]").val("");

                            // 제외 신청
                            $formIssueStatus.find("[name=responseUserId]").val("").trigger('change');
                            $formIssueStatus.find("[name=responseUserNameId]").val("");
                            $formIssueStatus.find("[data-name=divResponseUserIds]").hide();
                        } else {
                            $headerIssueStatus.find('[name="selectedIssueStatus"]').text('[' + messageController.get("item.issue.status." + data.issueStatus.statusCode) + ']');

                            $formIssueStatus.find("input:radio[name=statusCode][value="+ data.issueStatus.statusCode + "]").attr('checked', 'checked');
                            $formIssueStatus.find("input:radio[name=statusCode][value="+ data.issueStatus.statusCode + "]").parent(".btn").addClass('active');

                            if (data.issueStatus.issueUserId) {
                                var newOption = new Option(data.issueStatus.issueUserName, data.issueStatus.issueUserId, true, true);
                                $formIssueStatus.find("[name=issueUserId]").append(newOption).trigger('change');
                                $formIssueStatus.find("[name=issueUserId]").val(data.issueStatus.issueUserId).trigger("change");
                            } else {
                                $formIssueStatus.find("[name=issueUserId]").val("").trigger("change");
                            }

                            $formIssueStatus.find("[name=issueComment]").val(data.issueStatus.issueComment);

                            // 제외 신청
                            $formIssueStatus.find("[name=responseUserId]").val("").trigger('change');
                            $formIssueStatus.find("[name=responseUserNameId]").val("");
                            if (data.issueStatus.statusCode == "ER") {
                                $.each(data.issueStatus.issueStatusResponses, function(index, item) {
                                    $($formIssueStatus.find("[name=responseUserId]").get(index)).val(item.responseUserId).trigger('change');
                                    $($formIssueStatus.find("[name=responseUserNameId]").get(index)).val(item.responseUserName + "(" + item.responseUserId + ")");
                                });
                                $formIssueStatus.find("[data-name=divResponseUserIds]").show();
                            } else {
                                $formIssueStatus.find("[data-name=divResponseUserIds]").hide();
                            }
                        }

                        // 선택 시 값들 저장
                        $("#selectedIssueId").val(data.issueId);
                        $("#selectedProjectId").val(data.projectId);
                        $("#selectedDeterminant").val(data.determinant);
                        $("#selectedFalseYn").val(data.falseYn);

                        // 왼쪽 이슈 상태 표시
                        $.ajaxRest({
                            url: "/api/1/scans/" + data.scanId  + "/issues/status/count",
                            type: "GET",
                            success : function (data, status, header) {
                                var $statusDetail = $('#statusDetail');
                                $statusDetail.find("[name=scanIssuesByStatusCodeNALink]").text(Number(data.statusNaIssueCount).format());
                                $statusDetail.find("[name=scanIssuesByStatusCodeOKLink]").text(Number(data.statusOkIssueCount).format());
                                $statusDetail.find("[name=scanIssuesByStatusCodeEXLink]").text(Number(data.statusExIssueCount).format());
                                $statusDetail.find("[name=scanIssuesByStatusCodeERLink]").text(Number(data.statusErIssueCount).format());
                                $statusDetail.find("[name=scanIssuesByStatusCodeEDLink]").text(Number(data.statusEdIssueCount).format());
                            }
                        });

//                        var editable = $('#editable').val();
//                        if(editable != null && editable === 'false') {
//                            $formIssueStatus.find(".statusCode ").addClass("disabled");
//                            $('#btnOk').attr('disabled', 'disabled');
//                            $('#btnExclude').attr('disabled', 'disabled');
//                        } else if(editable != null && editable === 'true') {
                            // 이슈 상태 저장 버튼 show
                            $.each($formIssueStatus.children(), function (index, data) {
                                if(index > 0) {
                                    $(data).removeClass('hidden');
                                }
                            });
//                        }
                    }
                });
            }

            ScansIssuesRight.prototype.clearIssueStatus = function() {
                errorMsgHandler.clear($formIssueStatus);

                $headerIssueStatus.find('[name="selectedIssueStatus"]').text('');

                // 초기화
                $formIssueStatus.find(".statusCode ").removeClass("active");
                $formIssueStatus.find(".statusCode ").attr("disabled", '');
                $formIssueStatus.find("input:radio[name=statusCode]").removeAttr('checked', '');
                $formIssueStatus.find("[name=issueUserId]").val("").trigger('change');;
                $formIssueStatus.find("[name=issueComment]").val("");
                $panelDuplicatedIssue.hide();
                $("#navigator").empty();
                $('#btnOpenModalIssueAdvance').addClass('hidden');
            }

            /**
             * 소스 코드 네이게이션 표시
             */
            ScansIssuesRight.prototype.showIssueNavigator = function(issueId) {
                $.ajaxText({
                    url: "/issues/navigator",
                    type: "GET",
                    data: "issueId=" + issueId,
                    success: function (data, textStatus, header) {
                        $navigator.empty();
                        $navigator.append(data);

                        $navigator.slimscroll({
                            height: '400px'
                        });

                        clearRightContent();

                        $.each($mainContent.find('[id^=code]'), function (index, value) {
                            var editor = ace.edit(value);
                            $.each(editor.getSession().getMarkers(), function(index, value) {
                                if(value.clazz === 'selected') {
                                    editor.getSession().removeMarker(value.id);
                                }
                            });

                            // 네비게이션 <-> gutter 연동이벤트
                            editor.on("gutterclick", function (e, codeEditor) {
                                $.each($('[id^=td]'), function(i, v) {
                                    if($(e.domEvent.target).hasClass($(v).attr('class'))) {
                                        $(e.domEvent.target).off('click');
                                        $(e.domEvent.target).click(function () {
                                            $(v).find('span').trigger('click');
                                        });
                                        $(e.domEvent.target).trigger('click');
                                    }
                                });
                            }, true);
                        });

                        $.each($navigator.find('[id^=li]'), function (index, value) {
                            $(value).removeClass('selected');
                        });

                        // Branch 표시 보이기
                        $('#collapseIssueNavigator').find('.checkbox').removeClass('hidden');

                        // Branch 설정
                        if (sessionUserController.getUser().personalDisplay.issueSourceBranch) {
                            $('.branch-node').show();
                        } else {
                            $('input[name=branchCheckBox]').removeAttr('checked');
                            $('.branch-node').hide();
                            $.each($('.branch-node'), function (index, value) {
                                $(value).find('.pointer').removeClass('pointer').addClass('non-pointer');
                            });
                        }

                        // Branch 표시 설정
                        $('input[name=branchCheckBox]').change(function(){
                            if (!this.checked) {
                                $('.branch-node').hide();
                                $.each($('.branch-node'), function (index, value) {
                                    $(value).find('.pointer').removeClass('pointer').addClass('non-pointer');
                                });
                                sessionUserController.setPersonalIssueSourceBranch(false);
                            } else {
                                $('.branch-node').show();
                                $.each($('.branch-node'), function (index, value) {
                                    $(value).find('.non-pointer').removeClass('non-pointer').addClass('pointer');
                                })
                                sessionUserController.setPersonalIssueSourceBranch(true);
                            }

                            scansIssuesSourceCode.redraw();
                        });
                    }
                });

                // 네이게이션 상세
                if ($dataTableIssueAdvance == null) {
                    $dataTableIssueAdvance = $("#dataTableIssueAdvance").dataTableController({
                        url: "/api/1/issues/" + issueId + "/advance",
                        type: "GET",
                        order: [[0, 'desc']],
                        keys: true,
                        paging: false,
                        lengthChange: false,
                        searching: false,
                        select: false,
                        ordering: false,
                        info: false,
                        dom: "",
                        columnDefs: [{
                            targets: 0, // 분류
                            data: "infoType",
                            width: '100px',
                            className: "dt-head-center",
                            render: function (data, type, row, index) {
                                // 분류 목록
                                var typeList = [messageController.get('item.issue.advance.type.all'),
                                    messageController.get('item.issue.advance.type.call'),
                                    messageController.get('item.issue.advance.type.variable'),
                                    messageController.get('item.issue.advance.type.constant')];

                                return typeList[data];
                            }
                        }, {
                            targets: 1, // 이슈 내용
                            data: "infoKind",
                            width: '200px',
                            className: "dt-head-center",
                            render: function (data, type, row, index) {
                                // 이슈 내용
                                var kindData = [messageController.get('item.issue.advance.kind.all'),
                                    messageController.get('item.issue.advance.kind.general'),
                                    messageController.get('item.issue.advance.kind.source'),
                                    messageController.get('item.issue.advance.kind.sink')
                                ]

                                return kindData[data];
                            }
                        }, {
                            targets: 2, // 검색어
                            data: "qualifiedName",
                            width: '300px',
                            render: function (data, type, row, index) {
                                if (data == null) {
                                    return null;
                                }
                                return "<div style='word-break:break-all;'>" + data + "</div>";
                            }
                        }],
                        drawCallback: function (settings) {
                            $modalIssueAdvance.find("[name=btnSendAdvancedIssueFilter]").off('click');
                            if (settings.json.totalCount > 0 ){
                                $('#btnOpenModalIssueAdvance').removeClass('hidden');
                                $modalIssueAdvance.find("[name=btnSendAdvancedIssueFilter]").on("click", function (e) {
                                    // Aif 필터 초기화
                                    clearAifFilter();
                                    // Aif 정보 입력
                                    $.each(aifList, function(index, value){
                                        $('#formSearchOptionIssue').find('[name=addAif]').trigger('click');
                                        $.each($('#aifParent').children(), function (aifIndex, aifData) {
                                            if(aifIndex != 0 && aifIndex == $('#aifParent').children().length - 2) {
                                                $(aifData).find('[name=infoKind]').val(value.infoKind).trigger("change");;
                                                $(aifData).find('[name=infoType]').val(value.infoType).trigger("change");;
                                                $(aifData).find('[name=searchSql]').val(value.qualifiedName);
                                            }
                                        });
                                    });

                                    $('#btnIssueSearch').trigger('click');
                                });

                                aifList = settings.json.list
                            } else {
                                $('#btnOpenModalIssueAdvance').addClass('hidden');
                            }
                        }
                    });
                } else {
                    $dataTableIssueAdvance.loadUrl("/api/1/issues/" + issueId + "/advance");
                }
            }

            /**
             * 중복 이슈 표시
             */
            ScansIssuesRight.prototype.showDuplicatedIssue = function (issueId) {

                // 초기화
                if ($dataTableDuplicatedIssue == null) {
                    $dataTableDuplicatedIssue = $("#dataTableDuplicatedIssue").dataTableController({
                        url: "/api/1/issues/" + issueId + "/duplicated",
                        type: "GET",
                        order: [[1, 'desc']],
                        keys: true,
                        paging: false,
                        lengthChange: false,
                        searching: false,
                        select: false,
                        ordering: false,
                        info: false,
                        dom: "",
                        columnDefs: [{
                            targets: 0, // 이슈 ID
                            data: "issueId",
                            className: "dt-head-center"
                        }, {
                            targets: 1, // 프로젝트 명
                            data: "projectName",
                            render: function (data, type, row, index) {
                                return '<span title="' + messageController.get("label.project.key") + " : " + row.projectKey.escapeHTML() + '" data-toggle="tooltip" data-container="body">' + data.escapeHTML() + '</span>';
                            }
                        }],
                        drawCallback: function (settings) {
                            if(settings.json.totalCount > 0 ){
                                $('#duplicatedIssueCount').text(settings.json.totalCount);
                                $panelDuplicatedIssue.show();
                            } else {
                                $panelDuplicatedIssue.hide();
                            }
                        },
                        createdRow: function(row, data, index) {
                            var $row = $(row);
                            if (data.duplicatedIssueAuthority || sessionUserController.isAdmin()) {
                                $row.on('click', function(e) {
                                    window.open("/scans/" + data.scanId + "/issues#issueId=" + data.issueId);
                                });
                            } else {
                                $row.attr("title", messageController.get('400009'));
                            }
                        }
                    });
                } else {
                    $dataTableDuplicatedIssue.loadUrl("/api/1/issues/" + issueId + "/duplicated");
                }

                $('#divDuplicatedIssue').slimscroll({
                    height: '145px'
                });
            }

            /**
             * 이슈 상태 이력 표시
             */
            ScansIssuesRight.prototype.showIssueStatusHistory = function (data) {

                $("#dataTableIssueHistory").find("tbody").html("");

                if (data.issueStatus) {

                    // 초기화
                    $("#dataTableIssueHistory").find("thead").html("");
                    $("#dataTableIssueHistory").removeClass("hidden");

                    searchOption.issueStatusId = data.issueStatus.issueStatusId;

                    if ($dataTableIssueHistory == null) {
                        // #전체순서 : 신청자, 신청일, 제외신청의견
                        $dataTableIssueHistory = $("#dataTableIssueHistory").dataTableController({
                            url: "/api/1/issueStatusHistories",
                            searchOption: searchOption,
                            buttonGroupId: "",
                            order: [[0, 'desc']],
                            keys: true,
                            paging: true,
                            lengthChange: false,
                            searching: false,
                            select: false,
                            ordering: false,
                            info: false,
                            dom: "",
                            columnDefs: [{
                                targets: 0, // 등록자
                                data: "issueStatusHistoryId",
                                className: "dt-head-center",
                                render: function (data, type, row, index) {

                                    if (index.row == 0) {
                                        $headerIssueStatus.find('[name="issueStatusDate"]').text(momentController.timestampFormat(row.insertDateTime, 'YYYY-MM-DD HH:mm:ss'));
                                        $headerIssueStatus.find('.fa-history').removeClass('hidden');
                                    }

                                    var html = "";

                                    // 날짜
                                    html += '<div class="row"><div class="col-xs-4 control-label">' + messageController.get("label.date") + '</div><div class="col-xs-8 control-label">' + momentController.timestampFormat(row.insertDateTime, 'YYYY-MM-DD HH:mm:ss') + '</div></div>'
                                    // 변경자 userId(userName)
                                    var userName = "";
                                    if (row.insertUserName == null) {
                                        userName = row.insertUserId;
                                    } else {
                                        userName = row.insertUserId + "(" + row.insertUserName.escapeHTML() + ")";
                                    }
                                    html += '<div class="row" title="' + userName + '"><div class="col-xs-4 control-label">' + messageController.get("label.updator") + '</div><div class="col-xs-8 control-label">' + userName + '</div></div>'
                                    // 이슈 상태
                                    if (row.statusCode) {
                                        html += '<div class="row"><div class="col-xs-4 control-label">' + messageController.get("label.issue.status") + '</div><div class="col-xs-8 control-label">' + messageController.get("item.issue.status." + row.statusCode) + '</div></div>'
                                    }
                                    // 이슈 의견
                                    if (row.issueComment) {
                                        html += '<div class="row" style="word-break:break-all;"><div class="col-xs-4 control-label">'
                                            + messageController.get("label.issue.comment")
                                            + ' </div><div class="col-xs-8 control-label">'
                                            + row.issueComment.escapeHTML().replace(/\n/g, "<br/>")
                                            + '</div></div>';
                                    }
                                    // 처리 상태
                                    if (row.responseStatusCode) {
                                        html += '<div class="row"><div class="col-xs-4 control-label">' + messageController.get("label.response.status") + '</div><div class="col-xs-8 control-label">' + messageController.get("item.issue.status." + row.responseStatusCode) + '</div></div>'
                                    }
                                    // 처리 의견
                                    if (row.responseComment) {
                                        html += '<div class="row" style="word-break:break-all;"><div class="col-xs-4 control-label">'
                                            + messageController.get("label.response.comment")
                                            + ' </div><div class="col-xs-8 control-label">'
                                            + row.responseComment.escapeHTML().replace(/\n/g, "<br/>")
                                            + '</div></div>';
                                    }

                                    return html;
                                }
                            }]
                        });
                    } else {
                        $dataTableIssueHistory.draw();
                    }

                    $('#modalIssueStatusHistory').find('.form-history').addClass('scrollbar-outer');
                    $('#modalIssueStatusHistory').find('.form-history').scrollbar();
                    $(".scroll-wrapper.form-history.scrollbar-outer").css('max-height', $(window).height() / 2);

                    var div = document.getElementById ("rightSideBar");
                    div.addEventListener('overflowchanged', function OnOverflowChanged (event) {
                        console.log(event)
                    }, false);
                }
            }

            return ScansIssuesRight;
        })();

        $.fn.scansIssuesRight = function(){
            return new ScansIssuesRight(this);
        }

        scansIssuesRight = $("#rightSideBar").scansIssuesRight();

    })(window.jQuery, window);
});

var scansIssuesRight = null;