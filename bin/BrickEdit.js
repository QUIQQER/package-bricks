
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
    'qui/utils/Form',
    'package/quiqqer/bricks/bin/BrickAreas',
    'Ajax',
    'Locale',
    'utils/Controls',

    'css!package/quiqqer/bricks/bin/BrickEdit.css'

], function(QUI, QUIControl, QUIFormUtils, BrickAreas, QUIAjax, QUILocale, ControlUtils)
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
            id : false,
            projectName : false,
            projectLang : false
        },

        initialize : function(options)
        {
            this.parent( options );

            this.$availableBricks   = [];
            this.$availableSettings = [];

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

            QUIAjax.get([
                'package_quiqqer_bricks_ajax_getBrick',
                'package_quiqqer_bricks_ajax_getAvailableBricks'
            ], function(data, bricks)
            {
                /**
                 * @param {{availableSettings:object}} data
                 * @param {{attributes:object}} data
                 * @param {{settings:object}} data
                 */
                self.$availableBricks   = bricks;
                self.$availableSettings = data.availableSettings;

                self.setAttributes( data.attributes );
                self.setAttribute( 'settings', data.settings );

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
            var self = this,
                id   = this.getId();

            QUIAjax.get('package_quiqqer_bricks_ajax_brick_settingTemplate', function(result)
            {
                self.$Elm.set( 'html', result );

                self.$createExtraData();

                // id and for attributes
                self.$Elm.getElements( '[for]').each(function(Label)
                {
                    var forAttr = Label.get( 'for'),
                        Sibling = self.$Elm.getElement( '[id="'+ forAttr +'"]' );

                    if ( Sibling )
                    {
                        Sibling.set( 'id', Sibling.id + id );
                        Label.set( 'for', forAttr + id );
                    }
                });

                // values
                var Type  = self.$Elm.getElement( '[name="type"]' ),
                    Title = self.$Elm.getElement( '[name="title"]' ),
                    Desc  = self.$Elm.getElement( '[name="description"]' );

                Title.value = self.getAttribute( 'title' );
                Type.value  = self.getAttribute( 'type' );
                Desc.value  = self.getAttribute( 'description' );

                // areas
                var areas = [];

                if ( self.getAttribute( 'areas' ) )
                {
                    areas = self.getAttribute('areas')
                                .replace(/^,*/, '')
                                .replace(/,*$/, '')
                                .split(',');
                }

                // areas
                self.$Areas = new BrickAreas({
                    brickId     : self.getAttribute( 'id' ),
                    projectName : self.getAttribute( 'projectName' ),
                    projectLang : self.getAttribute( 'projectLang' ),
                    areas  : areas,
                    styles : {
                        height : 120
                    }
                }).inject( self.$Elm.getElement( '.quiqqer-bricks-areas' )  );


                // editor
                self.$createContentEditor( callback );

            }, {
                'package' : 'quiqqer/bricks'
            });
        },

        /**
         * Create the editor, if the brick type is a content type
         *
         * @param {Function} callback
         */
        $createContentEditor : function(callback)
        {
            if ( this.getAttribute( 'type' ) != 'content' )
            {
                this.$Elm
                    .getElement( 'table.brick-edit-content')
                    .setStyle( 'display', 'none' );

                if ( typeof callback === 'function' ) {
                    callback();
                }

                return;
            }

            var self      = this,
                TableBody = this.$Elm.getElement( 'table.brick-edit-content tbody' ),

                TD = new Element('td'),
                TR = new Element('tr', {
                    'class' : 'odd'
                });

            TD.inject( TR );
            TR.inject( TableBody );


            // load ckeditor
            require(['classes/editor/Manager'], function(EditorManager)
            {
                new EditorManager().getEditor(null, function(Editor)
                {
                    self.$Editor = Editor;

                    var EditorContainer = new Element('div', {
                        styles : {
                            clear   : 'both',
                            'float' : 'left',
                            height  : 300,
                            width   : '100%'
                        }
                    }).inject( TD );

                    self.$Editor.addEvent('onLoaded', function()
                    {
                        if ( typeof callback === 'function' ) {
                            callback();
                        }
                    });

                    self.$Editor.inject( EditorContainer );
                    self.$Editor.setHeight( EditorContainer.getSize().y );
                    self.$Editor.setWidth( EditorContainer.getSize().x );
                    self.$Editor.setContent( self.getAttribute( 'content' ) );
                });
            });
        },

        /**
         * Create the extra settings table
         */
        $createExtraData : function()
        {
            var TableExtra = this.$Elm.getElement( 'table.brick-edit-extra-header'),
                TableBody  = TableExtra.getElement( 'tbody' );

            if ( !this.$availableSettings || !this.$availableSettings.length )
            {
                TableExtra.setStyle( 'display', 'none' );
                return;
            }

            TableExtra.setStyle( 'display', null );

            var Form = new Element('form', {
                'class' : 'brick-edit-extra-header-form'
            }).wraps( TableExtra );

            var i, len, setting, dataQui, extraFieldId;

            var self = this,
                id   = this.getId();

            // extra settings
            for ( i = 0, len = this.$availableSettings.length; i < len; i++ )
            {
                setting      = this.$availableSettings[ i ];
                dataQui      = '';
                extraFieldId = 'extraField_'+ id +'_'+ i;

                if ( setting['data-qui'] !== '' ) {
                    dataQui = ' data-qui="'+ setting['data-qui'] +'" ';
                }

                new Element('tr', {
                    'class' : i % 2 ? 'even' : 'odd',
                    html : '<td>' +
                           '    <label class="quiqqer-bricks-areas" for="'+ extraFieldId +'">' +
                                     setting.text +
                           '    </label>' +
                           '</td>' +
                           '<td>' +
                           '    <input type="'+ setting.type +'" ' +
                           '           name="'+ setting.name +'" ' +
                           '           class="'+ setting.class +'" ' +
                           '           id="'+ extraFieldId +'"' +
                                       dataQui +
                           '    />' +
                           '</td>'
                }).inject( TableBody );
            }

            TableExtra.setStyle( 'display', null );

            // set data
            QUIFormUtils.setDataToForm( this.getAttribute( 'settings' ), Form );

            // parse controls
            ControlUtils.parse( TableExtra );

            QUI.parse(TableExtra, function()
            {
                // set project to the controls
                TableExtra.getElements( '[data-quiid]' ).each(function(Elm)
                {
                    var Control = QUI.Controls.getById(
                        Elm.get('data-quiid')
                    );

                    if ( 'setProject' in Control )
                    {
                        Control.setProject(
                            self.getAttribute( 'projectName' ),
                            self.getAttribute( 'projectLang' )
                        );
                    }
                });
            });
        },

        /**
         * Saves the brick
         */
        save : function(callback)
        {
            var Type  = this.$Elm.getElement( '[name="type"]' ),
                Title = this.$Elm.getElement( '[name="title"]'),
                Desc  = this.$Elm.getElement( '[name="description"]' );

            var data = {
                title       : Title.value,
                description : Desc.value,
                type        : Type.value,
                content     : '',
                areas       : this.$Areas.getAreas().join(',')
            };

            if ( this.$Editor ) {
                data.content = this.$Editor.getContent();
            }

            // settings
            var Form = this.$Elm.getElement( '.brick-edit-extra-header-form');

            if ( Form ) {
                data.settings = QUIFormUtils.getFormData( Form );
            }

            QUIAjax.post('package_quiqqer_bricks_ajax_brick_save', function()
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
