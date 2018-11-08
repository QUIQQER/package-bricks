/**
 * @module package/quiqqer/bricks/bin/Controls/CustomerReviews
 * @author www.pcsg.de (Michael Danielczok)
 */
define('package/quiqqer/bricks/bin/Controls/CustomerReviews', [

    'qui/controls/elements/FormList',
    'utils/Controls',
    'Locale',

    'css!package/quiqqer/bricks/bin/Controls/ContentSwitcher.css' //todo needed css?

], function (QUIFormList, QUIControls, QUILocale) {
    "use strict";

    var lg = 'quiqqer/bricks';

    return new Class({

        Extends: QUIFormList,
        Type   : 'package/quiqqer/bricks/bin/Controls/CustomerReviews',

        Binds: [
            '$onParsed'
        ],

        initialize: function (options) {
            this.parent(options);

            this.addEvents({
                onParsed  : this.$onParsed
            });

            this.setAttributes({
                    buttonText: QUILocale.get(lg, 'customerReviews.reviews.addButton'),
                entry: '<div class="quiqqer-bricks-ContentSwitcher-entry" style="display: none;">' +
                           '<label class="entry-title">' +
                               '<span class="entry-title">' +
                                 QUILocale.get(lg, 'customerReviews.reviews.entry.avatar') +
                               '</span>' +
                               '<input class="media-image" data-qui-options-selectable_types="image" name="userImage"/>' +
                           '</label>' +
                           '<label>' +
                               '<span class="entry-title">' +
                                 QUILocale.get(lg, 'customerReviews.reviews.entry.userName') +
                               '</span>' +
                               '<input type="text" name="userName" placeholder="' + QUILocale.get(lg, 'customerReviews.reviews.entry.userName.placeholder') + '"/>' +
                           '</label>' +
                           '<label>' +
                               '<span class="entry-title">' +
                                    QUILocale.get(lg, 'customerReviews.reviews.entry.userTitle') +
                               '</span>' +
                               '<input type="text" name="userTitle" placeholder="' + QUILocale.get(lg, 'customerReviews.reviews.entry.userTitle.placeholder') + '" />' +
                            '</label>' +
                           '<label>' +
                               '<span class="entry-title">' +
                                  QUILocale.get(lg, 'customerReviews.reviews.entry.content') +
                               '</span>' +
                               '<input name="content" class="field-container-field field-description" data-qui="controls/editors/Input" />' +
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

