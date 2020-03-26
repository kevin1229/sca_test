(function($, window) {

    $.fn.contextMenu = function(settings) {

        return this.each(function() {

            // Open context menu
            $(this).on(
                    "contextmenu",
                    function(e) {
                        // return native menu if pressing control
                        if (e.ctrlKey)
                            return;

                        // open menu
                        var $menu = $(settings.menuSelector).data("invokedOn",
                                $(e.target)).show().css(
                                {
                                    position : "absolute",
                                    left : getMenuPosition(e.clientX, 'width',
                                            'scrollLeft'),
                                    top : getMenuPosition(e.clientY, 'height',
                                            'scrollTop')
                                }).off('click').on(
                                'click',
                                'a',
                                function(e) {
                                    $menu.hide();

                                    var $invokedOn = $menu.data("invokedOn");
                                    var $selectedMenu = $(e.target);

                                    settings.menuSelected.call(this,
                                            $invokedOn, $selectedMenu);
                                });

                        return false;
                    });

            // make sure menu closes on any click
            $('body').click(function() {
                $(settings.menuSelector).hide();
            });
        });

        function getMenuPosition(mouse, direction, scrollDir) {
            var win = $(window)[direction](), scroll = $(window)[scrollDir](), menu = $(settings.menuSelector)[direction]
                    (), position = mouse + scroll;

            // opening menu would pass the side of the page
            if (mouse + menu > win && menu < mouse)
                position -= menu;

            return position;
        }

    };
})(jQuery, window);

$(function() {

    // 이슈 리스트 side menu active
    $('#list_issues').addClass('active');

    // 탭추가
    var tabID = 1;
    $('#btnAddPage')
            .click(
                    function() {
                        tabID++;
                        $('#tab-list')
                                .append(
                                        $('<li><a href="#tab'
                                                + tabID
                                                + '" role="tab" data-toggle="tab">Tab '
                                                + tabID
                                                + '<button class="close" type="button" title="Remove this page">×</button></a></li>'));
                        $('#tab-content').append(
                                $('<div class="tab-pane fade" id="tab' + tabID
                                        + '">Tab ' + tabID + ' content</div>'));
                    });

    // Remote controller 핸들링
    remoteControlHandler();

    $('#tab-list').on('click', '.close', function() {
        var tabID = $(this).parents('a').attr('href');
        $(this).parents('li').remove();
        $(tabID).remove();

        // display first tab
        var tabFirst = $('#tab-list a:first');
        tabFirst.tab('show');
    });

    // 소스코드 바 drag 할때 event
    $("#sourceCodeHrizontalBar").draggable(
            {
                containment : "parent",
                drag : function(event, ui) {

                    if ($("#reflectScreen").is(":checked")) {
                        var topPosition = $(".container-fluid.bottom")
                                .position().top;
                        if (event.pageY >= (topPosition + 120)) {
                            $(".container-fluid.bottom").height(
                                    event.pageY - topPosition);
                            ui.position.top = 0;
                        }
                    } else {
                        var topPosition = $(".issue-box").position().top;
                        if (event.pageY >= (topPosition + 200)) {
                            // 상단 움직임
                            $('#tabContentLeft').height(event.pageY - 30);
                            $('#mainContent').height(event.pageY - 30);
                            resizeEditor(event.pageY);

                            // 화면 초기화
                            initLayout();

                            ui.position.top = 0;
                            if ($(".default-page").height() <= 84) {
                                $(".default-page")
                                        .find(".fa.fa-hand-pointer-o").css(
                                                "display", "none");
                            } else {
                                $(".default-page")
                                        .find(".fa.fa-hand-pointer-o").css(
                                                "display", "");
                            }
                        } else {
                            ui.position.top = 0;
                        }
                    }
                }
            });

    // Remote control drag
    $('.remote-control')
            .draggable(
                    {
                        containment : ".wrapper",
                        stop : function(event, ui) {
                            var fullWidth = $('.issue-box').width();
                            if (event.pageX <= fullWidth / 2) {
                                ui.position.left = $('.issue-box').position().left + 30;
                            } else {
                                ui.position.left = $('.issue-box').position().left
                                        + $('.issue-box').width()
                                        - $(this).width() - 60;
                            }
                        }
                    });

    /**
     * Issue group folding button
     */

    $("#toggleCategory").addClass('active');
    $("#toggleStatus").addClass('active');

    // Window 화면 조정 시 이벤트
    $(window).resize(function() {
        // 화면 전체 Layout 초기화
        initLayout();

        resizeEditor($("#mainContent").height());
    });
});

