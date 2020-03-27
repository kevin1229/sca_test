/*******************************************************************************
 * String
 ******************************************************************************/
String.prototype.compose = (function() {
    var re = /\{{(.+?)\}}/g;
    return function(o) {
        return this.replace(re, function(_, k) {
            return typeof o[k] != 'undefined' ? o[k] : '';
        });
    }
}());

jQuery.fn.extend( {
    compose : function(data) {
        var htmlText = $(this).html();

        htmlText = htmlText.compose(data);

        $(this).html(htmlText);
        return this;
    }
});

//첫글자 대문자
String.prototype.capitalizeFirstLetter = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
}

// 문자열 타입 숫자에서 format
String.prototype.format = function() {
    var num = parseFloat(this);
    if (isNaN(num))
        return this + "";

    return num.format();
};

// 문자열 타입 append : 성능 향상
String.prototype.append = function(appendStr) {
    var target = new StringBuffer();
    target.append(this);
    target.append(appendStr);
    return target.toString();
};

// replace, sprint, param.
String.prototype.f = function() {
    var s = this,
        i = arguments.length;

    while (i--) {
        s = s.replace(new RegExp('\\{' + i + '\\}', 'gm'), arguments[i]);
    }
    return s;
};

if (!String.prototype.includes) {
    String.prototype.includes = function(search, start) {
        'use strict';
        if (typeof start !== 'number') {
            start = 0;
        }

        if (start + search.length > this.length) {
            return false;
        } else {
            return this.indexOf(search, start) !== -1;
        }
    };
}

if (!Array.prototype.includes) {
    Object.defineProperty(Array.prototype, 'includes', {
        value: function(searchElement, fromIndex) {

            if (this == null) {
                throw new TypeError('"this" is null or not defined');
            }

            // 1. Let O be ? ToObject(this value).
            var o = Object(this);

            // 2. Let len be ? ToLength(? Get(O, "length")).
            var len = o.length >>> 0;

            // 3. If len is 0, return false.
            if (len === 0) {
                return false;
            }

            // 4. Let n be ? ToInteger(fromIndex).
            //    (If fromIndex is undefined, this step produces the value 0.)
            var n = fromIndex | 0;

            // 5. If n ≥ 0, then
            //  a. Let k be n.
            // 6. Else n < 0,
            //  a. Let k be len + n.
            //  b. If k < 0, let k be 0.
            var k = Math.max(n >= 0 ? n : len - Math.abs(n), 0);

            function sameValueZero(x, y) {
                return x === y || (typeof x === 'number' && typeof y === 'number' && isNaN(x) && isNaN(y));
            }

            // 7. Repeat, while k < len
            while (k < len) {
                // a. Let elementK be the result of ? Get(O, ! ToString(k)).
                // b. If SameValueZero(searchElement, elementK) is true, return true.
                if (sameValueZero(o[k], searchElement)) {
                    return true;
                }
                // c. Increase k by 1.
                k++;
            }

            // 8. Return false
            return false;
        }
    });
}


// 숫자 타입에서 쓸 수 있도록 format() 함수 추가
Number.prototype.format = function(){
    if (this == 0)
        return 0;

    var reg = /(^[+-]?\d+)(\d{3})/;
    var n = (this + '');

    while (reg.test(n))
        n = n.replace(reg, '$1' + ',' + '$2');

    return n;
};

// 문자열 타입에서 쓸 수 있도록 format() 함수 추가
//String.prototype.format = function(){
//    var num = parseFloat(this);
//    if( isNaN(num) ) return "0";
//
//    return num.format();
//};

// 입력값이 null이면 0을 반환한다.
function numTypeNullCheck(value) {
    if (value == null)
        return 0;
    return value;
}

// select에서 선택된 option에 text 받아온다.
function getSelectTexts($select, values) {
    var texts = [];
    $select.find("option").each(function() {
        if(jQuery.inArray( $(this).val(), values ) > -1){
            texts.push($(this).text());
        }
    });
    return texts;
}

function getSelectText($select, value) {
    var text = null;
    $select.find("option").each(function() {
        if($(this).val() == value) {
            text = $(this).text();
            return;
        }
    });
    return text;
}

function getTextByList(value) {
    if (value == null || value.length == 0) {
        return "";
    }

    var text = value[0];
    for (var i = 1; i < value.length; i++) {
        text = text + '\n' + value[i];
    }
    return text;
}

