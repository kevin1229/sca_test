glyph_opts = {
    map: {
        doc: "fa fa-file-o",
        docOpen: "fa fa-file-o",
        checkbox: "fa fa-square-o",
        checkboxSelected: "fa fa-check-square-o",
        checkboxUnknown: "fa fa-square",
        dragHelper: "fa fa-arrow-right",
        dropMarker: "fa fa-long-arrow-right",
        error: "fa fa-warning",
        expanderClosed: "fa fa-caret-right",
        expanderLazy: "fa fa-angle-right",
        expanderOpen: "fa fa-caret-down",
        folder: "fa fa-folder-o",
        folderOpen: "fa fa-folder-open-o",
        loading: "fa fa-spinner fa-pulse"
    }
};

var TreeController = (function() {

    function TreeController() {
    }

    TreeController.prototype = {
        set : function(options) {
            var tree = options.target.fancytree({
                source : options.treeData,
                extensions : [ "filter", "glyph" ],
                glyph: glyph_opts,
                selectMode : 3, // 1:single, 2:multi, 3:multi-hier
                clickFolderMode : 4, // 1:activate, 2:expand, 3:activate and expand, 4:activate (dblclick expands)
                keyboard : true,
                checkbox : true,
                filter : {
                    autoApply : true, // Re-apply last filter if lazy data is loaded
                    counter : true, // Show a badge with number of matching child nodes near parent icons
                    fuzzy : false, // Match single characters in order, e.g. 'fb' will match 'FooBar'
                    hideExpandedCounter : true, // Hide counter badge, when parent is expanded
                    highlight : true, // Highlight matches by wrapping inside <mark> tags
                    mode : "hide" // Grayout unmatched nodes (pass "hide" to remove unmatched node instead)
                },
                click : function(event, data) {
                    fnTreeClickEventHandler(event,data);
                },
                keydown : function(event, data) {
                    //if (e && e.which === $.ui.keyCode.ESCAPE || $.trim($(this).val()) === "") {
                    switch (event.which) {
                        case 13: // [space]
                            fnTreeClickEventHandler(event, data);
                            //data.node.toggleSelected();
                            return false;
                    }
                },
            });

            return tree;
        }
    }

    return TreeController;
})();

var treeController = new TreeController();

/*******************************************************************************
 *  convertToFancyTreeData
 ******************************************************************************/
function convertFromProjectTreeToFancyTreeData(childList) {
    var parent, nodeMap = {};

    // Pass 1: store all tasks in reference map
    $.each(childList, function(map, node) {
        // Rename 'key' to 'id'
        if(node.type == 'projectGroup'){
            node.id = 'g' + node.id;
            node.folder = true;
        } else if(node.type == 'project'){
            node.id = 'p' + node.id;
        }

        node.key = node.id;
        node.title = node.text;
        node.parent = node.parentId==null?null:'g'+node.parentId;

        delete node.id;
        delete node.text;
        delete node.parentId;

        nodeMap[node.key] = node;
    });


    // Pass 2: adjust fields and fix child structure
    childList = $.map(childList, function(node) {

        // Set checkbox for completed tasks
        //node.selected = (node.status === "completed");
        // Check if c is a child node
        if (node.parent != null) {
            // add c to `children` array of parent node
            parent = nodeMap[node.parent];
            // 부모 노드가 존재하지 않는 노드의 경우 최상위 노드 하위에 위치시킴.
            if((typeof parent) != 'object'){
                parent = nodeMap['g1'];
                node.title = node.title+"(Error_No_Parent)";
            }

            if (parent.children) {
                parent.children.push(node);
            } else {
                parent.children = [ node ];
            }
            return null; // Remove c from childList
        } else {

        }
        return node; // Keep top-level nodes
    });


/*
    $.each(childList[0].children, function(i, node) {
        node.sort(function(a, b) {
            return ((a.title < b.title) ? -1
                    : ((a.title > b.title) ? 1 : 0));
        });
        if (node.children && node.children.length > 1) {
            node.children.sort(function(a, b) {
                return ((a.title < b.title) ? -1
                        : ((a.title > b.title) ? 1 : 0));
            });
        }
    });
*/
    return childList;
}

function convertFromRefTreeToFancyTreeData(childList) {
    var parent, nodeMap = {};
    var copyRoot = new Object();
    // root.id = "R" + root.id;
    copyRoot.key = "R1";
    copyRoot.title = "root";
    copyRoot.parent = null;

    nodeMap[copyRoot.key] = copyRoot;

    // Pass 1: store all tasks in reference map
    $.each(childList, function(map, node) {

        node.key = node.id;
        node.title = node.text;
        node.parent = node.parentId;

        if(node.key.startsWith('G')) {
            node.folder = true;
        }

        delete node.id;
        delete node.text;
        delete node.parentId;

        nodeMap[node.key] = node;
    });

    // Pass 2: adjust fields and fix child structure
    childList = $.map(childList, function(node) {

        // Set checkbox for completed tasks
        //node.selected = (node.status === "completed");
        // Check if c is a child node
        if (node.parent != null) {
            // add c to `children` array of parent node
            parent = nodeMap[node.parent];
            // 부모 노드가 존재하지 않는 노드의 경우 최상위 노드 하위에 위치시킴.
            if((typeof parent) != 'object'){
                parent = nodeMap['R1'];
                node.title = node.title+"(Error_No_Parent)";
            }

            if (parent.children != undefined) {
                parent.children.push(node);
            } else {
                parent.children = [ node ];
            }
            return null; // Remove c from childList
        } else {

        }
        return node; // Keep top-level nodes
    });

    return childList;
}