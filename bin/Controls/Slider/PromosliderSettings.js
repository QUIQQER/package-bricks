/**
 * @module package/quiqqer/bricks/bin/Controls/Slider/PromosliderSettings
 * @author www.pcsg.de (Henning Leutz)
 *
 * @require qui/QUI
 * @require qui/controls/Control
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
    'css!package/quiqqer/bricks/bin/Controls/Slider/PromoSliderSettings.html'

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
                    name  : 'add',
                    text  : QUILocale.get('quiqqer/system', 'add'),
                    events: {
                        onClick: this.$openAddDialog
                    }
                }, {
                    type: 'seperator'
                }, {
                    name    : 'edit',
                    text    : QUILocale.get('quiqqer/system', 'edit'),
                    disabled: true,
                    events  : {
                        onClick: this.$openEditDialog
                    }
                }, {
                    name    : 'delete',
                    text    : QUILocale.get('quiqqer/system', 'delete'),
                    disabled: true,
                    events  : {
                        onClick: this.$openDeleteDialog
                    }
                }],
                columnModel: [{
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
                    header   : QUILocale.get(lg, 'quiqqer.products.control.slidesettings.type'),
                    dataIndex: 'type',
                    dataType : 'string',
                    width    : 200
                }, {
                    dataIndex: 'image',
                    dataType : 'string',
                    hidden   : true
                }, {
                    header   : QUILocale.get(lg, 'quiqqer.products.control.slidesettings.text'),
                    dataIndex: 'text',
                    hidden   : true
                }]
            });

            this.$Grid.addEvents({
                onClick: function () {
                    var buttons = this.$Grid.getButtons(),
                        Edit    = buttons.filter(function (Btn) {
                            return Btn.getAttribute('name') == 'edit';
                        })[0],
                        Delete  = buttons.filter(function (Btn) {
                            return Btn.getAttribute('name') == 'delete';
                        })[0];

                    Edit.enable();
                    Delete.enable();
                }.bind(this),

                onDblClick: this.$openEditDialog
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
         * refresh the display
         */
        refresh: function () {
            var i, len, entry, insert;
            var data = [];

            for (i = 0, len = this.$data.length; i < len; i++) {
                entry  = this.$data[i];
                insert = {};

                if ("image" in entry) {
                    insert.image        = entry.image;
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

                data.push(insert);
            }

            this.$Grid.setData({
                data: data
            });

            var buttons = this.$Grid.getButtons(),
                Edit    = buttons.filter(function (Btn) {
                    return Btn.getAttribute('name') == 'edit';
                })[0],
                Delete  = buttons.filter(function (Btn) {
                    return Btn.getAttribute('name') == 'delete';
                })[0];

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
                image: '',
                title: '',
                text : '',
                type : ''
            };

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
                image: '',
                title: '',
                text : '',
                type : ''
            };

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

                var Form        = Container.getElement('form');
                var Image       = Form.elements.image;
                var Title       = Form.elements.title;
                var Description = Form.elements.description;
                var Type        = Form.elements.type;
                var Button      = QUI.Controls.getById(CloseButton.get('data-quiid'));

                Button.addEvent('click', function () {
                    this.edit(index, {
                        image: Image.value,
                        title: Title.value,
                        text : Description.value,
                        type : Type.value
                    });

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

                Image.value       = data.image;
                Title.value       = data.title;
                Description.value = data.text;
                Type.value        = data.type;

                Image.fireEvent('change');
                Description.fireEvent('change');
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
                title      : 'Slide wirklich löschen?',
                text       : 'Möchten Sie den Slide wirklich löschen?',
                information: 'Der Slide kann nicht wieder hergestellt werden',
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
         * opens the add dialog
         *
         * @return {Promise}
         */
        $openAddDialog: function () {
            return this.$createDialog().then(function (Container) {
                var CloseButton = Container.getElement(
                    '.quiqqer-bricks-promoslider-settings-entry-buttons button'
                );

                var Button = QUI.Controls.getById(CloseButton.get('data-quiid'));

                Button.addEvent('click', function () {
                    var Form = Container.getElement('form');

                    var Image       = Form.elements.image;
                    var Title       = Form.elements.title;
                    var Description = Form.elements.description;
                    var Type        = Form.elements.type;

                    this.add({
                        image: Image.value,
                        title: Title.value,
                        text : Description.value,
                        type : Type.value
                    });

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
                        fieldImage      : 'Bild',
                        fieldTitle      : 'Titel',
                        fieldDescription: 'Text',
                        fieldType       : 'Ausrichtung'
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
