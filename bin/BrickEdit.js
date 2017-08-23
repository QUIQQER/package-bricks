/**
 * BrickEdit Panel
 * Edit and change a Brick
 *
 * @module package/quiqqer/bricks/bin/BrickEdit
 * @author www.pcsg.de (Henning Leutz)
 *
 * @event onLoaded [ this ]
 * @event onSave [ this ]
 * @event onDelete [ this ]
 */
define('package/quiqqer/bricks/bin/BrickEdit', [

    'qui/QUI',
    'qui/controls/desktop/Panel',
    'qui/controls/windows/Confirm',
    'package/quiqqer/bricks/bin/BrickAreas',
    'Ajax',
    'Locale',
    'Projects',
    'qui/utils/Form',
    'utils/Controls',
    'utils/Template',

    'css!package/quiqqer/bricks/bin/BrickEdit.css'

], function (QUI, QUIPanel, QUIConfirm, BrickAreas, QUIAjax, QUILocale, Projects, QUIFormUtils, ControlUtils, Template) {
    "use strict";

    var lg = 'quiqqer/bricks';

    return new Class({

        Extends: QUIPanel,
        Type   : 'package/quiqqer/bricks/bin/BrickEdit',

        Binds: [
            '$onInject',
            '$onCreate',
            '$onDestroy',
            '$load',
            '$unload',
            'save',
            'del'
        ],

        options: {
            id         : false,
            projectName: false,
            projectLang: false
        },

        initialize: function (options) {
            this.parent(options);

            this.$availableBricks   = [];
            this.$availableSettings = [];
            this.$customfields      = [];

            this.$Editor = false;
            this.$Areas  = false;
            this.$Active = false;

            this.addEvents({
                onInject : this.$onInject,
                onCreate : this.$onCreate,
                onDestroy: this.$onDestroy,
                onResize : function () {
                    var controls = QUI.Controls.getControlsInElement(this.getContent());
                    controls.each(function (Control) {
                        if ("resize" in Control) {
                            Control.resize();
                        }
                    });
                }.bind(this)
            });
        },

        /**
         * event : on create
         */
        $onCreate: function () {
            this.setAttributes({
                icon : 'fa fa-spinner fa-spin',
                title: '...'
            });

            this.addButton({
                name     : 'save',
                textimage: 'fa fa-save',
                text     : QUILocale.get('quiqqer/system', 'save'),
                events   : {
                    click: this.save
                }
            });

            this.addButton({
                name  : 'delete',
                icon  : 'fa fa-trash-o',
                title : QUILocale.get('quiqqer/system', 'delete'),
                events: {
                    click: this.del
                },
                styles: {
                    'float': 'right'
                }
            });

            this.addCategory({
                name  : 'information',
                icon  : 'fa fa-file-o',
                text  : QUILocale.get('quiqqer/system', 'information'),
                events: {
                    onActive: this.$load
                }
            });

            this.addCategory({
                name  : 'settings',
                icon  : 'fa fa-magic',
                text  : QUILocale.get('quiqqer/system', 'properties'),
                events: {
                    onActive: this.$load
                }
            });

            this.addCategory({
                name  : 'extra',
                icon  : 'fa fa-gears',
                text  : QUILocale.get('quiqqer/system', 'settings'),
                events: {
                    onActive: this.$load
                }
            });

            this.addCategory({
                name  : 'content',
                icon  : 'fa fa-file-text-o',
                text  : QUILocale.get('quiqqer/system', 'content'),
                events: {
                    onActive: this.$load
                }
            });
        },

        /**
         * event : on inject
         */
        $onInject: function () {
            this.Loader.show();

            QUIAjax.get([
                'package_quiqqer_bricks_ajax_getBrick',
                'package_quiqqer_bricks_ajax_getAvailableBricks'
            ], function (brick, bricks) {
                /**
                 * @param {{availableSettings:object}} data
                 * @param {{attributes:object}} data
                 * @param {{settings:object}} data
                 */
                this.$availableBricks = bricks;
                this.$availableSettings = brick.availableSettings;
                this.$customfields      = brick.customfields;

                this.setAttribute('data', brick);

                this.setAttributes({
                    icon : 'fa fa-th',
                    title: QUILocale.get('quiqqer/bricks', 'panel.title', {
                        brickId   : this.getAttribute('id'),
                        brickTitle: brick.attributes.title
                    })
                });

                this.refresh();

                this.fireEvent('loaded', [this]);
                this.getCategory('information').click();

            }.bind(this), {
                'package': 'quiqqer/brick',
                brickId  : this.getAttribute('id')
            });
        },

        /**
         * event : on destroy
         */
        $onDestroy: function () {
            if (this.$Editor) {
                this.$Editor.destroy();
            }

            if (this.$Areas) {
                this.$Areas.destroy();
            }
        },

        /**
         * Saves the brick
         *
         * @return Promise
         */
        save: function (callback) {
            var Active = this.$Active;

            this.Loader.show();
            this.$unload();

            return this.$load(Active).then(function () {

                return new Promise(function (resolve, reject) {
                    var data = this.getAttribute('data');

                    data.customfields = this.$customfields;

                    QUIAjax.post('package_quiqqer_bricks_ajax_brick_save', function () {
                        if (typeof callback === 'function') {
                            callback();
                        }

                        resolve();

                        QUI.getMessageHandler().then(function (MH) {
                            MH.addSuccess(
                                QUILocale.get(lg, 'message.brick.save.success')
                            );
                        });

                        this.fireEvent('save', [this]);
                        this.Loader.hide();

                    }.bind(this), {
                        'package': 'quiqqer/brick',
                        brickId  : this.getAttribute('id'),
                        data     : JSON.encode(data),
                        onError  : reject
                    });

                }.bind(this));

            }.bind(this));
        },

        /**
         * Delete the brick
         */
        del: function () {
            var self = this;

            new QUIConfirm({
                title      : QUILocale.get(lg, 'window.brick.delete.title'),
                text       : QUILocale.get(lg, 'window.brick.delete.text'),
                information: QUILocale.get(lg, 'window.brick.delete.information'),
                maxHeight  : 300,
                maxWidth   : 600,
                autoclose  : false,
                events     : {
                    onSubmit: function (Win) {
                        Win.Loader.show();

                        QUIAjax.post('package_quiqqer_bricks_ajax_brick_delete', function () {
                            Win.close();

                            self.fireEvent('delete');
                            self.destroy();
                        }, {
                            'package': 'quiqqer/bricks',
                            brickIds : JSON.encode([self.getAttribute('id')])
                        });
                    }
                }
            }).open();
        },

        /**
         * event on button active
         *
         * @param {Object} Button - qui/controls/buttons/Button
         *
         * @return Promise
         */
        $load: function (Button) {
            this.Loader.show();

            return new Promise(function (resolve, reject) {

                var Prom = false,
                    self = this;

                if (Button === this.$Active) {
                    reject();
                    self.Loader.hide();
                    return;
                }

                var data = this.getAttribute('data');

                this.$unload();

                this.setAttribute('data', data);
                this.$Active = Button;

                switch (Button.getAttribute('name')) {
                    case 'information':
                        Prom = this.$showInformation();
                        break;

                    case 'settings':
                        Prom = this.$showSettings();
                        break;

                    case 'extra':
                        Prom = this.$showExtras();
                        break;

                    case 'content':
                        Prom = this.$showContent();
                        break;

                    default:
                        reject();
                        return;
                }

                if (!Prom) {
                    reject();
                    self.Loader.hide();
                    return;
                }

                Prom.then(function () {

                    resolve();
                    self.Loader.hide();

                }).catch(function () {
                    reject();
                    self.Loader.hide();
                });

            }.bind(this));
        },

        /**
         * event unload category
         */
        $unload: function () {
            if (!this.$Active) {
                return;
            }

            var Form   = this.getContent().getElement('form'),
                unload = this.$Active.getAttribute('name'),
                data   = this.getAttribute('data');

            if (unload === 'information') {
                data.attributes = Object.merge(
                    data.attributes,
                    QUIFormUtils.getFormData(Form)
                );
            }

            if (Form.getElement('[name="frontendTitle"]')) {
                data.attributes.frontendTitle = Form.getElement('[name="frontendTitle"]').value;
            }

            if (unload === 'settings') {
                data.attributes.areas = this.$Areas.getAreas().join(',');
                //data.attributes.width   = Form.elements.width.value;
                //data.attributes.height  = Form.elements.height.value;
                //data.attributes.classes = Form.elements.classes.value;

                var flexibleList = [],
                    fieldData    = QUIFormUtils.getFormData(Form);

                for (var key in fieldData) {

                    if (!fieldData.hasOwnProperty(key)) {
                        continue;
                    }

                    if (!key.match('flexible')) {
                        continue;
                    }

                    if (fieldData[key]) {
                        flexibleList.push(key);
                    }
                }

                this.$customfields = flexibleList;

                this.$Areas.destroy();
                this.$Areas = false;
            }

            if (unload === 'extra') {
                data.settings = Object.merge(
                    data.settings,
                    QUIFormUtils.getFormData(Form)
                );
            }

            if (unload === 'content') {
                data.attributes.content = this.$Editor.getContent();

                this.$Editor.destroy();
                this.$Editor = false;
            }

            this.$Active = null;

            this.setAttribute('data', data);
        },

        /**
         * Information template
         *
         * @returns {Promise}
         */
        $showInformation: function () {
            return new Promise(function (resolve, reject) {

                Template.get('ajax/brick/templates/information', function (result) {
                    this.setContent(result);

                    QUIFormUtils.setDataToForm(
                        this.getAttribute('data').attributes,
                        this.getContent().getElement('form')
                    );

                    resolve();

                }.bind(this), {
                    'package': 'quiqqer/bricks',
                    onError  : reject
                });

            }.bind(this));
        },

        /**
         * Settings template
         *
         * @returns {Promise}
         */
        $showSettings: function () {
            return new Promise(function (resolve, reject) {

                Template.get('ajax/brick/templates/settings', function (result) {
                    this.setContent(result);

                    // areas
                    var Content      = this.getContent(),
                        areas        = [],
                        attributes   = this.getAttribute('data').attributes,
                        customfields = this.$customfields;

                    if (attributes.areas) {
                        areas = attributes.areas
                                          .replace(/^,*/, '')
                                          .replace(/,*$/, '')
                                          .split(',');
                    }

                    // areas
                    this.$Areas = new BrickAreas({
                        brickId    : this.getAttribute('id'),
                        projectName: this.getAttribute('projectName'),
                        projectLang: this.getAttribute('projectLang'),
                        areas      : areas,
                        styles     : {
                            height: 120
                        }
                    }).inject(Content.getElement('.quiqqer-bricks-areas'));


                    // flexble settings
                    var i, len, data;
                    var TBody = Content.getElement('.brick-table-flexible tbody');

                    for (i = 0, len = this.$availableSettings.length; i < len; i++) {

                        data = this.$availableSettings[i];

                        new Element('tr', {
                            'class': i % 2 ? 'odd' : 'even',
                            html   : '<td>' +
                            '<label>' +
                            '<input type="checkbox" name="flexible-' + data.name + '" />' +
                            '<span>' + QUILocale.get(data.text[0], data.text[1]) + '</span>' +
                            '</label>' +
                            '</td>'
                        }).inject(TBody);
                    }

                    if (customfields) {

                        var name;
                        var Form = Content.getElement('form');

                        for (i = 0, len = customfields.length; i < len; i++) {

                            name = customfields[i];

                            if (typeof Form.elements[name] !== 'undefined') {
                                Form.elements[name].checked = true;
                            }

                            if (typeof Form.elements['flexible-' + name] !== 'undefined') {
                                Form.elements['flexible-' + name].checked = true;
                            }
                        }
                    }

                    resolve();

                }.bind(this), {
                    'package': 'quiqqer/bricks',
                    onError  : reject
                });

            }.bind(this));
        },

        /**
         * Setting extras
         *
         * @returns {Promise}
         */
        $showExtras: function () {
            return new Promise(function (resolve, reject) {

                Template.get('ajax/brick/templates/extras', function (result) {
                    this.setContent(result);

                    this.$createExtraData().then(function () {
                        resolve();
                    });

                }.bind(this), {
                    'package': 'quiqqer/bricks',
                    onError  : reject
                });

            }.bind(this));
        },

        /**
         * Setting content
         *
         * @returns {Promise}
         */
        $showContent: function () {
            return new Promise(function (resolve, reject) {

                Template.get('ajax/brick/templates/content', function (result) {
                    this.setContent(result);

                    this.$createContentEditor().then(function () {
                        resolve();
                    });

                }.bind(this), {
                    'package': 'quiqqer/bricks',
                    onError  : reject
                });

            }.bind(this));
        },

        /**
         * Create the editor, if the brick type is a content type
         *
         * @param {Function} [callback]
         * @return Promise
         */
        $createContentEditor: function (callback) {
            return new Promise(function (resolve) {

                var TableBody = this.$Elm.getElement('table.brick-edit-content tbody'),
                    TD        = new Element('td'),
                    TR        = new Element('tr', {
                        'class': 'odd'
                    });

                TD.inject(TR);
                TR.inject(TableBody);

                var contenSize = this.getContent().getSize();

                // load ckeditor
                require(['classes/editor/Manager'], function (EditorManager) {
                    new EditorManager().getEditor(null, function (Editor) {
                        this.$Editor = Editor;
                        this.$Editor.setAttribute('showLoader', false);

                        var Project = Projects.get(
                            this.getAttribute('projectName'),
                            this.getAttribute('projectLang')
                        );

                        this.$Editor.setProject(Project);

                        var height = 300;

                        if ((contenSize.y - 100) > height) {
                            height = contenSize.y - 100;
                        }


                        var EditorContainer = new Element('div', {
                            styles: {
                                clear  : 'both',
                                'float': 'left',
                                height : height,
                                width  : '100%'
                            }
                        }).inject(TD);

                        this.$Editor.addEvent('onLoaded', function () {
                            if (typeof callback === 'function') {
                                callback();
                            }

                            resolve();
                        });

                        this.$Editor.inject(EditorContainer);
                        this.$Editor.setHeight(EditorContainer.getSize().y);
                        this.$Editor.setWidth(EditorContainer.getSize().x);
                        this.$Editor.setContent(
                            this.getAttribute('data').attributes.content
                        );

                    }.bind(this));
                }.bind(this));
            }.bind(this));
        },

        /**
         * Create the extra settings table
         *
         * @return Promise
         */
        $createExtraData: function () {
            return new Promise(function (resolve, reject) {
                var TableExtra = this.$Elm.getElement('table.brick-edit-extra-header'),
                    TableBody  = TableExtra.getElement('tbody');

                TableBody.getElement('[name="frontendTitle"]').value = this.getAttribute(
                    'data').attributes.frontendTitle;

                if (!this.$availableSettings || !this.$availableSettings.length) {
                    TableExtra.setStyle('display', 'none');

                    new Element('div', {
                        html: QUILocale.get(lg, 'window.brick.no.extra.settings')
                    }).inject(TableExtra, 'before');

                    resolve();
                    return;
                }

                TableExtra.setStyle('display', null);

                var Form = this.getContent().getElement('form');

                var i, len, Row, text, Value, setting, extraFieldId;

                var self = this,
                    id   = this.getId();

                // extra settings
                for (i = 0, len = this.$availableSettings.length; i < len; i++) {
                    setting      = this.$availableSettings[i];
                    extraFieldId = 'extraField_' + id + '_' + i;

                    text = setting.text;

                    if (typeOf(setting.text) === 'array') {
                        text = QUILocale.get(setting.text[0], setting.text[1]);
                    }


                    Row = new Element('tr', {
                        'class': i % 2 ? 'odd' : 'even',
                        html   : '<td>' +
                        '    <label class="quiqqer-bricks-areas" for="' + extraFieldId + '">' +
                        text +
                        '    </label>' +
                        '</td>' +
                        '<td></td>'
                    }).inject(TableBody);

                    if (setting.type !== 'select') {
                        Value = new Element('input', {
                            type   : setting.type,
                            name   : setting.name,
                            'class': setting.class,
                            id     : extraFieldId
                        }).inject(Row.getElement('td:last-child'));

                        if (setting['data-qui'] !== '') {
                            Value.set('data-qui', setting['data-qui']);
                        }

                        continue;
                    }

                    Value = new Element('select', {
                        name   : setting.name,
                        'class': setting.class,
                        id     : extraFieldId
                    }).inject(Row.getElement('td:last-child'));


                    for (var c = 0, clen = setting.options.length; c < clen; c++) {
                        text = setting.options[c].text;

                        if (typeOf(setting.options[c].text) === 'array') {
                            text = QUILocale.get(
                                setting.options[c].text[0],
                                setting.options[c].text[1]
                            );
                        }

                        new Element('option', {
                            html : text,
                            value: setting.options[c].value
                        }).inject(Value);
                    }
                }

                TableExtra.setStyle('display', null);

                // set data
                QUIFormUtils.setDataToForm(
                    this.getAttribute('data').settings,
                    Form
                );

                // parse controls
                QUI.parse(TableExtra).then(function () {
                    return ControlUtils.parse(TableExtra);

                }).then(function () {
                    // set project to the controls
                    TableExtra.getElements('[data-quiid]').each(function (Elm) {
                        var Control = QUI.Controls.getById(
                            Elm.get('data-quiid')
                        );

                        if ('setProject' in Control) {
                            Control.setProject(
                                self.getAttribute('projectName'),
                                self.getAttribute('projectLang')
                            );
                        }
                    });

                    resolve();

                }).catch(reject);

            }.bind(this));
        }
    });
});
