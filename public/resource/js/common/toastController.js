/**
 * toast
 *
 * @author kimkc
 * @author webviewr
 */
(function($, window) {

    $.extend({
        toastController: function(options) {

            var settings = $.extend({
                position: 'bottom-right',
                stack: 10,
                hideAfter: 5000,
                loader: false,
                headingEscape: true,
                textEscape: true,
            }, options);

            if (settings.heading != null && settings.headingEscape == true) {
                settings.heading = settings.heading.escapeHTML();
            }

            if (settings.text != null && settings.textEscape == true) {
                settings.text = settings.text.escapeHTML();
            }

            return $.toast(settings);
        },
        toastRed: function(options) {
            this.toastController($.extend({
                bgColor: '#fededb',
                textColor: '#B71C1C',
                allowToastClose: false
            }, options));
        },
        toastGreen: function(options) {
            this.toastController($.extend({
                bgColor: '#d9edf7',
                textColor: '#31708F',
                allowToastClose: false
            }, options));
        }
    });

})(jQuery, this || window);