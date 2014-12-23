
/**
 * BlockEdit Control
 * Edit and change a Block
 *
 * @module package/quiqqer/blocks/bin/BlockEdit
 * @author www.pcsg.de (Henning Leutz)
 *
 * @event onLoaded [ this ]
 */

define('package/quiqqer/blocks/bin/BlockEdit', [

    'qui/QUI',
    'qui/controls/Control',
    'package/quiqqer/blocks/bin/BlockAreas',
    'Ajax',
    'Locale',

    'css!package/quiqqer/blocks/bin/BlockEdit.css'

], function(QUI, QUIControl, BlockAreas, Ajax, QUILocale)
{
    "use strict";

    return new Class({

        Extends : QUIControl,
        Type    : 'package/quiqqer/blocks/bin/BlockEdit',

        Binds : [
            '$onInject',
            '$onDestroy'
        ],

        options : {
            id      : false,
            project : false
        },

        initialize : function(options)
        {
            this.parent( options );

            this.$availableBlocks = [];

            this.$Editor = false;
            this.$Areas  = false;

            this.addEvents({
                onInject  : this.$onInject,
                onDestroy : this.$onDestroy
            });
        },

        /**
         * Return the HTML Node Element
         *
         * @return {HTMLElement}
         */
        create : function()
        {
            this.$Elm = new Element('div', {
                'class' : 'quiqqer-blocks-blockedit'
            });

            return this.$Elm;
        },

        /**
         * event : on inject
         */
        $onInject : function()
        {
            var self = this;

            Ajax.get([
                'package_quiqqer_blocks_ajax_getBlock',
                'package_quiqqer_blocks_ajax_getAvailableBlocks'
            ], function(data, blocks)
            {
                self.$availableBlocks = blocks;

                self.setAttributes( data );
                self.$createData(function() {
                    self.fireEvent( 'loaded', [ self ] );
                });

            }, {
                'package' : 'quiqqer/block',
                blockId   : this.getAttribute( 'id' )
            });
        },

        /**
         * event : on destroy
         */
        $onDestroy : function()
        {
            if ( this.$Editor ) {
                this.$Editor.destroy();
            }
        },

        /**
         * Create the html for the control
         *
         * @param {Function} [callback]
         */
        $createData : function(callback)
        {
            var self = this;

            new Element('div', {
                'html' : '<label>' +
                         '    <span class="quiqqer-blocks-blockedit-label-text">' +
                         '        Title' +
                         '    </span>' +
                         '    <input type="text" name="title" />' +
                         '</label>' +
                         '<label>' +
                         '    <span class="quiqqer-blocks-blockedit-label-text">' +
                         '        Block Typ' +
                         '    </span>' +
                         '    <select name="type"></select>' +
                         '</label>'+
                         '<label class="quiqqer-blocks-areas">' +
                         '    <span class="quiqqer-blocks-blockedit-label-text">' +
                         '        Erlaubte Blockbereiche' +
                         '    </span>' +
                         '</label>'
            }).inject( this.$Elm );

            var i, len, title;

            var Type  = this.$Elm.getElement( '[name="type"]'),
                Title = this.$Elm.getElement( '[name="title"]' );

            for ( i = 0, len = this.$availableBlocks.length; i < len; i++ )
            {
                title = this.$availableBlocks[ i ].title;

                new Element('option', {
                    value : this.$availableBlocks[ i ].control,
                    html  : QUILocale.get( title[ 0 ], title[ 1 ] )
                }).inject( Type );
            }

            Title.value = this.getAttribute( 'title' );
            Type.value  = this.getAttribute( 'type' );

            var areas = this.getAttribute( 'areas' )
                            .replace( /^,*/, '' )
                            .replace( /,*$/, '' )
                            .split( ',' );

            // areas
            this.$Areas = new BlockAreas({
                blockId : this.getAttribute( 'id' ),
                project : this.getAttribute( 'project' ),
                areas   : areas,
                styles  : {
                    height : 120
                }
            }).inject( this.$Elm.getElement( '.quiqqer-blocks-areas' ), 'after'  );


            // block type
            if ( this.getAttribute( 'type' ) == 'content' )
            {
                new Element('label', {
                    html : '<span class="quiqqer-blocks-blockedit-label-editor">' +
                               'Block Inhalt' +
                           '</span>'
                }).inject( this.$Elm );


                // load ckeditor
                require(['classes/editor/Manager'], function(EditorManager)
                {
                    new EditorManager().getEditor(null, function(Editor)
                    {
                        self.$Editor = Editor;

                        var EditorContainer = new Element('div', {
                            styles : {
                                clear  : 'both',
                                height : 300,
                                width  : '100%'
                            }
                        }).inject( self.$Elm );

                        self.$Editor.addEvent('onLoaded', function()
                        {
                            if ( typeof callback === 'function' ) {
                                callback();
                            }
                        });

                        self.$Editor.inject( EditorContainer );
                        self.$Editor.setHeight( 300 );
                        self.$Editor.setContent( self.getAttribute( 'content' ) );
                    });
                });

                return;
            }

            // plugin / package blocks

        },

        /**
         * Saves the block
         */
        save : function(callback)
        {
            var Type  = this.$Elm.getElement( '[name="type"]'),
                Title = this.$Elm.getElement( '[name="title"]' );

            var data = {
                title   : Title.value,
                type    : Type.value,
                content : '',
                areas   : this.$Areas.getAreas().join(',')
            };

            if ( this.$Editor ) {
                data.content = this.$Editor.getContent();
            }

            Ajax.post('package_quiqqer_blocks_ajax_block_save', function()
            {
                if ( typeof callback === 'function'  ) {
                    callback();
                }
            }, {
                'package' : 'quiqqer/block',
                blockId   : this.getAttribute( 'id' ),
                data      : JSON.encode( data )
            });
        }

    });
});
