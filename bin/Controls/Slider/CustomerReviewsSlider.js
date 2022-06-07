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
            delay: 5000
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
            var self = this;

            var options = {
                type: 'carousel',
                perView: 1,
            };

            if (delay >= 1000) {
                options['autoplay'] = delay;
            }

            var glide = new Glide('.glide', options);

            var GlideElem = document.querySelector('.customerReviewsSlider-slider-wrapper');

            if (GlideElem) {

                // Automated height on Carousel build
                glide.on('build.after', function () {
                    self.glideHandleHeight();
                });

                // Automated height on Carousel change
                glide.on('run.after', function () {
                    self.glideHandleHeight();
                });


                glide.mount();
            }
        },

        glideHandleHeight: function () {
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