
/**
 * Area manager for the site object
 *
 * @module package/quiqqer/blocks/bin/Site/Category
 * @author www.pcsg.de (Henning Leutz)
 *
 * @event onLoaded
 */

define('package/quiqqer/blocks/bin/Site/Category', [

    'qui/QUI',
    'qui/controls/Control',
    'qui/controls/loader/Loader',
    'Ajax',
    'Locale',
    'package/quiqqer/blocks/bin/Site/Area',

    'css!package/quiqqer/blocks/bin/Site/Category.css'

], function (QUI, QUIControl, QUILoader, QUIAjax, QUILocale, Area)
{
    "use strict";

    return new Class({

        Extends : QUIControl,
        Type    : 'package/quiqqer/blocks/bin/Site/Category',

        Binds : [
            '$onInject',
            '$onDestroy'
        ],

        initialize: function (options)
        {
            this.parent(options);

            this.Loader = new QUILoader();
            this.areas  = [];

            this.addEvents({
                onInject  : this.$onInject,
                onDestroy : this.$onDestroy
            });
        },

        /**
         * Return the domnode element
         * @return {HTMLElement}
         */
        create: function ()
        {
            this.$Elm = new Element('div', {
                'class' : 'quiqqer-blocks-site-category'
            });

            this.Loader.inject( this.$Elm );


            return this.$Elm;
        },

        /**
         * event : on inject
         */
        $onInject : function()
        {
            var self = this;

            this.Loader.show();

            this.getBlockAreas(function(blocks)
            {
                var i, len, data, AC;

                var Site  = self.getAttribute( 'Site'),
                    areas = Site.getAttribute( 'quiqqer.blocks.areas' );

                if ( areas ) {
                    areas = JSON.decode(areas);
                }

                for ( i = 0, len = blocks.length; i < len; i++ )
                {
                    AC = self.$insertBlockAreaEdit( blocks[ i ] );

                    if ( typeof areas[ AC.getAttribute('name') ] === 'undefined' ) {
                        continue;
                    }

                    data = areas[ AC.getAttribute('name') ];

                    data.each(function(blockId) {
                        AC.addBlockById( blockId );
                    });
                }

                self.Loader.hide();
                self.fireEvent( 'loaded' );
            });
        },

        /**
         * event : on destroy
         */
        $onDestroy : function()
        {
            var i, len, AC;

            var Site  = this.getAttribute( 'Site'),
                areas = {};

            for ( i = 0, len = this.areas.length; i < len; i++ )
            {
                AC = this.areas[ i ];

                areas[ AC.getAttribute( 'name' ) ] = AC.getData();
            }

            Site.setAttribute( 'quiqqer.blocks.areas', JSON.encode( areas ) );
        },

        /**
         * Return the available for the site
         * @param {Function} callback - callback function
         */
        getBlockAreas : function(callback)
        {
            var Site    = this.getAttribute( 'Site'),
                Project = Site.getProject();

            QUIAjax.get('package_quiqqer_blocks_ajax_project_getAreas', callback, {
                'package' : 'quiqqer/blocks',
                project   : Project.encode(),
                siteType  : Site.getAttribute( 'type' )
            });
        },

        /**
         * Create a block area edit container
         *
         * @param {Object} area - Data of the area
         * @return Area
         */
        $insertBlockAreaEdit : function(area)
        {
            var Site    = this.getAttribute( 'Site'),
                Project = Site.getProject(),
                Control = new Area();

            Control.setAttribute( 'Project', Project );
            Control.setAttribute( 'Site', Site );
            Control.setAttributes( area );

            Control.inject( this.$Elm );

            this.areas.push( Control );

            return Control;
        }
    });

});