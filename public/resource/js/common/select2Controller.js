/**
 * Select2 Controller
 *
 * @author kimkc
 */
$(function(){
    (function($, window) {
        var Select2Controller = (function() {
            // https://github.com/select2/select2/issues/1436
            $.fn.modal.Constructor.prototype.enforceFocus = function() {};

            var options;

            function Select2Controller(element, options) {

                var $element = $(element);

                if (options != null) {
                    if (options.multiple) {
                        this.options = $.extend({}, $.fn.select2Controller.multipleOptions, options);
                    } else {
                        this.options = $.extend({}, $.fn.select2Controller.singleOptions, options);
                    }

                    if (options.url) {
                        this.options = $.extend(this.options, {
                            placeholder: options.placeholder ? options.placeholder : messageController.get('info.common.11'), // info.common.11=검색할 내용을 2자 이상 입력 후 선택하세요.
                            minimumInputLength: 2,
                            ajax: {
                                url: options.url,
                                dataType: 'json',
                                data: function (params) {
                                  var query = {
                                    search: params.term,
                                  }
                                  return query;
                                },
                                processResults: function (data) {

                                    if (options.processResults){
                                        data = options.processResults(data);
                                    }

                                    return { results: data };
                                }
                            }
                        });
                    }

                    if (options.validator) {
                        $element.on("select2:select", function(e) {
                            // 정합성 검사
                            var isValid = options.validator(e.params.data.id);
                            if (isValid == false){
                                // 마지막으로 추가된 요소 삭제.
                                $(e.currentTarget).parent().find('.select2-selection__choice:last').children().click();
                                return false;
                            }
                        });
                    }
                } else {
                    this.options = $.extend({}, $.fn.select2Controller.singleOptions);
                }

                var $select2 = $element.select2(this.options);

                if (options != null && options.url && options.multiple != true) {
                    $select2.on("select2:open", function() {
                        $(".select2-search__field").attr("placeholder", messageController.get('info.common.11')); // info.common.11=검색할 내용을 2자 이상 입력 후 선택하세요.
                    });
                    $select2.on("select2:close", function() {
                        $(".select2-search__field").attr("placeholder", null);
                    });
                }

                $select2.val("").trigger('change');

                this.getElement = function() {
                    return $element;
                }

                this.getSelect2 = function() {
                    return $select2;
                }

                //return $select2;
            }

            Select2Controller.prototype = {

                resetItems : function(data) {
                    var ele = this.getElement();
                    var value = ele.val();
                    ele.empty().trigger("change");
                    ele.select2($.extend(this.options, { data : data }));
                    ele.val(value).trigger('change');
                },

                on : function(event, handler) {
                    return this.getSelect2().on(event, handler);
                }
            }

            return Select2Controller;
        })();


        $.fn.select2Controller = function() {

            var $this = $(this);
            var data = $this.data("select2Controller");

            var isRefresh;

            if(arguments[0] != undefined && arguments[0].refresh != undefined) {
                isRefresh = arguments[0].refresh;
            }

            //data가  없으면 Default로 새로 생성
            if(!data || isRefresh != undefined || isRefresh === true) {
                $this.data('select2Controller', data = new Select2Controller(this, arguments[0]));
            } else {
                $this.select2(arguments[0]);
            }

            return data;
        }

        $.fn.select2Controller.multipleOptions = {
            multiple : true,
            placeholder : messageController.get('info.common.6'),
            allowClear : true,
            closeOnSelect : false,
            selectOnClose: false
        };

        $.fn.select2Controller.singleOptions = {
            placeholder : messageController.get('info.common.6'),
            allowClear: false,
            closeOnSelect: true,
            minimumResultsForSearch: -1
        };


    })(window.jQuery, window);
});
