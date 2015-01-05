
/**
 * Block manager
 *
 * @module package/quiqqer/blocks/bin/Manager
 * @author www.pcsg.de (Henning Leutz)
 */

define('package/quiqqer/blocks/bin/Manager', [

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

    'css!package/quiqqer/blocks/bin/Manager.css'

], function(QUI, QUIPanel, QUISelect, QUIButton, QUISeperator, QUIConfirm, Grid, QUILocale, Projects, Ajax)
{
    "use strict";

    var lg = 'quiqqer/blocks';

    return new Class({

        Extends : QUIPanel,
        Type    : 'package/quiqqer/blocks/bin/Manager',

        Binds : [
            'loadBlocksFromProject',
            'refresh',
            '$onCreate',
            '$onResize',
            '$openCreateDialog',
            '$onDblClick'
        ],

        options : {
            title : QUILocale.get( lg, 'menu.blocks.text' )
        },

        initialize : function(options)
        {
            this.parent( options );

            this.$Grid = false;

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

            var self = this;

            this.Loader.show();

            this.getBlocksFromProject(this.$ProjectSelect.getValue(), function(result)
            {
                if ( typeof callback === 'function' ) {
                    callback();
                }

                self.$Grid.setData({
                    data : result
                });

                self.Loader.hide();
            });
        },

        /**
         * event : on create
         */
        $onCreate : function()
        {
            var self = this;

            // Buttons
            this.$ProjectSelect = new QUISelect({
                name   : 'projects',
                events : {
                    onChange : this.refresh
                }
            });

            this.addButton( this.$ProjectSelect );
            this.addButton( new QUISeperator() );

            this.addButton(
                new QUIButton({
                    text   : 'Block hinzufügen',
                    events : {
                        onClick : this.$openCreateDialog
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
                    header    : QUILocale.get( lg, 'block.type' ),
                    dataIndex : 'type',
                    dataType  : 'string',
                    width     : 200
                }]
            });

            this.$Grid.addEvents({
                onRefresh  : this.refresh,
                onDblClick : this.$onDblClick
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
            this.editBlock(
                this.$Grid.getSelectedData()[0].id
            );
        },

        /**
         *
         */
        $openCreateDialog : function()
        {
            var self = this;

            new QUIConfirm({
                title     : 'Neuen Block hinzufügen',
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
                        Body.addClass( 'quiqqer-blocks-create' );

                        Body.set(
                            'html',

                            '<label>' +
                            '   <span class="quiqqer-blocks-create-label-text">' +
                            '       Title' +
                            '   </span>' +
                            '   <input type="text" name="title" />' +
                            '</label>' +
                            '<label>' +
                            '   <span class="quiqqer-blocks-create-label-text">' +
                            '       Block Typ' +
                            '   </span>' +
                            '   <select name="type"></select>' +
                            '</label>'
                        );

                        self.getAvailableBlocks(function(blocklist)
                        {
                            if ( !Body ) {
                                return;
                            }

                            var i, len, group, title, val;
                            var Select = Body.getElement( 'select'),
                                Title  = Body.getElement( '[name="title"]');

                            for ( i = 0, len = blocklist.length; i < len; i++ )
                            {
                                title = blocklist[ i ].title;

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
                                    value : blocklist[ i ].control,
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

                        if ( Title.value === '' ) {
                            return;
                        }

                        self.createBlock(self.$ProjectSelect.getValue(), {
                            title : Title.value,
                            type  : Type.value
                        }, function(blockId)
                        {
                            Win.close();


                            self.refresh(function() {
                                self.editBlock( blockId );
                            });
                        });
                    }
                }
            }).open();
        },

        /**
         *
         * @param {integer} blockId
         */
        editBlock : function(blockId)
        {
            this.Loader.show();

            var Block;

            var self  = this,
                Sheet = this.createSheet({
                    title : 'Block editieren'
                });

            Sheet.addEvents({
                onOpen : function(Sheet)
                {
                    require(['package/quiqqer/blocks/bin/BlockEdit'], function(BlockEdit)
                    {
                        Block = new BlockEdit({
                            id      : blockId,
                            project : self.$ProjectSelect.getValue(),
                            events  :
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
                text : 'Speichern',
                styles : {
                    width : 200
                },
                events :
                {
                    onClick : function()
                    {
                        self.Loader.show();

                        Block.save(function()
                        {
                            self.Loader.hide();
                            Sheet.hide();
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
         * Return the available blocks
         * @param callback
         */
        getAvailableBlocks : function(callback)
        {
            Ajax.get('package_quiqqer_blocks_ajax_getAvailableBlocks', callback, {
                'package' : 'quiqqer/blocks'
            });
        },

        /**
         * Return the blocksf from a project
         *
         * @param {String} project - name of the project
         * @param {Function} callback - callback function
         */
        getBlocksFromProject : function(project, callback)
        {
            Ajax.get('package_quiqqer_blocks_ajax_project_getBlocks', callback, {
                'package' : 'quiqqer/blocks',
                project   : JSON.encode({
                    name : project
                })
            });
        },

        /**
         * Create a new block
         *
         * @param {String} project
         * @param {Object} data
         * @param {Function} callback
         */
        createBlock : function(project, data, callback)
        {
            Ajax.post('package_quiqqer_blocks_ajax_project_createBlock', callback, {
                'package' : 'quiqqer/blocks',
                project : JSON.encode({
                    name : project
                }),
                data : JSON.encode( data )
            });
        }
    });
});