function getAgoMessage(millis) {
    var date = new Date(millis);
    var type = "";
    var count = 0;
    if (date.getUTCMonth() > 0) {
        return messageController.get('label.datetime.more.than.a.month');
    } else if (date.getUTCDate() -1 > 0) {
        count = date.getUTCDate() - 1;
        type = messageController.get('label.datetime.day');
    } else if (date.getUTCHours() > 0) {
        count = date.getUTCHours();
        type = messageController.get('label.datetime.hour');
    } else if (date.getUTCMinutes() > 0) {
        count = date.getUTCMinutes();
        type = messageController.get('label.datetime.minute');
    } else if (date.getUTCSeconds() > 0) {
        count = date.getUTCSeconds();
        type = messageController.get('label.datetime.second');
    } else {
        count = 1;
        type = messageController.get('label.datetime.second');
    }
    var msg = "";
    msg += count;
    msg += type;

    msg += " " + messageController.get('label.datetime.ago');
    return msg;
}

// StringBuffer
function StringBuffer() {
    this.buffer = [];
}

StringBuffer.prototype.append = function append(string) {
    this.buffer.push(string);
    return this;
};

StringBuffer.prototype.toString = function toString() {
    return this.buffer.join("");
};

/*******************************************************************************
 * Escape String
 ******************************************************************************/
var escapeHtmlMap = {
    "&" : "&amp;",
    "<" : "&lt;",
    ">" : "&gt;",
    '"' : '&quot;',
    "'" : '&#39;',
    "/" : '&#x2F;'
};

String.prototype.escapeHTML = function() {
    return String(this).replace(/[&<>"'\/]/g, function(s) {
        return escapeHtmlMap[s];
    });
};

String.prototype.unescapeHTML = function(){
    return this.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#039;/g, "'").replace(/&#x2F;/g, "'").replace(/&#39;/g, "/");
};


/**
 * @Deprecated See String.prototype.escapeHTML
 * @param string
 * @returns
 */
function escapeHTML(string) {
    return String(string).replace(/[&<>"'\/]/g, function(s) {
        return escapeHtmlMap[s];
    });
}




