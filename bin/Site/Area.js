
/**
 * Area edit control for the site object
 *
 * @module package/quiqqer/bricks/bin/Site/Area
 * @author www.pcsg.de (Henning Leutz)
 *
 * @require qui/QUI
 * @require qui/controls/Control
 * @require qui/controls/buttons/Button
 * @require qui/controls/windows/Popup
 * @require qui/controls/windows/Confirm
 * @require qui/controls/elements/List
 * @require Locale
 * @require Ajax
 * @require package/quiqqer/bricks/bin/Sortables
 * @require css!package/quiqqer/bricks/bin/Site/Area.css
 */

define('package/quiqqer/bricks/bin/Site/Area', [

    'qui/QUI',
    'qui/controls/Control',
    'qui/controls/buttons/Button',
    'qui/controls/windows/Popup',
    'qui/controls/windows/Confirm',
    'qui/controls/elements/List',
    'Locale',
    'Ajax',
    'package/quiqqer/bricks/bin/Sortables',

    'css!package/quiqqer/bricks/bin/Site/Area.css'

], function(QUI, QUIControl, QUIButton, QUIPopup, QUIConfirm, QUIList, QUILocale, QUIAjax, Sortables)
{
    "use strict";

    var lg = 'quiqqer/bricks';


    return new Class({

        Extends : QUIControl,
        Type    : 'package/quiqqer/bricks/bin/Site/Area',

        Binds : [
            'openBrickDialog',
            'openBrickSettingDialog',
            'openSettingsDialog',
            'createNewBrick',
            '$onInject'
        ],

        options : {
            name        : '',
            description : '',
            title       : {},
            Site        : false,
            deactivate  : false
        },

        initialize: function (options)
        {
            this.parent( options );

            this.$availableBricks = [];
            this.$loaded          = false;
            this.$brickIds        = [];
            this.$onLoadBrickData = [];
            this.$brickCustomData = {};


            this.$AddButton      = false;
            this.$SettingsButton = false;
            this.$SortableButton = false;
            this.$MoreButton     = false;

            this.$Title       = false;
            this.$List        = false;
            this.$FXExtraBtns = false;
            this.$ExtraBtns   = false;

            this.addEvents({
                onInject : this.$onInject
            });
        },

        /**
         * Return the domnode element
         * @return {HTMLElement}
         */
        create: function ()
        {
            var self  = this,
                title = this.getAttribute( 'title' );

            this.$Elm = new Element('div', {
                'class' : 'quiqqer-bricks-site-category-area',
                html    : '<div class="quiqqer-bricks-site-category-area-title">'+
                              QUILocale.get( title.group, title.var ) +
                          '   <div class="quiqqer-bricks-site-category-area-buttons"></div>' +
                          '</div><ul class="quiqqer-bricks-site-category-area-list"></ul>',
                'data-name' : this.getAttribute( 'name' )
            });

            // Elements
            var Buttons = this.$Elm.getElement(
                '.quiqqer-bricks-site-category-area-buttons'
            );

            this.$ExtraBtns = new Element('div', {
                'class' : 'quiqqer-bricks-site-category-area-extraButtons'
            });

            this.$Title = this.$Elm.getElement(
                '.quiqqer-bricks-site-category-area-title'
            );

            this.$FXExtraBtns = moofx( this.$ExtraBtns );

            this.$List = this.$Elm.getElement(
                '.quiqqer-bricks-site-category-area-list'
            );

            // buttons
            this.$AddButton = new QUIButton({
                text      : QUILocale.get(lg, 'site.area.button.add'),
                textimage : 'icon-plus',
                disable   : true,
                events    : {
                    onClick : this.openBrickDialog
                }
            }).inject( Buttons );

            this.$ExtraBtns.inject( Buttons );

            this.$MoreButton = new QUIButton({
                title  : QUILocale.get(lg, 'site.area.button.area.more.openIt'),
                icon   : 'icon-caret-left',
                events :
                {
                    onClick : function(Btn)
                    {
                        if (Btn.getAttribute( 'icon' ) == 'icon-caret-left')
                        {
                            self.openButtons();
                            return;
                        }

                        self.closeButtons();
                    }
                },
                styles : {
                    marginLeft : 5
                }
            }).inject(Buttons);

            // extra buttons
            this.$SettingsButton = new QUIButton({
                title  : QUILocale.get(lg, 'site.area.button.area.settings'),
                icon   : 'icon-gears',
                events : {
                    onClick : this.openSettingsDialog
                },
                styles : {
                    marginLeft : 10
                }
            }).inject(this.$ExtraBtns);

            this.$SortableButton = new QUIButton({
                title  : QUILocale.get( lg, 'site.area.button.area.sort' ),
                icon   : 'icon-sort',
                events :
                {
                    onClick : function(Btn)
                    {
                        if (Btn.isActive())
                        {
                            Btn.setNormal();
                            self.unsortable();
                            return;
                        }

                        Btn.setActive();
                        self.sortable();
                    }
                },
                styles : {
                    marginLeft : 5
                }
            }).inject(this.$ExtraBtns);


            return this.$Elm;
        },

        /**
         * Refresh the area display
         */
        refresh : function()
        {
            var self      = this,
                size      = this.$List.getComputedSize(),
                titleSize = this.$Title.getComputedSize();

            moofx(this.$Elm).animate({
                height : size.height + titleSize.height
            }, {
                duration : 250,
                equation : 'cubic-bezier(.42,.4,.46,1.29)',
                callback : function() {
                    self.$List.setStyle('position', null);

                    moofx(self.$List).animate({
                        opacity : 1
                    }, {
                        duration : 250,
                        equation : 'ease-out'
                    });
                }
            });
        },

        /**
         * event : on inject
         */
        $onInject : function()
        {
            var self    = this,
                Site    = this.getAttribute( 'Site' ),
                Project = Site.getProject();

            var Loader = new Element('div', {
                'class' : 'quiqqer-bricks-site-category-area-loader',
                html : '<span class="icon-spinner icon-spin fa fa-spinner fa-spin"></span>',
                styles : {
                    margin : 5
                }
            }).inject(this.$Elm);

            this.$List.setStyles({
                position : 'absolute',
                opacity  : 0
            });

            QUIAjax.get('package_quiqqer_bricks_ajax_project_getBricks', function(bricks)
            {
                self.$AddButton.enable();

                self.$availableBricks = bricks;
                self.$loaded = true;

                self.$brickIds.each(function(brickId) {
                    self.addBrickById(brickId);
                });

                var promises = [];

                self.$onLoadBrickData.each(function(brickData) {
                    promises.push(self.addBrick(brickData));
                });

                if (promises.length) {

                    Promise.resolve(promises).then(function() {

                        self.refresh();
                        Loader.destroy();
                    });

                    return;
                }

                Loader.destroy();

            }, {
                'package' : 'quiqqer/bricks',
                project   : Project.encode(),
                area      : this.getAttribute( 'name' )
            });
        },

        /**
         * Activate the area
         */
        activate : function()
        {
            this.setAttribute( 'deactivate', false );
            this.getElm().removeClass( 'quiqqer-bricks-site-category-area-deactivate' );

            this.$AddButton.enable();
        },

        /**
         * Deactivate the area
         */
        deactivate : function()
        {
            var self = this,
                data = this.getData();

            if (data.length && !("deactivate" in data[ 0 ]))
            {
                new QUIConfirm({
                    title : QUILocale.get( lg, 'site.area.window.deactivate.title' ),
                    text  : QUILocale.get( lg, 'site.area.window.deactivate.text' ),
                    information : QUILocale.get( lg, 'site.area.window.deactivate.information' ),
                    events :
                    {
                        onSubmit : function()
                        {
                            self.clear();
                            self.setAttribute( 'deactivate', true );
                            self.deactivate();
                        }
                    }
                }).open();

                return;
            }

            this.setAttribute( 'deactivate', true );

            this.$AddButton.disable();
            this.getElm().addClass( 'quiqqer-bricks-site-category-area-deactivate' );
        },

        /**
         * Add a brick by its brick data
         *
         * @param {Object} brickData - { brickId:1, inheritance:1 }
         * @return Promise
         */
        addBrick : function(brickData)
        {
            return new Promise(function(reslove, reject) {

                if ("deactivate" in brickData)
                {
                    this.clear();
                    this.setAttribute('deactivate', true);
                    this.deactivate();

                    reslove();
                    return;
                }


                if (!this.$loaded)
                {
                    this.$onLoadBrickData.push(brickData);
                    reslove();
                    return;
                }

                var BrickNode = this.addBrickById(brickData.brickId);

                if (!BrickNode) {
                    reject();
                    return;
                }

                this.$brickCustomData[BrickNode.get('id')] = brickData.customfields;

            }.bind(this));
        },

        /**
         * Add a brick by its ID
         *
         * @param {Number} brickId
         * @return {HTMLElement|Boolean} Brick-Node
         */
        addBrickById : function(brickId)
        {
            if (!this.$loaded)
            {
                this.$brickIds.push(brickId);
                return false;
            }

            var found = this.$availableBricks.filter(function(Item) {
                return Item.id === brickId;
            });

            if (!found.length) {
                return false;
            }

            var BrickNode = this.createNewBrick();

            BrickNode.getElement('select').set('value', brickId);

            this.refresh();

            return BrickNode;
        },

        /**
         * Removes all bricks in the area
         */
        clear : function()
        {
            this.getElm().getElements(
                '.quiqqer-bricks-site-category-area-brick'
            ).destroy();
        },

        /**
         * Add a new brick to the area
         */
        createNewBrick : function()
        {
            var i, len, Select;

            var self = this;

            var Elm = new Element('li', {
                'class' : 'quiqqer-bricks-site-category-area-brick',
                html    : '<select></select>',
                id      : String.uniqueID()
            });

            Elm.inject(this.$List);
            Select = Elm.getElement('select');

            new QUIButton({
                title  : QUILocale.get(lg, 'site.area.button.delete'),
                icon   : 'icon-remove',
                events :
                {
                    onClick : function() {
                        self.openBrickDeleteDialog(Elm);
                    }
                }
            }).inject(Elm);

            new QUIButton({
                title  : QUILocale.get(lg, 'site.area.button.settings'),
                icon   : 'icon-gear',
                events :
                {
                    onClick : function(Btn)
                    {
                        var Elm    = Btn.getElm(),
                            Parent = Elm.getParent('.quiqqer-bricks-site-category-area-brick'),
                            Select = Parent.getElement('select');

                        self.openBrickSettingDialog(Select);
                    }
                }
            }).inject(Elm);


            for (i = 0, len = this.$availableBricks.length; i < len; i++)
            {
                new Element('option', {
                    html  : this.$availableBricks[i].title,
                    value : this.$availableBricks[i].id
                }).inject(Select);
            }

            return Elm;
        },

        /**
         * Return the brick list
         * @returns {Array}
         */
        getData : function()
        {
            if (this.getAttribute('deactivate'))
            {
                return [{
                    deactivate : 1
                }];
            }

            var i, len, custom, brickId;

            var data   = [],
                bricks = this.$Elm.getElements('select');

            for (i = 0, len = bricks.length; i < len; i++)
            {
                custom  = '';
                brickId = bricks[i].get('id');

                if (brickId in this.$brickCustomData) {
                    custom = this.$brickCustomData[brickId];
                }

                data.push({
                    brickId : bricks[i].value,
                    customfields : custom
                });
            }

            return data;
        },

        /**
         * sort methods
         */

        /**
         * Switch the sortable on
         */
        sortable : function()
        {
            var Elm      = this.getElm(),
                elements = Elm.getElements(
                    '.quiqqer-bricks-site-category-area-brick'
                );

            elements.each(function(Brick)
            {
                var i, len, buttons, Button;

                buttons = Brick.getElements('.qui-button');

                for (i = 0, len = buttons.length; i < len; i++)
                {
                    Button = QUI.Controls.getById(buttons[i].get('data-quiid'));

                    if (Button) {
                        Button.setDisable();
                    }
                }

                var Select = Brick.getElement('select'),
                    Option = Select.getElement('option[value="'+ Select.value +'"]');

                new Element('div', {
                    'class' : 'quiqqer-bricks-site-category-area-placeholder',
                    html    : Option.get('html')
                }).inject( Brick );
            });

            Elm.getElements('select').set('disabled', true);


            new Sortables( this.$List, {
                revert: {
                    duration: 500,
                    transition: 'elastic:out'
                },
                clone : function(event)
                {
                    var Target = event.target;

                    if (Target.nodeName != 'LI') {
                        Target = Target.getParent('li');
                    }

                    var size = Target.getSize(),
                        pos  = Target.getPosition(Target.getParent('ul'));

                    return new Element('div', {
                        styles : {
                            background : 'rgba(0,0,0,0.5)',
                            height     : size.y,
                            top        : pos.y,
                            width      : size.x,
                            zIndex     : 1000
                        }
                    });
                },

                onStart : function(element)
                {
                    var Ul = element.getParent('ul');

                    element.addClass('quiqqer-bricks-site-category-area-dd-active');

                    Ul.setStyles({
                        height   : Ul.getSize().y,
                        overflow : 'hidden',
                        width    : Ul.getSize().x
                    });
                },

                onComplete : function(element)
                {
                    var Ul = element.getParent('ul');

                    element.removeClass('quiqqer-bricks-site-category-area-dd-active');

                    Ul.setStyles({
                        height   : null,
                        overflow : null,
                        width    : null
                    });
                }
            });
        },

        /**
         * Switch the sortable off
         */
        unsortable : function()
        {
            var Elm      = this.getElm(),
                elements = Elm.getElements(
                    '.quiqqer-bricks-site-category-area-brick'
                );

            Elm.getElements('select').set('disabled', false);
            Elm.getElements('.quiqqer-bricks-site-category-area-placeholder').destroy();

            elements.each(function(Brick)
            {
                var i, len, buttons, Button;

                buttons = Brick.getElements('.qui-button');

                for (i = 0, len = buttons.length; i < len; i++)
                {
                    Button = QUI.Controls.getById(buttons[ i ].get('data-quiid'));

                    if (Button) {
                        Button.setEnable();
                    }
                }
            });
        },

        /**
         * Opens the extra settings buttons
         *
         * @param {Function} [callback]
         */
        openButtons : function(callback)
        {
            var self = this;

            this.$AddButton.hide();

            self.$FXExtraBtns.style({
                borderLeft : '2px solid #cccfd5',
                height     : 30,
                overflow   : 'hidden'
            });

            var width = this.$ExtraBtns.getChildren().map(function(Elm)
            {
                var width = Elm.getSize().x;

                width = width + Elm.getStyle('margin-left').toInt();
                width = width + Elm.getStyle('margin-right').toInt();

                return width;
            }).sum();

            // i dont know why i need 2 px more -.-"
            width = width + 2;

            this.$FXExtraBtns.animate({
                opacity    : 1,
                width      : width,
                marginLeft : 10
            }, {
                equation : 'ease-in-out',
                callback : function()
                {
                    self.$MoreButton.setAttribute('icon', 'icon-caret-right');

                    self.$FXExtraBtns.style({
                        overflow : null
                    });

                    if (typeof callback === 'function') {
                        callback();
                    }
                }
            });
        },

        /**
         * Close the extra settings buttons
         *
         * * @param {Function} callback
         */
        closeButtons : function( callback )
        {
            var self = this;

            this.$FXExtraBtns.style({
                overflow   : 'hidden',
                borderLeft : null,
                marginLeft : 0
            });

            this.$FXExtraBtns.animate({
                opacity  : 0,
                width    : 0
            }, {
                callback : function()
                {
                    self.$MoreButton.setAttribute('icon', 'icon-caret-left');
                    self.$AddButton.show();


                    if (typeof callback === 'function') {
                        callback();
                    }
                }
            });
        },

        /**
         * dialogs
         */

        /**
         * Opens the brick add dialog
         */
        openBrickDialog : function()
        {
            if (!this.$availableBricks.length) {
                return;
            }

            var self = this;

            new QUIPopup({
                title     : QUILocale.get(lg, 'site.area.window.add'),
                icon      : 'icon-th',
                maxWidth  : 500,
                maxHeight : 600,
                autoclose : false,
                events    :
                {
                    onOpen : function(Win)
                    {
                        var items   = [],
                            Content = Win.getContent(),

                            List = new QUIList({
                                events :
                                {
                                    onClick : function(List, data)
                                    {
                                        self.addBrickById(data.brickId);
                                        Win.close();
                                    }
                                }
                            });

                        List.inject(Content);

                        for (var i = 0, len = self.$availableBricks.length; i < len; i++)
                        {
                            items.push({
                                brickId : self.$availableBricks[ i ].id,
                                icon    : 'icon-th',
                                title   : self.$availableBricks[ i ].title,
                                text    : self.$availableBricks[ i ].description
                            });
                        }

                        List.addItems(items);
                    }
                }
            }).open();
        },

        /**
         * Opens the brick deletion dialog
         *
         * @param {HTMLElement} BrickElement - Element of the Brick
         */
        openBrickDeleteDialog : function(BrickElement)
        {
            new QUIConfirm({
                title : QUILocale.get(lg, 'site.area.window.delete.title'),
                icon  : 'icon-remove',
                text  : QUILocale.get(lg, 'site.area.window.delete.text'),
                information : QUILocale.get(lg, 'site.area.window.delete.information'),
                maxHeight   : 300,
                maxWidth    : 450,
                events :
                {
                    onSubmit : function() {
                        var brickId = BrickElement.get('id');

                        if (brickId in this.$brickCustomData) {
                            delete this.$brickCustomData[brickId];
                        }

                        BrickElement.destroy();
                        this.refresh();

                    }.bind(this)
                }
            }).open();
        },

        /**
         * Opens the brick settings dialog
         *
         * @param {HTMLElement} Select
         */
        openBrickSettingDialog : function(Select)
        {
            var self = this;

            new QUIConfirm({
                title     : QUILocale.get(lg, 'site.area.window.settings.title'),
                icon      : 'icon-gear',
                texticon  : false,
                maxWidth  : 600,
                maxHeight : 400,
                autoclose : false,
                ok_button : {
                    text      : QUILocale.get('quiqqer/system', 'save'),
                    textimage : 'icon-save fa fa-save'
                },
                cancel_button : {
                    text      : QUILocale.get('quiqqer/system', 'cancel'),
                    textimage : 'icon-remove fa fa-remove'
                },
                events :
                {
                    onOpen : function(Win)
                    {
                        require([
                            'package/quiqqer/bricks/bin/Site/BrickEdit'
                        ], function(BrickEdit) {

                            var brickId = Select.getParent().get('id');
                            var custom = '';

                            if (brickId in self.$brickCustomData) {
                                custom = self.$brickCustomData[brickId];
                            }

                            custom = JSON.decode(custom);

                            new BrickEdit({
                                brickId : Select.value,
                                Site    : self.getAttribute('Site'),
                                customfields : custom,
                                styles  : {
                                    height : Win.getContent().getSize().y
                                }
                            }).inject(Win.getContent());
                        });
                    },

                    onSubmit : function(Win)
                    {
                        Win.Loader.show();

                        require(['qui/utils/Form'], function(QUIFormUtils) {

                            var Form    = Win.getContent().getElement('form'),
                                data    = QUIFormUtils.getFormData(Form),
                                brickId = Select.get('id');

                            self.$brickCustomData[brickId] = JSON.encode(data);

                            Win.close();
                        });
                    }
                }
            }).open();
        },

        /**
         * Opens the settings dialog of the area
         */
        openSettingsDialog : function()
        {
            var self = this;

            new QUIConfirm({
                title     : QUILocale.get(lg, 'area.window.settings.title'),
                icon      : 'icon-gear',
                maxWidth  : 450,
                maxHeight : 300,
                autoclose : false,
                events    :
                {
                    onOpen: function (Win)
                    {
                        var Content = Win.getContent();

                        Content.set(
                            'html',

                            '<form>' +
                            '    <label>' +
                            '        <input type="checkbox" name="deactivate" />' +
                                     QUILocale.get( lg, 'area.window.settings.deactivate' ) +
                            '    </label>' +
                            '</form>'
                        );

                        var Form = Win.getContent().getElement('form'),
                            elms = Form.elements;

                        elms.deactivate.checked = self.getAttribute('deactivate');
                    },

                    onSubmit : function(Win)
                    {
                        var Form = Win.getContent().getElement('form');

                        Win.close();

                        if (Form.elements.deactivate.checked)
                        {
                            self.deactivate();
                        } else
                        {
                            self.activate();
                        }
                    }
                }
            }).open();
        }
    });
});
