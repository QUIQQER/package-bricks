/**
 * @module package/quiqqer/bricks/bin/Controls/BoxContentSettings
 * @author Dominik Chrzanowski
 *
 */

define('package/quiqqer/bricks/bin/Controls/BoxContentSettings', [

    'qui/QUI',
    'qui/controls/Control',
    'qui/controls/windows/Confirm',
    'qui/controls/buttons/Button',
    'qui/controls/buttons/Switch',
    'Locale',
    'Mustache',
    'controls/grid/Grid',
    'utils/Controls',

    'text!package/quiqqer/bricks/bin/Controls/BoxContentSettings.html',

], function (
    QUI,
    QUIControl,
    QUIConfirm,
    QUIButton,
    QUISwitch,
    QUILocale,
    Mustache,
    Grid,
    ControlsUtils,
    templateEntry
) {
    "use strict";

    var lg = 'quiqqer/bricks';

    return new Class({

        Extends: QUIControl,
        Type: 'package/quiqqer/bricks/bin/Controls/BoxContentSettings',

        Binds: [
            '$onImport',
            '$openAddDialog',
            '$openDeleteDialog',
            '$openEditDialog',
            '$toggleSlideStatus',
            'update'
        ],

        initialize: function (options) {
            this.parent(options);

            this.$Input = null;
            this.$Grid = null;

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
                'class': 'quiqqer-menu-navTabsVertival-settings',
                styles: {
                    clear: 'both',
                    'float': 'left',
                    height: 400,
                    overflow: 'hidden',
                    position: 'relative',
                    margin: '10px 0 0 0',
                    width: '100%'
                }
            }).wraps(this.$Input);

            // grid and sizes
            var size = this.$Elm.getSize();

            var Desktop = new Element('div', {
                styles: {
                    width: size.x
                }
            }).inject(this.$Elm);

            this.$Grid = new Grid(Desktop, {
                height: 400,
                width: size.x,
                buttons: [
                    {
                        name: 'up',
                        icon: 'fa fa-angle-up',
                        disabled: true,
                        events: {
                            onClick: function () {
                                this.$Grid.moveup();
                                this.$refreshSorting();
                            }.bind(this)
                        }
                    }, {
                        name: 'down',
                        icon: 'fa fa-angle-down',
                        disabled: true,
                        events: {
                            onClick: function () {
                                this.$Grid.movedown();
                                this.$refreshSorting();
                            }.bind(this)
                        }
                    }, {
                        type: 'separator'
                    }, {
                        name: 'add',
                        textimage: 'fa fa-plus',
                        text: QUILocale.get('quiqqer/quiqqer', 'add'),
                        events: {
                            onClick: this.$openAddDialog
                        }
                    }, {
                        type: 'separator'
                    }, {
                        name: 'edit',
                        textimage: 'fa fa-edit',
                        text: QUILocale.get('quiqqer/quiqqer', 'edit'),
                        disabled: true,
                        events: {
                            onClick: this.$openEditDialog
                        }
                    }, {
                        name: 'delete',
                        textimage: 'fa fa-trash',
                        text: QUILocale.get('quiqqer/quiqqer', 'delete'),
                        disabled: true,
                        events: {
                            onClick: this.$openDeleteDialog
                        }
                    }
                ],
                columnModel: [
                    {
                        header: QUILocale.get(lg, 'control.boxContent.entries.disable'),
                        dataIndex: 'isDisabledDisplay',
                        dataType: 'QUI',
                        width: 80
                    }, {
                        dataIndex: 'isDisabled',
                        hidden: true
                    },
                    {
                        header: QUILocale.get(lg, 'control.boxContent.entries.title'),
                        dataIndex: 'title',
                        dataType: 'code',
                        width: 120
                    },
                    {
                        header: QUILocale.get(lg, 'control.boxContent.entries.text'),
                        dataIndex: 'text',
                        dataType: 'code',
                        width: 250
                    },
                    {
                        dataIndex: 'newTab',
                        hidden: true
                    }, {
                        dataIndex: 'image',
                        dataType: 'string',
                        hidden: true
                    }
                ]
            });

            this.$Grid.addEvents({
                onClick: function () {
                    var buttons = this.$Grid.getButtons(),

                        Edit = buttons.filter(function (Btn) {
                            return Btn.getAttribute('name') === 'edit';
                        })[0],

                        Up = buttons.filter(function (Btn) {
                            return Btn.getAttribute('name') === 'up';
                        })[0],

                        Down = buttons.filter(function (Btn) {
                            return Btn.getAttribute('name') === 'down';
                        })[0],

                        Delete = buttons.filter(function (Btn) {
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
         * Toggles the slide's status between enabled and disabled
         *
         * @param {Object} [Caller] - the object calling this event
         */
        $toggleSlideStatus: function (Caller) {
            if (!Caller) {
                return;
            }

            // get cell number
            var row = Caller.getElm().getParent('li').get('data-row');

            this.$data[row].isDisabled = Caller.getStatus();
            this.update();
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
                entry = this.$data[i];
                insert = {};

                entry.isDisabled = parseInt(entry.isDisabled);

                insert.isDisabledDisplay = new QUISwitch({
                    status: entry.isDisabled,
                    name: i,
                    uid: i,
                    events: {
                        onChange: this.$toggleSlideStatus
                    }
                });

                if ("title" in entry) {
                    insert.title = entry.title;
                }

                if ("text" in entry) {
                    insert.text = entry.text;
                }

                data.push(insert);
            }

            this.$Grid.setData({
                data: data
            });

            var buttons = this.$Grid.getButtons(),

                Edit = buttons.filter(function (Btn) {
                    return Btn.getAttribute('name') === 'edit';
                })[0],

                Up = buttons.filter(function (Btn) {
                    return Btn.getAttribute('name') === 'up';
                })[0],

                Down = buttons.filter(function (Btn) {
                    return Btn.getAttribute('name') === 'down';
                })[0],

                Delete = buttons.filter(function (Btn) {
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
                title: '',
                text: '',
                isDisabled: 0
            };

            if ("isDisabled" in params) {
                entry.isDisabled = parseInt(params.isDisabled);
            }

            if ("title" in params) {
                entry.title = params.title;
            }

            if ("text" in params) {
                entry.text = params.text;
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
                title: '',
                text: '',
                isDisabled: 0
            };

            if ("isDisabled" in params) {
                entry.isDisabled = parseInt(params.isDisabled);
            }

            if ("title" in params) {
                entry.title = params.title;
            }

            if ("text" in params) {
                entry.text = params.text;
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
                data = [];

            for (var i = 0, len = gridData.length; i < len; i++) {
                data.push({
                    isDisabled: parseInt(gridData[i].isDisabled),
                    title: gridData[i].title,
                    text: gridData[i].text,
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
                icon: 'fa fa-icon',
                title: QUILocale.get(lg, 'control.boxContent.entries.delete.title'),
                text: QUILocale.get(lg, 'control.boxContent.entries.delete.title'),
                information: QUILocale.get(lg, 'control.boxContent.entries.delete.information'),
                texticon: false,
                maxWidth: 600,
                maxHeight: 400,
                ok_button: {
                    text: QUILocale.get('quiqqer/quiqqer', 'delete'),
                    textimage: 'fa fa-trash'
                },
                events: {
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
            var self = this,
                data = this.$Grid.getSelectedData(),
                index = this.$Grid.getSelectedIndices();

            if (!data.length) {
                return Promise.resolve();
            }

            data = data[0];
            index = index[0];

            return this.$createDialog().then(function (Dialog) {

                Dialog.addEvent('onSubmit', function () {
                    Dialog.Loader.show();

                    var Content = Dialog.getContent();
                    var Form = Content.getElement('form');

                    var title = Form.elements.title;
                    var text = Form.elements.text;

                    self.edit(index, {
                        title: title.value,
                        text: text.value,
                        isDisabled: Dialog.IsDisabledSwitch.getStatus()
                    });

                    Dialog.close();
                });


                Dialog.addEvent('onOpenAfterCreate', function () {

                    var Content = Dialog.getContent();
                    var Form = Content.getElement('form');

                    var title = Form.elements.title;
                    var text = Form.elements.text;

                    if (data.isDisabled) {
                        Dialog.IsDisabledSwitch.on();
                    } else {
                        Dialog.IsDisabledSwitch.off();
                    }

                    title.value = data.title;
                    text.value = data.text;

                    if (data.newTab && data.newTab.getAttribute('data-enabled') === "1") {
                        Dialog.NewTabSwitch.on();
                    } else {
                        Dialog.NewTabSwitch.off();
                    }

                    title.fireEvent('change');
                    text.fireEvent('change');
                });

                Dialog.setAttribute('title', QUILocale.get(lg, 'control.boxContent.entries.edit.title'));
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
                    var Form = Content.getElement('form');

                    var title = Form.elements.title;
                    var text = Form.elements.text;

                    self.add({
                        title: title.value,
                        text: text.value,
                        isDisabled: Dialog.IsDisabledSwitch.getStatus()
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
                    title: QUILocale.get(lg, 'control.boxContent.entries.add.title'),
                    icon: 'fa fa-edit',
                    maxWidth: 800,
                    maxHeight: 600,
                    autoclose: false,
                    IsDisabledSwitch: false,
                    NewTabSwitch: false,
                    events: {
                        onOpen: function (Win) {
                            Win.Loader.show();
                            Win.getContent().set('html', '');


                            var prefix = 'control.boxContent.entries.',
                                Container = new Element('div', {
                                    html: Mustache.render(templateEntry, {
                                        fieldIsDisabled : QUILocale.get(lg, prefix + 'disable'),
                                        fieldTitle: QUILocale.get(lg, prefix + 'title'),
                                        fieldText: QUILocale.get(lg, prefix + 'text')
                                    }),
                                    'class': 'quiqqer-bricks-boxContent-settings'
                                }).inject(Win.getContent());

                            var Text = Container.getElement('.field-text');

                            Text.getParent().setStyles({
                                height: 100
                            });

                            Win.IsDisabledSwitch = new QUISwitch({
                                name: 'isDisabled',
                                status: false
                            }).inject(Container.getElement('#isDisabledWrapper'));

                            Win.NewTabSwitch = new QUISwitch({
                                name: 'newTab'
                            }).inject(Container.getElement('#newTabWrapper'));


                            QUI.parse(Container).then(function () {
                                return ControlsUtils.parse(Container);
                            }).then(function () {
                                var controls = QUI.Controls.getControlsInElement(Container),
                                    project = self.getAttribute('project');

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
                                    top: 0
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