/**
 * 이슈 화면 remote controller event handler
 */
function remoteControlHandler() {

    $('#shrinkRemoteControl').click(function () {
        $('.remote-control').addClass('shrink');
        $('.remote-control').width(39);
        $('.remote-control').height(40);
    });

    $('#expandRemoteControl').click(function () {
        $('.remote-control').removeClass('shrink');
        $('.remote-control').width(86);
        $('.remote-control').height(191);
    });

    $("#toggleCategory").click(function() {
        if ($(this).hasClass("active")) {
            $("#leftTableCell").css("display", "none");
            $("#leftTableCell").width(0);
            $(this).removeClass("active");
            $("#block_groupSelect").hide();
        } else {
            $("#leftTableCell").css("display", "");
            $(this).addClass("active");
            $("#block_groupSelect").width("");
            $("#block_groupSelect").show();
        }
        initLayout();
    });

    $("#toggleStatus").click(function() {
        if ($(this).hasClass("active")) {
            $("#rightSideBar").css("display", "none");
            $("#rightSideBar").width(0);
            $('.content-wrapper').css("margin-right", 0);
            $(this).removeClass("active");
        } else {
            $("#rightSideBar").css("display", "");
            $('.content-wrapper').css("margin-right", 300);
            $("#rightSideBar").width(300);
            $(this).addClass("active");
        }
        initLayout();
    });

    $('#toggleCode').click(function() {
        if ($(this).hasClass('active')) {
            $(this).removeClass('active');
        } else {
            $(this).addClass('active');
        }

        if ($('#toggleList').hasClass('active')) {
            $('#toggleList').removeClass('active');
        }

        if ($(this).hasClass('active')) {
            $('#mainContent').show();
            $("#mainContent").height("100%");
            $('.box.bottom').css('top', '9999px');
            resizeEditor($("#mainContent").height());
        } else {
            showHalfSourceCode();
            resizeEditor($("#mainContent").height());
        }
        initLayout();
    });

    $('#toggleList').click(function() {
        if ($(this).hasClass('active')) {
            $(this).removeClass('active')
        } else {
            $(this).addClass('active')
        }

        if ($('#toggleCode').hasClass('active')) {
            $('#toggleCode').removeClass('active');
        } 

        if ($(this).hasClass('active')) {
            $('#mainContent').height(0);
            $('#mainContent').hide();
            initLayout();
        } else {
            showHalfSourceCode();
            resizeEditor($("#mainContent").height());
        }
    });

    $("#btnNextIssue").click(function() {
        movingIssue(1);
    });

    $("#btnPrevIssue").click(function() {
        movingIssue(-1);
    });

    $("#btnPrevNavi").click(function() {
        movingNavi(-1);
    });

    $("#btnNextNavi").click(function() {
        movingNavi(1);
    });

    $("#btnOk").click(function() {
        scansIssuesRight.clearIssueStatus();
        $('#formIssueStatus').find("input:radio[name=statusCode][value=OK]").attr('checked', 'checked');
        $('#formIssueStatus').find("input:radio[name=statusCode][value=OK]").parent(".btn").addClass('active');
        // 사용자 지정
        if($("#formIssueStatus").find("[name=issueUserId]").val() === 'none' ) {
            $("#formIssueStatus").find("[name=issueUserId]").val(sessionUserController.getUser().userId).trigger('change');
        }
        $('#formIssueStatus').find("[name=btnSaveIssueStatusNext]").trigger('click');
    });

    $("#btnExclude").click(function() {
        scansIssuesRight.clearIssueStatus();
        $('#formIssueStatus').find("input:radio[name=statusCode][value=EX]").attr('checked', 'checked');
        $('#formIssueStatus').find("input:radio[name=statusCode][value=EX]").parent(".btn").addClass('active');
        // 사용자 지정
        if($("#formIssueStatus").find("[name=issueUserId]").val() === 'none' ) {
            $("#formIssueStatus").find("[name=issueUserId]").val(sessionUserController.getUser().userId).trigger('change');
        }
        $('#formIssueStatus').find("[name=btnSaveIssueStatusNext]").trigger('click');
    });


}

/** 이슈 이벤트 이동 함수
 *
 * @param index
 */
