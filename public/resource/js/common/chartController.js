/**
 * Chart Controller
 *
 * @kimkc
 */
var ChartController = (function(){

    function ChartController(){
    }

    ChartController.prototype.getLineDatasets = function(label, color) {
        var defaultDatasets = {
            label: "Level",
            fill: false,
            lineTension: 0.1,
            backgroundColor: "rgba(75,192,192,0.4)",
            borderColor: "rgba(75,192,192,1)",
            borderCapStyle: 'butt',
            borderDash: [],
            borderDashOffset: 0.0,
            borderJoinStyle: 'miter',
            pointBorderColor: "rgba(75,192,192,1)",
            pointBackgroundColor: "#fff",
            pointBorderWidth: 0,
            pointHoverRadius: 3,
            pointHoverBackgroundColor: "rgba(75,192,192,1)",
            pointHoverBorderColor: "rgba(220,220,220,1)",
            pointHoverBorderWidth: 2,
            pointRadius: 2,
            pointHitRadius: 10,
            data: [],
            spanGaps: false,
        };

        return $.extend({}, defaultDatasets, {
            label: label,

            backgroundColor: color,
            borderColor: color,

            pointBorderColor: color,
            pointBackgroundColor: color,

            pointHoverBackgroundColor: color,
            pointHoverBorderColor: color,
        });
    }

    ChartController.prototype.getLineOption = function() {
        return {
            legend: {
                display: false,
                labels: {
                    boxWidth: 12,
                    fontSize: 13,
                    fontFamily: "'Nanum Gothic', 'Open Sans', sans-serif"
                }
            },
            maintainAspectRatio: false,
            responsive: true,
            tooltips: {
                mode: 'index',
                intersect: true,
            },
            scales: {
                xAxes: [{
                    display: true,
                    ticks: {
                        autoSkip: true,
                        autoSkipPadding: 10,
                        maxRotation: 0,
                        minRotation: 0
                    },
                    scaleLabel: {
                        display: false,
                    },
                    gridLines: {
                        display: false,
                        color: 'transparent'
                    }
                }],
                yAxes: [{
                    display: true,
                    ticks: {
                        beginAtZero: true,
                        maxTicksLimit: 5,
                        userCallback: function(label, index, labels) {
                            // when the floored value is the same as the value we have a whole number
                            if (Math.floor(label) === label) {
                                return label;
                            }
                        }
                    },
                    scaleLabel: {
                        display: false,
                    },
                    afterTickToLabelConversion: function(scale) {
                        var newTicks = [];
                        for(var i = 0; i < scale.ticks.length; i++) {
                            if(parseFloat(scale.ticks[i]) % 1 === 0) {
                                newTicks.push(parseInt(scale.ticks[i]).toLocaleString());
                            } else {
                                newTicks.push("");
                            }
                        }
                        scale.ticks = newTicks;
                    }
                }]
            }
        };
    }

    ChartController.prototype.isCanvasBlank = function(canvasId) {
        var canvas = document.getElementById(canvasId);

        var blank = document.createElement('canvas');
        blank.width = canvas.width;
        blank.height = canvas.height;

        return canvas.toDataURL() == blank.toDataURL();
    }

    return ChartController;
})();

var chartController = new ChartController();