/**
 * @module package/quiqqer/bricks/bin/Controls/Slider/PromosliderWallpaper
 * @author www.pcsg.de (Henning Leutz)
 *
 * @require qui/QUI
 * @require qui/controls/Control
 * @require qui/utils/Functions
 */
define('package/quiqqer/bricks/bin/Controls/Slider/PromosliderWallpaper', [

    'qui/QUI',
    'qui/controls/Control',
    'qui/utils/Functions'

], function (QUI, QUIControl, QUIFunctionUtils) {
    "use strict";

    return new Class({

        Extends: QUIControl,
        Type   : 'package/quiqqer/bricks/bin/Controls/Slider/PromosliderWallpaper',

        Binds: [
            'onResize',
            '$onImport',
            '$checkdotPosition',
            'next',
            'previous',
            'show'
        ],

        initialize: function (options) {
            this.parent(options);

            this.$Container = null;
            this.$Next      = null;
            this.$Previous  = null;
            this.$Dots      = null;

            this.$width     = 0;
            this.$scrolling = false;

            this.$scrollOnMouseMove = false;

            this.addEvents({
                onImport: this.$onImport
            });

            QUI.addEvent('resize', function () {
                if (this.getElm()) {
                    this.$width = this.getElm().getSize().x;
                    this.onResize();
                }
            }.bind(this));
        },

        /**
         * event : on import
         */
        $onImport: function () {
            var Elm = this.getElm();

            this.$width = Elm.getSize().x;

            this.$Container = Elm.getElement('.quiqqer-bricks-promoslider-wallpaper-container');
            this.$Next      = Elm.getElement('.quiqqer-bricks-promoslider-wallpaper-next');
            this.$Previous  = Elm.getElement('.quiqqer-bricks-promoslider-wallpaper-prev');
            this.$Dots      = Elm.getElement('.quiqqer-bricks-promoslider-wallpaper-dots');

            this.$Scroll = new Fx.Scroll(this.$Container, {
                duration: 250
            });

            // create dots
            var dotClick = function (event) {
                event.stop();
                this.show(event.target.get('data-index'));
            }.bind(this);

            for (var i = 0, len = this.$Container.getElements('li').length; i < len; i++) {
                new Element('span', {
                    'class'     : 'quiqqer-bricks-promoslider-wallpaper-dot',
                    'data-index': i,
                    events      : {
                        click: dotClick
                    }
                }).inject(this.$Dots);
            }


            // scrolling
            var scrollCheck = QUIFunctionUtils.debounce(
                this.onResize.bind(this),
                100
            );

            this.$Container.set('tabindex', -1);

            // dragable scroll
            var lastScrollLeft = 0,
                lastClientX    = 0;

            this.$Container.addEvents({
                scroll: scrollCheck,

                mousedown: function (event) {
                    this.$Container.focus();
                    this.$scrolling         = true;
                    this.$scrollOnMouseMove = true;

                    lastClientX    = event.client.x;
                    lastScrollLeft = this.$Container.scrollLeft;

                    event.stop();
                }.bind(this),

                keyup: function (event) {
                    if (event.key === 'left') {
                        event.stop();
                        this.$scrolling         = true;
                        this.$scrollOnMouseMove = false;

                        this.previous().then(function () {
                            this.$scrolling = false;
                        }.bind(this));

                        return;
                    }

                    if (event.key === 'right') {
                        event.stop();
                        this.$scrolling         = true;
                        this.$scrollOnMouseMove = false;

                        this.next().then(function () {
                            this.$scrolling = false;
                        }.bind(this));
                    }
                }.bind(this)
            });

            document.body.addEvents({
                mouseup: function (event) {
                    this.$scrolling         = false;
                    this.$scrollOnMouseMove = false;

                    lastClientX    = 0;
                    lastScrollLeft = this.$Container.scrollLeft;

                    scrollCheck();

                    event.stop();
                }.bind(this),

                mousemove: function (event) {
                    if (this.$scrolling === true && this.$scrollOnMouseMove === true) {
                        this.$Container.scrollLeft = lastScrollLeft - (-lastClientX + event.client.x);
                    }
                }.bind(this)
            });

            // navigation
            this.$Next.addEvent('click', function (event) {
                event.stop();
                this.$scrollOnMouseMove = false;
                this.next();
            }.bind(this));

            this.$Previous.addEvent('click', function (event) {
                event.stop();
                this.$scrollOnMouseMove = false;
                this.previous();
            }.bind(this));
        },

        /**
         * on resize, checks the sizes of the control
         *
         * @returns {Promise}
         */
        onResize: function () {
            return new Promise(function (resolve) {

                if (this.$scrolling) {
                    return resolve();
                }

                var pos = this.$Container.getScroll();

                if (pos.x === 0) {
                    return resolve();
                }

                var mod = this.$width % pos.x;

                if (!mod) {
                    return resolve();
                }

                var half = this.$width / 2;
                var next = pos.x + half - (pos.x + half) % this.$width;

                this.$Scroll.start(next, 0).chain(function () {
                    this.$checkdotPosition();
                    resolve();
                }.bind(this));
            }.bind(this));
        },

        /**
         * Shows the next slide
         *
         * @return {Promise}
         */
        next: function () {
            return new Promise(function (resolve) {
                this.$scrolling = true;

                new Fx.Scroll(this.$Container, {
                    duration: 500
                }).start(this.$Container.scrollLeft + this.$width, 0).chain(function () {
                    this.$scrolling = false;
                    this.$checkdotPosition();
                    resolve();
                }.bind(this));

            }.bind(this));
        },

        /**
         * Shows the previous slide
         *
         * @return {Promise}
         */
        previous: function () {
            return new Promise(function (resolve) {
                this.$scrolling = true;

                new Fx.Scroll(this.$Container, {
                    duration: 500
                }).start(this.$Container.scrollLeft - this.$width, 0).chain(function () {
                    this.$scrolling = false;
                    this.$checkdotPosition();
                    resolve();
                }.bind(this));

            }.bind(this));
        },

        /**
         * Show a specific slide
         *
         * @param {Number} slideNo
         * @return {Promise}
         */
        show: function (slideNo) {
            return new Promise(function (resolve) {
                this.$scrolling = true;

                var scrollTo = slideNo * this.$width;

                if (this.$Container.scrollLeft == scrollTo) {
                    resolve();
                    return;
                }

                new Fx.Scroll(this.$Container, {
                    duration: 500
                }).start(slideNo * this.$width, 0).chain(function () {
                    this.$scrolling = false;
                    this.$checkdotPosition();
                    resolve();
                }.bind(this));

            }.bind(this));
        },

        /**
         *
         */
        $checkdotPosition: function () {
            var count = Math.round(this.$Container.scrollLeft / this.$width);
            var Dot   = this.$Dots.getElement(':nth-child(' + (count + 1) + ')');

            if (Dot.hasClass('quiqqer-bricks-promoslider-wallpaper-dot-active')) {
                return;
            }

            this.$Dots
                .getElements('.quiqqer-bricks-promoslider-wallpaper-dot')
                .removeClass('quiqqer-bricks-promoslider-wallpaper-dot-active');

            Dot.addClass('quiqqer-bricks-promoslider-wallpaper-dot-active');
        }
    });
});