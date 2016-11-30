/**
 * @module package/quiqqer/bricks/bin/Controls/Slider/Promoslider
 * @author www.pcsg.de (Henning Leutz)
 *
 * Promo Slider - Slider für eye catching Sachen
 *
 * @require qui/QUI
 * @require qui/controls/Control
 * @require URL_OPT_DIR + bin/hammerjs/hammer.min.js
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
            'next',
            'resize'
        ],

        options: {
            delay         : 5000,
            effectduration: 400,
            autostart     : true,
            touch         : true,
            shownavigation: true,

            pagefit         : false,
            pagefitcut      : 0,
            pagefitcutmobile: 0,

            'image-as-wallpaper'  : false,
            'wallpaper-position'  : 'center',
            'wallpaper-attachment': false,
            'navigation-position' : 'outer'
        },

        initialize: function (options) {
            this.parent(options);

            this.$mobile  = (QUI.getWindowSize().x <= 768);
            this.$running = false;
            this.$Touch   = null;
            this.$FX      = null;

            this.$desktopdots = [];
            this.$mobiledots  = [];
            this.$DotsDesktop = null;
            this.$DotsMobile  = null;

            this.addEvents({
                onImport: this.$onImport
            });

            QUI.addEvent('resize', this.resize);
        },

        /**
         * event : on import
         */
        $onImport: function () {
            var self = this,
                Elm  = this.getElm();

            var desktopSlides = Elm.getElements('.quiqqer-bricks-promoslider-slide'),
                mobileSlides  = Elm.getElements('.quiqqer-bricks-promoslider-slide-mobile-slide');

            this.$FX = moofx(Elm);

            // DOTS
            this.$DotsDesktop = Elm.getElement('.quiqqer-bricks-promoslider-slide-desktop-dots');
            this.$DotsMobile  = Elm.getElement('.quiqqer-bricks-promoslider-slide-mobile-dots');

            var click = function (event) {
                if (self.$Timer) {
                    clearInterval(self.$Timer);
                }

                self.show(event.target.get('data-no'));
            };


            desktopSlides.addEvent('click', function () {
                alert(1);
            });


            var i, len, Dot;

            for (i = 0, len = desktopSlides.length; i < len; i++) {
                Dot = new Element('div', {
                    'class'  : 'quiqqer-bricks-promoslider-dot',
                    'data-no': i,
                    events   : {
                        click: click
                    }
                });

                Dot.inject(this.$DotsDesktop);

                this.$desktopdots.push(Dot);
            }

            if (typeof this.$desktopdots[0] !== 'undefined') {
                this.$desktopdots[0].addClass(
                    'quiqqer-bricks-promoslider-dot-active'
                );
            }

            for (i = 0, len = mobileSlides.length; i < len; i++) {
                Dot = new Element('div', {
                    'class'  : 'quiqqer-bricks-promoslider-dot',
                    'data-no': i,
                    events   : {
                        click: click
                    }
                });

                Dot.inject(this.$DotsMobile);

                this.$mobiledots.push(Dot);
            }

            if (typeof this.$mobiledots[0] !== 'undefined') {
                this.$mobiledots[0].addClass(
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

            if (this.dotLength() <= 1 || !this.getAttribute('shownavigation')) {
                this.$DotsDesktop.setStyle('display', 'none');
                this.$DotsMobile.setStyle('display', 'none');
            }

            this.resize().then(function () {
                // periodical slide
                if (this.getAttribute('autostart')) {
                    this.start();
                }
            }.bind(this));
        },

        /**
         * resize the promoslider
         */
        resize: function () {
            return new Promise(function (resolve) {

                if (!this.getAttribute('pagefit')) {
                    return resolve();
                }

                var Prom    = Promise.resolve(1);
                var winSize = QUI.getWindowSize();
                var pagefit = this.getAttribute('pagefitcut');

                if (winSize.x <= 768 && this.$mobile === false ||
                    winSize.x > 768 && this.$mobile === true
                ) {
                    // view change
                    this.stop();
                    this.$running = false;
                    this.$mobile  = (winSize.x <= 768);

                    Prom = this.show(0);
                }

                this.$mobile = (winSize.x <= 768);

                if (this.$mobile) {
                    pagefit = this.getAttribute('pagefitcutmobile');
                }


                if (this.$FX) {
                    this.$FX.animate({
                        height: winSize.y - pagefit
                    }, {
                        callback: function () {
                            Prom.then(resolve);
                        }
                    });

                    return;
                }

                this.getElm().setStyles({
                    height: winSize.y - pagefit
                });

                Prom.then(resolve);

            }.bind(this));
        },

        /**
         * Start the autoslide
         */
        start: function () {
            if (this.dotLength() <= 1) {
                return;
            }

            this.stop();
            this.$Timer = (this.next).periodical(this.getAttribute('delay'));
        },

        /**
         * stop the autoslide
         */
        stop: function () {
            if (this.$Timer) {
                clearInterval(this.$Timer);
            }
        },

        /**
         * Show previous slide
         *
         * @return {Promise}
         */
        prev: function () {
            if (this.dotLength() <= 1) {
                return Promise.resolve();
            }

            var Elm     = this.getElm(),
                Current = null;

            if (this.$mobile) {
                Current = Elm.getElement(
                    '.quiqqer-bricks-promoslider-slide-mobile-slide:display(inline)'
                );
            } else {
                Current = Elm.getElement(
                    '.quiqqer-bricks-promoslider-slide:display(inline)'
                );
            }


            var slideNo = Current.get('data-no');

            slideNo--;

            if (slideNo < 0) {
                slideNo = Elm.getElements(
                        '.quiqqer-bricks-promoslider-slide'
                    ).length - 1;
            }

            return this.show(slideNo);
        },

        /**
         * Show next slide
         *
         * @return {Promise}
         */
        next: function () {
            if (this.dotLength() <= 1) {
                return Promise.resolve();
            }

            var Elm     = this.getElm(),
                slides  = [],
                Current = null;

            if (this.$mobile) {
                slides = Elm.getElements(
                    '.quiqqer-bricks-promoslider-slide-mobile-slide'
                );

                Current = Elm.getElement(
                    '.quiqqer-bricks-promoslider-slide-mobile-slide:display(inline)'
                );
            } else {
                slides = Elm.getElements(
                    '.quiqqer-bricks-promoslider-slide'
                );

                Current = Elm.getElement(
                    '.quiqqer-bricks-promoslider-slide:display(inline)'
                );
            }

            if (!Current) {
                this.show(0);
                return;
            }

            var slideNo = Current.get('data-no');

            if (slideNo >= slides.length - 1) {
                slideNo = 0;
            } else {
                slideNo++;
            }

            return this.show(slideNo);
        },

        /**
         * Shows wanted slide
         *
         * @param {Number} slideNo
         * @return {Promise}
         */
        show: function (slideNo) {
            if (this.$running) {
                return Promise.resolve();
            }

            if (this.dotLength() <= 1) {
                return Promise.resolve();
            }


            this.$running = true;
            this.$normalizeDots();

            if (this.$mobile) {
                if (typeof this.$mobiledots[slideNo] !== 'undefined') {
                    this.$mobiledots[slideNo].addClass(
                        'quiqqer-bricks-promoslider-dot-active'
                    );
                }
            } else {
                if (typeof this.$desktopdots[slideNo] !== 'undefined') {
                    this.$desktopdots[slideNo].addClass(
                        'quiqqer-bricks-promoslider-dot-active'
                    );
                }
            }


            return new Promise(function (resolve) {
                var cls, Current;

                if (this.$mobile) {
                    cls = '.quiqqer-bricks-promoslider-slide-mobile-sl' + slideNo;
                } else {
                    cls = '.quiqqer-bricks-promoslider-sl' + slideNo;
                }

                var Slide = this.getElm().getElement(cls);

                if (this.$mobile) {
                    if (typeof this.$mobiledots[slideNo] !== 'undefined') {
                        this.$mobiledots[slideNo].addClass(
                            'quiqqer-bricks-promoslider-dot-active'
                        );
                    }
                } else {
                    if (typeof this.$desktopdots[slideNo] !== 'undefined') {
                        this.$desktopdots[slideNo].addClass(
                            'quiqqer-bricks-promoslider-dot-active'
                        );
                    }
                }

                if (this.$mobile) {
                    Current = this.getElm().getElement(
                        '.quiqqer-bricks-promoslider-slide-mobile-slide:display(inline)'
                    );
                } else {
                    Current = this.getElm().getElement(
                        '.quiqqer-bricks-promoslider-slide:display(inline)'
                    );
                }

                this.$hideSheetToLeft(Current).then(function () {
                    return this.$showSheetFromRight(Slide);

                }.bind(this)).then(function () {
                    resolve();
                    this.$running = false;

                }.bind(this));

            }.bind(this));
        },

        /**
         * Normalize all dots, all active dots are inactive
         *
         * @returns {Promise}
         */
        $normalizeDots: function () {
            return new Promise(function (resolve) {
                var i, len;

                for (i = 0, len = this.$desktopdots.length; i < len; i++) {
                    this.$desktopdots[i].removeClass(
                        'quiqqer-bricks-promoslider-dot-active'
                    );
                }

                for (i = 0, len = this.$mobiledots.length; i < len; i++) {
                    this.$mobiledots[i].removeClass(
                        'quiqqer-bricks-promoslider-dot-active'
                    );
                }

                resolve();
            }.bind(this));
        },

        /**
         * Hide the sheet to the left
         *
         * @param {HTMLDivElement} Sheet
         * @return {Promise}
         */
        $hideSheetToLeft: function (Sheet) {
            var Image, Header, Text;

            if (this.$mobile) {
                Image  = Sheet.getElement('.quiqqer-bricks-promoslider-slide-mobile-image');
                Header = Sheet.getElement('.quiqqer-bricks-promoslider-slide-mobile-title');
                Text   = Sheet.getElement('.quiqqer-bricks-promoslider-slide-mobile-text');
            } else {
                Image  = Sheet.getElement('.quiqqer-bricks-promoslider-slide-image');
                Header = Sheet.getElement('.quiqqer-bricks-promoslider-slide-title');
                Text   = Sheet.getElement('.quiqqer-bricks-promoslider-slide-text');
            }

            return Promise.all([
                this.$hideToLeft(Image, 100),
                this.$hideToLeft(Header, 200),
                this.$hideToLeft(Text, 300)
            ]).then(function () {
                Sheet.setStyle('display', 'none');
            });
        },

        /**
         * Show the sheet from the right
         *
         * @param {HTMLDivElement} Sheet
         * @return {Promise}
         */
        $showSheetFromRight: function (Sheet) {
            var Image, Header, Text;

            if (this.$mobile) {
                Image  = Sheet.getElement('.quiqqer-bricks-promoslider-slide-mobile-image');
                Header = Sheet.getElement('.quiqqer-bricks-promoslider-slide-mobile-title');
                Text   = Sheet.getElement('.quiqqer-bricks-promoslider-slide-mobile-text');
            } else {
                Image  = Sheet.getElement('.quiqqer-bricks-promoslider-slide-image');
                Header = Sheet.getElement('.quiqqer-bricks-promoslider-slide-title');
                Text   = Sheet.getElement('.quiqqer-bricks-promoslider-slide-text');
            }

            if (Image) {
                Image.setStyle('opacity', 0);
            }

            if (Header) {
                Header.setStyle('opacity', 0);
            }

            if (Text) {
                Text.setStyle('opacity', 0);
            }

            Sheet.setStyle('display', 'inline');

            return Promise.all([
                this.$showFromRight(Image, 100),
                this.$showFromRight(Header, 200),
                this.$showFromRight(Text, 300)
            ]);
        },

        /**
         * Hide the node to the left
         *
         * @param {HTMLElement} Node
         * @param {Number} delay
         * @returns {Promise}
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
         * Show the node to the right
         *
         * @param {HTMLElement} Node
         * @param {Number} delay
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
        },

        /**
         * Length of the current dots / navigtation
         *
         * @returns {Number}
         */
        dotLength: function () {
            if (this.$mobile) {
                return this.$mobiledots.length;
            }

            return this.$desktopdots.length;
        }
    });
});
