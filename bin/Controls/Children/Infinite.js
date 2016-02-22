/**
 * Children listing
 *
 * @module package/quiqqer/bricks/bin/Controls/Children/Infinite
 * @author www.pcsg.de (Henning Leutz)
 *
 * @require qui/QUI
 * @require qui/controls/Control
 */
define('package/quiqqer/bricks/bin/Controls/Children/Infinite', [

    'qui/QUI',
    'qui/controls/Control'

], function (QUI, QUIControl) {
    "use strict";

    return new Class({

        Extends: QUIControl,
        Type   : 'package/quiqqer/bricks/bin/Controls/Pagination',

        Binds: [
            '$onImport',
            '$onMouseOver',
            '$linkclick',
            '$redraw'
        ],

        initialize: function (options) {
            this.parent(options);

            this.addEvents({
                onImport: this.$onImport
            });
        },

        /**
         * event : on import
         */
        $onImport: function () {
console.log('Infinite $onImport');
        }
    });
});