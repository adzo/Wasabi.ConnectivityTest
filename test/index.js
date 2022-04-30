function ping() {
    // The custom URL
    var URL = $("#url").val();
    var settings = {
        cache: false,
        dataType: "jsonp",
        async: true,
        crossDomain: true,
        url: URL,
        method: "GET",
        // For response
        statusCode: {
            200: function (response) {
                console.log("Status 200: Page is up!");
            },
            400: function (response) {
                console.log("Status 400: Page is down.");
            },
            0: function (response) {
                console.log("Status 0: Page is down.");
            },
        },
    };
    // Sends the request and observes the response
    $.ajax(settings).done(function (response) {
        console.log(response);
    });
}