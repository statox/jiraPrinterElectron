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

        // Focus on the jiraConfig form or the issue ID form
        var elementToFocus = gotJiraConfig ? "input-issue-id" : "input-username";
        document.getElementById(elementToFocus).focus();
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
                    issue.downloadSuccess = true;
                    downloadedIssues.push(response.data);
                })
                .catch(function(err) {
                    issue.downloadSuccess = false;
                });

            promises.push(promise);
        });

        $q.all(promises).then(function() {
            generatePdfDiv(downloadedIssues);
            $scope.showPDF = true;
        });
    }

    $scope.removeAllIssues = function () {
        $scope.issues = [];
        $scope.inputIssueID = "";
        $scope.formattedIssues = [];
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
        $scope.issues.push({id: inputIssueID, downloadSuccess: undefined});
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
        // Get all the elements "issue-container" to generate the PDF
        var issueContainersElements = document.getElementsByClassName('issue-container');
        var issueContainers = []

        for (var i=0; i<issueContainersElements.length; i++) {
            issueContainers.push(issueContainersElements[i]);
        }

        // Generate the PDF
        imageService.generatePDF(issueContainers);
    };

    initializeData();
}]);

