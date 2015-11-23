
/**
 *
 * @module package/quiqqer/bricks/bin/Controls/ContentSwitcher
 *
 * @require qui/controls/elements/FormList
 * @require css!package/quiqqer/bricks/bin/Controls/ContentSwitcher.css
 */
define('package/quiqqer/bricks/bin/Controls/ContentSwitcher', [

    'qui/controls/elements/FormList',

    'css!package/quiqqer/bricks/bin/Controls/ContentSwitcher.css'

], function(QUIFormList)
{
    "use strict";

    return new Class({

        Extends : QUIFormList,
        Type    : 'package/quiqqer/bricks/bin/Controls/ContentSwitcher',

        initialize : function(options)
        {
            this.parent( options );

            this.setAttribute(
            'entry',

            '<div class="quiqqer-bricks-ContentSwitcher-entry">' +
                '<label>' +
                    '<span>Bild</span>' +
                    '<input type="text" name="img" />' +
                '</label>' +
                '<label>' +
                    '<span>Überschrift</span>' +
                    '<input type="text" name="title" />' +
                '</label>' +
                '<label>' +
                    '<span>Text</span>' +
                    '<textarea name="content" rows="10"></textarea>' +
                '</label>' +
            '</div>'
            );
        }
    });
});

