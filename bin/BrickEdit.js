
/**
 * BrickEdit Control
 * Edit and change a Brick
 *
 * @module package/quiqqer/bricks/bin/BrickEdit
 * @author www.pcsg.de (Henning Leutz)
 *
 * @event onLoaded [ this ]
 */

define('package/quiqqer/bricks/bin/BrickEdit', [

    'qui/QUI',
    'qui/controls/Control',
    'package/quiqqer/bricks/bin/BrickAreas',
    'Ajax',
    'Locale',

    'css!package/quiqqer/bricks/bin/BrickEdit.css'

], function(QUI, QUIControl, BrickAreas, Ajax, QUILocale)
{
    "use strict";

    return new Class({

        Extends : QUIControl,
        Type    : 'package/quiqqer/bricks/bin/BrickEdit',

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

            this.$availableBricks = [];

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
                'class' : 'quiqqer-bricks-brickedit'
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
                'package_quiqqer_bricks_ajax_getBrick',
                'package_quiqqer_bricks_ajax_getAvailableBricks'
            ], function(data, bricks)
            {
                self.$availableBricks = bricks;

                self.setAttributes( data );
                self.$createData(function() {
                    self.fireEvent( 'loaded', [ self ] );
                });

            }, {
                'package' : 'quiqqer/brick',
                brickId   : this.getAttribute( 'id' )
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
                         '    <span class="quiqqer-bricks-brickedit-label-text">' +
                         '        Title' +
                         '    </span>' +
                         '    <input type="text" name="title" />' +
                         '</label>' +
                         '<label>' +
                         '    <span class="quiqqer-bricks-brickedit-label-text">' +
                         '        Brick Typ' +
                         '    </span>' +
                         '    <select name="type"></select>' +
                         '</label>'+
                         '<label class="quiqqer-bricks-areas">' +
                         '    <span class="quiqqer-bricks-brickedit-label-text">' +
                         '        Erlaubte Brickbereiche' +
                         '    </span>' +
                         '</label>'
            }).inject( this.$Elm );

            var i, len, title, group, val;

            var Type  = this.$Elm.getElement( '[name="type"]'),
                Title = this.$Elm.getElement( '[name="title"]' );

            for ( i = 0, len = this.$availableBricks.length; i < len; i++ )
            {
                title = this.$availableBricks[ i ].title;

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
                    value : this.$availableBricks[ i ].control,
                    html  : QUILocale.get( group, val )
                }).inject( Type );
            }

            Title.value = this.getAttribute( 'title' );
            Type.value  = this.getAttribute( 'type' );

            var areas = [];

            if ( this.getAttribute( 'areas' ) )
            {
                areas = this.getAttribute('areas')
                    .replace(/^,*/, '')
                    .replace(/,*$/, '')
                    .split(',');
            }

            // areas
            this.$Areas = new BrickAreas({
                brickId : this.getAttribute( 'id' ),
                project : this.getAttribute( 'project' ),
                areas   : areas,
                styles  : {
                    height : 120
                }
            }).inject( this.$Elm.getElement( '.quiqqer-bricks-areas' ), 'after'  );


            // brick type
            if ( this.getAttribute( 'type' ) == 'content' )
            {
                new Element('label', {
                    html : '<span class="quiqqer-bricks-brickedit-label-editor">' +
                               'Brick Inhalt' +
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

            // plugin / package bricks

            if ( typeof callback === 'function' ) {
                callback();
            }

        },

        /**
         * Saves the brick
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

            Ajax.post('package_quiqqer_bricks_ajax_brick_save', function()
            {
                if ( typeof callback === 'function'  ) {
                    callback();
                }
            }, {
                'package' : 'quiqqer/brick',
                brickId   : this.getAttribute( 'id' ),
                data      : JSON.encode( data )
            });
        }

    });
});
