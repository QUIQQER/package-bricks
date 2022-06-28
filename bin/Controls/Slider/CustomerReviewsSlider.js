/**
 * @module package/quiqqer/bricks/bin/Controls/Slider/CustomerReviewsSlider
 * @author Dominik Chrzanowski
 *
 * Basic Slider
 */
define('package/quiqqer/bricks/bin/Controls/Slider/CustomerReviewsSlider', [

    'qui/QUI',
    'qui/controls/Control',
    URL_OPT_DIR + 'bin/quiqqer-asset/glidejs-glide/@glidejs/glide/dist/glide.js',
    'css!' + URL_OPT_DIR + 'bin/quiqqer-asset/glidejs-glide/@glidejs/glide/dist/css/glide.core.css',
    // 'css!' + URL_OPT_DIR + 'bin/quiqqer-asset/glidejs-glide/@glidejs/glide/dist/css/glide.theme.css'

], function (QUI, QUIControl, Glide) {
    "use strict";

    return new Class({

        Extends: QUIControl,
        Type   : 'package/quiqqer/bricks/bin/Controls/Slider/CustomerReviewsSlider',

        Binds: [
            '$onImport',
            'prev',
            'next',
            'resize'
        ],

        options: {
            delay: 5000,
            height: 'const',
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
         * event : on import
         */
        $onImport: function () {
            var delay = this.getAttribute('delay');
            var autoplay = this.getAttribute('autoplay');
            var sliderHeight = this.getAttribute('height');
            var perView = this.getAttribute('perview');

            this.glideTrack = document.querySelector('.customerReviewsSlider-track');

            var options = {
                type: 'carousel',
                perView: perView
            };

            if (delay >= 1000 && autoplay == true) {
                options['autoplay'] = delay;
            }

            var glide = new Glide('.glide', options);

            if (sliderHeight === 'variable') {
                this.sliderHandleHeight(glide);
            }

            glide.mount();
        },

        sliderHandleHeight: function (glide) {

            var self = this;
            var GlideElem = document.querySelector('.customerReviewsSlider-slider-wrapper');

            if (GlideElem) {

                // Automated height on Carousel build
                glide.on('build.after', function () {
                    self.showSlider();
                    self.setSliderHeight();
                });

                // Automated height on Carousel change
                glide.on('run.before', function (e) {
                    self.changeSliderHeight(e.direction);
                });

            }
        },

        showSlider: function () {
            var Wrapper = document.querySelector('.customerReviewsSlider-track');
            Wrapper.style.opacity = 1;
        },

        changeSliderHeight: function (direction) {

            var activeSlide = document.querySelector('.glide__slide--active');
            var actvieSlideWidth = activeSlide.offsetWidth;
            var glideTrackWidth = this.glideTrack.offsetWidth;
            var howMany = Math.round(glideTrackWidth/actvieSlideWidth);

            var slides = this.getSlides(howMany, direction);
            var highestSlide = this.getHeight(slides);

            var glideTrackHeight = this.glideTrack.offsetHeight;


            if (highestSlide !== glideTrackHeight) {
                this.glideTrack.style.height = `${highestSlide+50}px`;
            }

        },

        setSliderHeight: function () {
            var activeSlide = document.querySelector('.glide__slide--active');
            var actvieSlideWidth = activeSlide.offsetWidth;
            var glideTrackWidth = this.glideTrack.offsetWidth;
            var howMany = Math.round(glideTrackWidth/actvieSlideWidth);

            var slides = this.getSlides(howMany);
            var highestSlide = this.getHeight(slides);

            var glideTrackHeight = this.glideTrack.offsetHeight;


            if (highestSlide !== glideTrackHeight) {
                this.glideTrack.style.height = `${highestSlide+50}px`;
            }
        },

        getSlides: function (howMany, direction = null) {
            var i = 0;
            var Slider = document.querySelector('.customerReviewsSlider-slider');
            var SliderChildren = Slider.children;
            var len = SliderChildren.length;
            var activeSlideIndex = null;
            var firstNewIndex = null;
            var lastNewIndex = null;
            var visibleSlides = [];

            for (i; i<len; i++) {
                if (SliderChildren[i].className.includes('glide__slide--active')) {
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

            if (direction === null) {
                firstNewIndex = activeSlideIndex;
                lastNewIndex = firstNewIndex + this.getAttribute('perview') - 1; //change to preView option
            }

            for (i = firstNewIndex; i<=lastNewIndex; i++) {
                visibleSlides.push(SliderChildren[i]);
            }

            return visibleSlides;
        },

        getHeight: function (slides) {
            var newHeight = 0;
            var i = 0;
            var len = slides.length;

            for (i; i<len; i++) {
                var slideHeight = slides[i].offsetHeight;
                
                if(slideHeight>newHeight) {
                    newHeight = slideHeight;
                }
            }

            return newHeight;
        }
    });
});