$(function(){

/***********************************************
화면 사이즈가 작아지면, Modal에도 Scroll이 적용 되도록함.
     1. Modal사이즈를 화면 사이즈 맞도록 조절함.
     2. 조절된 Modal의 Body영역에만 SlimScroll을 적용함.
***********************************************/

    // modal-body 객체에 스크롤바 적용
    // 스크롤 삭제
    // $('.modal-body').slimscroll({ destroy: true }).slimscroll({ height: '403px',alwaysVisible: true });

    var fit_modal_body;

    // modal-body 영역 사이즈 설정
    fit_modal_body = function(modal) {
      var body, height, footer, windowHeight;
      header = $(".modal-header", modal);
      body = $(".modal-body", modal);
      footer = $(".modal-footer", modal);
      windowHeight = parseInt($(window).height());
      // windowSize 와 header와 footer의 존재 여부에 따라, 사이즈가 변경 된다.
      height = windowHeight - header.length*90 - footer.length*90;
      return body.css("max-height", "" + height + "px");
    };

    // 최초 로딩시 modal 사이즈 설정.
    $(".modal").each(function(index, element){
        // fit_modal_body($(this));
    })

    // 윈도우 사이즈 변경시 modal 사이즈 변경.
    $(window).resize(function() {
        $(".modal").each(function(index, element){
        })
    });
});