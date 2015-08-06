
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
        Type : '',

        Binds : [
            '$onInsert'
        ],

        initialize : function(options)
        {
            this.parent(options);

            this.addEvents({
                onInsert : this.$onInsert
            });
        },


        $onInsert : function()
        {

        }

    });
});