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

            var options = {
                type: 'carousel',
                perView: 1,
            };

            if (delay >= 1000) {
                options['autoplay'] = delay;
            }

            new Glide('.glide', options).mount();
        }
    });
});