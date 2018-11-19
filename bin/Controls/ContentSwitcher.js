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
                onParsed: this.$onParsed
            });

            this.setAttributes({
                buttonText: QUILocale.get(lg, 'contentSwitcher.entries.button.text'),
                entry     : '<div class="quiqqer-bricks-ContentSwitcher-entry" style="display: none;">' +
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
                    '<input type="text" name="content-switcher-title" />' +
                    '</label>' +
                    '<label>' +
                    '<span class="entry-title">' +
                    QUILocale.get(lg, 'contentSwitcher.entries.entry.content') +
                    '</span>' +
                    '<input name="content-switcher-content" class="field-container-field field-description" data-qui="controls/editors/Input" />' +
                    '</label>' +
                    '</div>'
            });
        },

        /**
         * @event on import
         *
         * https://dev.quiqqer.com/quiqqer/package-bricks/issues/97
         */
        $onImport: function () {
            // look if some value exist
            var value = this.getElm().value;

            if (value === '') {
                this.parent();
                return;
            }

            value = JSON.decode(value);

            if (typeOf(value) !== 'array') {
                this.parent();
                return;
            }

            for (var i = 0, len = value.length; i < len; i++) {
                if (typeof value[i].content !== 'undefined') {
                    value[i]['content-switcher-content'] = value[i].content;
                }

                if (typeof value[i].title !== 'undefined') {
                    value[i]['content-switcher-title'] = value[i].title;
                }
            }

            this.getElm().value = JSON.encode(value);
            this.parent();
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

