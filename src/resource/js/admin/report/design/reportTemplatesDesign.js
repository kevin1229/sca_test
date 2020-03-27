$(function () {

    /***************************************************************************
     * 변수
     **************************************************************************/

    var $settingBox = $(".setting-box");
    var $settingBoxRptTypeSelect = $settingBox.find("[name=reportTypes]");
    var $designBox = $('.design-box');
    var $designBoxBody = $designBox.find('.box-body');
    var $logoFile = $designBox.find("#inputLogoFile");
    var $previewBtn = $('#previewBtn');
    var $previewBox = $('.preview-box');
    var $previewBoxBody = $previewBox.find('.box-body');

    var enableAddItem = 'true' == $('#enableAddItem').val();

    var complianceMap = null;
    var complianceItemData = null;

    var orgTemplateData = null;

    /***************************************************************************
     * 이벤트 핸들
     **************************************************************************/
    $previewBtn.on('click', function () {
        showReportTemplate();
    });

    $settingBox.find('[name=btnCancel]').on('click', function(){
        swal({
            title: messageController.get("confirm.common.5"),
            type: "warning",
            showCancelButton: true,
            confirmButtonText: messageController.get("label.ok"),
            cancelButtonText: messageController.get("label.cancel"),
            closeOnConfirm: false,
            closeOnCancel: true
        }, function (isConfirm) {
            if (isConfirm) {
                window.location = '/admin/report/templates';
            }
        });
    });

    $settingBox.find('[name=btnSave]').on('click', function(){
        var templateId = window.url('4', window.location.href);
        var url = "/api/1/report/templates/type/" + $settingBoxRptTypeSelect.val() + "/design";
        var type = "POST";
        if(templateId == 0){
            url += "/add";
        } else {
            url += "/modify";
            type = "PUT"
        }

        $.ajaxRest({
            url: url,
            type: type,
            data: getReportTemplate(),
            block: true,
            beforeSend: function(xhr, settings) {
                errorMsgHandler.clear($settingBox);
            },
            error: function(hdr, status) {
                errorMsgHandler.show($settingBox, hdr.responseText);
            },
            success: function (data, textStatus, jqXHR) {
                var templateId = window.url('4', window.location.href);
                var msg = messageController.get("label.report.template") + ' ' + data.name + ' ';
                if(templateId == 0) msg += messageController.get("label.has.been.added");
                else msg += messageController.get("label.has.been.modified");
                $.toastGreen({text: msg});
                var newUrl = "/admin/report/templates/" + data.templateId + "/design";
                $logoFile.uploadedData = null;
                history.pushState({}, null, newUrl);
                initLayoutDesignBox(data);
                //loadReportTemplates(data.templateId);
                //showReportTemplate();
            }
        });
    });

    /***************************************************************************
     * 컨포넌트
     **************************************************************************/
    /**
     * 로딩중 컴포너틑 카운터
     * 로딩 완료시 0. 로딩중 > 0
     * @type {number}
     */
    var loadingComponentCnt = 0;

    /**
     * 컴포넌트들을 초기화 한다.
     */
    function loadComponent() {
        // 보고서 종류
        loadingComponentCnt++;
        $.ajaxRest({
            url: "/api/1/report/templates/type/items",
            type: "GET",
            success: function (data, textStatus, jqXHR) {
                $settingBoxRptTypeSelect
                    .select2Controller({data: data})
                    .on('change', function (e, loadTemplate) {
                        if(!loadTemplate) return;
                        // 보고서 템플릿
                        $.ajaxRest({
                            url: "/api/1/report/templates/type/" + this.value + "/sample",
                            type: "GET",
                            success: function (data, textStatus, jqXHR) {
                                initLayoutDesignBox(data);
                            }
                        });
                        console.log(e);
                    });
            },
            complete: function () {
                loadingComponentCnt--;
            }
        });

        // Compliance 정보 (현재 DB등록된 체커에 연결된 것만 가져옴)
        loadingComponentCnt++;
        $.ajaxRest({
            url: "/api/1/compliance/items",
            data: "lang=all",
            type: "GET",
            success: function (data, status, header) {
                complianceItemData = data;
                complianceMap = data.reduce(function (map, obj) {
                    map[obj.id] = obj.text;
                    return map;
                }, {});
            },
            error: function (hdr, status) {
                errorMsgHandler.swal(hdr.responseText);
            },
            complete: function () {
                loadingComponentCnt--;
            }
        });
    }

    /**
     * 파일 업로드 컴포넌트 초기화.
     * @param $attach
     * @param initialCaption
     */
    function makeFileInput($attach, initialCaption) {

        var lang = messageController.getLang();
        lang = "kr";
        if (lang == "ko")
            lang = "kr";

        if (initialCaption == null)
            initialCaption = messageController.get("400026");

        $attach.fileinput({
            uploadUrl: "/api/1/fileupload/multiple",
            uploadAsync: false,
            maxFileCount: 1,
            uploadCount: 1,
            dropZoneEnabled: false,
            showPreview: false,
            showUpload: false,
            language: lang,
            initialCaption: initialCaption,
            allowedFileExtensions: ["png", "gif", "bmp"],
            layoutTemplates: {
                progress: '',
            }
        });

        $attach.on("change", function (e) {
            $attach.fileinput('upload');
            //console.log(e);
        });

        $attach.on("filebatchuploaded", function (e, data) {
            $attach.uploadedData = data;
            //console.log(data);
        });

        $attach.on("filebatchuploadcomplete", function (e, data) {
            var $captionEl = $attach.closest('.input-group').find('.file-caption-name');
            $captionEl.text($captionEl.attr('title'))
        });

        $designBox.find(".logo-file").show();
    }

    /***************************************************************************
     * 보고서 템플릿 터이터 처리 및 보고서 보여주기.
     **************************************************************************/
    /**
     * 현재의 설정값을 서버로 전달하여 보고서를 만들어 보여준다.
     */
    var isLodingPreview = false;
    function showReportTemplate() {
        var data = getReportTemplate();
        $previewBoxBody.find('>*').addClass('hidden');
        $previewBoxBody.find('.progress-div').removeClass('hidden');
        if(isLodingPreview) return;
        $.ajaxRest({
            url: "/api/1/report/templates/type/" + $settingBoxRptTypeSelect.val() + "/preview",
            type: "POST",
            data : data,
            beforeSend : function(xhr, settings) {
                isLodingPreview = true;
                $previewBtn.attr('disabled',true);
                $settingBox.find('[name=btnSave]').attr('disabled',true);
            },
            success: function (data, textStatus, jqXHR) {
                var url = '/api/1/exportedFile/' + data.exportedFileId + '/download';
                DisplayPDFByUrl(url);
                //console.log(data);
            },
            complete : function(responseJson, status) {
                isLodingPreview = false;
                $previewBtn.attr('disabled',false);
                $settingBox.find('[name=btnSave]').attr('disabled',false);
            }
        });
    }

    /**
     * 편집된 레포트 템플릿 터이터를 반환한다.
     */
    function getReportTemplate() {
        var orgTemplate = JSON.parse(orgTemplateData.template);

        var data = {};
        data.templateId = window.url('4', window.location.href);
        data.reportType = $settingBoxRptTypeSelect.val();
        data.name = $settingBox.find("[name=name]").val();
        data.description = $settingBox.find("[name=description]").val();

        var template = {};
        template.type = $settingBoxRptTypeSelect.val();

        template.master = orgTemplate.master;
        // 로고 파일 변경이 있을 경우.
        if($logoFile.uploadedData){
            template.master.content.logo = {};
            template.master.content.logo.type = "FILE";
            template.master.content.logo.value = $logoFile.uploadedData.data[0].uploadedFileName;
            template.master.content.logo.displayName = $logoFile.uploadedData.data[0].fileName;
            template.master.content.logo.changed = true;
        }
        // else {
        //     template.master.content.logo = null;
        // }

        var $sectionDoms = $designBoxBody.find('.section');
        template.sections = [];
        $.each($sectionDoms, function(key, value){
            template.sections.push(
                getSectionData($(value))
            );
        });

        console.log(JSON.stringify(template, null, 2));
        data.template = JSON.stringify(template);
        //console.log(JSON.stringify(data, null, 2));
        return data;
    }

    /**
     * 섹션의 데이터 가져오기.
     * @param $sectionDom
     */
    function getSectionData($sectionDom) {
        var section = $.extend({},$sectionDom.data('blockData'), {blocks:[]});
        var $blockDoms = $sectionDom.find('.block');
        $.each($blockDoms, function(key, value){
            section.blocks.push(
                getBlockData($(value))
            );
        });

        return section;
    }

    /**
     * Block의 데이터를 가져오기
     * @param $blockDom
     */
    function getBlockData($blockDom) {
        var block = $.extend({},$blockDom.data('blockData'));
        var $blockDoms = $blockDom.find('.block');
        //var blockDetailData = $.extend($blockDom.data('blockData'), {data:[]});
        $.each($blockDoms, function(key, value){
            block.blocks.push(
                getBlockData($(value))
            );
        });

        try {
            if(block.dataType === DATA_TYPE.CUSTOM_DATA) {
                block.customData = JSON.parse($blockDom.find('textArea').val());
            }
        } catch (error){
            console.log(error);
            var msg = messageController.get("info.report.template.custom.err01");
            $.toastRed({text: msg});
            throw error;
        }


        return block;
    }

    /**
     * 화면에 PDF데이터 가져와 보여주기.
     * @param url
     * @constructor
     */
    function DisplayPDFByUrl(url) {
        $previewBoxBody.find('>*').addClass('hidden');
        var srcUrl = "/resources/lib/pdfjs-1.9.426-dist/web/viewer.html?file=" + url + "#pagemode=thumbs";
        if($previewBoxBody.find('#pdfViewer').length > 0){
            $previewBoxBody.find('#pdfViewer').attr('src', srcUrl);
        } else {
            $previewBoxBody.append(
                $('<iframe id="pdfViewer" height="100%" width="100%"/>')
                    .attr('src', srcUrl)
            );
        }
        $previewBoxBody.find('#pdfViewer').removeClass('hidden');//.fadeIn("slow");
    }

    /***************************************************************************
     * 레포트 레이아웃 설정 DOM 생성
     **************************************************************************/
    var tSortableDom = $('<ul></ul>').addClass('sortable');

    /**
     * 레이아웃 설정 박스를 초기화 한다.
     * @param data
     */
    function initLayoutDesignBox(data) {
        // 이전에 생성된 UL 삭제.
        $designBoxBody.find('> ul,> li').remove();

        orgTemplateData = data;
        var template = JSON.parse(data.template);
        if(template.master.content.logo != null)
            makeFileInput($logoFile, template.master.content.logo.displayName);
        else
            makeFileInput($logoFile, null);

        var $designDom = tSortableDom.clone();
        for (var i in template.sections) {
            var $sectionDom = getSectionBlockDom(template.sections[i]);

            if(template.sections[i].hasOwnProperty('draggable') == true){
                // Dom이 Drag가능한 경우
                $designDom.append($sectionDom);
            } else {
                // Dom이 Drag불가능한 경우, 드래그 불가능 영역으로 뺀다.
                //$sectionDom
                $designBoxBody.append($sectionDom);
            }

            //getSectionBlockDom
            //section.getTitleCode
        }
        $designBoxBody.append($designDom);

        // 토글 버튼 초기화.
        initToggleBtn();

        // 드래그 기능 초기화.
        initDragable();

        //showReportTemplate();
    }

    function initToggleBtn() {
        // 보임 안보임 스위치 초기화.
        $designBoxBody.find('input[type=checkbox]').bootstrapToggle().change(function (e) {
            var $this = $(this);

            var data = $this.closest('.block').data('blockData').data;
            if (data) {
                var filterdData = data.filter(function (x) {
                    return x.id == $this.attr('dataId')
                });

                // 필터링된 데이터가 없다는 의미는 자기 자신 이라는 의미다.
                if (filterdData && filterdData.length > 0) {
                    filterdData[0].visible = this.checked;
                } else {
                    $this.closest('.block').data('blockData').visible = this.checked;
                }

            } else {
                $this.closest('.block').data('blockData').visible = this.checked;
            }


            if(hasChildUl($this))
                $this.closest('.block').find('ul *').attr('disabled', !this.checked);


            //showReportTemplate();
        });

        function hasChildUl($target){
            return $target.closest('.block-title').length > 0;
        }

        // 초기화시 모든 상위 체크 해제된 하위의 선택 및 편집을 불가하게 한다.
        $designBoxBody
            .find('.block-title input[type=checkbox]:not(:checked)')
            .closest('.block')
            .find('.block-body ul *')
            .attr('disabled', true);
    }

    function getAddCustomDataDom(data) {
        return $('<textarea class="custom-data-area">' + JSON.stringify(data, null, "\t") + '</textarea>');
    }
    /**
     * Section Dom을 생성한다.
     * @param data
     * @returns {*}
     */
    function getSectionBlockDom(data) {

        var blockDom = getBlockDom(data, true);
        if (blockDom == null) {
            return;
        }

        var section = blockDom.addClass('section');
        return section;
    }

    var DATA_TYPE = {
        SUMMARY_RESULT_BY_REFERENCE: "SUMMARY_RESULT_BY_REFERENCE",
        // 아래의 블럭은 삭제됨. 데이터가 있을 경우 보여주지 않음.
        DETAIL_REFERENCE: "DETAIL_REFERENCE",
        DETAIL_SCAN_RESULT: "DETAIL_SCAN_RESULT",
        CUSTOM_DATA: "CUSTOM_DATA",
    };

    /**
     * BlockDom을 생성 한다.
     * @param data
     * @returns {*|jQuery}
     */
    function getBlockDom(data, isSection) {

        if (data.hasOwnProperty('blocks') && data.blocks.length == 0) {
            return null;
        } else if (data.hasOwnProperty('data') && data.data.length == 0) {
            return null;
        }

        var $block = $('<li></li>').addClass('block');
        var $blockTitle = $('<div class="block-title">');
        var $blockBody = $('<div class="block-body">');
        var tDragIcon = $('<i class="drag-icon fa fa-bars"></i>');
        var $subTitle = $('<span class="sub-title"></span>');
        var $customDataBtn = "";
        var $customDataDeleteBtn = "";
        var $visibleSwitch = getVisibleSwitchDom(data);
        var $collapseDom = '';
        var $childBlockDom = '';
        var $dragIcon = '';
        if (data.hasOwnProperty('blocks') && data.blocks.length > 0) {
            var collapseId = getRandomId();
            $collapseDom = getCollapseDom(data, collapseId).attr('aria-expanded', true);
            $childBlockDom = tSortableDom.clone().attr('id', collapseId).addClass('collapse in');
            for (var i in data.blocks) {
                var $childBlock = getBlockDom(data.blocks[i], false);
                $childBlockDom.append($childBlock);
            }
        } else if (data.hasOwnProperty('data') && data.data.length > 0) {
            var $dataDom = '';
            console.log(data.dataType);
            switch (data.dataType) {
                case DATA_TYPE.SUMMARY_RESULT_BY_REFERENCE :
                    $dataDom = getResultByReferenceTable(data.data);
                    if ($dataDom == null) {
                        return;
                    }
                    break;
                case DATA_TYPE.DETAIL_REFERENCE :
                    //$dataDom = getDetailReferenceSelect(data.data);
                    // 해당 데이터는 삭제 되었음. 보여주지 않음.
                    //break;
                    return;
                case DATA_TYPE.DETAIL_SCAN_RESULT :
                    $dataDom = getDetailScanResult(data.data, data.visible);
                    // 상세 결과의 간략 보기 ON 설정시, 의견, 소스코드는 강제 OFF 처리 하도록 한다.
                    // 다시 OFF 로 설정시, OFF 이전의 설정값으로 설정한다.
                    $dataDom.attr('source', $dataDom.find('[dataId="source"]').value);
                    $dataDom.attr('comment', $dataDom.find('[dataId="comment"]').value);

                    $dataDom.find('[dataId="simple.view"]').change(
                        function(e) {
                            if(this.checked){
                                $dataDom.find('[dataId="source"]').bootstrapToggle('disable');
                                $dataDom.find('[dataId="comment"]').bootstrapToggle('disable');
                            }
                            else {
                                $dataDom.find('[dataId="source"]').bootstrapToggle('enable');
                                $dataDom.find('[dataId="comment"]').bootstrapToggle('enable');
                            }
                        }
                        );
                    break;
                default:
                    break;
            }
            var collapseId = getRandomId();
            $collapseDom = getCollapseDom(data, collapseId);
            $childBlockDom = tSortableDom.clone().attr('id', collapseId).addClass('collapse').data('blockData', data);
            $childBlockDom.append($dataDom);
        } else if(data.dataType === DATA_TYPE.CUSTOM_DATA) {
            var $dataDom = getAddCustomDataDom(data.customData);
            var collapseId = getRandomId();
            $collapseDom = getEditableCollapseDom(data, collapseId);
            $childBlockDom = tSortableDom.clone().attr('id', collapseId).addClass('collapse').data('blockData', data);
            $childBlockDom.append($dataDom);
            $customDataDeleteBtn = getDeleteCustomDataBtn();
        } else {
            $collapseDom = messageController.get(data.titleCode);
        }

        if (data.hasOwnProperty('draggable') && data.draggable)
            $dragIcon = tDragIcon.clone();

        // 항목 추가 버튼은 여기를 주석 처리 하면 보이지 않는다.
        if(enableAddItem && isSection && data.type !== "DETAIL" && data.type !== "REFERENCE")
            $customDataBtn = getAddCustomBtn(data);

        $block.append(
            $blockTitle.append(
                $dragIcon
            ).append(
                $collapseDom
            ).append(
                $subTitle
            ).append(
                $visibleSwitch
            ).append(
                $customDataBtn
            ).append(
                $customDataDeleteBtn
            )
        ).append(
            $blockBody.append(
                $childBlockDom
            )
        ).data('blockData',data);

        // 데이터 컨트롤을 위한 블럭 설정.
        // 화면에 보이지는 않지만 데이터 컨트롤을 위해 설정되는 블럭.
        if (data.hasOwnProperty('hidden') && data.hidden)
            $block.addClass('hidden');

        return $block;
    }

    /**
     * 상세결과 - 검출 결과 테이블을 반환.
     * @param data
     * @returns {*}
     */
    function getDetailScanResult(data) {
        return getTable({
            map: {
                "simple.view": messageController.get('label.simple.view') + ' ' +
                    '<i class="fa fa-exclamation-circle" data-toggle="tooltip" data-container="body" data-placement="right" title="" ' +
                    'data-original-title="' + messageController.get('info.report.simple.view.description') + '"></i>',
                "comment": messageController.get('label.comment.2'),
                "source": messageController.get('label.source.code')
            },
            data: data,
            header: [
                messageController.get('label.feature'),
                messageController.get('label.show')
            ]
        });
    }

    /**
     * 레퍼런스별 진단 결과 테이블 반환
     * @param data
     * @returns {*}
     */
    function getResultByReferenceTable(data) {
        return getTable({
            map: complianceMap,
            data: data,
            header: [
                messageController.get('label.reference'),
                messageController.get('label.show')
            ]
        });
    }

    /**
     * 테이블을 만들어 반환 한다.
     * @param tableData
     */
    function getTable(tableData) {
        var tTable = $('<table name="table01" class="customTable dataTable nowrap" width="100%"></table>');
        var map = tableData.map;
        var data = tableData.data;
        var header = tableData.header;

        var $rows = [];
        for (var i in data) {

            if (map[data[i].id] == null) {
                continue;
            }

            $rows.push(
                $('<tr role="row"></tr>').addClass(i % 2 == 0 ? 'odd' : 'even').append(
                    $('<td class="dt-body-left"></td>').append(map[data[i].id]).data(data[i])
                ).append(
                    $('<td class="dt-body-right">').append(getVisibleSwitchDom(data[i]))
                )
            );
        }
        if ($rows.length == 0) {
            return;
        }
        return tTable.append(
            $('<thead></thead>').append(
                $('<tr></tr>').append(
                    $('<th class="dt-head-left"></th>').append(header[0])
                ).append(
                    $('<th class="dt-head-center switch-column"></th>').append(header[1])
                )
            )
        ).append(
            $('<tbody></tbody>').append($rows)
        )
    }

    /**
     * Collapse Dom을 생성하여 반환.
     * @param data
     * @param collapseId
     */
    function getCollapseDom(data, collapseId) {
        var tCollapseA = $('<a role="button" class="block-title-text" data-toggle="collapse" data-target=""></a>');
        var tCollapseIcon = $('<i class="collapse-icon fa fa-angle-down" aria-hidden="true"></i>');
        var title = data.titleCode ? messageController.get(data.titleCode) : data.headerText;
        return tCollapseA.text(title).attr('data-target', '#' + collapseId).append(tCollapseIcon)
    }

    /**
     * 타이틀 수정 가능한 Collapse Dom을 생성하여 반환.
     * @param data
     * @param collapseId
     */
    function getEditableCollapseDom(data, collapseId) {
        var tCollapseA = $('<a role="button" class="block-title-text" data-toggle="collapse" data-target=""></a>');
        var tCollapseIcon = $('<i class="collapse-icon fa fa-angle-down" aria-hidden="true"></i>');
        var title = data.titleCode ? messageController.get(data.titleCode) : data.headerText;
        //title = title.replace("<", "&lt;").replace(">", "&gt;");
        var tToolTip = $('<i class="fa fa-exclamation-circle" data-toggle="tooltip" style="color: #252525" data-placement="right" ' +
            'title="" data-original-title="' + messageController.get('info.report.template.custom.description') + '"></i>');
        var tText = $('<span class="custom-name-label" name="customNameLabel"></span>').text(title);
        var tHiddenText = $('<input type="text" class="hidden" name="customNameText">').val(title);

        tText.bind('click', function() {
            $(this).addClass('hidden')
            $(this).parent().find('[name=customNameText]').removeClass('hidden');
            $(this).parent().find('[name=customNameText]').focus();
            event.stopPropagation()
        });
        tHiddenText.bind('click', function() {event.stopPropagation()});
        tHiddenText.bind('focusout', function() {
            var newTitle = $(this).val();
            console.log('focus out newTitle : ' + newTitle);
            $(this).parent().find('[name=customNameLabel]').text(newTitle);
            $(this).closest('.block').data('blockData').headerText = newTitle;
            $(this).addClass('hidden');
            $(this).parent().find('[name=customNameLabel]').removeClass('hidden');
            event.stopPropagation();
        });

        return tCollapseA
            .append(tToolTip)
            .append('&nbsp;')
            .append(tText)
            .append(tHiddenText).attr('data-target', '#' + collapseId)
            .append(tCollapseIcon);
    }

    /**
     * 보임/안보임 스위치 DOM 반환.
     * @param data
     * @returns {void|jQuery|HTMLElement}
     */
    function getVisibleSwitchDom(data) {
        var tVisibleSwitchDiv = $('<div class="block-visible"></div>');
        var tVisibleSwitch = $('<input type="checkbox" name="visibleSwitch" data-toggle="toggle" data-width="60" data-height="20" data-on="' +
            messageController.get("label.on") + '" data-off="' + messageController.get("label.off") + '">');

        var $dom = $('');
        if (data.hasOwnProperty('visible')) {
            $dom = tVisibleSwitchDiv.append(
                tVisibleSwitch.attr('checked', data.visible).attr('dataId', data.id)
            )
        }

        return $dom;
    }

    function getDeleteCustomDataBtn(data) {
        var tAddCustomDataDiv = $('<div class="custom-data pull-right"></div>');
        var tDeleteBtn = $('<button class="btn btn-primary custom-data-btn"name="deleteBtn">'+
            messageController.get('label.delete') +'</button>');
        tAddCustomDataDiv.append(tDeleteBtn);

        tDeleteBtn.bind('click',function(event) {
            $(event.target).closest('.block').remove();
        });

        return tAddCustomDataDiv;
    }
    /**
     * Cumsom데이터 추가 버튼 DOM 반환.
     * @param data
     * @returns {*|jQuery}
     */
    function getAddCustomBtn(data) {
        var tAddCustomDataDiv = $('<div class="custom-data pull-right"></div>');
        var tBtnAddCustomDataDiv = $('<button class="btn btn-primary custom-data-btn"></button>');
        tBtnAddCustomDataDiv.append($('<i class="fa fa-plus "></i><span> ' + messageController.get('label.add') + '</span>'));
        tBtnAddCustomDataDiv.bind('click', function(event){
            var data = {
                "handler":"CUSTOM_DATA",
                "dataType":"CUSTOM_DATA",
                "headerText":"CUSTOM",
                "indexing":true,
                "visible":true,
                "draggable":true,
                "customData": {
                    "title": "Sample added block",
                    "type": "text",
                    "data": "This is sample added block. You can edit title and data."
                }
            };
            $($(this).closest('.section')).find('>.block-body>ul').append(getBlockDom(data, false));

            // 토글 버튼 초기화.
            initToggleBtn();
            // 드래그 기능 초기화.
            initDragable();
        })
        return tAddCustomDataDiv.append(tBtnAddCustomDataDiv);
    }
    /**
     * Dom collapse 처리용 random ID 발급
     * @returns {*}
     */
    function getRandomId() {
        function guid() {
            function s4() {
                return Math.floor((1 + Math.random()) * 0x10000)
                    .toString(16)
                    .substring(1);
            }
            return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
        }
        return guid();
    }

    /**
     * 드래그 기능 초기화.
     * DOM 초기화 및 업데이트 완료후에 이벤트 처리.
     */
    function initDragable() {
        $designBox.find(".box-body .sortable").sortable({
            revert: true,
            axis: "y",
            placeholder: "design-box-placeholder",
            handle: ".block-title .drag-icon",
            start: function (event, ui) {
                var $element = $(event.toElement);
                var height = $element.outerHeight();
                if ($element.hasClass('drag-icon')) {
                    height = $element.closest(".block").outerHeight();
                }
                $('.design-box-placeholder').height(height);
            },
            update: function (event, ui) {
                //showReportTemplate();
            }
        });
        //$("ul, li").disableSelection();

    }


    /***************************************************************************
     * 초기화
     **************************************************************************/
    /**
     * 보고서 초기화.
     * templateId가 0인 경우 신규 템플릿을 가져온다.
     */
    function init() {
        var templateId = window.url('4', window.location.href);
        // $designBoxBody.slimScroll({
        //     /*scrollTo:'0px',*/
        //     height: '558px',
        //     overflow: 'hidden',
        //     alwaysVisible: false
        // });

        console.log(templateId);
        if (templateId != 0) {
            loadReportTemplates(templateId);
        } else {
            $settingBoxRptTypeSelect.val("ISSUE").trigger('change', true);
        };
    }

    /**
     * 보고서 템플릿 로드.
     * @param templateId
     */
    function loadReportTemplates(templateId) {
        // 보고서 템플릿
        $.ajaxRest({
            url: "/api/1/report/templates/" + templateId,
            type: "GET",
            success: function (data, textStatus, jqXHR) {
                $settingBox.find("[name=name]").val(data.name);
                $settingBoxRptTypeSelect.val(data.reportType).trigger('change', false);
                $settingBox.find("[name=description]").val(data.description);
                initLayoutDesignBox(data);
                console.log(data);
                //$settingBoxRptTypeSelect.select2Controller({data : data});
            }
        });
    }

    // 컴포넌트 초기화.
    loadComponent();

    // 모든 컴포넌트 초기화 완료후 로딩 되도록 한다.
    function delayLoad() {
        if (loadingComponentCnt == 0)
            init();
        else
            setTimeout(delayLoad, 200);
    }

    // 모든 컴포넌트 초기화 완료후 로딩 되도록 한다.
    delayLoad();

});