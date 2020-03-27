$(function() {

    var $formPassword = $("#formPassword");

    function goNextPage() {
        var nextUrl = $("#nextUrl").val();
        if(nextUrl == "")
            nextUrl = "/"
        location.href = nextUrl;
    }

    // 비밀번호 수정하기
    $formPassword.find("[name=btnSavePassword]").on("click", function(e){
         var requestBody = {};
         requestBody.password = $formPassword.find("[name=password]").val();
         requestBody.password1 = $formPassword.find("[name=password1]").val();
         requestBody.password2 = $formPassword.find("[name=password2]").val();

         $.ajaxRest({
             url: "/api/1/account/password",
             type: "PUT",
             data: requestBody,
             block: true,
             beforeSend: function(xhr, settings) {
                 errorMsgHandler.clear($formPassword);
             },
             success: function(data, textStatus, header) {
                 $.toastGreen({
                     text: messageController.get('400018')
                 });
                 goNextPage();
             },
             error: function(hdr, status) {
                 errorMsgHandler.show($formPassword, hdr.responseText);
             }
         });
    });

    // 다음에  변경하기
    $formPassword.find('[name=btnCancel]').on('click', function(e){
        goNextPage();
    });

});
