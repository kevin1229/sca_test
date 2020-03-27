$(function(){

    (function($, window) {

        var ScansIssuesSourceCode = (function(){
            var innerData;

            function ScansIssuesSourceCode() {
            }

            /**
             * Ace editor 에 에러메세지를 포함하여 넣는다.
             * Ctag 이벤트도 포함
             *
             * @param target
             * @param issue
             * @param fileName
             */
            function showEditor(target, issue, fileName) {

                $.ajaxRest({
                    url : "/api/1/issues/" + issue.issueId + "/alarms",
                    type : "GET",
                    success : function(data, textStatus, header) {
                        var defect = data.defect;
                        if (defect == undefined) {
                            defect = data;
                        }
                        var issueInfoData = data;
                        var issueInfoDefect = defect;
                        var newTarget = issueInfoDefect.cid;

                        if (newTarget === undefined) {
                            if (issueInfoDefect.start != undefined) {
                                newTarget = issueInfoDefect.start.cid;
                            } else {
                                newTarget = issueInfoDefect.startCid;
                            }
                        }

                        if (newTarget === undefined) {
                            newTarget == null;
                        }

                        $mainContent.find('#code' + target).attr('id', 'code' + newTarget);

                        var editor = ace.edit("code" + newTarget);
                        editor.setTheme( "ace/theme/" + issueSourceTheme);
                        editor.setFontSize(parseInt(issueSourceFontSize));
                        editor.setReadOnly(true);
                        editor.commands.addCommand({
                            name: 'help',
                            bindKey: {win: 'h', mac: 'h'},
                            exec: function(editor) {
                                $('#modalKeyboardShortCut').modal('toggle');
                            },
                            readOnly: true
                        });

                        editor.setAutoScrollEditorIntoView(true);

                        var messageArray = new Array();
                        var scanId = issue.scanId;
                        if(issue != null && issue.issueId != null) {
                            issueInfoData.issueId = new Object();
                            issueInfoData.issueId = issue.issueId;
                            drawIssueInfo(editor, issueInfoData, issueInfoDefect.cid, messageArray);
                        } else {
                            var once = true;
                            editor.renderer.on('afterRender', function() {
                                if(once){
                                    editor.gotoLine(parseInt(issue.sinkLine) + 1,0,true);
                                    once = false;
                                }
                            });
                        }

                        var lang = fileName.split('.').pop();
                        if (lang === 'js') {
                            lang = 'javascript';
                        } else if (lang === 'c' || lang === 'h' || lang === 'cpp' ) {
                            lang = 'c_cpp';
                        } else if (lang === 'cs') {
                            lang = 'csharp';
                        } else if (lang === 'py') {
                            lang = 'python';
                        } else if (lang === 'vb') {
                            lang = 'vbscript';
                        } else {
                            lang = 'java';
                        }

                        try {
                            editor.getSession().setMode("ace/mode/" + lang);
                        } catch (err){
                            editor.getSession().setMode("ace/mode/text");
                        }

                        $mainContent.find("#code" + newTarget).css('height', $('#mainContent').height() - $("#tabListLeft").height() - $(".currentPath").height() - 20);

                        var prevMarkerId = null;
                        editor.on("click", function(e){
                            var editor = e.editor;
                            var pos = editor.getCursorPosition();
                            var token = editor.session.getTokenAt(pos.row, pos.column);

                            clearCtagTable();

                            scansIssuesSourceCode.removeCtag(editor, messageArray);
                            if (token != null) {
                                scansIssuesSourceCode.showCtag(editor, issue.issueId, token.value, pos.row, 1, messageArray);
                            }

                            // Selection marker remover
                            if (prevMarkerId != null) {
                                editor.getSession().removeMarker(prevMarkerId);
                            }

                            if (token != null) {
                                var highlight = new SearchHighlight(token.value, "ace_selected-word", "text");
                                var marker = editor.getSession().addDynamicMarker(highlight);
                                prevMarkerId = marker.id;
                            }
                        });
                        editor.setShowPrintMargin(false);
                    }
                });
            }

            /**
             * Editor 에 알람 메시지 추가
             *
             * @param line
             * @param type
             * @param message
             * @param messageArray
             * @param callMessage
             */
            function createMessage(line, type, message, messageArray, data, cid) {

                if (line == 0) {
                    line = 1;
                }

                var w = {
                    row: line-1,
                    fixedWidth: true,
                    coverGutter: false,
                    el: document.createElement("div"),
                };

                var el = w.el;
                var messageNode = document.createElement("div");
                var br = document.createElement("br");
                var callMessage = null;
                if (data != undefined && data.ctxMap != undefined) {
                    callMessage = data.ctxMap[cid];
                }

                if (callMessage == null && cid != null) {
                    callMessage = data.ctxMap[cid.callee.cid];
                    cid = cid.callee.cid;
                    message = callMessage.cloc.func;
                }

                messageNode.className = type + "-message";
                messageNode.innerHTML = message;

                // Call 이 있을 경우
                if (callMessage != null) {
                    var callNode = document.createElement("button");

                    if(callMessage.type === 'prev') {
                        callNode.className = 'btn btn-call fa fa-arrow-left';
                    } else {
                        callNode.className = 'btn btn-call fa fa-arrow-right';
                    }

                    if(cid.includes(".")) {
                        callNode.id = 'call' + cid.replace(/\./g, "_");
                    } else {
                        callNode.id = 'call' + cid;
                    }

                    $(callNode).on("click", function() {
                        var target = cid; //$("[id^=tab_pane]").length + 1;

                        if(target.includes(".")) {
                            target = target.replace(/\./g, "_");
                        }

                        if($('#tabList' + position).find('[href="#tab_pane'+ target + '"]').length == 0) {
                            $('#tabContent' + position).find('#tab_pane' + target).remove();
                        }

                        if($('#tabList' + position).find('[href="#tab_pane'+ target + '"]').length == 0 && $('#tabContent' + position).find('#tab_pane' + target).length == 0) {
                            var filePath = "";
                            var lineNumber = "";

                            if(callMessage.scope) {
                                if(!callMessage.scope.loc) {
                                    if(!callMessage.scope.file) {
                                        filePath = callMessage.file;
                                        lineNumber = callMessage.scope.startLine;
                                    } else {
                                        filePath = callMessage.scope.file;
                                        lineNumber = callMessage.scope.lineEnd;
                                    }

                                } else {
                                    filePath = callMessage.scope.loc.file;
                                    lineNumber = callMessage.scope.loc.lineEnd;
                                }
                            } else {
                                filePath = callMessage.cloc.file.replace(/\\\\/g, "\\");
                                lineNumber = callMessage.cloc.lineStart;
                            }
                            scansIssuesSourceCode.showCallEditor(filePath, lineNumber, data, cid, target, position);
                        } else {

                            $('#tabListRight a[href="#tab_pane' + target + '"]').tab('show');

                            setTimeout(function () {
                                var lineNumber = "";
                                if(callMessage.scope) {
                                    if(!callMessage.scope.loc) {
                                        lineNumber = callMessage.scope.lineEnd;
                                    } else {
                                        lineNumber = callMessage.scope.loc.lineEnd;
                                    }
                                } else {
                                    lineNumber = callMessage.cloc.lineStart;
                                }

                                var editor = ace.edit("code" + target);
                                editor.gotoLine(lineNumber, 0, true);
                            }, 300);
                        }
                    });
                    messageNode.appendChild(callNode);
                }

                el.appendChild(messageNode);
                el.style.color = "#ffffff";

                var duplicatedLine = false;

                // 같은 라인에 메세지가 들어갈 경우
                if(messageArray.length > 0) {
                    for(var i = 0; i < messageArray.length; i++) {
                        if(messageArray[i].row == (line - 1)) {
                            messageArray[i].el.appendChild(messageNode);
                            duplicatedLine = true;
                        }
                    }
                }

                // 같은 라인에 메세지가 들어가지 않을 경우
                if(!duplicatedLine) {
                    messageArray.push(w);
                }
            }

            /**
             * 이슈 라인 별 정보 출력
             * @param editor
             * @param data
             * @param cid
             * @param messageArray
             */
            function drawIssueInfo(editor, data, cid, messageArray) {

                editor.container.style.lineHeight = 1.6;
                editor.renderer.updateFontSize();
                var isBranch = sessionUserController.getUser().personalDisplay.issueSourceBranch;

                // Line Widgets 초기화
                editor.getSession().widgetManager = new LineWidgets(editor.session);
                editor.getSession().widgetManager.attach(editor);

                // Java alarm printing
                if (data.ctxMap != null) {
                    // Java alarm
                    if (data.ctxMap[cid] != undefined && !cid.includes(".") && data.defect.startCid == undefined) {
                        // Java event list
                        var eventList = data.ctxMap[cid].eventList;
                        var alarmLine;
                        // Other event List
                        if(eventList === undefined) {
                            eventList = data.ctxMap[cid].eventCollection;
                        }

                        for (var i = 0; i < eventList.length; i++) {
                            var line = parseInt(eventList[i].loc.line) - 1;

                            if (eventList[i].type === undefined) {
                                eventList[i].type = null;
                            }
                            var tempLIne = drawIssueMessage(editor, eventList[i], line, messageArray, data, cid);
                            if(tempLIne != undefined) {
                                alarmLine = tempLIne;
                            }
                        }

                        editor.gotoLine(alarmLine - 10, 0, true);

                        for (var j = 0; j < messageArray.length; j++) {
                            editor.getSession().widgetManager.addLineWidget(messageArray[j]);
                        }

                        // SQL CC 여부 검사
                        if(data.defect.tableName != null && data.defect.tableName != "") {
                            scansIssuesSourceCode.showSQLCC($("#scanId").val(), data.defect.tableName);
                        }

                    } else if (data.defect != undefined && data.boxMap == undefined) {
                        // HORUS Alarm

                        var targetCid = data.defect.startCid;

                        if(cid) {
                            targetCid = cid;
                        }

                        var eventMap = data.ctxMap[targetCid].eventMap;
                        var alarmLine;

                        for (var i in eventMap) {
                            var line = parseInt(eventMap[i].line) - 1;

                            if (eventMap[i].type === undefined) {
                                eventMap[i].type = null;
                            }

                            var tempLIne = drawIssueMessage(editor, eventMap[i], line, messageArray, data, data.defect.startCid);
                            if (tempLIne != undefined) {
                                alarmLine = tempLIne;
                            }
                        }

                        editor.gotoLine(alarmLine - 10, 0, true);

                        for(var j = 0; j < messageArray.length; j++) {
                            editor.getSession().widgetManager.addLineWidget(messageArray[j]);
                        }
                    } else if(data.defect.rank != undefined) { // C alarm
                        if(data.cid == undefined) {
                            data.cid = data.defect.start.cid;
                        }

                        if(cid == undefined) {
                            cid = data.cid;
                        }

                        var eventList = data.ctxMap[cid].bidList;

                        for (var i = 0; i < eventList.length; i++) {
                            var box = data.boxMap[eventList[i]];

                            var line = parseInt(box.bloc.line) - 1;

                            if (box.type === undefined) {
                                box.type = null;
                            }
                            var tempLIne = drawIssueMessage(editor, box, line, messageArray, data, cid);
                            if(tempLIne != undefined) {
                                alarmLine = tempLIne;
                            }
                        }

                        editor.gotoLine(alarmLine - 10, 0, true);

                        for(var j = 0; j < messageArray.length; j++) {
                            editor.getSession().widgetManager.addLineWidget(messageArray[j]);
                        }
                    }
                } else {
                    var lineData = null;
                    var message = null;

                    if (data.defect == undefined) {
                         // PMD 출력
                        lineData = data.beginline;
                        message = data.violation;
                    } else {
                        if (data.defect.loc != undefined) {
                            // comment 출력
                            lineData = data.defect.loc.line;
                        } else {
                            // HTML 출력
                            lineData = data.defect.line;
                        }

                        if (data.defect.todo != undefined) {
                            // comment 출력
                            message = data.defect.todo.message;
                        } else {
                            // HTML 출력
                            message = messageController.get('html.' + data.defect.checkerName + '.msg');
                        }
                    }

                    var line = parseInt(lineData) - 1;

                    editor.getSession().widgetManager = new LineWidgets(editor.session);
                    editor.getSession().widgetManager.attach(editor);

                    if (line == 0) {
                        editor.getSession().addGutterDecoration(line, "fa fa-exclamation-triangle");
                        editor.getSession().addMarker(new Range(line, 0, line, 1), 'sink', 'fullLine');
                        createMessage(line + 1, null, message, messageArray);
                        if(data.defect != undefined && data.defect.todo != undefined) {
                            // comment
                            createMessage(line + 1, null, data.defect.todo.value, messageArray);
                        }
                    } else {
                        editor.getSession().addGutterDecoration(line, "fa fa-exclamation-triangle");
                        editor.getSession().addMarker(new Range(line, 0, line, 1), 'sink', 'fullLine');
                        createMessage(line, null, message, messageArray);
                        if (data.defect != undefined && data.defect.todo != undefined) {
                            // comment
                            createMessage(line, null, data.defect.todo.value, messageArray);
                        }
                    }

                    for(var j = 0; j < messageArray.length; j++) {
                        editor.getSession().widgetManager.addLineWidget(messageArray[j]);
                    }

                    editor.gotoLine(line - 10, 0, true);
                }
            }

            /**
             * 이슈 메시지 출력
             * @param editor
             * @param eventItem
             * @param line
             * @param messageArray
             * @param data
             * @returns {*}
             */
            function drawIssueMessage(editor, eventItem, line, messageArray, data, cid) {
                var alarmLine;
                var isBranch = sessionUserController.getUser().personalDisplay.issueSourceBranch;

                if(cid == undefined) {
                    cid = data.cid;
                }

                editor.session.gutterRenderer =  {
                    getWidth: function(session, lastLineNumber, config) {
                        var width = lastLineNumber.toString().length * config.characterWidth;
                        if(width < 12) {
                            width = 30;
                        }

                        return width;
                    },
                    getText: function(session, row) {
                        return row + 1;
                    }
                };

                var target = " " + cid + "-" + line;
                // 이슈 타입 설정 : 엔진 결과 xml 마다 다름
                if(eventItem.type == '') {
                    eventItem.type = 'source'
                } else if(eventItem.type == 'defect') {
                    eventItem.type = 'sink'
                } else if(eventItem.type == 'src') {
                    eventItem.type = 'source'
                } else if(eventItem.sinkEvent == true) {
                    eventItem.type = 'sink'
                } else if(eventItem.sourceEvent == true) {
                    eventItem.type = 'source'
                } else  if(eventItem.type == null) {
                    if(eventItem.defect) {
                        eventItem.type = 'sink';
                    } else if(eventItem.call) {
                        eventItem.type = 'call';
                    } else if(eventItem.branch) {
                        eventItem.type = 'branch';
                    } else {
                        eventItem.type = 'source';
                    }
                }

                if(eventItem.call) {
                    eventItem.type = 'call';
                }

                if (eventItem.tag == undefined) {
                    eventItem.tag = eventItem.eventMsg;
                }

                if (eventItem.type === 'source') {
                    target = "fa fa-sign-in" + target;
                    if(editor.getSession().$decorations[line] != undefined) {
                        if(!editor.getSession().$decorations[line].includes('fa-exclamation-triangle')) {
                            clearGutter(editor, line);
                            editor.getSession().addGutterDecoration(line, target);
                        }
                    } else {
                        editor.getSession().addGutterDecoration(line, target);
                    }

                    editor.getSession().addMarker(new Range(line, 0, line, 1), 'source', 'fullLine');
                    createMessage(line, eventItem.type, eventItem.tag, messageArray);
                } else if(eventItem.type === 'sink' || eventItem.type == null) {
                    clearGutter(editor, line);
                    target = "fa fa-exclamation-triangle" + target;
                    if(editor.getSession().$decorations[line] != undefined) {
                        if(editor.getSession().$decorations[line].includes('fa-external-link-square')) {
                            editor.getSession().removeGutterDecoration(line, "fa fa-external-link-square");
                        }
                    }

                    editor.getSession().addGutterDecoration(line, target);
                    editor.getSession().addMarker(new Range(line, 0, line, 1), 'sink', 'fullLine');
                    alarmLine = line;
                    createMessage(line, eventItem.type, eventItem.tag, messageArray);
                } else if(eventItem.type === 'branch' && isBranch) {
                    target = "fa fa-code-fork" + target;
                    if(editor.getSession().$decorations[line] != undefined) {
                        if(!editor.getSession().$decorations[line].includes('fa-exclamation-triangle')
                            && !editor.getSession().$decorations[line].includes('fa-sign-in')) {
                            clearGutter(editor, line);
                            editor.getSession().addGutterDecoration(line, target);
                            editor.getSession().addMarker(new Range(line, 0, line, 1), 'branch', 'fullLine');
                        }
                    } else {
                        editor.getSession().addGutterDecoration(line, target);
                        editor.getSession().addMarker(new Range(line, 0, line, 1), 'branch', 'fullLine');
                    }

                    createMessage(line, eventItem.type, eventItem.tag, messageArray);
                } else if(eventItem.type === 'call') {
                    target = "fa fa-reply-all" + target;
                    if(editor.getSession().$decorations[line] != undefined) {
                        if(!editor.getSession().$decorations[line].includes('fa-exclamation-triangle')
                            && !editor.getSession().$decorations[line].includes('fa-sign-in')) {
                            clearGutter(editor, line);
                            editor.getSession().addGutterDecoration(line, target);
                            editor.getSession().addMarker(new Range(line, 0, line, 1), 'call' , 'fullLine');
                        }
                    } else {
                        editor.getSession().addGutterDecoration(line, target);
                        editor.getSession().addMarker(new Range(line, 0, line, 1), 'call' , 'fullLine');
                    }

                    var callCid = eventItem.call.cid;

                    if(!callCid) {
                        callCid = eventItem.call;
                    }

                    createMessage(line, eventItem.type, eventItem.tag, messageArray, data, callCid);
                } else if(eventItem.type === 'framework') {
                    target = "fa fa-external-link-square" + target;
                    if(editor.getSession().$decorations[line] != undefined) {
                        if(!editor.getSession().$decorations[line].includes('fa-exclamation-triangle')
                            || !editor.getSession().$decorations[line].includes('fa-sign-in')) {
                            clearGutter(editor, line);
                            editor.getSession().addGutterDecoration(line, target);
                            editor.getSession().addMarker(new Range(line, 0, line, 1), 'framework', 'fullLine');
                        }
                    } else {
                        editor.getSession().addGutterDecoration(line, target);
                        editor.getSession().addMarker(new Range(line, 0, line, 1), 'framework', 'fullLine');
                    }
                    createMessage(line, eventItem.type, eventItem.tag, messageArray);
                }
                return alarmLine;
            }

            function clearGutter(editor, line) {
                editor.getSession().removeGutterDecoration(line, "fa fa-sign-in");
                editor.getSession().removeGutterDecoration(line, "fa fa-reply-all");
                editor.getSession().removeGutterDecoration(line, "fa fa-code-fork");
            }

            function clearCtagTable() {
                $.each($mainContent.find(".code"), function(index, value) {
                    var prev = ace.edit(value);
                    if(prev.widgetManager != undefined && prev.widgetManager.session.lineWidgets != undefined) {
                        for(var j = 0; j < prev.widgetManager.session.lineWidgets.length; j++) {
                            if(prev.widgetManager.session.lineWidgets[j] != undefined) {
                                var el = $(prev.widgetManager.session.lineWidgets[j].el);
                                el.find('.tag-table').remove();
                                prev.widgetManager.onWidgetChanged(prev.widgetManager.session.lineWidgets[j]);
                            }
                        }
                    }
                });
            }

            ScansIssuesSourceCode.prototype.redraw = function () {
                tabSeq = 0;
                scansIssuesSourceCode.showSourceCode(innerData, false, "left");
            }

            /**
             * 소스코드 출력
             *
             * 중요도 높음
             */
            ScansIssuesSourceCode.prototype.showSourceCode = function(data, extend, position) {
                innerData = data;

                var posStr = position.capitalizeFirstLetter();

                if (posStr === "Right") {
                    $("#leftBox").removeClass("col-xs-12");
                    $("#leftBox").addClass("col-xs-6");
                    $("#rightBox").attr("style", "");

                    //display first tab
                    var tabFirst = $('#tabListRight a:last');
                    tabFirst.tab('show');
                    var tabFirst = $('#tabListLeft a:last');
                    tabFirst.tab('show');
                } else  {
                    $("#tabListLeft").css("display", "");
                }

                // 소스 보여주기 : 로딩 넣기
                $.ajaxRest({
                    url: "/api/1/issues/" + innerData.issueId + "/source",
                    type: "GET",
                    success: function (data, textStatus, header) {

                        // Tab content 스타일 변경
                        var sourceCodeTemplate = $("#sourceCodeTemplate").clone();
                        sourceCodeTemplate.css("display", "");
                        sourceCodeTemplate.css("height", "inherit");
                        sourceCodeTemplate.attr("id", "tab" + (++tabSeq));

                        // fileContent without BOM
                        var fileContent = data.fileContent.escapeHTML();
                        if(fileContent.startsWith('\uFEFF')) {
                            fileContent = fileContent.substring(1);
                        }

                        var tempContentPane = sourceCodeTemplate.html().compose({
                            tabSeq : tabSeq,
                            filePath : data.filePath,
                            fileContent : fileContent
                        });

                        // Tab pane 만들기
                        var divTabPane = document.createElement('div');
                        divTabPane.className = "tab-pane fade in active";
                        divTabPane.setAttribute("id", "tab_pane" + tabSeq);
                        divTabPane.setAttribute("role", "tabpanel");
                        divTabPane.insertAdjacentHTML('beforeend', tempContentPane);

                        // 소스코드 html 추가
                        if (extend == false) {
                            $("#tabContent" + posStr).html(divTabPane);
                        } else {
                            // 이전  tab unactive
                            $("#tabContent" + posStr).find('.tab-pane').removeClass('active');
                            $("li").removeClass("active");

                            // 소스코드 html 추가
                            $("#tabContent" + posStr).append(divTabPane);
                        }

                        $("#tabList" + posStr).html(scansIssuesSourceCode.createTabTitle(" " + data.fileName, "tab_pane" + tabSeq, "font-size: 12px;color: #CB4333;", false));

                        $('#settingDropdown').removeClass('hidden');

                        // 이슈 선택 시 60%만 보이도록
                        showHalfSourceCode();

                        showEditor(tabSeq, innerData, data.fileName);

                        resizeEditor($("#mainContent").height());

                        var thisTabSeq = tabSeq;
                        $('#tab_pane' + thisTabSeq + ' .ace_scrollbar.ace_scrollbar-h').off('scroll');

                        $('#tab_pane' + thisTabSeq + ' .ace_scrollbar.ace_scrollbar-h').scroll(function(e) {
                            $('#tab_pane' + thisTabSeq + ' .ace_lineWidgetContainer').css('margin-left', -e.currentTarget.scrollLeft);
                        });

                        // 오른쪽 클릭 메뉴 event 처음 tab은 제외
                        $("#tabListLeft li").not(":first").contextMenu({
                            menuSelector: "#contextMenu",
                            menuSelected: function (invokedOn, selectedMenu) {
                                var menuIndex = selectedMenu[0].tabIndex;
                                if(invokedOn[0].hash == "#tab_pane1") {
                                    return;
                                }

                                // 이동
                                if (menuIndex == 1) {
                                    this.splitSourceCode(invokedOn)
                                } else if (menuIndex == 2){ // 복사
                                    $("#leftBox").removeClass("col-xs-12");
                                    $("#leftBox").addClass("col-xs-6");
                                    $("#rightBox").attr("style", "");
                                    $("#tabListRight").append(scansIssuesSourceCode.createTabTitle(" " + invokedOn[0].innerText, invokedOn[0].hash.replace("#", "")+ "Clone" , "font-size: 12px;color: #CB4333;", true));

                                    var tabClone = $(invokedOn[0].hash).clone();
                                    tabClone.attr('id', tabClone.attr('id') + "Clone");
                                    // 이전 스크롤 삭제
                                    tabClone.find(".code").slimScroll({destroy: true});

                                    // 겹치지 않도록 복사하는 div id 변경
                                    tabClone.find(".code").attr('id', tabClone.find(".code").attr('id') + "Clone");
                                    var id = tabClone.find(".code").attr('id');
                                    $("#tabContentRight").append(tabClone);

                                    // 소스코드 scroll 추가
                                    $("#" + id).addClass("scrollbar-inner");
                                    //display first tab
                                    var tabFirst = $('#tabListRight a:last');
                                    tabFirst.tab('show');
                                } else if(menuIndex == 4){ // 닫기
                                    invokedOn[0].remove();
                                    $(invokedOn[0].hash).empty();
                                    //display last tab
                                    var tabLast = $('#tabListLeft a:last');
                                    tabLast.tab('show');
                                }

                                // 오른쪽 소스코드 오른쪽 클릭 메뉴 event
                                $("#tabListRight li").contextMenu({
                                    menuSelector: "#contextMenu",
                                    menuSelected: function (invokedOn, selectedMenu) {
                                        var menuIndex = selectedMenu[0].tabIndex;
                                        if (invokedOn[0].hash == "#tab_pane1") {
                                            return;
                                        }
                                        // 이동
                                        if (menuIndex == 1) {
                                            $("#tabListLeft").append(scansIssuesSourceCode.createTabTitle(" " + invokedOn[0].innerText, invokedOn[0].hash.replace("#", "") , "font-size: 12px;color: #CB4333;", true));

                                            invokedOn.remove();
                                            $(invokedOn[0].hash).detach().appendTo("#tabContentLeft");

                                            // display first tab
                                            var tabLast = $('#tabListLeft a:last');
                                            tabLast.tab('show');
                                        } else if(menuIndex == 2) { // 복사
                                            $("#leftBox").removeClass("col-xs-12");
                                            $("#leftBox").addClass("col-xs-6");
                                            $("#rightBox").attr("style", "");
                                            $("#tabListRight").append(scansIssuesSourceCode.createTabTitle(" " + invokedOn[0].innerText, invokedOn[0].hash.replace("#", "")+ "Clone" , "font-size: 12px;color: #CB4333;", true));

                                            var tabClone = $(invokedOn[0].hash).clone();
                                            tabClone.attr('id', tabClone.attr('id') + "Clone");
                                            // 이전 스크롤 삭제
                                            tabClone.find(".code").slimScroll({destroy: true});

                                            // 겹치지 않도록 복사하는 div id 변경
                                            tabClone.find(".code").attr('id', tabClone.find(".code").attr('id') + "Clone");
                                            console.log(tabClone.find(".code").attr('id'));
                                            var id = tabClone.find(".code").attr('id');
                                            $("#tabContentRight").append(tabClone);

                                            // 소스코드 scroll 추가
                                            $("#" + id).slimScroll({
                                                width : '100%',
                                                overflow : 'auto',
                                                // 코드 부분 높이 조절 : padding top + bottom = 4
                                                height : $("#sourceBoxTemplate").height() - $("#tabListLeft").height() - 31
                                            });
                                        }
                                    }
                                });
                            }
                        });
                    }
                });
            }

            /**
             * Ace editor 에 에러메세지를 포함하여 넣는다.
             * Ctag 이벤트도 포함
             *
             * @param target
             * @param data
             */
            ScansIssuesSourceCode.prototype.showCallEditor = function(filePath, line, issueData, cid, target) {
                var sourceBoxTemplate = $("#sourceBoxTemplate").clone();

                $("#tabListLeft").css("display", "");

                // 소스 보여주기 : 로딩 넣기
                $.ajaxRest({
                    url : "/api/1/scans/" + scanId + "/files/source",
                    data: encodeURI("filePath=" + filePath),
                    type : "GET",
                    success: function (data, textStatus, header) {

                        // Tab content 스타일 변경
                        var sourceCodeTemplate = $("#sourceCodeTemplate").clone();
                        sourceCodeTemplate.css("display", "");
                        sourceCodeTemplate.css("height", "inherit");
                        sourceCodeTemplate.attr("id", "tab" + target);

                        var tempContentPane = sourceCodeTemplate.html().compose({
                            tabSeq : target,
                            filePath : data.filePath,
                            fileContent : data.fileContent.escapeHTML()
                        });

                        // Tab pane 만들기
                        var divTabPane = document.createElement('div');
                        divTabPane.className = "tab-pane height-100 fade in active";
                        divTabPane.setAttribute("id", "tab_pane" + target);
                        divTabPane.setAttribute("role", "tabpanel");
                        divTabPane.insertAdjacentHTML('beforeend', tempContentPane);

                        $("#tabContent" + position + " .tab-pane").removeClass("active");

                        // 소스코드 html 추가
                        $("#tabContent" + position).append(divTabPane);
                        // 이전  tab unactive

                        $('#tabList' + position + ' li').removeClass('active');

                        if (position === 'Right') {
                            $("#leftBox").removeClass("col-xs-12");
                            $("#leftBox").addClass("col-xs-6");
                            $("#rightBox").attr("style", "");
                        }

                        $("#tabList" + position).append(scansIssuesSourceCode.createTabTitle(" " + data.fileName, "tab_pane" + target, "font-size: 1px;color: #FE9E00;", true));

                        var editor = ace.edit("code" + target);
                        editor.setTheme( "ace/theme/" + issueSourceTheme);
                        editor.setFontSize(parseInt(issueSourceFontSize));
                        editor.setReadOnly(true);
                        editor.commands.addCommand({
                            name: 'help',
                            bindKey: {win: 'h', mac: 'h'},
                            exec: function(editor) {
                                $('#modalKeyboardShortCut').modal('toggle');
                            },
                            readOnly: true
                        });
                        var messageArray = new Array();

                        editor.setAutoScrollEditorIntoView(true);

                        if (issueData != null) {
                            issueData.isCalled = '';
                            drawIssueInfo(editor, issueData, cid, messageArray);
                        }

                        var lang = data.fileName.split('.').pop();
                        if (lang === 'js') {
                            lang = 'javascript';
                        } else if (lang === 'c' || lang === 'h' || lang === 'cpp' ) {
                            lang = 'c_cpp';
                        } else if(lang === 'cs') {
                            lang = 'csharp';
                        } else if(lang === 'py') {
                            lang = 'python';
                        } else if (lang === 'vb') {
                            lang = 'vbscript';
                        } else {
                            lang = 'java';
                        }

                        editor.getSession().setMode("ace/mode/" + lang);

                        $mainContent.find("#code" + target).css('height', $($('.code')[0]).height() - ($('#tabList' + position).height() - 25) );

                        $('#tab_pane' + target + ' .ace_scrollbar.ace_scrollbar-h').off('scroll');

                        $('#tab_pane' + target + ' .ace_scrollbar.ace_scrollbar-h').scroll(function(e) {
                            $('#tab_pane' + target + ' .ace_lineWidgetContainer').css('margin-left', -e.currentTarget.scrollLeft);
                        });

                        var prevMarkerId = null;

                        editor.resize(true);
                        editor.on("click", function(e){
                            var editor = e.editor;
                            var pos = editor.getCursorPosition();
                            var token = editor.session.getTokenAt(pos.row, pos.column);

                            clearCtagTable();

                            scansIssuesSourceCode.removeCtag(editor, messageArray);
                            if (token != null ) {
                                scansIssuesSourceCode.showCtag(editor, issueData.issueId, token.value, pos.row, 1, messageArray);
                            }

                            // Selection marker remover
                            if (prevMarkerId != null) {
                                editor.getSession().removeMarker(prevMarkerId);
                            }

                            if (token != null) {
                                var highlight = new SearchHighlight(token.value, "ace_selected-word", "text");
                                var marker = editor.getSession().addDynamicMarker(highlight);
                                prevMarkerId = marker.id;
                            }
                        });

                        resizeEditor($("#mainContent").height(), line);

                        editor.scrollToLine(line, true, true, function () {});

                        editor.gotoLine(line, 0, true);

                        if(data.isCalled != undefined) {
                            editor.getSession().addMarker(new Range(line - 1, 0, line - 1, 1), 'selected', 'fullLine');
                        }
                    }
                });
            }

            ScansIssuesSourceCode.prototype.splitSourceCode = function(target) {

                $("#leftBox").removeClass("col-xs-12");
                $("#leftBox").addClass("col-xs-6");
                $("#rightBox").attr("style", "");
                $("#tabListRight").append(scansIssuesSourceCode.createTabTitle(" " + target[0].innerText, target[0].hash.replace("#", "") , "font-size: 12px;color: #CB4333;", true));

                target.remove();
                $(target[0].hash).detach().appendTo("#tabContentRight");

                //display first tab
                var tabFirst = $('#tabListRight a:last');
                tabFirst.tab('show');
                var tabFirst = $('#tabListLeft a:last');
                tabFirst.tab('show');
            }

            ScansIssuesSourceCode.prototype.showActiveSuggestion = function(data, activeSuggestion) {

                if (data.activeSuggestionYn !== "Y") {
                    return;
                }

                // 소스 보여주기 : 로딩 넣기
                $.ajaxText({
                    url: "/issues/activeSuggestion",
                    type: "GET",
                    data: "issueId=" + data.issueId + "&determinant=" + data.determinant + "&lang=" + sessionUserController.getUser().userLang,
                    success: function (data, textStatus, header) {

                        // Tab content 스타일 변경
                        var contentTemplate = $("#contentTemplate").clone();
                        contentTemplate.css("display", "");
                        contentTemplate.css("height", "inherit");
                        contentTemplate.attr("id", "tab" + (++tabSeq));

                        var tempContentPane = contentTemplate.html().compose({
                            sourceCodeHtml : data
                        });

                        $("#leftBox").removeClass("col-xs-12")
                        $("#leftBox").addClass("col-xs-6");
                        $("#rightBox").attr("style", "");

                        // Tab pane 만들기
                        var divTabPane = document.createElement('div');
                        divTabPane.className = "tab-pane height-100 fade in active";
                        divTabPane.setAttribute("id", "tab_pane" + tabSeq);
                        divTabPane.setAttribute("role", "tabpanel");
                        divTabPane.insertAdjacentHTML('beforeend', tempContentPane);
                        $("#tabContentRight").html(divTabPane);

                        $("#tabListRight").append(scansIssuesSourceCode.createTabTitle("Active Suggestion - " + messageController.get("label.total.num").f($('.alternative').length) ,"tab_pane" + tabSeq, "font-size: 12px;color: #CB4333;", true));

                        //display first tab
                        var tabFirst = $('#tabListRight a:last');
                        tabFirst.tab('show');
                        var tabFirst = $('#tabListLeft a:last');
                        tabFirst.tab('show');
                    }
                });
            }

            /**
             * issue SQL CC
             *
             * issue id 를 받아 SQL CC 를 출력한다.
             *
             * @param param
             */
            ScansIssuesSourceCode.prototype.showSQLCC = function(scanId, tblName) {

                // Target 지정
                var requestBody = {};
                requestBody.scanId = scanId;
                requestBody.tblNames = tblName.split(',');

                // SQL 보여주기
                $.ajaxRest({
                    url: "/api/1/scans/ddl/tbl/crestmt",
                    data: requestBody,
                    type: "POST",
                    success : function (data, status, header) {

                        if (data == null || data.creStmt == null) {
                            return;
                        }

                        var tempContentPane = "<div id='crestmt'>" + data.creStmt.escapeHTML() + "</div>";

                        $("#leftBox").removeClass("col-xs-12");
                        $("#leftBox").addClass("col-xs-6");
                        $("#rightBox").attr("style", "");

                        // Tab pane 만들기
                        var divTabPane = document.createElement('div');
                        divTabPane.className = "tab-pane height-100 fade in active";
                        divTabPane.setAttribute("id", "tab_pane" + tabSeq);
                        divTabPane.setAttribute("role", "tabpanel");
                        divTabPane.insertAdjacentHTML('beforeend', tempContentPane);

                        $("#tabListRight").append(scansIssuesSourceCode.createTabTitle("SQL Table Creation", "crestmt", "font-size: 12px;color: #CB4333;", true));
                        $("#tabContentRight").html(divTabPane);

                        //display first tab
                        var tabFirst = $('#tabListRight a:last');
                        tabFirst.tab('show');
                        var tabFirst = $('#tabListLeft a:last');
                        tabFirst.tab('show');


                        var editor = ace.edit("crestmt");
                        editor.setReadOnly(true);
                        editor.getSession().setMode("ace/mode/sql");

                        $("#crestmt").css('height', $('#mainContent').height() - $("#tabListLeft").height() - 1);
                    }
                });
            }

            /**
             * 소스코드 탭 기본 title 생성
             *
             * @param title
             * @returns 소스 코드 탭 html
             */
            ScansIssuesSourceCode.prototype.createTabTitle = function(title, tabHref, dotStyle, active) {

                var li = document.createElement('li');
                var a = document.createElement('a');
                var text = document.createTextNode(title);
                var dot = document.createElement('i');
                var hand = document.createElement('i');
                var closeButton = document.createElement('button');
                li.setAttribute("role", "tab");
                dot.className = "fa fa-exclamation-triangle";
                hand.className = "fa fa-hand-o-right";

                var closeIcon = document.createElement('i');
                closeIcon.className = "fa fa-times";
                closeIcon.setAttribute("aria-hidden","true");

                closeButton.className = "close";
                closeButton.setAttribute("type", "button");
                closeButton.appendChild(closeIcon);


                // Tab 을 Active 상태로 만들기
                if (active == true) {
                    li.className = "active";

                    $('#tabListRight').on('click','.close',function(){
                        var tabID = this.parentNode.hash;
                        $(this.parentNode.parentNode).remove();
                        $(tabID).remove();

                        if($("#tabListRight").children().length < 1) {
                            clearRightContent();
                        } else {
                            //display first tab
                            var tabFirst = $('#tabListRight a:last');
                            tabFirst.tab('show');
                        }
                        resizeEditor($("#mainContent").height(), 1);
                    });

                } else {
                    a.appendChild(dot);
                }

                $('#tabListLeft').on('click','.close',function(){
                    var tabID = this.parentNode.hash;
                    $(this.parentNode.parentNode).remove();
                    $(tabID).remove();

                    if($("#tabListLeft").children().length < 1) {
                        unselectedIssue();
                    } else {
                        //display first tab
                        var tabFirst = $('#tabListLeft a:last');
                        tabFirst.tab('show');
                        resizeEditor($("#mainContent").height(), 1);
                    }
                });

                // 기본 제목에 사용되는 dot font 스타일
                dot.style = dotStyle;

                a.setAttribute("href", "#" + tabHref);
                a.setAttribute("data-toggle", "tab");
                a.setAttribute("aria-expanded", "true");
                if(title.startsWith("Active Suggestion")) {
                    a.appendChild(hand);
                }
                a.appendChild(text);
                a.appendChild(closeButton);
                li.appendChild(a);

                return li;
            }

            /**
             * Ctag 를 보여준다.
             *
             * @param editor
             * @param identifier
             * @param line
             * @param target
             * @param messageArray
             */
            ScansIssuesSourceCode.prototype.showCtag = function(editor, issueId, identifier, line, target, messageArray) {

                identifier = identifier.trim();
                if (identifier == "" || identifier == '{' || identifier == '}' || identifier == '(' || identifier == ')') {
                    return;
                }

                $.ajaxRest({
                    url: "/api/1/issues/" + issueId + "/source/ctag",
                    data: encodeURI("identifier=" + identifier),
                    type: "GET",
                    success : function (data, status, header) {
                        if (data.length == 0) {
                            return;
                        }

                        var html = "<table cellpadding='0' cellspacing='0' class='ctag'>";
                        html += "<tr>";
                        html += "<th>" + messageController.get("label.path") + "</th>";
                        html += "<th>" + messageController.get("label.line") + "</th>";
                        html += "<th>" + messageController.get("label.type") + "</th>";
                        html += "</tr>";

                        $.each(data, function(index, value) {
                            html += "<tr class=\"tag-line\" onclick=\"scansIssuesSourceCode.showCtagEditor('" + value.path.replace(/\\/g, "\\\\") + "','" + value.line + "','" + issueId + "');\">";
                            html += "<td>" + value.path + "</td>";
                            html += "<td align='right'>" + value.line + "</td>";
                            html += "<td>" + value.type + "</td>";
                            html += "</tr>";
                        });

                        var ctagTableDiv = $('<div/>');
                        ctagTableDiv.addClass('tag-table');
                        ctagTableDiv.attr('id', "ctagTbl" + target + "_" + line);
                        ctagTableDiv.html(html);

                        var w = {
                            row: line - 1,
                            fixedWidth: true,
                            coverGutter: false,
                            el: document.createElement("div"),
                            type: 'ctag'
                        };
                        var el = w.el;

                        el.appendChild(ctagTableDiv[0])

                        var duplicatedLine = false;

                        if (messageArray.length > 0) {
                            for (var i = 0; i < messageArray.length; i++) {
                                if (messageArray[i].row == (line - 1) && messageArray[i].type != 'ctag') {
                                    messageArray[i].el.appendChild(ctagTableDiv[0]);
                                    duplicatedLine = true;
                                }
                            }
                        }

                        if (!duplicatedLine) {
                            messageArray.push(w);
                        }

                        if (editor.getSession().widgetManager != undefined) {
                            for (var i = 0; i < messageArray.length; i++) {
                                editor.getSession().widgetManager.removeLineWidget(messageArray[i]);
                            }

                            for(var i = 0; i < messageArray.length; i++) {
                                editor.getSession().widgetManager.addLineWidget(messageArray[i]);
                            }
                        }

                    }
                });
            }

            /**
             * Ctag 를 지우고 기존 엔진 메시지를 넣음
             * @param editor
             * @param messageArray
             */
            ScansIssuesSourceCode.prototype.removeCtag = function(editor, messageArray) {
                for (var i = 0; i < messageArray.length; i++) {
                    if (editor.getSession().widgetManager != undefined) {
                        editor.getSession().widgetManager.onWidgetChanged(messageArray[i]);
                    }
                }
            }

            /**
             * Ctag 로 이동하기
             */
            ScansIssuesSourceCode.prototype.showCtagEditor = function(filePath, line, issueId) {
                var sourceBoxTemplate = $("#sourceBoxTemplate").clone();
                $("#tabListLeft").css("display", "");
                var target = $("[id^=tab_pane]").length + 1;

                // 소스 보여주기 : 로딩 넣기
                $.ajaxRest({
                    url : "/api/1/scans/" + scanId + "/files/source",
                    data: encodeURI("filePath=" + filePath),
                    type : "GET",
                    success: function (data, textStatus, header) {

                        // Tab content 스타일 변경
                        var sourceCodeTemplate = $("#sourceCodeTemplate").clone();
                        sourceCodeTemplate.css("display", "");
                        sourceCodeTemplate.css("height", "inherit");
                        sourceCodeTemplate.attr("id", "tab" + target);

                        var tempContentPane = sourceCodeTemplate.html().compose({
                            tabSeq : target,
                            filePath : data.filePath,
                            fileContent : data.fileContent.escapeHTML()
                        });

                        // Tab pane 만들기
                        var divTabPane = document.createElement('div');
                        divTabPane.className = "tab-pane height-100 fade in active";
                        divTabPane.setAttribute("id", "tab_pane" + target);
                        divTabPane.setAttribute("role", "tabpanel");
                        divTabPane.insertAdjacentHTML('beforeend', tempContentPane);

                        $("#tabContent" + position + " .tab-pane").removeClass("active");

                        // 소스코드 html 추가
                        $("#tabContent" + position).append(divTabPane);
                        // 이전  tab unactive

                        $('#tabList' + position + ' li').removeClass('active');

                        if (position === 'Right') {
                            $("#leftBox").removeClass("col-xs-12");
                            $("#leftBox").addClass("col-xs-6");
                            $("#rightBox").attr("style", "");
                        }

                        $("#tabList" + position).append(scansIssuesSourceCode.createTabTitle(" " + data.fileName, "tab_pane" + target, "font-size: 1px;color: #FE9E00;", true));

                        var editor = ace.edit("code" + target);
                        editor.setTheme( "ace/theme/" + issueSourceTheme);
                        editor.setFontSize(parseInt(issueSourceFontSize));
                        editor.setReadOnly(true);
                        editor.commands.addCommand({
                            name: 'help',
                            bindKey: {win: 'h', mac: 'h'},
                            exec: function(editor) {
                                $('#modalKeyboardShortCut').modal('toggle');
                            },
                            readOnly: true
                        });
                        editor.setAutoScrollEditorIntoView(true);


                        var lang = filePath.split('.').pop();
                        if (lang === 'js') {
                            lang = 'javascript';
                        } else if (lang === 'c' || lang === 'h') {
                            lang = 'c_cpp';
                        } else if (lang === 'cs') {
                            lang = 'csharp';
                        } else if (lang === 'py') {
                            lang = 'python';
                        } else if (lang === 'vb') {
                            lang = 'vbscript';
                        } else {
                            lang = 'java';
                        }

                        editor.getSession().setMode("ace/mode/" + lang);

                        clearCtagTable();

                        $mainContent.find("#code" + target).css('height', $mainContent.height() - $("#tabList" + position).height() - $(".currentPath").height() - 6);

                        var messageArray = new Array();
                        var prevMarkerId = null;
                        editor.on("click", function(e){
                            var editor = e.editor;
                            var pos = editor.getCursorPosition();
                            var token = editor.session.getTokenAt(pos.row, pos.column);

                            editor.getSession().widgetManager = new LineWidgets(editor.session);
                            editor.getSession().widgetManager.attach(editor);

                            clearCtagTable();

                            scansIssuesSourceCode.removeCtag(editor, messageArray);
                            if (token != null) {
                                scansIssuesSourceCode.showCtag(editor, issueId, token.value, pos.row, target, messageArray);
                            }

                            // Selection marker remover
                            if (prevMarkerId != null) {
                                editor.getSession().removeMarker(prevMarkerId);
                            }

                            if (token != null) {
                                var highlight = new SearchHighlight(token.value, "ace_selected-word", "text");
                                var marker = editor.getSession().addDynamicMarker(highlight);
                                prevMarkerId = marker.id;
                            }
                        });
                        editor.resize(true);
                        resizeEditor($("#mainContent").height(), line);

                        editor.gotoLine(line, 0, true);
                        editor.getSession().addMarker(new Range(line - 1, 0, line - 1, 1), 'selected', 'fullLine');

                        $('#tab_pane' + target + ' .ace_scrollbar.ace_scrollbar-h').off('scroll');

                        $('#tab_pane' + target + ' .ace_scrollbar.ace_scrollbar-h').scroll(function(e) {
                            $('#tab_pane' + target + ' .ace_lineWidgetContainer').css('margin-left', -e.currentTarget.scrollLeft);
                        });
                    }
                });
            }

            return ScansIssuesSourceCode;
        })();

        $.fn.scansIssuesSourceCode = function(){
            return new ScansIssuesSourceCode();
        }

        scansIssuesSourceCode = $("#mainContent").scansIssuesSourceCode();

    })(window.jQuery, window);
});

var scansIssuesSourceCode = null;
