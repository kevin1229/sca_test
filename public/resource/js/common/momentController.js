/**
 * MOMENT(Time) Controller
 * @Author kimkc
 */
var MomentController = (function(){

    var gmtHours = -(new Date().getTimezoneOffset()/60);

    function MomentController(){
    }

    MomentController.prototype.durationTime = function (data) {
        var duration = moment.duration(data, 'milliseconds');

        var retVal = "";
        retVal += Math.floor(duration.asHours()) + 'h ';
        retVal += duration.minutes() + 'm ';
        retVal += duration.seconds() + 's';

        return retVal;
    },

    MomentController.prototype.timestampFormat = function (data, format, defaultValue) {
        if (data != null && $.trim(data).length != 0) {
            //return moment(new Date(data)).utcOffset(+gmtHours).format(format);
            return moment(new Date(data)).format(format);
        }

        if(defaultValue != null){
            return defaultValue;
        }
        return null;
    }

    return MomentController;
})();

var momentController = new MomentController();
