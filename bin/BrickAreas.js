
/**
 * BrickAreas Control
 * Edit and change the areas for the brick
 *
 * @module package/quiqqer/bricks/bin/BrickAreas
 * @author www.pcsg.de (Henning Leutz)
 *
 * @event onLoaded [ this ]
 */

define('package/quiqqer/bricks/bin/BrickAreas', [

    'qui/QUI',
    'qui/controls/Control',
    'qui/controls/buttons/Button',
    'package/quiqqer/bricks/bin/AreaWindow',
    'Ajax',
    'Locale',

    'css!package/quiqqer/bricks/bin/BrickAreas.css'

], function(QUI, QUIControl, QUIButton, AreaWindow, Ajax, QUILocale)
{
    "use strict";

    return new Class({

        Extends : QUIControl,
        Type    : 'package/quiqqer/bricks/bin/BrickAreas',

        Binds : [
            '$onDestroy'
        ],

        options : {
            brickId : false, // brickId
            styles  : false,
            projectName : false,
            projectLang : false,
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
                'class' : 'quiqqer-bricks-brickareas',
                html    : '<div class="quiqqer-bricks-brickareas-container"></div>' +
                          '<div class="quiqqer-bricks-brickareas-buttons"></div>'
            });

            if ( this.getAttribute( 'styles' ) ) {
                this.$Elm.setStyles( this.getAttribute( 'styles' ) );
            }

            this.$Container = this.$Elm.getElement( '.quiqqer-bricks-brickareas-container' );
            this.$Buttons   = this.$Elm.getElement( '.quiqqer-bricks-brickareas-buttons' );

            new QUIButton({
                text   : 'Brickbereich hinzufügen',
                styles : {
                    width : '100%'
                },
                events :
                {
                    onClick : function()
                    {
                        new AreaWindow({
                            projectName : self.getAttribute( 'projectName' ),
                            projectLang : self.getAttribute( 'projectLang' ),
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
                areas.map(function(area)
                {
                    if ( area !== '' ) {
                        self.addArea( area );
                    }
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
                'class' : 'quiqqer-bricks-brickareas-area',
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
