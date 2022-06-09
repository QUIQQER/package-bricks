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
    'css!' + URL_OPT_DIR + 'bin/quiqqer-asset/glidejs-glide/@glidejs/glide/dist/css/glide.theme.css'

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
        },

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

            var options = {
                type: 'carousel',
                perView: 1,
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
                    self.setSliderHeight();
                });

                // Automated height on Carousel change
                glide.on('run.before', function (e) {
                    self.changeSliderHeight(e.direction);
                });

            }
        },

        changeSliderHeight: function (direction) {

            const slider = document.querySelector('.customerReviewsSlider-slider').children;

            var i = 0;
            var nextSlide = null;

            for (i; i<slider.length; i++) {

                if (slider[i].className.includes('glide__slide--active')) {

                    if (direction === ">") {
                        nextSlide = slider[i+1];
                        break;
                    }
                    nextSlide = slider[i-1];
                    break;
                }
            }

            const nextSlideHeight = nextSlide ? nextSlide.offsetHeight + 50 : 0;

            const glideTrack = document.querySelector('.customerReviewsSlider-track');
            const glideTrackHeight = glideTrack ? glideTrack.offsetHeight : 0;

            if (nextSlideHeight !== glideTrackHeight) {
                glideTrack.style.height = `${nextSlideHeight}px`;
            }

        },

        setSliderHeight: function () {
            const activeSlide = document.querySelector('.glide__slide--active');
            const activeSlideHeight = activeSlide ? activeSlide.offsetHeight + 50 : 0;

            const glideTrack = document.querySelector('.customerReviewsSlider-track');
            const glideTrackHeight = glideTrack ? glideTrack.offsetHeight : 0;

            if (activeSlideHeight !== glideTrackHeight) {
                glideTrack.style.height = `${activeSlideHeight}px`;
            }
        }
    });
});