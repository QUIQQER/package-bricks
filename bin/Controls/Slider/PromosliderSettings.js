/**
 * @module package/quiqqer/bricks/bin/Controls/Slider/PromosliderSettings
 * @author www.pcsg.de (Henning Leutz)
 *
 * Inhaltseinstellung für Promoslider
 */
define('package/quiqqer/bricks/bin/Controls/Slider/PromosliderSettings', [

    'qui/QUI',
    'qui/controls/Control',
    'qui/controls/windows/Confirm',
    'qui/controls/buttons/Button',
    'Locale',
    'Mustache',
    'controls/grid/Grid',
    'utils/Controls',

    'text!package/quiqqer/bricks/bin/Controls/Slider/PromosliderSettingsEntry.html',
    'css!package/quiqqer/bricks/bin/Controls/Slider/PromoSliderSettings.css'

], function (QUI, QUIControl, QUIConfirm, QUIButton, QUILocale, Mustache, Grid, ControlsUtils, templateEntry) {
    "use strict";

    var lg = 'quiqqer/bricks';

    return new Class({

        Extends: QUIControl,
        Type   : 'package/quiqqer/bricks/bin/Controls/Slider/PromosliderSettings',

        Binds: [
            '$onImport',
            '$openAddDialog',
            '$openDeleteDialog',
            '$openEditDialog'
        ],

        initialize: function (options) {
            this.parent(options);

            this.$Input = null;
            this.$Grid  = null;

            this.$data = [];

            this.addEvents({
                onImport: this.$onImport
            });
        },

        /**
         * event: on import
         */
        $onImport: function () {
            this.$Input = this.getElm();

            this.$Elm = new Element('div', {
                'class': 'quiqqer-bricks-promoslider-settings',
                styles : {
                    clear   : 'both',
                    'float' : 'left',
                    height  : 400,
                    overflow: 'hidden',
                    position: 'relative',
                    margin  : '10px 0 0 0',
                    width   : '100%'
                }
            }).wraps(this.$Input);

            // exist label?
            var id    = this.$Input.get('id'),
                Label = document.getElement('label[for="' + id + '"]');

            if (Label) {
                var Cell    = Label.getParent('td'),
                    OldCell = this.$Elm.getParent('td');

                Cell.set('colspan', 2);

                this.$Elm.inject(Cell);
                OldCell.destroy();
            }

            // grid and sizes
            var size = this.$Elm.getSize();

            var Desktop = new Element('div', {
                styles: {
                    width: size.x
                }
            }).inject(this.$Elm);

            this.$Grid = new Grid(Desktop, {
                height     : 400,
                width      : size.x,
                buttons    : [{
                    name    : 'up',
                    icon    : 'fa fa-angle-up',
                    disabled: true,
                    events  : {
                        onClick: function () {
                            this.$Grid.moveup();
                            this.$refreshSorting();
                        }.bind(this)
                    }
                }, {
                    name    : 'down',
                    icon    : 'fa fa-angle-down',
                    disabled: true,
                    events  : {
                        onClick: function () {
                            this.$Grid.movedown();
                            this.$refreshSorting();
                        }.bind(this)
                    }
                }, {
                    type: 'separator'
                }, {
                    name     : 'add',
                    textimage: 'fa fa-plus',
                    text     : QUILocale.get('quiqqer/system', 'add'),
                    events   : {
                        onClick: this.$openAddDialog
                    }
                }, {
                    type: 'separator'
                }, {
                    name     : 'edit',
                    textimage: 'fa fa-edit',
                    text     : QUILocale.get('quiqqer/system', 'edit'),
                    disabled : true,
                    events   : {
                        onClick: this.$openEditDialog
                    }
                }, {
                    name     : 'delete',
                    textimage: 'fa fa-trash',
                    text     : QUILocale.get('quiqqer/system', 'delete'),
                    disabled : true,
                    events   : {
                        onClick: this.$openDeleteDialog
                    }
                }],
                columnModel: [{
                    header   : QUILocale.get(lg, 'quiqqer.bricks.promoslider.create.isDisabled.short'),
                    dataIndex: 'isDisabled',
                    dataType : 'boolean',
                    width    : 60
                }, {
                    header   : QUILocale.get('quiqqer/system', 'image'),
                    dataIndex: 'imagePreview',
                    dataType : 'node',
                    width    : 60
                }, {
                    header   : QUILocale.get('quiqqer/system', 'title'),
                    dataIndex: 'title',
                    dataType : 'string',
                    width    : 300
                }, {
                    header   : QUILocale.get(lg, 'quiqqer.bricks.promoslider.create.align'),
                    dataIndex: 'type',
                    dataType : 'string',
                    width    : 200
                }, {
                    header   : QUILocale.get(lg, 'quiqqer.bricks.promoslider.create.url'),
                    dataIndex: 'url',
                    dataType : 'string',
                    width    : 300
                }, {
                    header   : QUILocale.get(lg, 'quiqqer.bricks.promoslider.create.newTab.short'),
                    dataIndex: 'newTab',
                    dataType : 'boolean',
                    width    : 60
                }, {
                    dataIndex: 'image',
                    dataType : 'string',
                    hidden   : true
                }]
            });

            this.$Grid.addEvents({
                onClick: function () {
                    var buttons = this.$Grid.getButtons(),

                        Edit    = buttons.filter(function (Btn) {
                            return Btn.getAttribute('name') === 'edit';
                        })[0],

                        Up      = buttons.filter(function (Btn) {
                            return Btn.getAttribute('name') === 'up';
                        })[0],

                        Down    = buttons.filter(function (Btn) {
                            return Btn.getAttribute('name') === 'down';
                        })[0],

                        Delete  = buttons.filter(function (Btn) {
                            return Btn.getAttribute('name') === 'delete';
                        })[0];

                    Up.enable();
                    Down.enable();
                    Edit.enable();
                    Delete.enable();
                }.bind(this),

                onDblClick: this.$openEditDialog
            });

            this.$Grid.getElm().setStyles({
                position: 'absolute'
            });


            try {
                this.$data = JSON.decode(this.$Input.value);

                if (typeOf(this.$data) !== 'array') {
                    this.$data = [];
                }

                this.refresh();
            } catch (e) {
            }
        },

        /**
         * Resize the control
         *
         * @return {Promise}
         */
        resize: function () {
            var size = this.getElm().getSize();

            return this.$Grid.setWidth(size.x).then(function () {
                this.$Grid.resize();
            }.bind(this));
        },

        /**
         * refresh the display
         */
        refresh: function () {
            var i, len, entry, insert;
            var data = [];

            for (i = 0, len = this.$data.length; i < len; i++) {
                entry  = this.$data[i];
                insert = {};

                if ("isDisabled" in entry) {
                    insert.isDisabled = entry.isDisabled;
                }

                if ("image" in entry && entry.image !== '') {
                    insert.image = entry.image;

                    insert.imagePreview = new Element('img', {
                        src: URL_DIR + insert.image + '&maxwidth=50&maxheight=50'
                    });
                }

                if ("title" in entry) {
                    insert.title = entry.title;
                }

                if ("text" in entry) {
                    insert.text = entry.text;
                }

                if ("type" in entry) {
                    insert.type = entry.type;
                }

                if ("url" in entry) {
                    insert.url = entry.url;
                }

                if ("newTab" in entry) {
                    insert.newTab = entry.newTab;
                }

                data.push(insert);
            }

            this.$Grid.setData({
                data: data
            });

            var buttons = this.$Grid.getButtons(),

                Edit    = buttons.filter(function (Btn) {
                    return Btn.getAttribute('name') === 'edit';
                })[0],

                Up      = buttons.filter(function (Btn) {
                    return Btn.getAttribute('name') === 'up';
                })[0],

                Down    = buttons.filter(function (Btn) {
                    return Btn.getAttribute('name') === 'down';
                })[0],

                Delete  = buttons.filter(function (Btn) {
                    return Btn.getAttribute('name') === 'delete';
                })[0];

            Up.disable();
            Down.disable();
            Edit.disable();
            Delete.disable();
        },

        /**
         * Update the field
         */
        update: function () {
            this.$Input.value = JSON.encode(this.$data);
        },

        /**
         * Add an entry
         *
         * @param {Object} params
         */
        add: function (params) {
            var entry = {
                image : '',
                title : '',
                text  : '',
                type  : '',
                url   : '',
                newTab: ''
            };

            if ("isDisabled" in params) {
                entry.isDisabled = params.isDisabled;
            }

            if ("image" in params) {
                entry.image = params.image;
            }

            if ("title" in params) {
                entry.title = params.title;
            }

            if ("text" in params) {
                entry.text = params.text;
            }

            if ("type" in params) {
                entry.type = params.type;
            }

            if ("url" in params) {
                entry.url = params.url;
            }

            if("newTab" in params) {
                entry.newTab = params.newTab;
            }

            this.$data.push(entry);
            this.refresh();
            this.update();
        },

        /**
         * Edit an entry
         *
         * @param {number} index
         * @param {object} params
         */
        edit: function (index, params) {
            if (typeof index === 'undefined') {
                return;
            }

            var entry = {
                isDisabled: '',
                image     : '',
                title     : '',
                text      : '',
                type      : '',
                url       : '',
                newTab    : ''
            };

            if ("isDisabled" in params) {
                entry.isDisabled = params.isDisabled;
            }

            if ("image" in params) {
                entry.image = params.image;
            }

            if ("title" in params) {
                entry.title = params.title;
            }

            if ("text" in params) {
                entry.text = params.text;
            }

            if ("type" in params) {
                entry.type = params.type;
            }

            if ("url" in params) {
                entry.url = params.url;
            }

            if ("newTab" in params) {
                entry.newTab = params.newTab;
            }

            this.$data[index] = entry;

            this.refresh();
            this.update();
        },

        /**
         * Delete one entry or multiple entries
         *
         * @param {number|array} index
         */
        del: function (index) {
            var newList = [];

            if (typeOf(index) !== 'array') {
                index = [index];
            }

            for (var i = 0, len = this.$data.length; i < len; i++) {
                if (!index.contains(i)) {
                    newList.push(this.$data[i]);
                }
            }

            this.$data = newList;
        },

        /**
         * Set the used project
         *
         * @param {string|object} Project
         */
        setProject: function (Project) {
            this.setAttribute('project', Project);

            var controls = QUI.Controls.getControlsInElement(this.getElm());

            controls.each(function (Control) {
                if (Control === this) {
                    return;
                }

                if ("setProject" in Control) {
                    Control.setProject(Project);
                }
            }.bind(this));
        },

        /**
         * Refresh the data sorting in dependence of the grid
         */
        $refreshSorting: function () {
            var gridData = this.$Grid.getData(),
                data     = [];

            for (var i = 0, len = gridData.length; i < len; i++) {
                data.push({
                    isDisabled: gridData[i].isDisabled,
                    image     : gridData[i].image,
                    title     : gridData[i].title,
                    text      : gridData[i].text,
                    type      : gridData[i].type,
                    url       : gridData[i].url
                });
            }

            this.$data = data;
            this.update();
        },

        /**
         * Dialogs
         */

        /**
         * opens the delete dialog
         *
         * @return {Promise}
         */
        $openDeleteDialog: function () {
            new QUIConfirm({
                icon       : 'fa fa-icon',
                title      : QUILocale.get(lg, 'quiqqer.products.control.delete.title'),
                text       : QUILocale.get(lg, 'quiqqer.products.control.delete.text'),
                information: QUILocale.get(lg, 'quiqqer.products.control.delete.information'),
                texticon   : false,
                maxWidth   : 600,
                maxHeight  : 400,
                ok_button  : {
                    text     : QUILocale.get('quiqqer/system', 'delete'),
                    textimage: 'fa fa-trash'
                },
                events     : {
                    onSubmit: function () {
                        var selected = this.$Grid.getSelectedIndices();

                        this.$Grid.deleteRows(selected);
                        this.del(selected);
                        this.update();
                    }.bind(this)
                }
            }).open();
        },

        /**
         * Open edit dialog
         *
         * @retrun {Promise}
         */
        $openEditDialog: function () {
            var self  = this,
                data  = this.$Grid.getSelectedData(),
                index = this.$Grid.getSelectedIndices();

            if (!data.length) {
                return Promise.resolve();
            }

            data  = data[0];
            index = index[0];

            return this.$createDialog().then(function (Dialog) {
                Dialog.addEvent('onSubmit', function () {
                    Dialog.Loader.show();

                    var Content = Dialog.getContent();
                    var Form    = Content.getElement('form');

                    var IsDisabled  = Form.elements.isDisabled;
                    var Image       = Form.elements.image;
                    var Title       = Form.elements.title;
                    var Description = Form.elements.description;
                    var Type        = Form.elements.type;
                    var Url         = Form.elements.url;
                    var NewTab      = Form.elements.newTab;

                    self.edit(index, {
                        isDisabled: IsDisabled.value,
                        image     : Image.value,
                        title     : Title.value,
                        text      : Description.value,
                        type      : Type.value,
                        url       : Url.value,
                        newTab    : NewTab.value
                    });

                    Dialog.close();
                });


                Dialog.addEvent('onOpenAfterCreate', function () {
                    var Content = Dialog.getContent();
                    var Form    = Content.getElement('form');

                    var Image       = Form.elements.image;
                    var Title       = Form.elements.title;
                    var Description = Form.elements.description;
                    var Type        = Form.elements.type;
                    var Url         = Form.elements.url;

                    if (data.isDisabled === "1") {
                        Dialog.IsDisabledSwitch.on();
                    } else {
                        Dialog.IsDisabledSwitch.off();
                    }

                    Image.value       = data.image;
                    Title.value       = data.title;
                    Description.value = data.text;
                    Type.value        = data.type;
                    Url.value         = data.url;

                    if (data.newTab === "1") {
                        Dialog.NewTabSwitch.on();
                    } else {
                        Dialog.NewTabSwitch.off();
                    }

                    Image.fireEvent('change');
                    Description.fireEvent('change');
                });

                Dialog.setAttribute('title', QUILocale.get(lg, 'quiqqer.bricks.promoslider.editialog.title'));
                Dialog.open();
            });
        },

        /**
         * opens the add dialog
         *
         * @return {Promise}
         */
        $openAddDialog: function () {
            var self = this;

            return this.$createDialog().then(function (Dialog) {
                Dialog.addEvent('onSubmit', function () {
                    Dialog.Loader.show();

                    var Content = Dialog.getContent();
                    var Form    = Content.getElement('form');

                    var IsDisabled   = Form.elements.isDisabled;
                    var Image        = Form.elements.image;
                    var Title        = Form.elements.title;
                    var Description  = Form.elements.description;
                    var Type         = Form.elements.type;
                    var Url          = Form.elements.url;
                    var NewTab       = Form.elements.newTab;

                    self.add({
                        isDisabled: IsDisabled.value,
                        image     : Image.value,
                        title     : Title.value,
                        text      : Description.value,
                        type      : Type.value,
                        url       : Url.value,
                        newTab    : NewTab.value
                    });

                    Dialog.close();
                });

                Dialog.open();
            });
        },

        /**
         * Create a edit / add entry dialog
         *
         * @return {Promise}
         */
        $createDialog: function () {
            var self = this;

            return new Promise(function (resolve) {
                var Dialog = new QUIConfirm({
                    title           : QUILocale.get(lg, 'quiqqer.bricks.promoslider.adddialog.title'),
                    icon            : 'fa fa-edit',
                    maxWidth        : 800,
                    maxHeight       : 600,
                    autoclose       : false,
                    IsDisabledSwitch: false,
                    NewTabSwitch    : false,
                    events          : {
                        onOpen: function (Win) {
                            Win.Loader.show();
                            Win.getContent().set('html', '');

                            var Container = new Element('div', {
                                html   : Mustache.render(templateEntry, {
                                    fieldIsDisabled : QUILocale.get(lg, 'quiqqer.bricks.promoslider.create.isDisabled'),
                                    fieldImage      : QUILocale.get(lg, 'quiqqer.bricks.promoslider.create.image'),
                                    fieldUrl        : QUILocale.get(lg, 'quiqqer.bricks.promoslider.create.url'),
                                    fieldNewTab     : QUILocale.get(lg, 'quiqqer.bricks.promoslider.create.newTab'),
                                    fieldTitle      : QUILocale.get(lg, 'quiqqer.bricks.promoslider.create.title'),
                                    fieldDescription: QUILocale.get(lg, 'quiqqer.bricks.promoslider.create.text'),
                                    fieldType       : QUILocale.get(lg, 'quiqqer.bricks.promoslider.create.align'),
                                    fieldTypeLeft   : QUILocale.get(lg, 'quiqqer.bricks.promoslider.create.align.left'),
                                    fieldTypeRight  : QUILocale.get(lg, 'quiqqer.bricks.promoslider.create.align.right')
                                }),
                                'class': 'quiqqer-bricks-promoslider-settings-entry'
                            }).inject(Win.getContent());

                            var Text = Container.getElement('.field-description');

                            Text.getParent().setStyles({
                                height: 100
                            });

                            var ThisDialog = this;
                            require(['qui/controls/buttons/Switch'], function (SwitchControl) {
                                ThisDialog.IsDisabledSwitch = new SwitchControl({
                                    name: 'isDisabled'
                                });
                                ThisDialog.IsDisabledSwitch.inject(Container.getElement('#isDisabledWrapper'));

                                ThisDialog.NewTabSwitch = new SwitchControl({
                                    name: 'newTab'
                                });
                                ThisDialog.NewTabSwitch.inject(Container.getElement('#newTabWrapper'));
                            });

                            QUI.parse(Container).then(function () {
                                return ControlsUtils.parse(Container);
                            }).then(function () {
                                var controls = QUI.Controls.getControlsInElement(Container),
                                    project  = self.getAttribute('project');

                                controls.each(function (Control) {
                                    if (Control === self) {
                                        return;
                                    }

                                    if ("setProject" in Control) {
                                        Control.setProject(project);
                                    }
                                });

                                Win.fireEvent('openAfterCreate', [Win]);

                                moofx(Container).animate({
                                    opacity: 1,
                                    top    : 0
                                }, {
                                    duration: 250,
                                    callback: function () {
                                        resolve(Container);
                                        Win.Loader.hide();
                                    }
                                });
                            });
                        }
                    }
                });

                resolve(Dialog);
            });
        }
    });
});
