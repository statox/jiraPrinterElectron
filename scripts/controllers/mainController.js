"use strict";

app.controller('MainController', ['$scope', '$q', 'storageService', 'Issue', 'html-pdf', 'fs', 'dialog', function($scope, $q, storageService, Issue, pdf, fs, dialog) {

    var initializeData = function() {
        // Do not display the printed issues before we got
        // to download some
        $scope.showPDF = false;

        // This will contain the issues ID the user inputs
        // Get them from local storage
        $scope.issues = storageService.getIssues();

        // This will contain the error logs if we can't reach Jira
        $scope.jiraLog = {};

        // This will tell us if we have error logs to show
        $scope.jiraError = false;

        // Try to get the user data to connect to Jira from local storage
        var result = storageService.getJiraConfig();
        var gotJiraConfig = result.success;
        $scope.jiraConfig = result.data;

        // Focus on the jiraConfig form or the issue ID form
        var elementToFocus;
        if (gotJiraConfig) {
            $scope.showJiraConfiguration = "";
            elementToFocus = "input-issue-id";
        } else {
            $scope.showJiraConfiguration = "show";
            elementToFocus = "input-username";
        }

        // We need to wait for the Login Configuration to be uncollapsed to focus on it
        setTimeout(function(){ document.getElementById(elementToFocus).focus(); }, 10);
    };


    $scope.downloadIssues = function() {
        // Record the current user jiraConfig if it has changed
        storageService.setJiraConfig($scope.jiraConfig);

        // Don't start the download if the user didn't provide at least one issue
        if ($scope.issues.length < 1) {
            return;
        }

        // Reset the error and the issues status
        $scope.jiraError = false;
        $scope.jiraLog = {};
        $scope.issues.forEach((i) => {
            i.downloading = true;
            i.downloadSuccess = undefined;
        });


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
                })
                .finally(function() {
                    // Reset the downloading state
                    issue.downloading = false;
                });

            promises.push(promise);
        });

        $q.all(promises).then(function() {
            generatePdfDiv(downloadedIssues);
            $scope.showPDF = true;
        });
    }

    $scope.removeAllIssues = function () {
        $scope.showPDF = false;
        $scope.issues = [];
        $scope.inputIssueID = "";
        $scope.formattedIssues = [];
        $scope.jiraLog = {};
        $scope.jiraError = false;

        // Store the new state of $scope.issues in locale storage
        storageService.setIssues($scope.issues);
    }

    $scope.removeIssue = function(issueID) {
        $scope.issues = $scope.issues.filter((i) => {return i.id !== issueID;});

        // Store the new state of $scope.issues in locale storage
        storageService.setIssues($scope.issues);
    }

    $scope.addIssue = function() {
        var inputIssueID = $scope.inputIssueID;
        if (typeof inputIssueID === "undefined" || inputIssueID.length === 0
            || $scope.issues.map((i) => i.id).indexOf(inputIssueID) >= 0
        ) {
            return;
        }
        $scope.issues.push({id: inputIssueID, downloadSuccess: undefined, downloading: undefined});

        // Store the new state of $scope.issues in locale storage
        storageService.setIssues($scope.issues);
    }

    var generatePdfDiv = function(issues) {
        var formattedIssues = [];
        $scope.formattedIssues = [];
        issues.forEach(function(issue) {
            var formattedIssue = {
                reference: issue.key, 
                summary: issue.fields.summary,
                assignee: issue.fields.assignee.name,
                estimatedTime: issue.fields.timetracking.originalEstimate,
                icon: issue.fields.issuetype.iconUrl,
                priority: issue.fields.priority,
                avatar: issue.fields.assignee.avatarUrls["48x48"]
            }
            if(issue.fields.fixVersions.length > 0) {
                formattedIssue.version = issue.fields.fixVersions[0].name;
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

    // TODO: Put that into a service
    $scope.generatePDF = function() {
        // Get the HTML containing the issues
        var issueContainerElement = document.getElementById('pdf');
        var html = issueContainerElement.innerHTML;

        // Get our css stylesheet
        var css = fs.readFileSync('scripts/index.css', 'utf8');

        // Put together the style and the issues
        var content = "<style>" + css + "</style>";
        content += html;

        // Options for the PDF generation
        var options = {
            format: 'A4',
            border: {
                top: '15mm'
            }
        };

        // Generate the PDF
        var tmpPath = "./issues.pdf";
        pdf.create(content, options).toFile(tmpPath, function(err, res) {
            if (err) return console.log(err);
            console.log(res);
        });

        var dialogOptions = {
            title: "Save PDF file",
            defaultPath: "issues.pdf"
        }

        var callbackSuccess = function(tmpPath) {
            fs.unlink(tmpPath);
        }

        var callbackFailure = function() {
        }

        // Let the user choose where to save the file
        dialog.showSaveDialog(dialogOptions, (destinationPath) => {
            if (destinationPath === undefined){
                callbackFailure("Error");
                return;
            }

            var source = fs.createReadStream(tmpPath);
            var dest = fs.createWriteStream(destinationPath);

            source.pipe(dest);
            source.on('end', callbackSuccess(tmpPath));
            source.on('error', callbackFailure(err));

        });
    };

    initializeData();
}]);

