/**
 * Ajax pagination
 * Pagination js control for \QUI\Bricks\Controls\Pagination
 *
 * @module package/quiqqer/bricks/bin/Controls/Pagination
 * @author www.pcsg.de (Henning Leutz)
 *
 * @require qui/QUI
 * @require qui/controls/Control
 * @require qui/utils/String
 */
define('package/quiqqer/bricks/bin/Controls/Pagination', [

    'qui/QUI',
    'qui/controls/Control',
    'qui/utils/String',
    'Locale'

], function (QUI, QUIControl, QUIStringUtils, QUILocale) {
    "use strict";

    return new Class({

        Extends: QUIControl,
        Type   : 'package/quiqqer/bricks/bin/Controls/Pagination',

        Binds: [
            '$onImport',
            '$onMouseOver',
            '$linkclick',
            '$redraw'
        ],

        initialize: function (options) {
            this.parent(options);

            this.$Current = null;
            this.$Select  = null;

            this.$Prev    = null;
            this.$Next    = null;
            this.$First   = null;
            this.$Last    = null;
            this.$sheets  = [];
            this.$showMax = 10;

            this.$MorePrev = null;
            this.$MoreNext = null;

            this.$lastSheetNumber = 0;

            this.addEvents({
                onImport: this.$onImport
            });

            QUI.addEvent('resize', function () {
                this.$redraw(true);
            }.bind(this));
        },

        /**
         * event : on import
         */
        $onImport: function () {
            var i;

            this.$Container = this.$Elm.getElement('.quiqqer-sheets-desktop');
            this.$First     = this.$Elm.getElement('.quiqqer-sheets-first');
            this.$Prev      = this.$Elm.getElement('.quiqqer-sheets-prev');
            this.$Last      = this.$Elm.getElement('.quiqqer-sheets-last');
            this.$Next      = this.$Elm.getElement('.quiqqer-sheets-next');
            this.$Select    = this.$Elm.getElement('.quiqqer-sheets-mobile select');

            this.$Current = this.$Elm.getElement(
                '.quiqqer-sheets-desktop-current'
            );

            this.$sheets = this.$Elm.getElements('.quiqqer-sheets-sheet');

            var params = QUIStringUtils.getUrlParams(this.$Last.get('href'));

            if (this.$sheets[0]) {
                var Start    = this.$sheets[0],
                    dataPage = Start.get('data-page').toInt();

                for (i = 1; i < dataPage; i++) {
                    new Element('a', {
                        html       : i,
                        href       : '?sheet=' + i + '&limit=' + params.limit,
                        'class'    : 'quiqqer-sheets-sheet',
                        'data-page': i,
                        styles     : {
                            display: 'none'
                        }
                    }).inject(Start, 'before');
                }
            }

            if ("sheet" in params) {
                this.$lastSheetNumber = params.sheet;
            }

            this.$MorePrev = this.$Prev.getNext();
            this.$MoreNext = this.$Next.getPrevious();

            if (!this.$MorePrev.hasClass('more')) {
                this.$MorePrev = new Element('span', {
                    html   : '...',
                    'class': 'more',
                    styles : {
                        display: 'none'
                    }
                }).inject(this.$Prev, 'after');
            }

            if (!this.$MoreNext.hasClass('more')) {
                this.$MoreNext = new Element('span', {
                    html   : '...',
                    'class': 'more',
                    styles : {
                        display: 'none'
                    }
                }).inject(this.$Next, 'before');
            }

            var LastSheet = this.$sheets[this.$sheets.length - 1];

            if (LastSheet) {
                var last = LastSheet.get('data-page').toInt();

                for (i = last + 1; i < this.$lastSheetNumber; i++) {
                    new Element('a', {
                        html       : i,
                        href       : '?sheet=' + i + '&limit=' + params.limit,
                        'class'    : 'quiqqer-sheets-sheet',
                        'data-page': i,
                        styles     : {
                            display: 'none'
                        }
                    }).inject(this.$MoreNext, 'before');
                }

                var lastSize = LastSheet.getSize().x;

                this.$sheets = this.$Elm.getElements('.quiqqer-sheets-sheet');

                this.$sheets.each(function (Sheet) {
                    Sheet.setStyle('width', lastSize);
                });

                this.$MorePrev.setStyle('width', lastSize);
                this.$MoreNext.setStyle('width', lastSize);
                this.$Prev.setStyle('width', lastSize);
                this.$Next.setStyle('width', lastSize);
                this.$First.setStyle('width', lastSize);
                this.$Last.setStyle('width', lastSize);
            }

            this.$redraw();
            this.$registerEvents();

            moofx(this.$Container).animate({
                opacity: 1
            }, {
                duration: 200
            });
        },

        /**
         * Set the number of the pagination
         * refresh the display
         *
         * @param {Number} pages
         */
        setPageCount: function (pages) {
            if (this.$sheets.length === pages) {
                return;
            }

            var Prev;

            if (this.$sheets.length) {
                Prev = this.$sheets[0].getPrevious();
            } else {
                Prev = this.$Elm.getElement('a.quiqqer-sheets-prev');
            }

            this.$sheets.destroy();
            this.$Select.set('html', '');

            for (var i = 1; i <= pages; i++) {
                Prev = new Element('a', {
                    href       : window.location.pathname,
                    html       : i,
                    'data-page': i,
                    'class'    : 'quiqqer-sheets-sheet',
                    events     : {
                        click: this.$linkclick
                    }
                }).inject(Prev, 'after');

                new Element('option', {
                        value      : window.location.pathname,
                        html       : QUILocale.get(
                            "quiqqer/bricks",
                            "controls.pagination.mobile.option", {
                                from: i,
                                max : pages
                            }
                        ),
                        'data-page': i
                    }
                ).inject(this.$Select);
            }

            this.$sheets = this.$Elm.getElements('.quiqqer-sheets-sheet');
            this.openPage(0);
        },

        /**
         * register all js events
         */
        $registerEvents: function () {
            var self      = this,
                aElms     = this.$Elm.getElements('a'),
                limitElms = this.$Elm.getElements('.quiqqer-sheets-desktop-limits a');

            aElms.addEvent('click', this.$linkclick);

            limitElms.addEvent('click', function (event) {
                event.stop();

                var Sheet = self.$Current,
                    Query = QUIStringUtils.getUrlParams(Sheet.search);

                Query.limit = event.target.getProperty('data-limit');

                self.fireEvent('change', [self, Sheet, Query]);
                self.fireEvent('changeLimit', [Query.limit]);
            });

            // mobile select
            this.$Select.set('onchange', null);

            this.$Select.addEvent('change', function (event) {
                event.stop();

                var Query = QUIStringUtils.getUrlParams(this.value);

                self.fireEvent('change', [self, this, Query]);
            });
        }
        ,

        /**
         * link / page click
         *
         * @param {DOMEvent} event
         */
        $linkclick: function (event) {
            event.stop();

            var Target = event.target;

            if (Target.hasClass('quiqqer-sheets-first')) {
                this.first();

            } else if (Target.hasClass('quiqqer-sheets-last')) {
                this.last();

            } else if (Target.hasClass('quiqqer-sheets-prev')) {
                this.prev();

            } else if (Target.hasClass('quiqqer-sheets-next')) {
                this.next();

            } else {

                this.openPage(parseInt(Target.get('data-page') - 1));
            }
        }
        ,

        /**
         * Open page number and trigger the change event when it is necessary
         *
         * @param {Number} no - page number
         * @fire change [this, Sheet, query]
         */
        openPage: function (no) {
            if (typeof this.$sheets[no] === 'undefined') {
                return;
            }

            var Sheet = this.$sheets[no];
            var query = QUIStringUtils.getUrlParams(Sheet.search);

            if (this.$Current === Sheet) {
                return;
            }

            query.sheet = Sheet.get('data-page');

            this.setPage(no);
            this.fireEvent('change', [this, Sheet, query]);
        }
        ,

        /**
         * Open page number and does not trigger the change event
         *
         * @param {Number} no - page number
         */
        setPage: function (no) {
            if (typeof this.$sheets[no] === 'undefined') {
                return;
            }

            var Sheet = this.$sheets[no];

            if (this.$Current === Sheet) {
                return;
            }

            if (this.$Current) {
                this.$Current.removeClass('quiqqer-sheets-desktop-current');
            }

            this.$Current = Sheet;
            this.$Current.addClass('quiqqer-sheets-desktop-current');

            this.$First.removeClass('quiqqer-sheets-desktop-disabled');
            this.$Prev.removeClass('quiqqer-sheets-desktop-disabled');
            this.$Last.removeClass('quiqqer-sheets-desktop-disabled');
            this.$Next.removeClass('quiqqer-sheets-desktop-disabled');

            // repaint if next sheet is in the hidden last
            this.$redraw();
        }
        ,

        /**
         * Go to the next page
         */
        next: function () {
            if (!this.$Current) {
                this.first();
                return;
            }

            var currentPage = this.$Current.get('data-page');

            if (currentPage < this.$sheets.length) {
                this.openPage(currentPage);
            }
        }
        ,

        /**
         * Go to the previous page
         */
        prev: function () {
            if (!this.$Current) {
                this.first();
                return;
            }

            var currentPage = this.$Current.get('data-page');

            if (currentPage - 2) {
                this.openPage(currentPage - 2);
                return;
            }

            this.first();
        }
        ,

        /**
         * Go to the first page
         */
        first: function () {
            this.openPage(0);
        }
        ,

        /**
         * Go to the last page
         */
        last: function () {
            this.openPage(this.$sheets.length - 1);
        }
        ,

        /**
         * new draw aff the pagination
         */
        $redraw: function () {
            var elmSize = this.$Container.getSize();

            if (!this.$sheets.length) {
                return;
            }

            var len     = this.$sheets.length,
                current = 0;

            if (this.$Current) {
                current = this.$Current.get('data-page').toInt();
            }

            // we must calc the max sheets
            // calc with last sheets, its the longest
            var lastSize = this.$Last.getSize().x;

            lastSize = lastSize +
                this.$Last.getStyle('marginRight').toInt() +
                this.$Last.getStyle('marginLeft').toInt();

            this.$showMax = (elmSize.x / lastSize).floor();

            if (current == 1) {
                this.$showMax = this.$showMax - 5;
            } else {
                this.$showMax = this.$showMax - 6;
            }

            var leftRight = (this.$showMax / 2).floor(),
                start     = current - leftRight,
                end       = current + leftRight;

            if (this.$showMax != end - start) {
                start = start - (this.$showMax - (end - start));
            }


            if (start <= 0) {
                start = -1;
                end   = this.$showMax;
            }

            if (end >= len) {
                end = len;
            }

            if (end >= len && (len - this.$showMax) > 0) {
                start = len - this.$showMax;
            }

            for (var i = 0; i < len; i++) {

                if (start > i) {
                    this.$sheets[i].setStyle('display', 'none');
                    continue;
                }

                if (end <= i) {
                    this.$sheets[i].setStyle('display', 'none');
                    continue;
                }

                this.$sheets[i].setStyle('display', null);
            }

            if (this.$sheets[0].getStyle('display') == 'none') {
                this.$MorePrev.setStyle('display', null);
            } else {
                this.$MorePrev.setStyle('display', 'none');
            }

            if (end >= len) {
                this.$MoreNext.setStyle('display', 'none');
            } else {
                this.$MoreNext.setStyle('display', null);
            }
        }
    })
        ;
})
;
