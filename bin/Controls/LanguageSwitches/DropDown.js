/**
 * @module package/quiqqer/bricks/bin/Controls/LanguagesSwitches/DropDown
 * @author www.pcsg.de (Henning Leutz)
 *
 * @require qui/QUI
 * @require qui/controls/Control
 */
define('package/quiqqer/bricks/bin/Controls/LanguageSwitches/DropDown', [

    'qui/QUI',
    'qui/controls/Control'

], function (QUI, QUIControl) {
    "use strict";

    return new Class({

        Extends: QUIControl,
        Type   : 'package/quiqqer/bricks/bin/Controls/LanguageSwitches/DropDown',

        Binds: [
            'open',
            'close',
            '$onImport'
        ],

        initialize: function (options) {
            this.parent(options);

            this.$Display  = null;
            this.$DropDown = null;

            this.addEvents({
                onImport: this.$onImport
            });
        },

        /**
         * event : on inject
         */
        $onImport: function () {
            this.$Elm.set({
                tabindex: -1,
                styles  : {
                    outline       : 'none',
                    '-moz-outline': 'none'
                }
            });

            this.$Elm.addEvents({
                click: function (event) {
                    event.target.focus();
                },
                focus: this.open,
                blur : this.close
            });


            this.$DropDown = this.$Elm.getElement(
                '.quiqqer-control-languageswitch-dropdown-dd'
            );

            this.$DropDown.addEvent('mousedown', function (event) {
                event.stop();
            });

            // click events
            var links = this.$DropDown.getElements(
                '.quiqqer-control-languageswitch-dropdown-dd-entry'
            );

            links.addEvent('click', function (event) {
                if (window.location.search === '' &&
                    window.location.hash === '') {
                    return;
                }

                var href = this.get('href');

                if (href.match(/\?/)) {
                    return;
                }

                event.stop();

                var search = window.location.search;
                var hash   = window.location.hash;

                window.location = href + search + hash;
            });
        },

        /**
         * Show the currency dropdown
         */
        open: function () {
            this.$DropDown.setStyles({
                display: 'inline'
            });
        },

        /**
         * Close the currency dropdown
         */
        close: function () {
            this.$DropDown.setStyles({
                display: 'none'
            });
        }
    });
});
