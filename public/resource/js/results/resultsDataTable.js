
/**
 * 프로젝트명 링크
 *
 * @param data
 * @returns
 */
function getLinkProjectName(data) {
    return '<a href="/projects/' + data.projectId + '/info" data-toggle="tooltip" data-container="body" data-html="true" title="'
        + messageController.get('label.go.to.project.summary') + '<br/>' + messageController.get('label.project.key') + " : " + data.projectKey.escapeHTML() + '">'
        + data.projectName.escapeHTML() + '</a>';
}

/**
 * 프로젝트키 링크
 *
 * @param data
 * @returns
 */
function getLinkProjectKey(data) {
    return '<a href="/projects/' + data.projectId + '/info" data-toggle="tooltip" data-container="body" data-html="true" title="'
        + messageController.get('label.go.to.project.summary') + '">' + data.projectKey.escapeHTML() + '</a>';
}

/**
 * 상위 프로젝트 링크
 *
 * @param data
 * @returns
 */
function getParentProject(data) {
    return '<scan data-toggle="tooltip" data-container="body" data-html="true" title="' + messageController.get('label.project.key') + " : "
        + data.parentProjectKeyPath.escapeHTML() + '">' + data.parentProjectNamePath.escapeHTML() + '</span>';
}

/**
 * 신규 이슈 링크
 *
 * @param data
 * @returns
 */
function getLinkNewIssueCount(data) {
    return '<a href="/scans/' + data.scanId + '/issues#stateCode=0" class="table-inner-link new-issue" data-toggle="tooltip" data-container="body" title="'
        + messageController.get('label.go.to.new.issues') + '">' + data.newIssueCount.format() + '</a>';
}

/**
 * 총 이슈 링크
 *
 * @param data
 * @returns
 */
function getLinkAllIssueCount(data) {
    var scanFileId = '';
    if(data.scanFileId != undefined) {
        scanFileId = '#scanFileId=' + data.scanFileId;
    }
    return '<span class="total-count"><a href="/scans/' + data.scanId + '/issues' + scanFileId + '" class="table-inner-link total" data-toggle="tooltip" data-container="body" title="'
        + messageController.get('label.go.to.issues') + '">' + data.issueCount.format() + '</a></span>';
}

/**
 * 위험도별 이슈 링크
 *
 * @param data
 * @returns
 */
function getLinkRiskIssueCount(data) {
    var scanFileId = '';
    if(data.scanFileId != undefined) {
        scanFileId = '&scanFileId=' + data.scanFileId;
    }
    return '<a href="/scans/' + data.scanId + '/issues#riskLevel=' + data.risk + scanFileId + '" class="table-inner-link risk' + data.risk + '" data-toggle="tooltip" data-container="body" title="'
        + messageController.get('label.go.to.issues', messageController.get("item.checker.risk.level." + data.risk)) + '">' + data.value.format() + '</a>';
}

/**
 * 소스 파일 링크
 *
 * @param data
 * @returns
 */
function getLinkFileCount(data) {
    return '<a href="/scans/' + data.scanId + '/files" class="table-inner-link file" data-toggle="tooltip" data-container="body" title="'
        + messageController.get('label.go.to.file.information') + '">' + data.fileCount.format() + '</a>';
}

/**
 * 빌드 라인 링크
 *
 * @param data
 * @returns
 */
function getLinkBuildLoc(data) {
    return '<a href="/scans/' + data.scanId + '/files" data-toggle="tooltip" data-container="body" title="' + messageController.get('label.go.to.file.information') + '">' + data.buildLoc.format() + '</a>';
}
