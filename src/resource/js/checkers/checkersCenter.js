
$.modalCheckerInfo = {};

$(function() {

    var codeMirrorExampleMap = new CustomMap();
    var codeMirrorSolutionMap = new CustomMap();

    var checkerId = null;
    var checkerName = null;
    var checkerDescObj = null;
    var tplExample = null;
    var tplCompliance = null;
    var mode = null;
    var isModal = false;

    var $modal = $('#modalChecker');
    var $checkerInfo = $('#checkerInfo');

    $.modalCheckerInfo.show = function (_checkerId, _checkerName) {

        initParam(_checkerId, _checkerName);

        // 데이터를 초기화
        $checkerInfo.find('[data-name=checkerTitle]').text(messageController.get("label.checker.description"));
        $("#description").text("");
        $('#vulnerability').find('[name=value]').text("");

        $("#compliances").hide();
        $("#compliances").find('[name=value]').children().remove();

        $('#examples').hide();
        $('#examples [name=example-set]').remove();

        $checkerInfo.find("[name=btnShowModify]").show();
        $checkerInfo.find("[name=btnClose]").show();
        $checkerInfo.find("[name=btnReset]").hide();
        $checkerInfo.find("[name=btnCancel]").hide();
        $checkerInfo.find("[name=btnModify]").hide();
        $('.checker-content').find("[name=btnAddExample]").hide();

        // 데이터 표시
        initDesc(function(){
            if(!isModal){
                isModal = true;
                initEvent();
            }

            $modal.on('shown.bs.modal',function(){
                $modal.find('.CodeMirror').each(function(i, el){
                    setTimeout(function() {
                        el.CodeMirror.refresh();
                    }, 100);
                });
            });

            $modal.modal('show');
        });
    }

    function initParam(_checkerId, _checkerName) {
        var sCheckerId;
        if(_checkerId){
            sCheckerId = _checkerId;
        } else {
            sCheckerId = $("#checkerId").val();
        }

        if (typeof (sCheckerId) == 'undefined') {
            return;
        }
        checkerId = parseInt(sCheckerId);
        checkerName = _checkerName;
    }

    function initEvent() {
        $checkerInfo.find("[name=btnShowModify]").on("click", function(e) {
            eventShowModify(e);
        });
        $checkerInfo.find("[name=btnCancel]").on("click", function(e) {
            eventCancel(e);
        });
        $checkerInfo.find("[name=btnModify]").on("click", function(e) {
            eventModify(e);
        });
        $('.checker-content').find("[name=btnAddExample]").on("click", function(e) {
            eventAddExample(e);
        });
    }

    function initDesc(fnInit) {
        tplExample = $("#tplExample").clone().html();
        tplCompliance = $("#tplCompliance").clone().html();

        var lang = $("#lang").val();
        if (lang != null && lang != "") {
            lang = "?lang=" + lang;
        } else {
            lang = "";
        }

        $.ajaxRest({
            url: "/api/1/checkers/" + checkerId + "/desc" + lang,
            type: "GET",
            success : function (data, status, header) {
                if (header.status != 200)
                    return;

                checkerDescObj = data;

                var $btnReset = $checkerInfo.find("[name=btnReset]");
                if (data.examplesJson) {
                    if ($btnReset.hasClass("disabled")) {
                        $btnReset.removeClass("disabled");
                        $btnReset.on("click", function(e) {
                            eventReset();
                        });
                    }
                } else {
                    if (!$btnReset.hasClass("disabled")) {
                        $btnReset.addClass("disabled");
                        $btnReset.off("click");
                    }
                }

                $checkerInfo.find("[data-name=checkerName]").text(data.checkerName);
                $checkerInfo.find("[data-name=checkerLang]").text(data.checkerLang);

                setTextarea($("#description"), data.description);

                var $vulnerability = $("#vulnerability");
                $vulnerability.hide();
                if (data.vulnerability) {
                    setTextarea($vulnerability.find("div[name=value]"), data.vulnerability);
                    $vulnerability.show();
                }

                if (data.complianceItemList != null && data.complianceItemList.length > 0) {
                    var $compliances = $("#compliances");
                    var $compliancesValue = $("#compliances").find('[name=value]');

                    var referenceMap = new CustomMap();
                    for (var i in data.complianceItemList) {
                        var complianceItemList = referenceMap.get(data.complianceItemList[i].complianceId);
                        if (complianceItemList == null) {
                            complianceItemList = [];
                        }
                        complianceItemList.push(data.complianceItemList[i]);
                        referenceMap.put(data.complianceItemList[i].complianceId, complianceItemList);
                    }

                    for (var i in referenceMap.keys()) {
                        var complianceItemList = referenceMap.get(referenceMap.keys()[i]);
                        var sbComplianceItems = new StringBuffer();
                        for (j in complianceItemList) {
                            var name = complianceItemList[j].complianceItemName;
                            if (complianceItemList[j].description != null) {
                                if (name.indexOf(complianceItemList[j].description) < 0) {
                                    // MISRA같은 경우 name에 desc를 몽땅 다 넣어놓은 경우가 있어서 뺀다..
                                    name += ": " + complianceItemList[j].description;
                                }
                            }
                            if (complianceItemList[j].url != null) {
                                sbComplianceItems.append('<div><a class="compliance-item" target="_blank" href="').append(complianceItemList[j].url).append('"><span>').append(name).append("</span></a></div>")
                            } else {
                                sbComplianceItems.append("<div>").append(name).append("</div>")
                            }
                        }
                        var compliance = tplCompliance.compose({
                            compliance: complianceItemList[0].complianceName,
                            complianceItems: sbComplianceItems.toString()
                        });
                        $compliancesValue.append(compliance);
                    }

                    $compliances.show();
                }

                if (data.checkerLangCode == "c" || data.checkerLangCode == "cpp" || data.checkerLangCode == "ccpp") {
                    mode = "text/x-c++src"; // clike
                } else if (data.checkerLangCode == "objc") {
                    mode = "text/x-objectivec"; // clike
                } else if (data.checkerLangCode == "cs") {
                    mode = "text/x-csharp"; // clike
                } else if (data.checkerLangCode == "asp") {
                    mode = "text/x-java"; // clike
                } else if (data.checkerLangCode == "html") {
                    mode = "text/html"; // htmlmixed
                } else if (data.checkerLangCode == "xml") {
                    mode = "text/xml"; // xml
                } else if (data.checkerLangCode == "java") {
                    mode = "text/x-java"; // clike
                } else if (data.checkerLangCode == "js") {
                    mode = "text/javascript"; // javascript
                } else if (data.checkerLangCode == "php") {
                    mode = "text/x-php"; // php
                } else if (data.checkerLangCode == "sql") {
                    mode = "text/x-sql"; // sql
                } else if (data.checkerLangCode == "vbs") {
                    mode = "text/vbscript"; // vbscript
                } else if (data.checkerLangCode == "vbnet") {
                    mode = "text/x-vb"; // vb
                } else if (data.checkerLangCode == "abap") {
                    mode = "text/x-abap"; // abap
                } else if (data.checkerLangCode == "properties") {
                    mode = "text/x-properties"; // properties
                } else {
                    if (data.checkerName.startsWith("ANDROID_MANIFES") > 0) {
                        mode = "text/xml";
                    } else {
                        mode = "text/plain";
                    }
                }

                if (data.examples) {
                    var $examples = $("#examples");

                    for (var i in data.examples) {
                        var exampleData = data.examples[i];
                        var example = tplExample.compose({
                            num: i
                        });
                        var $example = $(example);
                        $example.find("textarea[name=exampleSrc]").text(exampleData.example != null ? exampleData.example : "");
                        $example.find("textarea[name=solutionSrc]").text(exampleData.solution != null ? exampleData.solution : "");

                        setTextarea($example.find("div[name=exampleDesc]"), exampleData.exampleDesc);
                        setTextarea($example.find("div[name=solutionDesc]"), exampleData.solutionDesc);

                        if (data.examples.length > 1) {
                            // 예제가 2개 이상일 때 번호 부여
                            $example.find("span[name=num]").text(Number(i) + 1);
                        }
                        $examples.append($example);
                    }

                    $examples.show();

                    var exampleSrcs = $examples.find("textarea[name=exampleSrc]");
                    for (var i = 0; i < exampleSrcs.length; i++) {
                        var codeMirror = CodeMirror.fromTextArea(exampleSrcs[i], {
                            lineNumbers: true,
                            matchBrackets: true,
                            readOnly: true,
                            mode: mode
                        });
                        codeMirror.setSize("100%", "100%");
                        codeMirrorExampleMap.put(i.toString(), codeMirror);
                    }

                    var solutionSrcs = $examples.find("textarea[name=solutionSrc]");
                    for (var i = 0; i < exampleSrcs.length; i++) {
                        var codeMirror = CodeMirror.fromTextArea(solutionSrcs[i], {
                            lineNumbers: true,
                            matchBrackets: true,
                            readOnly: true,
                            mode: mode
                        });
                        codeMirror.setSize("100%", "100%");
                        codeMirrorSolutionMap.put(i.toString(), codeMirror);
                    }

                    // 값이 없는 예제/해결방법은 Hide
                    for (var i in data.examples) {
                        var exampleData = data.examples[i];
                        var $example = $examples.find("div[name=example-set][num=" + i + "]");
                        if (!exampleData.example && !exampleData.exampleDesc) {
                            // 소스/설명 둘다 없으면 아예 감춤
                            $example.find("div[name=example]").hide();
                        } else {
                            if (!exampleData.example) {
                                $example.find("textarea[name=exampleSrc]").parent().hide(); //
                            } else if (!exampleData.exampleDesc) {
                                $example.find("div[name=exampleDesc]").hide();
                            }
                        }

                        if (!exampleData.solution && !exampleData.solutionDesc) {
                            // 소스/설명 둘다 없으면 아예 감춤
                            $example.find("div[name=solution]").hide();
                        } else {
                            if (!exampleData.solution) {
                                $example.find("textarea[name=solutionSrc]").parent().hide();
                            } else if (!exampleData.solutionDesc) {
                                $example.find("div[name=solutionDesc]").hide();
                            }
                        }
                    }
                }

                // 초기화 함수가 있은 경우
                if(fnInit) {
                    fnInit()
                }
            }
        });
    }

    function eventReset() {
        swal({
            title: messageController.get("confirm.common.9"), // 기본값으로 변경되어 저장됩니다. 계속하시겠습니까?
            type: "warning",
            showCancelButton: true,
            confirmButtonText: messageController.get("label.ok"),
            cancelButtonText: messageController.get("label.cancel"),
            closeOnConfirm: true,
            closeOnCancel: true
        }, function(isConfirm) {
            if (isConfirm) {
                $.ajaxRest({
                    url: "/api/1/checkers/" + checkerId + "/desc",
                    type: "DELETE",
                    success : function (data, status, header) {
                        if(isModal) {
                            $.modalCheckerInfo.show(checkerDescObj.checkerId, checkerDescObj.checkerName);
                        } else {
                            location.reload();
                        }

                        $.toastGreen({
                            text: messageController.get("label.checker") + ' ' + checkerDescObj.checkerName + ' ' + messageController.get("label.has.been.modified")
                        });
                    }
                });
            }
        });
    }

    function eventShowModify(e) {

        $checkerInfo.find('[data-name=checkerTitle]').text(messageController.get("label.modify.checker.description"));

        if (checkerDescObj == null)
            return;
        $("#description").html($("<textarea/>", {
            text: checkerDescObj.description != null ? checkerDescObj.description.replace("<br>", "\n") : ""
        }));

        $("#vulnerability").show();
        var $vulnerabilityValue = $("#vulnerability div[name=value]");
        $vulnerabilityValue.html($("<textarea/>", {
            text: checkerDescObj.vulnerability != null ? checkerDescObj.vulnerability.replace("<br>", "\n") : ""
        }));

        for (var i in codeMirrorExampleMap.keys()) {
            codeMirrorExampleMap.get(codeMirrorExampleMap.keys()[i]).setOption("readOnly", false);
        }
        for (var i in codeMirrorSolutionMap.keys()) {
            codeMirrorSolutionMap.get(codeMirrorSolutionMap.keys()[i]).setOption("readOnly", false);
        }

        var exampleSet = $("#examples div[name=example-set]");
        for (var i = 0; i < exampleSet.length; i++) {
            var $exampleSet = $(exampleSet[i]);
            $exampleSet.find("div[name=example]").show();
            $exampleSet.find("textarea[name=exampleSrc]").parent().show();
            $exampleSet.find("div[name=exampleDesc]").show();
            $exampleSet.find("div[name=solution]").show();
            $exampleSet.find("textarea[name=solutionSrc]").parent().show();
            $exampleSet.find("div[name=solutionDesc]").show();

            var exampleDesc = $exampleSet.find("div[name=exampleDesc]");
            $(exampleDesc).html($("<textarea/>", {
                text: checkerDescObj.examples[i].exampleDesc
            }));
            var solutionDesc = $exampleSet.find("div[name=solutionDesc]");
            $(solutionDesc).html($("<textarea/>", {
                text: checkerDescObj.examples[i].solutionDesc
            }));
        }

        $checkerInfo.find("[name=btnReset]").show();
        $checkerInfo.find("[name=btnClose]").hide();
        $checkerInfo.find("[name=btnShowModify]").hide();
        $checkerInfo.find("[name=btnCancel]").show();
        $checkerInfo.find("[name=btnModify]").show();
        $('.checker-content').find("[name=btnAddExample]").show();
    }

    function eventCancel(e) {
        swal({
            title : messageController.get("confirm.common.3"),
            type : "warning",
            showCancelButton : true,
            confirmButtonText : messageController.get("label.continue"),
            cancelButtonText : messageController.get("label.cancel"),
            closeOnConfirm : true,
            closeOnCancel : true
        }, function(isConfirm) {
            if (isConfirm) {
                if(isModal) {
                    $.modalCheckerInfo.show(checkerDescObj.checkerId, checkerDescObj.checkerName);
                } else {
                    location.reload();
                }
            }
        });
    }

    function eventModify(e) {
        var requestBody = {};
        requestBody.checkerId = checkerId;
        requestBody.description = $("#description textarea").val();
        requestBody.vulnerability = $("#vulnerability div textarea").val();
        if (requestBody.vulnerability != null && requestBody.vulnerability.trim().length == 0)
            requestBody.vulnerability = null;

        var exampleSet = $("#examples div[name=example-set]");
        var examples = [];
        for (var i = 0; i < exampleSet.length; i++) {
            var $example = $(exampleSet[i]);

            var example = {};
            example.example = codeMirrorExampleMap.get($example.attr("num")).getValue();
            example.exampleDesc = $example.find("div[name=exampleDesc] textarea").val();
            example.solution = codeMirrorSolutionMap.get($example.attr("num")).getValue();
            example.solutionDesc = $example.find("div[name=solutionDesc] textarea").val();
            if (example.example.trim().length == 0) {
                example.example = null;
            }
            if (example.exampleDesc.trim().length == 0) {
                example.exampleDesc = null;
            }
            if (example.solution.trim().length == 0) {
                example.solution = null;
            }
            if (example.solutionDesc.trim().length == 0) {
                example.solutionDesc = null;
            }
            if (example.example || example.exampleDesc || example.solution || example.solutionDesc) {
                examples.push(example);
            }
        }

        if (examples.length > 0) {
            requestBody.examples = examples;
        }

        $.ajaxRest({
            url: "/api/1/checkers/" + checkerId + "/desc",
            type: "PUT",
            data: requestBody,
            block : true,
            success : function (data, status, header) {
                if (isModal) {
                    $.modalCheckerInfo.show(checkerDescObj.checkerId, checkerDescObj.checkerName);
                } else {
                    location.reload();
                }

                $.toastGreen({
                    text: messageController.get("label.checker") + ' ' + checkerDescObj.checkerName + ' ' + messageController.get("label.has.been.modified")
                });
            }
        });
    }

    function eventAddExample(e) {
        if (codeMirrorExampleMap.size() > 3) {
            swal({
                title: messageController.get("415011"), // 더 이상 추가할 수 없습니다.
                type: "warning",
                showCancelButton: false,
                confirmButtonText: messageController.get("label.ok"),
                closeOnConfirm: true
            });
            return;
        }

        var $examples = $("#examples");
        $examples.show();
        var num = 1;
        if (codeMirrorExampleMap.size() > 0) {
            num = (Number(codeMirrorExampleMap.keys()[codeMirrorExampleMap.size() -1]) + 1).toString();
        }
        var example = tplExample.compose({
            example: "\n\n",
            solution: "\n\n",
            num: num
        });


        var $example = $(example);
        $example.find("span[name=num]").text(num);

        var exampleDesc = $example.find("div[name=exampleDesc]");
        $(exampleDesc).html($("<textarea/>", {
            text: ""
        }));
        var solutionDesc = $example.find("div[name=solutionDesc]");
        $(solutionDesc).html($("<textarea/>", {
            text: ""
        }));

        $examples.append($example);

        var codeMirrorExample = CodeMirror.fromTextArea($example.find("textarea[name=exampleSrc]")[0], {
            lineNumbers: true,
            matchBrackets: true,
            mode: mode
        });
        codeMirrorExample.setSize("100%", "100%");
        codeMirrorExampleMap.put(num, codeMirrorExample);

        var codeMirrorSolution = CodeMirror.fromTextArea($example.find("textarea[name=solutionSrc]")[0], {
            lineNumbers: true,
            matchBrackets: true,
            mode: mode
        });
        codeMirrorSolution.setSize("100%", "100%");
        codeMirrorSolutionMap.put(num, codeMirrorSolution);

    }

    function setTextarea($obj, value) {
        if (value == null)
            return;
        var arr = value.split("\n");
        for (var i in arr) {
            $obj.append($("<textarea/>", {text: arr[i]}).html());
            if (i < (arr.length - 1)) {
                $obj.append("<br>");
            }
        }
    }

    /**
     * 모달 버전과 윈도우의 두가지 버전에서 호출됨.
     * 모달의 경우 호출 전까지 초기화 안함.
     * 윈도우의 경우 초기화 진행함.
     */
    if($modal.length > 0) {
        // 모달이 존재할 경우 초기화 안함.
        return;
    } else {
        initParam();
        initEvent();
        initDesc();
    }
});