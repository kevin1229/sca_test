/******************************************************************************
 * Report navigator
 ******************************************************************************/
/**
 * 선택되었던 Line 을 제거 한다.
 *
 * @param editor
 */
function clearTargetLine(editor) {
    var markers = editor.getSession().getMarkers();

    $.each(markers, function(key, value) {
        if (value.clazz === 'selected') {
            editor.getSession().removeMarker(value.id);
        }
    });
}
function goNavigator(cid, line, curNodeId, filepath) {

    if (cid.includes(".")) {
        cid = cid.replace(/\./g, "_");
    }

    if ($('#code' + cid)[0] == undefined) {
        $('#call' + cid).trigger('click');
    } else {
        var editor = ace.edit("code" + cid);
        var Range = ace.require("ace/range").Range;

        targetNodeNavi(curNodeId);
        clearTargetLine(editor);
        editor.getSession().addMarker(new Range(line - 1, 0, line - 1, 1),
                'selected', 'fullLine');
        editor.gotoLine(parseInt(line), 0, true);
    }
}

var prevLine = null;
var prevNodeId = null;
function targetNodeNavi(nodeId) {
    if (prevNodeId != null && document.getElementById("td" + prevNodeId) != undefined) {
        var className = document.getElementById("td" + prevNodeId).parentNode.parentNode.parentNode.parentNode.className;
        document.getElementById("td" + prevNodeId).parentNode.parentNode.parentNode.parentNode.className = className.replace(" selected", "");
    }

    document.getElementById("td" + nodeId).parentNode.parentNode.parentNode.parentNode.className += " selected";
    prevNodeId = nodeId;
}
function foldNavi(nodeId) {
    var ul = document.getElementById("ul" + nodeId);
    var icon = document.getElementById("i" + nodeId);
    if (icon.className.indexOf("plus") > -1) {
        icon.className = "fa fa-minus-square-o";
        ul.style.display = "block";
    } else {
        icon.className = "fa fa-plus-square-o";
        ul.style.display = "none";
    }
}
