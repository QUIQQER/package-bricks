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
            'prev',
            'next',
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
            var Elm  = this.getElm();

            this.List = Elm.getElement(".basic-slider-images");
            this.Slide = this.List.getFirst('li');
            this.Dots = null;

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

            var Image = this.$prepareImg(this.NextSlide);

            this.$next.delay(this.delay, this, Image);
        },

        /**
         *  Get next slide
         *
         * @param Image
         */
        $next: function (Image) {
            var self = this;

            Image.then(function (resolve) {
                if(resolve === true) {
                    self.$toggle().then(function () {
                        self.$start();
                    });
                    return;
                }

                resolve.inject(self.NextSlide);
                self.$toggle().then(function () {
                    self.$start();
                });
            });
        },

        /**
         *  Change slide
         *
         * @returns {*}
         */
        $toggle: function () {
            var self = this;

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
            var self = this;

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
            var self = this;

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
         * Create img elemnt
         *
         * @param {HTML Node} Slide
         * @returns {*}
         */
        $createImage: function (Slide) {
            var url = Slide.get('data-image');

            return new Promise(function (resolve) {

                var Img = new Element('img', {
                    'src': url
                });

                Img.addEventListener('load', () => {
                    resolve(Img);
                });
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
         *  Prepare image element
         *  Check if the image has been previously loaded
         *
         * @param {HTML Node} Slide
         * @returns {Promise}
         */
        $prepareImg: function (Slide) {
            var self = this;

            return new Promise(function (resolve) {
                if(!Slide.getElement('img')) {
                    resolve(self.$createImage(Slide));
                    return;
                }

                resolve(true);
            });
        }
    });
});