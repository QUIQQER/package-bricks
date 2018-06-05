/**
 * @module package/quiqqer/bricks/bin/Controls/SimpleGoogleMaps
 * @author www.pcsg.de (Henning Leutz)
 */
define('package/quiqqer/bricks/bin/Controls/SimpleGoogleMaps', [

    'qui/QUI',
    'qui/controls/Control',
    'qui/controls/buttons/Button',
    'qui/controls/loader/Loader',
    'Locale'

], function (QUI, QUIControl, QUIButton, QUILoader, QUILocale) {
    "use strict";

    var lg = 'quiqqer/bricks';

    return new Class({

        Extends: QUIControl,
        Type   : 'package/quiqqer/bricks/bin/Controls/SimpleGoogleMaps',

        Binds: [
            'onIframeLoad'
        ],

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
            var self = this;

            this.Loader = new QUILoader({
                'type': 'ball-clip-rotate'
            });

            this.$Elm = this.getElm();
            this.MapWrapper = this.$Elm.getElement('.simpleGoogleMap');

            this.$Elm.setStyle('opacity', 0);
            this.MapWrapper.setStyle(
                'backgroundImage', 'url(' + this.$Elm.getAttribute('data-qui-imgUrl') + ')'
            );

            this.Loader.inject(this.MapWrapper);

            this.createElm().then(function () {
                self.showMapWrapper();
            });
        },

        /**
         * Create all needed elements
         *
         * @returns {Promise}
         */
        createElm: function () {
            var self = this;
            return new Promise(function (resolve) {
                self.Button = new Element('button', {
                    'class': 'btn btn-large btn-active-map',
                    html   : QUILocale.get(lg, 'brick.control.simplegooglemaps.frontend.buttonShow'),
                    events : {
                        click: function () {
                            self.Loader.show();

                            self.Button.destroy();
                            self.activeMaps();
                        }
                    }
                });

                self.Button.inject(self.MapWrapper);

                resolve();
            });
        },

        /**
         * Show map wrapper (it concerns only wrapper)
         *
         * @returns {Promise}
         */
        showMapWrapper: function () {
            var self = this;
            return new Promise(function (resolve) {
                moofx(self.$Elm).animate({
                    opacity: 1
                }, {
                    duration: 500,
                    callback: resolve
                });
            });
        },

        /**
         * Active Google Maps
         */
        activeMaps: function () {
            var self = this;

            this.Iframe = new Element('iframe', {
                'class': 'simpleGoogleMap-iframe',
                styles : {
                    opacity : 0,
                    position: 'absolute'
                },
                src    : this.$Elm.getAttribute('data-qui-url'),
                events : {
                    load: self.onIframeLoad
                }
            });

            this.Iframe.inject(this.MapWrapper);

        },

        /**
         * Perform this when iframe with Google Maps has been loaded
         */
        onIframeLoad: function () {
            var self = this;

            moofx(this.Iframe).animate({
                position: null,
                opacity : 1
            }, {
                callback: function () {
                    self.Loader.hide();
                }
            });
        }

    });
});

