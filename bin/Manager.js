/**
 * Brick manager
 *
 * @module package/quiqqer/bricks/bin/Manager
 * @author www.pcsg.de (Henning Leutz)
 */
define('package/quiqqer/bricks/bin/Manager', [

    'qui/QUI',
    'qui/controls/desktop/Panel',
    'qui/controls/buttons/Select',
    'qui/controls/buttons/Button',
    'qui/controls/buttons/Separator',
    'qui/controls/windows/Confirm',
    'controls/grid/Grid',
    'Locale',
    'Projects',
    'Ajax',
    'package/quiqqer/bricks/bin/Bricks',
    'Mustache',

    'text!package/quiqqer/bricks/bin/Manager.Copy.html',
    'css!package/quiqqer/bricks/bin/Manager.Copy.css',
    'css!package/quiqqer/bricks/bin/Manager.css'

], function (QUI, QUIPanel, QUISelect, QUIButton, QUISeparator, QUIConfirm, Grid, QUILocale, Projects, Ajax,
             Bricks, Mustache, templateCopy) {
    "use strict";

    var lg = 'quiqqer/bricks';

    return new Class({

        Extends: QUIPanel,
        Type   : 'package/quiqqer/bricks/bin/Manager',

        Binds: [
            'loadBricksFromProject',
            'refresh',
            '$refreshProjectLanguages',
            '$onCreate',
            '$onResize',
            '$openCreateDialog',
            '$openCopyDialog',
            '$openDeleteDialog',
            '$onDblClick',
            '$onClick',
            '$onInject',
            '$onDestroy'
        ],

        options: {
            title: QUILocale.get(lg, 'menu.bricks.text')
        },

        initialize: function (options) {
            this.parent(options);

            this.$Grid = false;
            this.$ProjectSelect = false;
            this.$ProjectLangs = false;

            this.addEvents({
                onCreate : this.$onCreate,
                onResize : this.$onResize,
                onInject : this.$onInject,
                onDestroy: this.$onDestroy
            });
        },

        /**
         * Refresh the panel data
         *
         * @param {Function} [callback] - callback function
         */
        refresh: function (callback) {
            if (!this.$Elm) {
                return;
            }

            var self    = this,
                project = this.$ProjectSelect.getValue(),
                lang    = this.$ProjectLangs.getValue();

            this.Loader.show();

            Bricks.getBricksFromProject(project, lang).then(function (result) {
                if (typeof callback === 'function') {
                    callback();
                }

                var options = self.$Grid.options,
                    page    = parseInt(options.page),
                    perPage = parseInt(options.perPage),
                    start   = (page - 1) * perPage;

                self.$Grid.setData({
                    data : result.slice(start, start + perPage),
                    page : page,
                    total: result.length
                });

                self.refreshButtons();
                self.Loader.hide();
            });
        },

        /**
         * Refresh the buttons status
         */
        refreshButtons: function () {
            var selected   = this.$Grid.getSelectedData(),
                AddButton  = this.getButtons('brick-add'),
                EditButton = this.getButtons('brick-edit'),
                CopyButton = this.getButtons('brick-copy'),
                DelButton  = this.getButtons('brick-delete');

            if (!selected.length) {
                AddButton.enable();
                DelButton.disable();
                CopyButton.disable();
                EditButton.disable();
                return;
            }

            AddButton.enable();
            DelButton.enable();

            if (selected.length === 1) {
                EditButton.enable();
                CopyButton.enable();
            }

            if (selected.length > 1) {
                EditButton.disable();
                CopyButton.disable();
            }
        },

        /**
         * event : on create
         */
        $onCreate: function () {
            var self = this;

            // Buttons
            this.$ProjectSelect = new QUISelect({
                name  : 'projects-name',
                events: {
                    onChange: this.$refreshProjectLanguages
                }
            });

            this.$ProjectLangs = new QUISelect({
                name  : 'projects-langs',
                events: {
                    onChange: this.refresh
                },
                styles: {
                    width: 80
                }
            });

            this.addButton(this.$ProjectSelect);
            this.addButton(this.$ProjectLangs);
            this.addButton(new QUISeparator());

            this.addButton(
                new QUIButton({
                    textimage: 'fa fa-plus',
                    text     : QUILocale.get(lg, 'manager.button.add'),
                    title    : QUILocale.get(lg, 'manager.button.add'),
                    name     : 'brick-add',
                    disabled : true,
                    events   : {
                        onClick: this.$openCreateDialog
                    }
                })
            );

            this.addButton(new QUISeparator());

            this.addButton(
                new QUIButton({
                    textimage: 'fa fa-edit',
                    text     : QUILocale.get(lg, 'manager.button.edit.text'),
                    title    : QUILocale.get(lg, 'manager.button.edit.title'),
                    name     : 'brick-edit',
                    disabled : true,
                    events   : {
                        onClick: function () {
                            self.editBrick(
                                self.$Grid.getSelectedData()[0].id
                            );
                        }
                    }
                })
            );

            this.addButton(
                new QUIButton({
                    textimage: 'fa fa-copy',
                    text     : QUILocale.get(lg, 'manager.button.copy.text'),
                    title    : QUILocale.get(lg, 'manager.button.copy.title'),
                    name     : 'brick-copy',
                    disabled : true,
                    events   : {
                        onClick: function () {
                            var data = self.$Grid.getSelectedData();

                            if (data.length === 1) {
                                self.$openCopyDialog(data[0].id);
                            }
                        }
                    }
                })
            );

            this.addButton(
                new QUIButton({
                    icon    : 'fa fa-trash',
                    title   : QUILocale.get(lg, 'manager.button.delete'),
                    name    : 'brick-delete',
                    disabled: true,
                    styles  : {
                        'float': 'right'
                    },
                    events  : {
                        onClick: this.$openDeleteDialog
                    }
                })
            );

            // Grid
            var Container = new Element('div').inject(
                this.getContent()
            );

            this.$Grid = new Grid(Container, {
                columnModel      : [
                    {
                        header   : QUILocale.get('quiqqer/core', 'id'),
                        dataIndex: 'id',
                        dataType : 'integer',
                        width    : 60
                    },
                    {
                        header   : QUILocale.get('quiqqer/core', 'title'),
                        dataIndex: 'title',
                        dataType : 'string',
                        width    : 300
                    },
                    {
                        header   : QUILocale.get('quiqqer/core', 'description'),
                        dataIndex: 'description',
                        dataType : 'string',
                        width    : 300
                    },
                    {
                        header   : QUILocale.get(lg, 'brick.type'),
                        dataIndex: 'type',
                        dataType : 'string',
                        width    : 300
                    }
                ],
                multipleSelection: true,
                pagination       : true
            });

            this.$Grid.addEvents({
                onRefresh : this.refresh,
                onDblClick: this.$onDblClick,
                onClick   : this.$onClick
            });

            this.Loader.show();

            Projects.getList(function (projects) {
                for (var project in projects) {
                    if (!projects.hasOwnProperty(project)) {
                        continue;
                    }

                    self.$ProjectSelect.appendChild(
                        project, project, 'fa fa-home'
                    );
                }

                self.$ProjectSelect.setValue(
                    self.$ProjectSelect.firstChild().getAttribute('value')
                );
            });
        },

        /**
         * event: on inject
         */
        $onInject: function () {
            Bricks.addEvents({
                onBrickDelete: this.refresh,
                onBrickSave  : this.refresh,
                onBrickCopy  : this.refresh,
                onBrickCreate: this.refresh
            });
        },

        /**
         * event: on destroy
         */
        $onDestroy: function () {
            Bricks.removeEvents({
                onBrickDelete: this.refresh,
                onBrickSave  : this.refresh,
                onBrickCopy  : this.refresh,
                onBrickCreate: this.refresh
            });
        },

        /**
         * event : on resize
         */
        $onResize: function () {
            if (!this.$Grid) {
                return;
            }

            var Body = this.getContent();

            if (!Body) {
                return;
            }


            var size = Body.getSize();

            this.$Grid.setHeight(size.y - 40);
            this.$Grid.setWidth(size.x - 40);
        },

        /**
         * event : dbl click
         */
        $onDblClick: function () {
            this.editBrick(
                this.$Grid.getSelectedData()[0].id
            );
        },

        /**
         * event : click
         */
        $onClick: function () {
            this.refreshButtons();
        },

        /**
         * Refresh the project language DropDown
         */
        $refreshProjectLanguages: function () {
            var self          = this,
                activeProject = this.$ProjectSelect.getValue();

            Projects.getList(function (projects) {
                for (var project in projects) {
                    if (!projects.hasOwnProperty(project)) {
                        continue;
                    }

                    if (activeProject !== project) {
                        continue;
                    }

                    var langs = projects[project].langs;
                    langs = langs.split(',');

                    self.$ProjectLangs.clear();

                    for (var i = 0, len = langs.length; i < len; i++) {
                        self.$ProjectLangs.appendChild(
                            langs[i], langs[i], 'fa fa-home'
                        );
                    }

                    self.$ProjectLangs.setValue(
                        self.$ProjectLangs.firstChild().getAttribute('value')
                    );
                }
            });
        },

        /**
         * Opens the brick creation dialog
         */
        $openCreateDialog: function () {
            var self = this;

            const CreateDialog = new QUIConfirm({
                title    : QUILocale.get(lg, 'manager.window.create.title'),
                icon     : 'fa fa-th',
                maxHeight: 300,
                maxWidth : 400,
                autoclose: false,
                events   : {
                    onOpen: function (Win) {
                        var Body = Win.getContent();

                        Win.Loader.show();
                        Body.addClass('quiqqer-bricks-create');

                        Body.set(
                            'html',

                            '<label>' +
                            '   <span class="quiqqer-bricks-create-label-text">' +
                            QUILocale.get(lg, 'manager.window.create.label.title') +
                            '   </span>' +
                            '   <input type="text" name="title" required="required" />' +
                            '</label>' +
                            '<div class="quiqqer-bricks-create-labelWrapper"><label>' +
                            '   <span class="quiqqer-bricks-create-label-text">' +
                            QUILocale.get(lg, 'manager.window.create.label.type') +
                            '   </span>' +
                            '   <select name="type"></select>' +
                            '</label>' +
                            '<button class="qui-button quiqqer-bricks-create-btnCreateFromData" ' +
                            'title="' + QUILocale.get(lg, 'manager.window.create.btnCreateFromData') + '">' +
                            '<span class="fa fa-code"></span></button></div>'
                        );

                        Body.querySelector('.quiqqer-bricks-create-btnCreateFromData').addEventListener('click',
                            (e) => {
                                e.preventDefault();
                                CreateDialog.close();
                                self.$openCreateDialogFromData();
                            });

                        Bricks.getAvailableBricks().then(function (bricklist) {
                            if (!Body) {
                                return;
                            }

                            var i, len, group, title, val, text;
                            var Select = Body.getElement('select'),
                                Title  = Body.getElement('[name="title"]');

                            for (i = 0, len = bricklist.length; i < len; i++) {
                                title = bricklist[i].title;

                                if ('group' in title) {
                                    group = title.group;
                                    val   = title.var;
                                } else {
                                    group = title[0];
                                    val   = title[1];
                                }

                                text = QUILocale.get(group, val);

                                if (bricklist[i].deprecated) {
                                    text = text + ' (deprecated)';
                                }

                                new Element('option', {
                                    value: bricklist[i].control,
                                    html : text
                                }).inject(Select);
                            }

                            Title.focus.delay(500, Title);

                            Win.Loader.hide();
                        });
                    },

                    onSubmit: function (Win) {
                        Win.Loader.show();

                        var Body  = Win.getContent(),
                            Title = Body.getElement('[name="title"]'),
                            Type  = Body.getElement('[name="type"]');

                        if (Title.value === '') {
                            QUI.getMessageHandler(function (MH) {
                                MH.addError(
                                    QUILocale.get(lg, 'exception.brick.has.no.title'),
                                    Title
                                );
                            });

                            Title.focus();

                            Win.Loader.hide();
                            return;
                        }

                        var project = self.$ProjectSelect.getValue(),
                            lang    = self.$ProjectLangs.getValue(),
                            data    = {
                                title: Title.value,
                                type : Type.value
                            };

                        Bricks.createBrick(project, lang, data).then(function (brickId) {
                            Win.close();
                            self.editBrick(brickId);
                        });
                    }
                }
            });

            CreateDialog.open();
        },

        /**
         * Opens the brick creation from data dialog.
         */
        $openCreateDialogFromData: function () {
            var self = this;

            new QUIConfirm({
                title    : QUILocale.get(lg, 'manager.window.createFromData.title'),
                icon     : 'fa fa-code',
                maxHeight: 600,
                maxWidth : 700,
                autoclose: false,
                events   : {
                    onOpen: function (Win) {
                        var Body = Win.getContent();

                        Win.Loader.show();
                        Body.addClass('quiqqer-bricks-createFromData');

                        require(['text!package/quiqqer/bricks/bin/Manager.CreateBrickFromJSON.html'], (tpl) => {
                            Body.set('html', Mustache.render(tpl, {
                                infoText: QUILocale.get(lg, 'manager.window.createFromData.text'),
                                btnText: QUILocale.get(lg, 'manager.window.createFromData.btnText'),
                                infoProject: QUILocale.get(lg, 'manager.window.createFromData.info.project'),
                                infoLang: QUILocale.get(lg, 'manager.window.createFromData.info.lang'),
                                infoGeneral: QUILocale.get(lg, 'manager.window.createFromData.info.general'),
                            }));

                            Body.querySelector('.quiqqer-bricks-createFromData-copyBtn').addEventListener('click',
                                (event) => {
                                    event.preventDefault();
                                    navigator.clipboard.readText().then((text) => {
                                        Body.querySelector('textarea').value = text
                                    });
                                }
                            )
                        })

                        Win.Loader.hide();
                    },

                    onSubmit: function (Win) {
                        Win.Loader.show();

                        const Body        = Win.getContent(),
                              Textarea    = Body.querySelector('textarea');
                        let convertedData = '';
                        const adjustProjectName = Body.querySelector('[name="adjustProject"]').checked;
                        const adjustProjectLang = Body.querySelector('[name="adjustLang"]').checked;

                        Textarea.classList.remove('error');


                        try {
                            convertedData = JSON.parse(Textarea.value);
                        } catch (e) {
                            QUI.getMessageHandler(function (MH) {
                                MH.addError(
                                    QUILocale.get(lg, 'exception.brick.createFromData.invalid.data')
                                );
                            });

                            Textarea.focus();
                            Win.Loader.hide();

                            return;
                        }

                        delete convertedData.attributes.id;

                        let brickTitle = convertedData.attributes.title,
                            brickType  = convertedData.attributes.type;

                        if (!brickTitle || !brickType) {
                            QUI.getMessageHandler(function (MH) {
                                MH.addError(
                                    QUILocale.get(lg, 'exception.brick.createFromData.brick.type.not.found')
                                );
                            });

                            Win.Loader.hide();

                            return;
                        }

                        let controlTypeExist = false;

                        Bricks.getAvailableBricks().then(function (bricklist) {
                            if (!Body) {
                                return;
                            }

                            var i, len, group, title, val;

                            for (i = 0, len = bricklist.length; i < len; i++) {
                                title = bricklist[i].title;

                                if ('group' in title) {
                                    group = title.group;
                                    val   = title.var;
                                } else {
                                    group = title[0];
                                    val   = title[1];
                                }

                                if (bricklist[i].control === brickType) {
                                    controlTypeExist = true;
                                }
                            }

                            if (!controlTypeExist) {
                                QUI.getMessageHandler(function (MH) {
                                    MH.addError(
                                        QUILocale.get(lg,
                                            'exception.brick.createFromData.brick.type.not.found.in.quiqqer', {
                                                brickType: brickType
                                            })
                                    );
                                });

                                Win.Loader.hide();

                                return;
                            }

                            var allBricks = null,
                                project = self.$ProjectSelect.getValue(),
                                lang    = self.$ProjectLangs.getValue(),
                                data    = {
                                    title: brickTitle,
                                    type : brickType
                                };

                            Bricks.getBricksFromProject(project, lang).then(function (result) {
                                allBricks = result;

                                return Promise.resolve();
                            }).then(function() {
                                return Bricks.createBrick(project, lang, data);
                            }).then(function (brickId) {
                                let i,
                                    len = allBricks.length;

                                // check if same name exist
                                for (i = 0; i < len; i++) {
                                    if (allBricks[i].title === brickTitle) {
                                        convertedData.attributes.title = brickTitle + ' (' + brickId + ')'
                                    }
                                }

                                if (adjustProjectName && convertedData.attributes.project !== project) {
                                    convertedData.attributes.project = project;
                                }


                                if (adjustProjectLang && convertedData.attributes.lang !== lang) {
                                    convertedData.attributes.lang = lang;
                                }

                                Bricks.saveBrick(brickId, convertedData).then(function () {
                                    QUI.getMessageHandler().then(function (MH) {
                                        MH.addSuccess(
                                            QUILocale.get(lg, 'message.brick.save.success')
                                        );
                                    });

                                    Win.Loader.hide();
                                    Win.close();
                                    self.editBrick(brickId);
                                }).catch(function (e) {
                                    QUI.getMessageHandler().then(function (MH) {
                                        MH.addError(e.getMessage());
                                    });

                                    Textarea.classList.add('error');

                                    Win.Loader.hide();
                                });
                            });
                        });
                    }
                }
            }).open();
        },

        /**
         * Opens the delete brick dialog
         */
        $openDeleteDialog: function () {
            var self     = this,
                brickIds = this.$Grid.getSelectedData().map(function (brick) {
                    return brick.id;
                });

            new QUIConfirm({
                maxHeight: 300,
                maxWidth : 600,
                autoclose: false,
                title    : QUILocale.get(lg, 'manager.window.delete.title'),
                events   : {
                    onOpen: function (Win) {
                        var Content = Win.getContent(),
                            lists   = '<ul>';

                        self.$Grid.getSelectedData().each(function (brick) {
                            lists = lists + '<li>' + brick.id + ' - ' + brick.title + '</li>';
                        });

                        lists = lists + '</ul>';

                        Content.set(
                            'html',
                            QUILocale.get(lg, 'manager.window.delete.information', {
                                list: lists
                            })
                        );
                    },

                    onSubmit: function (Win) {
                        Win.Loader.show();

                        Bricks.deleteBricks(brickIds).then(function () {
                            Win.close();
                        });
                    }
                }
            }).open();
        },

        /**
         * opens the copy dialog
         */
        $openCopyDialog: function (brickId) {
            var self = this;

            new QUIConfirm({
                title    : QUILocale.get(lg, 'dialog.copy.title', {
                    id: brickId
                }),
                icon     : 'fa fa-copy',
                maxHeight: 600,
                maxWidth : 800,
                autoclose: false,

                events: {
                    onOpen: function (Win) {
                        Win.Loader.show();

                        var Content = Win.getContent(),
                            project = self.$ProjectSelect.getValue(),
                            lang    = self.$ProjectLangs.getValue(),
                            Project = Projects.get(project);

                        Content.set('html', Mustache.render(templateCopy, {
                            text: QUILocale.get(lg, 'dialog.copy.message')
                        }));

                        Project.getConfig().then(function (config) {
                            var Select = new QUISelect({
                                name: 'language-select'
                            });

                            var langs = config.langs.split(',');

                            for (var i = 0, len = langs.length; i < len; i++) {
                                Select.appendChild(
                                    QUILocale.get('quiqqer/core', 'language.' + langs[i]),
                                    langs[i],
                                    URL_BIN_DIR + '16x16/flags/' + langs[i] + '.png'
                                );
                            }

                            Select.inject(Content.getElement('.dialog-bricks-copy-languages'));
                            Select.getElm().setStyle('width', '100%');
                            Select.getElm().setStyle('border', 0);

                            Select.setValue(lang);

                            Bricks.getBrick(brickId).then(function (data) {
                                var Form = Content.getElement('form');

                                Form.elements.title.value = data.attributes.title;
                                Form.elements.description.value = data.attributes.description;

                                Win.Loader.hide();
                            });
                        });
                    },

                    onSubmit: function (Win) {
                        Win.Loader.show();

                        var Content = Win.getContent(),
                            Form    = Content.getElement('form');

                        var Select = Content.getElement('.dialog-bricks-copy-languages [data-quiid]');
                        var Language = QUI.Controls.getById(Select.get('data-quiid'));

                        Bricks.copyBrick(brickId, {
                            'lang'       : Language.getValue(),
                            'title'      : Form.elements.title.value,
                            'description': Form.elements.description.value
                        }).then(function (data) {
                            Win.close();
                            self.editBrick(data.id);
                        });
                    }
                }
            }).open();
        },

        /**
         * Opens the brick panel
         *
         * @param {Number} brickId
         */
        editBrick: function (brickId) {
            require([
                'package/quiqqer/bricks/bin/BrickEdit',
                'utils/Panels'
            ], function (BrickEdit, PanelUtils) {
                PanelUtils.openPanelInTasks(
                    new BrickEdit({
                        '#id'      : 'brick-edit-' + brickId,
                        id         : brickId,
                        projectName: this.$ProjectSelect.getValue(),
                        projectLang: this.$ProjectLangs.getValue()
                    })
                );
            }.bind(this));
        }
    });
});
