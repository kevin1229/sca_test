$(function() {

    var $formPassword = $("#formPassword");

    // 비밀번호 보이기
    $formPassword.find('[name=showPassword]').on('change', function(e) {
        if($(this).prop('checked')){
            $formPassword.find('[name=password1]').attr('type','text');
            $formPassword.find('[name=password2]').prop('disabled',true);
        } else {
            $formPassword.find('[name=password1]').attr('type','password');
            $formPassword.find('[name=password2]').prop('disabled',false);
        }
    });

    // 비밀번호 수정하기
    $formPassword.find('[name=btnSave]').on('click', function(e) {
         var requestBody = {};
         requestBody.password = $formPassword.find('[name=password]').val();
         requestBody.password1 = $formPassword.find('[name=password1]').val();

         // password2의 경우 패스워드 보이기의 경우 password1의 내용으로 대체한다.
         if($formPassword.find('[name=password2]').prop('disabled') == true) {
             requestBody.password2 = $formPassword.find('[name=password1]').val();
         } else {
             requestBody.password2 = $formPassword.find('[name=password2]').val();
         }

         $.ajaxRest({
             url : "/api/1/account/password",
             type : "PUT",
             data : requestBody,
             block: true,
             beforeSend : function(xhr, settings) {
                 errorMsgHandler.clear($formPassword);
             },
             success : function(data, textStatus, header) {
                 $.toastGreen({
                     text: messageController.get("label.password") + ' ' + messageController.get("label.has.been.modified")
                 });
             },
             error : function(hdr, status) {
                 errorMsgHandler.show($formPassword, hdr.responseText);
             }
         });
    });
});
