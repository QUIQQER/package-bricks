/**
 * @module package/quiqqer/bricks/bin/Controls/Slider/PromosliderWallpaper
 * @author www.pcsg.de (Henning Leutz)
 *
 * Wallpaper Slider
 *
 * @require qui/QUI
 * @require qui/controls/Control
 */
define('package/quiqqer/bricks/bin/Controls/Slider/PromosliderWallpaper', [

    'qui/QUI',
    'qui/controls/Control'

], function (QUI, QUIControl) {
    "use strict";

    return new Class({

        Extends: QUIControl,
        Type   : 'package/quiqqer/bricks/bin/Controls/Slider/PromosliderWallpaper',

        Binds: [
            'onResize',
            '$onImport',
            '$checkdotPosition',
            'next',
            'previous',
            'show',
            '$onWindowResize'
        ],

        options: {
            autostart     : true,
            delay         : 5000,
            shownavigation: true,
            shownarrows   : true,

            height          : false,
            pagefit         : false,
            pagefitcut      : 0,
            pagefitcutmobile: 0
        },

        initialize: function (options) {
            this.parent(options);

            this.$Container = null;
            this.$Next      = null;
            this.$Previous  = null;
            this.$Dots      = null;
            this.$List      = null;

            this.$width     = 0;
            this.$maxScroll = 0;
            this.$scrolling = false;
            this.$mobile    = (QUI.getWindowSize().x <= 768);

            this.$childrenCount     = 0;
            this.$scrollOnMouseMove = false;
            this.$orientation       = false; // landscape / portrait

            this.addEvents({
                onImport : this.$onImport,
                onDestroy: function () {
                    QUI.removeEvent('resize', this.$onWindowResize);
                }.bind(this)
            });

            QUI.addEvent('resize', this.$onWindowResize);
        },

        /**
         * event : on import
         */
        $onImport: function () {
            var i, len;
            var Elm = this.getElm();

            this.$width = Elm.getSize().x;

            this.$Container = Elm.getElement('.quiqqer-bricks-promoslider-wallpaper-container');
            this.$Next      = Elm.getElement('.quiqqer-bricks-promoslider-wallpaper-next');
            this.$Previous  = Elm.getElement('.quiqqer-bricks-promoslider-wallpaper-prev');
            this.$Dots      = Elm.getElement('.quiqqer-bricks-promoslider-wallpaper-dots');
            this.$List      = this.$setCurrentSlideList();

            this.$Scroll = moofx(this.$List, {
                duration: 250
            });

            // create dots
            this.$refreshDots();
            this.$calcMaxScroll();

            // focus helper
            this.$Container.set('tabindex', -1);

            // dragable scroll
            var startScroll    = 0,
                lastScrollLeft = 0,
                lastClientX    = 0,
                musewheelRuns  = false;

            this.$Container.addEvents({
                touchstart: function (event) {
                    if (this.$childrenCount <= 1) {
                        return;
                    }

                    var Target = event.target;

                    if (Target.hasClass('quiqqer-bricks-promoslider-wallpaper-next') ||
                        Target.hasClass('quiqqer-bricks-promoslider-wallpaper-prev')) {
                        return;
                    }

                    if (Target.getParent('.quiqqer-bricks-promoslider-wallpaper-next') ||
                        Target.getParent('.quiqqer-bricks-promoslider-wallpaper-prev')) {
                        return;
                    }

                    this.$scrolling = true;

                    startScroll    = event.page.x;
                    lastScrollLeft = this.$getYPosition() * -1;

                    var transition = 'all 0s';

                    this.$List.setStyles({
                        "-webkit-transition": transition,
                        "-moz-transition"   : transition,
                        "-o-transition"     : transition,
                        "-ms-transition"    : transition,
                        transition          : transition
                    });

                    this.stop();
                }.bind(this),

                mousedown: function (event) {
                    this.$Container.fireEvent('touchstart', [event]);
                    event.stop();
                }.bind(this),

                mousewheel: function (event) {
                    if (musewheelRuns) {
                        return;
                    }

                    if (event.event.wheelDeltaX <= -10) {
                        musewheelRuns = true;
                        event.stop();
                        this.$scrollOnMouseMove = false;
                        this.$scrolling         = true;
                        this.stop();
                        this.next().then(function () {
                            musewheelRuns = false;
                        });
                    }

                    if (event.event.wheelDeltaX >= 10) {
                        musewheelRuns = true;

                        event.stop();
                        this.$scrollOnMouseMove = false;
                        this.$scrolling         = true;
                        this.stop();
                        this.previous().then(function () {
                            musewheelRuns = false;
                        });
                    }
                }.bind(this),

                keyup: function (event) {
                    if (event.key === 'left') {
                        event.stop();
                        this.$scrolling         = true;
                        this.$scrollOnMouseMove = false;

                        this.previous().then(function () {
                            this.$scrolling = false;
                        }.bind(this));

                        return;
                    }

                    if (event.key === 'right') {
                        event.stop();
                        this.$scrolling         = true;
                        this.$scrollOnMouseMove = false;

                        this.next().then(function () {
                            this.$scrolling = false;
                        }.bind(this));
                    }
                }.bind(this)
            });

            document.body.addEvents({
                touchend: function (event) {
                    if (!this.$scrolling) {
                        return;
                    }

                    if (this.$childrenCount <= 1) {
                        return;
                    }

                    var Target = event.target;

                    if (Target.hasClass('quiqqer-bricks-promoslider-wallpaper-next') ||
                        Target.hasClass('quiqqer-bricks-promoslider-wallpaper-prev')) {
                        return;
                    }

                    if (Target.getParent('.quiqqer-bricks-promoslider-wallpaper-next') ||
                        Target.getParent('.quiqqer-bricks-promoslider-wallpaper-prev')) {
                        return;
                    }

                    event.stop();

                    this.$scrolling         = false;
                    this.$scrollOnMouseMove = false;

                    lastClientX = 0;

                    var currentSlide = Math.round(lastScrollLeft / this.$width);

                    if ("changedTouches" in event) {
                        lastClientX = event.changedTouches[0].pageX;
                    } else if ("page" in event) {
                        lastClientX = event.page.x;
                    }

                    var diff = Math.abs(startScroll - lastClientX);

                    if (diff <= 5) {
                        // click event
                        var Li = this.$List.getElement('li:nth-child(' + parseInt(currentSlide + 1) + ')');

                        if (Li.get('data-url') && Li.get('data-url') !== '') {
                            window.location = Li.get('data-url');
                            return;
                        }
                    }

                    if (diff < 50) {
                        this.show(currentSlide);
                        return;
                    }

                    // previous
                    if (startScroll < lastClientX) {
                        this.show(currentSlide - 1);
                        return;
                    }

                    // next
                    this.show(currentSlide + 1);
                }.bind(this),

                touchmove: function (event) {
                    if (!this.$scrolling) {
                        return;
                    }

                    if (this.$childrenCount <= 1) {
                        return;
                    }

                    var diff  = event.page.x - startScroll;
                    var value = Math.round(-lastScrollLeft + diff);

                    if (Math.abs(diff) < 10) {
                        return;
                    }

                    var transform = 'translate3d(' + value + 'px, 0, 0)';

                    this.$List.setStyles({
                        "-webkit-transform": transform,
                        "-moz-transform"   : transform,
                        "-o-transform"     : transform,
                        "-ms-transform"    : transform,
                        transform          : transform
                    });
                }.bind(this),

                mouseup: function (event) {
                    if (startScroll == event.page.x) {
                        return;
                    }
                    document.body.fireEvent('touchend', [event]);
                }.bind(this),

                mousemove: function (event) {
                    if (this.$scrollOnMouseMove) {
                        document.body.fireEvent('touchmove', event);
                    }
                }.bind(this)
            });

            // click events
            this.$Container.getElements("li[data-url]").each(function (LiElement) {
                if (LiElement.get('data-url') === '') {
                    return;
                }

                LiElement.setStyle('cursor', 'pointer');
                LiElement.addEvent('click', function () {
                    window.location = this.get('data-url');
                });
            });


            // navigation
            if (this.$Next) {
                this.$Next.addEvent('click', function (event) {
                    event.stop();
                    this.$scrollOnMouseMove = false;
                    this.$scrolling         = true;
                    this.stop();
                    this.next();
                }.bind(this));
            }

            if (this.$Previous) {
                this.$Previous.addEvent('click', function (event) {
                    event.stop();
                    this.$scrollOnMouseMove = false;
                    this.$scrolling         = true;
                    this.stop();
                    this.previous();
                }.bind(this));
            }

            this.onResize();

            if (!!('ontouchstart' in window)) {
                // bei mobilen geräten die bilder und slides laden
                var lis = this.$List.getElements('li');

                for (i = 1, len = lis.length; i < len; i++) {
                    this.$showSheet(i);
                }
            }

            // select first dot
            this.$checkdotPosition();

            // autostart
            if (this.getAttribute('autostart')) {
                this.start();
            }
        },

        /**
         * event : on window resize
         */
        $onWindowResize: function () {
            if (!this.getElm()) {
                return;
            }

            var oldMobileStatus = this.$mobile;

            this.$width  = this.getElm().getSize().x;
            this.$mobile = (QUI.getWindowSize().x <= 768);

            if (oldMobileStatus != this.$mobile) {
                // mobile desktop switched
                this.$setCurrentSlideList();
                this.$refreshDots();
            }

            this.$calcMaxScroll();
            this.onResize();
        },

        /**
         * on resize, checks the sizes of the control
         *
         * @returns {Promise}
         */
        onResize: function () {
            var orientation     = this.$orientation,
                newOritentation = this.$getOrientation();

            if (this.getAttribute('pagefit') && orientation != newOritentation) {
                var winSize = QUI.getWindowSize();
                var pagefit = this.getAttribute('pagefitcut');

                if (this.$mobile) {
                    pagefit = this.getAttribute('pagefitcutmobile');
                }

                this.$Elm.setStyle('height', winSize.y - pagefit);
            } else if (this.getAttribute('height')) {
                this.$Elm.setStyle('height', this.getAttribute('height'));
            }

            this.$orientation = newOritentation;

            // set the sheet to the right place
            return new Promise(function (resolve) {
                if (this.$scrolling) {
                    return resolve();
                }

                var left = this.$List.getBoundingClientRect().left * -1;

                if (left === 0) {
                    return resolve();
                }

                var mod = this.$width % left;

                if (!mod) {
                    return resolve();
                }

                var half = this.$width / 2;
                var next = left + half - (left + half) % this.$width;

                this.show(Math.round(next / this.$width)).then(resolve);
            }.bind(this));
        },

        /**
         * Return the slides - li domnodes
         *
         * @returns {Array}
         */
        getSlides: function () {
            return this.$List.getElements('li');
        },

        /**
         * Start the autoslide
         */
        start: function () {
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
         * Shows the next slide
         *
         * @return {Promise}
         */
        next: function () {
            var left = this.$List.getBoundingClientRect().left * -1;

            var slideNo = Math.round(
                (left + this.$width) / this.$width
            );

            return this.show(slideNo);
        },

        /**
         * Shows the previous slide
         *
         * @return {Promise}
         */
        previous: function () {
            var left = this.$List.getBoundingClientRect().left * -1;

            var slideNo = Math.round(
                (left - this.$width) / this.$width
            );

            return this.show(slideNo);
        },

        /**
         * Show a specific slide
         *
         * @param {Number} slideNo
         * @return {Promise}
         */
        show: function (slideNo) {
            return new Promise(function (resolve) {
                this.$scrolling = true;

                if (slideNo < 0) {
                    // go to the last
                    return this.show(this.$childrenCount - 1).then(resolve);
                }

                var left     = this.$List.getBoundingClientRect().left,
                    scrollTo = slideNo * this.$width * -1;

                if (left == scrollTo) {
                    this.$scrolling = false;
                    resolve();
                    return;
                }

                if (-scrollTo > this.$maxScroll) {
                    // go to the first
                    return this.show(0).then(resolve);
                }

                this.$showSheet(slideNo);

                var duration = 400;

                if (this.$mobile) {
                    duration = 200;
                }

                var transduration = Math.round(duration * 10 / 10) / 1000;
                var transform     = 'translate3d(' + scrollTo + 'px, 0, 0)';
                var transition    = 'all ' + transduration + 's ease-out 0s';

                this.$List.setStyles({
                    "-webkit-transition": transition,
                    "-moz-transition"   : transition,
                    "-o-transition"     : transition,
                    "-ms-transition"    : transition,
                    transition          : transition,

                    "-webkit-transform": transform,
                    "-moz-transform"   : transform,
                    "-o-transform"     : transform,
                    "-ms-transform"    : transform,
                    transform          : transform
                });

                (function () {
                    this.$scrolling = false;
                    this.$checkdotPosition();
                    resolve();
                }).delay(duration, this);

            }.bind(this));
        },

        /**
         * shows the correct dot
         */
        $checkdotPosition: function () {
            var left  = this.$List.getBoundingClientRect().left * -1;
            var count = Math.round(left / this.$width);
            var Dot   = this.$Dots.getElement(':nth-child(' + (count + 1) + ')');

            if (!Dot || Dot.hasClass('quiqqer-bricks-promoslider-wallpaper-dot-active')) {
                return;
            }

            this.$Dots
                .getElements('.quiqqer-bricks-promoslider-wallpaper-dot')
                .removeClass('quiqqer-bricks-promoslider-wallpaper-dot-active');

            Dot.addClass('quiqqer-bricks-promoslider-wallpaper-dot-active');
        },

        /**
         * looks if the sheet is visible and the background is loaded
         */
        $showSheet: function (slideNo) {
            var liCount = parseInt(slideNo) + 1;
            var Slide   = this.$List.getElement('li:nth-child(' + liCount + ')');

            if (!Slide) {
                return;
            }

            var Background = Slide.getElement('.quiqqer-bricks-promoslider-wallpaper-image');
            var display    = Background.getStyle('display');

            if (display !== 'none') {
                return;
            }

            Background.setStyle('opacity', 0);
            Background.setStyle('display', null);

            var image = Background.getStyle('background-image').slice(4, -1).replace(/"/g, "");

            require(['image!' + image], function () {
                // loaded
                moofx(Background).animate({
                    opacity: 1
                });
            }, function () {
            });
        },

        /**
         * Return the position of the list
         *
         * @returns {Number}
         */
        $getYPosition: function () {
            if (!this.$List) {
                return 0;
            }

            var transform = this.$List.getStyle('transform');

            if (!transform.match('translate3d')) {
                return 0;
            }

            transform = transform.replace('translate3d(', '').split(',');

            return parseInt(transform[0]);
        },

        /**
         * calculat the max scroll
         */
        $calcMaxScroll: function () {
            var liList = this.$List.getElements('li');

            this.$childrenCount = liList.length;

            if (!liList.length) {
                this.$maxScroll = 0;
                return;
            }

            this.$maxScroll = liList[liList.length - 1].getPosition(this.$List).x;
        },

        /**
         * Return the current orientation
         *
         * @return {String} - landscape, portrait
         */
        $getOrientation: function () {
            var size = QUI.getWindowSize();

            return size.x > size.y ? 'landscape' : 'portrait';
        },

        /**
         * Return the current ul list, mobile  or desktop list
         *
         * @returns {null|*}
         */
        $setCurrentSlideList: function () {
            if (this.$mobile) {
                // mobile list
                this.$List = this.getElm().getElement('ul.hide-on-desktop');
            } else {
                // dekstop list
                this.$List = this.getElm().getElement('ul.hide-on-mobile');
            }

            return this.$List;
        },

        /**
         * Refresh the dot display
         */
        $refreshDots: function () {
            this.$Dots.set('html', '');

            var liList = this.$List.getElements('li');

            if (liList.length > 1 && this.getAttribute('shownavigation')) {
                var dotClick = function (event) {
                    event.stop();
                    this.show(event.target.get('data-index'));
                }.bind(this);

                for (var i = 0, len = liList.length; i < len; i++) {
                    new Element('span', {
                        'class'     : 'quiqqer-bricks-promoslider-wallpaper-dot',
                        'data-index': i,
                        events      : {
                            click: dotClick
                        }
                    }).inject(this.$Dots);
                }
            }

            this.$childrenCount = liList.length;
        }
    });
});