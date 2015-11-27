
/**
 *
 * @module package/quiqqer/bricks/bin/Controls/SocialBox
 *
 * @require qui/controls/elements/FormList
 * @require css!package/quiqqer/bricks/bin/Controls/SocialBox.css
 */
define('package/quiqqer/bricks/bin/Controls/SocialBox', [

    'qui/controls/elements/FormList',

    'css!package/quiqqer/bricks/bin/Controls/SocialBox.css'

], function (QUIFormList) {
    "use strict";

    return new Class({

        Extends : QUIFormList,
        Type    : 'package/quiqqer/bricks/bin/Controls/SocialBox',

        initialize : function (options) {
            this.parent(options);

            this.setAttribute(
                'entry',

                '<div class="quiqqer-bricks-socialBox-entry">' +
                    '<label>' +
                        '<span>Url</span>' +
                        '<input type="text" name="url" />' +
                    '</label>' +
                    '<label>' +
                        '<span>Icon</span>' +
                        '<input type="text" name="icon" />' +
                    '</label>' +
                    '<label>' +
                        '<span>Hintergrundfarbe</span>' +
                        '<input type="text" name="background" />' +
                    '</label>' +
                '</div>'
            );
        }
    });
});
