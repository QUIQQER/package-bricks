/**
 * QUIQQER Simple Google Map Control
 *
 * @author www.pcsg.de (Michael Danielczok)
 * @module Bricks\Controls\SimpleGoogleMaps
 *
 * @require qui/QUI
 * @require qui/controls/Control
 */
define('package/quiqqer/bricks/bin/Controls/SimpleGoogleMaps', [

    'qui/QUI',
    'qui/controls/Control'

], function (QUI, QUIControl)
{
    "use strict";

    return new Class({

        Extends: QUIControl,
        Type   : 'Controls/SimpleGoogleMaps',

        Binds: [
            '$onImport'
        ],

        initialize: function (options)
        {
            this.parent(options);

            this.mapWrapper = null;

            this.addEvents({
                onImport: this.$onImport
            });
        },

        /**
         * event : on import
         */
        $onImport: function ()
        {
            this.mapWrapper = document.getElement('.simpleGoogleMap-wrapper');

            this.mapWrapper.addEvent('click', function() {
                this.mapWrapper.addClass('simpleGoogleMap-hideWrapper');
            }.bind(this));
        }
    });
});
