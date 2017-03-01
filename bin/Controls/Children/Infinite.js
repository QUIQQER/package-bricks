/**
 * Children listing
 *
 * @module package/quiqqer/bricks/bin/Controls/Children/Infinite
 * @author www.pcsg.de (Henning Leutz)
 *
 * @require qui/QUI
 * @require qui/controls/Control
 * @require Ajax
 */
define('package/quiqqer/bricks/bin/Controls/Children/Infinite', [

    'qui/QUI',
    'qui/controls/Control',
    'Ajax'

], function (QUI, QUIControl, Ajax) {
    "use strict";

    return new Class({

        Extends: QUIControl,
        Type   : 'package/quiqqer/bricks/bin/Controls/Pagination',

        Binds: [
            '$onImport',
            'next'
        ],

        options: {
            childrenperrow: 4
        },

        initialize: function (options) {
            this.parent(options);

            this.$More   = null;
            this.$MoreFX = null;

            this.addEvents({
                onImport: this.$onImport
            });
        },

        /**
         * event : on import
         */
        $onImport: function () {
            var Elm = this.getElm();

            this.$More = Elm.getElement('.button');

            if (!this.$More) {
                return;
            }

            this.$More.addEvent('click', this.next);
            this.$More.removeClass('disabled');

            this.$MoreFX = moofx(this.$More);
        },

        /**
         * Show next row
         *
         * @return {Promise}
         */
        next: function () {
            return new Promise(function (resolve) {
                var self = this,
                    size = this.$More.getSize();

                this.$More.addClass('disabled');

                this.$MoreFX.animate({
                    color: 'transparent'
                }, {
                    duration: 250,
                    callback: function () {
                        self.$More.setStyles({
                            height  : size.y,
                            overflow: 'hidden',
                            width   : size.x
                        });

                        var oldButtonText = self.$More.get('text');

                        self.$More.set('html', '<span class="fa fa-spinner fa-spin"></span>');
                        self.$More.setStyle('color', null);
                        self.$More.addClass('loading');

                        self.$getNextChildren().then(function (result) {
                            var Container = new Element('div', {
                                html: result
                            });

                            var Rows = Container.getElements(
                                '.quiqqer-bricks-children-infinite-row'
                            );

                            // no results founds
                            // hide more button and do nothing
                            if (!Rows.length) {
                                self.$More.removeEvents('click');

                                moofx(self.$More).animate({
                                    cursor : 'default',
                                    opacity: 0
                                });

                                return;
                            }

                            Rows.setStyles({
                                'float' : 'left',
                                opacity : 0,
                                position: 'absolute',
                                overflow: 'hidden'
                            });

                            Rows.each(function (Row) {
                                Row.inject(self.$More, 'before');
                            });


                            var height = Rows[0].getSize().y;

                            Rows.setStyles({
                                height  : 0,
                                position: null
                            });

                            var childrenCount = Rows.getLast().getElements(
                                '.quiqqer-bricks-children-infinite-child'
                            ).length;

                            if (childrenCount < self.getAttribute('childrenperrow')) {
                                self.$More.removeEvents('click');

                                moofx(self.$More).animate({
                                    cursor : 'default',
                                    opacity: 0
                                });
                            }


                            moofx(Rows).animate({
                                height : height,
                                opacity: 1
                            }, {
                                duration: 250,
                                equation: 'cubic-bezier(.17,.67,.25,1.25)',
                                callback: function () {
                                    self.$More.set({
                                        html  : oldButtonText,
                                        styles: {
                                            width: null
                                        }
                                    });

                                    self.$More.removeClass('disabled');
                                    self.$More.removeClass('loading');

                                    new Fx.Scroll(window.document).start(
                                        0,
                                        Rows[0].getPosition().y - 200
                                    ).chain(function () {
                                        self.$More.focus();
                                        resolve();
                                    });
                                }
                            });
                        });
                    }
                });

            }.bind(this));
        },

        /**
         * Return the next children
         *
         * @return {Promise}
         */
        $getNextChildren: function () {
            return new Promise(function (resolve) {

                var Rows = this.getElm().getElements(
                    '.quiqqer-bricks-children-infinite-row'
                );

                Ajax.get('package_quiqqer_bricks_ajax_brick_infinite_row', resolve, {
                    'package': 'quiqqer/bricks',
                    brickId  : this.getElm().get('data-brickid'),
                    brickUID : this.getElm().get('data-brickuid'),
                    row      : Rows.length
                });

            }.bind(this));
        }
    });
});
