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
    'package/quiqqer/bricks/bin/Bricks',

    'css!package/quiqqer/bricks/bin/BrickEdit.css'

], function (QUI, QUIPanel, QUIConfirm, BrickAreas, QUIAjax, QUILocale,
             Projects, QUIFormUtils, ControlUtils, Template, Bricks
) {
    "use strict";

    var lg = 'quiqqer/bricks';

    return new Class({

        Extends: QUIPanel,
        Type   : 'package/quiqqer/bricks/bin/BrickEdit',

        Binds: [
            '$onInject',
            '$onCreate',
            '$onDestroy',

            'showInformation',
            'showSettings',
            'showExtras',
            'showContent',
            'showUsage',

            '$load',
            '$unload',
            'save',
            'del',
            '$onCategoryEnter',
            '$onCategoryLeave'
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
            this.$loaded            = false;

            this.$Container = null;
            this.$Editor    = false;
            this.$Areas     = false;

            this.addEvents({
                onInject       : this.$onInject,
                onCreate       : this.$onCreate,
                onDestroy      : this.$onDestroy,
                onResize       : function () {
                    var controls = QUI.Controls.getControlsInElement(this.getContent());

                    controls.each(function (Control) {
                        if ("resize" in Control) {
                            Control.resize();
                        }
                    });
                }.bind(this),
                onCategoryEnter: this.$onCategoryEnter,
                onCategoryLeave: this.$onCategoryLeave
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
                    onClick: this.showInformation
                }
            });

            this.addCategory({
                name  : 'settings',
                icon  : 'fa fa-magic',
                text  : QUILocale.get('quiqqer/system', 'properties'),
                events: {
                    onClick: this.showSettings
                }
            });

            this.addCategory({
                name  : 'extra',
                icon  : 'fa fa-gears',
                text  : QUILocale.get('quiqqer/system', 'settings'),
                events: {
                    onClick: this.showExtras
                }
            });

            this.addCategory({
                name  : 'content',
                icon  : 'fa fa-file-text-o',
                text  : QUILocale.get('quiqqer/system', 'content'),
                events: {
                    onClick: this.showContent
                }
            });

            this.addCategory({
                name  : 'usage',
                icon  : 'fa fa-map-signs',
                text  : QUILocale.get(lg, 'brick.panel.category.usage'),
                events: {
                    onClick: this.showUsage
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
                'package_quiqqer_bricks_ajax_getAvailableBricks',
                'package_quiqqer_bricks_ajax_getPanelCategories'
            ], function (brick, bricks, categories) {
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

                this.getContent().setStyles({
                    position: 'relative'
                });

                this.$Container = new Element('div', {
                    'class': 'quiqqer-bricks-container'
                }).inject(this.getContent());

                // brick xml settings
                var type = brick.attributes.type;
                var data = bricks.filter(function (entry) {
                    return entry.control === type;
                });

                if (data.length && data[0].hasContent === 0) {
                    this.getCategory('content').hide();
                }

                for (var i = 0, len = categories.length; i < len; i++) {
                    this.addCategory(categories[i]);
                }

                this.refresh();

                this.fireEvent('loaded', [this]);
                this.getCategory('information').click();
                this.$loaded = true;
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
        save: function () {
            this.Loader.show();
            this.$unload();

            var self = this,
                data = self.getAttribute('data');

            data.customfields = self.$customfields;

            return Bricks.saveBrick(self.getAttribute('id'), data).then(function () {
                QUI.getMessageHandler().then(function (MH) {
                    MH.addSuccess(
                        QUILocale.get(lg, 'message.brick.save.success')
                    );
                });

                self.fireEvent('save', [self]);
                self.Loader.hide();
            }).catch(function (e) {
                QUI.getMessageHandler().then(function (MH) {
                    MH.addError(e.getMessage());
                });

                self.Loader.hide();
            });
        },

        /**
         * Delete the brick
         */
        del: function () {
            var self = this,
                data = this.getAttribute('data');

            new QUIConfirm({
                title      : QUILocale.get(lg, 'window.brick.delete.title'),
                text       : QUILocale.get(lg, 'window.brick.delete.text', {
                    brickId   : self.getAttribute('id'),
                    brickTitle: data.attributes.title
                }),
                information: QUILocale.get(lg, 'window.brick.delete.information'),
                icon       : 'fa fa-trash',
                texticon   : 'fa fa-trash',
                maxHeight  : 300,
                maxWidth   : 600,
                autoclose  : false,
                events     : {
                    onSubmit: function (Win) {
                        Win.Loader.show();

                        Bricks.deleteBricks([self.getAttribute('id')]).then(function () {
                            Win.close();
                            self.fireEvent('delete');
                        });
                    }
                }
            }).open();
        },

        /**
         * event on button active
         *
         * @return Promise
         */
        $load: function () {
            QUIFormUtils.setDataToForm(
                this.getAttribute('data').attributes,
                this.$Container.getElement('form')
            );

            QUIFormUtils.setDataToForm(
                this.getAttribute('data').settings,
                this.$Container.getElement('form')
            );
        },

        /**
         * event unload category
         */
        $unload: function () {
            if (!this.$loaded) {
                return;
            }

            if (!this.getActiveCategory()) {
                return;
            }

            var Form   = this.getContent().getElement('form'),
                unload = this.getActiveCategory().getAttribute('name'),
                data   = this.getAttribute('data');

            switch (unload) {
                case 'extra':
                case 'settings':
                case 'content':
                    break;

                default:
                    data.attributes = Object.merge(data.attributes, QUIFormUtils.getFormData(Form));
            }

            if (Form && Form.getElement('[name="frontendTitle"]')) {
                data.attributes.frontendTitle = Form.getElement('[name="frontendTitle"]').value;
            }

            if (unload === 'settings' && this.$Areas) {
                data.attributes.areas = this.$Areas.getAreas().join(',');

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
            }

            if (unload === 'extra') {
                var extra = QUIFormUtils.getFormData(Form);

                // filter numbers
                var isNumeric = function (n) {
                    return !isNaN(parseFloat(n)) && isFinite(n);
                };

                extra = Object.filter(extra, function (value, key) {
                    return !isNumeric(key);
                });

                data.settings = Object.merge(data.settings, extra);
            }

            if (unload === 'content' && this.$Editor) {
                data.attributes.content = this.$Editor.getContent();
            }

            this.setAttribute('data', data);
        },

        /**
         * Information template
         *
         * @returns {Promise}
         */
        showInformation: function () {
            var self = this;

            return this.$hideCategory().then(function () {
                return Template.get('ajax/brick/templates/information', false, {
                    'package': 'quiqqer/bricks'
                });
            }).then(function (html) {
                self.$Container.set('html', html);
                self.$load();
            }).then(function () {
                return self.$showCategory();
            }).then(function () {
                self.Loader.hide();
            });
        },

        /**
         * Settings template
         *
         * @returns {Promise}
         */
        showSettings: function () {
            var self = this;

            return this.$hideCategory().then(function () {
                return new Promise(function (resolve, reject) {
                    Template.get('ajax/brick/templates/settings', function (result) {
                        self.$Container.set('html', result);

                        // areas
                        var Content      = self.getContent(),
                            areas        = [],
                            attributes   = self.getAttribute('data').attributes,
                            customfields = self.$customfields;

                        if (attributes.areas) {
                            areas = attributes.areas
                                              .replace(/^,*/, '')
                                              .replace(/,*$/, '')
                                              .split(',');
                        }

                        // areas
                        self.$Areas = new BrickAreas({
                            brickId    : self.getAttribute('id'),
                            projectName: self.getAttribute('projectName'),
                            projectLang: self.getAttribute('projectLang'),
                            areas      : areas,
                            styles     : {
                                height: 120
                            }
                        }).inject(Content.getElement('.quiqqer-bricks-areas'));


                        // flexible settings
                        var i, len, data, description, Row;
                        var TBody = Content.getElement('.brick-table-flexible tbody');

                        for (i = 0, len = self.$availableSettings.length; i < len; i++) {
                            data = self.$availableSettings[i];

                            Row = new Element('tr', {
                                html: '<td>' +
                                    '<label class="field-container">' +
                                    '<span class="field-container-item">' +
                                    QUILocale.get(data.text[0], data.text[1]) + '' +
                                    '</span>' +
                                    '<div class="field-container-field">' +
                                    '<input type="checkbox" name="flexible-' + data.name + '" />' +
                                    '</div>' +
                                    '</label>' +
                                    '</td>'
                            }).inject(TBody);

                            description = data.description;

                            if (typeOf(data.description) === 'array') {
                                description = QUILocale.get(data.description[0], data.description[1]);
                            }

                            if (typeof description !== 'undefined' && description !== '') {
                                new Element('div', {
                                    'class': 'field-container-item-desc',
                                    html   : description
                                }).inject(Row.getElement('td'));
                            }
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
                    }, {
                        'package': 'quiqqer/bricks',
                        onError  : reject
                    });
                });
            }).then(function () {
                return self.$showCategory();
            }).then(function () {
                self.Loader.hide();
            }).catch(function (err) {
                console.error(err);
                self.Loader.hide();
            });
        },

        /**
         * Setting extras
         *
         * @returns {Promise}
         */
        showExtras: function () {
            var self = this;

            return this.$hideCategory().then(function () {
                return Template.get('ajax/brick/templates/extras', false, {
                    'package': 'quiqqer/bricks'
                });
            }).then(function (html) {
                self.$Container.set('html', html);
                self.$load();

                return self.$createExtraData();
            }).then(function () {
                return self.$showCategory();
            }).then(function () {
                self.Loader.hide();
            });
        },

        /**
         * Setting content
         *
         * @returns {Promise}
         */
        showContent: function () {
            var self = this;

            return this.$hideCategory().then(function () {
                return Template.get('ajax/brick/templates/content', false, {
                    'package': 'quiqqer/bricks'
                });
            }).then(function (html) {
                self.$Container.set('html', html);
                return self.$createContentEditor();
            }).then(function () {
                return self.$showCategory();
            }).then(function () {
                self.Loader.hide();
            }).catch(function (err) {
                console.error(err);
                self.Loader.hide();
            });
        },

        /**
         *
         * @return {Promise<T>}
         */
        showUsage: function () {
            var self = this;

            this.Loader.show();

            return this.$hideCategory().then(function () {
                return new Promise(function (resolve) {
                    require(['package/quiqqer/bricks/bin/Controls/backend/BrickUsage'], function (Control) {
                        new Control({
                            brickId: self.getAttribute('id'),
                            events : {
                                onLoad        : resolve,
                                onRefresh     : function () {
                                    self.Loader.hide();
                                },
                                onRefreshBegin: function () {
                                    self.Loader.show();
                                }
                            }
                        }).inject(self.$Container);
                    });
                });
            }).then(function (BrickUsage) {
                self.$Container.setStyles({
                    height: '100%'
                });

                BrickUsage.resize();

                return self.$showCategory();
            }).then(function () {
                self.Loader.hide();
            }).catch(function (err) {
                console.error(err);
                self.Loader.hide();
            });
        },

        /**
         * Create the editor, if the brick type is a content type
         *
         * @return Promise
         */
        $createContentEditor: function () {
            var self = this;

            return new Promise(function (resolve) {
                var TableBody = self.$Container.getElement('table.brick-edit-content tbody'),
                    TD        = new Element('td'),
                    TR        = new Element('tr', {
                        'class': 'odd'
                    });

                TD.inject(TR);
                TR.inject(TableBody);

                var contentSize = self.getContent().getSize();

                // load ckeditor
                require(['classes/editor/Manager'], function (EditorManager) {
                    new EditorManager().getEditor(null, function (Editor) {
                        self.$Editor = Editor;
                        self.$Editor.setAttribute('showLoader', false);

                        var Project = Projects.get(
                            self.getAttribute('projectName'),
                            self.getAttribute('projectLang')
                        );

                        self.$Editor.setProject(Project);

                        var height = 300;

                        if ((contentSize.y - 100) > height) {
                            height = contentSize.y - 100;
                        }


                        var EditorContainer = new Element('div', {
                            styles: {
                                clear  : 'both',
                                'float': 'left',
                                height : height,
                                width  : '100%'
                            }
                        }).inject(TD);

                        self.$Editor.addEvent('onLoaded', resolve);
                        self.$Editor.inject(EditorContainer);
                        self.$Editor.setHeight(EditorContainer.getSize().y);
                        self.$Editor.setWidth(EditorContainer.getSize().x);
                        self.$Editor.setContent(
                            self.getAttribute('data').attributes.content
                        );
                    });
                });
            });
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

                TableBody.getElement('[name="frontendTitle"]').value =
                    this.getAttribute('data').attributes.frontendTitle;

                if (!this.$availableSettings || !this.$availableSettings.length) {
                    TableExtra.setStyle('display', 'none');

                    new Element('div', {
                        html: QUILocale.get(lg, 'window.brick.no.extra.settings')
                    }).inject(TableExtra, 'before');

                    resolve();
                    return;
                }

                TableExtra.setStyle('display', null);

                var i, c, len, cLen, attr, Row, text, description, Value, setting,
                    extraFieldId, dataAttributes;

                var self = this,
                    id   = this.getId(),
                    Form = this.getContent().getElement('form');

                // extra settings
                for (i = 0, len = this.$availableSettings.length; i < len; i++) {
                    setting        = this.$availableSettings[i];
                    extraFieldId   = 'extraField_' + id + '_' + i;
                    dataAttributes = setting['data-attributes'];

                    text        = setting.text;
                    description = setting.description;

                    if (typeOf(setting.text) === 'array') {
                        text = QUILocale.get(setting.text[0], setting.text[1]);
                    }

                    if (typeOf(setting.description) === 'array') {
                        description = QUILocale.get(setting.description[0], setting.description[1]);
                    }


                    Row = new Element('tr', {
                        html: '<td>' +
                            '<label class="field-container" for="' + extraFieldId + '">' +
                            '<span class="field-container-item">' + text + '</span>' +
                            '</label>' +
                            '</td>'
                    }).inject(TableBody);

                    if (typeof description !== 'undefined' && description !== '') {
                        new Element('div', {
                            'class': 'field-container-item-desc',
                            html   : description
                        }).inject(Row.getElement('td'));
                    }

                    if (setting.type !== 'select') {
                        Value = new Element('input', {
                            type   : setting.type,
                            name   : setting.name,
                            'class': setting.class,
                            id     : extraFieldId
                        });

                        if (setting['data-qui'] !== '') {
                            Value.set('data-qui', setting['data-qui']);
                        }

                        if (typeof dataAttributes === 'object') {
                            for (attr in dataAttributes) {
                                if (dataAttributes.hasOwnProperty(attr)) {
                                    Value.set(attr, dataAttributes[attr]);
                                }
                            }
                        }

                        if (Value.type === 'checkbox' ||
                            Value.type === 'radio' ||
                            Value.type === 'hidden') {
                            var Container = new Element('div', {
                                'class': 'field-container-field'
                            }).inject(Row.getElement('.field-container'));

                            Value.inject(Container);
                            continue;
                        }

                        Value.classList.add('field-container-field');
                        Value.inject(Row.getElement('.field-container'));
                        continue;
                    }

                    Value = new Element('select', {
                        name   : setting.name,
                        'class': setting.class,
                        id     : extraFieldId
                    }).inject(Row.getElement('.field-container'));

                    Value.addClass('field-container-field');


                    for (c = 0, cLen = setting.options.length; c < cLen; c++) {
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

                    if (typeof dataAttributes === 'object') {
                        for (attr in dataAttributes) {
                            if (dataAttributes.hasOwnProperty(attr)) {
                                Value.set(attr, dataAttributes[attr]);
                            }
                        }
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
        },

        /**
         * event: on category enter
         *
         * @return Promise
         */
        $onCategoryEnter: function (Panel, Category) {
            if (this.$loaded === false) {
                return Promise.resolve();
            }

            switch (Category.getAttribute('name')) {
                case 'information':
                case 'extra':
                case 'settings':
                case 'content':
                case 'usage':
                    return Promise.resolve();
            }

            var self = this;

            this.Loader.show();

            return this.$hideCategory().then(function () {
                return new Promise(function (resolve, reject) {
                    QUIAjax.get('package_quiqqer_bricks_ajax_getPanelCategory', function (result) {
                        self.$Container.set('html', '<form>' + result + '</form>');
                        self.$load();
                        resolve();
                    }, {
                        'package': 'quiqqer/bricks',
                        brickId  : self.getAttribute('id'),
                        category : Category.getAttribute('name'),
                        onError  : reject
                    });
                });
            }).then(function () {
                return QUI.parse();
            }).then(function () {
                return self.$showCategory();
            }).then(function () {
                self.Loader.hide();

            }).catch(function (err) {
                console.error(err);
                self.Loader.hide();
            });
        },

        /**
         * event: on category leave
         */
        $onCategoryLeave: function () {
            this.$unload();

            if (this.$Areas) {
                this.$Areas.destroy();
                this.$Areas = false;
            }

            if (this.$Editor) {
                this.$Editor.destroy();
                this.$Editor = false;
            }
        },

        /**
         * show the container
         *
         * @return Promise
         */
        $showCategory: function () {
            var self = this;

            return new Promise(function (resolve) {
                moofx(self.$Container).animate({
                    opacity: 1,
                    top    : 0
                }, {
                    duration: 250,
                    callback: resolve
                });
            });
        },

        /**
         * hide the container
         *
         * @return Promise
         */
        $hideCategory: function () {
            var self = this;

            // unload
            this.$unload();

            return new Promise(function (resolve) {
                moofx(self.$Container).animate({
                    opacity: 0,
                    top    : -20
                }, {
                    duration: 250,
                    callback: function () {
                        self.$Container.set('html', '');
                        resolve();
                    }
                });
            });
        }
    });
});
