$(function() {
    // Set Setting Left Menu Active Status
    $('.main-sidebar').css('margin-left', 0);

    // 페이지가 전부 로딩 되는것을 기다리지 않고, 왼쪽 메뉴 영력을 활성화 시킨다.
    var locationPath = window.location.pathname;

    $('a[href="' + locationPath + '"]').parent().parent().parent().addClass('active');
    $('a[href="' + locationPath + '"]').parent().addClass('active');
});
