
/**
 * BlockAreas Control
 * Edit and change the areas for the block
 *
 * @module package/quiqqer/blocks/bin/BlockAreas
 * @author www.pcsg.de (Henning Leutz)
 *
 * @event onLoaded [ this ]
 */

define('package/quiqqer/blocks/bin/BlockAreas', [

    'qui/QUI',
    'qui/controls/Control',
    'qui/controls/buttons/Button',
    'package/quiqqer/blocks/bin/AreaWindow',
    'Ajax',
    'Locale',

    'css!package/quiqqer/blocks/bin/BlockAreas.css'

], function(QUI, QUIControl, QUIButton, AreaWindow, Ajax, QUILocale)
{
    "use strict";

    return new Class({

        Extends : QUIControl,
        Type    : 'package/quiqqer/blocks/bin/BlockAreas',

        Binds : [
            '$onDestroy'
        ],

        options : {
            blockId : false, // blockId
            styles  : false,
            project : false,
            areas   : false
        },

        initialize : function(options)
        {
            this.parent( options );

            this.$areas = {};
        },

        /**
         * Return the HTML Node Element
         *
         * @return {HTMLElement}
         */
        create : function()
        {
            var self = this;

            this.$Elm = new Element('div', {
                'class' : 'quiqqer-blocks-blockareas',
                html    : '<div class="quiqqer-blocks-blockareas-container"></div>' +
                          '<div class="quiqqer-blocks-blockareas-buttons"></div>'
            });

            if ( this.getAttribute( 'styles' ) ) {
                this.$Elm.setStyles( this.getAttribute( 'styles' ) );
            }

            this.$Container = this.$Elm.getElement( '.quiqqer-blocks-blockareas-container' );
            this.$Buttons   = this.$Elm.getElement( '.quiqqer-blocks-blockareas-buttons' );

            new QUIButton({
                text   : 'Blockbereich hinzufügen',
                styles : {
                    width : '100%'
                },
                events :
                {
                    onClick : function()
                    {
                        new AreaWindow({
                            project : self.getAttribute( 'project' ),
                            events  :
                            {
                                onSubmit : function(Win, areas)
                                {
                                    for ( var i = 0, len = areas.length; i < len; i++ ) {
                                        self.addArea( areas[ i ] );
                                    }
                                }
                            }
                        }).open();
                    }
                }
            }).inject( this.$Buttons );

            var areas = this.getAttribute( 'areas' );

            if ( areas )
            {
                areas.map(function(area) {
                    self.addArea( area );
                });
            }

            return this.$Elm;
        },

        /**
         * Add an area
         * @param {String} area - name of the area
         */
        addArea : function(area)
        {
            if ( area in this.$areas ) {
                return;
            }

            this.$areas[ area ] = true;

            new Element('div', {
                'class' : 'quiqqer-blocks-blockareas-area',
                html    : area
            }).inject( this.$Container );
        },

        /**
         * Return the areas
         *
         * @return {Array}
         */
        getAreas : function()
        {
            var result = [];

            for ( var area in this.$areas )
            {
                if ( this.$areas.hasOwnProperty( area ) ) {
                    result.push( area );
                }
            }

            return result;
        }
    });
});
