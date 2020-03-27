var fieldMapper = {
    "subject" : {
        "field" : "[name=subject]",
    },
    "statusCode" : {
        "field" : "[name=statusCode]",
    },
    "content" : {
        "field" : "[data-name=content]",
    },
}

function setHelpBlockMsg(parent, msgObj) {
    clearHelpMsg(parent);

    var focusObj = null;
    if (msgObj.hasOwnProperty("failMsgs")) {
        msgObj = msgObj.failMsgs[0].errors;
    }
    for ( var i in msgObj) {
        if (!fieldMapper.hasOwnProperty(msgObj[i].field)) {
            continue;
        }

        var item = fieldMapper[msgObj[i].field];

        if (focusObj == null) {
            focusObj = $(parent).find(item.field);
        }

        $(parent).find(item.field).parent().addClass('has-error');
        $(parent).find(item.field).siblings('.help-block').text(msgObj[i].message);
    }
    if (focusObj != null) {
        focusObj.focus();
    }
}

function clearHelpMsg(parentEle) {
    $(parentEle).find('.help-block').parent().removeClass('has-error');
    $(parentEle).find('.help-block').text('');
}
