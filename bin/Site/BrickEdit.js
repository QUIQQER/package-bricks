
/**
 * Area edit control for the site object
 *
 * @module package/quiqqer/bricks/bin/Site/Area
 * @author www.pcsg.de (Henning Leutz)
 *
 */

define('package/quiqqer/bricks/bin/Site/BrickEdit', [

    'qui/QUI',
    'qui/controls/Control',
    'qui/controls/loader/Loader'

], function(QUI, QUIControl, QUILoader)
{
    "use strict";

    var lg = 'quiqqer/bricks';

    return new Class({

        Extends: QUIControl,
        Type: 'package/quiqqer/bricks/bin/Site/BrickEdit',

        initialize : function(options)
        {
            this.parent(options);

            this.Loader = new QUILoader();
        },

        /**
         * Return the domnode element
         *
         * @returns {HTMLDivElement}
         */
        create : function()
        {
            this.$Elm = new Element('div', {
                'class' : 'quiqqer-bricks-site-brickedit'
            });

            this.Loader.inject(this.$Elm);


            return this.$Elm;
        },

        /**
         * event on inject
         */
        $onInject : function()
        {
            this.Loader.show();
        }
    });
});
