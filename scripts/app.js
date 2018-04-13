'use strict';

var app = angular.module(
    'app',
    [
        'ngRoute',
        'ngMaterial',
        'ngAnimate',
        'angular-electron'
    ]
);
app.config(
    [
        '$routeProvider',
        function ($routeProvider) {
            $routeProvider.when(
                '/', {
                    templateUrl: './scripts/home/home.html',
                    controller: 'MainController'
                }
            );
            $routeProvider.otherwise({redirectTo: '/'});
        }
    ]
);

// Make html-pdf an angular module
app.config(['remoteProvider', function(remoteProvider) {
    remoteProvider.register('html-pdf');
}]);

// Make fs an angular module
app.config(['remoteProvider', function(remoteProvider) {
    remoteProvider.register('fs');
}]);
