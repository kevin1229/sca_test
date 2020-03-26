$(function() {

    var checkerGroupId = $("#checkerGroupId").val();

    /***************************************************************************
     * 변수
     ***************************************************************************/
    SearchOption = function() {
        this.checkerGroupId = checkerGroupId;
        this.checkerLangCodes = null;
        this.checkerTypeCodes = null;
        this.checkerCategoryIds = null;
        this.checkerName = null;
        this.complianceItemIds = null;
        this.risks = null;
        this.scanYns = null;
        this.checkerDesignIds = [];
    };
    SearchOption.prototype = {
        clear : function() {
            this.checkerLangCodes = null;
            this.checkerTypeCodes = null;
            this.checkerCategoryIds = null;
            this.checkerName = null;
            this.complianceItemIds = null;
            this.risks = null;
            this.scanYns = null;
            this.checkerDesignIds = [];
        }
    };
    var searchOption = new SearchOption();

    var $dropdownSearchOptionCheckerDesign = $('#dropdownSearchOptionCheckerDesign');
    var $modalBatchModifyChecker = $("#modalBatchModifyChecker");
    var $modalModifyCheckerOption = $("#modalModifyCheckerOption");
    var $modalModifyCheckerOptionForm = $("#modalModifyCheckerOptionForm");
    var $modalModifyCheckerOptionDesc = $("#modalModifyCheckerOptionDesc");
    var $buttonGroupDataTableCheckerGroupDesign = $("#buttonGroupDataTableCheckerGroupDesign")

    /***************************************************************************
     * 컴포넌트
     **************************************************************************/
    // Compliance 정보 (현재 DB등록된 체커에 연결된 것만 가져옴)
    $.ajaxRest({
        url: "/api/1/compliance/items",
        type: "GET",
        success : function (data, status, header) {
            $dropdownSearchOptionCheckerDesign.find('[name=complianceId]').select2Controller({
                data : data,
                minimumResultsForSearch: Infinity
            });

            $dropdownSearchOptionCheckerDesign.find('[name=complianceId]').on("change", function(e) {
                complianceId = $(this).val();

                $dropdownSearchOptionCheckerDesign.find(".tree-select").val("");
                $dropdownSearchOptionCheckerDesign.find('#searchOptionComplianceTree').dropdownFancytreeController("destroy");
                $dropdownSearchOptionCheckerDesign.find('#searchOptionComplianceTree').dropdownFancytreeController({
                    ajax : {
                        url : "/api/1/compliance/" + complianceId + "/fancytree"
                    },
                    fancytree : {
                        selectMode : 3,
                        select : function(event, data) {
                            $dropdownSearchOptionCheckerDesign.find(".tree-select").val(getComplianceItemTexts(getSelectedComplianceItemIds()));
                        }
                    }
                });
            })
            if (data[0] != null) {
                $dropdownSearchOptionCheckerDesign.find('[name=complianceId]').val(data[0].id);
                $dropdownSearchOptionCheckerDesign.find('[name=complianceId]').trigger("change");
            }
        },
        error : function(hdr, status) {
            errorMsgHandler.s(hdr.responseText);
        }
    });

    // 체커 lang 데이터
    $.ajaxRest({
        url: "/api/1/checkers/lang/items",
        type: "GET",
        success : function (data, status, header) {
            $dropdownSearchOptionCheckerDesign.find('[name=checkerLangCodes]').select2Controller({multiple: true, data: data});
        },
        error : function(hdr, status) {
            errorMsgHandler.swal(hdr.responseText);
        }
    });

    // 체커 타입
    $.ajaxRest({
        url: "/api/1/checkers/type/items",
        type: "GET",
        success : function (data, status, header) {
            $dropdownSearchOptionCheckerDesign.find('[name=checkerTypeCodes]').select2Controller({multiple: true, data: data});
        },
        error : function(hdr, status) {
            errorMsgHandler.swal(hdr.responseText);
        }
    });

    // 분류
    $.ajaxRest({
        url: "/api/1/checkers/categories/items",
        type: "GET",
        success : function (data, status, header) {
            $dropdownSearchOptionCheckerDesign.find('[name=checkerCategoryIds]').select2Controller({multiple: true, data: data});
        }
    });

    // 위험도
    $.ajaxRest({
        url: "/api/1/checkers/risk/items",
        type: "GET",
        success : function (data, status, header) {
            $dropdownSearchOptionCheckerDesign.find('[name=risks]').select2Controller({multiple: true, data: data});
        }
    });

    // 상태
    $.ajaxRest({
        url: "/api/1/checkers/scan/items",
        type: "GET",
        success : function (data, status, header) {
            $dropdownSearchOptionCheckerDesign.find('[name=scanYns]').select2Controller({multiple: true, data: data});
        },
        error : function(hdr, status) {
            errorMsgHandler.swal(hdr.responseText);
        }
    });

    /***************************************************************************
     * 검색
     **************************************************************************/
    // 체커 이름 엔터
    $dropdownSearchOptionCheckerDesign.find("[name=txtSearchShort]").on("keyup", function(e) {
        var code = e.keyCode || e.which;
        if(code == 13) {
            searchShort()
        }
    });

    // 돋보기
    $dropdownSearchOptionCheckerDesign.find("[name=btnSearchShort]").on("click", function(e) {
        searchShort();
    });

    function searchShort() {
        searchOption.clear();
        searchOption.checkerName = $dropdownSearchOptionCheckerDesign.find("[name=txtSearchShort]").val();

        clearSearchOption();
        showSearchCondition();

        $dataTableCheckerGroupDesign.draw();
    }

    // 상세검색:검색
    $dropdownSearchOptionCheckerDesign.find('[name=btnSearch]').on("click", function(e) {

        searchOption.clear();
        searchOption.checkerTypeCodes = $dropdownSearchOptionCheckerDesign.find('[name=checkerTypeCodes]').val();
        searchOption.checkerLangCodes = $dropdownSearchOptionCheckerDesign.find('[name=checkerLangCodes]').val();
        searchOption.checkerCategoryIds = $dropdownSearchOptionCheckerDesign.find('[name=checkerCategoryIds]').val();
        searchOption.checkerName = $dropdownSearchOptionCheckerDesign.find('[name=checkerName]').val();
        searchOption.risks = $dropdownSearchOptionCheckerDesign.find('[name=risks]').val();
        searchOption.scanYns = $dropdownSearchOptionCheckerDesign.find('[name=scanYns]').val();
        searchOption.complianceItemIds = getSelectedComplianceItemIds();

        $dataTableCheckerGroupDesign.draw();

        showSearchCondition();

        $dropdownSearchOptionCheckerDesign.find("[name=txtSearchShort]").val("");
        $dropdownSearchOptionCheckerDesign.removeClass('open');
    });

    // 상세검색:초기화
    $dropdownSearchOptionCheckerDesign.find('[name=btnClear]').on("click", function(e) {
        clearSearchOption();
    });

    function clearSearchOption() {
        $dropdownSearchOptionCheckerDesign.find('[name=checkerTypeCodes]').val("").trigger('change');
        $dropdownSearchOptionCheckerDesign.find('[name=checkerLangCodes]').val("").trigger('change');
        $dropdownSearchOptionCheckerDesign.find('[name=checkerCategoryIds]').val("").trigger('change');
        $dropdownSearchOptionCheckerDesign.find('[name=checkerName]').val("");
        $dropdownSearchOptionCheckerDesign.find('[name=risks]').val("").trigger('change');
        $dropdownSearchOptionCheckerDesign.find('[name=scanYns]').val("").trigger('change');
        $dropdownSearchOptionCheckerDesign.find('.tree-select').val("");
        $dropdownSearchOptionCheckerDesign.find('#searchOptionComplianceTree').dropdownFancytreeController().clear();
        $dropdownSearchOptionCheckerDesign.find('[name=complianceId]').find('option:eq(0)').prop('selected',true);
        $dropdownSearchOptionCheckerDesign.find('[name=complianceId]').trigger('change');
    }

    // 현재 검색 기준
    function showSearchCondition() {
        $("#searchCondition").hide();
        $('#searchCondition .searchConditionHead').hide();
        $('#searchCondition .searchCondition').text('');

        // 언어
        if(searchOption.checkerLangCodes != null && searchOption.checkerLangCodes.length != 0) {
            var texts = getSelectTexts($dropdownSearchOptionCheckerDesign.find("[name=checkerLangCodes]"), searchOption.checkerLangCodes);
            $('#searchCondition [name=checkerLangCodes]').text(texts.join(', '));
            $('#searchCondition [name=checkerLangCodes]').parent().show();
            $('#searchCondition').css('display', 'inline-block');
        }

        // 체커타입
        if(searchOption.checkerTypeCodes != null && searchOption.checkerTypeCodes.length != 0) {
            var texts = getSelectTexts($dropdownSearchOptionCheckerDesign.find("[name=checkerTypeCodes]"), searchOption.checkerTypeCodes);
            $('#searchCondition [name=checkerTypeCodes]').text(texts.join(', '));
            $('#searchCondition [name=checkerTypeCodes]').parent().show();
            $('#searchCondition').css('display', 'inline-block');
        }

        // 분류
        if(searchOption.checkerCategoryIds != null && searchOption.checkerCategoryIds.length != 0) {
            var texts = getSelectTexts($dropdownSearchOptionCheckerDesign.find("[name=checkerCategoryIds]"), searchOption.checkerCategoryIds);
            $('#searchCondition [name=checkerCategoryIds]').text(texts.join(', '));
            $('#searchCondition [name=checkerCategoryIds]').parent().show();
            $('#searchCondition').css('display', 'inline-block');
        }

        // 체커이름
        if(searchOption.checkerName != null && searchOption.checkerName != "") {
            $('#searchCondition [name=checkerName]').text(searchOption.checkerName);
            $('#searchCondition [name=checkerName]').parent().show();
            $('#searchCondition').css('display', 'inline-block');
        }

        // 위험도
        if(searchOption.risks != null && searchOption.risks.length != 0) {
            var texts = getSelectTexts($dropdownSearchOptionCheckerDesign.find("[name=risks]"), searchOption.risks);
            $('#searchCondition [name=risks]').text(texts.join(', '));
            $('#searchCondition [name=risks]').parent().show();
            $('#searchCondition').css('display', 'inline-block');
        }

        // 상태
        if(searchOption.scanYns != null && searchOption.scanYns.length != "") {
            var texts = getSelectTexts($dropdownSearchOptionCheckerDesign.find("[name=scanYns]"), searchOption.scanYns);
            $('#searchCondition [name=scanYns]').text(texts.join(', '));
            $('#searchCondition [name=scanYns]').parent().show();
            $('#searchCondition').css('display', 'inline-block');
        }

        // 레퍼런스
        if(searchOption.complianceItemIds != null && searchOption.complianceItemIds.length != 0) {
            var text = getComplianceItemTexts(searchOption.complianceItemIds);
            $('#searchCondition [name=complianceItems]').text(text);
            $('#searchCondition [name=complianceItems]').parent().show();
            $('#searchCondition').css('display', 'inline-block');
        }
    }

    // Dropdown 닫기 방지 : common.js
    stopHideDropDown($dropdownSearchOptionCheckerDesign);

    /***************************************************************************
     * 왼쪽 메뉴
     **************************************************************************/
    var $checkerCount = $("#checkerCount");
    var $complicanceRanking = $("#complicanceRanking");


    $checkerCount.find("[data-name=enabledTotal]").on("click", function(e) {
        searchOption.clear();
        searchOption.scanYns = ["Y"];

        clearSearchOption();
        $dropdownSearchOptionCheckerDesign.find('[name=scanYns]').val(searchOption.scanYns).trigger('change');

        showSearchCondition();
        $dataTableCheckerGroupDesign.draw();
    });
    $checkerCount.find("[data-name=total]").on("click", function(e) {
        searchOption.clear();

        clearSearchOption();

        showSearchCondition();
        $dataTableCheckerGroupDesign.draw();
    });


    // 활성화 체커 개수 표시
    function reloadEnabledChecker() {
        // 활성화 체커 개수 표시
        $.ajaxRest({
            url: "/api/1/checkerGroups/" + checkerGroupId + "/checkers/count",
            type: "GET",
            success : function (data, status, header) {
                $checkerCount.find("[data-name=enabledTotal] span:first-child").text(Number(data.enabledCount).format());
                $checkerCount.find("[data-name=total] span:first-child").text(Number(data.allCount).format());

                $checkerCount.find(".info-risk1 div:first-child").text(Number(data.enabledRisk1Count).format());
                $checkerCount.find(".info-risk2 div:first-child").text(Number(data.enabledRisk2Count).format());
                $checkerCount.find(".info-risk3 div:first-child").text(Number(data.enabledRisk3Count).format());
                $checkerCount.find(".info-risk4 div:first-child").text(Number(data.enabledRisk4Count).format());
                $checkerCount.find(".info-risk5 div:first-child").text(Number(data.enabledRisk5Count).format());
            }
        });
    }
    reloadEnabledChecker();

    function reloadComplianceCounts() {
        // 컴플라이언스 카운트 및 랭킹
        $.ajaxRest({
            url: "/api/1/checkers/groups/" + checkerGroupId  + "/compliance/checkers/count",
            type: "GET",
            success : function (data, status, header) {
                // 레퍼런스 초기화
                $complicanceRanking.html('');
                for(var i in data) {
                    // Top 3 만 보여준다.
                    if(i < 3) {
                        var div = $('<div/>');
                        div.text(data[i].complianceName + " : " + data[i].enabledCheckerPercent.toFixed(2) + '%' + " (" + data[i].enabledCheckerCount + "/" + data[i].allCheckerCount + ")");
                        $complicanceRanking.append(div);
                    }
                }
            },
            error : function(hdr, status) {
                errorMsgHandler.swal(hdr.responseText);
            }
        });
    }
    reloadComplianceCounts();


    /***************************************************************************
     * 컴플라이언스 트리
     **************************************************************************/
    function getComplianceItemTexts(ids) {
        if (ids == null || ids.length == 0)
            return;

        var items = [];
        for(var i in ids) {
            var node = $('#searchOptionComplianceTree').dropdownFancytreeController('getTree').getNodeByKey(String(ids[i]));
            items.push(node.title.unescapeHTML());
        }

        var value = null;
        if (ids.length == 1) {
            value = items[0];
        } else {
            value = messageController.get("label.item.etc", items[0], items.length - 1);
        }
        return value;
    }

    function getSelectedComplianceItemIds() {
        var ids = [];

        var tree = $('#searchOptionComplianceTree').dropdownFancytreeController('getTree');
        if (tree == null) {
            return ids;
        }

        var nodes = tree.getSelectedNodes();
        if (nodes.length > 0) {
            for (var i in nodes) {
                if (nodes[i].key != null) {
                    var complianceItemId = Number(nodes[i].key);
                    if (complianceItemId > 0) {
                        ids.push(Number(nodes[i].key));
                    }
                }
            }
        }
        return ids;
    }

    /***************************************************************************
     * Modal(세부 옵션 수정)
     ***************************************************************************/
    function openModalModifyCheckerOption(checkerDesignId) {

        $.ajaxRest({
            url: "/api/1/checkerDesign/" + checkerDesignId + "/opt",
            type: "GET",
            beforeSend : function(xhr, settings) {
                $modalModifyCheckerOption.find("[name=checkerDesignId]").text(checkerDesignId);
                $modalModifyCheckerOption.find("div[name=validMsg]").hide();

                // 초기화
                $modalModifyCheckerOptionForm.text("");
                $modalModifyCheckerOptionDesc.text("");
            },
            success : function (data, status, header) {
                var optDescList = [];

                var checkerOptionDto = data;
                if (checkerOptionDto.opt == null || checkerOptionDto.opt == "")
                    return;

                $modalModifyCheckerOption.find("[name=opt]").text(checkerOptionDto.opt);
                $modalModifyCheckerOption.find("[name=checkerName]").text(data.checkerName);
                $modalModifyCheckerOption.find("[name=checkerKey]").text(data.checkerKey);
                $modalModifyCheckerOption.find("[name=checkerLang]").text(data.checkerLang);

                var tplOptDesc = $("#tplOptDesc").clone().html();

                if (checkerOptionDto.opt == "xml" || checkerOptionDto.opt == "xml_taint") {
                    var xmlOption = checkerOptionDto.xmlOption;
                    if (xmlOption.category != null) {

                        // 템플릿 로드
                        var tplOptItemXml = $("#tplOptItemXml").clone().html();

                        var checkerKey = checkerOptionDto.checkerKey;

                        // 화면 셋팅
                        for (var i in xmlOption.category.itemList) { // START ITEM LOOP - <option><category><item>

                            var item = xmlOption.category.itemList[i];

                            var itemName = messageController.get("option." + checkerKey + ".title." + item.name);
                            var itemDesc = messageController.get("option." + checkerKey + ".desc." + item.name);
                            var sbItemValue = new StringBuffer();

                            // 여러개의 value를 하나의 textarea 로 합침
                            for (var j in item.valueList) { // LOOP - <option><category><item><value>
                                sbItemValue.append(item.valueList[j]).append("\n");
                            }

                            // 값을 대입
                            var $optItem = tplOptItemXml.compose({
                                name: item.name,
                                type: item.type,
                                required: item.required != null ? item.required : "",
                                variable: item.variable != null ? item.variable : "",
                                regexp: item.regexp != null ? item.regexp : "",

                                itemName: itemName, // 리소스
                                itemValue: sbItemValue.toString()
                            });

                            // 옵션에 따라 템플릿 Show/Hide
                            $optItem = $($optItem);
                            if (item.type == "boolean") {
                                if (item.valueList[0] == "true") {
                                    $optItem.find("[name=boolean] input").attr("checked", true);
                                }
                                $optItem.find("[name=boolean]").show();
                                $optItem.find("[name=itemTitle]").hide();
                            } else if (item.regexp != null) {
                                 if (item.regexp == "true") {
                                     $optItem.find("[name=regexp] input").attr("checked", true);
                                 }
                                 $optItem.find("[name=regexp]").show();
                            }
                            if (item.type == "string" || item.type == "decimal" || item.type == "tpl") {
                                if (item.variable == "true" || item.type == "tpl") {
                                    // variable이 true면 여러개 값 입력 가능, tpl인 경우 하나의 값이지만 값이 길어 textarea로 입력
                                    $optItem.find("[name=string-variable]").show();
                                } else {
                                    $optItem.find("[name=string]").show();
                                }
                            }

                            // 아이템 추가
                            $modalModifyCheckerOptionForm.append($optItem);

                            // 아이템 설명 배열 저장
                            var optDesc = tplOptDesc.compose({
                                itemName: itemName,
                                itemDesc: itemDesc
                            });
                            optDescList.push(optDesc);
                        } // END ITEM LOOP
                    }
                } // END XML

                if (checkerOptionDto.opt == "taint" || checkerOptionDto.opt == "xml_taint") {
                    var taintOption = checkerOptionDto.taintOption;
                    if (taintOption != null) {
                        // 템플릿 로드
                        var tplOptTaint = $("#tplOptTaint").clone().html();
                        var tplOptDescTaint = $("#tplOptDescTaint").clone().html();

                        // 화면 셋팅
                        var $optTaint = tplOptTaint.compose({
                            alarm: taintOption.alarm != null ? taintOption.alarm : "",
                            exclude: taintOption.exclude != null ? taintOption.exclude : "",
                            propagator: taintOption.propagator != null ? taintOption.propagator : "",
                            suggestionFilterFunction: taintOption.suggestionFilterFunction != null ? taintOption.suggestionFilterFunction : "",
                            macro : taintOption.macro != null ? taintOption.macro : ""
                        });

                        $optTaint = $($optTaint);
                        $optTaint.find("span[name=btn_taintMacro]").on("click", function(e) {
                            var $thisObj = $(this);
                            if ($thisObj.find("i[name=right]").is(":visible")) {
                                $thisObj.find("i[name=right]").hide();
                                $thisObj.find("i[name=down]").show();
                                $thisObj.parent().parent().find("div[name=taintMacro]").show();
                            } else {
                                $thisObj.find("i[name=right]").show();
                                $thisObj.find("i[name=down]").hide();
                                $thisObj.parent().parent().find("div[name=taintMacro]").hide();
                            }
                        });
                        $modalModifyCheckerOptionForm.append($optTaint);
                        optDescList.push(tplOptDescTaint);
                    }
                } // END TAINT

                if (checkerOptionDto.opt == "pmd.xml") {
                    var pmdXmlOption = checkerOptionDto.pmdXmlOption;

                    // 템플릿 로드
                    var tplOptPmdMeta = $("#tplOptPmdMeta").clone().html();
                    var tplOptItemPmdXml = $("#tplOptItemPmdXml").clone().html();

                    var checkerKey = pmdXmlOption.name;

                    // 메타정보 추가
                    var optPmdMeta = tplOptPmdMeta.compose({
                        name: pmdXmlOption.name,
                        ref: pmdXmlOption.ref != null ? pmdXmlOption.name : "",
                        since: pmdXmlOption.since != null ? pmdXmlOption.since : "",
                        message: pmdXmlOption.message != null ? pmdXmlOption.message : "",
                        className: pmdXmlOption.className != null ? pmdXmlOption.className : "",
                        externalInfoUrl: pmdXmlOption.externalInfoUrl != null ? pmdXmlOption.externalInfoUrl : "",
                        priority: pmdXmlOption.priority != null ? pmdXmlOption.priority : "",
                        description: pmdXmlOption.description != null ? pmdXmlOption.description : ""
                    });
                    $modalModifyCheckerOptionForm.append(optPmdMeta);

                    // 화면 셋팅
                    for (var i in pmdXmlOption.properties.propertyList) { // START ITEM LOOP - <option><category><item>
                        var property = pmdXmlOption.properties.propertyList[i];
                        var itemName = messageController.get("option." + checkerKey + ".title." + property.name);
                        var itemDesc = messageController.get("option." + checkerKey + ".desc." + property.name);

                        var $optItem = tplOptItemPmdXml.compose({
                            name : property.name,
                            vartype: property.vartype != null ? property.vartype : "",
                            type: property.type != null ? property.type : "",
                            min: property.min != null ? property.min : "",
                            max: property.max != null ? property.max : "",
                            itemName: itemName, // 리소스
                            itemValue: property.value

                        });
                        $optItem = $($optItem);

                        if (property.vartype == "decimal") {
                            $optItem.find("div[name=string]").show();
                        } else if (property.vartype == "boolean") {
                            $optItem.find("[name=boolean]").show();
                            $optItem.find("[name=itemTitle]").hide();
                            if (property.value == "true") {
                                $optItem.find("[name=boolean] input").attr("checked", true);
                            }
                        } else {
                            $optItem.find("[name=string-variable]").show();
                        }

                        // 아이템 추가
                        $modalModifyCheckerOptionForm.append($optItem);

                        // 아이템 설명 배열 저장
                        var optDesc = tplOptDesc.compose({
                            itemName: itemName,
                            itemDesc: itemDesc
                        });
                        optDescList.push(optDesc);
                    }
                }

                // 아이템 설명 배열에서 HTML로 표시
                for (var i = 0; i < optDescList.length; i++) {
                    $modalModifyCheckerOptionDesc.append(optDescList[i]);
                    if (i < (optDescList.length -1)) { // 맨 마지막 아이템이 아니면 줄바꿈 추가
                        $modalModifyCheckerOptionDesc.append("<br />");
                    }
                }

                if (data.checkerGroupId == 0) {
                    $modalModifyCheckerOption.find("textarea, input[type=text], input[type=checkbox]").prop("disabled", true);
                }

                // 모달 오픈
                $modalModifyCheckerOption.modal("show");
            }
        });
    }

    $modalModifyCheckerOption.find("[name=btnReset]").on("click", function(e) {
        swal({
            title: messageController.get("confirm.common.9"), // 기본값으로 변경되어 저장됩니다. 계속하시겠습니까?
            type: "warning",
            showCancelButton: true,
            confirmButtonText: messageController.get("label.ok"),
            cancelButtonText: messageController.get("label.cancel"),
            closeOnConfirm: false,
            closeOnCancel: true
        }, function (isConfirm) {
            if (isConfirm) {
                var checkerDesignId = $modalModifyCheckerOption.find("[name=checkerDesignId]").text();
                $.ajaxRest({
                    url: "/api/1/checkerDesign/" + checkerDesignId + "/opt",
                    type: "DELETE",
                    block: true,
                    success : function (data, status, header) {
                        $.toastGreen({
                            text: messageController.get('415010') // 415010=기본 값으로 변경되었습니다.
                        });

                        swal.closeModal();

                        openModalModifyCheckerOption(checkerDesignId);
                    }
                });
            }
        });
    });

    // 상세 옵션 모달 저장
    $modalModifyCheckerOption.find("[name=btnSave]").on("click", function(e) {

        var $modalModifyCheckerOptionForm = $("#modalModifyCheckerOptionForm"); // 모달 레이어의 체커옵션 값

        var requestBody = {};
        requestBody.checkerDesignId = $modalModifyCheckerOption.find("[name=checkerDesignId]").text();
        requestBody.opt = $modalModifyCheckerOption.find("[name=opt]").text();

        if (requestBody.opt == "xml" || requestBody.opt == "xml_taint") {
            var xmlOption = {};
            xmlOption.category = {};
            xmlOption.category.name = $modalModifyCheckerOption.find("[name=checkerKey]").text();
            xmlOption.category.itemList = [];

            var optItems = $modalModifyCheckerOptionForm.find("[name=optItem]");
            for (var i = 0 ; i < optItems.length ; i++) {
                var $optItem = $(optItems[i]);

                // 기존 아이템 정보를 페이지에서 꺼내옴
                var $meta = $optItem.find("div[name=meta]");
                var name = $meta.find("div[name=name]").text();
                var type = $meta.find("div[name=type]").text();
                var required = $meta.find("div[name=required]").text();
                var variable = $meta.find("div[name=variable]").text();
                var regexp = $meta.find("div[name=regexp]").text();

                // 오브젝트 생성
                var itemObj = {};
                itemObj.name = name;
                itemObj.type = type;
                itemObj.required = required != "" ? required : null;
                itemObj.variable = variable != "" ? variable : null;
                itemObj.required = required != "" ? required : null;

                // 정규식 변환여부
                if (regexp != "") {
                    itemObj.regexp = $optItem.find("div[name=regexp] input").is(":checked").toString();
                }

                // textarea를 array로
                itemObj.valueList = [];
                if (type == "string" || type == "decimal") {
                    if (variable == "true") {
                        var valueList = $optItem.find("textarea[name=itemValue]").val().trim().split("\n");
                        for (var j in valueList) {
                            valueList[j] = valueList[j].trim();
                            if (valueList[j].length > 0) {
                                itemObj.valueList.push(valueList[j]);
                            }
                        }
                    } else {
                        var value = $optItem.find("input[name=itemValue]").val().trim();
                        if (value.length > 0)
                            itemObj.valueList.push(value);
                    }
                } else if (type == "boolean") {
                    itemObj.valueList.push($optItem.find("div[name=boolean] input").is(":checked").toString());
                } else if (type == "tpl") {
                    itemObj.valueList.push($optItem.find("textarea[name=itemValue]").val().trim());
                }
                xmlOption.category.itemList.push(itemObj);
            }
            requestBody.xmlOption = xmlOption;
        }
        if (requestBody.opt == "taint" || requestBody.opt == "xml_taint") {
            var $taintOpt = $modalModifyCheckerOptionForm.find("div[name=taintOpt]");

            var taintOption = {};
            taintOption = {};
            taintOption.alarm = $taintOpt.find("textarea[name=alarm]").val().trim();
            taintOption.exclude = $taintOpt.find("textarea[name=exclude]").val();
            taintOption.propagator = $taintOpt.find("textarea[name=propagator]").val();
            taintOption.suggestionFilterFunction = $taintOpt.find("textarea[name=suggestionFilterFunction]").val();

            requestBody.taintOption = taintOption;
        }
        if (requestBody.opt == "pmd.xml") {
            var pmdXmlOption = {};
            var $pmdXmlOption = $modalModifyCheckerOptionForm.find("div[name=pmdXmlOpt]");

            {
                // 체커 메타 정보 셋팅
                var $pmdCheckerMeta = $modalModifyCheckerOptionForm.find("div[name=pmdCheckerMeta]");
                var name = $pmdCheckerMeta.find("div[name=name]").text();
                var ref = $pmdCheckerMeta.find("div[name=ref]").text();
                var since = $pmdCheckerMeta.find("div[name=since]").text();
                var message = $pmdCheckerMeta.find("div[name=message]").text();
                var className = $pmdCheckerMeta.find("div[name=className]").text();
                var externalInfoUrl = $pmdCheckerMeta.find("div[name=externalInfoUrl]").text();
                var priority = $pmdCheckerMeta.find("div[name=priority]").text();
                var description = $pmdCheckerMeta.find("div[name=description]").text();

                pmdXmlOption.name = name;
                pmdXmlOption.ref = ref != "" ? ref : null;
                pmdXmlOption.since = since != "" ? since : null;
                pmdXmlOption.message = message != "" ? message : null;
                pmdXmlOption.className = className != "" ? className : null;
                pmdXmlOption.externalInfoUrl = externalInfoUrl != "" ? externalInfoUrl : null;
                pmdXmlOption.priority = priority != "" ? priority : null;
                pmdXmlOption.description = description != "" ? description : null;
                pmdXmlOption.properties = {
                    propertyList: []
                };
            }

            var optItems = $modalModifyCheckerOptionForm.find("[name=optItem]");
            for (var i = 0 ; i < optItems.length ; i++) {
                var $optItem = $(optItems[i]);

                // 각 옵션의 메타 정보 셋팅
                var $meta = $optItem.find("div[name=propertyMeta]");
                var name = $meta.find("div[name=name]").text();
                var vartype = $meta.find("div[name=vartype]").text();
                var type = $meta.find("div[name=type]").text();
                var min = $meta.find("div[name=min]").text();
                var max = $meta.find("div[name=max]").text();
                var description = $meta.find("div[name=description]").text();

                // 값 셋팅
                var value = "";
                if (vartype == "decimal") {
                    value = $optItem.find("input[name=itemValue]").val().trim();
                } else if (vartype == "boolean") {
                    value = $optItem.find("div[name=boolean] input").is(":checked").toString();
                } else {
                    value = $optItem.find("textarea[name=itemValue]").val().trim();
                }

                // 오브젝트 생성
                var propertyObj = {};
                propertyObj.name = name;
                propertyObj.vartype = vartype != "" ? vartype : null;
                propertyObj.type = type != "" ? type : null;
                propertyObj.min = min != "" ? min : null;
                propertyObj.max = max != "" ? max : null;
                propertyObj.description = description != "" ? description : null;
                propertyObj.value = value;
                propertyObj.valueList = [value];

                pmdXmlOption.properties.propertyList.push(propertyObj);
            }
            requestBody.pmdXmlOption = pmdXmlOption;
        }

        $.ajaxRest({
            url: "/api/1/checkerDesign/" + requestBody.checkerDesignId + "/opt",
            type: "PUT",
            data: requestBody,
            block: true,
            beforeSend : function(xhr, settings) {
                $modalModifyCheckerOptionForm.find("div[name=errorMsg]").children().remove();
                $modalModifyCheckerOption.find("div[name=validMsg]").hide();
            },
            success : function (data, status, header) {
                $modalModifyCheckerOption.modal('hide');

                $.toastGreen({
                    text: messageController.get('400017') // 400017=저장되었습니다.
                });
            },
            error : function(hdr, status) {

                var errors = JSON.parse(hdr.responseText);

                if (errors != null && errors.length > 0) {
                    $modalModifyCheckerOption.find("div[name=validMsg]").show();
                    var tplXmlErrorMsg = null;
                    var tplTaintErrorMsg = null;
                    for (var i = 0; i < errors.length; i++) {
                        var errorMsg = errors[i];
                        var $divMsg = null;
                        var msg = null;
                        if (errorMsg.code != null) {
                            msg = messageController.get(errorMsg.code);
                        } else {
                            msg = errorMsg.msg;
                        }

                        if (errorMsg.opt == "xml") {
                            if (tplXmlErrorMsg == null) {
                                tplXmlErrorMsg = $("#tplXmlErrorMsg").clone().html();
                            }
                            var xmlErrorMsg = tplXmlErrorMsg.compose({
                                msg: msg
                            });
                            $divMsg = $("#xmlOptionItemErrMsg_" + errorMsg.id);
                            $divMsg.append(xmlErrorMsg);
                        } else if (errorMsg.opt == "taint") {
                            if (tplTaintErrorMsg == null) {
                                tplTaintErrorMsg = $("#tplTaintErrorMsg").clone().html();
                            }
                            var taintErrorMsg = tplTaintErrorMsg.compose({
                                msg: msg
                            })
                            $divMsg = $("#" + errorMsg.id);
                            $divMsg.append(taintErrorMsg);
                        } else if (errorMsg.opt == "pmd.xml") {
                            if (tplXmlErrorMsg == null) {
                                tplXmlErrorMsg = $("#tplXmlErrorMsg").clone().html();
                            }
                            var xmlErrorMsg = tplXmlErrorMsg.compose({
                                msg: msg
                            });

                            $divMsg= $("#pmdXmlOptionItemErrMsg_" + errorMsg.id);
                            $divMsg.append(xmlErrorMsg);
                        }
                        if ($divMsg != null)
                            $divMsg.show();
                    }
                }
            }
        });
    });


    /***************************************************************************
     * 정보 표시
     **************************************************************************/
    $.ajaxRest({
        url: "/api/1/checkers/groups/" + checkerGroupId,
        type: "GET",
        success : function (data, status, header) {

            // 헤더 타이틀 설정
            var $boxHeaderTitle = $('#boxHeaderTitle');
            $boxHeaderTitle.html(
                $boxHeaderTitle.html().compose({
                    'checkerGroupName': data.checkerGroupName
                })
            );
            $boxHeaderTitle.removeClass("invisible");

            var $statusDetail = $('#statusDetail');

            // 체커 그룹명
            $statusDetail.find("#txtCheckerGroupNameLeft").text(data.checkerGroupName);

            // 체커 그룹 설명
            var txtCheckerGroupComment = '';
            if(data.checkerGroupComment != null) {
                txtCheckerGroupComment = data.checkerGroupComment;
            }
            $statusDetail.find("#txtCheckerGroupComment").text(txtCheckerGroupComment);


            // 체커 그룹 컴플라이언스 정보 모달 이벤트
            $statusDetail.find("button[name=btnShowModalComplianceInfo]").on("click", function(e) {
                $.modalComplianceCount.showModalComplianceInfo(data.checkerGroupId, data.checkerGroupName);
            });

            // 등록자
            var txtInsertUser = null;
            if(data.insertUserName == null) {
                txtInsertUser = data.insertUserId;
            } else {
                txtInsertUser = data.insertUserName + "(" + data.insertUserId + ")";
            }
            $statusDetail.find("#txtInsertUser").text(txtInsertUser);

            // 최근 수정자
            var txtUpdateUser = null;
            if(data.updateUserName == null) {
                txtUpdateUser = data.updateUserId;
            } else {
                txtUpdateUser = data.updateUserName + "(" + data.updateUserId + ")";
            }
            $statusDetail.find("#txtUpdateUser").text(txtUpdateUser);

            // 최근 수정 일시
            $statusDetail.find("#txtUpdateDateTime").text(momentController.timestampFormat(data.updateDateTime, 'YYYY-MM-DD HH:mm:ss'));

            // 사용중인 프로젝트
            var projects = '';
            var enabledProjectCount = '';
            if(data.projects.length == 0) {
                projects = '-';
            } else {
                enabledProjectCount = data.projects.length + ' ' + messageController.get('label.count');
                $.each(data.projects, function(index, project) {
                   projects += project.projectKey + '\r\n';
                });
            }
            $statusDetail.find('[id=txtEnabledProjectCount]').text(enabledProjectCount);
            $statusDetail.find('[name=enabledProjects]').text(projects);
            $statusDetail.find('[name=enabledProjects]').slimScroll({color: '#c2c2c2'});


            // 중앙 네비게이터
            var $navigator = $("#navigator");
            if ($navigator.html() != undefined) {
                $navigator.html($navigator.html().compose(data))
                $navigator.removeClass("invisible");
            }
        }
    });


    /***************************************************************************
     * 버튼 그룹
     ***************************************************************************/
    // 내보내기
    $buttonGroupDataTableCheckerGroupDesign.find('[name=btnExport]').on('click', function(){
        var requestBody = {
            searchOption: {
                checkerGroupId: checkerGroupId
            }
        };

        var selectedCheckerDesignIds = $dataTableCheckerGroupDesign.getSelectedIds('checkerDesignId');
        if($dataTableCheckerGroupDesign.isAllSelected()) {
            requestBody.searchOption = searchOption;
        } else if(selectedCheckerDesignIds.length > 0) {
            requestBody.searchOption.checkerDesignIds = selectedCheckerDesignIds;
        } else {
            // 전체 선택이 아니면서, 선택된 ID가 없는 경우는
            // 선택 안함으로 판단함.
            // (데이터가 없을 경우는 버튼 자체가 비활성화됨.)
            requestBody.searchOption = searchOption;
        }

        $.ajaxRest({
            url : "/api/1/checkerDesign/export/excel",
            data : requestBody,
            type : "POST",
            block: true,
            error : function(hdr, status) {
                errorMsgHandler.swal(hdr.responseText);
            }
        });
    });

    // 일괄 수정 열기
    $buttonGroupDataTableCheckerGroupDesign.find('[name=btnOpenModalBatchModify]').on('click', function() {
        // 체크항목 검사 후 수정 창 표시
        var selectedIds = $dataTableCheckerGroupDesign.getSelectedIds('checkerDesignId');
        if (selectedIds.length == 0) {
            swal(messageController.get('400025'));
            return;
        }

        $modalBatchModifyChecker.find('[name="modRisk"]').prop('checked', false);
        $modalBatchModifyChecker.find(':radio[name=risk]').parent().removeClass('active');
        $modalBatchModifyChecker.find(':radio[name=risk][value="1"]').prop('checked', true);
        $modalBatchModifyChecker.find(':radio[name=risk][value="1"]').parent().addClass("active");

        $modalBatchModifyChecker.find('[name="modScan"]').prop('checked', false);
        $modalBatchModifyChecker.find(':radio[name=scanYn]').parent().removeClass('active');
        $modalBatchModifyChecker.find(':radio[name=scanYn][value="Y"]').prop('checked', true);
        $modalBatchModifyChecker.find(':radio[name=scanYn][value="Y"]').parent().addClass("active");

        $modalBatchModifyChecker.modal('show');
    });

    // 일괄 수정
    $modalBatchModifyChecker.find('[name=btnBatchModify]').on('click', function() {

        var selectedIds = $dataTableCheckerGroupDesign.getSelectedIds('checkerDesignId');

        var requestBody = {};
        if($dataTableCheckerGroupDesign.isAllSelected()) {
            requestBody.searchOption = searchOption;
        } else {
            requestBody.ids = selectedIds
        }

        requestBody.data = {}
        requestBody.data.checkerGroupId = checkerGroupId;
        var isModify = false;
        if ($modalBatchModifyChecker.find('[name="modRisk"]').prop('checked')) {
            requestBody.data.risk  = $modalBatchModifyChecker.find(':radio[name=risk]:checked').val();
            isModify = true;
        }
        if ($modalBatchModifyChecker.find('[name="modScan"]').prop('checked')) {
            requestBody.data.scanYn = $modalBatchModifyChecker.find(':radio[name=scanYn]:checked').val();
            isModify = true;
        }

        // 체크된 항목 없으면 알림
        if(isModify == false){
            swal(messageController.get('400025'));
            return false;
        }

        $.ajaxRest({
            url: "/api/1/checkerDesign",
            type : "PUT",
            data : requestBody,
            block : true,
            beforeSend : function(xhr, settings) {
                errorMsgHandler.clear($modalBatchModifyChecker);
            },
            success : function (data, textStatus, jqXHR) {
                $modalBatchModifyChecker.modal('hide');

                $dataTableCheckerGroupDesign.draw();

                // left menu 리로드
                reloadEnabledChecker();
                reloadComplianceCounts();

                $.toastGreen({
                    text: messageController.get("label.checker") + messageController.get("label.has.been.modified")
                });
            },
            error : function(hdr, status) {
                errorMsgHandler.show($dataTableCheckerGroupDesign, hdr.responseText);
            }
        });
    });


    /***************************************************************************
     * 테이블 표시
     **************************************************************************/
    var columnDefs = [{
        targets:  0,
        orderable: false,
        className: "select-checkbox",
        defaultContent: ""
    }, {
        targets: 1, // ID
        visible: false,
        className: "dt-head-right",
        data: "checkerId",
    }, {
        targets: 2, // 체커 타입
        data: "checkerTypeCode",
        render: function(data, type, row, meta) {
            return messageController.get("item.checker.type." + data);
        }
    }, {
        targets: 3, // 분류
        data: "checkerCategoryName",
        visible: false
    }, {
        targets: 4, // 언어
        data: "checkerLangCode",
        render: function(data, type, row, meta) {
            return row.checkerLang;
        }
    }, {
        targets: 5, // 체커 명
        data: "checkerName",
    }, {
        targets: 6, // 새부 옵션
        data: "editableOpt",
        className: "dt-head-center",
        render: function(data, type, row, meta) {
            if (data) {
                return '<span data-name="btnModalModifyCheckerOption" data-toggle="modal"><i class="fa fa-pencil-square-o fa-show" aria-hidden="true"></i></span>';
            }
            return "";
        }
    }, {
        targets: 7, // 위험도
        data: "risk",
        className: "dt-head-center",
        render: function(data, type, row, meta) {
            return '<select name="risk" class="form-control"></select>';
        }
    }, {
        targets: 8, // 활성화 상태
        data: "scannable",
        className: "dt-head-center",
        render: function(data, type, row, meta) {
            return '<input name="scanYn" type="checkbox" />';
        }
    }, {
        targets: 9, // 체커 설명
        data: "checkerDesc",
        orderable : false,
        render: function(data, type, row, meta) {
            if(data == null){
                return "";
            }
            var text = data.escapeHTML();
            return '<div title="' + text + '" data-toggle="tooltip" data-container="body" class="ellipsis" style="width: 300px">' + text + '</div>';
        }
    } ];

    $("#dataTableCheckerGroupDesign th[data-column=compliance]").each(function() {

        var $compliance = $(this);

        var complinaceId = $compliance.data("complinaceId");
        var targets = $compliance.data("targets");

        var bVisible = false;
        if (complinaceId == 300) // TODO 행자부 디폴트 show
            bVisible = true;

        columnDefs.push({
            targets: targets,
            defaultContent: "",
            data: "compliance" + complinaceId + "Items",
            sortKey: "compliance" + complinaceId,
            visible: bVisible,
            render: function(data, type, row, meta) {
                if(data == null){
                    return "";
                }
                var text = data.join(", ").escapeHTML();
                return '<div title="' + text + '" data-toggle="tooltip" data-container="body" class="ellipsis" style="width: 300px">' + text + '</div>';
            }
        });
    });

    var $dataTableCheckerGroupDesign = $("#dataTableCheckerGroupDesign").dataTableController({
        url: "/api/1/checkerDesign",
        searchOption : searchOption,
        iDisplayLength : 20,
        buttonGroupId: "buttonGroupDataTableCheckerGroupDesign",
        columnDefs: columnDefs,
        order : [ [5, 'asc'] ],
        createdRow: function ( row, data, index ) {
            var $row = $(row);
            // 체커 설명 보이기
            $row.on("click", function(e) {
                var $targetObj = $(e.target);
                if ($targetObj.parent().attr("role") == "row" && !$targetObj.hasClass("select-checkbox") && !$targetObj.hasClass("extend-button")) {
                    $.modalCheckerInfo.show(data.checkerId, data.checkerName);
                }
            });

            // 세부 옵션 수정 버튼
            $row.find("[data-name=btnModalModifyCheckerOption]").on("click", function(e) {
                openModalModifyCheckerOption(data.checkerDesignId);
            });

            // 위험도
            var $risk = $row.find("[name=risk]");
            $risk.select2Controller({
                minimumResultsForSearch: Infinity,
                width: "100px",
                data : [
                    { "id": 1, "text": messageController.get("item.checker.risk.level.1") },
                    { "id": 2, "text": messageController.get("item.checker.risk.level.2") },
                    { "id": 3, "text": messageController.get("item.checker.risk.level.3") },
                    { "id": 4, "text": messageController.get("item.checker.risk.level.4") },
                    { "id": 5, "text": messageController.get("item.checker.risk.level.5") }
                ]
            });
            $risk.val(data.risk).trigger("change");
            $risk.parent().addClass('risk-level');
            $risk.parent().addClass('risk' + data.risk);

            if (data.checkerGroupId == 0) {
                $risk.prop("disabled", true);
            } else {
                $risk.on("change", function() {
                    // 위험도를 변경한 경우 바로 저장
                    var requestBody = {};
                    requestBody.risk = $(this).val();
                    requestBody.checkerName = data.checkerName;

                    $.ajaxRest({
                        url : "/api/1/checkerDesign/" + data.checkerDesignId + "/risk",
                        type : "PUT",
                        data : requestBody,
                        block : true,
                        success : function (data, status, header) {
                            $.toastGreen({
                                text: messageController.get("label.checker") + ' ' + data.checkerName + ' ' + messageController.get("label.has.been.modified")
                            });

                            // left menu 리로드
                            reloadEnabledChecker();

                            // 위험도 클래스
                            $risk.parent().removeClass(function (index, className) {
                                return (className.match('risk[0-9]')).join(' ');
                            });
                            $risk.parent().addClass('risk' + requestBody.risk);
                        },
                        error : function(hdr, status) {
                            errorMsgHandler.swal(hdr.responseText);
                        }
                    });
                });
            }

            // 상태
            var $scanYn = $row.find("[name=scanYn]");
            $scanYn.bootstrapToggle({
                on : messageController.get('label.on'),
                off : messageController.get('label.off'),
                size : "mini",
                onstyle : "warning",
                offstyle : "default",
                width : "70px"
            });
            if (data.scanYn == "Y") {
                $scanYn.bootstrapToggle('on');
            } else {
                $scanYn.bootstrapToggle('off');
            }
            if (data.checkerGroupId == 0) {
                $scanYn.parent().attr("disabled", true);
                $scanYn.parent().css("pointer-events", "none");
            } else {
                var fnScanYn = function() {
                    var requestBody = {};
                    requestBody.scanYn = $(this).is(":checked") ? "Y" : "N";
                    requestBody.checkerName = data.checkerName;

                    $.ajaxRest({
                        url: "/api/1/checkerDesign/" + data.checkerDesignId + "/scanYn",
                        type: "PUT",
                        data: requestBody,
                        block : true,
                        success : function (data, status, header) {

                            // left menu 리로드
                            reloadEnabledChecker();
                            reloadComplianceCounts();

                            $.toastGreen({
                                text: messageController.get("label.checker") + ' ' + data.checkerName + ' ' + messageController.get("label.has.been.modified")
                            });
                        },
                        error : function(hdr, status) {
                            $scanYn.off("change");
                            if (requestBody.scanYn == "Y") {
                                $scanYn.bootstrapToggle('off');
                            } else {
                                $scanYn.bootstrapToggle('on');
                            }
                            $scanYn.on("change", fnScanYn);

                            errorMsgHandler.swal(hdr.responseText);
                        }
                    });
                }
                $scanYn.on("change", fnScanYn);
            }
        }
    });

    /**
     * 현재 검색 결과 초기화 이벤트
     */
    $('#searchOptionClear').click(function () {
        clearSearchOption();
        $('button[name=btnSearch]').trigger('click');
    });
});
