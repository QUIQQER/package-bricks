
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

                self.setAttributes(data.attributes);
                self.setAttribute('settings', data.settings);

                self.$createData().then(function() {
                    self.fireEvent('loaded', [self]);
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

            return new Promise(function(resolve, reject) {

                QUIAjax.get('package_quiqqer_bricks_ajax_brick_settingTemplate', function(result)
                {
                    self.$Elm.set( 'html', result );

                    self.$createExtraData().then(function() {

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

                        return self.$createContentEditor( callback );

                    }).then(function() {

                        resolve();
                    });

                }, {
                    'package' : 'quiqqer/bricks',
                    onError : reject
                });
            });
        },

        /**
         * Create the editor, if the brick type is a content type
         *
         * @param {Function} callback
         * @return Promise
         */
        $createContentEditor : function(callback)
        {
            return new Promise(function(resolve) {

                if (this.getAttribute('type') != 'content')
                {
                    this.$Elm
                        .getElement( 'table.brick-edit-content')
                        .setStyle( 'display', 'none' );

                    if ( typeof callback === 'function' ) {
                        callback();
                    }

                    resolve();
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

                            resolve();
                        });

                        self.$Editor.inject( EditorContainer );
                        self.$Editor.setHeight( EditorContainer.getSize().y );
                        self.$Editor.setWidth( EditorContainer.getSize().x );
                        self.$Editor.setContent( self.getAttribute( 'content' ) );
                    });
                });

            }.bind(this));
        },

        /**
         * Create the extra settings table
         *
         * @return Promise
         */
        $createExtraData : function()
        {
            return new Promise(function(resolve, reject)
            {
                var TableExtra = this.$Elm.getElement( 'table.brick-edit-extra-header'),
                    TableBody  = TableExtra.getElement( 'tbody' );

                if (!this.$availableSettings || !this.$availableSettings.length)
                {
                    TableExtra.setStyle( 'display', 'none' );
                    resolve();
                    return;
                }

                TableExtra.setStyle( 'display', null );

                var Form = new Element('form', {
                    'class' : 'brick-edit-extra-header-form'
                }).wraps( TableExtra );

                var i, len, Row, text, Value, setting, extraFieldId;

                var self = this,
                    id   = this.getId();

                // extra settings
                for (i = 0, len = this.$availableSettings.length; i < len; i++)
                {
                    setting      = this.$availableSettings[ i ];
                    extraFieldId = 'extraField_'+ id +'_'+ i;

                    text = setting.text;

                    if (typeOf(setting.text) === 'array') {
                        text = QUILocale.get(setting.text[ 0 ], setting.text[ 1 ]);
                    }


                    Row = new Element('tr', {
                        'class' : i % 2 ? 'even' : 'odd',
                        html : '<td>' +
                               '    <label class="quiqqer-bricks-areas" for="'+ extraFieldId +'">' +
                                        text +
                               '    </label>' +
                               '</td>' +
                               '<td></td>'
                    }).inject(TableBody);

                    if (setting.type != 'select')
                    {
                        Value = new Element('input', {
                            type    : setting.type,
                            name    : setting.name,
                            'class' : setting.class,
                            id      : extraFieldId
                        }).inject(Row.getElement('td:last-child'));

                        if (setting['data-qui'] !== '') {
                            Value.set('data-qui', setting['data-qui']);
                        }

                        continue;
                    }

                    Value = new Element('select', {
                        name    : setting.name,
                        'class' : setting.class,
                        id      : extraFieldId
                    }).inject(Row.getElement('td:last-child'));


                    for (var c = 0, clen = setting.options.length; c < clen; c++)
                    {
                        text = setting.options[c].text;

                        if (typeOf(setting.options[c].text) === 'array') {
                            text = QUILocale.get(
                                setting.options[c].text[ 0 ],
                                setting.options[c].text[ 1 ]
                            );
                        }

                        new Element('option', {
                            html  : text,
                            value : setting.options[c].value
                        }).inject(Value);
                    }
                }

                TableExtra.setStyle( 'display', null );

                // set data
                QUIFormUtils.setDataToForm( this.getAttribute( 'settings' ), Form );

                // parse controls
                QUI.parse(TableExtra).then(function() {
                    return ControlUtils.parse(TableExtra);

                }).then(function()
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

                    resolve();

                }).catch(reject);

            }.bind(this));
        },

        /**
         * Saves the brick
         */
        save : function(callback)
        {
            var i, len, Control;

            var Type  = this.$Elm.getElement( '[name="type"]' ),
                Title = this.$Elm.getElement( '[name="title"]'),
                Desc  = this.$Elm.getElement( '[name="description"]'),

                quiElements = this.$Elm.getElements( '[data-quiid]' );

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

            for ( i = 0, len = quiElements.length; i < len; i++ )
            {
                Control = QUI.Controls.getById( quiElements[ i ].get( 'data-quiid' ) );

                if ( Control && typeOf( Control ) == 'controls/editors/Editor' ) {
                    Control.getContent();
                }
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
