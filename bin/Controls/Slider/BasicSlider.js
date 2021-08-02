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

        // binds uzywasz, zeby w srodku moc uzyc $this -> ale tylko wtedy kiedy THIS sie zmienia (haha)
        Binds: [
            '$onImport',
            'prev',
            'next',
            'resize'
        ],

        options: {
            delay: 5000 // jakies opcje, na razie puste
        },

        initialize: function (options) {
            this.parent(options);

            this.List = false;

            this.addEvents({
                onImport: this.$onImport
            });

//            QUI.addEvent('resize', this.resize);
        },

        /**
         * event : on import
         */
        $onImport: function () {
            var Elm  = this.getElm();

            this.List = Elm.getElement(".basic-slider-images");
            this.Slide = this.List.getFirst('li');

            this.$next();
        },

        $next: function () {
            var self = this;
            var NextSlide = this.Slide.getNext();
            var Image = false;

            if(!NextSlide) {
                NextSlide = this.List.getFirst('li');
            }

            if(!NextSlide.getElement('img')) {
                var url = NextSlide.get('data-image');

                Image = self.$createImage(url);
            }

            (function () {
                if (!Image) {
                    self.$change(NextSlide).then(function () {
                        self.$next();
                    });
                    return;
                }

                Image.then(function (resolve) {

                    resolve.inject(NextSlide);
                    self.$change(NextSlide).then(function () {
                        self.$next();
                    });
                });
            }).delay(this.getAttribute('delay'));
        },

        $change: function (NextSlide) {
            var self = this;

            return new Promise(function (resolve){
                self.$hide(self.Slide).then(function () {
                    self.$show(NextSlide);
                    self.Slide = NextSlide;
                    resolve();
                });
            });
        },

        $hide: function (PreviousSlide) {
            return new Promise(function (resolve){
                moofx(PreviousSlide).animate({
                    'left': '-50',
                    'opacity' : '0'
                }, {
                    duration: 250,
                    callback: resolve
                });
            });
        },

        $show: function (Slide) {
            return new Promise(function (resolve) {
                moofx(Slide).animate({
                    'left': '0',
                    'opacity' : '1'
                }, {
                    duration: 500,
                    callback: resolve
                });
            });
        },

        $createImage: function (url) {
            return new Promise(function (resolve) {

                var Img = new Element('img', {
                    'src': url
                });

                Img.addEventListener('load', () => {
                    resolve(Img);
                });
            });
        }
    });
});