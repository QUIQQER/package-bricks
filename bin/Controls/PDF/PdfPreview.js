define('package/quiqqer/bricks/bin/Controls/PDF/PdfPreview', [

    'qui/QUI',
    'qui/controls/Control',

    'css!package/quiqqer/bricks/bin/Controls/PDF/PdfPreview.css'

], function (QUI, QUIControl) {
    "use strict";

    return new Class({

        Extends: QUIControl,
        Type: 'package/quiqqer/bricks/bin/Controls/PDF/PdfPreview',

        Binds: [
            '$onInject'
        ],

        options: {
            pdf: false
        },

        initialize: function (options) {
            this.parent(options);

            this.addEvents({
                onInject: this.$onInject
            });
        },

        $onInject: function () {
            const container = this.getElm();
            const file = this.getAttribute('pdf');

            container.setAttribute('data-qui', 'package/quiqqer/bricks/bin/Controls/PDF/PdfPreview');
            container.setAttribute('data-name', 'quiqqer-bricks-pdf-preview');

            container.innerHTML = `
                <div data-name="loader">
                    <span class="fa fa-circle-o-notch fa-spin"></span>
                    <span>Loading file ...</span>
                </div>
                <div data-name="preview"></div>
                <div data-name="sheets"></div>
            `;

            let loaded = false;

            const init = () => {
                if (!loaded) {
                    loaded = true;
                    this.loadPdf(file).then(() => {
                        const loader = container.querySelector('[data-name="loader"]');
                        loader.parentNode.removeChild(loader);
                    });
                }
            };

            // load pdf only in view
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        // im view
                        init();
                    }
                });
            }, {
                threshold: 0.1 // 10% sichtbar
            });

            observer.observe(container);
        },

        loadPdf: function (pdfFile) {
            const container = this.getElm();
            const sheetsContainer = container.querySelector('[data-name="sheets"]');

            sheetsContainer.innerHTML = '';

            this.showPageNumber(pdfFile, 1);

            return new Promise((resolve, reject) => {
                (async () => {
                    try {
                        const module = await import(URL_OPT_DIR + 'bin/quiqqer-asset/pdfjs-dist/pdfjs-dist/build/pdf.mjs');
                        module.GlobalWorkerOptions.workerSrc = URL_OPT_DIR + 'bin/quiqqer-asset/pdfjs-dist/pdfjs-dist/build/pdf.worker.min.mjs';

                        const pdf = await module.getDocument(pdfFile).promise;
                        //node.setStyle('backgroundColor', '#232721');
                        //node.setStyle('textAlign', 'center');

                        const canvasClick = (e) => {
                            console.log(pdfFile);
                            console.log(parseInt(e.target.getAttribute('data-sheet')));

                            this.showPageNumber(pdfFile, parseInt(e.target.getAttribute('data-sheet')));
                        };

                        let page, pageNum;
                        let viewport, context, canvas;
                        const scale = 0.2; // Kleinere Skalierung für Thumbnails

                        for (pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
                            page = await pdf.getPage(pageNum);

                            // Canvas für die Seite erstellen
                            canvas = document.createElement('canvas');
                            //canvas.id = `pdf-sheet-${pageNum}`;
                            canvas.setAttribute('data-sheet', pageNum);
                            //canvas.style.backgroundColor = '#ffffff';
                            //canvas.style.margin = '10px';
                            //canvas.style.width = '100px';    // Thumbnail-Größe anpassen
                            //canvas.style.height = 'auto';
                            canvas.addEventListener('click', canvasClick);

                            sheetsContainer.appendChild(canvas);
                            viewport = page.getViewport({scale});

                            context = canvas.getContext('2d');
                            canvas.height = viewport.height;
                            canvas.width = viewport.width;

                            await page.render({
                                canvasContext: context,
                                viewport: viewport
                            }).promise;
                        }

                        resolve();
                    } catch (error) {
                        console.error('Fehler beim Laden des Moduls:', error);
                        reject();
                    }
                })();
            });
        },

        showPageNumber: function (pdfFile, pageNumber) {
            const container = this.getElm();
            const previewContainer = container.querySelector('[data-name="preview"]');
            previewContainer.innerHTML = '';

            return new Promise((resolve, reject) => {
                (async () => {
                    try {
                        const module = await import(URL_OPT_DIR + 'bin/quiqqer-asset/pdfjs-dist/pdfjs-dist/build/pdf.mjs');
                        module.GlobalWorkerOptions.workerSrc = URL_OPT_DIR + 'bin/quiqqer-asset/pdfjs-dist/pdfjs-dist/build/pdf.worker.min.mjs';

                        const pdf = await module.getDocument(pdfFile).promise;
                        const page = await pdf.getPage(pageNumber);

                        const canvas = document.createElement('canvas');
                        //canvas.id = `pdf-preview-page-${pageNumber}`;
                        canvas.className = 'pdf-preview-canvas'; // <--- CSS-Klasse setzen

                        previewContainer.appendChild(canvas);

                        const scale = 1.5;
                        const viewport = page.getViewport({scale});

                        const context = canvas.getContext('2d');
                        canvas.width = viewport.width;
                        canvas.height = viewport.height;

                        await page.render({
                            canvasContext: context,
                            viewport: viewport
                        }).promise;

                        resolve();
                    } catch (error) {
                        console.error('Fehler beim Laden des Moduls:', error);
                        reject();
                    }
                })();
            });
        }
    });
});
