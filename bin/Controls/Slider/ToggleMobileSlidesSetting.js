/**
 * @module package/quiqqer/bricks/bin/Controls/Slider/PromosliderSettings
 * @author www.pcsg.de (Henning Leutz)
 *
 * Inhaltseinstellung für Promoslider
 */
define('package/quiqqer/bricks/bin/Controls/Slider/ToggleMobileSlidesSetting', [

    'qui/QUI',
    'qui/controls/Control',
    'qui/controls/buttons/Switch'

], function (QUI, QUIControl, QUISwitch) {
    "use strict";

    var lg = 'quiqqer/bricks';

    return new Class({

        Extends: QUIControl,
        Type   : 'package/quiqqer/bricks/bin/Controls/Slider/ToggleMobileSlidesSetting',

        $Switch: QUISwitch,

        Binds: [
            '$onImport',
            '$switchToggled'
        ],

        initialize: function (options) {
            this.parent(options);

            this.addEvents({
                onImport: this.$onImport
            });
        },

        /**
         * event: on import
         */
        $onImport: function () {
            var Wrapper = new Element('span', {
                id: 'ToggleMobileSlidesSettingWrapper'
            });

            this.$Switch = new QUISwitch({
                status: this.getElm().value === "true",
                events: {
                    onChange: this.$switchToggled,
                    onLoad: function() {
                        if (!this.$Switch.getStatus()) {
                            this.hideMobileSlidesSetting();
                        }
                    }.bind(this)
                }
            }).inject(Wrapper);

            Wrapper.wraps(this.getElm());
        },


        /**
         * Called when the switch is toggled
         */
        $switchToggled: function () {
            this.getElm().value = this.$Switch.getStatus();
            this.toggleMobileSlidesSettingVisibility();
        },


        /**
         * Returns the setting-section containing a mobileslides-settings
         *
         * @return {HTMLElement | null}
         .*/
        getMobileSlidesSettingElement: function () {
            return document.getElementsByName('mobileslides')[0].parentElement.parentElement.parentElement;
        },


        /**
         * Hides the mobileslides-setting-section (CSS "visibility" and "display")
         */
        hideMobileSlidesSetting: function () {
            this.getMobileSlidesSettingElement().setStyles({
                visibility: 'hidden',
                display   : 'none'
            });
        },


        /**
         * Shows the mobileslides-setting-section (CSS "visibility" and "display")
         */
        showMobileSlidesSetting: function () {
            this.getMobileSlidesSettingElement().setStyles({
                visibility: 'visible',
                display   : null
            });
        },


        /**
         * Toggles the mobileslides-setting-section visibility (CSS "visibility" and "display")
         */
        toggleMobileSlidesSettingVisibility: function () {
            this.$Switch.getStatus() ? this.showMobileSlidesSetting() : this.hideMobileSlidesSetting();
        }
    });
});
