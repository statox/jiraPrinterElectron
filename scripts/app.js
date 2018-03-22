(function () {
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
                        templateUrl: './scripts/home/home.html'
                    }
                );
                $routeProvider.otherwise({redirectTo: '/'});
            }
        ]
    );

    app.controller('MainController', ['$scope', '$q', 'imageService', 'Issue', function($scope, $q, imageService, Issue) {
        $scope.showPDF = false;

        $scope.config = {
            username: "afabre",
            password: "Nexworld201604",
            host: "jira.cddelis.com",
            port: "8080"
        };

        $scope.issues = [];
        $scope.issues.push({id: "REP-951"});
        $scope.issues.push({id: "REP-952"});
        $scope.issues.push({id: "REP-953"});
        $scope.issues.push({id: "REP-954"});
        $scope.issues.push({id: "REP-955"});
        $scope.issues.push({id: "REP-951"});
        $scope.issues.push({id: "REP-952"});
        $scope.issues.push({id: "REP-953"});
        $scope.issues.push({id: "REP-954"});
        $scope.issues.push({id: "REP-955"});

        $scope.printIssues = function() {
            var promises = [];
            var downloadedIssues = [];

            $scope.issues.forEach(function(issue) {
                var promise = Issue.get(issue.id, $scope.config.host, $scope.config.port, $scope.config.username, $scope.config.password)
                    .then(function(response) {
                        downloadedIssues.push(response.data);
                    });

                promises.push(promise);
            });

            $q.all(promises).then(function() {
                generatePdfDiv(downloadedIssues);
                $scope.showPDF = true;
            });
        }

        $scope.removeIssue = function(index) {
            $scope.issues.splice(index, 1);
        }

        $scope.addIssue = function() {
            $scope.issues.push({id: $scope.inputIssueID});
        }

        var generatePdfDiv = function(issues) {
            var formattedIssues = [];
            $scope.formattedIssues = [];
            issues.forEach(function(issue) {
                var formattedIssue = {
                    reference: issue.key,
                    summary: issue.fields.summary,
                    assignee: issue.fields.assignee.name,
                    priority: issue.fields.priority.name,
                    estimatedTime: issue.fields.timetracking.originalEstimate
                }

                formattedIssues.push(formattedIssue);
            });

            var i=0;
            for (i ; i<formattedIssues.length ; i+=2) {
                var issueRow = [formattedIssues[i]];
                if (i < formattedIssues.length) {
                    issueRow.push(formattedIssues[i+1]);
                }
                $scope.formattedIssues.push(issueRow);
            }
        };

        $scope.generatePDF = function() {
            var doc = document.getElementById('pdf');

            html2canvas(doc).then(function (canvas) {
                var data = canvas.toDataURL();
                imageService.addImage(data);
/*
 *                var docDefinition = {
 *                    content: [
 *                        {
 *                            image: data,
 *                            width: 500,
 *                        }
 *                    ]
 *                };
 *
 *                pdfMake.createPdf(docDefinition).download("issues.pdf");
 */
            });
        };
    }]);
})();
