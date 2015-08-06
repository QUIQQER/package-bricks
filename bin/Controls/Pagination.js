
/**
 * Ajax pagination
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

], function(QUI, QUIControl, QUIStringUtils)
{
    "use strict";

    return new Class({

        Extends : QUIControl,
        Type : 'package/quiqqer/bricks/bin/Controls/Pagination',

        Binds : [
            '$onImport',
            '$onMouseOver'
        ],

        initialize : function(options)
        {
            this.parent(options);

            this.$Current = null;

            this.$Prev   = null;
            this.$Next   = null;
            this.$First  = null;
            this.$Last   = null;
            this.$sheets = [];

            this.addEvents({
                onImport : this.$onImport
            });
        },

        /**
         * event : on import
         */
        $onImport : function()
        {
            this.$First = this.$Elm.getElement('.quiqqer-sheets-first');
            this.$Prev = this.$Elm.getElement('.quiqqer-sheets-prev');
            this.$Last = this.$Elm.getElement('.quiqqer-sheets-last');
            this.$Next = this.$Elm.getElement('.quiqqer-sheets-next');

            this.$Current = this.$Elm.getElement('.quiqqer-sheets-desktop-current');
            this.$sheets = this.$Elm.getElements('.quiqqer-sheets-sheet');

            this.$registerEvents();
            this.first();
        },

        /**
         * register all js events
         */
        $registerEvents : function()
        {
            var self      = this,
                aElms     = this.$Elm.getElements('a'),
                limitElms = this.$Elm.getElements('.quiqqer-sheets-desktop-limits a');

            aElms.addEvent('click', function(event) {

                event.stop();

                if (this.hasClass('quiqqer-sheets-first')) {
                    self.first();

                } else if (this.hasClass('quiqqer-sheets-last')) {
                    self.last();

                } else if (this.hasClass('quiqqer-sheets-prev')) {
                    self.prev();

                } else if (this.hasClass('quiqqer-sheets-next')) {
                    self.next();

                } else {
                    self.openPage(parseInt(this.get('data-page')-1));
                }
            });

            limitElms.addEvent('click', function(event)
            {
                event.stop();

                var Sheet = self.$Current,
                    Query = QUIStringUtils.getUrlParams(Sheet.search);

                Query.limit = event.target.getProperty('data-limit');

                self.fireEvent('change', [self, Sheet, Query]);
            });
        },

        /**
         * Open page number and trigger the change event when it is necessary
         *
         * @param {Number} no - page number
         * @fire change [this, Sheet, query]
         */
        openPage : function(no)
        {
            if (typeof this.$sheets[no] === 'undefined') {
                return;
            }

            var Sheet = this.$sheets[no];
            var query = QUIStringUtils.getUrlParams(Sheet.search);

            if (this.$Current === Sheet) {
                return;
            }

            this.setPage(no);
            this.fireEvent('change', [this, Sheet, query]);
        },

        /**
         * Open page number and does not trigger the change event
         *
         * @param {Number} no - page number
         */
        setPage : function(no)
        {
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

            } else if (no >= this.$sheets.length-1) {
                // disable last and next
                this.$Last.addClass('quiqqer-sheets-desktop-disabled');
                this.$Next.addClass('quiqqer-sheets-desktop-disabled');
            }
        },

        /**
         * Go to the next page
         */
        next : function()
        {
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
        prev : function()
        {
            if (!this.$Current) {
                this.first();
                return;
            }

            var currentPage = this.$Current.get('data-page');

            if (currentPage-2) {
                this.openPage(currentPage-2);
                return;
            }

            this.first();
        },

        /**
         * Go to the first page
         */
        first : function()
        {
            this.openPage(0);
        },

        /**
         * Go to the last page
         */
        last : function()
        {
            this.openPage(this.$sheets.length-1);
        }
    });
});
