
$.modalComplianceCount = {};

$(function() {

    var $modalComplianceCount = $('#modalComplianceCount');
    var $dataTableComplianceCheckerCount = null;

    $.modalComplianceCount.showModalComplianceInfo = function(checkerGroupId, checkerGroupName){

        // 체커 그룹명
        $modalComplianceCount.find("[data-name=checkerGroupName]").text(checkerGroupName);

        // 레퍼런스 - 컴플라이언스 전체 카운트는 최초 한번만 가져오도록 한다.
        if ($modalComplianceCount.find("[data-name=complianceCount]").text() == "") {
            $.ajaxRest({
                url: "/api/1/compliance/count",
                type: "GET",
                success : function (data, status, header) {
                    $modalComplianceCount.find("[data-name=complianceCount]").text(data);
                }
            });
        }

        // 활성화 체커 - 개수 표시
        $.ajaxRest({
            url: "/api/1/checkerGroups/" + checkerGroupId + "/checkers/count",
            type: "GET",
            success : function (data, status, header) {
                $modalComplianceCount.find("[data-name=checkerEnabledCount]").text(Number(data.enabledCount).format());
                $modalComplianceCount.find("[data-name=checkerAllCount]").text(Number(data.allCount).format());
            }
        });

        // 컴플라이언스 테이블
        $.ajaxRest({
            url: "/api/1/checkerGroups/" + checkerGroupId  + "/compliance/checkers/count",
            type: "GET",
            success : function (data, status, header) {

                // 레퍼런스 갯수
                var complianceEnabledCount = null;
                if (data.length == 0) {
                    complianceEnabledCount = "-";
                } else if (data.length == 1) {
                    complianceEnabledCount = data[0].complianceName;
                } else {
                    complianceEnabledCount = messageController.get("label.item.etc", data[0].complianceName, data.length);
                }
                $modalComplianceCount.find("[data-name=complianceEnabledCount]").text(complianceEnabledCount);

                // 레퍼런스 테이블
                if ($dataTableComplianceCheckerCount) {
                    $dataTableComplianceCheckerCount.destroy();
                }
                $dataTableComplianceCheckerCount = $("#dataTableComplianceCheckerCount").DataTable({
                    data: data,
                    processing : false,
                    serverSide : false,
                    paging : false,
                    info : false,
                    colReorder: false,
                    searching : false,
                    order : [
                        [1, 'desc'],
                        [2, 'desc'],
                        [0, 'asc']
                    ],
                    language : {
                        emptyTable : messageController.get('info.table.4')
                    },
                    columnDefs: [{
                        targets: 0,
                        data: "complianceName", // 레퍼런스
                        render : $.fn.dataTable.render.text()
                    }, {
                        targets : 1,
                        data: "enabledCheckerPercent", // 활성화 체커 비율
                        className: "dt-head-right",
                        render: function(data, type, row, meta) {
                            return data.toFixed(2) + '%';
                        }
                    }, {
                        targets : 2,
                        data: "enabledCheckerCount", // 활성화 체커수
                        className: "dt-head-right"
                    }, {
                        targets : 3,
                        data: "disabledCheckerCount", // 비활성화 체커수
                        className: "dt-head-right"
                    }, {
                        targets : 4,
                        data: "allCheckerCount", // 지원 체커수
                        className: "dt-head-right"
                    }]
                });

                $modalComplianceCount.modal('show');
            },
            error : function(hdr, status) {
                errorMsgHandler.swal(hdr.responseText);
            }
        });
    };
});