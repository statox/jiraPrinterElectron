/*
 * Service to handle images and convert them into PDF
 *
 * The functions of this file are copied and/or adapted from this gist
 * https://gist.github.com/Balkoth/d79a520ca2a3377c15e902ec68790aff
 */

angular.module('app').service("imageService", function($q) {
    var imageService = {};

    //const PAGE_HEIGHT = 700;
    const PAGE_HEIGHT = 680;
    const PAGE_WIDTH = 500;

    const content = [];

    imageService.getPngDimensions = function(base64) {
        const header = atob(base64.slice(22, 70)).slice(16, 24);
        const uint8 = Uint8Array.from(header, c => c.charCodeAt(0));
        const dataView = new DataView(uint8.buffer);

        return {
            width: dataView.getInt32(0),
            height: dataView.getInt32(4)
        };
    }

    imageService.splitImage = (img, content, callback) => () => {

        const canvas = document.createElement('canvas');
        const ctx    = canvas.getContext('2d');
        const printHeight = img.height * PAGE_WIDTH / img.width;

        canvas.width = PAGE_WIDTH;

        for (let pages = 0; printHeight > pages * PAGE_HEIGHT; pages++) {
            /* Don't use full height for the last image */
            canvas.height = Math.min(PAGE_HEIGHT, printHeight - pages * PAGE_HEIGHT);
            ctx.drawImage(img, 0, -pages * PAGE_HEIGHT, canvas.width, printHeight);
            content.push({ image: canvas.toDataURL(), margin: [0, 5], width: PAGE_WIDTH });
        }

        callback();
    };

    imageService.next = function() {
        /* add other content here, can call addImage() again for example */
        pdfMake.createPdf({ content }).download();
    }

    imageService.addImage = function(image) {
        /* Load big image */
        //const image = 'data:image/png;base64,iVBORw0Kgo…';

        const { width, height } = this.getPngDimensions(image);
        const printHeight = height * PAGE_WIDTH / width;

        if (printHeight > PAGE_HEIGHT) {
            const img = new Image();
            img.onload = this.splitImage(img, content, this.next);
            img.src = image;
            return;
        }

        content.push({ image, margin: [0, 5], width: PAGE_WIDTH });
        this.next();
    }

    imageService.generatePDF = function(issueContainers) {
        var promisesCanvas = [];
        var canvases = [];

        issueContainers.forEach(function(issueContainer) {
            var promise = $q.defer();
            promisesCanvas.push(promise.promise);

            html2canvas(issueContainer).then(function (canvas) {
                canvases.push(canvas);
                promise.resolve();
            });
        });

        $q.all(promisesCanvas).then(function() {
            var content = []

            canvases.forEach(function(canvas) {
                content.push({ image: canvas.toDataURL(), margin: [0, 5], width: PAGE_WIDTH });
            })

            pdfMake.createPdf({ content }).download();
        });
    }

    return imageService;
});
