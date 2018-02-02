/**
 * @module package/quiqqer/bricks/bin/Controls/ContentSwitcher
 * @author www.pcsg.de (Henning Leutz)
 */
define('package/quiqqer/bricks/bin/Controls/ContentSwitcher', [

    'qui/controls/elements/FormList',
    'utils/Controls',
    'Locale',

    'css!package/quiqqer/bricks/bin/Controls/ContentSwitcher.css'

], function (QUIFormList, QUIControls, QUILocale) {
    "use strict";

    var lg = 'quiqqer/bricks';

    return new Class({

        Extends: QUIFormList,
        Type   : 'package/quiqqer/bricks/bin/Controls/ContentSwitcher',

        Binds: [
            '$onParsed'
        ],

        initialize: function (options) {
            this.parent(options);

            this.addEvents({
                onParsed  : this.$onParsed
            });

            this.setAttributes({
                buttonText: QUILocale.get(lg, 'contentSwitcher.entries.button.text'),
                entry: '<div class="quiqqer-bricks-ContentSwitcher-entry" style="display: none;">' +
                           '<label class="entry-image">' +
                               '<span class="entry-title">' +
                                 QUILocale.get(lg, 'contentSwitcher.entries.entry.picture') +
                               '</span>' +
                               '<input class="media-image" data-qui-options-selectable_types="image" name="img"/>' +
                           '</label>' +
                           '<label>' +
                               '<span class="entry-title">' +
                                 QUILocale.get(lg, 'contentSwitcher.entries.entry.title') +
                               '</span>' +
                               '<input type="text" name="title" />' +
                           '</label>' +
                           '<label>' +
                               '<span class="entry-title">' +
                                  QUILocale.get(lg, 'contentSwitcher.entries.entry.content') +
                               '</span>' +
                               '<textarea name="content" rows="10"></textarea>' +
                           '</label>' +
                       '</div>'
            });
        },

        /**
         * Parses QUI controls when a new entry is created
         *
         * Fired after (inherited) FormList has parsed the content
         *
         * @param event
         * @param Element - The element that was previously parsed by (inherited) FormList
         */
        $onParsed: function (event, Element) {
            QUIControls.parse(Element).then(function () {
                // Element is fully parsed so we can finally show it
                Element.getElement('.quiqqer-bricks-ContentSwitcher-entry').show();
            });
        }
    });
});

