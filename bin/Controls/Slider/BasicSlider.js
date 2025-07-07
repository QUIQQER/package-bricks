/**
 * Basic Slider
 *
 * Animation types: see isAnimationTypeValid() function for valid types
 *
 * @module package/quiqqer/bricks/bin/Controls/Slider/BasicSlider
 * @author Dominik Chrzanowski
 * @author Michael Danielczok
 *
 * @require qui/QUI
 * @require qui/controls/Control
 *
 * @event onAnimationToggleStart [this]
 * @event onAnimationHideEnd [this]
 * @event onAnimationToggleEnd [this]
 */
define('package/quiqqer/bricks/bin/Controls/Slider/BasicSlider', [

    'qui/QUI',
    'qui/controls/Control'

], function(QUI, QUIControl) {
    'use strict';

    return new Class({

        Extends: QUIControl,
        Type: 'package/quiqqer/bricks/bin/Controls/Slider/BasicSlider',

        Binds: [
            '$onImport',
            '$next',
            'resize',
            '$getAnimatedPropertiesForHide',
            '$getAnimatedPropertiesForShow'
        ],

        options: {
            delay: 5000,
            animationdurationhide: 250, // in miliseconds
            animationdurationshow: 500, // in miliseconds
            animationtype: 'hideSlideToLeftShowSlideFromLeft'
        },

        initialize: function(options) {
            this.parent(options);

            this.SliderList = null;
            this.Slide = null;
            this.NextSlide = null;
            this.animationDurationHide = this.options.animationdurationhide;
            this.animationDurationShow = this.options.animationdurationshow;
            this.animationType = this.options.animationtype;

            this.addEvents({
                onImport: this.$onImport
            });
        },

        /**
         * event : on import
         */
        $onImport: function() {
            const Elm = this.getElm();

            if (this.getAttribute('animationtype') && this.isAnimationTypeValid(this.getAttribute('animationtype'))) {
                this.animationType = this.getAttribute('animationtype');
            }

            const animDurationHide = parseInt(this.getAttribute('animationDurationHide'), 10);
            const animDurationShow = parseInt(this.getAttribute('animationDurationShow'), 10);
            if (animDurationHide > 50) {
                this.animationDurationHide = animDurationHide;
            }
            if (animDurationShow > 50) {
                this.animationDurationShow = animDurationShow;
            }


            this.SliderList = Elm.querySelector('[data-name="sliderList"]');
            this.Slide = this.SliderList.querySelector(':scope > li');
            this.DotNav = Elm.querySelector('[data-name="dotNavList"]');

            // first image is already loaded so we set the attribute
            this.Slide.querySelector('img').setAttribute('data-qui-loaded', 1);

            if (this.DotNav) {
                this.DotCurrent = this.DotNav.getFirst('li');
            }

            this.delay = this.getAttribute('delay');

            this.$start();
        },

        /**
         * Start countdown to change slide
         */
        $start: function() {
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
        $next: function() {
            this.$toggle().then(() => {
                this.$start();
            });
        },

        /**
         *  Change slide
         *
         * @returns {*}
         */
        $toggle: function() {
            this.fireEvent('animationToggleStart', [this]);

            const self = this;

            return new Promise(function(resolve) {
                self.$hide().then(function() {
                    if (self.DotNav) {
                        self.DotCurrent.classList.remove('active');
                        self.DotCurrent = self.NextDot;
                        self.NextDot.classList.add('active');
                    }

                    return self.$show();
                }).then(function() {
                    self.Slide = self.NextSlide;

                    self.fireEvent('animationToggleEnd', [this]);
                    resolve();
                });
            });
        },

        /**
         * Hide slide
         *
         * @returns {Promise}
         */
        $hide: function() {
            const self = this;

            return new Promise(function(resolve) {
                moofx(self.Slide).animate(self.$getAnimatedPropertiesForHide(), {
                    duration: self.animationDurationHide,
                    callback: function() {
                        self.Slide.setStyle('display', 'none');
                        self.fireEvent('animationHideEnd', [this]);
                        resolve();
                    }
                });
            });
        },

        /**
         * Show slide
         *
         * @returns {Promise}
         */
        $show: function() {
            const self = this;

            return new Promise(function(resolve) {
                self.NextSlide.setStyle('display', 'block');

                moofx(self.NextSlide).animate(self.$getAnimatedPropertiesForShow(), {
                    duration: self.animationDurationShow,
                    callback: resolve
                });
            });
        },

        /**
         * Get next slide
         *
         * @returns {*}
         */
        $getNextSlide: function() {
            if (!this.Slide.getNext()) {
                return this.SliderList.getFirst('li');
            }

            return this.Slide.getNext();
        },

        /**
         * Get next dot
         *
         * @returns {*}
         */
        $getNextDot: function() {
            if (this.DotNav === null) {
                return null;
            }

            if (!this.DotCurrent.getNext()) {
                return this.DotNav.querySelector(':scope > li');
            }

            return this.DotCurrent.getNext();
        },

        /**
         * Delete the loading attribute to force the image to load
         * If the image is already loaded, the promise will be resolved immediately
         *
         * We do this to avoid jumping effect while the image is loaded and it is not present
         *
         * @param Slide HTML Node
         */
        $loadImage: function(Slide) {
            const Image = Slide.querySelector('img');

            if (Image.getAttribute('data-qui-loaded')) {
                return Promise.resolve();
            }

            return new Promise((resolve) => {
                Image.addEventListener('load', resolve);

                Image.setAttribute('data-qui-loaded', 1);
                Image.removeAttribute('loading');
            });
        },

        /**
         * Checks if the given animationName is a valid animation type
         *
         * @param {string} animationName
         * @returns {boolean}
         */
        isAnimationTypeValid: function(animationName) {
            const validTypes = [
                'hideSlideToLeftShowSlideFromLeft',
                'hideSlideToLeftShowSlideFromRight',
                'hideSlideToRightShowSlideFromRight',
                'hideSlideToRightShowSlideFromLeft',
                'hideSlideToBottomShowSlideFromBottom',
                'hideSlideToBottomShowSlideFromTop',
                'fadeOutFadeIn',
                'hideScaleOutShowFromScaleOut',
                'hideScaleInShowFromScaleIn',
                'hideScaleOutShowFromScaleIn',
                'hideScaleInShowFromScaleOut'
            ];

            return validTypes.indexOf(animationName) !== -1;
        },

        /**
         * Get animation CSS properties for hide animation
         *
         * @returns {Object.<string, string>}
         */
        $getAnimatedPropertiesForHide: function() {
            switch (this.animationType) {
                case 'hideSlideToLeftShowSlideFromLeft':
                    return {
                        'transform': 'translateX(-20px)',
                        'opacity': '0'
                    };

                case 'hideSlideToLeftShowSlideFromRight':
                    return {
                        'transform': 'translateX(-20px)',
                        'opacity': '0'
                    };

                case 'hideSlideToRightShowSlideFromRight':
                    return {
                        'transform': 'translateX(20px)',
                        'opacity': '0'
                    };

                case 'hideSlideToRightShowSlideFromLeft':
                    return {
                        'transform': 'translateX(20px)',
                        'opacity': '0'
                    };

                case 'hideSlideToBottomShowSlideFromBottom':
                    return {
                        'transform': 'translateY(20px)',
                        'opacity': '0'
                    };

                case 'hideSlideToBottomShowSlideFromTop':
                    return {
                        'transform': 'translateY(20px)',
                        'opacity': '0'
                    };

                case 'fadeOutFadeIn':
                    return {
                        'opacity': '0'
                    };

                case 'hideScaleOutShowFromScaleOut':
                    return {
                        'transform': 'scale(0.95)',
                        'opacity': '0'
                    };

                case 'hideScaleInShowFromScaleIn':
                    return {
                        'transform': 'scale(1.05)',
                        'opacity': '0'
                    };

                case 'hideScaleOutShowFromScaleIn':
                    return {
                        'transform': 'scale(0.95)',
                        'opacity': '0'
                    };

                case 'hideScaleInShowFromScaleOut':
                    return {
                        'transform': 'scale(1.05)',
                        'opacity': '0'
                    };
            }
        },

        /**
         * Get animation CSS properties for show animation and set the pre animation state
         *
         * @returns {Object.<string, string>}
         */
        $getAnimatedPropertiesForShow: function() {
            switch (this.animationType) {
                case 'hideSlideToLeftShowSlideFromLeft':
                    this.NextSlide.style.transform = 'translateX(-20px)';
                    this.NextSlide.style.opacity = 0;

                    return {
                        'transform': 'translateX(0px)',
                        'opacity': '1'
                    };

                case 'hideSlideToLeftShowSlideFromRight':
                    this.NextSlide.style.transform = 'translateX(20px)';
                    this.NextSlide.style.opacity = 0;

                    return {
                        'transform': 'translateX(0px)',
                        'opacity': '1'
                    };

                case 'hideSlideToRightShowSlideFromRight':
                    this.NextSlide.style.transform = 'translateX(20px)';
                    this.NextSlide.style.opacity = 0;

                    return {
                        'transform': 'translateX(0px)',
                        'opacity': '1'
                    };

                case 'hideSlideToRightShowSlideFromLeft':
                    this.NextSlide.style.transform = 'translateX(-20px)';
                    this.NextSlide.style.opacity = 0;

                    return {
                        'transform': 'translateX(0px)',
                        'opacity': '1'
                    };

                case 'hideSlideToBottomShowSlideFromBottom':
                    this.NextSlide.style.transform = 'translateY(20px)';
                    this.NextSlide.style.opacity = 0;

                    return {
                        'transform': 'translateY(0px)',
                        'opacity': '1'
                    };

                case 'hideSlideToBottomShowSlideFromTop':
                    this.NextSlide.style.transform = 'translateY(-20px)';
                    this.NextSlide.style.opacity = 0;

                    return {
                        'transform': 'translateY(0px)',
                        'opacity': '1'
                    };

                case 'fadeOutFadeIn':
                    this.NextSlide.style.opacity = 0;
                    return {
                        'opacity': '1'
                    };

                case 'hideScaleOutShowFromScaleOut':
                    this.NextSlide.style.transform = 'scale(0.95)';
                    this.NextSlide.style.opacity = 0;

                    return {
                        'transform': 'scale(1)',
                        'opacity': '1'
                    };

                case 'hideScaleInShowFromScaleIn':
                    this.NextSlide.style.transform = 'scale(1.05)';
                    this.NextSlide.style.opacity = 0;

                    return {
                        'transform': 'scale(1)',
                        'opacity': '1'
                    };

                case 'hideScaleOutShowFromScaleIn':
                    this.NextSlide.style.transform = 'scale(1.05)';
                    this.NextSlide.style.opacity = 0;

                    return {
                        'transform': 'scale(1)',
                        'opacity': '1'
                    };

                case 'hideScaleInShowFromScaleOut':
                    this.NextSlide.style.transform = 'scale(0.95)';
                    this.NextSlide.style.opacity = 0;

                    return {
                        'transform': 'scale(1)',
                        'opacity': '1'
                    };
            }
        }
    });
});