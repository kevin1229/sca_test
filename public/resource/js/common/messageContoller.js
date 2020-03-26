/**
 * MessageController
 *
 * @author kimkc
 */
var MessageController = (function() {

    function MessageController() {
    }

    MessageController.prototype = {
        get: function (key) {
            var msg = messages.map[key];

            for (var i = 1; i < arguments.length; i++) {
                msg = msg.replace('{' + (i - 1) + '}', arguments[i]);
            }

            return msg;
        },
        getLang: function () {
            return messages.lang;
        }
    }

    return MessageController;
})();

var messageController = new MessageController();
