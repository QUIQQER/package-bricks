/**
 * QUIQQER Accordion Control
 *
 * @author www.pcsg.de (Michael Danielczok)
 * @module Bricks\Controls\SimpleContact
 */
define('package/quiqqer/bricks/bin/Controls/Accordion', [

    'qui/QUI',
    'qui/controls/Control',
    'utils/Controls',

], function (QUI, QUIControl, QUIControlUtils) {
    "use strict";

    return new Class({

        Extends: QUIControl,
        Type   : 'Controls/Accordion',

        options: {
            stayopen   : false,
            openfirst  : true,
            rotateangle: 180
        },

        Binds: [
            '$onImport',
            '$toggle',
            'open',
            'close'
        ],

        initialize: function (options) {
            this.parent(options);

            this.accordionItems = [];

            this.addEvents({
                onImport: this.$onImport
            });
        },

        /**
         * event : on import
         */
        $onImport: function () {
            var self = this;

            this.accordionItems = this.getElm().getElements('.quiqqer-accordion-item');

            this.accordionItems.forEach(function (Item) {
                var Header = Item.getElement('.quiqqer-accordion-item-header');

                Header.addEvent('click', self.$toggle);
            });
        },

        $toggle: function (event) {
            var Target         = event.target,
                Item           = Target.getParent('.quiqqer-accordion-item'),
                ContentWrapper = Item.getElement('.quiqqer-accordion-item-content-wrapper'),
                Content        = ContentWrapper.getElement('.quiqqer-accordion-item-content');

            if (Item.getAttribute('data-open') === '0') {
                this.open(ContentWrapper, Content, Item);
                this.setIconOpenState(Item);
                return;
            }

            this.close(ContentWrapper, Content, Item);
            this.setIconCloseState(Item);
        },

        open: function (ContentWrapper, Content, Item) {
            var self = this;

            if (self.getAttribute('stayopen') === false) {
                this.accordionItems.forEach(function (Item) {
                    if (Item.getAttribute('data-open').toInt() !== 1) {
                        return;
                    }

                    var ContentWrapper = Item.getElement('.quiqqer-accordion-item-content-wrapper'),
                        Content        = ContentWrapper.getElement('.quiqqer-accordion-item-content');

                    self.close(ContentWrapper, Content, Item);
                    self.setIconCloseState(Item);
                });
            }

            ContentWrapper.setStyle('height', 0);
            Content.setStyle('display', 'block');

            var height = Content.getHeight();

            moofx(ContentWrapper).animate({
                height: height
            }, {
                callback: function () {
                    ContentWrapper.setStyle('height', null);
                    Content.setStyle('display', null);
                    Item.setAttribute('data-open', '1');
                }
            });
        },

        close: function (ContentWrapper, Content, Item) {
            moofx(ContentWrapper).animate({
                height: 0
            }, {
                callback: function () {
                    Item.setAttribute('data-open', '0');
                }
            });
        },

        setIconOpenState: function (Item) {
            var Icon = Item.getElement('.quiqqer-accordion-item-header .fa');

            if (!Icon) {
                return;
            }

            var angle = 180;

            if (this.getAttribute('rotateangle').toInt() > 0) {
                angle = this.getAttribute('rotateangle').toInt();
            }

            var animation = 'rotate(' + angle + 'deg)';

            moofx(Icon).animate({
                transform: animation
            });
        },

        setIconCloseState: function (Item) {
            var Icon = Item.getElement('.quiqqer-accordion-item-header .fa');

            if (!Icon) {
                return;
            }

            moofx(Icon).animate({
                transform: 'rotate(0)'
            });
        }
    });
});