var currentPos = -1;
function movingNavi(index) {
    var totalNaviNode = $('[id^=td]').length;

    currentPos += index;

    if(index > 0) {
        for(var i = currentPos; i < totalNaviNode; i++) {
            if($($('[id^=td]')[i]).is(':visible')) {
                currentPos = i;
                break;
            }
        }
    } else  {
        for(var i = currentPos; i > 0; i--) {
            if($($('[id^=td]')[i]).is(':visible')) {
                currentPos = i;
                break;
            }
        }
    }

    // 경계 값 설정
    if(currentPos == totalNaviNode) {
        currentPos -= 1;
    } else if(currentPos == -2) {
        currentPos += 1;
    }

    if(currentPos < totalNaviNode && currentPos >= 0) {
        $($('[id^=td]')[currentPos]).find('.pointer').trigger('click');
    }
}


/**
 * 소스코드 길이의 60% 만 보여줌
 */
function showHalfSourceCode() {
    $("#mainContent").show();
    $("#mainContent").height("60%");
    initLayout();
}

/**
 * Editor 사이즈 조절
 *
 * @param height
 */
function resizeEditor(height, line) {

    $.each($('#tabContentRight .code'), function(index, value){
        var editor = ace.edit(value);
        $(value).height($("#mainContent").height() - $('#tabListRight').height() - 24);
        $(value).find('.ace_content').height($(value).height());
        editor.resize(true);
    });

    $.each($('#tabContentLeft .code'), function(index, value){
        var editor = ace.edit(value);
        $(value).height($("#mainContent").height() - $('#tabListLeft').height() - 24);
        $(value).find('.ace_content').height($(value).height());
        editor.resize(true);
    });

    $('#tabContentLeft').height(height);
}

/**
 * Layout 초기화
 */
function initLayout() {

    $("#groupDetailBox").addClass("scrollbar-outer");
    $('#issueBox').addClass("scrollbar-outer");

    var listWidth;

    // 이슈 / 그룹 리스트 넓이 조절 : 50 = 왼쪽 작은 사이드 바 width
     listWidth = $(window).width() - $('#rightSideBar').width() - 50;

    var barHeight = 0;
    if(!$('#sourceCodeHrizontalBar').hasClass('hidden')) {
        barHeight = $('#sourceCodeHrizontalBar').height();
    }

    $('.box.bottom').css('top', $("#navTopMenu").position().top + $("#navTopMenu").height() + $("#mainContent").height() + barHeight);
    $('.box.bottom').css('width', listWidth);

    // 이슈 그룹 리스트 넓이 조절

    if (isIE()) {
        $('.box.box-solid.group.scrollbar-outer').width(listWidth * 0.25 - 3);

        // 이슈 리스트 넓이 조절
        $('.box.box-solid.issue.scrollbar-outer').width(listWidth - $("#leftTableCell").width() - 4);
    } else {
        $('.scroll-wrapper.box.box-solid.group.scrollbar-outer').width(listWidth * 0.25 - 3);

        // 이슈 리스트 넓이 조절
        $('.scroll-wrapper.box.box-solid.issue.scrollbar-outer').width(listWidth - $("#leftTableCell").width() - 4);
    }

    // 폴딩 시 이슈 / 그룹 리스트 넓이 조절
    if ($("#toggleCategory").hasClass("active")) {
        $('#groupCell').css('width', $('#leftTableCell').width() + 1);
        $('#groupCell').show();
    } else {
        $('#groupCell').css('width', 0);
        $('#groupCell').hide();
    }

    var changedHeight = $(window).height() - $("#mainContent").height() - $('#navTopMenu').height() - $("#buttonTable").height() - 6;

    // 이슈 리스트 높이 조절
    if (isIE()) {
        $('.box.box-solid.issue.scrollbar-outer').css("overflow", "auto");
        $('.box.box-solid.group.scrollbar-outer').css("overflow", "auto");

        $('.box.box-solid.issue.scrollbar-outer').css('max-height', changedHeight);
        $('.box.box-solid.group.scrollbar-outer').css('max-height', changedHeight);
    } else {
        $('.scroll-wrapper.box.box-solid.issue.scrollbar-outer').css('max-height', changedHeight);
        $('.scroll-wrapper.box.box-solid.group.scrollbar-outer').css('max-height', changedHeight);
        $('.scroll-wrapper.box.box-solid.group.scrollbar-outer').css('height', changedHeight);
        $('#issueBox').scrollbar();
        $('#groupDetailBox').scrollbar();
    }
    $('#issueBox').height(changedHeight);
    $("#groupDetailBox").height(changedHeight);

    $('#alter1').height($('#tab_pane1').height() - $('#alterTitle1').height() - 10);

    $('.ace_lineWidgetContainer').width($('.ace_content').width());

    $('.search-option').width($('#buttonTable').width() - $('#txtSearchShort').width() - $('#groupCell').width() - 170);
}
