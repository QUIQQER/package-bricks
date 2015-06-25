
/**
 * Area edit control for the site object
 *
 * @module package/quiqqer/bricks/bin/Site/Area
 * @author www.pcsg.de (Henning Leutz)
 *
 */

define('package/quiqqer/bricks/bin/Site/BrickEdit', [

    'qui/QUI',
    'qui/controls/Control',
    'qui/controls/loader/Loader',
    'utils/Template',
    'utils/Controls',
    'Ajax',

    'css!package/quiqqer/bricks/bin/Site/BrickEdit.css'

], function(QUI, QUIControl, QUILoader, Template, ControlUtils, QUIAjax)
{
    "use strict";

    var lg = 'quiqqer/bricks';

    return new Class({

        Extends: QUIControl,
        Type: 'package/quiqqer/bricks/bin/Site/BrickEdit',

        Binds : [
            '$onInject'
        ],

        options :{
            brickId : false,
            Site    : false
        },

        initialize : function(options)
        {
            this.parent(options);

            this.Loader = new QUILoader();
            this.$Form = null;

            this.addEvents({
                onInject : this.$onInject
            });
        },

        /**
         * Return the domnode element
         *
         * @returns {HTMLDivElement}
         */
        create : function()
        {
            this.$Elm = new Element('div', {
                'class' : 'quiqqer-bricks-site-brickedit'
            });

            this.Loader.inject(this.$Elm);
            this.$Form = new Element('form').inject(this.$Elm);

            return this.$Elm;
        },

        /**
         * event on inject
         */
        $onInject : function()
        {
            if (!this.getAttribute('brickId')) {
                return;
            }

            if (!this.getAttribute('Site')) {
                return;
            }

            var self = this;

            this.Loader.show();

            this.getSettings().then(function(result) {

                console.log(result);

                return Template.get('bin/Site/BrickEdit', false, {
                    'package' : 'quiqqer/bricks',
                    params    : JSON.encode({
                        customfields      : result.customfields,
                        availableSettings : result.availableSettings
                    })
                });

            }).then(function(html) {

                self.getElm().set('html', html);

                return QUI.parse(self.getElm());

            }).then(function() {
                return ControlUtils.parse(self.getElm());

            }).then(function() {

                var i, len, Control;
                var Project  = self.getAttribute('Site'),
                    controls = self.getElm().getElements(['data-quiid']);

                for (i = 0, len = controls.length; i < len; i++)
                {
                    console.log( controls[i] );

                    Control = QUI.Controls.getById(controls[i].get('data-quiid'));

                    if (Control && "setProject" in Control) {
                        Control.setProject(Project);
                    }
                }

                self.Loader.hide();

            }).catch(function(err) {
                console.error(err);
            });
        },

        /**
         * Return the settings of the brick
         *
         * @returns {Promise}
         */
        getSettings : function()
        {
            return new Promise(function(resolve, reject) {

                QUIAjax.get('package_quiqqer_bricks_ajax_getBrick', function(result) {
                    resolve(result);
                }, {
                    'package' : 'quiqqer/bricks',
                    onError   : reject,
                    brickId   : this.getAttribute('brickId')
                });

            }.bind(this));
        }
    });
});
