"use strict";

app.controller('MainController', ['$scope', '$q', 'imageService', 'Issue', function($scope, $q, imageService, Issue) {
    var initializeData = function() {
        // Do not display the printed issues before we got
        // to download some
        $scope.showPDF = false;

        // This will contain the issues ID the user inputs
        $scope.issues = [];

        // This will contain the user data to connect to Jira

        // Try to get the user data from local storage
        $scope.jiraConfig = angular.fromJson(localStorage.getItem("jiraConfig"));
        var gotJiraConfig = !(typeof $scope.jiraConfig === "undefined" || $scope.jiraConfig === null)

        $scope.showJiraConfiguration = "";
        if (!gotJiraConfig) {
            $scope.showJiraConfiguration = "show";
            $scope.jiraConfig = {
                username: "",
                password: "",
                host: "",
                port: ""
            };
        }
    };


    $scope.downloadIssues = function() {
        // Record the current user jiraConfig
        // TODO: make it smarter, record only when something changed
        localStorage.setItem("jiraConfig", angular.toJson($scope.jiraConfig));
        if ($scope.issues.length < 1) {
            return;
        }
        var promises = [];
        var downloadedIssues = [];

        $scope.issues.forEach(function(issue) {
            var promise = Issue.get(issue.id, $scope.jiraConfig.host, $scope.jiraConfig.port, $scope.jiraConfig.username, $scope.jiraConfig.password)
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
        var inputIssueID = $scope.inputIssueID;
        if (typeof inputIssueID === "undefined" || inputIssueID.length === 0
            || $scope.issues.map((i) => i.id).indexOf(inputIssueID) >= 0
        ) {
            return;
        }
        $scope.issues.push({id: inputIssueID});
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
                estimatedTime: issue.fields.timetracking.originalEstimate,
                icon: issue.fields.issuetype.iconUrl
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
        });
    };

    initializeData();
}]);

