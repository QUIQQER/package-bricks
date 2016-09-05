/**
 *
 */
define('package/quiqqer/bricks/bin/Controls/Slider/PromosliderSettingsOnlyContent', [

    'qui/QUI',
    'qui/controls/Control',
    'qui/controls/windows/Confirm',
    'qui/controls/buttons/Button',
    'Locale',
    'Mustache',
    'controls/grid/Grid',
    'utils/Controls',

    'text!package/quiqqer/bricks/bin/Controls/Slider/PromosliderSettingsOnlyContentEntry.html',
    'css!package/quiqqer/bricks/bin/Controls/Slider/PromoSliderSettings.css'

], function (QUI, QUIControl, QUIConfirm, QUIButton, QUILocale,
             Mustache, Grid, ControlsUtils, templateEntry) {
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
                    type: 'seperator'
                }, {
                    name     : 'add',
                    textimage: 'fa fa-plus',
                    text     : QUILocale.get('quiqqer/system', 'add'),
                    events   : {
                        onClick: this.$openAddDialog
                    }
                }, {
                    type: 'seperator'
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
                    header   : QUILocale.get('quiqqer/system', 'image'),
                    dataIndex: 'imagePreview',
                    dataType : 'node',
                    width    : 60
                }, {
                    header   : QUILocale.get(lg, 'quiqqer.products.control.promoslider.left'),
                    dataIndex: 'left',
                    dataType : 'code',
                    width    : 300
                }, {
                    header   : QUILocale.get(lg, 'quiqqer.products.control.promoslider.right'),
                    dataIndex: 'right',
                    dataType : 'code',
                    width    : 300
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
                            return Btn.getAttribute('name') == 'edit';
                        })[0],

                        Up      = buttons.filter(function (Btn) {
                            return Btn.getAttribute('name') == 'up';
                        })[0],

                        Down    = buttons.filter(function (Btn) {
                            return Btn.getAttribute('name') == 'down';
                        })[0],

                        Delete  = buttons.filter(function (Btn) {
                            return Btn.getAttribute('name') == 'delete';
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

                if (typeOf(this.$data) != 'array') {
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
                insert = {
                    image       : '',
                    imagePreview: new Element('span', {html: '&nbsp;'})
                };

                if ("image" in entry) {
                    insert.image = entry.image;

                    insert.imagePreview = new Element('img', {
                        src: URL_DIR + insert.image + '&maxwidth=50&maxheight=50'
                    });
                }

                if ("left" in entry) {
                    insert.left = entry.left;
                }

                if ("right" in entry) {
                    insert.right = entry.right;
                }

                data.push(insert);
            }

            this.$Grid.setData({
                data: data
            });

            var buttons = this.$Grid.getButtons(),

                Edit    = buttons.filter(function (Btn) {
                    return Btn.getAttribute('name') == 'edit';
                })[0],

                Up      = buttons.filter(function (Btn) {
                    return Btn.getAttribute('name') == 'up';
                })[0],

                Down    = buttons.filter(function (Btn) {
                    return Btn.getAttribute('name') == 'down';
                })[0],

                Delete  = buttons.filter(function (Btn) {
                    return Btn.getAttribute('name') == 'delete';
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
         * @param {string} [left] - left content
         * @param {string} [right] - right content
         */
        add: function (left, right, image) {
            this.$data.push({
                left : left || '',
                right: right || '',
                image: image || ''
            });

            this.refresh();
            this.update();
        },

        /**
         * Edit an entry
         *
         * @param {number} index
         * @param {string} [left] - left content
         * @param {string} [right] - right content
         * @param {string} [image] - image path
         */
        edit: function (index, left, right, image) {
            if (typeof index === 'undefined') {
                return;
            }

            this.$data[index] = {
                left : left || '',
                right: right || '',
                image: image || ''
            };

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

            if (typeOf(index) != 'array') {
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
                if (Control == this) {
                    return;
                }

                if ("setProject" in Control) {
                    Control.setProject(Project);
                }
            }.bind(this));
        },

        /**
         * Open edit dialog
         *
         * @retrun {Promise}
         */
        $openEditDialog: function () {
            var data  = this.$Grid.getSelectedData();
            var index = this.$Grid.getSelectedIndices();

            if (!data.length) {
                return;
            }

            data  = data[0];
            index = index[0];

            return this.$createDialog().then(function (Container) {
                var CloseButton = Container.getElement(
                    '.quiqqer-bricks-promoslider-settings-entry-buttons button'
                );

                var Button = QUI.Controls.getById(CloseButton.get('data-quiid'));
                var Form   = Container.getElement('form');

                var Left  = Form.elements.left;
                var Right = Form.elements.right;
                var Image = Form.elements.image;

                Button.addEvent('click', function () {
                    this.edit(index, Left.value, Right.value, Image.value);

                    moofx(Container).animate({
                        opacity: 0,
                        top    : -30
                    }, {
                        duration: 250,
                        callback: function () {
                            Container.destroy();
                        }
                    });
                }.bind(this));

                Left.value  = data.left;
                Right.value = data.right;
                Image.value = data.image;

                Image.fireEvent('change');
            }.bind(this));
        },

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
         *
         * @returns {Promise}
         */
        $openAddDialog: function () {
            return this.$createDialog().then(function (Container) {
                var CloseButton = Container.getElement(
                    '.quiqqer-bricks-promoslider-settings-entry-buttons button'
                );

                var Button = QUI.Controls.getById(CloseButton.get('data-quiid'));

                Button.addEvent('click', function () {
                    var Form = Container.getElement('form');

                    var Left  = Form.elements.left;
                    var Right = Form.elements.right;
                    var Image = Form.elements.image;

                    this.add(Left.value, Right.value, Image.value);

                    moofx(Container).animate({
                        opacity: 0,
                        top    : -30
                    }, {
                        duration: 250,
                        callback: function () {
                            Container.destroy();
                        }
                    });
                }.bind(this));
            }.bind(this));
        },

        /**
         * Create a edit / add entry dialog
         *
         * @return {Promise}
         */
        $createDialog: function () {
            return new Promise(function (resolve) {
                var Container = new Element('div', {
                    html   : Mustache.render(templateEntry, {
                        fieldLeft : QUILocale.get(lg, 'quiqqer.products.control.promoslider.left'),
                        fieldRight: QUILocale.get(lg, 'quiqqer.products.control.promoslider.right')
                    }),
                    'class': 'quiqqer-bricks-promoslider-settings-entry'
                }).inject(this.getElm());

                var Close = Container.getElement(
                    '.quiqqer-bricks-promoslider-settings-entry-close'
                );

                var Buttons = Container.getElement(
                    '.quiqqer-bricks-promoslider-settings-entry-buttons'
                );

                var Text = Container.getElement('.field-description');

                Text.getParent().setStyles({
                    height: 100
                });

                Close.addEvent('click', function () {
                    moofx(Container).animate({
                        opacity: 0,
                        top    : -30
                    }, {
                        duration: 250,
                        callback: function () {
                            Container.destroy();
                        }
                    });
                });

                new QUIButton({
                    text  : QUILocale.get('quiqqer/system', 'accept'),
                    styles: {
                        'float': 'none'
                    }
                }).inject(Buttons);


                QUI.parse(Container).then(function () {
                    return ControlsUtils.parse(Container);
                }).then(function () {

                    var controls = QUI.Controls.getControlsInElement(Container),
                        project  = this.getAttribute('project');

                    controls.each(function (Control) {
                        if (Control == this) {
                            return;
                        }

                        if ("setProject" in Control) {
                            Control.setProject(project);
                        }
                    }.bind(this));

                    moofx(Container).animate({
                        opacity: 1,
                        top    : 0
                    }, {
                        duration: 250,
                        callback: function () {
                            resolve(Container);
                        }
                    });
                }.bind(this));
            }.bind(this));
        }
    });
});