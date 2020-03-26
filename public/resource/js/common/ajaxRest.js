/**
 * ajax REST
 * @author kimkc
 */
var ignoreAjaxRest = false;

(function($, window){

    $.extend({

        ajaxRest: function (options) {

            // 세션 만료 또는, 비밀번호 잠금시 더이상 rest요청 받지 않음.
            if (ignoreAjaxRest) {
                return false;
            }

            if (typeof options.data == 'object') {
                options.data = JSON.stringify(options.data);
            }

            var settings = $.extend({
                dataType : "json",
                contentType : "application/json; charset=UTF-8"
            }, options);

            settings.beforeSend = function(xhr, settings) {
                $("body").css("cursor", "progress"); //loading status begin
                xhr.setRequestHeader("timeZoneOffset", new Date().getTimezoneOffset());

                // console.log("ajax send url=" + settings.url + ", type=" + settings.type + ", data=" + settings.data);
                if ((/GET/i).test(settings.data))
                    console.log("data:" + settings.data);

                if (options.beforeSend) {
                    options.beforeSend(xhr, settings);
                }

                if (options.block != undefined && options.block === true) {
                    $.blockUIGray();
                }
            }

            settings.complete = function(responseJson, status) {
                $("body").css("cursor", "default"); //loading status end
                if(options.block != undefined && options.block === true) {
                    $.unblockUI();
                }

                if (options.complete) {
                    options.complete(responseJson, status);
                }
            }

            settings.error = function(hdr, status) {
                console.log('hdr.responseText : ' + hdr.responseText);

                if(options.beforeError) {
                    if(options.beforeError(hdr, status) == false){
                        return;
                    }
                }

                if (hdr.status == 401) {
                    //user token time out
                    //window.location = "/login";
                    ignoreAjaxRest = true;
                    //alert('사용자 세션이 만료 되었습니다.\n재 로그인후 사용해 주세요.');
//                    swal({
//                        title : messageController.get('400010'),
//                        type : "warning",
//                        confirmButtonText : messageController.get('label.ok'),
//                        closeOnConfirm : true
//                    }, function() {
//                        // 현재 페이지가 다시 로딩 되도록 페이지 리로딩 리퀘스트를 한다.
//                        window.location.reload();
//                    });

                    // 현재 페이지가 다시 로딩 되도록 페이지 리로딩 리퀘스트를 한다.
                    window.location.reload();
                    return false;
                } else if (hdr.status == 423) {
                    ignoreAjaxRest = true;

                    //alert('사용자 계정이 잠겼습니다.\n잠시후 다시 로그인하여 사용해 주세요.');
                    swal({
                        title : messageController.get('403007'),
                        type : "warning",
                        confirmButtonText : messageController.get('label.ok'),
                        closeOnConfirm : true
                    }, function() {
                        // 현재 페이지가 다시 로딩 되도록 페이지 리로딩 리퀘스트를 한다.
                        window.location.reload();
                    });

                    // 현재 페이지가 다시 로딩 되도록 페이지 리로딩 리퀘스트를 한다.
                    window.location.reload();
                    return false;
                } else if (hdr.status == 404 || hdr.status == 405 || hdr.status == 500) {
                    if(hdr.status == 404) {
                        if(options.type == "DELETE") {
                            // 삭제할 데이터가 없습니다.
                            swal(messageController.get('400060'));
                        } if(options.type == "PUT") {
                            // 수정할 데이터가 없습니다.
                            swal(messageController.get('400061'));
                        }
                        return false;
                    }

                    var detailText = '<div class="text-left"><br>URL:' +  settings.url  + '<br>error:' + hdr.status + '(' + hdr.statusText + ')' + '</div>';
                    swal({
                        html : messageController.get('400051') + detailText,
                    });
                    return false;
                }
                var tmpResponseText = hdr.responseText;

                if (hdr.responseText != null && hdr.responseText != ""){
                    try {
                        tmpResponseText = JSON.parse(hdr.responseText)
                    } catch(e) {
                        var detailText = '<div class="text-left"><br>URL:' + settings.url + '<br>error:' + hdr.status + '(' + hdr.statusText + ')' + '</div>';
                        swal({
                            html : messageController.get('400051') + detailText,
                        });
                        return;
                    }
                }

                if (options.error != null) {
                    options.error(hdr, status);
                } else if (hdr.status == 400) {
                    // 입력값 오류
                    var detailText = '<div class="text-left">';
                    detailText += "<br>URL: " +  settings.url;
                    detailText += "<br>Method: " + settings.type;
                    if (hdr.responseJSON != null) {
                        detailText += "<br>Code: " +  hdr.responseJSON[0].code;
                        detailText += "<br>Message: " +  hdr.responseJSON[0].message;
                    }
                    detailText += '</div>';

                    swal({
                        html : hdr.status + ":" + messageController.get('400063') + detailText, //400063=잘못된 요청입니다.
                    });
                    return false;
                } else {
                    options.success(tmpResponseText, status, hdr);
                }
            };

            return $.ajax(settings);
        },

        ajaxText: function (options) {

            // 세션 만료 또는, 비밀번호 잠금시 더이상 rest요청 받지 않음.
            if (ignoreAjaxRest) {
                return false;
            }

            if (typeof options.data == 'object') {
                options.data = JSON.stringify(options.data);
            }

            var settings = $.extend({
                dataType : "text",
                contentType : "application/json; charset=UTF-8",

                beforeSend : function(xhr, settings) {
                    $("body").css("cursor", "progress"); //loading status begin
                    //xhr.setRequestHeader("x-user-token-key", userToken);
                    //xhr.setRequestHeader("content-type", "application/json; charset=UTF-8");

                    //console.log("ajax send url=" + settings.url + ", type=" + settings.type + ", data=" + settings.data);
                },

                error : function(hdr, status) {

                    console.log('hdr.responseText : ' + hdr.responseText);
                    console.log('hdr.status : ' + hdr.status);

                    if (hdr.status == 401) {
                        // user token time out
                        ignoreAjaxRest = true;
//                        swal({
//                            title : messageController.get('400010'),
//                            type : "warning",
//                            confirmButtonText : messageController.get('label.ok'),
//                            closeOnConfirm : true
//                        }, function() {
//                            // 현재 페이지가 다시 로딩 되도록 페이지 리로딩 리퀘스트를 한다.
//                            window.location.reload();
//                        });

                        // 현재 페이지가 다시 로딩 되도록 페이지 리로딩 리퀘스트를 한다.
                        window.location.reload();
                        return false;
                    } else if (hdr.status == 423) {
                        ignoreAjaxRest = true;

                        //alert('사용자 계정이 잠겼습니다.\n잠시후 다시 로그인하여 사용해 주세요.');
                        swal({
                            title : messageController.get('403007'),
                            type : "warning",
                            confirmButtonText : messageController.get('label.ok'),
                            closeOnConfirm : true
                        }, function() {
                            // 현재 페이지가 다시 로딩 되도록 페이지 리로딩 리퀘스트를 한다.
                            window.location.reload();
                        });

                        // 현재 페이지가 다시 로딩 되도록 페이지 리로딩 리퀘스트를 한다.
                        window.location.reload();
                        return false;
                    } else if (hdr.status == 404 || hdr.status == 405 || hdr.status == 500) {
                        try {
                            errorMsgHandler.swal(hdr.responseText);
                        } catch(e) {
                            var detailText = '<div class="text-left"><br>URL:' + settings.url + '<br>error:' + hdr.status + '(' + hdr.statusText + ')' + '</div>';
                            swal({
                                html : messageController.get('400051') + detailText,
                            });
                        }
                        return false;
                    }
                    var tmpResponseText = hdr.responseText;
                    if(hdr.responseText != null && hdr.responseText != "") {
                        tmpResponseText = JSON.parse(hdr.responseText);
                    }

                    options.success(tmpResponseText, status, hdr);
                },

                complete : function(responseJson, status) {
                    $("body").css("cursor", "default"); //loading status end
                }

            }, options);

            return $.ajax(settings);
        }
    });

})(jQuery, this || window);
