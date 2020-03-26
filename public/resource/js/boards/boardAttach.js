var defaultMaxFileCount = 20;
var tplBoardAttachFile = $("div[data-name=tplBoardAttachFile]").clone().html();

function getDisplaySize(bytes) {
    var size = parseFloat(bytes);
    var out = null;
    var sizes = null;
    var i = null;
    if (!$.isNumeric(bytes) || !$.isNumeric(size)) {
        return '';
    }
    if (size === 0) {
        out = '0.00 B';
    } else {
        i = Math.floor(Math.log(size) / Math.log(1024));
        sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
        out = (size / Math.pow(1024, i)).toFixed(2) * 1 + ' ' + sizes[i];
    }
    return out;
}

function getAttachFiles() {
    var attachFiles = [];
    var files = $(".board-file [data-name=attachedFiles] [data-name=attachedFile]");
    for (var i = 0; i < files.length; i++) {
        var attachFile = {};
        attachFile.storedFileName = $(files[i]).attr("data-uploadedFileName");
        attachFile.fileName = $(files[i]).attr("data-orgFileName");
        attachFiles.push(attachFile);
    }
    return attachFiles;
}

function makeFileInput($attach, callbackUploaded, maxFileCount) {
    if (maxFileCount == null)
        maxFileCount = defaultMaxFileCount;

    var lang = messageController.getLang();
    if (lang == "ko")
        lang = "kr";

    $attach.fileinput({
        uploadUrl: "/api/1/fileupload/multiple",
        uploadAsync: false,
        maxFileCount: maxFileCount,
        uploadCount: 1,
        browseOnZoneClick: true,
        showBrowse: false,
        showClose: false,
        language: lang,
        allowedFileExtensions: ["doc", "docx", "xls", "xlsx", "ppt", "pptx", "pdf", "png", "jpg", "jpeg", "gif", "txt", "zip"],
        allowedPreviewTypes: [],
        errorCloseButton: "", // 에러메시지 제거 버튼 제거
        previewFileIcon: '<i class="material-icons">attach_file</i>',
        showUpload: false,
        showCaption: false,
        showRemove: false,
        removeFromPreviewOnError: true,
        fileActionSettings: {
            showRemove: true,
            showUpload: false,
            showZoom: false,
            showDrag: false,
        },
    });

    $attach.fileinput("setMaxFileCount", maxFileCount);
    if (maxFileCount == 0) {
        $attach.fileinput("disable");
        $(".board-file .file-input.file-input-ajax-new").addClass("disabled");
    } else {
        $attach.fileinput("enable");
        $(".board-file .file-input.file-input-ajax-new").removeClass("disabled");
    }

    $attach.on("filebatchuploaded", function(e, data) {
        var fileUploadDtoList = data.data;
        for (var i in fileUploadDtoList) {
            var fileUploadDto = fileUploadDtoList[i];
            var attachedFile = tplBoardAttachFile.compose({
                uploadedFileName: fileUploadDto.uploadedFileName,
                fileName: fileUploadDto.fileName,
            });
            $(".board-file div[data-name=attachedFiles]").append(attachedFile);
        }
        callbackUploaded();
    });
}

function updateFileInput($attach, maxFileCount) {
    $attach.fileinput("setMaxFileCount", maxFileCount);
    if (maxFileCount == 0) {
        $attach.fileinput("disable");
        $(".board-file .file-input.file-input-ajax-new").addClass("disabled");
    } else {
        $attach.fileinput("enable");
        $(".board-file .file-input.file-input-ajax-new").removeClass("disabled");
    }
}
