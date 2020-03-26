$(function(){

    var $recentProjects = $('#recentProjects');
    var $recentScans = $('#recentScans');
    var $recentIssues = $('#recentIssues');

    var webStorageKey = "recentResults_" + sessionUserController.getUser().userId;

    // 최근 분석 결과 item
    RecentItem = function() {
        this.date;
        this.projectId;
        this.scanId;
        this.issueId;
        this.type;
        this.projectName;
        this.projectKey;
        this.checkerName;
    }

    // 최근 분석 결과 queue
    RecentQueue = function() {
        this.recentMap = null;  // 최신 결과
        this.queueSize = 0;     // 최대 큐 사이즈
    }

    // 최근 분석 결과 queue 함수들...
    RecentQueue.prototype = {
           // 최근 분석 결과 넣기
        setItem: function(_type, _id) {

            if(_id == null) {
                return;
            }

            // 기존 중복된 정보는 삭제한다.
            for(var i in this.recentMap){
                if (this.recentMap[i].type == _type) {
                    for (var j in this.recentMap[i].items) {
                        if (_type == "P" && this.recentMap[i].items[j].projectId == _id) {
                            this.recentMap[i].items.splice(j, 1);
                            break;
                        } else if(_type == "S" && this.recentMap[i].items[j].scanId == _id) {
                            this.recentMap[i].items.splice(j, 1);
                            break;
                        } else if(_type == "I" && this.recentMap[i].items[j].issueId == _id) {
                            this.recentMap[i].items.splice(j, 1);
                            break;
                        }
                    }
                    break;
                }
            }

            // 해당 상세 정보 가져온다.
            var item = null;
            var rest = null;
            if (_type == "P") {
                rest = $.ajaxRest({
                    url: "/api/1/projects/" + _id,
                    type: "GET",
                    success : function (data, status, header) {
                        if (data.projectId == null || data.projectKey == ""){
                            return;
                        }
                        item = new RecentItem();
                        item.date = new Date();
                        item.projectId = data.projectId;
                        item.type = "P";
                        item.projectKey = data.projectKey;
                        item.projectName = data.projectName;
                    }
                });
            } else if(_type == "S") {
                rest = $.ajaxRest({
                    url: "/api/1/scans/" + _id,
                    type: "GET",
                    success : function (data, status, header) {
                        if (data.scanId == null || data.scanId == ""){
                            return;
                        }
                        item = new RecentItem();
                        item.date = new Date();
                        item.scanId = data.scanId;
                        item.type = "S";
                        item.projectKey = data.projectKey;
                        item.projectName = data.projectName;
                    }
                });
            } else if(_type == "I"){
                rest = $.ajaxRest({
                    url: "/api/1/issues/" + _id,
                    type: "GET",
                    success : function (data, status, header) {
                        if (data.issueId == null || data.issueId == ""){
                            return;
                        }
                        item = new RecentItem();
                        item.date = new Date();
                        item.scanId = data.scanId;
                        item.type = "I";
                        item.projectKey = data.projectKey;
                        item.projectName = data.projectName;
                        item.issueId = data.issueId;
                        if (data.checker == null) {
                            item.checkerName = data.checkerKey;
                        } else {
                            item.checkerName = data.checker.checkerName;
                        }
                    }
                });
            }

            $.when(rest).done(function() {

                // 잘못된 분석ID의 경우 아이템 추가 하지 않음.
                if(item == null) {
                    return;
                }

                var items = [];
                for(var i in recentQueue.recentMap) {
                    if (recentQueue.recentMap[i].type == _type) {
                        items = recentQueue.recentMap[i].items;
                    }
                }

                items.push(item);

                recentQueue.recentMap = recentQueue.recentMap.filter(function(item) {
                    return item.type != _type
                });

                // 최대 큐 사이즈 만큼만 남기고 제거함.(가장 오래된 아이템 제거)
                recentQueue.recentMap.push({type: _type, items: items.slice(recentQueue.queueSize*-1)});

                // 로컬 Storage에 넣기.
                webStorage.set(webStorageKey, recentQueue.recentMap);
            });
        },
        // 모든 아이템 취득.
        getAllItem: function(){
            return this.recentMap;
        },
        // 모든 아이템 디버깅 메세지.
        printRecentMap: function(){
            for(var i in this.recentMap){
                console.log("recentMap["+i+"] : "+ JSON.stringify(this.recentMap[i]));
            }
        }
    }

    recentQueue = new RecentQueue();
    recentQueue.recentMap = webStorage.get(webStorageKey, []);
    recentQueue.queueSize = 10;


    /***********************************************************************
     * 최근 결과 Element 추가
     ***********************************************************************/
    var recentMap = recentQueue.getAllItem();

    for (var i in recentMap) {
        for(var j in recentMap[i].items) {
            var $template = null;
            var $recent = null;

            if (recentMap[i].type == "P") {
                $template = $recentProjects.find('#templateRecentProject').clone();
                $recent = $recentProjects;
            } else if(recentMap[i].type == "S") {
                $template = $recentScans.find('#templateRecentScan').clone();
                $recent = $recentScans;
            } else if(recentMap[i].type == "I") {
                $template = $recentIssues.find('#templateRecentIssue').clone();
                $recent = $recentIssues;
            }

            // 해당하지 않는 화면에서는 동장하지 않는다.
            if ($recent == null || $template == null) {
                continue;
            }

            if (recentMap[i].items[j] == null) {
                continue;
            }

            var html = $template.html().compose({
                'projectId': recentMap[i].items[j].projectId,
                'projectKey': recentMap[i].items[j].projectKey,
                'projectName': recentMap[i].items[j].projectName.escapeHTML(),
                'scanId': recentMap[i].items[j].scanId,
                'issueId': recentMap[i].items[j].issueId,
                'checkerName': recentMap[i].items[j].checkerName,
                'date': getAgoMessage(new Date().getTime() - new Date(recentMap[i].items[j].date))
            });
            $template.html(html);
            $template.removeClass('hidden');
            $template.attr("id","");

            $recent.append($template);
            $recent.removeClass('hidden');
       }
   }
});
var recentQueue = null;
