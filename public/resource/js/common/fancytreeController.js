/**
 * Fancytree Controller
 * @author kimkc
 */
$(function() {
    (function($, window) {
        var FancytreeController = (function() {

            // 생성자
            function FancytreeController(element, options) {

                var $element = $(element);

                if(options.target) {
                    // 버튼 그룹 data table 로 이동
                    var $inputTarget = $('#' + options.target);
                    if($inputTarget!= null) {
                        $.extend(options, {
                            focus: function(event, data) {
                                $inputTarget.val(data.node.title);
                            }
                        });
                    }
                }

                $element.fancytree($.extend({}, $.fn.fancytreeController.defaults, options));

                // 트리 정렬
                sorting($element);

                // 루트 노드 확장
                var rootNode = $element.fancytree("getRootNode");
                if (rootNode.hasChildren()) {
                    rootNode.children[0].setExpanded(true);
                }

                this.getElement = function () {
                    return $element;
                }
            }

            FancytreeController.prototype.reload = function(data) {
                //console.log($element);

                $.ui.fancytree.getTree(this.getElement()).reload(data);

                // 트리 정렬
                sorting(this.getElement());
            }

            // 트리 정렬
            function sorting($element) {
                var rootNode = $element.fancytree("getRootNode");
                rootNode.sortChildren(function(a, b) {
                    return a.title === b.title ? 0 : a.title > b.title ? 1 : -1;
                }, true);
            }

            return FancytreeController;
        })();

        $.fn.fancytreeController = function() {

            var $this = $(this);
            var data = $this.data("fancytreeController");

            //data가  없으면 Default로 새로 생성
            if(!data) {
                $this.data('fancytreeController', data = new FancytreeController(this, arguments[0]));
            }

            return data;
        }

        // fancytree controller 기본 값
        $.fn.fancytreeController.defaults = {
             extensions : [ "filter", "glyph" ],
             glyph: {
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
             },
             selectMode: 1, // 1:single, 2:multi, 3:multi-hier
             clickFolderMode : 4, // 1:activate, 2:expand, 3:activate and expand, 4:activate (dblclick expands)
             keyboard: true,
             checkbox: false,
             minExpandLevel: 1,
             filter: {
                 autoApply : true, // Re-apply last filter if lazy data is loaded
                 counter : true, // Show a badge with number of matching child nodes near parent icons
                 fuzzy : false, // Match single characters in order, e.g. 'fb' will match 'FooBar'
                 hideExpandedCounter : true, // Hide counter badge, when parent is expanded
                 highlight : true, // Highlight matches by wrapping inside <mark> tags
                 mode : "hide" // Grayout unmatched nodes (pass "hide" to remove unmatched node instead)
             },
             click: function(event, data) {
                 if ( (data.targetType == "title" || data.targetType == "icon" || event.which == 13) && data.node != null) {
                     if (data.targetType != "checkbox") {
                         data.node.setSelected(!data.node.selected);
                     }
                 }
             }
        }

    })(window.jQuery, window);
});

/*******************************************************************************
 * filter Nodes
 ******************************************************************************/
function filterNodes(tree, key) {
    var n, opts = {
        leavesOnly : false, // leaf Node Only search
        autoExpand : true, // auto Expand if its matched
        autoApply : true, // Re-apply last filter if lazy data is loaded
        counter : false, // Show a badge with number of matching child nodes near parent icons
        fuzzy : false, // Match single characters in order, e.g. 'fb' will match 'FooBar'
        hideExpandedCounter : true, // Hide counter badge, when parent is expanded
        highlight : true, // Highlight matches by wrapping inside <mark> tags
        mode : "hide" // Grayout unmatched nodes (pass "hide" to remove unmatched node instead)
    }, n = tree.filterNodes(key, opts);
}

/**
 * DropdownFancytreeController
 * @author kimkc
 */
