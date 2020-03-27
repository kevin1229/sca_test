var WebStorage = (function(){

    function WebStorage(){
    }

    WebStorage.prototype.get = function(key, defaultValue) {
        var value = localStorage.getItem(key);
        if (value == null) {
            return defaultValue;
        }
        if (value[0] === "{" || value[0] === "[") {
            value = JSON.parse(value);
        }
        return value;
    }

    WebStorage.prototype.isBoolean = function(key, defaultValue) {
        return (this.get(key, defaultValue) == "true");
    }

    WebStorage.prototype.set = function(key, value) {
        if (key == false || value == false) {
            return;
        }
        if (typeof value === "object") {
          value = JSON.stringify(value);
        }
        window.localStorage.setItem(key, value);
    }

    WebStorage.prototype.remove = function(key) {
        window.localStorage.removeItem(key);
    }

    return WebStorage;
})();

var webStorage = new WebStorage();
