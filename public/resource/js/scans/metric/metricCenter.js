$(function () {

    var scanId = $("#scanId").val();

    var isShowTabDapa = false;
    var isShowTabMisra = false;

    var defaultChartGauge = {
        data: {
            type: 'gauge',
            columns: []
        },
        gauge: {
            label: {
                format: function(value, ratio) {
                    return value;
                },
                show: true // to turn off the min/max labels.
            },
        },
        tooltip: {
            show: false
        },
        color: {
            pattern: ['#F74343'],
        },
        padding: {
            top: -30
        },
        size: {
            height: 150
        },
        legend: {
            item: {
                onclick: function() {
                    // 아이템 클릭 이벤트 없음
                }
            }
        }
    };

    // label.metric.exceeded.function.counts=초과 함수 개수
    var labelChartGauge = messageController.get("label.metric.exceeded.function.counts");

    SearchOption = function() {
        this.exceedColumns = [];
    };
    SearchOption.prototype = {
        clear : function() {
            this.exceedColumns = [];
        }
    };

    var searchOptionMetricDapa = new SearchOption();
    var searchOptionMetricMisra = new SearchOption();


    /***********************************************************************
     * 탭 설정
     ***********************************************************************/
    initTab("dapa");

    function showTabContent() {
        switch($('#tabRoot li.active a').data('target')) {
            case "#tabDapa":
                showTabDapa();
                break;
            case "#tabMisra":
                showTabMisra();
                break;
        }
    }
    showTabContent();

    $("#tabRoot a[data-toggle=tab]").on('shown.bs.tab', function(e){
        showTabContent();
    });


    /***********************************************************************
     * DAPA
     ***********************************************************************/
    function showTabDapa() {
        if (isShowTabDapa) {
            return;
        }
        isShowTabDapa = true;


        // DAPA 함수별 메트릭
        $.ajaxRest({
            url : "/api/1/scans/" + scanId + "/matric/funcs/dapa/exceed/count",
            type : "GET",
            success : function(data, textStatus, header) {

                var dapaChartGauge =  $.extend({}, defaultChartGauge);
                dapaChartGauge.gauge.max = data.totalCount;

                // 순환 복잡도
                c3.generate($.extend({}, dapaChartGauge, {
                    bindto: '#chartDapa1',
                })).load({
                    columns: [[labelChartGauge, data.cyclomatic]]
                });

                // 최대 블록 중첩 깊이
                c3.generate($.extend({}, dapaChartGauge, {
                    bindto: '#chartDapa2',
                })).load({
                    columns: [[labelChartGauge, data.strcLv]]
                });

                // 페라미터
                c3.generate($.extend({}, dapaChartGauge, {
                    bindto: '#chartDapa3',
                })).load({
                    columns: [[labelChartGauge, data.paramNum]]
                });

                // 호출하는 수
                c3.generate($.extend({}, dapaChartGauge, {
                    bindto: '#chartDapa4',
                })).load({
                    columns: [[labelChartGauge, data.callNum]]
                });

                // 호출되는 수
                c3.generate($.extend({}, dapaChartGauge, {
                    bindto: '#chartDapa5',
                })).load({
                    columns: [[labelChartGauge, data.callbyNum]]
                });

                // 실행 가능 라인 수
                c3.generate($.extend({}, dapaChartGauge, {
                    bindto: '#chartDapa6',
                })).load({
                    columns: [[labelChartGauge, data.execLines]]
                });

                var $dataTableMetricDapaExceedCount = $("#dataTableMetricDapaExceedCount").dataTableController({
                    dom : 'i<"top">rt<"bottom"fp><"clear">',
                    paging : false,
                    sorting : false,
                    order : [],
                    columnDefs: [ {
                        targets: 0, // 항목
                        data: "label",
                        render : function(data, type, row) {
                            return messageController.get(data);
                        }
                    }, {
                       targets: 1, // 수
                       data: "count",
                       className : "dt-head-right",
                       render : $.fn.dataTable.render.text()
                    }],
                    createdRow: function(row, data, index) {
                        var $row = $(row);
                        $row.on('click', function(e) {
                            if ($row.hasClass('row-selected')) {
                                $row.removeClass('row-selected');
                            } else {
                                $row.parent().find('tr.row-selected').removeClass('row-selected');
                                $row.addClass('row-selected');
                            }

                            searchOptionMetricDapa.clear();
                            if (data.column != null) {
                                searchOptionMetricDapa.exceedColumns.push(data.column);
                            }

                            $dataTableMetricDapa.draw();
                        });
                    }
                });
                $dataTableMetricDapaExceedCount.addRows([
                    { label : "label.all",                                             column: null,             count : data.totalCount }, // 전체
                    { label : "label.metric.exceeded.cyclomatic.complexity",           column: "dapaCyclomatic", count : data.cyclomatic }, // 순환 복잡도 초과
                    { label : "label.metric.exceeded.number.of.call.levels",           column: "dapaStrcLv",     count : data.strcLv }, // 최대 블록 중첩 깊이 초과
                    { label : "label.metric.exceeded.number.of.function.parameters",   column: "dapaParamNum",   count : data.paramNum }, // 파라메터 수 초과
                    { label : "label.metric.exceeded.number.of.calling.function",      column: "dapaCallNum",    count : data.callNum }, // 호출하는 수 초과
                    { label : "label.metric.exceeded.number.of.called.function",       column: "dapaCallbyNum",  count : data.callbyNum }, // 호출되는 수 초과
                    { label : "label.metric.exceeded.number.of.executable.code.lines", column: "dapaExecLines",  count : data.execLines } // 실행 가능한 라인 수
                ]);
                $dataTableMetricDapaExceedCount.draw();
            }
        });

        // 내보내기
        $("#buttonGroupDataTableMetricDapa").find('[name=btnExport]').on('click', function(e) {
            var requestBody = {};
            requestBody.searchOption = searchOptionMetricDapa

            $.ajaxRest({
                url : "/api/1/scans/" + scanId + "/matric/funcs/dapa/export/excel",
                type : "POST",
                data : requestBody,
                error : function(hdr, status) {
                    errorMsgHandler.swal(hdr.responseText);
                }
            });
        });

        var $dataTableMetricDapa = $("#dataTableMetricDapa").dataTableController({
            url : "/api/1/scans/" + scanId + "/matric/funcs",
            searchOption : searchOptionMetricDapa,
            buttonGroupId: "buttonGroupDataTableMetricDapa",
            columnDefs : [ {
                targets : 0, // ID
                data : "metricFuncId",
                visible: false,
                className : "dt-head-right"
            }, {
                targets : 1,
                data : "filePath", // 경로
                visible: false,
                render : $.fn.dataTable.render.text()
            }, {
                targets : 2,
                data : "fileName", // 파일명
                render : $.fn.dataTable.render.text()
            }, {
                targets : 3, // 함수명
                data : "name",
                render : $.fn.dataTable.render.text()
            }, {
                targets : 4, // 라인
                data : "line",
                className : "dt-head-right"
            }, {
                targets : 5, // 순환 복잡도
                data : "cyclomatic",
                className : "dt-head-right",
                render : function(data, type, row, meta) {
                    if (data == null)
                        return '-';
                    return data.format();
                }
            }, {
                targets : 6, // 최대 블록 중첩 깊이
                data : "strcLv",
                className : "dt-head-right",
                render : function(data, type, row, meta) {
                    if (data == null)
                        return '-';
                    return data.format();
                }
            }, {
                targets : 7, // 파라메터 수
                data : "paramNum",
                className : "dt-head-right",
                render : function(data, type, row, meta) {
                    if (data == null)
                        return '-';
                    return data.format();
                }
            }, {
                targets : 8, // 호출하는 수
                data : "callNum",
                className : "dt-head-right",
                render : function(data, type, row, meta) {
                    if (data == null)
                        return '-';
                    return data.format();
                }
            }, {
                targets : 9, // 호출되는 수
                data : "callbyNum",
                className : "dt-head-right",
                render : function(data, type, row, meta) {
                    if (data == null)
                        return '-';
                    return data.format();
                }

            }, {
                targets : 10, // 실행 가능 라인 수
                data : "execLines",
                className : "dt-head-right",
                render : function(data, type, row, meta) {
                    if (data == null)
                        return '-';
                    return data.format();
                }
            } ]
        });
    }

    /***********************************************************************
     * MISRA
     ***********************************************************************/
    function showTabMisra() {

        if (isShowTabMisra) {
            return;
        }
        isShowTabMisra = true;

        // 전체 메트릭 지표
        $.ajaxRest({
            url : "/api/1/scans/" + scanId + "/matric/system",
            type : "GET",
            success : function(data, textStatus, header) {
                var $misraMetricSystem = $('#misraMetricSystem');
                $misraMetricSystem.html($misraMetricSystem.html().compose(data));
                $misraMetricSystem.removeClass("invisible");
            }
        });

        // MISRA 함수별 메트릭
        $.ajaxRest({
            url : "/api/1/scans/" + scanId + "/matric/funcs/misra/exceed/count",
            type : "GET",
            success : function(data, textStatus, header) {
                var misraChartGauge =  $.extend({}, defaultChartGauge);
                misraChartGauge.gauge.max = data.totalCount;

                // 어휘량 크기
                c3.generate($.extend({}, misraChartGauge, {
                    bindto: '#chartMisra1',
                })).load({
                    columns: [[labelChartGauge, data.cpntVoca]]
                });

                // 컴포넌트 길이
                c3.generate($.extend({}, misraChartGauge, {
                    bindto: '#chartMisra2',
                })).load({
                    columns: [[labelChartGauge, data.cpntLen]]
                });

                // 평균 문장 크기
                c3.generate($.extend({}, misraChartGauge, {
                    bindto: '#chartMisra3',
                })).load({
                    columns: [[labelChartGauge, data.avgStmt]]
                });

                // 순환 복잡도
                c3.generate($.extend({}, misraChartGauge, {
                    bindto: '#chartMisra4',
                })).load({
                    columns: [[labelChartGauge, data.cyclomatic]]
                });

                // 결정 문장 개수
                c3.generate($.extend({}, misraChartGauge, {
                    bindto: '#chartMisra5',
                })).load({
                    columns: [[labelChartGauge, data.dcsStmt]]
                });

                // 구조화 수준
                c3.generate($.extend({}, misraChartGauge, {
                    bindto: '#chartMisra6',
                })).load({
                    columns: [[labelChartGauge, data.strcLv]]
                });

                var $dataTableMetricMisraExceedCount = $("#dataTableMetricMisraExceedCount").dataTableController({
                    dom : 'i<"top">rt<"bottom"fp><"clear">',
                    paging : false,
                    sorting : false,
                    order : [],
                    columnDefs: [ {
                        targets: 0, // 항목
                        data: "label",
                        render : function(data, type, row) {
                            return messageController.get(data);
                        }
                    }, {
                       targets: 1, // 수
                       data: "count",
                       className : "dt-head-right",
                       render : $.fn.dataTable.render.text()
                    }],
                    createdRow: function(row, data, index) {
                        var $row = $(row);
                        $row.on('click', function(e) {
                            if ($row.hasClass('row-selected')) {
                                $row.removeClass('row-selected');
                            } else {
                                $row.parent().find('tr.row-selected').removeClass('row-selected');
                                $row.addClass('row-selected');
                            }

                            searchOptionMetricMisra.clear();
                            if (data.column != null) {
                                searchOptionMetricMisra.exceedColumns.push(data.column);
                            }

                            $dataTableMetricMisra.draw();
                        });
                    }
                });
                $dataTableMetricMisraExceedCount.addRows([
                    { label : "label.all",                                            column : null,              count : data.totalCount }, // 전체
                    { label : "label.metric.exceeded.number.of.statements",           column : "misraStmtNum",    count : data.stmtNum },    // 문장 개수 초과
                    { label : "label.metric.exceeded.number.of.distinct.operands",    column : "misraDOprd",      count : data.dOprd },      // 유일한 연산자 수 초과
                    { label : "label.metric.exceeded.number.of.distinct.operators",   column : "misraDOptr",      count : data.dOptr },      // 유일한 피연산자 수 초과
                    { label : "label.metric.exceeded.number.of.operand.occurrences",  column : "misraOcrOprd",    count : data.ocrOprd },    // 총 연산자 수 초과
                    { label : "label.metric.exceeded.number.of.operator.occurrences", column : "misraOcrOptr",    count : data.ocrOptr },    // 총 피연산자 수
                    { label : "label.metric.exceeded.vocabulary.size",                column : "misraCpntVoca",   count : data.cpntVoca },   // 어휘량 크기 초과
                    { label : "label.metric.exceeded.component.length",               column : "misraCpntLen",    count : data.cpntLen },    // 컴포넌트 길이 초과
                    { label : "label.metric.exceeded.average.statement.size",         column : "misraAvgStmt",    count : data.avgStmt },    // 평균 문장 크기 초과
                    { label : "label.metric.exceeded.cyclomatic.number",              column : "misraCyclomatic", count : data.cyclomatic }, // 순환복잡도 초과
                    { label : "label.metric.exceeded.number.of.decision.statements",  column : "misraDcsStmt",    count : data.dcsStmt },    // 결정 문장 개수 초과
                    { label : "label.metric.exceeded.number.of.structuring.levels",   column : "misraStrcLv",     count : data.strcLv },     // 구조화 수준 초과
                    { label : "label.metric.exceeded.number.of.entry.points",         column : "misraEntryPtr",   count : data.entryPtr },   // 진입점 수 초과
                    { label : "label.metric.exceeded.number.of.exit.points",          column : "misraExitPnt",    count : data.exitPnt },    // 탈출점 수 초과
                    { label : "label.metric.exceeded.number.of.unconditional.jumps",  column : "misraUncondNum",  count : data.uncondNum }   // 제어하지 않은 점프문 수 초과
                ]);
                $dataTableMetricMisraExceedCount.draw();
            }
        });


        // 내보내기
        $("#buttonGroupDataTableMetricMisra").find('[name=btnExport]').on('click', function(e) {
            var requestBody = {};
            requestBody.searchOption = searchOptionMetricMisra

            $.ajaxRest({
                url : "/api/1/scans/" + scanId + "/matric/funcs/misra/export/excel",
                type : "POST",
                data : requestBody,
                error : function(hdr, status) {
                    errorMsgHandler.swal(hdr.responseText);
                }
            });
        });

        var $dataTableMetricMisra = $("#dataTableMetricMisra").dataTableController({
            url : "/api/1/scans/" + scanId + "/matric/funcs",
            searchOption : searchOptionMetricMisra,
            buttonGroupId: "buttonGroupDataTableMetricMisra",
            order : [ [ 1, 'asc' ] ],
            columnDefs : [ {
                targets : 0, // ID
                data : "metricFuncId",
                visible: false,
                className : "dt-head-right"
            }, {
                targets : 1,
                data : "filePath", // 경로
                visible: false,
                render : $.fn.dataTable.render.text()
            }, {
                targets : 2,
                data : "fileName", // 파일명
                render : $.fn.dataTable.render.text()
            }, {
                targets : 3, // 함수명
                data : "name",
                render : $.fn.dataTable.render.text()
            }, {
                targets : 4, // 라인
                data : "line",
                className : "dt-head-right"
            }, {
                targets : 5, // 문장 개수
                data : "stmtNum",
                className : "dt-head-right",
                render : function(data, type, row, meta) {
                    if (data == null)
                        return '-';
                    return data.format();
                }
            }, {
                targets : 6, // 유일한 연산자 수
                data : "dOprd",
                className : "dt-head-right",
                render : function(data, type, row, meta) {
                    if (data == null)
                        return '-';
                    return data.format();
                }
            }, {
                targets : 7, // 유일한 피연산자 수
                data : "dOptr",
                className : "dt-head-right",
                render : function(data, type, row, meta) {
                    if (data == null)
                        return '-';
                    return data.format();
                }
            }, {
                targets : 8, // 총 연산자 수
                data : "ocrOprd",
                className : "dt-head-right",
                render : function(data, type, row, meta) {
                    if (data == null)
                        return '-';
                    return data.format();
                }
            }, {
                targets : 9, // 총 피연산자 수
                data : "ocrOptr",
                className : "dt-head-right",
                render : function(data, type, row, meta) {
                    if (data == null)
                        return '-';
                    return data.format();
                }
            }, {
                targets : 10, // 어휘량 크기
                data : "cpntVoca",
                className : "dt-head-right",
                render : function(data, type, row, meta) {
                    if (data == null)
                        return '-';
                    return data.format();
                }
            }, {
                targets : 11, // 컴포넌트 길이
                data : "cpntLen",
                className : "dt-head-right",
                render : function(data, type, row, meta) {
                    if (data == null)
                        return '-';
                    return data.format();
                }
            }, {
                targets : 12, // 평균 문장 크기
                data : "avgStmt",
                className : "dt-head-right",
                render : function(data, type, row, meta) {
                    if (data == null)
                        return '-';
                    return data.format();
                }
            }, {
                targets : 13, // 순환복잡도
                data : "cyclomatic",
                className : "dt-head-right",
                render : function(data, type, row, meta) {
                    if (data == null)
                        return '-';
                    return data.format();
                }
            }, {
                targets : 14, // 결정 문자 개수
                data : "dcsStmt",
                className : "dt-head-right",
                render : function(data, type, row, meta) {
                    if (data == null)
                        return '-';
                    return data.format();
                }
            }, {
                targets : 15, // 구조화 수준
                data : "strcLv",
                className : "dt-head-right",
                render : function(data, type, row, meta) {
                    if (data == null)
                        return '-';
                    return data.format();
                }
            }, {
                targets : 16, // 진입점 수
                data : "entryPtr",
                className : "dt-head-right",
                render : function(data, type, row, meta) {
                    if (data == null)
                        return '-';
                    return data.format();
                }
            }, {
                targets : 17, // 탈출점 개수
                data : "exitPnt",
                className : "dt-head-right",
                render : function(data, type, row, meta) {
                    if (data == null)
                        return '-';
                    return data.format();
                }
            }, {
                targets : 18, // 제어하지 않는 점프문
                data : "uncondNum",
                className : "dt-head-right",
                render : function(data, type, row, meta) {
                    if (data == null)
                        return '-';
                    return data.format();
                }
            } ]
        });
    }

});