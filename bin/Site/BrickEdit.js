/**
 * Area edit control for the site object
 *
 * @module package/quiqqer/bricks/bin/Site/Area
 * @author www.pcsg.de (Henning Leutz)
 */
define('package/quiqqer/bricks/bin/Site/BrickEdit', [

    'qui/QUI',
    'qui/controls/Control',
    'qui/controls/loader/Loader',
    'qui/utils/Form',
    'utils/Template',
    'utils/Controls',
    'Ajax',

    'css!package/quiqqer/bricks/bin/Site/BrickEdit.css'

], function (QUI, QUIControl, QUILoader, QUIFormUtils, Template, ControlUtils, QUIAjax) {
    "use strict";

    return new Class({

        Extends: QUIControl,
        Type   : 'package/quiqqer/bricks/bin/Site/BrickEdit',

        Binds: [
            '$onInject'
        ],

        options: {
            brickId     : false,
            Site        : false,
            customfields: false
        },

        initialize: function (options) {
            this.parent(options);

            this.Loader = new QUILoader();
            this.$Form  = null;

            this.$globalBrickSettings = {};

            this.addEvents({
                onInject: this.$onInject
            });
        },

        /**
         * Return the domnode element
         *
         * @returns {HTMLDivElement}
         */
        create: function () {
            this.$Elm = new Element('div', {
                'class': 'quiqqer-bricks-site-brickedit'
            });

            this.Loader.inject(this.$Elm);
            this.$Form = new Element('form').inject(this.$Elm);

            return this.$Elm;
        },

        /**
         * event on inject
         */
        $onInject: function () {
            if (!this.getAttribute('brickId')) {
                console.error('Missing brick-ID');
                return;
            }

            if (!this.getAttribute('Site')) {
                console.error('Missing Site');
                return;
            }

            var self = this;

            this.Loader.show();

            this.getBrickSettings().then(function (result) {
                self.$globalBrickSettings = result.settings;

                return Template.get('bin/Site/BrickEdit', false, {
                    'package': 'quiqqer/bricks',
                    params   : JSON.encode({
                        customfields     : result.customfields,
                        availableSettings: result.availableSettings
                    })
                });

            }).then(function (html) {

                self.getElm().set('html', html);

                QUIFormUtils.setDataToForm(
                    self.$globalBrickSettings,
                    self.getElm().getElement('form')
                );

                if (self.getAttribute('customfields')) {
                    QUIFormUtils.setDataToForm(
                        self.getAttribute('customfields'),
                        self.getElm().getElement('form')
                    );
                }

                return QUI.parse(self.getElm());

            }).then(function () {
                return ControlUtils.parse(self.getElm());

            }).then(function () {

                var i, len, Control;

                var Project  = self.getAttribute('Site').getProject(),
                    controls = self.getElm().getElements('[data-quiid]');

                for (i = 0, len = controls.length; i < len; i++) {
                    Control = QUI.Controls.getById(controls[i].get('data-quiid'));

                    if (Control && "setProject" in Control) {
                        Control.setProject(Project);
                    }
                }

                self.Loader.hide();
                self.Loader.hide();

            }).catch(function (err) {
                console.error(err);
            });
        },

        /**
         * Return the settings of the brick
         *
         * @returns {Promise}
         */
        getBrickSettings: function () {
            return new Promise(function (resolve, reject) {

                QUIAjax.get('package_quiqqer_bricks_ajax_getBrick', function (result) {
                    resolve(result);
                }, {
                    'package': 'quiqqer/bricks',
                    onError  : reject,
                    brickId  : this.getAttribute('brickId')
                });

            }.bind(this));
        },

        /**
         * Opens the brick panel
         */
        openBrick: function () {
            var brickId     = this.getAttribute('brickId'),
                projectName = '',
                projectLang = '';

            if (this.getAttribute('Site')) {
                projectName = this.getAttribute('Site').getProject().getName();
                projectLang = this.getAttribute('Site').getProject().getLang();
            }

            return new Promise(function (resolve) {
                require([
                    'package/quiqqer/bricks/bin/BrickEdit',
                    'utils/Panels'
                ], function (BrickEdit, PanelUtils) {
                    var Panel = new BrickEdit({
                        '#id'      : 'brick-edit-' + brickId,
                        id         : brickId,
                        projectName: projectName,
                        projectLang: projectLang
                    });

                    PanelUtils.openPanelInTasks(Panel);
                    resolve(Panel);
                });
            });
        }
    });
});
