$(function() {

    var $mainSidebar = $('.main-sidebar');

    // Set Setting Left Menu Active Status
    $mainSidebar.css('margin-left', 0);

    // 페이지가 전부 로딩 되는것을 기다리지 않고, 왼쪽 메뉴 영력을 활성화 시킨다.
    $mainSidebar.find('a[href="' + window.location.pathname + '"]').parent().addClass('active');

});
