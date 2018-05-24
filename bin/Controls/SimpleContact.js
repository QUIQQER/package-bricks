/**
 * QUIQQER Contact Control
 *
 * @author www.pcsg.de (Henning Leutz)
 * @author www.pcsg.de (Michael Danielczok)
 * @module Bricks\Controls\SimpleContact
 *
 * @require qui/QUI
 * @require qui/controls/Control
 * @require qui/controls/buttons/Button
 * @require qui/controls/loader/Loader
 * @require Ajax
 * @require Locale
 */
define('package/quiqqer/bricks/bin/Controls/SimpleContact', [

    'qui/QUI',
    'qui/controls/Control',
    'qui/controls/buttons/Button',
    'qui/controls/loader/Loader',
    'Ajax',
    'Locale'

], function (QUI, QUIControl, QUIButton, QUILoader, Ajax, QUILocale) {
    "use strict";

    return new Class({

        Extends: QUIControl,
        Type   : 'Controls/SimpleContact',

        Binds: [
            '$onImport'
        ],

        initialize: function (options) {
            this.parent(options);

            this.Loader = new QUILoader();

            this.$Text  = null;
            this.$Email = null;
            this.$Name  = null;

            this.addEvents({
                onImport: this.$onImport
            });
        },

        /**
         * event : on import
         */
        $onImport: function () {
            var self = this;

            this.Loader.inject(this.$Elm);
            this.Form = this.$Elm.getElement('form');

            var Button = new Element('button', {
                'class': 'quiqqer-simple-contact-button',
                'type' : 'button',
                'html' : QUILocale.get('quiqqer/bricks', 'control.simpleContact.sendButton'),
                events : {
                    click: function () {
                        self.$Elm.getElement('form').fireEvent('submit');
                    }
                }
            });

            Button.inject(this.Form);

            this.$Elm.getElement('form').addEvent('submit', function (event) {
                if (typeof event !== 'undefined') {
                    event.stop();
                }

                self.send();
            });

            this.$Text  = this.$Elm.getElement('[name="message"]');
            this.$Email = this.$Elm.getElement('[name="email"]');
            this.$Name  = this.$Elm.getElement('[name="name"]');
        },

        /**
         * Send contact message
         */
        send: function () {

            if (this.$Text.value === '') {
                this.$Text.focus();
                return;
            }

            if (this.$Email.value === '') {
                this.$Email.focus();
                return;
            }

            if (this.$Name.value === '') {
                this.$Name.focus();
                return;
            }

            var PrivacyPolicyCheckbox = this.$Elm.getElement('#qui-contact-privacypolicy');
            var privacyPolicyAccepted = false;

            if (PrivacyPolicyCheckbox) {
                privacyPolicyAccepted = PrivacyPolicyCheckbox.checked;
            }

            var self = this;

            this.Loader.show();

            Ajax.post('package_quiqqer_bricks_ajax_contact', function (result) {
                if (result) {
                    var html = '<span class="fa fa-check fa-check-simple-contact control-color"></span>';
                    html += QUILocale.get('quiqqer/bricks', 'brick.control.simpleContact.successful');
                    self.Form.set('html', html);
                }

                self.Loader.hide();

            }, {
                'package'            : 'quiqqer/bricks',
                brickId              : this.$Elm.get('data-brickid'),
                message              : this.$Text.value,
                email                : this.$Email.value,
                name                 : this.$Name.value,
                showError            : false,
                project              : JSON.encode(QUIQQER_PROJECT),
                siteId               : QUIQQER_SITE.id,
                privacyPolicyAccepted: privacyPolicyAccepted ? 1 : 0,
                onError              : function (Exception) {
                    self.Loader.hide();

                    QUI.getMessageHandler(function (MH) {
                        MH.options.displayTimeMessages = 8000;
                        MH.addError(Exception.getMessage(), self.$Elm);
                    });
                }
            });
        }
    });
});
