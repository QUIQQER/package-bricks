/**
 * Children listing
 *
 * @module package/quiqqer/bricks/bin/Controls/Children/Infinite
 * @author www.pcsg.de (Henning Leutz)
 *
 * @require qui/QUI
 * @require qui/controls/Control
 */
define('package/quiqqer/bricks/bin/Controls/Children/Slider', [

    'qui/QUI',
    'qui/controls/Control',
    'qui/utils/Functions'

], function (QUI, QUIControl, QUIFunctionUtils) {
    "use strict";

    return new Class({

        Extends: QUIControl,
        Type   : 'package/quiqqer/bricks/bin/Controls/Children/Slider',

        Binds: [
            '$onImport',
            '$onScroll',
            'prev',
            'next'
        ],

        initialize: function (options) {
            this.parent(options);

            this.$Slide   = null;
            this.$SlideFX = null;

            this.$scrollLength = null;
            this.$scrollMax    = 0;

            this.addEvents({
                onImport: this.$onImport
            });
        },

        /**
         * resize the control and recalc all slide vars
         */
        resize: function () {
            var size = this.getElm().getSize();

            var articles = this.getElm().getElements('article'),
                width    = articles.map(function (Elm) {
                    var Parent = Elm.getParent();
                    var w      = Parent.getSize().x;

                    Parent.setStyle('width', w);

                    return w;
                }).sum();

            this.$Slide.setStyle('width', width);

            this.$scrollLength = (size.x / 1.2).round();
            this.$scrollMax    = this.$Inner.getScrollSize().x - size.x;
        },

        /**
         * event : on import
         */
        $onImport: function () {
            var Elm = this.getElm();

            this.$Next = new Element('div', {
                'class': 'quiqqer-bricks-children-slider-next hide-on-mobile',
                html   : '<span class="fa fa-angle-right"></span>',
                styles : {
                    display: 'none',
                    right  : 0,
                    opacity: 0
                },
                events : {
                    click: this.next
                }
            }).inject(Elm);

            this.$Prev = new Element('div', {
                'class': 'quiqqer-bricks-children-slider-prev hide-on-mobile',
                html   : '<span class="fa fa-angle-left"></span>',
                styles : {
                    display: 'none',
                    left   : 0,
                    opacity: 0
                },
                events : {
                    click: this.prev
                }
            }).inject(Elm);

            this.$Inner   = Elm.getElement('.quiqqer-bricks-children-slider-container-inner');
            this.$Slide   = Elm.getElement('.quiqqer-bricks-children-slider-container-slide');
            this.$SlideFX = new Fx.Scroll(this.$Inner);

            var scrollSpy = QUIFunctionUtils.debounce(this.$onScroll, 200);

            this.$Inner.addEvent('scroll', scrollSpy);

            this.$NextFX = moofx(this.$Next);
            this.$PrevFX = moofx(this.$Prev);

            this.showNextButton.delay(200, this);

            // calc scrolling vars
            this.resize();
        },

        /**
         * Show previous articles
         *
         * @return {Promise}
         */
        prev: function () {
            return new Promise(function (resolve) {

                var left = this.$Inner.getScroll().x - this.$scrollLength;

                if (left < 0) {
                    left = 0;
                }

                this.$SlideFX.start(left, 0).chain(resolve);

            }.bind(this));
        },

        /**
         * Show next articles
         *
         * @return {Promise}
         */
        next: function () {
            return new Promise(function (resolve) {
                var left = this.$Inner.getScroll().x + this.$scrollLength;

                this.$SlideFX.start(left, 0).chain(resolve);

            }.bind(this));
        },

        /**
         * Show the next button
         * @returns {Promise}
         */
        showNextButton: function () {
            return new Promise(function (resolve) {
                this.$Next.setStyle('display', null);

                this.$NextFX.animate({
                    right  : -50,
                    opacity: 1
                }, {
                    duration: 200,
                    callback: resolve
                });
            }.bind(this));
        },

        /**
         * Show the previous button
         * @returns {Promise}
         */
        showPrevButton: function () {
            return new Promise(function (resolve) {
                this.$Prev.setStyle('display', null);

                this.$PrevFX.animate({
                    left   : -50,
                    opacity: 1
                }, {
                    duration: 200,
                    callback: resolve
                });
            }.bind(this));
        },

        /**
         * Hide the next button
         * @returns {Promise}
         */
        hideNextButton: function () {
            return new Promise(function (resolve) {
                this.$NextFX.animate({
                    right  : 0,
                    opacity: 0
                }, {
                    duration: 200,
                    callback: function () {
                        this.$Next.setStyle('display', 'none');
                        resolve();
                    }.bind(this)
                });
            }.bind(this));
        },

        /**
         * Hide the prev button
         * @returns {Promise}
         */
        hidePrevButton: function () {
            return new Promise(function (resolve) {
                this.$PrevFX.animate({
                    left   : 0,
                    opacity: 0
                }, {
                    duration: 200,
                    callback: function () {
                        this.$Prev.setStyle('display', 'none');
                        resolve();
                    }.bind(this)
                });
            }.bind(this));
        },

        /**
         *
         */
        $onScroll: function () {
            var left = this.$Inner.getScroll().x;

            if (left === 0) {
                this.hidePrevButton();
            } else {
                this.showPrevButton();
            }

            if (left === this.$scrollMax) {
                this.hideNextButton();
            } else {
                this.showNextButton();
            }
        }
    });
});
