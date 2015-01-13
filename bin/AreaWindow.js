
/**
 * AreaWindow Control
 * List of the areas which are available
 *
 * @module package/quiqqer/bricks/bin/AreaWindow
 * @author www.pcsg.de (Henning Leutz)
 *
 * @event onSubmit [ this, areas ]
 */

define('package/quiqqer/bricks/bin/AreaWindow', [

    'qui/QUI',
    'qui/controls/windows/Confirm',
    'package/quiqqer/bricks/bin/Area',
    'Ajax',
    'Locale'

], function(QUI, QUIConfirm, Area, Ajax, QUILocale)
{
    "use strict";

    return new Class({

        Extends : QUIConfirm,
        Type    : 'package/quiqqer/bricks/bin/AreaWindow',

        Binds : [
            '$onOpen'
        ],

        options : {
            title : QUILocale.get( 'quiqqer/bricks', 'area.window.title' ),
            projectName : false,
            projectLang : false,
            maxHeight : 500,
            maxWidth  : 400
        },

        initialize : function(options)
        {
            this.parent( options );

            this.addEvents({
                onOpen : this.$onOpen
            });
        },

        /**
         * event : on open
         */
        $onOpen : function()
        {
            var self = this;

            this.Loader.show();

            this.getList(function(result)
            {
                var i, len, desc, title;
                var Content = self.getContent();

                for ( i = 0, len = result.length; i < len; i++ )
                {
                    title = result[ i ].title;
                    desc  = result[ i ].description;

                    new Area({
                        title       : QUILocale.get( title.group, title['var'] ),
                        description : QUILocale.get( desc.group, desc['var'] ),
                        area        : result[ i ].name
                    }).inject( Content );
                }

                self.Loader.hide();
            });
        },

        /**
         * Return the areas of the project
         *
         * @param {Function} callback
         */
        getList : function(callback)
        {
            Ajax.get('package_quiqqer_bricks_ajax_project_getAreas', callback, {
                'package' : 'quiqqer/brick',
                project   : JSON.encode({
                    name : this.getAttribute( 'projectName' ),
                    lang : this.getAttribute( 'projectLang' )
                })
            });
        },

        /**
         * Submit the window
         */
        submit : function()
        {
            var Content = this.getContent();

            var areas = Content.getElements(
                '.quiqqer-bricks-area-selected'
            ).map(function(Elm) {
                return Elm.get( 'data-area' );
            });

            this.fireEvent( 'submit', [ this, areas ] );

            if ( this.getAttribute( 'autoclose' ) ) {
                this.close();
            }
        }
    });
});
