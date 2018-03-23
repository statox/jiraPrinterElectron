"use strict";

app.controller('MainController', ['$scope', '$q', 'imageService', 'Issue', function($scope, $q, imageService, Issue) {
    console.log("COUCOU FROM MainController");
    $scope.showPDF = false;

    $scope.config = {
        username: "TEST",
        password: "TEST",
        host: "",
        port: ""
    };

    $scope.issues = [];

    $scope.downloadIssues = function() {
        if ($scope.issues.length < 1) {
            return;
        }
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
        console.log("COUCOU from addIssue");
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
}]);

