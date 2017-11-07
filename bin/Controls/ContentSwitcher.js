
/**
 *
 * @module package/quiqqer/bricks/bin/Controls/ContentSwitcher
 *
 * @require qui/controls/elements/FormList
 * @require css!package/quiqqer/bricks/bin/Controls/ContentSwitcher.css
 */
define('package/quiqqer/bricks/bin/Controls/ContentSwitcher', [

    'qui/controls/elements/FormList',

    'Locale',

    'css!package/quiqqer/bricks/bin/Controls/ContentSwitcher.css'

], function (QUIFormList, QUILocale) {
    "use strict";

    var lg = 'quiqqer/bricks';

    return new Class({

        Extends : QUIFormList,
        Type    : 'package/quiqqer/bricks/bin/Controls/ContentSwitcher',

        initialize : function (options) {
            this.parent(options);

            this.setAttribute(
            'entry',

            '<div class="quiqqer-bricks-ContentSwitcher-entry">' +
                '<label>' +
                    '<span class="entry-title">'+
                        QUILocale.get(lg, 'contentSwitcher.entries.entry.picture') +
                    '</span>' +
                    '<input type="text" class="media-image" name="img" />' +
                '</label>' +
                '<label>' +
                    '<span class="entry-title">'+
                        QUILocale.get(lg, 'contentSwitcher.entries.entry.title') +
                    '</span>' +
                    '<input type="text" name="title" />' +
                '</label>' +
                '<label>' +
                    '<span class="entry-title">'+
                        QUILocale.get(lg, 'contentSwitcher.entries.entry.content') +
                    '</span>' +
                    '<textarea name="content" rows="10"></textarea>' +
                '</label>' +
            '</div>'
            );
        }
    });
});

