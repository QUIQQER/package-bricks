
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
    'qui/controls/windows/Confirm',
    'qui/controls/elements/List',
    'Locale',
    'Ajax',

    'css!package/quiqqer/bricks/bin/Site/Area'

], function (QUI, QUIControl, QUIButton, QUIPopup, QUIConfirm, QUIList, QUILocale, QUIAjax)
{
    "use strict";

    var lg = 'quiqqer/bricks';


    return new Class({

        Extends : QUIControl,
        Type    : 'package/quiqqer/bricks/bin/Site/Area',

        Binds : [
            'openBrickDialog',
            'openBrickSettingDialog',
            'openSettingsDialog',
            'createNewBrick',
            '$onInject'
        ],

        options : {
            name        : '',
            description : '',
            title       : {},
            Site        : false,
            deactivate  : false
        },

        initialize: function (options)
        {
            this.parent( options );

            this.$AddButton       = false;
            this.$SettingsButton  = false;
            this.$availableBricks = [];
            this.$loaded          = false;
            this.$brickIds        = [];
            this.$brickData       = [];

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
                text      : QUILocale.get( lg, 'site.area.button.add' ),
                textimage : 'icon-plus',
                disable   : true,
                events    : {
                    onClick : this.openBrickDialog
                }
            }).inject( Buttons );

            this.$SettingsButton = new QUIButton({
                title  : QUILocale.get( lg, 'site.area.button.area.settings' ),
                icon   : 'icon-gears',
                events : {
                    onClick : this.openSettingsDialog
                },
                styles : {
                    marginLeft : 10
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
                Site    = this.getAttribute( 'Site' ),
                Project = Site.getProject();

            QUIAjax.get('package_quiqqer_bricks_ajax_project_getBricks', function(bricks)
            {
                self.$AddButton.enable();

                self.$availableBricks = bricks;
                self.$loaded = true;

                self.$brickIds.each(function(brickId) {
                    self.addBrickById( brickId );
                });

                self.$brickData.each(function(brickData) {
                    self.addBrick( brickData );
                });

            }, {
                'package' : 'quiqqer/bricks',
                project   : Project.encode(),
                area      : this.getAttribute( 'name' )
            });
        },

        /**
         * Activate the area
         */
        activate : function()
        {
            this.setAttribute( 'deactivate', false );
            this.getElm().removeClass( 'quiqqer-bricks-site-category-area-deactivate' );

            this.$AddButton.enable();
        },

        /**
         * Deactivate the area
         */
        deactivate : function()
        {
            var self = this,
                data = this.getData();

            if ( data.length && !("deactivate" in data[ 0 ]) )
            {
                new QUIConfirm({
                    title : QUILocale.get( lg, 'site.area.window.deactivate.title' ),
                    text  : QUILocale.get( lg, 'site.area.window.deactivate.text' ),
                    information : QUILocale.get( lg, 'site.area.window.deactivate.information' ),
                    events :
                    {
                        onSubmit : function()
                        {
                            self.clear();
                            self.setAttribute( 'deactivate', true );
                            self.deactivate();
                        }
                    }
                }).open();

                return;
            }

            this.setAttribute( 'deactivate', true );

            this.$AddButton.disable();
            this.getElm().addClass( 'quiqqer-bricks-site-category-area-deactivate' );
        },

        /**
         * Add a brick by its brick data
         * @param {Object} brickData - { brickId:1, inheritance:1 }
         */
        addBrick : function(brickData)
        {
            if ( "deactivate" in brickData )
            {
                this.clear();
                this.setAttribute( 'deactivate', true );
                this.deactivate();
                return;
            }


            if ( !this.$loaded )
            {
                this.$brickData.push( brickData );
                return;
            }

            var BrickNode = this.addBrickById( brickData.brickId );

            if ( !BrickNode ) {
                return;
            }

            var Select = BrickNode.getElement( 'select' );

            Select.set( 'data-inheritance', 0 );

            if ( "inheritance" in brickData ) {
                Select.set( 'data-inheritance', brickData.inheritance );
            }
        },

        /**
         * Add a brick by its ID
         *
         * @param {Number} brickId
         * @return {HTMLElement|Boolean} Brick-Node
         */
        addBrickById : function(brickId)
        {
            if ( !this.$loaded )
            {
                this.$brickIds.push( brickId );
                return false;
            }

            var found = this.$availableBricks.filter(function(Item) {
                return Item.id === brickId;
            });

            if ( !found.length ) {
                return false;
            }

            var BrickNode = this.createNewBrick();

            BrickNode.getElement( 'select' ).set( 'value', brickId );

            return BrickNode;
        },

        /**
         * Removes all bricks in the area
         */
        clear : function()
        {
            this.getElm().getElements( '.quiqqer-bricks-site-category-area-brick' ).destroy();
        },

        /**
         * Add a new brick to the area
         */
        createNewBrick : function()
        {
            var i, len, Select;

            var self = this;

            var Elm = new Element('div', {
                'class' : 'quiqqer-bricks-site-category-area-brick',
                html    : '<select></select>'
            });

            Elm.inject( this.$Elm );
            Select = Elm.getElement( 'select' );

            new QUIButton({
                title  : QUILocale.get( lg, 'site.area.button.delete' ),
                icon   : 'icon-remove',
                events :
                {
                    onClick : function() {
                        self.openBrickDeleteDialog( Elm );
                    }
                }
            }).inject( Elm );

            new QUIButton({
                title  : QUILocale.get( lg, 'site.area.button.settings' ),
                icon   : 'icon-gear',
                events :
                {
                    onClick : function(Btn)
                    {
                        var Elm    = Btn.getElm(),
                            Parent = Elm.getParent( '.quiqqer-bricks-site-category-area-brick' ),
                            Select = Parent.getElement( 'select' );

                        self.openBrickSettingDialog( Select );
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
         * Return the brick list
         * @returns {Array}
         */
        getData : function()
        {
            if ( this.getAttribute( 'deactivate' ) )
            {
                return [{
                    deactivate : 1
                }];
            }

            var i, len;

            var data   = [],
                bricks = this.$Elm.getElements( 'select' );

            for ( i = 0, len = bricks.length; i < len; i++ )
            {
                data.push({
                    brickId     : bricks[ i ].value,
                    inheritance : bricks[ i ].get( 'data-inheritance' ) == 1 ? 1 : 0
                });
            }

            return data;
        },

        /**
         * dialogs
         */

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
                title     : QUILocale.get( lg, 'site.area.window.add' ),
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
        },

        /**
         * Opens the brick deletion dialog
         *
         * @param {HTMLElement} BrickElement - Element of the Brick
         */
        openBrickDeleteDialog : function(BrickElement)
        {
            new QUIConfirm({
                title : QUILocale.get( lg, 'site.area.window.delete.title' ),
                icon  : 'icon-remove',
                text  : QUILocale.get( lg, 'site.area.window.delete.text' ),
                information : QUILocale.get( lg, 'site.area.window.delete.information' ),
                maxHeight   : 300,
                maxWidth    : 500,
                events :
                {
                    onSubmit : function() {
                        BrickElement.destroy();
                    }
                }
            }).open();
        },

        /**
         * Opens the brick settings dialog
         *
         * @param {HTMLElement} Select
         */
        openBrickSettingDialog : function(Select)
        {
            new QUIConfirm({
                title     : QUILocale.get( lg, 'site.area.window.settings.title' ),
                icon      : 'icon-gear',
                maxWidth  : 400,
                maxHeight : 300,
                autoclose : false,
                events    :
                {
                    onOpen : function(Win)
                    {
                        var Content = Win.getContent();

                        Content.set(
                            'html',

                            '<form>' +
                            '    <label>' +
                            '        <input type="checkbox" name="inheritance" />' +
                                     QUILocale.get( lg, 'site.area.window.settings.setting.inheritance' ) +
                            '    </label>' +
                            '</form>'
                        );

                        var Form = Win.getContent().getElement( 'form' ),
                            elms = Form.elements;

                        elms.inheritance.checked = Select.get( 'data-inheritance' ).toInt();
                    },

                    onSubmit : function(Win)
                    {
                        var Form = Win.getContent().getElement( 'form' );

                        Select.set({
                            'data-inheritance' : Form.elements.inheritance.checked ? 1 : 0
                        });

                        Win.close();
                    }
                }
            }).open();
        },

        /**
         * Opens the
         */
        openSettingsDialog : function()
        {
            var self = this;

            new QUIConfirm({
                title     : QUILocale.get(lg, 'area.window.settings.title'),
                icon      : 'icon-gear',
                maxWidth  : 400,
                maxHeight : 300,
                autoclose : false,
                events    :
                {
                    onOpen: function (Win)
                    {
                        var Content = Win.getContent();

                        Content.set(
                            'html',

                            '<form>' +
                            '    <label>' +
                            '        <input type="checkbox" name="deactivate" />' +
                                     QUILocale.get( lg, 'area.window.settings.deactivate' ) +
                            '    </label>' +
                            '</form>'
                        );

                        var Form = Win.getContent().getElement( 'form' ),
                            elms = Form.elements;

                        elms.deactivate.checked = self.getAttribute( 'deactivate' );
                    },

                    onSubmit : function(Win)
                    {
                        var Form = Win.getContent().getElement( 'form' );

                        Win.close();

                        if ( Form.elements.deactivate.checked )
                        {
                            self.deactivate();
                        } else
                        {
                            self.activate();
                        }
                    }
                }
            }).open();
        }
    });
});
