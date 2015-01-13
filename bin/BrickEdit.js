
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

], function(QUI, QUIControl, QUIFormUtils, BrickAreas, Ajax, QUILocale, ControlUtils)
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

            Ajax.get([
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
            var self = this;

            var Container = new Element('div', {
                'html' : '<label>' +
                         '    <span class="quiqqer-bricks-brickedit-label-text">' +
                         '        Title' +
                         '    </span>' +
                         '    <input type="text" name="title" />' +
                         '</label>' +
                         '<label>' +
                         '    <span class="quiqqer-bricks-brickedit-label-text">' +
                         '        Brick Beschreibung' +
                         '    </span>' +
                         '    <textarea name="description"></textarea>' +
                         '</label>'+
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

            if ( this.$availableSettings )
            {
                var setting, dataQui;
                var SettingsElement = new Element('form', {
                    'class' : 'quiqqer-bricks-brickedit-settings'
                });

                for ( i = 0, len = this.$availableSettings.length; i < len; i++ )
                {
                    setting = this.$availableSettings[ i ];
                    dataQui = '';

                    if ( setting['data-qui'] !== '' ) {
                        dataQui = ' data-qui="'+ setting['data-qui'] +'" ';
                    }

                    new Element('div', {
                        html : '<label class="quiqqer-bricks-areas">' +
                               '    <span class="quiqqer-bricks-brickedit-label-text">' +
                                        setting.text +
                               '    </span>' +
                               '</label>' +
                               '<input type="'+ setting.type +'" ' +
                               '       name="'+ setting.name +'" ' +
                               '       class="'+ setting.class +'" ' +
                                       dataQui +
                               '/>'
                    }).inject( SettingsElement );
                }

                SettingsElement.inject( Container );

                // set data
                QUIFormUtils.setDataToForm(
                    this.getAttribute( 'settings' ),
                    SettingsElement
                );

                // parse controls
                ControlUtils.parse( SettingsElement );

                QUI.parse(SettingsElement, function()
                {
                    // set project to the controls
                    SettingsElement.getElements( '[data-quiid]' ).each(function(Elm)
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
            }

            var Type  = this.$Elm.getElement( '[name="type"]' ),
                Title = this.$Elm.getElement( '[name="title"]' ),
                Desc  = this.$Elm.getElement( '[name="description"]' );

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
            Desc.value  = this.getAttribute( 'description' );

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
                brickId     : this.getAttribute( 'id' ),
                projectName : this.getAttribute( 'projectName' ),
                projectLang : this.getAttribute( 'projectLang' ),
                areas  : areas,
                styles : {
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
            var SettingsForm = this.$Elm.getElement(
                '.quiqqer-bricks-brickedit-settings'
            );

            if ( SettingsForm ) {
                data.settings = QUIFormUtils.getFormData( SettingsForm );
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
