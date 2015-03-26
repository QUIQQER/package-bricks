
/**
 * Brick manager
 *
 * @module package/quiqqer/bricks/bin/Manager
 * @author www.pcsg.de (Henning Leutz)
 *
 * @require qui/QUI
 * @require qui/controls/desktop/Panel
 * @require qui/controls/buttons/Select
 * @require qui/controls/buttons/Button
 * @require qui/controls/buttons/Seperator
 * @require qui/controls/windows/Confirm
 * @require controls/grid/Grid
 * @require Locale
 * @require Projects
 * @require Ajax
 * @require css!package/quiqqer/bricks/bin/Manager.css
 */

define('package/quiqqer/bricks/bin/Manager', [

    'qui/QUI',
    'qui/controls/desktop/Panel',
    'qui/controls/buttons/Select',
    'qui/controls/buttons/Button',
    'qui/controls/buttons/Seperator',
    'qui/controls/windows/Confirm',
    'controls/grid/Grid',
    'Locale',
    'Projects',
    'Ajax',

    'css!package/quiqqer/bricks/bin/Manager.css'

], function(QUI, QUIPanel, QUISelect, QUIButton, QUISeperator, QUIConfirm, Grid, QUILocale, Projects, Ajax)
{
    "use strict";

    var lg = 'quiqqer/bricks';

    return new Class({

        Extends : QUIPanel,
        Type    : 'package/quiqqer/bricks/bin/Manager',

        Binds : [
            'loadBricksFromProject',
            'refresh',
            '$refreshProjectLanguages',
            '$onCreate',
            '$onResize',
            '$openCreateDialog',
            '$openDeleteDialog',
            '$onDblClick',
            '$onClick'
        ],

        options : {
            title : QUILocale.get( lg, 'menu.bricks.text' )
        },

        initialize : function(options)
        {
            this.parent( options );

            this.$Grid          = false;
            this.$ProjectSelect = false;
            this.$ProjectLangs  = false;

            this.addEvents({
                onCreate : this.$onCreate,
                onResize : this.$onResize
            });
        },

        /**
         * Refresh the panel data
         *
         * @param {Function} [callback] - callback function
         */
        refresh : function(callback)
        {
            if ( !this.$Elm ) {
                return;
            }

            var self    = this,
                project = this.$ProjectSelect.getValue(),
                lang    = this.$ProjectLangs.getValue();

            this.Loader.show();

            this.getBricksFromProject( project, lang, function(result)
            {
                if ( typeof callback === 'function' ) {
                    callback();
                }

                self.$Grid.setData({
                    data : result
                });

                self.refreshButtons();
                self.Loader.hide();
            });
        },

        /**
         * Refresh the buttons status
         */
        refreshButtons : function()
        {
            var selected  = this.$Grid.getSelectedData(),
                AddButton = this.getButtons('brick-add'),
                DelButton = this.getButtons('brick-delete');

            if ( !selected.length )
            {
                AddButton.enable();
                DelButton.disable();
                return;
            }

            AddButton.enable();
            DelButton.enable();

            if ( selected.length > 1 ) {
                AddButton.disable();
            }
        },

        /**
         * event : on create
         */
        $onCreate : function()
        {
            var self = this;

            // Buttons
            this.$ProjectSelect = new QUISelect({
                name   : 'projects-name',
                events : {
                    onChange : this.$refreshProjectLanguages
                }
            });

            this.$ProjectLangs = new QUISelect({
                name   : 'projects-langs',
                events : {
                    onChange : this.refresh
                },
                styles : {
                    width : 80
                }
            });

            this.addButton( this.$ProjectSelect );
            this.addButton( this.$ProjectLangs );
            this.addButton( new QUISeperator() );

            this.addButton(
                new QUIButton({
                    text     : QUILocale.get( lg, 'manager.button.add' ),
                    name     : 'brick-add',
                    disabled : true,
                    events   : {
                        onClick : this.$openCreateDialog
                    }
                })
            );

            this.addButton(
                new QUIButton({
                    text     : QUILocale.get( lg, 'manager.button.delete' ),
                    name     : 'brick-delete',
                    disabled : true,
                    events   : {
                        onClick : this.$openDeleteDialog
                    }
                })
            );

            // Grid
            var Container = new Element('div').inject(
                this.getContent()
            );

            this.$Grid = new Grid( Container, {
                columnModel : [{
                    header    : QUILocale.get( 'quiqqer/system', 'id' ),
                    dataIndex : 'id',
                    dataType  : 'integer',
                    width     : 40
                }, {
                    header    : QUILocale.get( 'quiqqer/system', 'title' ),
                    dataIndex : 'title',
                    dataType  : 'string',
                    width     : 140
                }, {
                    header    : QUILocale.get( 'quiqqer/system', 'description' ),
                    dataIndex : 'description',
                    dataType  : 'string',
                    width     : 300
                }, {
                    header    : QUILocale.get( lg, 'brick.type' ),
                    dataIndex : 'type',
                    dataType  : 'string',
                    width     : 200
                }],
                multipleSelection : true
            });

            this.$Grid.addEvents({
                onRefresh  : this.refresh,
                onDblClick : this.$onDblClick,
                onClick    : this.$onClick
            });

            this.Loader.show();

            Projects.getList(function(projects)
            {
                for ( var project in projects )
                {
                    if ( !projects.hasOwnProperty( project ) ) {
                        continue;
                    }

                    self.$ProjectSelect.appendChild(
                        project, project, 'icon-home'
                    );
                }

                self.$ProjectSelect.setValue(
                    self.$ProjectSelect.firstChild().getAttribute( 'value' )
                );
            });
        },

        /**
         * event : on resize
         */
        $onResize : function()
        {
            if ( !this.$Grid ) {
                return;
            }

            var Body = this.getContent();

            if ( !Body ) {
                return;
            }


            var size = Body.getSize();

            this.$Grid.setHeight( size.y - 40 );
            this.$Grid.setWidth( size.x - 40 );
        },

        /**
         * event : dbl click
         */
        $onDblClick : function()
        {
            this.editBrick(
                this.$Grid.getSelectedData()[0].id
            );
        },

        /**
         * event : click
         */
        $onClick : function()
        {
            this.refreshButtons();
        },

        /**
         * Refresh the project language dropdown
         */
        $refreshProjectLanguages : function()
        {
            var self          = this,
                activeProject = this.$ProjectSelect.getValue();

            Projects.getList(function(projects)
            {
                for ( var project in projects )
                {
                    if ( !projects.hasOwnProperty( project ) ) {
                        continue;
                    }

                    if ( activeProject != project ) {
                        continue;
                    }

                    var langs = projects[ project ].langs;
                        langs = langs.split( ',' );

                    self.$ProjectLangs.clear();

                    for ( var i = 0, len = langs.length; i < len; i++ )
                    {
                        self.$ProjectLangs.appendChild(
                            langs[ i ], langs[ i ], 'icon-home'
                        );
                    }

                    self.$ProjectLangs.setValue(
                        self.$ProjectLangs.firstChild().getAttribute( 'value' )
                    );
                }
            });
        },

        /**
         * Opens the brick creation dialog
         */
        $openCreateDialog : function()
        {
            var self = this;

            new QUIConfirm({
                title     : QUILocale.get( lg, 'manager.window.create.title' ),
                icon      : 'icon-th',
                maxHeight : 300,
                maxWidth  : 400,
                autoclose : false,
                events    :
                {
                    onOpen : function(Win)
                    {
                        var Body = Win.getContent();

                        Win.Loader.show();
                        Body.addClass( 'quiqqer-bricks-create' );

                        Body.set(
                            'html',

                            '<label>' +
                            '   <span class="quiqqer-bricks-create-label-text">' +
                                    QUILocale.get( lg, 'manager.window.create.label.title' ) +
                            '   </span>' +
                            '   <input type="text" name="title" required="required" />' +
                            '</label>' +
                            '<label>' +
                            '   <span class="quiqqer-bricks-create-label-text">' +
                                    QUILocale.get( lg, 'manager.window.create.label.type' ) +
                            '   </span>' +
                            '   <select name="type"></select>' +
                            '</label>'
                        );

                        self.getAvailableBricks(function(bricklist)
                        {
                            if ( !Body ) {
                                return;
                            }

                            var i, len, group, title, val;
                            var Select = Body.getElement( 'select'),
                                Title  = Body.getElement( '[name="title"]');

                            for ( i = 0, len = bricklist.length; i < len; i++ )
                            {
                                title = bricklist[ i ].title;

                                if ( 'group' in title )
                                {
                                    group = title.group;
                                    val   = title.var;
                                } else
                                {
                                    group = title[ 0 ];
                                    val   = title[ 1 ];
                                }

                                new Element('option', {
                                    value : bricklist[ i ].control,
                                    html  : QUILocale.get( group, val )
                                }).inject( Select );
                            }

                            Title.focus.delay( 500, Title );

                            Win.Loader.hide();
                        });
                    },

                    onSubmit : function(Win)
                    {
                        Win.Loader.show();

                        var Body  = Win.getContent(),
                            Title = Body.getElement( '[name="title"]' ),
                            Type  = Body.getElement( '[name="type"]' );

                        if ( Title.value === '' )
                        {
                            QUI.getMessageHandler(function(MH)
                            {
                                MH.addError(
                                    QUILocale.get( lg, 'exception.brick.has.no.title' ),
                                    Title
                                );
                            });

                            Title.focus();

                            Win.Loader.hide();
                            return;
                        }

                        var project = self.$ProjectSelect.getValue(),
                            lang    = self.$ProjectLangs.getValue();

                        self.createBrick(project, lang, {
                            title : Title.value,
                            type  : Type.value
                        }, function(brickId)
                        {
                            Win.close();

                            self.refresh(function() {
                                self.editBrick( brickId );
                            });
                        });
                    }
                }
            }).open();
        },

        /**
         * Opens the delete brick dialog
         */
        $openDeleteDialog : function()
        {
            var self     = this,
                brickIds = this.$Grid.getSelectedData().map(function(brick) {
                    return brick.id;
                });

            new QUIConfirm({
                maxHeight : 300,
                maxWidth  : 600,
                autoclose : false,
                title     : QUILocale.get( lg, 'manager.window.delete.title' ),
                events    :
                {
                    onOpen : function(Win)
                    {
                        var Content = Win.getContent(),
                            lists   = '<ul>';

                        self.$Grid.getSelectedData().each(function(brick) {
                            lists = lists +'<li>'+ brick.id +' - '+ brick.title +'</li>';
                        });

                        lists = lists +'</ul>';

                        Content.set(
                            'html',
                            QUILocale.get( lg, 'manager.window.delete.information', {
                                list : lists
                            })
                        );
                    },

                    onSubmit : function(Win)
                    {
                        Win.Loader.show();

                        self.deleteBricks(brickIds, function()
                        {
                            Win.close();
                            self.refresh();
                        });
                    }
                }
            }).open();
        },

        /**
         * Opens the edit sheet of a Brick
         *
         * @param {integer} brickId
         */
        editBrick : function(brickId)
        {
            this.Loader.show();

            var Brick;

            var self  = this,
                Sheet = this.createSheet({
                    title : QUILocale.get( lg, 'brick.sheet.edit.title' ),
                    icon  : 'icon-edit'
                });

            Sheet.addEvents({
                onOpen : function(Sheet)
                {
                    require(['package/quiqqer/bricks/bin/BrickEdit'], function(BrickEdit)
                    {
                        Brick = new BrickEdit({
                            id : brickId,
                            projectName : self.$ProjectSelect.getValue(),
                            projectLang : self.$ProjectLangs.getValue(),
                            events :
                            {
                                onLoaded : function() {
                                    self.Loader.hide();
                                }
                            }
                        }).inject( Sheet.getContent() );
                    });

                    Sheet.getContent().setStyle( 'overflow', 'auto' );
                }
            });

            Sheet.addButton({
                textimage : 'icon-save',
                text : QUILocale.get( 'quiqqer/system', 'save' ),
                styles : {
                    width : 200
                },
                events :
                {
                    onClick : function()
                    {
                        self.Loader.show();

                        Brick.save(function()
                        {
                            self.Loader.hide();
                            Sheet.hide();

                            self.refresh();
                        });
                    }
                }
            });

            Sheet.show();
        },

        /**
         * Methods / Model
         */

        /**
         * Return the available bricks
         * @param callback
         */
        getAvailableBricks : function(callback)
        {
            Ajax.get('package_quiqqer_bricks_ajax_getAvailableBricks', callback, {
                'package' : 'quiqqer/bricks'
            });
        },

        /**
         * Return the bricksf from a project
         *
         * @param {String} project - name of the project
         * @param {String} lang - Language of the project
         * @param {Function} callback - callback function
         */
        getBricksFromProject : function(project, lang, callback)
        {
            Ajax.get('package_quiqqer_bricks_ajax_project_getBricks', callback, {
                'package' : 'quiqqer/bricks',
                project   : JSON.encode({
                    name : project,
                    lang : lang
                })
            });
        },

        /**
         * Create a new brick
         *
         * @param {String} project
         * @param {String} lang
         * @param {Object} data
         * @param {Function} callback
         */
        createBrick : function(project, lang, data, callback)
        {
            Ajax.post('package_quiqqer_bricks_ajax_project_createBrick', callback, {
                'package' : 'quiqqer/bricks',
                project : JSON.encode({
                    name : project,
                    lang : lang
                }),
                data : JSON.encode( data )
            });
        },

        /**
         * Delete the Brick-Ids
         *
         * @param {array} brickIds - Brick IDs which should be deleted
         * @param {Function} callback
         */
        deleteBricks : function(brickIds, callback)
        {
            Ajax.post('package_quiqqer_bricks_ajax_brick_delete', callback, {
                'package' : 'quiqqer/bricks',
                brickIds  : JSON.encode( brickIds )
            });
        }
    });
});
