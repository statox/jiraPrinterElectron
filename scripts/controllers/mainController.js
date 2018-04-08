"use strict";

app.controller('MainController', ['$scope', '$q', 'imageService', 'Issue', function($scope, $q, imageService, Issue) {
    var initializeData = function() {
        // Do not display the printed issues before we got
        // to download some
        $scope.showPDF = false;

        // This will contain the issues ID the user inputs
        $scope.issues = [];

        // This will contain the error logs if we can't reach Jira
        $scope.jiraLog = {};

        // This will tell us if we have error logs to show
        $scope.jiraError = false;

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

        // Reset the error and the issues status
        $scope.jiraError = false;
        $scope.jiraLog = {};
        $scope.issues.forEach((i) => { i.downloadSuccess = undefined; });


        var promises = [];
        var downloadedIssues = [];

        $scope.issues.forEach(function(issue) {
            var promise = Issue.get(issue.id, $scope.jiraConfig.host, $scope.jiraConfig.port, $scope.jiraConfig.username, $scope.jiraConfig.password)
                .then(function(response) {
                    issue.downloadSuccess = true;
                    downloadedIssues.push(response.data);
                })
                .catch(function(err) {
                    // If we can't download an issue update its downloadSuccess property
                    // and add an entry in $scope.jiraLog which will be displayed to the user
                    issue.downloadSuccess = false;

                    if (Object.keys($scope.jiraLog).indexOf(err.status) == -1) {
                        var message = "";
                        switch (err.status) {
                            case 400:
                            case 405:
                                message = "Bad Request. The application sent a bad request please contact the maintainer.";
                                break;
                            case 401:
                            case 403:
                                message = "Unauthorized. Please check your credentials in 'login informations'.";
                                break;
                            case 404:
                                message = "Not found. Check the issue actually exists.";
                                break;
                            case 429:
                                message = "Too many request. You have exceeded the limit rate.";
                                break;
                            case 500:
                                message = "Internal server error. Please contact your Jira administrator.";
                                break;
                            case 503:
                                message = "Service Unavailable. Jira is currently unavailable.";
                                break;
                            default:
                                message = "Houston we have a problem. We got an unexpected error code.";
                        }

                        $scope.jiraError = true;
                        $scope.jiraLog[err.status] = message;
                    }
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

    $scope.removeIssue = function(issueID) {
        $scope.issues = $scope.issues.filter((i) => {return i.id !== issueID;});
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

