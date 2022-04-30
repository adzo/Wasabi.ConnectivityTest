
function parsePingResponse(pingResult) {
    // console.log(pingResult.stdout);
    //console.log('*' + pingResult.stdout.substring(pingResult.stdout.lastIndexOf(' ') + 1) + '*');
    lastPart = pingResult.stdout.substring(pingResult.stdout.lastIndexOf(' ') + 1);
    if (lastPart.includes('\n')) {
        lastPart = lastPart.split('\n')[0];
    }

    lastPart = lastPart.replace('ms', '');
    return lastPart;
}





