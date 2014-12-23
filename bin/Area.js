
/**
 * BlockAreas Control
 * Edit and change the areas for the block
 *
 * @module package/quiqqer/blocks/bin/BlockAreas
 * @author www.pcsg.de (Henning Leutz)
 *
 * @event onLoaded [ this ]
 */

define('package/quiqqer/blocks/bin/Area', [

    'qui/QUI',
    'qui/controls/Control',
    'qui/controls/buttons/Button',
    'package/quiqqer/blocks/bin/AreaWindow',
    'Ajax',
    'Locale',

    'css!package/quiqqer/blocks/bin/Area.css'

], function(QUI, QUIControl)
{
    "use strict";

    return new Class({

        Extends : QUIControl,
        Type    : 'package/quiqqer/blocks/bin/Area',

        Binds : [
            'toggle'
        ],

        options : {
            area        : false,
            title       : false,
            description : false
        },

        initialize : function(options)
        {
            this.parent( options );

            this.$Title    = false;
            this.$Desc     = false;
            this.$selected = false;
        },

        /**
         * Return the HTML Node Element
         *
         * @return {HTMLElement}
         */
        create : function()
        {
            this.$Elm = new Element('div', {
                'class' : 'quiqqer-blocks-area smooth',
                html    : '<div class="quiqqer-blocks-area-icon">' +
                              '<span class="icon-list-alt"></span>' +
                          '</div>' +
                          '<div class="quiqqer-blocks-area-content">' +
                              '<div class="quiqqer-blocks-area-content-title"></div>' +
                              '<div class="quiqqer-blocks-area-content-description"></div>' +
                          '</div>',
                events : {
                    click : this.toggle
                }
            });

            this.$Title = this.$Elm.getElement( '.quiqqer-blocks-area-content-title' );
            this.$Desc  = this.$Elm.getElement( '.quiqqer-blocks-area-content-description' );

            if ( this.getAttribute( 'area' ) ) {
                this.$Elm.set( 'data-area', this.getAttribute( 'area' ) );
            }

            if ( this.getAttribute( 'title' ) ) {
                this.$Title.set( 'html', this.getAttribute( 'title' ) );
            }

            if ( this.getAttribute( 'description' ) ) {
                this.$Desc.set( 'html', this.getAttribute( 'description' ) );
            }


            return this.$Elm;
        },

        /**
         * toggle the select status
         */
        toggle : function()
        {
            if ( this.$selected )
            {
                this.unselect();
                return;
            }

            this.select();
        },

        /**
         * Select the area
         */
        select : function()
        {
            if ( this.$selected ) {
                return;
            }

            this.$selected = true;
            this.$Elm.addClass( 'quiqqer-blocks-area-selected' );
        },

        /**
         * Unselect the area
         */
        unselect : function()
        {
            if ( this.$selected === false ) {
                return;
            }

            this.$selected = false;
            this.$Elm.removeClass( 'quiqqer-blocks-area-selected' );
        }
    });
});
