/**
 * Area edit control for the site object
 *
 * @module package/quiqqer/bricks/bin/Site/Area
 * @author www.pcsg.de (Henning Leutz)
 */

define('package/quiqqer/bricks/bin/Site/Area', [

    'qui/QUI',
    'qui/controls/Control',
    'qui/controls/buttons/Button',
    'qui/controls/windows/Popup',
    'qui/controls/elements/List',
    'Locale',
    'Ajax',

    'css!package/quiqqer/bricks/bin/Site/Area'

], function (QUI, QUIControl, QUIButton, QUIPopup, QUIList, QUILocale, QUIAjax)
{
    "use strict";

    return new Class({

        Extends : QUIControl,
        Type    : 'package/quiqqer/bricks/bin/Site/Area',

        Binds : [
            'openBrickDialog',
            'addBrick',
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
            this.$availableBricks = [];
            this.$loaded          = false;
            this.$brickIds        = [];

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
                'class' : 'quiqqer-bricks-site-category-area',
                html    : '<div class="quiqqer-bricks-site-category-area-title">'+
                              QUILocale.get( title.group, title.var ) +
                          '   <div class="quiqqer-bricks-site-category-area-buttons"></div>' +
                          '</div>',
                'data-name' : this.getAttribute( 'name' )
            });

            var Buttons = this.$Elm.getElement(
                '.quiqqer-bricks-site-category-area-buttons'
            );

            this.$AddButton = new QUIButton({
                text      : 'Brick hinzufügen',
                textimage : 'icon-plus',
                disable   : true,
                events    : {
                    onClick : this.openBrickDialog
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

            QUIAjax.get('package_quiqqer_bricks_ajax_project_getBricks', function(bricks)
            {
                self.$AddButton.enable();

                self.$availableBricks = bricks;
                self.$loaded = true;

                self.$brickIds.each(function(brickId) {
                    self.addBrickById( brickId );
                });

            }, {
                'package' : 'quiqqer/bricks',
                project   : Project.encode(),
                area      : this.getAttribute( 'name' )
            });
        },

        /**
         * Return the brick list
         * @returns {array}
         */
        getData : function()
        {
            return this.$Elm.getElements('select').map(function(Select) {
                return Select.value;
            });
        },

        /**
         * Add a brick by its ID
         *
         * @param brickId
         */
        addBrickById : function(brickId)
        {
            if ( !this.$loaded )
            {
                this.$brickIds.push( brickId );
                return;
            }

            var found = this.$availableBricks.filter(function(Item) {
                return Item.id === brickId;
            });

            if ( !found.length ) {
                return;
            }

            this.addBrick().getElement( 'select').set( 'value', brickId );
        },

        /**
         * Add a brick selection to the area
         */
        addBrick : function()
        {
            var i, len, Select;

            var Elm = new Element('div', {
                'class' : 'quiqqer-bricks-site-category-area-brick',
                html    : '<select></select>'
            });

            Elm.inject( this.$Elm );
            Select = Elm.getElement( 'select' );

            new QUIButton({
                title  : 'Brick löschen',
                icon   : 'icon-remove-circle',
                events :
                {
                    onClick : function() {
                        Elm.destroy();
                    }
                }
            }).inject( Elm );


            for ( i = 0, len = this.$availableBricks.length; i < len; i++ )
            {
                new Element('option', {
                    html  : this.$availableBricks[ i ].title,
                    value : this.$availableBricks[ i ].id
                }).inject( Select );
            }

            return Elm;
        },

        /**
         * Opens the brick add dialog
         */
        openBrickDialog : function()
        {
            if ( !this.$availableBricks.length ) {
                return;
            }

            var self = this;

            new QUIPopup({
                title     : 'Baustein hinzufügen',
                icon      : 'icon-th',
                maxWidth  : 500,
                maxHeight : 600,
                autoclose : false,
                events    :
                {
                    onOpen : function(Win)
                    {
                        var items   = [],
                            Content = Win.getContent(),

                            List = new QUIList({
                                events :
                                {
                                    onClick : function(List, data)
                                    {
                                        self.addBrickById( data.brickId );
                                        Win.close();
                                    }
                                }
                            });

                        List.inject( Content );

                        for ( var i = 0, len = self.$availableBricks.length; i < len; i++ )
                        {
                            items.push({
                                brickId : self.$availableBricks[ i ].id,
                                icon    : 'icon-th',
                                title   : self.$availableBricks[ i ].title,
                                text    : self.$availableBricks[ i ].description
                            });
                        }

                        List.addItems( items );
                    }
                }
            }).open();
        }
    });
});
