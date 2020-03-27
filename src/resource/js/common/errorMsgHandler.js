/**
 * Error Message Handler
 * @author kimkc
 */
var ErrorMsgHandler = (function() {

    function ErrorMsgHandler() {
    }

    ErrorMsgHandler.prototype.swal = function(msgObj) {

        var errors = null;
        if (typeof msgObj == 'string') {
            errors = JSON.parse(msgObj);
        } else if (msgObj.hasOwnProperty("failMsgs")) {
            errors = msgObj.failMsgs[0].errors;
        } else {
            errors = msgObj;
        }

        if (errors.length == 1 && errors[0].field == null){
            swal({
                title : errors[0].message,
                text: "Error code : " + errors[0].code,
                type : "error",
                closeOnCancel: true
            });
        } else {
            var msg = "";
            for (var i in errors) {
                msg += '<label class="pull-left">' + errors[i].message + " [" + errors[i].code + "]</label><br/>"
            }
            swal({
                html : '<div>' + msg + '</div>'
            });
        }
    },

    ErrorMsgHandler.prototype.show = function(parentEle, msgObj) {
        this.clear(parentEle);

        var errors = null;
        if (typeof msgObj == 'string') {
            errors = JSON.parse(msgObj);
        } else if (msgObj.hasOwnProperty("failMsgs")) {
            errors = msgObj.failMsgs[0].errors;
        } else {
            errors = msgObj;
        }

        if (errors.length == 1 && errors[0].field == null) {
            swal({
                title : errors[0].message,
                text: "Error code : " + errors[0].code,
                type : "error",
                closeOnCancel: true
            });
            return;
        }

        swal.closeModal();


        var focusItem = null;
        for (var i in errors) {

            var $item = this.getErrorItems(parentEle, errors[i]);

            if ($item == null || $item.length == 0) {
                continue;
            }

            var htmlText = "<div class='text-danger'>" + errors[i].message + "</div>";

            if ($item.hasClass("summernote")){
                // 토글 버튼인 경우
                $item.parent().after(htmlText);
            } else if ($item.hasClass("select2-hidden-accessible")) {
                // select2인 경우
                $item.next().after(htmlText);
            } else if ($item.data("toggle") != null && $item.prop('type') == "checkbox") {
                // 토글 버튼인 경우
                $item.parent().after(htmlText);
            } else if ($item.parent().parent().hasClass("btn-group")) {
                // 버튼 그룹인 경우
                $item.parent().parent().after(htmlText);
            } else {
                $item.after(htmlText);
            }

            if (focusItem == null && $item.parent().parent().hasClass("btn-group") == false) {
                focusItem = $item;
            }
        }

        if (focusItem != null) {
            focusItem.focus();
        }
    },

    ErrorMsgHandler.prototype.getErrorItems = function(parentEle, error) {
        if (error.field == null) {
            return null;
        }

        var field = error.field.escapeSelector();

        var $item = $(parentEle).find("[data-error-msg=" + field + "]");
        if ($item.length != 0) {
            return $item;
        }

        $item = $(parentEle).find("[data-name=" + field + "]");
        if ($item.length != 0) {
            return $item;
        }

        $item = $(parentEle).find("[name=" + field + "]");
        return $item;
    },

    ErrorMsgHandler.prototype.clear = function(parentEle) {
        $(parentEle).find('.text-danger').parent().removeClass('has-error');
        $(parentEle).find('.text-danger').remove();
    }

    return ErrorMsgHandler;
})();

var errorMsgHandler = new ErrorMsgHandler();