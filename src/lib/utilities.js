
function parsePingResponse(pingResult, platform) {
    // windows ping result
    if (platform != 'darwin' && platform != 'linux') {
        lastPart = pingResult.stdout.substring(pingResult.stdout.lastIndexOf(' ') + 1);
        if (lastPart.includes('\n')) {
            lastPart = lastPart.split('\n')[0];
        }

        lastPart = lastPart.replace('ms', '');
        return lastPart;
    } else {
        // string example
        // round-trip min/avg/max/stddev = 117.993/120.052/123.978/2.384 ms
        // linux and mac os ping result!
        return pingResult.stdout
            .split('\n')[9]
            .split(' ')[3]
            .split('/')[0];
    }
}





