/*
 * Service to interact with localStorage
 */

angular.module('app').service("pdfService", ['fs', 'html-pdf', 'dialog', function(fs, pdf, dialog) {
    var pdfService = {};

    pdfService.generatePDF = function(html) {
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
            if (err) {
                console.log(err);
            }
        });


        var dialogOptions = {
            title: "Save PDF file",
            defaultPath: "issues.pdf"
        };

        var callbackSuccess = function(tmpPath) {
            fs.unlink(tmpPath);
        };

        var callbackFailure = function() {
        };

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


    return pdfService;
}]);
