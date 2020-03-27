$(function() {

    var $modalWebAnalysis = $("#modalWebAnalysis");
    var $webAnalysisSelectProjectBox = $("#webAnalysisSelectProjectBox");

    var maxFileSize = 1;
    var mode = 1;

    // Modal 이동 범위 제한
    $(".modal[role=dialog] .modal-content").draggable({
        handle: ".modal-header",
        drag: function (event, ui) {
            var width = $('.wrapper').width();
            var height = $('.wrapper').height();
            if(ui.offset.left <= 0) {
                ui.position.left = ui.position.left - ui.offset.left;
            } else if(ui.offset.left > width - $(this).width()) {
                ui.position.left = ui.offset.left - ui.position.left;
            }

            if(ui.offset.top <= 0) {
                ui.position.top = ui.position.top - ui.offset.top;
            } else if(ui.offset.top >= height - $(this).height()) {
                ui.position.top = height - $(this).height() + (ui.position.top - ui.offset.top);
            }
        }
    });

    var init = false;
    $modalWebAnalysis.on('shown.bs.modal', function() {

        // 모달 창이 처음 열렸을 경우 설정
        //clearModalWebAnalysis();
        if (init == false) {
            init = true;

            $.ajaxRest({
                url: "/api/1/fileupload/maxFileSize?page=webanalysis",
                type: "GET",
                success: function(data, textStatus, header) {
                    maxFileSize = data;
                    initFileUpload();
                }
            });

            // 분석 유형 라디오버튼 설정
            $modalWebAnalysis.find("[data-name=webAnalysisMode] button[name=mode]").on("click", function () {
                if ($(this).hasClass("active"))
                    return;

                // ?? 이거왜해야되지?
                $(this).toggleClass("active");
                $(this).toggleClass("btn-primary");
                $(this).toggleClass("btn-default");

                var $other = $(this).next();
                if ($other.length == 0)
                    $other = $(this).prev();

                $other.toggleClass("active");
                $other.toggleClass("btn-primary");
                $other.toggleClass("btn-default");

                // ??
                mode = $(this).val();
                if (mode == 1) {
                    // exist
                    $modalWebAnalysis.find("[data-name=webAnalysisModeNew]").hide();
                    $modalWebAnalysis.find("[data-name=webAnalysisModeExist]").show();
                } else if (mode == 2) {
                    // new
                    $modalWebAnalysis.find("[data-name=webAnalysisModeExist]").hide();
                    $modalWebAnalysis.find("[data-name=webAnalysisModeNew]").show();
                }
            });

            // 기존 프로젝트 트리
            $modalWebAnalysis.find("[data-name=selAnalysisProjectTree]").dropdownFancytreeController({
                ajax : {
                    url : "/api/1/projects/fancytree/analysis",
                },
                fancytree : {
                    selectMode: 1,
                    checkbox: false
                }
            });

            // 기존 프로젝트 트리
            $modalWebAnalysis.find("[data-name=selParentProjectTree]").dropdownFancytreeController({
                ajax : {
                    url : "/api/1/projects/fancytree/analysis",
                },
                fancytree : {
                    selectMode: 1,
                    checkbox: false
                }
            });

            // 부모 프로젝트 트리
            $modalWebAnalysis.find("[data-name=selParentProjectTree]").dropdownFancytreeController({
                ajax : {
                    url : "/api/1/projects/fancytree/analysis",
                },
                fancytree : {
                    selectMode: 1,
                    checkbox: false
                }
            });
        } else {
            // 기존 프로젝트 트리
            $modalWebAnalysis.find("[data-name=selAnalysisProjectTree]").dropdownFancytreeController().reload();

            // 부모 프로젝트 트리
            $modalWebAnalysis.find("[data-name=selParentProjectTree]").dropdownFancytreeController().reload();
        }

        resetFileAttach();
    });

    // 파일 첨부 창 설정
    function initFileUpload() {
        var lang = messageController.getLang();
        if (lang == "ko")
            lang = "kr";

        // 파일 업로드 컨트롤러 셋팅값 변경.
        // 1. Remove버튼명 변경.
        // 2. Remove버튼 아이콘 변경.
        $.fn.fileinputLocales.en.removeLabel = messageController.get("label.remove");
        $.fn.fileinputLocales.en.removeTitle = messageController.get("label.remove");
        $.fn.fileinput2.defaults.removeIcon = '<i class="fa fa-trash"></i>';

        $modalWebAnalysis.find("#inputSourceFile").fileinput2({
            uploadUrl: "/api/1/fileupload", // server upload action
            uploadAsync: true,
            maxFileCount: 1,
            uploadCount: 1,
            multiple: false,
            browseOnZoneClick: true,
            showBrowse: false,
            showClose: false,
            language: lang,
            allowedFileExtensions: ["zip", "spw"],
            allowedPreviewTypes: [],
            maxFileSize: maxFileSize,
            errorCloseButton: "", // 에러메시지 제거 버튼 제거
            dropZoneTitle: '<div class="row"><i class="fa fa-cloud-upload upload-icon"></i><span class="drop-zone-msg">' + messageController.get("info.web.analysis.1") + '</span></div>',
            dropZoneClickTitle: "",
            previewSettings: {
                object: {width: "95%", height: "60px"},
                other: {width: "95%", height: "60px"}
            },
            previewFileIcon: '<i class="material-icons">attach_file</i>',
            fileActionSettings: {
                showRemove: false,
                showUpload: false,
                showZoom: false,
                showDrag: false,
            },
        });
        $modalWebAnalysis.find('#inputSourceFile').on('fileuploaded', fnCallbackFileUploaded);
        $modalWebAnalysis.find('#inputSourceFile').on('filecheckExtLength', fnCallbackFileCheckExtLength);
        $modalWebAnalysis.find('#inputSourceFile').on('filecheckMaxCount', fnCallbackFileCheckMaxCount);
        $modalWebAnalysis.find('#inputSourceFile').on('filecheckBeforeBrowse', fnCallbackFileCheckBeforeBrowse);
        $modalWebAnalysis.find(".fileinput-upload-button").hide();
    }

    // 현재 첨부된 파일이 있으면 true
    function existAttachFile() {
        var fileName = $modalWebAnalysis.find(".file-caption-name").attr("title");
        if (fileName == null || fileName.length == 0) {
            return false;
        } else {
            return true;
        }
    }

    // 프로젝트 목록을 얻어온 후 동작


    // 파일 업로드 완료 후 동작
    function fnCallbackFileUploaded(event, data) {
        if (data == null) {
            return;
        }

        var header = data.jqXHR;

        if(header.status != 200){
            showErrorMsg(data, header);
            return;
        }

        var requestBody = {}

        requestBody.programLangs = getProgramLangs();
        requestBody.uploadFileName = header.responseJSON.uploadedFileName;
        requestBody.newProject = (mode == 2);

        requestBody.project = {};
        if (requestBody.newProject) {
            // 새로운 프로젝트
            var activeNode = $modalWebAnalysis.find("[data-name=selParentProjectTree]").find("[data-name=projectTree]").fancytree("getActiveNode");
            if(activeNode != null) {
                requestBody.project.parentId = parseInt(activeNode.key);
            }
            requestBody.project.projectKey = $modalWebAnalysis.find("[name=projectKey]").val();
            requestBody.project.projectName = $modalWebAnalysis.find("[name=projectName]").val();
        } else {
            // 기존 프로젝트
            var activeNode = $modalWebAnalysis.find("[data-name=selAnalysisProjectTree]").find("[data-name=projectTree]").fancytree("getActiveNode");
            if(activeNode != null) {
                requestBody.project.projectId = parseInt(activeNode.key);
            }
        }

        $.ajaxRest({
            url: "/api/1/webanalysis",
            type: "POST",
            data: requestBody,
            success: function(data, textStatus, header) {

                // 파일선택 초기화
                resetFileAttach();

                // 얼럿 창 닫기
                swal.closeModal();

                clearModalWebAnalysis();

                // Analysis 모달 창 닫기
                $modalWebAnalysis.trigger("click");

                // 파일 업로드 완료 후에 disabled되어 버려서,
                // 이후에 다시 업로드 불가한 현상이 있음.
                // 업로드 완료 후에 다시 파일 업로드 가능 하도록 enable 처리함.
                $modalWebAnalysis.find("#inputSourceFile").data('fileinput').enable();

                var msg = data.project.projectName.escapeHTML() + ' ' + messageController.get("440013");
                msg += '&nbsp;&nbsp;&nbsp;&nbsp;<a href="/projects/' + data.project.projectId + '/info">' + messageController.get("440107") + '</a>';

                $.toastController({
                    hideAfter: 10000,
                    text: msg,
                    textEscape: false
                });

                $modalWebAnalysis.modal("hide");
            },
            error: function(hdr, status) {
                if (hdr.responseText != null && hdr.responseText.length > 0) {
                    var data = JSON.parse(hdr.responseText);
                    if (data.length > 0) {
                        swal({
                            title : data[0].message,
                            type : "error",
                            closeOnConfirm : true
                        });
                        resetFileAttach();
                        $("#inputSourceFile").data('fileinput').enable();
                    }
                }
            }
        });
    }

    function clearModalWebAnalysis() {
        $modalWebAnalysis.find("[data-name=selAnalysisProjectTree]").find(".tree-select").val("");
        $modalWebAnalysis.find("[data-name=selAnalysisProjectTree]").find(".tree-search").val("");
        $modalWebAnalysis.find("[data-name=selAnalysisProjectTree]").removeClass("open");

        $modalWebAnalysis.find("[data-name=selParentProjectTree]").find(".tree-select").val("");
        $modalWebAnalysis.find("[data-name=selParentProjectTree]").find(".tree-search").val("");
        $modalWebAnalysis.find("[data-name=selParentProjectTree]").removeClass("open");

        $modalWebAnalysis.find("[data-name=webAnalysisModeNew] input[name=projectKey]").val("");
        $modalWebAnalysis.find("[data-name=webAnalysisModeNew] input[name=projectName]").val("");

        $modalWebAnalysis.find("#webAnalysisProgramLangs").find("input[name=webAnalysisProgramLangs]").prop("checked", true);
        webAnalysisProgramLangs
    }


    // 파일 선택 및 드래그 (첨부) 할 때, 용량 및 확장자 체크
    function fnCallbackFileCheckExtLength(event, data) {
        var files = data.tfiles;
        var dragFiles = data.dragFiles;
        var isDrag = data.isDrag;
        var folders = data.folders;

        if (isDrag && dragFiles.length > 1) {
            fnCallbackFileCheckMaxCount();
            return false;
        }

        if (isDrag && folders > 0) {
            swal(messageController.get("440008")); // 폴더는 첨부할 수 없습니다.
            if (!existAttachFile())
                resetFileAttach();
            return false;
        }

        if (files == null || files.length == 0) {
            return false;
        }

        var file = files[0];
        if (file == null) {
            return false;
        }

        if (files.length > 1) {
            fnCallbackFileCheckMaxCount();
            if (!existAttachFile())
                resetFileAttach();
            return false;
        }

        var fileName = file.name.toLowerCase();

        if (!fileName.match("[.]zip$") && !fileName.match("[.]spw$")) {
            swal(messageController.get("440009")); // zip또는 spw파일만 첨부할 수 있습니다.
            if (!existAttachFile())
                resetFileAttach();
            return false;
        }
        if ((file.size / 1000) > maxFileSize) {
            swal(messageController.get("440010", Math.floor(maxFileSize / 1000) + "MB")); // 소스 파일 용량은 {{size}} 를 초과할 수 없습니다.
            if (!existAttachFile())
                resetFileAttach();
            return false;
        }
        if (file.size == 0) {
            swal(messageController.get("440011")); // 파일 사이즈가 0입니다.
            if (!existAttachFile())
                resetFileAttach();
            return false;
        }

        if (fileName.match("[.]spw$")) {
            $("#webAnalysisProgramLangs input").attr("disabled", "disabled");
            $("#webAnalysisProgramLangsForm").hide();
        } else {
            $("#webAnalysisProgramLangs input").removeAttr("disabled");
            $("#webAnalysisProgramLangsForm").show();
        }

        return true;
    }

    // 현재 첨부된 파일을 제거
    function resetFileAttach() {
        $(".fileinput-remove").trigger("click");
        $("#webAnalysisProgramLangs input").removeAttr("disabled");
        $("#webAnalysisProgramLangsForm").show();
    }

    // 여러개의 파일을 선택하거나 또 추가 하려는 경우 에러 메시지
    function fnCallbackFileCheckMaxCount() {
        swal(messageController.get("440012")); // 파일은 한 개만 첨부 가능합니다.
    }

    // 클릭 하기 전 이미 첨부된 파일이 있는지 체크하여 있다면 오류 메시지 띄우고 false 리턴
    function fnCallbackFileCheckBeforeBrowse() {
        if (existAttachFile()) {
            fnCallbackFileCheckMaxCount();
            return false;
        }
        return true;
    }

    // 프로그램 언어 체크박스 값 리스트를 리턴
    function getProgramLangs() {
        var programLangs = [];
        $.each($modalWebAnalysis.find("#webAnalysisProgramLangs [name='webAnalysisProgramLangs']:checked"), function() {
            programLangs.push($(this).val());
        });
        return programLangs;
    }

    function showErrorMsg(header){
        swal({
            html: messageController.get('400051') + '<div class="text-left"><br>error:' + header.status + '(' + header.statusText + ')' + '</div>',
        });
    }

    $modalWebAnalysis.find("[name=btnRandomProjectKey]").on("click", function() {
        $modalWebAnalysis.find("[data-name=webAnalysisModeNew] input[name=projectKey]").val(getRandomProjectKey());
    });


    /*************************************************************************
     * 버튼
     *************************************************************************/
    // 취소 버튼
    $modalWebAnalysis.find("[name=btnWebAnalysisCancel]").on("click", function() {
        // 파일 업로드 중이었다면 업로드 취소
        var uploadFileCancelBtn = $(".fileinput-cancel-button");
        if (uploadFileCancelBtn != null)
            uploadFileCancelBtn.trigger("click");
    });

    // 분석
    $modalWebAnalysis.find("[name=btnUploadAndAnalysis]").on("click", function () {
        // 분석 버튼 포커스 제거 (swal 에서 enter입력시 같은 동작 반복을 피하기위함)
        $modalWebAnalysis.find(".btnUploadAndAnalysis").blur();

        // 분석 파일 체크
        if (!existAttachFile()) { // 현재 첨부된 파일이 없다면
            swal(messageController.get("440007")); // 소스파일을 첨부하세요
            return;
        }

        // 언어 체크
        var isSpw = $modalWebAnalysis.find("#webAnalysisProgramLangs input").attr("disabled") == "disabled";
        if (!isSpw) {
            var programLangs = getProgramLangs();
            if (programLangs == null || programLangs.length == 0) {
                swal(messageController.get("440006")); // 분석하려는 프로그램 언어를 한 개 이상 선택하세요.
                return;
            }
        }

        if (mode == 1) {
            // '기존 프로젝트 사용'일때 --
            // 프로젝트 아이디(프로젝트 트리 체크) 확인
            var projectId = null;
            var activeNode = $modalWebAnalysis.find("[data-name=projectTree]").fancytree("getActiveNode");
            if(activeNode == null) {
                swal(messageController.get("440003")); // 상위 프로젝트를 선택하세요.
                return;
            } else {
                projectId = parseInt(activeNode.key);
            }


            // ROOT를 선택했는지 확인
            var activeNode = $modalWebAnalysis.find("[data-name=selAnalysisProjectTree]").find("[data-name=projectTree]").fancytree("getActiveNode");
            if (parseInt(activeNode.key) == 0) {
                // ROOT 선택이면 분석 불가
                swal(messageController.get("440111", activeNode.title)); // 최상위({0}) 프로젝트는 분석 할 수 없습니다.
                return;
            }

            // 분석이 가능한 프로젝트인지 확인
            $.ajaxRest({
                url: "/api/1/webanalysis/check?projectId=" + projectId,
                type: "GET",
                success: function(errorMessage, textStatus, header) {
                    if (errorMessage != null && errorMessage.message != null) {
                        swal(errorMessage.message);
                        return;
                    }
                    // 분석 시작
                    $(".fileinput-upload-button").trigger("click");
                }
            });
        } else if (mode == 2) {
            // '새 프로젝트' 일때 --

            // 상위 프로젝트 확인
            var activeNode = $modalWebAnalysis.find("[data-name=selParentProjectTree]").find("[data-name=projectTree]").fancytree("getActiveNode");
            if(activeNode == null) {
                swal(messageController.get("440005")); // 상위 프로젝트를 선택하세요.
                return;
            }

            // 프로젝트키 형식에 맞는지 확인
            var projectKey = $modalWebAnalysis.find("[name=projectKey]").val();
            if (projectKey == null || projectKey.length == 0) {
                swal(messageController.get("405001")); // 프로젝트키을 입력하세요.
                return;
            }
            var regExp = /^[a-zA-Z0-9_-]*$/;
            if (!regExp.test(projectKey)) {
                swal(messageController.get("440014")); // 프로젝트 명은 알파벳, 숫자, 언더바(_), 하이픈(-) 조합으로 입력하십시오.
                return;
            }

            // 프로젝트 이름이 이미 존재하는지 확인
            $.ajaxRest({
                url: "/api/1/projects/key?projectKey=" + projectKey,
                type: "GET",
                success : function(data, textStatus, header) {
                    if (data.projectId != null) {
                        swal(messageController.get("440004")); // 이미 존재하는 프로젝트입니다.
                        return;
                    } else {
                        // 분석 시작
                        $(".fileinput-upload-button").trigger("click");
                    }
                }
            });
        }
    });
});