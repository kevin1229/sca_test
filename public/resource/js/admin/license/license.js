
$(function() {

    var $tabInfo = $("#tabInfo");
    var $tabLienceClients = $("#tabLienceClients");
    var $modalLicense = $("#modalLicense");

    /***********************************************************************
     * 초기 탭 설정
     ***********************************************************************/
    initTab("info");

    /***************************************************************************
     * 공통
     ***************************************************************************/
    function showInfo() {
        $.ajaxRest({
            url : "/api/1/license",
            type : "GET",
            success : function(data, textStatus, header) {

                // 라이선스
                var maxScanCount = data.scancnt;
                if (maxScanCount == 0) {
                    maxScanCount = data.remainScans;
                }
                $tabInfo.find('#descLicenes').html(messageController.get('402220', data.dateTo));
                $tabInfo.find(".info-body").html($("#tplInfo").clone().html().compose({
                    'systemId' : data.systemId,
                    'dateFrom': data.dateFrom,
                    'dateTo': data.dateTo,
                    'maxLine': data.maxLine.format(),
                    'users': data.users,
                    'clients': data.clients,
                    'remainUsers' : data.remainUsers,
                    'remainClients' : data.remainClients,
                    'scancnt' : maxScanCount,
                    'remainScans' : data.remainScans
                }));
                $tabInfo.removeClass("hide");


                // 클라이언트 관리
                $tabLienceClients.find('#descLienceClients1').html(messageController.get('info.license.4', data.clients, data.remainClients));
                $tabLienceClients.find('#descLienceClients2').html(messageController.get('info.license.5', momentController.timestampFormat(data.allDeleteDateTime, 'YYYY-MM-DD'), momentController.timestampFormat(data.allDeletableDatetime, 'YYYY-MM-DD')));
                $tabLienceClients.find("#btnInitLience").attr("disabled", data.allDeletable == false);

                // 모달
                $modalLicense.find("#systemId").text(data.systemId);
            },
            error : function(hdr, status) {
                errorMsgHandler.swal(hdr.responseText);
            }
        });
    }

    /***************************************************************************
     * 라이선스
     ***************************************************************************/
    showInfo();

    $('#btnModifyLicense').on("click", function() {
        $modalLicense.modal('show');
        $modalLicense.find('.cmd-mode').hide();
        $modalLicense.find('.cmd-mode.license-mod').show();
    });

    /***************************************************************************
     * 클라이언트
     **************************************************************************/
    // 초기화
    $tabLienceClients.find("#btnInitLience").on('click', function(e) {
        swal({
          title: messageController.get("402209"), // 앞으로 30일간 라이선스 클라이언트를\n초기화할 수 없습니다.
          type: "warning",
          showCancelButton: true,
          confirmButtonText: messageController.get("label.clear"),
          cancelButtonText: messageController.get("label.cancel"),
          closeOnConfirm: false
        }, function(isConfirm) {
            if (isConfirm) {
                $.ajaxRest({
                    url : "/api/1/license/clients",
                    type : "DELETE",
                    success : function(data, textStatus, header) {
                        swal.closeModal();
                        $dataTableLicenseClients.draw();
                        showInfo();
                        $.toastGreen({
                            // 400016=초기화되었습니다.
                            text: messageController.get("400016")
                        });
                    },
                    error : function(hdr, status) {
                        errorMsgHandler.swal(hdr.responseText);
                    }
                });
            }
        });
    });

    var $dataTableLicenseClients = $('#dataTableLicenseClients').dataTableController({
        url : "/api/1/license/clients",
        buttonGroupId: "buttonGroupDataTableLicenseClients",
        columnDefs : [ {
            targets : 0,
            className: 'table-inner-fixed-width-md',
            data : "userId",
            defaultContent : ""
        }, {
            targets : 1,
            className: 'table-inner-fixed-width-md',
            data : "userName",
            defaultContent : ""
        }, {
            targets : 2,
            className: 'table-inner-fixed-width-md',
            data : "computer",
            defaultContent : ""
        }, {
            targets : 3,
            className: 'table-inner-fixed-width-md',
            data : "ipAddress",
            defaultContent : ""
        }]
    });
});
