/**
 * @module package/quiqqer/bricks/bin/Controls/Slider/BasicSlider
 * @author Dominik Chrzanowski
 *
 * Basic Slider
 */
define('package/quiqqer/bricks/bin/Controls/Slider/BasicSlider', [

    'qui/QUI',
    'qui/controls/Control',

], function (QUI, QUIControl, Hammer) {
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
            this.ListLength = false;

            this.addEvents({
                onImport: this.$onImport
            });

//            QUI.addEvent('resize', this.resize);
        },

        /**
         * event : on import
         */
        $onImport: function () {
            var self = this,
                Elm  = this.getElm();

            this.List = Elm.getElement(".basic-slider-images");
            this.ListLength = this.List.getElements('li').length;

            this.$change(2);
        },

        $change: function (slideNr) {

            console.log();

            var Slide = this.List.getElement('li:nth-child(' + slideNr + ')');

            var image = Slide.get('data-image');

        }
    });
});