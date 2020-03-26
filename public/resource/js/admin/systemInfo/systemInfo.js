$(function() {
    /***************************************************************************
     * 화면 초기화
     ***************************************************************************/
    $.ajaxRest({
        url : "/api/1/system/info",
        type : "GET",
        success : function(data, textStatus, header) {

            var $boxSystemInfo = $('#boxSystemInfo');

            var info = {};
            $.each(data.sparrowInfo, function(index, _d){
                info[index] = _d;
            });
            $.each(data.serverInfo, function(index, _d){
                info[index] = _d;
            });
            $.each(data.systemStorage, function(index, _d){
                info[index] = _d;
            });
            $.each(data.dataCount, function(index, _d){
                info[index] = _d;
            });

            info.programUsableSpace = bytesToSize(info.programUsableSpace);
            info.programTotalSpace = bytesToSize(info.programTotalSpace);

            info.dataUsableSpace = bytesToSize(info.dataUsableSpace);
            info.dataTotalSpace = bytesToSize(info.dataTotalSpace);

            info.logUsableSpace = bytesToSize(info.logUsableSpace);
            info.logTotalSpace = bytesToSize(info.logTotalSpace);

            info.databaseUsableSpace = bytesToSize(info.databaseUsableSpace);
            info.databaseTotalSpace = bytesToSize(info.databaseTotalSpace);

            $.each(data.engineInfos, function (index, engineInfo) {
                var div = $('<div class="form-group">');
                div.append($('<div class="col-xs-3">').text(engineInfo.name));
                div.append($('<div class="col-xs-9">').text(engineInfo.version));
                $('#systemInfo_collapseEngineDetail').append(div);
            });

            info.osArchitecture = info.osArchitecture;
            info.totalMemory = bytesToSize(info.memory);
            info.usableMemory = bytesToSize(info.usableMemory);
            info.totalDiskSpace = bytesToSize(info.analysisTotalSpace);
            info.usableDiskSpace = bytesToSize(info.analysisFreeSpace);

            $boxSystemInfo.compose(info);
            $boxSystemInfo.show();
        }
    });

    function bytesToSize(bytes) {
        var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        if (bytes == 0) return '0 Byte';
        var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
        return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
    };
});