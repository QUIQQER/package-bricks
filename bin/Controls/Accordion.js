/**
 * QUIQQER Accordion Control
 */
define('package/quiqqer/bricks/bin/Controls/Accordion', [

    'qui/QUI',
    'qui/controls/Control',
    'utils/Controls',

], function (QUI, QUIControl, QUIControlUtils) {
    "use strict";

    return new Class({

        Extends: QUIControl,
        Type: 'Controls/Accordion',

        options: {
            stayopen: false,
            openfirst: true
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
         * event: on import
         */
        $onImport: function () {
            const self = this;

            this.accordionItems = this.getElm().getElements('.quiqqer-accordion-item');

            this.accordionItems.forEach(function (Item) {
                const Header = Item.getElement('.quiqqer-accordion-item-header');

                if (!Header) {
                    return;
                }

                Header.addEvent('click', self.$toggle);
            });
        },

        $toggle: function (event) {
            // prevent the native <details> toggle, the animation is handled here
            // (covers mouse click as well as Enter / Space on the summary)
            event.preventDefault();

            const Target = event.target,
                Item = Target.getParent('.quiqqer-accordion-item'),
                ContentWrapper = Item.getElement('.quiqqer-accordion-item-content-wrapper'),
                Content = ContentWrapper.getElement('.quiqqer-accordion-item-content');

            if (!Item.open) {
                this.open(ContentWrapper, Content, Item);
                return;
            }

            this.close(ContentWrapper, Content, Item);
        },

        open: function (ContentWrapper, Content, Item) {
            const self = this;

            if (self.getAttribute('stayopen') === false) {
                this.accordionItems.forEach(function (Other) {
                    if (Other === Item || !Other.open) {
                        return;
                    }

                    const OtherWrapper = Other.getElement('.quiqqer-accordion-item-content-wrapper'),
                        OtherContent = OtherWrapper.getElement('.quiqqer-accordion-item-content');

                    self.close(OtherWrapper, OtherContent, Other);
                });
            }

            // reveal natively first so the content becomes measurable
            Item.classList.remove('quiqqer-accordion-item--closing');
            Item.open = true;

            if (self.prefersReducedMotion()) {
                return;
            }

            ContentWrapper.setStyle('height', 0);

            const height = Content.getHeight();

            moofx(ContentWrapper).animate({
                height: height
            }, {
                duration: self.getTransitionDuration(Item),
                callback: function () {
                    ContentWrapper.setStyle('height', null);
                }
            });
        },

        close: function (ContentWrapper, Content, Item) {
            if (this.prefersReducedMotion()) {
                Item.open = false;
                return;
            }

            // rotate the icon back right away while the height collapses
            Item.classList.add('quiqqer-accordion-item--closing');
            ContentWrapper.setStyle('height', Content.getHeight());

            moofx(ContentWrapper).animate({
                height: 0
            }, {
                duration: this.getTransitionDuration(Item),
                callback: function () {
                    // hide natively only after the collapse animation finished
                    Item.open = false;
                    Item.classList.remove('quiqqer-accordion-item--closing');
                    ContentWrapper.setStyle('height', null);
                }
            });
        },

        prefersReducedMotion: function () {
            return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        },

        /**
         * Read the shared transition duration from CSS so the height animation
         * (moofx) and the icon rotation (CSS) stay in sync and can be overridden
         * in one place via --quiqqer-bricks-accordion-transition-duration.
         *
         * @param {HTMLElement} Item
         * @return {string} e.g. "500ms" or "0.3s"
         */
        getTransitionDuration: function (Item) {
            const value = window.getComputedStyle(Item)
                .getPropertyValue('--_transition-duration').trim();

            return value || '500ms';
        }
    });
});
