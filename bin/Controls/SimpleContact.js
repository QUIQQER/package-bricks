/**
 * QUIQQER Contact Control
 *
 * @author www.pcsg.de (Henning Leutz)
 * @author www.pcsg.de (Michael Danielczok)
 * @module Bricks\Controls\SimpleContact
 */
define('package/quiqqer/bricks/bin/Controls/SimpleContact', [

    'qui/QUI',
    'qui/controls/Control',
    'utils/Controls',
    'qui/controls/loader/Loader',
    'Ajax',
    'Locale'

], function (QUI, QUIControl, QUIControlUtils, QUILoader, Ajax, QUILocale) {
    "use strict";

    var lg = 'quiqqer/bricks';

    return new Class({

        Extends: QUIControl,
        Type   : 'Controls/SimpleContact',

        Binds: [
            '$onImport'
        ],

        initialize: function (options) {
            this.parent(options);

            this.Loader = new QUILoader();

            this.$Text            = null;
            this.$Email           = null;
            this.$Name            = null;
            this.$captchaResponse = false;
            this.$captchaRequired = false;

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

            var Button = this.Form.getElement('.quiqqer-simple-contact-button');

            if (Button) {
                Button.addEvent('click', function () {
                    if (self.$captchaRequired && !self.$captchaResponse) {
                        QUI.getMessageHandler(function (MH) {
                            MH.options.displayTimeMessages = 2000;

                            var CaptchaElm = self.$Elm.getElement('.qui-contact-captcha');

                            if (!CaptchaElm) {
                                CaptchaElm = undefined;
                            }

                            MH.addError(
                                QUILocale.get(lg, 'brick.control.simpleContact.error.captcha_failed'),
                                CaptchaElm
                            );
                        });

                        return;
                    }

                    self.$Elm.getElement('form').fireEvent('submit');
                });

                Button.removeAttribute('disabled');
            }

            this.$Elm.getElement('form').addEvent('submit', function (event) {
                if (typeof event !== 'undefined') {
                    event.stop();
                }

                self.send();
            });

            this.$Text  = this.$Elm.getElement('[name="message"]');
            this.$Email = this.$Elm.getElement('[name="email"]');
            this.$Name  = this.$Elm.getElement('[name="name"]');

            // CAPTCHA
            var CaptchaElm = this.$Elm.getElement(
                'div[data-qui="package/quiqqer/captcha/bin/controls/CaptchaDisplay"]'
            );

            if (!CaptchaElm) {
                return;
            }

            QUIControlUtils.getControlByElement(CaptchaElm).then(function (CaptchaDisplay) {
                CaptchaDisplay.getCaptchaControl().then(function (CaptchaControl) {
                    self.$captchaRequired = true;

                    CaptchaControl.addEvents({
                        onSuccess: function (response) {
                            self.$captchaResponse = response;
                        },
                        onExpired: function () {
                            self.$captchaResponse = false;
                        }
                    });
                });
            });
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
                captchaResponse      : this.$captchaResponse,
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
