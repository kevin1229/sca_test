/**
 * blockUI
 *
 * @author kimkc
 */
(function($, window) {

    $.extend({
        blockUIGray: function(options) {

            var defaultOptions = {
                message: "<i class='fa fa-circle-o-notch fa-spin fa-3x fa-fw'></i>",
                css: {
                    width: "48px",
                    height: "48px",
                    top: "46%",
                    left: "50%",
                    border: "none",
                    borderRadius: "6px",
                    backgroundColor: '#fff',//"rgba(255, 255, 100, 1)",
                    color: '#000'
                },
                overlayCSS:  {
                    backgroundColor: '#000',
                    opacity:         0.2,
                    cursor:          'wait'
                },
                baseZ: 4000
            }

            if (options == null) {
                defaultOptions = $.extend(defaultOptions, options);
            }

            return $.blockUI(defaultOptions);
        }
    });

})(jQuery, this || window);