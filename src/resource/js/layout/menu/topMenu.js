$(function() {

    var $navTopMenu = $('#navTopMenu');

    // Set TopMenu Active Status
    var locationPath = window.location.pathname;
    if (locationPath.startsWith('/dashboard')) {
        $navTopMenu.find('[data-topmenu=dashboard]').addClass('active');
    } else if (locationPath.startsWith('/issues/status')) {
        $navTopMenu.find('[data-topmenu=exceptIssues]').addClass('active');
    } else if (locationPath.startsWith('/results')
            || locationPath.startsWith('/scans')
            || locationPath.startsWith('/issues')) {
        $navTopMenu.find('[data-topmenu=results]').addClass('active');
    } else if (locationPath.startsWith('/statistic')) {
        $navTopMenu.find('[data-topmenu=statistic]').addClass('active');
    } else if (locationPath.startsWith('/boards')) {
        $navTopMenu.find('[data-topmenu=boards]').addClass('active');
    } else if (locationPath.startsWith('/admin')
            || locationPath.startsWith('/logs')) {
        $navTopMenu.find('[data-topmenu=admin]').addClass('active');
    }

    // 로그아웃
    $navTopMenu.find("[href='\/logout']").on("click", function() {
        webSocketController.disconnect();
        location.href = '/logout';
    });
});