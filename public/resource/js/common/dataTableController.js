/**
 * DataTable Controller
 *
 * @author Byungho
 * @author kimkc
 */
$(function() {
    (function($, window) {

        var DataTableController = (function() {

            // 생성자
            function DataTableController(element, options) {

                var $element = $(element);

                if(options.url != null) {
                    // Ajax 옵션 설정
                    options.ajax = {
                        url : options.url,
                        dataType : "json",
                        type : (options.type)? options.type : "POST",
                        data : function(d, settings) {
                            if (options.type && options.type == "GET") {

                                if (options.searchOption != null) {

                                    var params = "pageNo=" + (parseInt(d.start / d.length) + 1);
                                    params += "&perPage=" + d.length;

                                    var i = 0;
                                    for ( var i in d.order) {
                                        var columnDef = options.columnDefs[d.order[i].column];
                                        var sortKey = columnDef.sortKey;
                                        if (sortKey == null) {
                                            sortKey = columnDef.data;
                                        }
                                        params += "&" + encodeURIComponent("sortList[" + i +"].sortKey") + "=" + sortKey + "&" + encodeURIComponent("sortList[" + i +"].sortOrder") + "=" +  d.order[i].dir;
                                        i++;
                                    }

                                    // 검색 조건
                                    Object.keys(options.searchOption).map(function(key) {
                                        if (options.searchOption[key] != null && options.searchOption[key] != "" && options.searchOption[key] != undefined) {
                                            params +="&" + encodeURIComponent(key) + '=' + encodeURIComponent(options.searchOption[key])
                                        }
                                    });

                                    return params;
                                }
                                return;
                            }
                            var pageNo = parseInt(d.start / d.length) + 1;

                            // TODO : local 저장소에서 검색 조건 불러오는것 구현 필요
                            // var localData = JSON.parse( localStorage.getItem( 'DataTables_' + settings.sInstance ) );
                            //
                            // for(var key in localData.searchOption) {
                            //     if(options.searchOption[key] == null || options.searchOption.length == 0) {
                            //         options.searchOption[key] = localData.searchOption[key];
                            //     }
                            // }

                            var perPage = d.length;
                            var sortList = [];

                            for ( var i in d.order) {

                                var columnDef = options.columnDefs[d.order[i].column];
                                var sortKey = columnDef.sortKey;
                                if(sortKey == null) {
                                    sortKey = columnDef.data;
                                }

                                sortList.push({
                                    "sortKey" : sortKey,
                                    "sortOrder" : d.order[i].dir
                                });
                            }

                            var body = {};
                            // TODO : local 저장소에서 검색 조건 불러오는 것 구현 후 제대로 된 pageNO 적용
                            body.pageNo = pageNo;
                            body.perPage = perPage;
                            body.sortList = sortList;
                            body.searchOption = options.searchOption;
                            return JSON.stringify(body);
                        },
                        beforeSend : function(xhr, settings) {
                            xhr.setRequestHeader("content-type", "application/json; charset=UTF-8");
                            $.blockUIGray();
                        },
                        complete : function(responseJson, status) {
                            $.unblockUI();
                        },
                        dataSrc : function(json) {

                            json.recordsTotal = json.allCount? json.allCount: json.totalCount; // max
                            json.recordsFiltered = json.totalCount; // total

                            return json.list;
                        },
                        error : function(hdr, status) {
                            console.log("hdr.status : " + hdr.status + ", hdr.responseText : " + hdr.responseText);
                        }
                    };

                    options = $.extend({}, $.fn.dataTableController.serverSideOptions, options);
                } else {
                    // 클라이언트 사이드
                    options = $.extend({}, $.fn.dataTableController.clientSideOptions, options);
                }


                if (options.buttons != null) {
                    $.each(options.buttons, function(i, data) {
                        if(options.buttons[i].extend == "colvis") {
                            options.buttons[i].columns = [];
                            $.each(options.columnDefs, function(x, data) {
                                if (options.columnDefs[x].data != null && options.columnDefs[x].colvis != false) {
                                    options.buttons[i].columns.push(options.columnDefs[x].targets);
                                }
                            });
                            options.buttons[i].postfixButtons = [ 'colvisRestore' ]
                        }
                    });
                }

                var oriDrawCallBack = options.drawCallback;
                if (oriDrawCallBack) {
                    options = $.extend({}, options, {
                        drawCallback : function(settings) {
                            // 버튼 그룹 dataTable로 이동
                            if (options.buttonGroupId) {
                                var $btnDataTableButtonGroup = $('#' + options.buttonGroupId);
                                if ($btnDataTableButtonGroup != null) {
                                    $btnDataTableButtonGroup.children().prependTo($element.selector + '_wrapper .dt-buttons');
                                }
                            }

                            if (this.api().data().length <= 0) {
                                this.parent().find('.dt-buttons.btn-group button:not(.close-btn)').attr('disabled', true);
                            } else {
                                this.parent().find('.dt-buttons.btn-group button:not(.close-btn)').attr('disabled', false);
                            }
                            resetSelectAllCheckBox();

                            oriDrawCallBack(settings, this);

                            $element.show();
                        }
                    });
                }

                // 디폴트 렌더 표시
                $.each(options.columnDefs, function(x, data) {
                    if(options.columnDefs[x].render == null) {
                        options.columnDefs[x].render = function(data, type, row) {
                            if (data && type == 'display') {
                                if (typeof data === 'string') {
                                    return data.escapeHTML();
                                }
                                return data;
                            }
                            return "";
                        }
                    }
                });

                var $dataTable = $element.DataTable(options);

                function fn_AddSelectAllSearchedItemsRow() {
                    // 전체가 선택된 경우
                    var eleSelectAll = $element.find('input[name=datatable_select_all]').parent().parent().parent();
                    var allRowCount = $dataTable.data().length;
                    var totalCount = $dataTable.settings()[0].fnRecordsDisplay();

                    // 페이지가 없다면 해당 없음
                    if (totalCount == allRowCount) {
                        // eleSelectAll.removeClass('selected');
                        // $element.find('input[name=datatable_select_all]').prop('checked', false);
                        // $element.find('#allCheckedMsg').remove();
                        // $element.removeClass('selected');
                        // $('.dataTables_info .select-count').detach();
                        return;
                    }

                    // 한개라도 해제 되어 있으면 전체 선택 해제함.
                    var selectedRowCount = $dataTable.rows('.selected').data().length;
                    if (allRowCount != 0 && allRowCount <= selectedRowCount) {
                        // 전체가 선택된 경우
                        var allCheck = $('<tr class="table-select-all" id="allCheckedMsg">');
                        var eleTd = $('<td colspan="' + $dataTable.columns(':visible').count() + '" align="center">');

                        var eleSpan = $('<span class="select-count"/>');

                        var eleSelectTxt = $('<span class="select-txt"/>');
                        eleSelectTxt.append(messageController.get('info.table.1', allRowCount));
                        eleSpan.append(eleSelectTxt);

                        var eleSelectAll = $('<a class="select-all">');
                        eleSelectAll.append(messageController.get('info.table.2', totalCount));
                        eleSelectAll.click(function () {
                            // 부모 Table node 검색
                            var $this = $(this);
                            var table = $this.parent().parent().parent().parent();
                            if ($this.hasClass('selected')) {
                                $this.removeClass('selected');
                                table.removeClass('selected');
                                $this.text(messageController.get('info.table.2', totalCount));
                                $element.find('input[name=datatable_select_all]').trigger('click');
                            } else {
                                $this.addClass('selected');
                                table.addClass('selected');
                                $this.text(messageController.get('label.unselect'));
                                $element.parent().find('.select-item strong').text(totalCount);
                                $this.parent().find(".select-txt").html(messageController.get('info.table.1', totalCount));
                            }
                        });
                        eleSpan.append(eleSelectAll);

                        eleTd.append(eleSpan);
                        allCheck.append(eleTd);
                        $element.find('thead').after(allCheck);

                    } else {
                        // 전체가 선택되지 않은 경우
                        eleSelectAll.removeClass('selected');
                        $element.find('input[name=datatable_select_all]').prop('checked', false);
                        $element.find('#allCheckedMsg').remove();
                        $element.removeClass('selected');
                        $('.dataTables_info .select-count').detach();
                    }
                }

                var selectAllBtn = null;
                var selectAllImg = null;
                if ($(element).parent().hasClass('dataTables_scrollBody')) {
                    selectAllBtn = $(element).parent().parent().find('[name=datatable_select_all]');
                    selectAllImg = $(element).parent().parent().find('[name=datatable_select_all]').parent().parent().parent();
                } else {
                    selectAllBtn = $(element).find('[name=datatable_select_all]');
                    selectAllImg = $(element).find('[name=datatable_select_all]').parent().parent().parent();
                }

                function resetSelectAllCheckBox() {
                    // 선택 버튼이 없을경우 수행하지 않는다.
                    if (!selectAllBtn)
                        return;

                    // 전체가 선택된 경우
                    var allRowCount = $dataTable.data().length;

                    // 한개라도 해제 되어 있으면 전체 선택 해제함.
                    var selectedRowCount = $dataTable.rows('.selected').data().length;
                    if (allRowCount != 0 && allRowCount <= selectedRowCount) {
                        // 전체가 선택된 경우
                        selectAllImg.addClass('selected');
                        selectAllBtn.prop('checked', true);
                    } else {
                        // 전체가 선택되지 않은 경우
                        selectAllImg.removeClass('selected');
                        selectAllBtn.prop('checked', false);
                    }

                    if (options.addSelectAllSearchedItemsRow == true) {
                        fn_AddSelectAllSearchedItemsRow();
                    }
                }

                $dataTable.on('select', function(e, datatable, type, indexes) {
                    // 전체 선택 체크 박스 활성화
                    resetSelectAllCheckBox();
                }).on('deselect', function(e, datatable, type, indexes) {
                    // 전체 선택 체크 박스 활성화
                    resetSelectAllCheckBox();
                });

                // 전체 해제 설정
                $element.find('input[name=datatable_select_all]').on('click', function(e) {
                    var checkedSelectAll = $(this).is(":checked");
                    var eleSelectAll = $(this).parent().parent().parent();

                    if (checkedSelectAll == true) {
                        // 전체 선택의 경우
                        $dataTable.rows().select();
                        eleSelectAll.addClass('selected');
                    } else {
                        // 전체 선택 해제 의 경우
                        $dataTable.rows().deselect();
                        eleSelectAll.removeClass('selected');
                    }
                });

                // page 전환 시 scroll top
                $dataTable.on('page.dt', function () {
                    // 공통 스크롤
                    $('.scrollbar-outer').scrollTop(0);
                    // 이슈 목록 스크롤
                    $('#issueBox').scrollTop(0);
                    $dataTable.rows().deselect();
                });


                this.getElement = function() {
                    return $element;
                }

                this.getOptions = function() {
                    return options;
                }

                this.setSearchOption = function(searchOption) {
                    options.searchOption = searchOption;
                }

                //return $dataTable;
            }

            DataTableController.prototype = {

                DataTable : function() {
                    return this.getElement().DataTable();
                },

                draw : function() {
                    this.getElement().DataTable().draw();
                    this.getElement().DataTable().rows().deselect();
                    this.getElement().removeClass('selected');
                },

                drawPage : function(page) {
                    // 현재 페이지 유지
                    var dataTable = this.getElement().DataTable();
                    if (page == null) {
                        page = dataTable.page.info().page;
                    }
                    dataTable.page(page).draw('page');
                },

                loadUrl : function(url) {
                    this.getElement().DataTable().ajax.url(url).load();
                },

                reloadOption : function(searchOption) {
                    this.setSearchOption(searchOption);
                    this.getElement().DataTable().draw();
                },

                isAllSelected : function() {
                    return this.getElement().hasClass('selected')
                },

                getSelectedIds : function(dataName) {
                    var ids = [];
                    $(this.getElement().DataTable().rows('.selected').data()).each(function (index, data) {
                        ids.push(data[dataName]);
                    });
                    return ids;
                },

                clear : function() {
                    this.getElement().DataTable().clear();
                },

                addRow : function(row) {
                    this.getElement().DataTable().row.add(row);
                },

                addRows : function(rows) {
                    for (var i in rows) {
                        this.getElement().DataTable().row.add(rows[i]);
                    }
                }
            }

            return DataTableController;
        })();

        $.fn.dataTableController = function() {

            var $this = $(this);
            var data = $this.data("dataTableController");

            //data가  없으면 Default로 새로 생성
            if(!data) {
                data = new DataTableController(this, arguments[0]);
                $this.data('dataTableController', data);
            }

            // 인자가 문자열이며 하나일 경우
            if(typeof arguments[0] === "string" && arguments.length <= 2) {
                if(arguments.length == 2) {
                    return ret = data[arguments[0]](arguments[1]);
                } else {
                    return ret = data[arguments[0]](args);
                }
            }

            return data;
        }


        // Data table controller 기본 값
        $.fn.dataTableController.serverSideOptions = {
             autoWidth: false,
             select: {
                 style : 'multi',
                 selector : 'td.select-checkbox'
             },
             addSelectAllSearchedItemsRow : true,
             drawCallback : function() {
                 // 테이블 안의 링크 클릭시, 상세 정보 로딩 안함.
                 $('.table-inner-link').on('click', function(e) {
                     e.stopPropagation();
                 });
             },
             paging : true,
             processing : true,
             ordering: true,
             order : [ [ 0, 'asc' ] ],
             serverSide : true,
             searching : false,
             keys: true,
             info : true,
             //lengthMenu : [ 10, 20, 50, 100, 200, 500 ],
             lengthMenu : [ 10, 20, 50, 100 ],
             iDisplayLength : 20,
             colReorder: false, // 칼럼 순서 변경(드래그앤 드롭) 허용여부
             colvis : {
                 exclude : [ 1 ]
             },
             buttons : [{
                 extend : "colvis"
             }],
             stateSave: true,
             stateSaveCallback: function(settings,data) {
                 localStorage.setItem( 'DataTables_' + settings.sInstance, JSON.stringify(data) )
             },
             stateLoadCallback: function(settings) {
                 var localData = JSON.parse( localStorage.getItem( 'DataTables_' + settings.sInstance ) );
                 if (localData != null)
                     localData.start = 0;
                 return localData;
             },
             pagingType : "input",
             dom : 'liB<"top">rt<"bottom"flip><"clear">',
             infoCallback : function(settings, start, end, max, total, pre) {

                 if(end == 0) {
                     start = 0;
                 }

                 var result = messageController.get('label.table.total') + " " + total + " "
                     + messageController.get('label.table.ea') + '<span class="shown">'
                     + start + ' - ' + end + " " + messageController.get('label.table.shown') + '</span>';

                 if ((max - total) != 0) {
                     result += " (" + (max - total) + messageController.get('label.table.hidden') + ")";
                 }
                 return result;
             },
             language : {
                 buttons : {
                     colvis : '<i class="fa fa-sliders" aria-hidden="true"></i>',
                     colvisRestore : messageController.get('label.show.default.fields')
                 },
                 paginate : {
                     first : "<i class='material-icons'>first_page</i>",
                     last : "<i class='material-icons'>last_page</i>",
                     next : "<i class='material-icons'>navigate_next</i>",
                     previous : "<i class='material-icons'>navigate_before</i>",
                     page : "",
                     of : "/"
                 },
                 //sInfo : messageController.get('label.table.total') + ' _MAX_ ' + messageController.get('label.table.ea') + '<span class="shown">' + '_START_ - _END_ ' + messageController.get('label.table.shown') + '</span>',
                 sLengthMenu : messageController.get('label.table.length.menu') + " _MENU_", // ok
                 sInfoEmpty : "0 " + messageController.get('label.table.from') + " _END_(" +messageController.get('label.table.total')+ ":_TOTAL_)",
                 sEmptyTable : messageController.get('info.table.6'),
                 processing: "",
                 select : {
                     rows : {
                         _ : "<strong>%d</strong>" + messageController.get('label.table.select.rows'),
                         0 : "",
                         1 : "<strong>%d</strong>" + messageController.get('label.table.select.one')
                     }
                 },
                 emptyTable : messageController.get('info.table.4'),
                 zeroRecords : messageController.get('info.table.4'),
                 infoEmpty : ""
             }
        };

        $.fn.dataTableController.clientSideOptions = {
            paging : true,
            pageLength : 10,
            processing : false,
            lengthChange : false,
            searching : false,
            ordering : true,
            order : [ [0, 'asc'] ],
            select : {
                style:'multy',
                selector: 'td.select-checkbox'
            },
            pagingType : "input",
            language : {
                paginate : {
                    first : "<i class='material-icons'>first_page</i>",
                    last : "<i class='material-icons'>last_page</i>",
                    next : "<i class='material-icons'>navigate_next</i>",
                    previous : "<i class='material-icons'>navigate_before</i>",
                    page : "",
                    of : "/"
                },
                sInfo : messageController.get('label.table.total') + ' _MAX_ ' + messageController.get('label.table.ea') + '<span class="shown">' + '_START_ - _END_ ' + messageController.get('label.table.shown') + '</span>',
                sLengthMenu : messageController.get('label.table.length.menu') + " _MENU_", // ok
                infoFiltered: " (_TOTAL_" + messageController.get('label.table.hidden') + ")",
                sEmptyTable : messageController.get('info.table.5'),
                processing: "<div class='progress'><i class='fa fa-circle-o-notch fa-spin fa-3x fa-fw'></i></div>",
                infoEmpty : ""
            }
        }

    })(window.jQuery, window);
});
