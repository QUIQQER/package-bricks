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
    'qui/utils/String'

], function (QUI, QUIControl, QUIStringUtils) {
    "use strict";

    return new Class({

        Extends: QUIControl,
        Type   : 'package/quiqqer/bricks/bin/Controls/Pagination',

        Binds: [
            '$onImport',
            '$onMouseOver',
            '$linkclick'
        ],

        initialize: function (options) {
            this.parent(options);

            this.$Current = null;

            this.$Prev   = null;
            this.$Next   = null;
            this.$First  = null;
            this.$Last   = null;
            this.$sheets = [];

            this.addEvents({
                onImport: this.$onImport
            });
        },

        /**
         * event : on import
         */
        $onImport: function () {
            this.$First = this.$Elm.getElement('.quiqqer-sheets-first');
            this.$Prev  = this.$Elm.getElement('.quiqqer-sheets-prev');
            this.$Last  = this.$Elm.getElement('.quiqqer-sheets-last');
            this.$Next  = this.$Elm.getElement('.quiqqer-sheets-next');

            this.$Current = this.$Elm.getElement('.quiqqer-sheets-desktop-current');
            this.$sheets  = this.$Elm.getElements('.quiqqer-sheets-sheet');

            this.$registerEvents();
            this.first();
        },

        /**
         * Set the number of the pagination
         * refresh the display
         *
         * @param {Number} pages
         */
        setPageCount: function (pages) {

            if (this.$sheets.length == pages) {
                return;
            }

            var Prev = this.$sheets[0].getPrevious();

            this.$sheets.destroy();

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
            });

            // mobile select
            var Select = this.$Elm.getElement('.quiqqer-sheets-mobile select');

            Select.set('onchange', null);

            Select.addEvent('change', function (event) {
                event.stop();

                var Query = QUIStringUtils.getUrlParams(this.value);

                self.fireEvent('change', [self, this, Query]);
            });
        },

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
        },

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
        },

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


            if (no === 0) {
                // disable first and prev
                this.$First.addClass('quiqqer-sheets-desktop-disabled');
                this.$Prev.addClass('quiqqer-sheets-desktop-disabled');

            } else if (no >= this.$sheets.length - 1) {
                // disable last and next
                this.$Last.addClass('quiqqer-sheets-desktop-disabled');
                this.$Next.addClass('quiqqer-sheets-desktop-disabled');
            }
        },

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
        },

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
        },

        /**
         * Go to the first page
         */
        first: function () {
            this.openPage(0);
        },

        /**
         * Go to the last page
         */
        last: function () {
            this.openPage(this.$sheets.length - 1);
        }
    });
});
