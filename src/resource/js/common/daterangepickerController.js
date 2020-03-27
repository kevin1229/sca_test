$(function(){

    (function($, window) {

        var monthLang = [ messageController.get("label.month.jan")
            , messageController.get("label.month.feb")
            , messageController.get("label.month.mar")
            , messageController.get("label.month.apr")
            , messageController.get("label.month.may")
            , messageController.get("label.month.jun")
            , messageController.get("label.month.jul")
            , messageController.get("label.month.aug")
            , messageController.get("label.month.sep")
            , messageController.get("label.month.oct")
            , messageController.get("label.month.nov")
            , messageController.get("label.month.dec") ];

        var dayLang = [ messageController.get("label.week.sun")
            , messageController.get("label.week.mon")
            , messageController.get("label.week.tue")
            , messageController.get("label.week.wed")
            , messageController.get("label.week.thu")
            , messageController.get("label.week.fri")
            , messageController.get("label.week.sat") ];

        var DaterangepickerController = (function(){

            var today       =   messageController.get('label.search.date.today');
            var yesterday   =   messageController.get('label.search.date.yesterday');
            var last7days   =   messageController.get('label.search.date.last.7.days');
            var last30days  =   messageController.get('label.search.date.last.30.days');
            var thisMonth   =   messageController.get('label.search.date.this.month');
            var lastMonth   =   messageController.get('label.search.date.last.month');

            // 생성자
            function DaterangepickerController(element, options, callBack){

                var $element = $(element);

                var defaults = $.extend({}, $.fn.daterangepickerController.defaults);
                if(options == null || options.ranges != false){
                    defaults.ranges = {};
                    defaults.ranges[today] = [moment().startOf('day'), moment().endOf('day')],
                    defaults.ranges[yesterday] = [moment().subtract(1, 'days').startOf('day'), moment().subtract(1, 'days').endOf('day')],
                    defaults.ranges[last7days] = [moment().subtract(6, 'days').startOf('day'), moment().endOf('day')],
                    defaults.ranges[last30days] = [moment().subtract(29, 'days').startOf('day'), moment().endOf('day')],
                    defaults.ranges[thisMonth] = [moment().startOf('month'), moment().endOf('month')],
                    defaults.ranges[lastMonth] = [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')]
                }

                var setting = null;
                if (options) {
                    if (options.locale) {
                        options.locale = $.extend({}, $.fn.daterangepickerController.defaultLocale, options.locale);
                    }
                    setting = $.extend({}, defaults, options);
                } else {
                    setting = defaults
                }

                if (setting.locale == null) {
                    setting.locale = $.fn.daterangepickerController.defaultLocale;
                }


                $daterangepicker = $element.daterangepicker(setting, callBack);

                $element.on('cancel.daterangepicker', function(ev, picker) {
                    $(this).val('');
                });

                if (setting.singleDatePicker) {
                    $element.on('apply.daterangepicker', function(ev, picker) {
                        $(this).val(picker.startDate.format(setting.locale.format));
                    });
                } else {
                    $element.on('apply.daterangepicker', function(ev, picker) {
                        $(this).val(picker.startDate.format(setting.locale.format) + ' - ' + picker.endDate.format(setting.locale.format));
                    });
                }

                $element.on('showCalendar.daterangepicker', function(ev, picker) {
                    picker.container.offset({
                        left: picker.container.offset().left - 38,
                        top: picker.container.offset().top + 5
                    });
                });

                $element.on('show.daterangepicker', function(ev, picker) {
                    picker.container.offset({
                        left: picker.container.offset().left - 38,
                        top: picker.container.offset().top + 5
                    });
                });

                this.getElement = function() {
                    return $element;
                }

                this.getSetting = function() {
                    return setting;
                }
            }

            DaterangepickerController.prototype.setDate = function(date) {
                if (date != null) {
                    this.getElement().data('daterangepicker').setStartDate(moment(date));
                    this.getElement().data('daterangepicker').setEndDate(moment(date));
                } else {
                    this.getElement().data('daterangepicker').setStartDate(moment());
                    this.getElement().data('daterangepicker').setEndDate(moment());
                }
            }

            DaterangepickerController.prototype.setStartEndDate = function(startDate, endDate) {

                var start = momentController.timestampFormat(startDate, this.getSetting().locale.format);
                var end = momentController.timestampFormat(endDate, this.getSetting().locale.format);

                this.getElement().val(start + ' - ' + end);
                this.getElement().data('daterangepicker').setStartDate(start);
                this.getElement().data('daterangepicker').setEndDate(end);
            }

            return DaterangepickerController;
        })();

        $.fn.daterangepickerController = function(){

            var $this = $(this);
            var data = $this.data("daterangepickerController");

            //data가  없으면 Default로 새로 생성
            if(!data) {
                data = new DaterangepickerController(this, arguments[0], arguments[1])
                $this.data('daterangepickerController', data);
            }

            return data;
        }

        // Data table controller 기본 값
        $.fn.daterangepickerController.defaults = {
            timePicker: true,
            timePickerIncrement: 1,
            autoUpdateInput: false,
            opens: 'right',
            alwaysShowCalendars: false,
            startDate:  moment().subtract(6, 'hours'),
            endDate: moment()
        }

        $.fn.daterangepickerController.defaultLocale = {
            // TODO : lacale 설정 작업
            monthNames: monthLang,
            monthNamesShort: monthLang,
            dayNames: dayLang,
            dayNamesShort: dayLang,
            dayNamesMin: dayLang,
            daysOfWeek : dayLang,
            applyLabel: messageController.get("label.ok"),
            cancelLabel: messageController.get("label.cancel"),
            customRangeLabel: messageController.get("label.custom.range"),
            format: 'YYYY-MM-DD HH:mm'
        }

        // default option getter
        $.fn.daterangepickerController.getDefaultRange = function(){
             var today       =   messageController.get('label.search.date.today');
             var yesterday   =   messageController.get('label.search.date.yesterday');
             var last7days   =   messageController.get('label.search.date.last.7.days');
             var last30days  =   messageController.get('label.search.date.last.30.days');
             var thisMonth   =   messageController.get('label.search.date.this.month');
             var lastMonth   =   messageController.get('label.search.date.last.month');

             ranges = {};
             ranges[today] = [moment().startOf('day'), moment().endOf('day')],
             ranges[yesterday] = [moment().subtract(1, 'days').startOf('day'), moment().subtract(1, 'days').endOf('day')],
             ranges[last7days] = [moment().subtract(6, 'days').startOf('day'), moment().endOf('day')],
             ranges[last30days] = [moment().subtract(29, 'days').startOf('day'), moment().endOf('day')],
             ranges[thisMonth] = [moment().startOf('month'), moment().endOf('month')],
             ranges[lastMonth] = [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')]
             return ranges;
        }

    })(window.jQuery, window);
});
