angular.module('app').factory("Issue", function($http) {
    return {
        get: function(issueID, host, port, username, password) {
            return $http({
                method: 'GET',
                url: 'http://' + host + ":" + port + '/rest/api/latest/issue/' + issueID,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Basic ' + btoa(username + ':' + password),
                    'Access-Control-Allow-Origin': '*'
                },
                timeout: 2 * 60 * 1000
            });
        }
    }
});
