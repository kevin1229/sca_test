/**
 * 로그인 사용자 정보 제어
 *
 * @author kimkc
 */
var SessionUserController = (function() {

    var storageKey = "SessionUser";

    function SessionUserController() {
    }

    SessionUserController.prototype = {
        // 세션으로 부터 사용자 정보를 가져와 WebStorage에 넣는다.
        reload: function() {
            webStorage.remove(storageKey);
            $.ajaxRest({
                url : "/api/1/session/user",
                type : "GET",
                async : false,
                success : function(data, textStatus, header) {
                    data.userId = data.userId.escapeHTML();
                    data.userName = data.userName.escapeHTML();
                    webStorage.set(storageKey, data);
                },
                error : function(hdr, status) {
                    location.href = "/login";
                }
            });
        },
        // WebStorage로 부터 사용자 정보를 가져온다.
        getUser: function() {
            var ret = webStorage.get(storageKey);
            if (ret == null || ret == "") {
                this.reload();
                ret = webStorage.get(storageKey);
            }
            return ret;
        },
        isAdmin: function() {
            var admin = false;
            $.each(sessionUserController.getUser().userRoles, function(index, value) {
                if (value.userRoleName == "ROLE_ADMIN") {
                    admin = true;
                    return;
                }
            });
            return admin;
        },
        setPersonalIssueGroupId: function(issueGroupId) {
            this._setPersonal("issueGroupId", issueGroupId);
        },
        setPersonalPageStartUrl: function(pageStartUrl) {
            this._setPersonal("pageStartUrl", pageStartUrl);
        },
        setPersonalIssueActiveSuggestion: function(issueActiveSuggestion) {
            this._setPersonal("issueActiveSuggestion", issueActiveSuggestion);
        },
        setPersonalIssueSourceLinkMethod: function(issueSourceLinkMethod) {
            this._setPersonal("issueSourceLinkMethod", issueSourceLinkMethod);
        },
        setPersonalIssueSourceTheme: function(issueSourceTheme) {
            this._setPersonal("issueSourceTheme", issueSourceTheme);
        },
        setPersonalIssueSourceFontSize: function(issueSourceFontSize) {
            this._setPersonal("issueSourceFontSize", issueSourceFontSize);
        },
        setPersonalIssueSourceBranch: function(issueSourceBranch) {
            this._setPersonal("issueSourceBranch", issueSourceBranch);
        },
        _setPersonal: function(key, value) {
            var requestBody = {};
            requestBody.personalDisplay = {};
            requestBody.personalDisplay[key] = value;
            $.ajaxRest({
                url : "/api/1/account/personal",
                type : "PUT",
                data : requestBody,
                async : false,
                success: function(data) {
                    sessionUserController.reload();
                }
            });
        },
        clear: function() {
            webStorage.remove(storageKey);
        }
    }

    return SessionUserController;

})();

sessionUserController = new SessionUserController();
