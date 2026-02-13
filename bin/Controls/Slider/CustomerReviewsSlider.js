/**
 * Basic Slider
 */
define('package/quiqqer/bricks/bin/Controls/Slider/CustomerReviewsSlider', [

    'qui/QUI',
    'qui/controls/Control',
    URL_OPT_DIR + 'bin/quiqqer-asset/glidejs-glide/@glidejs/glide/dist/glide.js',
    'css!' + URL_OPT_DIR + 'bin/quiqqer-asset/glidejs-glide/@glidejs/glide/dist/css/glide.core.css',

], function (QUI, QUIControl, Glide) {
    "use strict";

    return new Class({

        Extends: QUIControl,
        Type: 'package/quiqqer/bricks/bin/Controls/Slider/CustomerReviewsSlider',

        Binds: [
            '$onImport',
            'prev',
            'next',
            'resize'
        ],

        options: {
            delay: 5000,
            height: 'fixed',
            autoplay: false,
            perview: 1
        },

        glideTrack: null,

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
            const delay = this.getAttribute('delay');
            const autoplay = this.getAttribute('autoplay');
            const sliderHeight = this.getAttribute('height');
            const perView = this.getAttribute('perview');
            const self = this;
            const gap = this.getAttribute('gap');

            this.glideTrack = this.getElm().querySelector('.customerReviewsSlider-track');

            // avoid big jump effect on page load
            // remove this styles from each element
            this.glideTrack.querySelectorAll('li.glide__slide').forEach((Slide) => {
                Slide.style.display = null;
                Slide.style.width = null;
            });

            const options = {
                gap: gap,
                type: 'carousel',
                perView: perView,
                breakpoints: {
                    768: {
                        perView: 1
                    }
                }
            };

            if (delay >= 1000 && autoplay == true) {
                options['autoplay'] = delay;
            }

            const glide = new Glide(this.getElm('.glide'), options);

            glide.on('build.after', function () {
                self.showSlider();
            });

            if (sliderHeight === 'variable') {
                this.sliderHandleHeight(glide);
            }

            glide.mount();
        },

        sliderHandleHeight: function (glide) {
            const self = this;
            const GlideElem = this.getElm().querySelector('.customerReviewsSlider-slider-wrapper');

            if (GlideElem) {
                // Auto height on Carousel build
                glide.on('build.after', function () {
                    self.setSliderHeight();
                });

                // Auto height on Carousel change
                glide.on('run.before', function (e) {
                    self.changeSliderHeight(e.direction, e.steps);
                });
            }
        },

        showSlider: function () {
            const Track = this.getElm().querySelector('.customerReviewsSlider-track');
            Track.style.opacity = 1;
            Track.style.visibility = 'visible';
        },

        changeSliderHeight: function (direction, steps) {
            const activeSlide = this.getElm().querySelector('.glide__slide--active');
            const activeSlideWidth = activeSlide.offsetWidth;
            const glideTrackWidth = this.glideTrack.offsetWidth;
            const howMany = Math.round(glideTrackWidth / activeSlideWidth);

            const slides = this.getSlides(howMany, direction, steps);

            const highestSlide = this.getHeight(slides);

            const glideTrackHeight = this.glideTrack.offsetHeight;

            if (highestSlide !== glideTrackHeight) {
                this.glideTrack.style.height = `${highestSlide + 50}px`;
            }
        },

        setSliderHeight: function () {
            const activeSlide = this.getElm().querySelector('.glide__slide--active');
            const activeSlideWidth = activeSlide.offsetWidth;
            const glideTrackWidth = this.glideTrack.offsetWidth;
            const howMany = Math.round(glideTrackWidth / activeSlideWidth);

            const slides = this.getSlides(howMany);
            const highestSlide = this.getHeight(slides);

            const glideTrackHeight = this.glideTrack.offsetHeight;

            if (highestSlide !== glideTrackHeight) {
                this.glideTrack.style.height = `${highestSlide + 50}px`;
            }
        },

        getSlides: function (howMany, direction = null, steps = null) {
            let i = 0;
            const Slider = this.getElm().querySelector('.customerReviewsSlider-slider');
            const sliderChildren = Slider.children;
            const len = sliderChildren.length;
            let activeSlideIndex = null;
            let firstNewIndex = null;
            let lastNewIndex = null;
            const visibleSlides = [];

            for (i; i < len; i++) {
                if (sliderChildren[i].className.includes('glide__slide--active')) {
                    activeSlideIndex = i;
                    break;
                }
            }

            if (direction === ">") {
                firstNewIndex = activeSlideIndex + 1;
                lastNewIndex = activeSlideIndex + this.getAttribute('perview'); //change to preView option
            }

            if (direction === "<") {
                firstNewIndex = activeSlideIndex - 1;
                lastNewIndex = firstNewIndex + this.getAttribute('perview') - 1; //change to preView option
            }

            if (direction === "=") {
                let j = 0;

                for (i = 0; i < sliderChildren.length; i++) {
                    if (sliderChildren[i].className.includes('glide__slide--clone')) {
                        continue;
                    }

                    steps = parseInt(steps);

                    if (j === steps) {
                        firstNewIndex = i;
                        lastNewIndex = firstNewIndex + this.getAttribute('perview') - 1;
                        break;
                    }

                    j++;
                }
            }

            if (direction === null) {
                firstNewIndex = activeSlideIndex;
                lastNewIndex = firstNewIndex + this.getAttribute('perview') - 1; //change to preView option
            }

            for (i = firstNewIndex; i <= lastNewIndex; i++) {
                visibleSlides.push(sliderChildren[i]);
            }

            return visibleSlides;
        },

        getHeight: function (slides) {
            let newHeight = 0;
            let i = 0;
            const len = slides.length;

            for (i; i < len; i++) {
                let slideHeight = slides[i].offsetHeight;

                if (slideHeight > newHeight) {
                    newHeight = slideHeight;
                }
            }

            return newHeight;
        }
    });
});