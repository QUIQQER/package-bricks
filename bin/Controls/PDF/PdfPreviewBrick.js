define('package/quiqqer/bricks/bin/Controls/PDF/PdfPreviewBrick', [

    'qui/QUI',
    'qui/controls/Control',
    'package/quiqqer/bricks/bin/Controls/PDF/PdfPreview'

], function (QUI, QUIControl, PdfPreview) {
    "use strict";

    return new Class({

        Extends: QUIControl,
        Type: 'package/quiqqer/bricks/bin/Controls/PDF/PdfPreviewBrick',

        Binds: [
            '$onImport'
        ],

        initialize: function (options) {
            this.parent(options);

            this.addEvents({
                onImport: this.$onImport
            });
        },

        $onImport: function () {
            const pdfContainer = this.getElm().querySelector('[data-name="pdf-preview-container"]');

            new PdfPreview({
                pdf: pdfContainer.getAttribute('data-qui-options-pdfFile'),
                pageNum : pdfContainer.getAttribute('data-qui-options-pagenum')
            }).inject(pdfContainer);
        }
    });
});
