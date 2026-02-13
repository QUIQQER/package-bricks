define('package/quiqqer/bricks/bin/Controls/LanguageSwitches/Flags', [

    'qui/QUI',
    'qui/controls/Control'

], function (QUI, QUIControl) {
    "use strict";

    return new Class({

        Extends: QUIControl,
        Type: 'package/quiqqer/bricks/bin/Controls/LanguageSwitches/Flags',

        Binds: [
            '$onImport'
        ],

        initialize: function (options) {
            this.parent(options);

            this.$Display = null;
            this.$DropDown = null;

            this.addEvents({
                onImport: this.$onImport
            });
        },

        /**
         * event: on inject
         */
        $onImport: function () {
            // click events
            const links = this.$Elm.getElements(
                '.quiqqer-bricks-languageswitch-flag-entry'
            );

            links.addEvent('click', function (event) {
                if (window.location.search === '' &&
                    window.location.hash === '') {
                    return;
                }

                const href = this.get('href');

                if (href.match(/\?/)) {
                    return;
                }

                event.stop();

                const search = window.location.search;
                const hash = window.location.hash;

                window.location = href + search + hash;
            });
        }
    });
});
