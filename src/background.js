chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    var result = {};
    if (request.op == "set") {
        localStorage[request.key] = request.value;
        result[request.key] = request.value;
    } else if (request.op == "get") {
        result[request.key] = localStorage[request.key]
    }
    sendResponse(result);
});