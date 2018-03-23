'use strict';

var app = angular.module(
    'app',
    [
        'ngRoute',
        'ngMaterial',
        'ngAnimate'
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