$(function() {
    (function($, window) {

        var DropdownFancytreeController = (function() {

            // 생성자
            function DropdownFancytreeController(element, options) {

                var $element = $(element);

                options.fancytree = $.extend({
                    selectMode: 2, // 3:hierarchical multi-selection
                    checkbox: true,
                }, options.fancytree);

                if (options.fancytree.selectMode == 2) {

                    if(options.fancytree.select == null) {
                        options.fancytree.select = function(event, data) {
                            var node = data.node;

                            if (node.isSelected()) {
                                if (node.isUndefined()) {
                                    // Load and select all child nodess
                                    node.load().done(function() {
                                        node.visit(function(childNode) {
                                            childNode.setSelected(true);
                                        });
                                    });
                                } else {
                                    // Select all child nodess
                                    node.visit(function(childNode) {
                                        childNode.setSelected(true);
                                    });
                                }
                            } else {
                                node.visit(function(childNode) {
                                    childNode.setSelected(false);
                                });
                            }

                            var selectedNodes = data.tree.getSelectedNodes();
                            var titles = [];
                            $(selectedNodes).each(function(index, element) {
                                titles.push(element.title.unescapeHTML());
                            });
                            $element.find(".tree-select").val(titles.join(', '));
                        }
                    }

                    if (options.fancytree.click == null) {
                        options.fancytree.click = function(event, data) {
                            if ((data.targetType == "title" || data.targetType == "icon" || event.which == 13) && data.node != null) {
                                if (data.targetType != "checkbox") {
                                    data.node.setSelected(!data.node.selected);
                                }
                            }
                        }
                    }
                } else if (options.fancytree.selectMode == 3) {
                     if(options.fancytree.select == null) {
                         options.fancytree.select = function(event, data) {

                             var selectedNodes = data.tree.getSelectedNodes();
                             var titles = [];
                             $(selectedNodes).each(function(index, element) {
                                 titles.push(element.title.unescapeHTML());
                             });
                             $element.find(".tree-select").val(titles.join(', '));
                         }
                     }

                     if (options.fancytree.click == null) {
                         options.fancytree.click = function(event, data) {
                             if ((data.targetType == "title" || data.targetType == "icon" || event.which == 13) && data.node != null) {
                                 if (data.targetType != "checkbox") {
                                     data.node.setSelected(!data.node.selected);
                                 }
                             }
                         }
                     }
                } else {
                    options.fancytree.click = function(event, data) {
                        if ((data.targetType == "title" || data.targetType == "icon" || event.which == 13) && data.node != null) {
                            if (data.targetType != "checkbox") {
                                $element.find(".tree-select").val(data.node.title.unescapeHTML());
                                $element.removeClass('open');

                                if (options.fancytree.afterClick != null) {
                                    options.fancytree.afterClick(event, data);
                                }
                            }
                        }
                    }
                }

                // 입력폼 클릭시 이벤트
                $element.find('.tree-select').on("click", function(e) {
                    if($element.hasClass('open')) {
                        $element.removeClass('open');
                        $element.find('.dropdown-menu').hide();
                        $element.find(".tree-search").hide();
                    } else {
                        $element.addClass('open');
                        $element.find('.dropdown-menu').show();
                        $element.find(".tree-search").show();
                    }
                });

                // 검색 리스너 설정
                $element.find(".tree-search").on("keyup", function(e) {
                    var tree = $element.find(".tree-area").fancytree("getTree");
                    if (e && e.which === $.ui.keyCode.ESCAPE || $.trim($(this).val()) === "") {
                        tree.clearFilter();
                        return;
                    }
                    filterNodes(tree, $(this).val().escapeHTML());
                }).focus();


                // 트리 만들기
                var ajaxOptions = null;

                if(options.ajax != null) {

                    ajaxOptions = $.extend({
                        type : "GET",
                        success : function(data, textStatus, header) {
                            for(var i in data[0].children) {
                                data[0].children[i].title = data[0].children[i].title.escapeHTML();
                            }

                            options.fancytree.source = data;
                            $element.find('.tree-area').fancytreeController(options.fancytree);

                            if(options.ajax.afterSuccess) {
                                options.ajax.afterSuccess(data, textStatus, header);
                            }
                        }
                    }, options.ajax);

                    $.ajaxRest(ajaxOptions);

                    //ajaxOptions = options.ajax;
                } else {
                    options.fancytree.source = options.data;
                    $element.find('.tree-area').fancytreeController(options.fancytree);
                }

                this.getElement = function() {
                    return $element;
                }

                this.getAjaxOptions = function() {
                    return ajaxOptions;
                }
            }

            DropdownFancytreeController.prototype.reload = function() {

                var selectedKey = null;
                var activeNode = this.getElement().find(".tree-area").fancytree("getActiveNode");
                if(activeNode != null) {
                    selectedKey = activeNode.key;
                }

                var ele = this.getElement();

                if(this.getAjaxOptions() != null) {
                    var options = $.extend({}, this.getAjaxOptions(), {
                        success : function(data, textStatus, header) {
                            $.ui.fancytree.getTree(ele.find(".tree-area")).reload(data);
                            var node = ele.find(".tree-area").fancytree("getNodeByKey", selectedKey);
                            if (node != null) {
                                node.setActive(true);
                            }
                        }
                    });

                    $.ajaxRest(options);
                }
            }

            DropdownFancytreeController.prototype.clear = function() {
                var getTree = $.ui.fancytree.getTree(this.getElement().find(".tree-area"));

                getTree.clearFilter();
                getTree.visit(function(node) {
                    node.setSelected(false);
                });
                this.getElement().find(".tree-search").val("");
            }

            return DropdownFancytreeController;
        })();


        $.fn.dropdownFancytreeController = function() {

            var $this = $(this);

            if (typeof arguments[0] == 'string') {
                try {
                    if (arguments[0] == "destroy") {
                        $this.find('.tree-area').data('fancytreeController', null);
                        $this.find(".tree-area").fancytree("destroy");
                        $this.find(".tree-area").html("");
                        $this.find('.tree-select').off("click");
                        $this.find(".tree-search").off("keyup");
                        $this.data('dropdownFancytreeController', null);
                        return;
                    }
                    return $this.find(".tree-area").fancytree(arguments[0]);
                } catch(e) {
                    return null;
                }
            }

            var data = $this.data("dropdownFancytreeController");

            //data가  없으면 Default로 새로 생성
            if(!data) {
                $this.data('dropdownFancytreeController', data = new DropdownFancytreeController(this, arguments[0]));
            }

            return data;
        }

        $.fn.isDropdownFancytreeController = function() {
            var data = $(this).data("dropdownFancytreeController");
            if(data) {
                return true
            }
            return false;
        }

    })(window.jQuery, window);
});
