
/**
 * Block manager
 *
 * @module package/quiqqer/blocks/bin/Manager
 * @author www.pcsg.de (Henning Leutz)
 */

define('package/quiqqer/blocks/bin/Manager', [

    'qui/QUI',
    'qui/controls/desktop/Panel',
    'Locale'

], function(QUI, QUIPanel, QUILocale)
{
    "use strict";

    var lg = 'quiqqer/blocks';

    return new Class({

        Extends : QUIPanel,
        Type    : 'package/quiqqer/blocks/bin/Manager',

        Binds : [
            '$onCreate'
        ],

        options : {
            title : QUILocale.get( lg, 'menu.blocks.text' )
        },

        initialize : function(options)
        {
            this.parent( options );

            this.addEvents({
                onCreate : this.$onCreate
            });
        },

        /**
         * event : on create
         */
        $onCreate : function()
        {

        }
    });
});
