$(function() {

    var $modalAddAuthServer = $("#modalAddAuthServer");
    var $modalModifyAuthServer = $("#modalModifyAuthServer");

    var $buttonGroupDataTableAuthServers = $("#buttonGroupDataTableAuthServers");

    /***************************************************************************
     * 공통 함수
     ***************************************************************************/
    // 연결 테스트
    function checkHealth($modal) {

        var requestBody = {};
        requestBody.authServerId = $modal.find('[name=authServerId]').val();
        requestBody.typeCode = $modal.find(':radio[name=typeCode]:checked').val();
        requestBody.url = $modal.find('[name=url]').val();
        requestBody.accountName = $modal.find('[name=accountName]').val();
        if ($modal.find('[name=chkChangePassword]').prop('checked') != false) {
            requestBody.accountPassword = $modal.find('[name=accountPassword]').val();
        }
        requestBody.connectTimeout = $modal.find('[name=connectTimeout]').val();

        if (requestBody.typeCode == "LDAP") {
            // LDAP일 경우
            requestBody.baseDn = $modal.find('[name=baseDn]').val();
        }

        $.ajaxRest({
            url : "/api/1/auth/servers/health",
            type : "POST",
            data : requestBody,
            beforeSend : function(xhr, settings) {
                errorMsgHandler.clear($modal);
            },
            success : function (data, textStatus, jqXHR) {
                swal({
                    title: messageController.get('400043'),
                    type: "success",
                    closeOnCancel: true
                });
            },
            error : function(hdr, status) {
                errorMsgHandler.show($modal, hdr.responseText);
            }
        });
    }

    // 인증 구분 변경
    function changeAuthType($modal, typeCode) {
        $modal.find('[data-auth-type-code]').hide();
        $modal.find('[data-auth-type-code=' + typeCode + ']').show();

        if (typeCode == 'LDAP') {
            $modal.find('[name=accountName]').parent().parent().removeClass("required")
            $modal.find('[name=accountPassword]').parent().parent().removeClass("required")
            $modal.find('[name=url]').attr("placeholder", 'ldap://127.0.0.1:389');
        } else {
            $modal.find('[name=accountName]').parent().parent().addClass("required")
            $modal.find('[name=accountPassword]').parent().parent().addClass("required")
            $modal.find('[name=url]').attr("placeholder", 'http://127.0.0.1');
        }
    }
    changeAuthType($modalAddAuthServer, $modalAddAuthServer.find('[name=typeCode]:checked').val());
    changeAuthType($modalModifyAuthServer, $modalModifyAuthServer.find('[name=typeCode]:checked').val());



    /***************************************************************************
     * 테이블 버튼
     ***************************************************************************/
    $buttonGroupDataTableAuthServers.find("[name=btnDeleteBatch]").on('click', function(e) {
        var selectedIds = $dataTableAuthServers.getSelectedIds('authServerId');
        if (selectedIds.length == 0) {
            swal(messageController.get('400025'));
            return;
        }

        var requestBody = {};
        requestBody.ids = selectedIds;

        swalDelete({
            url: "/api/1/auth/servers",
            dataTable: $dataTableAuthServers,
            requestBody: requestBody
        });
    });

    /***************************************************************************
     * 테이블 표시
     ***************************************************************************/
    var $dataTableAuthServers = $("#dataTableAuthServers").dataTableController({
        url : "/api/1/auth/servers",
        buttonGroupId: "buttonGroupDataTableAuthServers",
        order : [ [ 2, 'desc' ] ],
        columnDefs: [{
            targets:   0,
            orderable: false,
            className: 'select-checkbox',
            defaultContent: ""
        }, {
            targets: 1, // ID
            visible: false,
            data: "authServerId",
            render : $.fn.dataTable.render.text()
        }, {
            targets : 2, // 이름
            data: "authServerName",
            render : $.fn.dataTable.render.text()
        }, {
            targets : 3, // 타입
            data: 'typeCode',
            render : $.fn.dataTable.render.text()
        }, {
            targets : 4, // 호스트
            data: 'url',
            render : $.fn.dataTable.render.text()
        }, {
            targets : 5, // 사용자
            data : "userCount",
            className : "dt-head-right",
            render : $.fn.dataTable.render.text()
        }, {
            targets : 6,
            orderable : false,
            className : "extend-button",
            width: '60px',
            render: function(data, type, row, meta) {
                var html = '<span class="btn-modify" style="margin: 0 10px;" data-name="btnModify"><i class="fa fa-pencil-square-o active-hover" aria-hidden="true"></i></span>';
                html += '<span class="btn-delete" style="margin-right:10px;" data-name="btnDelete"><i class="fa fa-trash active-hover" aria-hidden="true"></i></span>';
                return html;
            }
        }],
        createdRow: function(row, data, index) {
            var $row = $(row);

            // 수정 모달 열기
            $row.on('click', function(e) {
                if(e.target.className.indexOf('select-checkbox') == -1
                    && e.target.className.indexOf('extend-button') == -1) {
                    openModalModifyAuthServer(data.authServerId);
                }
            });

            // 수정
            $row.find("[data-name=btnModify]").on("click", function(e) {
                openModalModifyAuthServer(data.authServerId);
                e.stopPropagation();
            });

            // 삭제
            $row.find("[data-name=btnDelete]").on("click", function(e) {
                swalDelete({
                    url: "/api/1/auth/servers/" + data.authServerId,
                    dataTable: $dataTableAuthServers
                });
                e.stopPropagation();
            });
        }
    });

    // 데이터 테이블의 선택/선택해제 이벤트 리스너.
    $dataTableAuthServers.DataTable().on('select', function(e, dt, type, indexes) {
        changeButtonText();
    }).on('deselect', function(e, dt, type, indexes) {
        changeButtonText();
    });

    /**
     * 2개 이상의 ROW가 선택된 경우, 일괄삭제, 일괄수정으로 텍스트 변경.
     * 1개 이하의 ROW가 선택된 경우, 삭제, 수정으로 텍스트 변경.
     */
    function changeButtonText() {
        if($dataTableAuthServers.getSelectedIds().length > 1){
            $buttonGroupDataTableAuthServers.find('[name=btnDeleteBatch]').find('.btn-name').text(messageController.get("label.batch.delete"));
        } else {
            $buttonGroupDataTableAuthServers.find('[name=btnDeleteBatch]').find('.btn-name').text(messageController.get("label.delete"));
        }
    }

    /***************************************************************************
     * 추가 모달
     ***************************************************************************/
    $modalAddAuthServer.find('[name=typeCode]').on("change", function(){}, function() {
        changeAuthType($modalAddAuthServer, $(this).val());
    });

    // 모달창 클리어
    function clearModalAddAuthServer() {
        $modalAddAuthServer.find('[name=authServerName]').val("");
        $modalAddAuthServer.find('[name=url]').val("");
        $modalAddAuthServer.find('[name=typeCode]:checked').parent().trigger('click');
        $modalAddAuthServer.find('[name=accountName]').val("");
        $modalAddAuthServer.find('[name=accountPassword]').val("");
        $modalAddAuthServer.find('[name=connectTimeout]').val("");
        $modalAddAuthServer.find("[name=autoAddUserYn]").bootstrapToggle('on');
        $modalAddAuthServer.find("[name=autoLoginYn]").bootstrapToggle('on');

        // LDAP
        $modalAddAuthServer.find('[name=baseDn]').val("");
        $modalAddAuthServer.find('[name=attributeId]').val("");
        $modalAddAuthServer.find('[name=attributeFirstname]').val("");
        $modalAddAuthServer.find('[name=attributeLastname]').val("");
        $modalAddAuthServer.find('[name=attributeEmail]').val("");
    }

    $modalAddAuthServer.find('[name=btnHealth]').on('click', function(e) {
        checkHealth($modalAddAuthServer);
    });

    // 추가 버튼
    $modalAddAuthServer.find('[name=btnSave]').on('click', function() {
          var requestBody = {};
          requestBody.authServerName = $modalAddAuthServer.find('[name=authServerName]').val();
          requestBody.url = $modalAddAuthServer.find('[name=url]').val();
          requestBody.typeCode = $modalAddAuthServer.find('[name=typeCode]:checked').val();
          requestBody.accountName = $modalAddAuthServer.find('[name=accountName]').val();
          requestBody.accountPassword = $modalAddAuthServer.find('[name=accountPassword]').val();
          requestBody.connectTimeout = $modalAddAuthServer.find('[name=connectTimeout]').val();
          requestBody.autoAddUserYn = $modalAddAuthServer.find("[name=autoAddUserYn]").prop('checked') ? "Y" : "N";

          if (requestBody.typeCode == "Crowd") {
              requestBody.autoLoginYn = $modalAddAuthServer.find("[name=autoLoginYn]").prop('checked') ? "Y" : "N";
          } else if (requestBody.typeCode == "LDAP") {
              // LDAP일 경우
              requestBody.baseDn = $modalAddAuthServer.find('[name=baseDn]').val();
              requestBody.attributeId = $modalAddAuthServer.find('[name=attributeId]').val();
              requestBody.attributeFirstname = $modalAddAuthServer.find('[name=attributeFirstname]').val();
              requestBody.attributeLastname = $modalAddAuthServer.find('[name=attributeLastname]').val();
              requestBody.attributeEmail = $modalAddAuthServer.find('[name=attributeEmail]').val();
          }

          $.ajaxRest({
              url: "/api/1/auth/servers/0",
              type: "POST",
              data: requestBody,
              block: true,
              beforeSend : function(xhr, settings) {
                  errorMsgHandler.clear($modalAddAuthServer);
              },
              success : function (data, textStatus, jqXHR) {
                  $modalAddAuthServer.modal('hide');
                  clearModalAddAuthServer();
                  $dataTableAuthServers.draw();

                  $.toastGreen({
                      text: messageController.get("label.authentication.mode") + ' ' + data.authServerName + ' ' + messageController.get("label.has.been.added")
                  });
              },
              error : function(hdr, status) {
                  errorMsgHandler.show($modalAddAuthServer, hdr.responseText);
              }
          });
    });


    /***************************************************************************
     * 수정 모달
     ***************************************************************************/
    $modalModifyAuthServer.find('[name=typeCode]').on("change", function() {
        changeAuthType($modalModifyAuthServer, $(this).val());
    });

    $modalModifyAuthServer.find('[name=chkChangePassword]').on("change", function() {
        var disabled = $(this).prop('checked') == false;
        $modalModifyAuthServer.find('[name=accountPassword]').attr('disabled', disabled);
    });

    function openModalModifyAuthServer(authServerId) {
        $.ajaxRest({
            url: "/api/1/auth/servers/" + authServerId,
            type: "GET",
            beforeSend: function(xhr, settings) {
                errorMsgHandler.clear($modalModifyAuthServer);
            },
            success: function(data, textStatus, header) {
                $modalModifyAuthServer.find('[name=authServerId]').val(data.authServerId);
                $modalModifyAuthServer.find('#txtAuthServerId').text(data.authServerId);
                $modalModifyAuthServer.find('[name=authServerName]').val(data.authServerName);
                $modalModifyAuthServer.find('[name=typeCode][value=' + data.typeCode + ']').parent().trigger('click');
                $modalModifyAuthServer.find('[name=url]').val(data.url);
                $modalModifyAuthServer.find('[name=accountName]').val(data.accountName);
                $modalModifyAuthServer.find('[name=accountPassword]').val("");
                $modalModifyAuthServer.find('[name=connectTimeout]').val(data.connectTimeout);
                var $autoAddUserYn = $modalModifyAuthServer.find("[name=autoAddUserYn]");
                if (data.autoAddUserYn == "Y") {
                    $autoAddUserYn.bootstrapToggle('on');
                } else {
                    $autoAddUserYn.bootstrapToggle('off');
                }

                if (data.typeCode == "Crowd") {
                    var $autoLoginYn = $modalModifyAuthServer.find("[name=autoLoginYn]");
                    if (data.autoLoginYn == "Y") {
                        $autoLoginYn.bootstrapToggle('on');
                    } else {
                        $autoLoginYn.bootstrapToggle('off');
                    }
                } else if (data.typeCode == "LDAP") {
                    // LDAP일 경우
                    $modalModifyAuthServer.find('[name=baseDn]').val(data.baseDn);
                    $modalModifyAuthServer.find('[name=attributeId]').val(data.attributeId);
                    $modalModifyAuthServer.find('[name=attributeFirstname]').val(data.attributeFirstname);
                    $modalModifyAuthServer.find('[name=attributeLastname]').val(data.attributeLastname);
                    $modalModifyAuthServer.find('[name=attributeEmail]').val(data.attributeEmail);
                }

                $modalModifyAuthServer.modal('show');
            }
        });
    }

    $modalModifyAuthServer.find('[name=btnHealth]').on('click', function(e) {
        checkHealth($modalModifyAuthServer);
    });

    // 수정 버튼
    $modalModifyAuthServer.find('[name=btnModify]').on('click', function(e) {

        var requestBody = {};
        requestBody.authServerId = $modalModifyAuthServer.find('[name=authServerId]').val();
        requestBody.authServerName = $modalModifyAuthServer.find('[name=authServerName]').val();
        requestBody.typeCode = $modalModifyAuthServer.find(':radio[name=typeCode]:checked').val();
        requestBody.url = $modalModifyAuthServer.find('[name=url]').val();
        requestBody.accountName = $modalModifyAuthServer.find('[name=accountName]').val();
        if ($modalModifyAuthServer.find('[name=chkChangePassword]').prop('checked') == true) {
            requestBody.accountPassword = $modalModifyAuthServer.find('[name=accountPassword]').val();
        }
        requestBody.connectTimeout = $modalModifyAuthServer.find('[name=connectTimeout]').val();
        requestBody.autoAddUserYn = $modalModifyAuthServer.find("[name=autoAddUserYn]").prop('checked') ? "Y" : "N";

        if (requestBody.typeCode == "Crowd") {
            requestBody.autoLoginYn = $modalModifyAuthServer.find("[name=autoLoginYn]").prop('checked') ? "Y" : "N";
        } else if (requestBody.typeCode == "LDAP") {
            // LDAP일 경우
            requestBody.baseDn = $modalModifyAuthServer.find('[name=baseDn]').val();
            requestBody.attributeId = $modalModifyAuthServer.find('[name=attributeId]').val();
            requestBody.attributeFirstname = $modalModifyAuthServer.find('[name=attributeFirstname]').val();
            requestBody.attributeLastname = $modalModifyAuthServer.find('[name=attributeLastname]').val();
            requestBody.attributeEmail = $modalModifyAuthServer.find('[name=attributeEmail]').val();
        }

         $.ajaxRest({
             url: "/api/1/auth/servers/" + requestBody.authServerId,
             type: "PUT",
             data: requestBody,
             block: true,
             beforeSend: function(xhr, settings) {
                 errorMsgHandler.clear($modalModifyAuthServer);
             },
             success: function (data, textStatus, jqXHR) {
                 $modalModifyAuthServer.modal('hide');
                 $dataTableAuthServers.draw();

                 $.toastGreen({
                     text: messageController.get("label.authentication.mode") + ' ' + data.authServerName + ' ' + messageController.get("label.has.been.modified")
                 });
             },
             error: function(hdr, status) {
                 errorMsgHandler.show($modalModifyAuthServer, hdr.responseText);
             }
         });
    });
});
