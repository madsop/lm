var suapp = suapp || {};
(function () {
    suapp.services = suapp.services || {};
    
    suapp.services.save = function (data, callback) {
        $.ajax("http://localhost:1337/tasks", {
            data: ko.toJSON(data),
            type: "post", contentType: "application/json",
        })
        .success(function(result) { callback(null, result); })
        .error(function() { callback("some error occured"); });
    };
}());
