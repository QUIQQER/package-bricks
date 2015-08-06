
/**
 *
 */
define('package/quiqqer/bricks/bin/Controls/Pagination', [

    'qui/QUI',
    'qui/controls/Control'

], function(QUI, QUIControl)
{
    "use strict";

    return new Class({

        Extends : QUIControl,
        Type : 'package/quiqqer/bricks/bin/Controls/Pagination',

        Binds : [
            '$onImport'
        ],

        initialize : function(options)
        {
            this.parent(options);

            this.addEvents({
                onInsert : this.$onImport
            });
        },

        /**
         * event : on import
         */
        $onImport : function()
        {
console.log(this.$Elm);
        }

    });
});