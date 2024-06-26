/**
 * @module package/quiqqer/bricks/bin/Controls/Slider/BasicSlider
 * @author Dominik Chrzanowski
 *
 * Basic Slider
 */
define('package/quiqqer/bricks/bin/Controls/Slider/BasicSlider', [

    'qui/QUI',
    'qui/controls/Control',

], function (QUI, QUIControl) {
    "use strict";

    return new Class({

        Extends: QUIControl,
        Type   : 'package/quiqqer/bricks/bin/Controls/Slider/BasicSlider',

        Binds: [
            '$onImport',
            '$next',
            'resize'
        ],

        options: {
            delay: 5000
        },

        initialize: function (options) {
            this.parent(options);

            this.List = null;
            this.Slide = null;
            this.NextSlide = null;

            this.addEvents({
                onImport: this.$onImport
            });
        },

        /**
         * event : on import
         */
        $onImport: function () {
            const Elm  = this.getElm();

            this.List = Elm.getElement(".basic-slider-images");
            this.Slide = this.List.getFirst('li');
            this.Dots = null;

            // first image is already loaded so we set the attribute
            this.Slide.querySelector('img').setAttribute('data-qui-loaded', 1);

            if (Elm.getElement(".basic-slider-dots") !== null) {
                this.Dots = Elm.getElement(".basic-slider-dots");
                this.Dot = this.Dots.getFirst('li');
            }

            this.delay = this.getAttribute('delay');

            this.$start();
        },

        /**
         * Start countdown to change slide
         */
        $start: function () {
            this.NextSlide = this.$getNextSlide();
            this.NextDot = this.$getNextDot();

            setTimeout(() => {
                this.$loadImage(this.NextSlide).then(() => {
                    this.$next();
                });
            }, this.delay);
        },

        /**
         *  Get next slide
         */
        $next: function () {
            this.$toggle().then(() => {
                this.$start();
            });
        },

        /**
         *  Change slide
         *
         * @returns {*}
         */
        $toggle: function () {
            const self = this;

            return new Promise(function (resolve){
                self.$hide().then(function () {
                    self.$show();
                    self.Slide = self.NextSlide;
                    self.Dot = self.NextDot;
                    resolve();
                });
            });
        },

        /**
         * Hide slide
         *
         * @returns {Promise}
         */
        $hide: function () {
            const self = this;

            return new Promise(function (resolve){
                moofx(self.Slide).animate({
                    'transform': 'translateX(-40px)',
                    'opacity' : '0'
                }, {
                    duration: 250,
                    callback: function () {
                        self.Slide.setStyle('display', "none");
                        resolve();
                    }
                });

                if (self.Dots) {
                    self.Dot.classList.remove('active');
                }
            });
        },

        /**
         * Show slide
         *
         * @returns {Promise}
         */
        $show: function () {
            const self = this;

            return new Promise(function (resolve) {
                self.NextSlide.setStyle('display', "block");

                moofx(self.NextSlide).animate({
                    'transform': 'translateX(0px)',
                    'opacity' : '1'
                }, {
                    duration: 500,
                    callback: resolve
                });

                if (self.Dots) {
                    self.NextDot.classList.add('active');
                }
            });
        },

        /**
         * Get next slide
         *
         * @returns {*}
         */
        $getNextSlide: function () {
            if(!this.Slide.getNext()) {
                return this.List.getFirst('li');
            }

            return this.Slide.getNext();
        },

        /**
         * Get next dot
         *
         * @returns {*}
         */
        $getNextDot: function () {
            if (this.Dots === null) {
                return null;
            }

            if(!this.Dot.getNext()) {
                return this.Dots.getFirst('li');
            }

            return this.Dot.getNext();
        },

        /**
         * Delete the loading attribute to force the image to load
         * If the image is already loaded, the promise will be resolved immediately
         *
         * We do this to avoid jumping effect while the image is loaded and it is not present
         *
         * @param Slide HTML Node
         */
        $loadImage: function (Slide) {
            const Image = Slide.querySelector('img');

            if (Image.getAttribute('data-qui-loaded')) {
                return Promise.resolve();
            }

            return new Promise((resolve) => {
                Image.addEventListener('load', resolve);

                Image.setAttribute('data-qui-loaded', 1);
                Image.removeAttribute('loading');
            });
        }
    });
});