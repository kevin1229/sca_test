/*! hotkey - v0.3
* * By reference to http://stove99.tistory.com/105
* * Updated by kskyj(Sungjin Kim) */
;(function($){
    $.hotkey = function(hotkeys){
        if(hotkeys){
            $(document).keyup(function(e){
                var el = e.srcElement ? e.srcElement : e.target;
                if( !(e.altKey || e.metaKey || e.shiftKey || e.ctrlKey) & !$(el).is(":text, textarea, input.select2-search__field, table, .note-editable") ){
                    $.each(hotkeys, function(keycode, fnc){
                        if(e.which==keycode && fnc ) fnc();
                    });
                }
            });
        }
    };
})(jQuery);

;(function($){
    $.hotkeyDown = function(hotkeys){
        if(hotkeys){
            $(document).keydown(function(e){
                var el = e.srcElement ? e.srcElement : e.target;
                if( !(e.altKey || e.metaKey || e.shiftKey || e.ctrlKey) & !$(el).is(":text, textarea, input.select2-search__field, table, .note-editable") ){
                    $.each(hotkeys, function(keycode, fnc){
                        if(e.which==keycode && fnc ) fnc();
                    });
                }
            });
        }
    };
})(jQuery);

/***********************************************************************
 *
 * 키보드 이벤트 핸들러.
 * 키보드 단축키를 셋팅하고 보여준다.
 *
 ***********************************************************************/

var ModelKeyboardShortCut = (function() {
    //생성자
    function ModelKeyboardShortCut() {
        this.infos = $.extend({}, defaults);
    }

    ModelKeyboardShortCut.prototype.setInfo = function(infos) {
        this.infos = $.extend({}, defaults, infos);
        this.setInfoToView();
    }

    ModelKeyboardShortCut.prototype.getInfoObj = function( ){
        return this.infos;
    }

    ModelKeyboardShortCut.prototype.getInfoHtml = function() {
        var htmlBoxBody="";

        for(var i in this.infos.sections){
            var section = this.infos.sections[i]

            htmlBoxBody += "<div class='box'>";
            htmlBoxBody += "<div class='box-body'>";
            htmlBoxBody += "<h4><i class='fa fa-caret-right pull-left'></i></i>"+ section.title +"</h4>";
            for(var j in section.shortcuts){
                var shortcuts = section.shortcuts[j];
                htmlBoxBody += "<span class='col-xs-2'>" + shortcuts.key + "</span><span class='col-xs-10'>" + shortcuts.desc + "</span>";
            }

            htmlBoxBody += "<span class='col-xs-12'>&nbsp;</span>";
        }

        for(var k in this.infos.defaultKeys){
            var shortcuts = this.infos.defaultKeys[k];
            htmlBoxBody += "<span class='col-xs-2'>" + shortcuts.key + "</span><span class='col-xs-10'>" + shortcuts.desc + "</span>";
        }
        htmlBoxBody += "</div>";
        htmlBoxBody += "</div>";
        return htmlBoxBody;
    }

    ModelKeyboardShortCut.prototype.setInfoToView = function(){
        var htmlBoxBody = this.getInfoHtml();
        $('#modalKeyboardShortCut').find('.modal-body').html(htmlBoxBody);
    }

    var defaults = {
        defaultKeys : [
               {
                   key : "h",
                   desc : "핫키 설명서 보기"
               }
           ]
    }

    return ModelKeyboardShortCut;
})();

// 전역 객체 생성
modelKeyboardShortCutInfo = new ModelKeyboardShortCut();

$(function(){
    $.hotkey({
        // h키를 눌렀을때 단축키를 보여준다.
        72 : function(){
                $('#modalKeyboardShortCut').modal('toggle');
            }
    });
});

$(function(){
    modelKeyboardShortCutInfo.setInfoToView();
})



/*
var info =  {
        sections : [
                    {
                        title : "상세 이슈 정보",
                        shortcuts : [
                            {
                                key : "b",
                                desc : "이전 이슈"
                            },
                            {
                                key : "n",
                                desc : "다음 이슈"
                            }
                        ]
                    },
                    {
                        title : "이슈 목록",
                        shortcuts : [
                            {
                                key : "m",
                                desc : "이슈 목록 이동"
                            },
                            {
                                key : "l",
                                desc : "이슈 보기"
                            }
                        ]
                    }
                ]
            };
$(function(){
    modelKeyboardShortCutInfo.setInfo(info);
})
*/