// 셀렉터 이스케이프
String.prototype.escapeSelector = function(str) {
    return this.replace(/[!"#$%&'()*+,.\/:;<=>?@[\\\]^`{|}~]/g, "\\$&")
};

/*******************************************************************************
 * 브라우저(browser)
 ******************************************************************************/
function isIE() {
    var agent = navigator.userAgent.toLowerCase();
    if ( (navigator.appName == 'Netscape' && navigator.userAgent.search('Trident') != -1) || (agent.indexOf("msie") != -1) ) {
          return true;
    }
    return false;
}

/*******************************************************************************
 * Key
 ******************************************************************************/
var KeyEventHandler = (function(){

    function KeyEventHandler() {
    }

    KeyEventHandler.prototype.addPreventEscape = function () {
        window.addEventListener('keydown', _preventEscapeBtn);
    }

    KeyEventHandler.prototype.removePreventEscape = function () {
        window.removeEventListener('keydown', _preventEscapeBtn);
    }

    // 삭제 도중 esc키 입력시 ajax요청 취소 되는 현상 방지.
    function _preventEscapeBtn(e) {
        if (e.keyCode == 27)
            e.preventDefault();
    }

    return KeyEventHandler;
})();
var keyEventHandler = new KeyEventHandler();


/*******************************************************************************
 * HashMap
 * @Deprecated
 ******************************************************************************/
CustomMap = function() {
    this.map = new Object();
};
CustomMap.prototype = {
    put : function(key, value) {
        this.map[key] = value;
    },
    get : function(key) {
        return this.map[key];
    },
    containsKey : function(key) {
        return key in this.map;
    },
    containsValue : function(value) {
        for ( var prop in this.map) {
            if (this.map[prop] == value)
                return true;
        }
        return false;
    },
    isEmpty : function(key) {
        return (this.size() == 0);
    },
    clear : function() {
        for ( var prop in this.map) {
            delete this.map[prop];
        }
    },
    remove : function(key) {
        delete this.map[key];
    },
    keys : function() {
        var keys = new Array();
        for ( var prop in this.map) {
            keys.push(prop);
        }
        return keys;
    },
    values : function() {
        var values = new Array();
        for ( var prop in this.map) {
            values.push(this.map[prop]);
        }
        return values;
    },
    size : function() {
        var count = 0;
        for ( var prop in this.map) {
            count++;
        }
        return count;
    }
};


/*******************************************************************************
 *  Validate
 ******************************************************************************/

//"^([01]?\\d\\d?|2[0-4]\\d|25[0-5])\\.([01]?\\d\\d?|2[0-4]\\d|25[0-5])\\.([01]?\\d\\d?|2[0-4]\\d|25[0-5])\\.([01]?\\d\\d?|2[0-4]\\d|25[0-5])$");

// IP 주소 검사
function validateIPaddress(ipaddress) {
    //if (/^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(ipaddress)) {
    if (/^([01]?\d\d?|2[0-4]\d|25[0-5])\.([01]?\d\d?|2[0-4]\d|25[0-5])\.([01]?\d\d?|2[0-4]\d|25[0-5])\.([01]?\d\d?|2[0-4]\d|25[0-5])$/.test(ipaddress)) {
        return true;
    }
    //alert("Input Valid Ip Address");
    return false;
}

/*******************************************************************************
 *  Bootstrap Tab Backbutton Control
 ******************************************************************************/
$(function() {
    $('a[data-toggle="tab"][href^="#"]').on('click', function(e) {
        history.pushState(null, null, $(this).attr('href'));
        //alert('push');
    });

    window.addEventListener("popstate", function(e) {
        var activeTab = $('[href="' + location.hash + '"]');
        if (activeTab.length) {
            activeTab.tab('show');
        } else {
            $('.content-wrapper .nav-tabs a:first').tab('show');
        }
    });
});

/**
 *  Dropdown 내에 있는 Select2 option 클릭 시
 *  dropdown 이 닫기는 현상 방지 함수
 */
function stopHideDropDown(target) {

    $(target).on({
        "shown.bs.dropdown": function(event) {
            $(this).data('closable', true);
            $(".daterangepicker, .select2-container").on("click", function (e) {
                $(event.target).data('closable', false);
            });
            $(target).find('select').on('select2:select', function (evt) {
                $(event.target).data('closable', false);
            });
            $(target).find('select').on('select2:unselect', function (evt) {
                $(event.target).data('closable', false);
            });
        },
        "hide.bs.dropdown": function(event) {
            var hide = $(this).data('closable');
            //console.log(hide);
            $(this).data('closable', true);
            return hide;
        },
        "hidden.bs.dropdown": function(event) {
            $(target).find(".select2-hidden-accessible").select2("close");
            $(".daterangepicker, .select2-container").off("click");
            $(target).find('select').off('select2:select');
            $(target).find('select').on('select2:unselect');
        }
    });
    $('ul.dropdown-menu .modal-footer').on('click',function(e){
        e.stopPropagation();
    });

    $('body').on('click', function (e) {
        var treeMenu = $('.dropdown-tree .dropdown-menu');
        var tree = $('.dropdown-tree');

        if(tree.find(e.target).length == 0 && tree.hasClass('open')) {
            tree.removeClass('open');
            treeMenu.hide();
            e.stopPropagation();
        }
    });
}

/*******************************************************************************
 *  로그
 ******************************************************************************/
function log(value) {
    console.log(value);
}

/*******************************************************************************
 *  삭제 함수
 ******************************************************************************/
function swalDelete(options) {
    swal({
        title: options.title == null? messageController.get('confirm.common.4') : options.title,
        type : "warning",
        showCancelButton : true,
        confirmButtonClass: "btn btn-danger",
        confirmButtonText : messageController.get('label.delete'),
        cancelButtonClass: "btn btn-default",
        cancelButtonText : messageController.get('label.cancel'),
        closeOnConfirm : false,
        buttonsStyling: false,
    }, function(isConfirm) {
        // 삭제중 상태
        if (isConfirm) {

            if (options.beforeSend) {
                if (options.beforeSend() == false) {
                    return;
                }
            }

            setTimeout(function(){
                //do what you need here
            }, 10000);

            keyEventHandler.addPreventEscape();
//            swal({
//                html : '<i class="fa fa-circle-o-notch fa-spin fa-3x fa-fw"></i><h2 style="margin-top:30px;"">' + messageController.get('400023') + '</h2>',
//                showCancelButton: false,
//                showConfirmButton: false,
//                allowOutsideClick: false,
//                allowEscapeKey: false,
//                closeOnCancel: false,
//                closeOnConfirm: false
//            });
            swal.closeModal();

            $.ajaxRest({
                url: options.url,
                type: "DELETE",
                data: options.requestBody == null? null : options.requestBody,
                block: true,
                success: function(data, textStatus, header) {

                    // 테이블 다시 로딩.
                    options.dataTable.draw();

                    // swal 메세지 제거
                    swal.closeModal();
                    keyEventHandler.removePreventEscape();

                    // 삭제 완료 메세지 표시
                    $.toastRed({
                        text: messageController.get("label.has.been.deleted")
                    });
                    $('.modal').modal('hide');
                },
                error : function(hdr, status) {
                    swal({
                        title: messageController.get(hdr.responseJSON[0].code),
                        type: "error",
                        closeOnConfirm: true,
                    });
                }
            });
        }
    });
}

/*******************************************************************************
 * 공통 init
 ******************************************************************************/
$(function() {
    $(".only-number").keydown(function(e) {
        // Allow: backspace, delete, tab, escape, enter
        if ($.inArray(e.keyCode, [46, 8, 9, 27, 13, 110]) !== -1 ||
             // Allow: Ctrl/cmd+A
            (e.keyCode == 65 && (e.ctrlKey === true || e.metaKey === true)) ||
             // Allow: Ctrl/cmd+C
            (e.keyCode == 67 && (e.ctrlKey === true || e.metaKey === true)) ||
             // Allow: Ctrl/cmd+X
            (e.keyCode == 88 && (e.ctrlKey === true || e.metaKey === true)) ||
             // Allow: home, end, left, right
            (e.keyCode >= 35 && e.keyCode <= 39)) {
            // let it happen, don't do anything
            return;
        }
        // Ensure that it is a number and stop the keypress
        if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105)) {
            e.preventDefault();
        }
    });


    $("input[type=number]").on("input", function(){
        if (this.maxLength > -1 && this.value.length > this.maxLength){
            this.value = this.value.slice(0, this.maxLength);
        }
    });

    $('.dropdown-submenu a.submenu').hover(function(e){
        $('.dropdown-submenu .dropdown-menu').css('display', "none");
        if($(this).hasClass('checked')) {
            $(this).removeClass('checked') ;
        } else {
            $(this).addClass('checked') ;
            $(this).next('ul').toggle();
        }

        e.stopPropagation();
        e.preventDefault();
    }, function (e) {
        if($(this).hasClass('checked')) {
            $(this).removeClass('checked') ;
        } else {
            $(this).addClass('checked') ;
            $(this).next('ul').toggle();
        }
    });

    // 검색 box width 조정
    $('.search-condition-box').width($('.search-box').width() - $('.search-input-box').width() - 12);
    $('#rightSideBar').css('max-height', $('.wrapper').height() - 50);
    $('.sidebar').css('height', $('.wrapper').height() - 50);

    $(window).resize(function() {
        $('.search-condition-box').width($('.search-box').width() - $('.search-input-box').width() - 12);
        $('#rightSideBar').css('max-height', $('.wrapper').height() - 50);
        $('.sidebar').css('height', $('.wrapper').height() - 50);
    });

    // 입력 값 초기화 버튼 생성
    $('input.form-control:not([type=number])').on('input', function (e) {
        if($(this).hasClass('not-close')) {
            return;
        }
        if($(this).val().length >= 1 && !$(this).next().hasClass('close-btn')) {
            var button = $('<button type="button" class="addon-btn close-btn"/>');
            var span = $('<span aria-hidden="true">×</span>');
            var parent = $(this);
            button.click(function (e) {
                parent.val('').trigger('keyup');
                $(this).remove();
                e.stopPropagation();
                e.preventDefault();
            });

            button.append(span);
            $(this).after(button);
        }
    });

    // 디렉토리 input close 이벤트
    $('input.form-control.select-tree:not(.select-tree-required)').on('click', function (e) {
        if($(this).val().length >= 1 && !$(this).next().hasClass('close-btn')) {
            var button = $('<button type="button" class="addon-btn close-btn"/>');
            var span = $('<span aria-hidden="true">x</span>');
            var $this = $(this);
            button.click(function (e) {
                $(this).remove();
                $this.closest('.dropdown-tree').dropdownFancytreeController('getTree').visit(function(node){
                    node.setSelected(false);
                });
                e.stopPropagation();
            });

            button.append(span);
            $(this).after(button);
        }
    });

    // 자동 창 닫힘 방지
    $('.prevent-close-event').on('click', function(){
        // set a special class on the '.dropdown' element
        $(this).closest('.dropdown').addClass('do-not-auto-close');
    });
});

function initTab(defaultTab) {
    var tab = window.url('{}', document.URL).hash;
    var $tab = null;
    if(tab == null) {
        $tab = $('.nav.nav-tabs a[href="#'+ defaultTab + '"]');
    } else {
        var $tab = $('.nav.nav-tabs.main-tabs a[href="#' + tab+ '"]') ;
        if($tab.length == 0) {
            $tab = $('.nav.nav-tabs a[href="#'+ defaultTab + '"]');
        }
    }
    $tab.tab('show');
}


/*******************************************************************************
 * 분석 결과
 ******************************************************************************/
function getRandomProjectKey() {
    return sessionUserController.getUser().userId + "_Web_" + (Math.floor(Math.random() * (99999 - 10000 + 1)) + 10000);
}
