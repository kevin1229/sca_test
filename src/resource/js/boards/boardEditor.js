Editor = function(element, content, height) {
    this.element = element;
    if (height == null)
        height = 400;
    $(this.element).summernote({
        height: height,
        lang: messageController.getLang() == "ko" ? "ko-KR" : null,
        toolbar: [
          // [groupName, [list of button]]
          ['style', ['clear', 'style']],
          ['font', ['fontname', 'fontsize', 'color']],
          ['style', ['bold', 'italic', 'underline', 'strikethrough', 'superscript', 'subscript']],
          ['para', ['ul', 'ol', 'paragraph', 'height']],
          ['insert', ['table', 'hr']],
          //['insert', ['picture', 'link', 'video']],
          ['misc', ['undo', 'redo', 'fullscreen']]
        ]
    });
    if (content != null) {
        this.set(content);
    }

    // 내부 스크롤 제어(slimScroll 사용할시에 필요함)
    var $noteEditable = $(this.element).parent().find(".note-editable");
    $noteEditable.on("mousewheel", function(e) {
        var hasScroll = $noteEditable.get(0) ? $noteEditable.get(0).scrollHeight > $noteEditable.innerHeight() : false;
        if(hasScroll)
            e.stopPropagation();
    });
}

Editor.prototype = {
    set : function(content) {
        $(this.element).summernote("code", content);
    },
    get : function() {
        var content = $(this.element).summernote("code");
        if (content.trim().length == 0 || content == "<p><br></p>") {
            return null;
        }
        return content;
    },
    clear : function() {
        $(this.element).summernote("code", "<p><br></p>");
    },
    destroy : function() {
        $(this.element).summernote("destroy");
    }

}

String.prototype.editor = function(content) {
    return new Editor(this.toString(), content);
}