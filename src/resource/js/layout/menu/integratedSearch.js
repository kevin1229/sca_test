$(function(){

    /***********************************************************
     * Integrated search
     */
    // Menu item icon map
    var menuIconMap = {
            // 대시보드
            "label.dashboard"                           : "fa-dashboard",
            // 결과 보기
            "label.all.projects"                        : "fa-folder-open-o",
            "label.all.scans"                           : "fa-file-text-o",
            // 제외 이슈
            "label.issue.exception.request.list"        : "fa-calendar-minus-o",
            "label.issue.exception.request.results"     : "fa-calendar-check-o",
            "label.issue.exception.manage.waiting"      : "fa-list-alt",
            "label.issue.exception.manage.done"         : "fa-check-square-o",
            // 통계
            "label.statistics"                          : "fa-bar-chart",
            // 게시판
            "label.notice"                              : "fa-bullhorn",
            "label.qna"                                 : "fa-comments",
            // 관리 - 일반
            "label.setting.nest"                        : "fa-sliders",
            "label.user"                                : "fa-user",
            "label.user.group"                          : "fa-users",
            // 관리 - 분석
            "label.project"                             : "fa-folder-open-o",
            "label.checker.group"                       : "fa-compass",
            "label.issue.status.group"                  : "fa-warning",
            "label.remote.engine"                       : "fa-cogs",
            "label.all.exclusion.from.analyses"         : "fa-search-minus",
            // 관리 - 연동
            "label.ldap.authentication"                 : "fa-address-book-o",
            "label.redmine.plugin"                      : "fa-puzzle-piece",
            "label.jira.plugin"                         : "fa-puzzle-piece",
            "label.setting.vcs"                         : "fa-file-code-o",
            "label.interactive.hub"                     : "fa-share-alt",
            // 관리 - 정보
            "label.logs"                                : "fa-wrench",
            "label.license"                            : "fa-id-card-o",
            "label.system"                              : "fa-info",
            // 계정 설정
            "label.my.account"                          : "fa-user-circle-o",
            "label.change.password"                     : "fa-lock",
            "label.personalization"                     : "fa-id-badge",
            "label.logout"                              : "fa-sign-out",
    };

    var CATEGORY = {
        FILE: 'file',
        ISSUE: 'issue',
        PROJECT: 'project',
        MENU: 'menu'
    };

    /**
     * You must enter more than the maximum number shown on the screen.
     * Duplicate data to prevent loading.
     * @type {number}
     */
    var DEFAULT_PER_PAGE = 30;

    /**
     * Get highlighted html.
     * @param data
     * @param keyword
     * @returns {*}
     */
    function getHighlightHtml(data, keyword){
        var i = data.toUpperCase().indexOf(keyword.toUpperCase());

        if (i >= 0) {
            return data.substring(0, i)
                + '<span class="result-highlight">'
                + data.substring(i, keyword.length + i)
                + '</span>'
                + getHighlightHtml(data.substring(i + keyword.length , data.length), keyword);
        } else {
            return data;
        }
    }

    /**
     * Check whether the element exists in the viewport
     * @param el
     * @returns {boolean}
     */
    function isElementInView(el) {

        //special bonus for those using jQuery
        if (typeof jQuery === "function" && el instanceof jQuery) {
            el = el[0];
        }

        var scrollDiv = $('.navbar-search .results');

        if(el.offsetTop <= scrollDiv.scrollTop() + scrollDiv.height() ){
            return true;
        } else {
            return false;
        }
    }

    /**
     * set timer for execute function.
     */
    var delay = (function(){
        var timer = 0;
        return function(callback, ms){
            clearTimeout(timer);
            timer = setTimeout(callback, ms);
        };
    })();

    /**
     * slim scroll ctrl
     */
    function slimScrollCtrl(){
        var itemHeight = 0;
        $('.navbar-search .results .result').each(function(index, el) {
            if($(el).css('display') != 'none') {
                itemHeight += $(el).height();
            }
        });

        if($('.navbar-search .results').height() < itemHeight) {
            $('.navbar-search .results-outer').height(743);
            $('.navbar-search .results').slimScroll({
                height: '100%',
                overflow : 'hidden',
                alwaysVisible: false
            });
        } else {
            $('.navbar-search .results-outer').height(itemHeight+4);
            $('.navbar-search .results').height(itemHeight);
            $('.navbar-search .results').slimScroll({destroy: true});
        }
    }

    /**
     * It returns a truncated string appended to '...'
     * If the string is short, it returns as it is.
     * @param str
     * @param length
     */
    function getTrunkStr(str, len) {
        if (str && str.length <= len) {
            return str;
        } else {
            return '...' + str.substring(str.length-len, str.length);
        }
    }

    /**
     * Init integrated search dom
     * Initialize each time you search by key input.
     */
    function initSearchDom() {
        // Category Search results are initialized to 0.
        $('.navbar-search .results .result .result-category .found-count').each(function(index, el){
            $(el).text('0');
        });

        // Delete element rather than template.
        $('.navbar-search .results .result .result-item:not(.template)').remove();
    }

    function showEmpty() {
        $('.navbar-search .results .result').fadeOut(0);
        $('.navbar-search .results').addClass('no-result');
        showResult();
    }
    function hideEmpty() {
        $('.navbar-search .results').removeClass('no-result');
        showResult();
    }

    function hideResult() {
        $('.navbar-search .results-outer').fadeOut(100);
    }
    function showResult() {
        $('.navbar-search .results-outer').fadeIn(100);
        slimScrollCtrl();
    }

    function showLoading() {
        $('.navbar-search .results .result').fadeOut(0);
        var dom = $('.navbar-search .results').find('[name=progress]');
        dom.fadeIn(0);
    }
    function hideLoading() {
        var dom = $('.navbar-search .results').find('[name=progress]');
        dom.fadeOut(0);
    }

    /**
     * return true if result is not empty.
     */
    function hasResult(){
        var dom = $('.navbar-search .results').find('.result').find('.found-count');
        var totalCount = 0;
        dom.each(function(index, el) {
            totalCount += $(el).text()
        });
        if (totalCount <= 0){
            return false;
        } else {
            return true;
        }
    }

    /**
     * Link click event handling. Only the anchors may be changed on the page, so the page is reloaded.
     * @param $el
     */
    function setLink($a, link) {
        var locationPathName = window.location.pathname;
        var linkUrl = link.split('#')[0];
        if (linkUrl == locationPathName ) {
            $a.attr('href', 'javascript:void(0);');
            $a.on('click', function() {
                window.location.href = link;
                window.location.reload();
            });
        } else {
            $a.attr('href', link);
        }
    }

    /**
     * Add search results
     * @param category
     * @param data
     */
    function addSearchResults(category, data, keyword) {
        var dom = $('.navbar-search .results').find('[name=' + category + ']');

        if (data && data.totalCount > 0) {
            dom.find('.found-count').text(data.totalCount);
            var item;
            var highlightHtml;
            var itemTemplate;
            for(var i in data.list){
                itemTemplate = dom.find('.result-item.template').clone();
                item = data.list[i];
                var extraJson = {};
                if(item.extra){
                    extraJson = JSON.parse(item.extra);
                }

                if (category == CATEGORY.MENU) {
                    var icon = menuIconMap[extraJson.key];
                    itemTemplate.find('i').addClass(icon);
                }

                if (category == CATEGORY.FILE) {
                    var trunkLabel = getTrunkStr(item.label, 30);
                    itemTemplate.find('[name=filePath]').html(getHighlightHtml(trunkLabel, keyword)).attr('title',item.label);
                    var trunkPath = getTrunkStr(extraJson.projectPath, 30);
                    itemTemplate.find('[name=projectPath]').text(trunkPath).attr('title',extraJson.projectPath);
                    // 이슈 링크는 제거 하기로 함.
                    // if(extraJson.hasOwnProperty('issueLink')){
                    //     setLink(itemTemplate.find('[name=IssueLink]'), extraJson.issueLink);
                    //     itemTemplate.find('[name=IssueLink]').removeClass('hidden');
                    // }

                    setLink(itemTemplate.find('[name=fileLink]'), extraJson.fileLink);
                } else {
                    setLink(itemTemplate, item.link);
                    highlightHtml = getHighlightHtml(item.label, keyword);
                    itemTemplate.append(highlightHtml);
                }
                itemTemplate.removeClass('template');

                dom.append(itemTemplate);
            }
            dom.fadeIn(0);
        }

        slimScrollCtrl();

        if(dom.find('.result-item:not(.template)').length < data.totalCount){
            var pageNo = parseInt( dom.find('.result-item:not(.template)').length / DEFAULT_PER_PAGE ) + 1;
            addAdditionalDataLoadingElement(category, pageNo);
        }
    }

    /**
     * Add additional data load element to the search results.
     * @param category
     * @param pageNo
     */
    function addAdditionalDataLoadingElement(category, pageNo) {
        var dom = $('.navbar-search .results').find('[name=' + category + ']');
        var loadMoreItemDom = $('.result-template').find('[name=loadMoreItem]').clone();
        loadMoreItemDom.attr('category',category);
        loadMoreItemDom.attr('pageNo',pageNo);
        dom.append(loadMoreItemDom);
    }

    /**
     * Integrated search event
     */
    function initSearchEvent() {

        // Search results scroll event.
        // Used for additional data loading.
        $('.navbar-search .results').scroll(function(e) {
            var elements = $(this).find('[name=loadMoreItem]');
            elements.each(function(){
                var $this = $(this);
                if (isElementInView($this)) {
                    $this.attr('name', 'safeToDel');
                    loadMoreData($this);
                    //loadMoreItemDom.remove();
                }
            });
        });

        // If the focus is moved to the search input and the search result is displayed,
        // the search result is displayed.
        $('#navbar-search-input').on('focus', function(e){
            if($('.navbar-search .results').children() && $('.navbar-search .results').children().length > 0){
                var keyword = $('#navbar-search-input').val().trim();
                if (keyword && keyword != "") {
                    showResult();
                } else {
                    hideResult();
                    initSearchDom();
                    return;
                }
            }
        });

        // Do not close drop-down if click inside of search results
        $('.results-outer').on('click', function(e){
            e.stopPropagation();
        })

        // Drop-down Close Event
        $('body').on('click', function(e){
            hideResult();
        })

        // Search input keyup event
        var searchWord = "";
        $('#navbar-search-input').on('keyup', function(e){
            // Enter to go to the found issue.
            if (e.which == 13) {
                var $category = $('.navbar-search .results').find('[name=' + CATEGORY.ISSUE + ']');
                var items = $category.find('.result-item:not(.template)');
                if(items[0]) {
                    window.location.href = $(items[0]).attr('href');
                }
                e.stopPropagation();
                return;
            }

            var $this = $(this);

            // 이전 검색어와 동일한 검색어일 경우 검색 안하도록 처리.
            if (searchWord === $this.val().trim()) {
                return;
            }
            searchWord = $this.val().trim();

            // ignore arrow keys
            if (e.which >= 37 && e.which <= 40 ) {
                return;
            }

            // Enable drop-down by keystroke
            $('.navbar-search .search-input').dropdown('toggle');

            this.focus();

            // Run search
            // Search when the keyboard input stops for more than 0.1 second
            delay(function(){
                initSearchDom();
                var keys = Object.keys(ajaxMap);
                if (keys.length > 0) {
                    keys.forEach(function(key, index) {
                        ajaxMap[key] = null;
                    });
                }
                integratedSearch(CATEGORY.ISSUE, searchWord);
                integratedSearch(CATEGORY.MENU, searchWord);
                integratedSearch(CATEGORY.PROJECT, searchWord);
                integratedSearch(CATEGORY.FILE, searchWord);
            }, 100)
        });
    }

    // this is for abort ajax request.
    var ajaxMap = {};
    var ajaxLoadCount = 0;
    /**
     * Integrated search
     * @param category
     * @param keyword
     */
    function integratedSearch(category, keyword){
        if(keyword && keyword!=""){
            //keyword = encodeURI(keyword);
            var reqData = {
                pageNo: 1,
                perPage: DEFAULT_PER_PAGE,
                searchOption: {
                    keyword: keyword
                }
            };
            // Abort ajax request, if exist
            ajaxMap[category] && ajaxMap[category].abort();
            // search
            ajaxMap[category] = $.ajaxRest({
                url: "/api/v1/search/" + category,
                type: "POST",
                data: reqData,
                beforeSend : function(xhr, settings) {
                    ajaxLoadCount++;
                    hideEmpty();
                    showLoading();
                },
                success : function (data, status, xhr) {
                    //console.log(data);
                    if(Object.keys(data.results).length > 0){
                        //console.log(category);
                        if(data.results[category]){
                            //console.log(JSON.parse(this.data).searchOption.keyword);
                            if( xhr === ajaxMap[category] ) {
                                addSearchResults(category, data.results[category], keyword);
                            }
                        }
                    }
                },
                error : function(hdr, status) {
                    initSearchDom();
                    errorMsgHandler.swal(data);
                },
                complete : function(hdr, status) {
                    ajaxLoadCount--;
                    if(ajaxLoadCount == 0){
                        hideLoading();
                        if(!hasResult()){
                            showEmpty();
                        }
                    }
                    slimScrollCtrl();
                }
            });
        } else {
            hideResult();
            //initSearchDom();
            return;
        }
    }

    /**
     * Load additional search data
     * @param $this
     */
    function loadMoreData($this) {

        var pageNo = $this.attr('pageNo');
        var category = $this.attr('category');
        var keyword = $('#navbar-search-input').val();
        var reqData = {
            pageNo: pageNo,
            perPage: DEFAULT_PER_PAGE,
            searchOption: {
                keyword: keyword
            }
        }
        $.ajaxRest({
            url: "/api/v1/search/" + category,
            type: "POST",
            data: reqData,
            success : function (data, status, header) {
                //console.log(data);
                //initSearchDom();
                // remove after loading
                $this.remove();
                if(Object.keys(data.results).length > 0){
                    if(data.results[category]){
                        addSearchResults(category, data.results[category], keyword);
                    }
                }
            },
            error : function(hdr, status) {
                initSearchDom();
                errorMsgHandler.swal(data);
            }
        });
    }

    // call initialize search event.
    initSearchEvent();
})