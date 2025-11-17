define('package/quiqqer/bricks/bin/Controls/PDF/PdfPreview', [

    'qui/QUI',
    'qui/controls/Control',
    'qui/controls/loader/Loader',
    'Locale',

    'css!package/quiqqer/bricks/bin/Controls/PDF/PdfPreview.css'

], function (QUI, QUIControl, QUILoader, QUILocale) {
    "use strict";

    return new Class({

        Extends: QUIControl,
        Type: 'package/quiqqer/bricks/bin/Controls/PDF/PdfPreview',

        Binds: [
            '$onInject',
            '$onImport',
            'handleOpenPageClick',
            'openNextPage',
            'openPrevPage'
        ],

        options: {
            pdf: false,
            pageNum: 0
        },

        initialize: function (options) {
            this.parent(options);
            this.currentPage = 1;
            this.maxPage = 1;
            this.NextBtn = null;
            this.PrevBtn = null;
            this.pdfFile = '';
            this.sheets = [];
            this.isLoading = false;

            this.addEvents({
                onInject: this.$onInject,
                onImport: this.$onImport
            });
        },

        $onInject: function () {
            const container = this.getElm();
            this.pdfFile = this.getAttribute('pdf');
            this.Loader = new QUILoader();

            container.setAttribute('data-qui', 'package/quiqqer/bricks/bin/Controls/PDF/PdfPreview');
            container.setAttribute('data-name', 'quiqqer-bricks-pdf-preview');

            container.innerHTML = `
               <div class="container">
                   <div class="preview" data-name="preview" data-huhu="1">
                        <div data-name="loader" class="skeleton-loader" style="width: 100%; height: 100%; display: grid; place-items: center;">
                            <div style="text-align: center; opacity: 0.25;">
                                <i class="fa-regular fa-file-pdf" aria-hidden="true" style="font-size: clamp(2rem, 10vw, 5rem); margin-bottom: 1rem;"></i>
                                <div>${QUILocale.get('quiqqer/bricks', 'pdfPreview.brick.frontend.loading.title')}</div>
                            </div>
                        </div>
                    </div>
                    <div class="sheets" data-name="sheets"></div>
                </div>
            `;

            this.PrevBtn = document.createElement('button');
            this.PrevBtn.setAttribute('data-name', 'prev');
            this.PrevBtn.setAttribute('class', 'btn btn-icon btn-rounded btn--prev');
            this.PrevBtn.innerHTML = '<i class="fa-solid fa-angle-left" aria-hidden="true"></i>';

            this.PrevBtn.addEventListener('click', () => {
                this.handleOpenPageClick('prev');
            });

            this.NextBtn = document.createElement('button');
            this.NextBtn.setAttribute('data-name', 'next');
            this.NextBtn.setAttribute('class', 'btn btn-icon btn-rounded btn--next');
            this.NextBtn.innerHTML = '<i class="fa-solid fa-angle-right" aria-hidden="true"></i>';
            this.NextBtn.addEventListener('click', () => {
                this.handleOpenPageClick('next');
            });

            this.PrevBtn.inject(container.querySelector('[data-name="preview"]'));
            this.NextBtn.inject(container.querySelector('[data-name="preview"]'));

            const maxPages = this.getAttribute('pageNum');

            if (maxPages > 0) {
                let i = 1;
                for (i; i <= maxPages; i++) {
                    const sheet = document.createElement('div');
                    sheet.setAttribute('data-name', 'sheet');
                    sheet.setAttribute('class', 'sheet');
                    sheet.innerHTML = `<div data-name="loader" class="skeleton-loader" style="width: 100%; height: 100%;"></div>`;
                    container.querySelector('[data-name="sheets"]').appendChild(sheet);
                }
            }

            this.initPdfLazyLoad(container);
        },

        $onImport: function() {
            this.Loader = new QUILoader();

            const container = this.getElm();
            this.pdfFile = container.getAttribute('data-qui-options-pdffile');

            this.NextBtn = container.querySelector('[data-name="next"]');
            this.PrevBtn = container.querySelector('[data-name="prev"]');

            if (this.NextBtn) {
                this.NextBtn.addEventListener('click', () => {
                    this.handleOpenPageClick('next');
                });
            }

            if (this.PrevBtn) {
                this.PrevBtn.addEventListener('click', () => {
                    this.handleOpenPageClick('prev');
                });
            }

            this.initPdfLazyLoad(container);
        },

        /**
         * Load pdf only in view
         */
        initPdfLazyLoad: function(container) {
            let loaded = false;

            const init = () => {
                if (!loaded) {
                    loaded = true;
                    this.loadPdf();
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

        /**
         * Load pdf
         *
         * @returns {Promise<unknown>}
         */
        loadPdf: function () {
            if (!this.pdfFile) {
                return Promise.reject(new Error('No pdf file provided.'));
            }

            const container = this.getElm();
            const sheetsContainer = container.querySelector('[data-name="sheets"]');
            this.sheets = sheetsContainer.querySelectorAll('[data-name="sheet"]');

            this.showPageNumber(1);

            return new Promise((resolve, reject) => {
                (async () => {
                    try {
                        const module = await import(URL_OPT_DIR + 'bin/quiqqer-asset/pdfjs-dist/pdfjs-dist/build/pdf.mjs');
                        module.GlobalWorkerOptions.workerSrc = URL_OPT_DIR + 'bin/quiqqer-asset/pdfjs-dist/pdfjs-dist/build/pdf.worker.min.mjs';

                        const pdf = await module.getDocument(this.pdfFile).promise;

                        const canvasClick = (e) => {
                            this.disableButtons();
                            this.showPageNumber(parseInt(e.target.getAttribute('data-sheet'))).then(() => this.enableButtons());
                        };

                        let page, pageNum;
                        let viewport, context;
                        const scale = 0.2; // Kleinere Skalierung für Thumbnails
                        this.maxPage = pdf.numPages;

                        // remove sheets that are not needed.
                        // It is likely that the entered number of pages is higher than the actual number of pages in the PDF file.
                        if (this.sheets.length > this.maxPage) {
                            this.sheets.forEach((sheet, idx) => {
                                if (idx >= pdf.numPages) {
                                    sheet.remove();
                                }
                            });
                        }

                        for (pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
                            page = await pdf.getPage(pageNum);

                            // Canvas für die Seite erstellen
                            let canvas = document.createElement('canvas');
                            canvas.setAttribute('data-sheet', pageNum);
                            canvas.addEventListener('click', canvasClick);
                            canvas.style.opacity = '0';

                            let SheetElm = this.sheets[pageNum - 1];

                            if (SheetElm) {
                                SheetElm.appendChild(canvas);

                                let SkeletonLoader = SheetElm.querySelector('[data-name="loader"]');

                                moofx(canvas).animate({
                                    opacity: 1
                                }, {
                                    callback: () => {
                                        if (SkeletonLoader) {
                                            SkeletonLoader.remove();
                                        }
                                    }
                                });
                            } else {
                                SheetElm = document.createElement('div');
                                SheetElm.classList.add('sheet');
                                SheetElm.setAttribute('data-name', 'sheet');
                                sheetsContainer.appendChild(SheetElm);
                                SheetElm.appendChild(canvas);

                                moofx(canvas).animate({
                                    opacity: 1
                                });
                            }

                            viewport = page.getViewport({scale});

                            context = canvas.getContext('2d');
                            canvas.height = viewport.height;
                            canvas.width = viewport.width;

                            await page.render({
                                canvasContext: context,
                                viewport: viewport
                            }).promise;
                        }

                        this.isLoading  = false;
                        resolve();
                    } catch (error) {
                        console.error('Fehler beim Laden des Moduls:', error);
                        reject();
                    }
                })();
            });
        },

        showPageNumber: function (pageNumber) {
            if (this.isLoading) {
                return Promise.resolve();
            }

            this.isLoading = true;

            if (!this.pdfFile) {
                return Promise.reject(new Error('No pdf file provided.'));
            }

            const container = this.getElm();
            const previewContainer = container.querySelector('[data-name="preview"]');
            const SkeletonLoader = previewContainer.querySelector('[data-name="loader"]');
            const PageToHide = previewContainer.querySelector('canvas');

            const loadPage = function () {
                return new Promise((resolve, reject) => {
                    (async () => {
                        try {
                            const module = await import(URL_OPT_DIR + 'bin/quiqqer-asset/pdfjs-dist/pdfjs-dist/build/pdf.mjs');
                            module.GlobalWorkerOptions.workerSrc = URL_OPT_DIR + 'bin/quiqqer-asset/pdfjs-dist/pdfjs-dist/build/pdf.worker.min.mjs';

                            const pdf = await module.getDocument(this.pdfFile).promise;
                            const page = await pdf.getPage(pageNumber);
                            this.currentPage = pageNumber;
                            this.setActiveSheet();

                            const canvas = document.createElement('canvas');
                            canvas.style.opacity = '0';

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

                            if (PageToHide) {
                                this.showPage(canvas).then(() => {
                                    this.Loader.hide();
                                    this.isLoading = false;
                                    resolve();
                                });
                            } else {
                                moofx(canvas).animate({
                                    opacity: 1
                                }, {
                                    callback: () => {
                                        if (SkeletonLoader) {
                                            SkeletonLoader.remove();
                                            this.isLoading = false;
                                            resolve();
                                            return;
                                        }

                                        this.Loader.hide();
                                        this.isLoading = false;
                                        resolve();
                                    }
                                });
                            }
                        } catch (error) {
                            console.error('Fehler beim Laden des Moduls:', error);
                            this.isLoading = false;
                            reject();
                        }
                    })();
                });
            }.bind(this);

            if (!SkeletonLoader && PageToHide) {
                this.Loader.inject(previewContainer);
                this.Loader.show();

                return this.hidePage(PageToHide).then(() => {
                    PageToHide.remove();
                    return loadPage();
                });
            }

            return loadPage();
        },

        handleOpenPageClick: function(direction) {
            this.disableButtons();

            if (direction === 'next') {
                return this.openNextPage().then(() => this.enableButtons())
            }

            return this.openPrevPage().then(() => this.enableButtons());
        },

        openNextPage: function() {
            if (this.currentPage === this.maxPage) {
                return Promise.resolve();
            }

            return this.showPageNumber(this.currentPage +1);
        },

        openPrevPage: function() {
            if (this.currentPage === 1) {
                return Promise.resolve();
            }

            return this.showPageNumber(this.currentPage -1);
        },

        hidePage: function(Page) {
            Page.style.transform = 'scale(1)';
            Page.style.opacity = '1';

            return new Promise((resolve) => {
                moofx(Page).animate({
                   transform: 'scale(0.95)',
                   opacity: 0
                }, {
                    duration: 300,
                    callback: resolve
                });
            })
        },

        showPage: function(Page) {
            Page.style.transform = 'scale(1.1)';
            Page.style.opacity = '0';

            return new Promise((resolve) => {
                moofx(Page).animate({
                   transform: 'scale(1)',
                   opacity: 1
                }, {
                    duration: 300,
                    callback: resolve
                });
            })
        },

        setActiveSheet: function() {
            this.sheets.forEach((sheet, index) => {
                if (index === this.currentPage - 1) {
                    sheet.classList.add('active');
                } else {
                    sheet.classList.remove('active');
                }
            });
        },

        disableButtons: function() {
            if (this.NextBtn) {
                this.NextBtn.disabled = true;
            }

            if (this.PrevBtn) {
                this.PrevBtn.disabled = true;
            }
        },

        enableButtons: function() {
            if (this.NextBtn) {
                this.NextBtn.disabled = false;
            }

            if (this.PrevBtn) {
                this.PrevBtn.disabled = false;
            }
        }
    });
});
