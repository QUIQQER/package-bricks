/**
 * Area edit control for the site object
 *
 * @module package/quiqqer/blocks/bin/Site/Area
 * @author www.pcsg.de (Henning Leutz)
 */

define('package/quiqqer/blocks/bin/Site/Area', [

    'qui/QUI',
    'qui/controls/Control',
    'qui/controls/buttons/Button',
    'Locale',
    'Ajax',

    'css!package/quiqqer/blocks/bin/Site/Area'

], function (QUI, QUIControl, QUIButton, QUILocale, QUIAjax)
{
    "use strict";

    return new Class({

        Extends : QUIControl,
        Type    : 'package/quiqqer/blocks/bin/Site/Area',

        Binds : [
            'addBlock',
            '$onInject'
        ],

        options : {
            name        : '',
            description : '',
            title       : {},
            Site        : false
        },

        initialize: function (options)
        {
            this.parent( options );

            this.$AddButton       = false;
            this.$availableBlocks = [];
            this.$loaded          = false;
            this.$blockIds        = [];

            this.addEvents({
                onInject : this.$onInject
            });
        },

        /**
         * Return the domnode element
         * @return {Element}
         */
        create: function ()
        {
            var title = this.getAttribute( 'title' );

            this.$Elm = new Element('div', {
                'class' : 'quiqqer-blocks-site-category-area',
                html    : '<div class="quiqqer-blocks-site-category-area-title">'+
                              QUILocale.get( title.group, title.var ) +
                          '   <div class="quiqqer-blocks-site-category-area-buttons"></div>' +
                          '</div>',
                'data-name' : this.getAttribute( 'name' )
            });

            var Buttons = this.$Elm.getElement(
                '.quiqqer-blocks-site-category-area-buttons'
            );

            this.$AddButton = new QUIButton({
                text      : 'Block hinzufügen',
                textimage : 'icon-plus',
                disable   : true,
                events    : {
                    onClick : this.addBlock
                }
            }).inject( Buttons );

            return this.$Elm;
        },

        /**
         * event : on inject
         */
        $onInject : function()
        {
            var self    = this,
                Site    = this.getAttribute( 'Site'),
                Project = Site.getProject();

            QUIAjax.get('package_quiqqer_blocks_ajax_project_getBlocks', function(blocks)
            {
                self.$AddButton.enable();

                self.$availableBlocks = blocks;
                self.$loaded = true;

                self.$blockIds.each(function(blockId) {
                    self.addBlockById( blockId );
                });

            }, {
                'package' : 'quiqqer/blocks',
                project   : Project.encode()
            });
        },

        /**
         * Return the block list
         * @returns {array}
         */
        getData : function()
        {
            return this.$Elm.getElements('select').map(function(Select) {
                return Select.value;
            });
        },

        /**
         * Add a block by its ID
         *
         * @param blockId
         */
        addBlockById : function(blockId)
        {
            if ( !this.$loaded )
            {
                this.$blockIds.push( blockId );
                return;
            }

            var found = this.$availableBlocks.filter(function(Item) {
                return Item.id === blockId;
            });

            if ( !found.length ) {
                return;
            }

            this.addBlock().getElement( 'select').set( 'value', blockId );
        },

        /**
         * Add a block selection to the area
         */
        addBlock : function()
        {
            var i, len, Select;

            var Elm = new Element('div', {
                'class' : 'quiqqer-blocks-site-category-area-block',
                html    : '<select></select>'
            });

            Elm.inject( this.$Elm );
            Select = Elm.getElement( 'select' );

            new QUIButton({
                title  : 'Block löschen',
                icon   : 'icon-remove-circle',
                events :
                {
                    onClick : function() {
                        Elm.destroy();
                    }
                }
            }).inject( Elm );


            for ( i = 0, len = this.$availableBlocks.length; i < len; i++ )
            {
                new Element('option', {
                    html  : this.$availableBlocks[ i ].title,
                    value : this.$availableBlocks[ i ].id
                }).inject( Select );
            }

            return Elm;
        }
    });
});
