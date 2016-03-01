/**
 * @module package/quiqqer/bricks/bin/Controls/Slider/Promoslider
 * @author www.pcsg.de (Henning Leutz)
 *
 * @require qui/QUI
 * @require qui/controls/Control
 * @require qui/utils/Functions
 */
define('package/quiqqer/bricks/bin/Controls/Slider/Promoslider', [

    'qui/QUI',
    'qui/controls/Control',
    URL_OPT_DIR + 'bin/hammerjs/hammer.min.js'

], function (QUI, QUIControl, Hammer) {
    "use strict";

    // custome select
    // eq: getElements( 'input:display(inline)' )
    Slick.definePseudo('display', function (value) {
        return Element.getStyle(this, 'display') == value;
    });

    return new Class({

        Extends: QUIControl,
        Type   : 'package/quiqqer/bricks/bin/Controls/Slider/Promoslider',

        Binds: [
            '$onImport',
            'prev',
            'next'
        ],

        options: {
            delay         : 5000,
            effectduration: 400,
            autostart     : true,
            touch         : true
        },

        initialize: function (options) {
            this.parent(options);

            this.$dots    = [];
            this.$running = false;

            this.$Touch = null;

            this.addEvents({
                onImport: this.$onImport
            });
        },

        /**
         * event : on import
         */
        $onImport: function () {
            var self   = this,
                Elm    = this.getElm(),
                slides = Elm.getElements('.quiqqer-bricks-promoslider-slide');

            var Dots = new Element('div', {
                'class': 'quiqqer-bricks-promoslider-dots'
            }).inject(Elm);

            var click = function (event) {
                if (self.$Timer) {
                    clearInterval(self.$Timer);
                }

                self.show(event.target.get('data-no'));
            };

            var i, len, Dot;

            for (i = 0, len = slides.length; i < len; i++) {

                Dot = new Element('div', {
                    'class'  : 'quiqqer-bricks-promoslider-dot',
                    'data-no': i,
                    events   : {
                        click: click
                    }
                });

                Dot.inject(Dots);

                this.$dots.push(Dot);
            }

            if (typeof this.$dots[0] !== 'undefined') {
                this.$dots[0].addClass(
                    'quiqqer-bricks-promoslider-dot-active'
                );
            }

            // keyboard events
            document.addEvent('keyup', function (event) {
                if (event.key == 'left') {
                    self.prev();
                    return;
                }

                self.next();
            });

            // touch events
            if (this.getAttribute('touch')) {
                this.$Touch = new Hammer(this.getElm());

                this.$Touch.on('swipe', function (ev) {
                    if (ev.offsetDirection == 4) {
                        self.prev();
                        return;
                    }

                    if (ev.offsetDirection == 2) {
                        self.next();
                    }
                });
            }


            // periodical slide
            if (this.getAttribute('autostart')) {
                this.$Timer = (this.next).periodical(this.getAttribute('delay'));
            }
        },

        /**
         * Show previous slide
         */
        prev: function () {
            var Elm     = this.getElm(),
                Current = Elm.getElement('.quiqqer-bricks-promoslider-slide:display(inline)');

            var slideNo = Current.get('data-no');

            slideNo--;

            if (slideNo < 0) {
                slideNo = Elm.getElements(
                        '.quiqqer-bricks-promoslider-slide'
                    ).length - 1;
            }

            this.show(slideNo);
        },

        /**
         * Show next slide
         */
        next: function () {
            var Elm     = this.getElm(),
                slides  = Elm.getElements('.quiqqer-bricks-promoslider-slide'),
                Current = Elm.getElement('.quiqqer-bricks-promoslider-slide:display(inline)');

            var slideNo = Current.get('data-no');

            if (slideNo >= slides.length - 1) {
                slideNo = 0;
            } else {
                slideNo++;
            }

            this.show(slideNo);
        },

        /**
         * Shows wanted slide
         *
         * @param {Number} slideNo
         */
        show: function (slideNo) {
            if (this.$running) {
                return Promise.resolve();
            }

            this.$running = true;
            this.$normalizeDots();

            if (typeof this.$dots[slideNo] !== 'undefined') {
                this.$dots[slideNo].addClass(
                    'quiqqer-bricks-promoslider-dot-active'
                );
            }


            return new Promise(function (resolve) {

                var self  = this,
                    cls   = '.quiqqer-bricks-promoslider-sl' + slideNo,
                    Slide = this.getElm().getElement(cls);

                if (typeof this.$dots[slideNo] !== 'undefined') {
                    this.$dots[slideNo].addClass(
                        'quiqqer-bricks-promoslider-dot-active'
                    );
                }

                var Current = this.getElm().getElement(
                    '.quiqqer-bricks-promoslider-slide:display(inline)'
                );

                Promise.all([
                    self.$hideSheetToLeft(Current),
                    self.$showSheetFromRight(Slide)
                ]).then(function () {

                    resolve();
                    this.$running = false;

                }.bind(this));

            }.bind(this));
        },

        /**
         *
         * @returns {Promise}
         */
        $normalizeDots: function () {
            return new Promise(function (resolve) {
                for (var i = 0, len = this.$dots.length; i < len; i++) {
                    this.$dots[i].removeClass(
                        'quiqqer-bricks-promoslider-dot-active'
                    );
                }

                resolve();
            }.bind(this));
        },

        /**
         *
         * @param {HTMLDivElement} Sheet
         * @return {Promise}
         */
        $hideSheetToLeft: function (Sheet) {
            var Image  = Sheet.getElement('.quiqqer-bricks-promoslider-slide-image');
            var Header = Sheet.getElement('.quiqqer-bricks-promoslider-slide-title');
            var Text   = Sheet.getElement('.quiqqer-bricks-promoslider-slide-text');

            return Promise.all([
                this.$hideToLeft(Image, 100),
                this.$hideToLeft(Header, 200),
                this.$hideToLeft(Text, 300)
            ]).then(function () {
                Sheet.setStyle('display', 'none');
            });
        },

        /**
         *
         * @param {HTMLDivElement} Sheet
         * @return {Promise}
         */
        $showSheetFromRight: function (Sheet) {
            var Image  = Sheet.getElement('.quiqqer-bricks-promoslider-slide-image');
            var Header = Sheet.getElement('.quiqqer-bricks-promoslider-slide-title');
            var Text   = Sheet.getElement('.quiqqer-bricks-promoslider-slide-text');

            Image.setStyle('opacity', 0);
            Header.setStyle('opacity', 0);
            Text.setStyle('opacity', 0);

            Sheet.setStyle('display', 'inline');

            return Promise.all([
                this.$showFromRight(Image, 100),
                this.$showFromRight(Header, 200),
                this.$showFromRight(Text, 300)
            ]);
        },

        /**
         *
         * @param Node
         * @param delay
         * @returns {*}
         */
        $hideToLeft: function (Node, delay) {
            delay = delay || 100;

            if (!Node) {
                return Promise.resolve();
            }

            var effectduration = this.getAttribute('effectduration');

            return new Promise(function (resolve) {
                (function () {
                    if (Node.getStyle('position') == 'absolute') {
                        var oldPos = Node.getStyle('left').toInt();

                        moofx(Node).animate({
                            left   : oldPos - 50,
                            opacity: 0
                        }, {
                            duration: effectduration,
                            callback: function () {
                                Node.setStyle('left', oldPos);
                                resolve();
                            }
                        });

                        return;
                    }

                    moofx(Node).animate({
                        marginLeft: -50,
                        opacity   : 0
                    }, {
                        duration: effectduration,
                        callback: function () {
                            Node.setStyle('marginLeft', null);
                            resolve();
                        }
                    });

                }).delay(delay);
            });
        },

        /**
         *
         * @param Node
         * @param delay
         * @returns {Promise}
         */
        $showFromRight: function (Node, delay) {
            delay = delay || 100;

            if (!Node) {
                return Promise.resolve();
            }

            var effectduration = this.getAttribute('effectduration');

            return new Promise(function (resolve) {
                (function () {
                    if (Node.getStyle('position') == 'absolute') {
                        var origLeft = Node.getStyle('left').toInt();

                        Node.setStyle('left', origLeft + 50);

                        moofx(Node).animate({
                            left   : origLeft,
                            opacity: 1
                        }, {
                            duration: effectduration,
                            callback: resolve
                        });

                        return;
                    }

                    Node.setStyle('marginLeft', 50);

                    moofx(Node).animate({
                        marginLeft: 0,
                        opacity   : 1
                    }, {
                        duration: effectduration,
                        callback: resolve
                    });

                }).delay(delay);
            });
        }
    });
});
