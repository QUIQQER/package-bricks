/**
 * @module package/quiqqer/bricks/bin/Controls/backend/BrickList
 * @author www.pcsg.de (Henning Leutz)
 */
define('package/quiqqer/bricks/bin/Controls/backend/BrickList', [

    'qui/QUI',
    'qui/controls/Control',
    'controls/projects/Select',
    'controls/grid/Grid',
    'Locale',
    'Projects',
    'Ajax',
    'package/quiqqer/bricks/bin/Bricks',

    'css!package/quiqqer/bricks/bin/Controls/backend/BrickList.css'

], function (QUI, QUIControl, ProjectSelect, Grid, QUILocale, Projects, QUIAjax, Bricks) {
    "use strict";

    const lg = 'quiqqer/bricks';

    return new Class({

        Extends: QUIControl,
        Type   : 'package/quiqqer/bricks/bin/Controls/backend/BrickList',

        Binds: [
            '$onCreate',
            '$onInject',
            '$onDblClick',
            'refresh'
        ],

        options: {
            project : false,
            lang    : false,
            styles  : false,
            multiple: true
        },

        initialize: function (options) {
            this.parent(options);

            this.$isLoaded = false;
            this.$Container = null;

            this.addEvents({
                onInject: this.$onInject
            });
        },

        create: function () {
            const Elm = this.parent();

            Elm.set({
                'data-quiid': this.getId(),
                'data-qui'  : 'package/quiqqer/bricks/bin/Controls/backend/BrickList'
            });

            Elm.addClass('quiqqer-bricks-brickList');

            if (this.getAttribute('styles')) {
                Elm.setStyles(this.getAttribute('styles'));
            }

            this.$ProjectSelect = new ProjectSelect({
                styles: {
                    marginBottom: 10,
                    width       : '100%'
                },
                events: {
                    onChange: this.refresh
                }
            });

            if (this.getAttribute('project')) {
                this.$ProjectSelect.setAttribute('project', this.getAttribute('project'));
            }

            if (this.getAttribute('lang')) {
                this.$ProjectSelect.setAttribute('lang', this.getAttribute('lang'));
            }

            this.$ProjectSelect.inject(Elm);

            this.$Container = new Element('div').inject(Elm);

            if (this.getAttribute('styles')) {
                this.$Container.setStyles(this.getAttribute('styles'));
            }

            this.$Grid = new Grid(this.$Container, {
                columnModel      : [
                    {
                        header   : QUILocale.get('quiqqer/quiqqer', 'id'),
                        dataIndex: 'id',
                        dataType : 'integer',
                        width    : 40
                    },
                    {
                        header   : QUILocale.get('quiqqer/quiqqer', 'title'),
                        dataIndex: 'title',
                        dataType : 'string',
                        width    : 140
                    },
                    {
                        header   : QUILocale.get('quiqqer/quiqqer', 'description'),
                        dataIndex: 'description',
                        dataType : 'string',
                        width    : 300
                    },
                    {
                        header   : QUILocale.get(lg, 'brick.type'),
                        dataIndex: 'type',
                        dataType : 'string',
                        width    : 200
                    }
                ],
                multipleSelection: this.getAttribute('multiple'),
                pagination       : true
            });

            this.$Grid.addEvents({
                onRefresh : this.refresh,
                onDblClick: this.$onDblClick
            });

            this.$isLoaded = true;

            return Elm;
        },

        $onInject: function () {
            this.$Grid.setHeight(this.$Container.getSize().y);
            this.refresh();
        },

        /**
         * Refresh the panel data
         */
        refresh: function () {
            if (!this.$isLoaded) {
                return Promise.resolve();
            }

            if (!this.$Elm) {
                return Promise.resolve();
            }

            const self = this;
            let value = this.$ProjectSelect.getValue();

            if (value === null || value === '') {
                return;
            }

            value = value.split(',');

            this.$ProjectSelect.disable();
            this.$Grid.showLoader();

            return Bricks.getBricksFromProject(value[0], value[1]).then(function (result) {
                let options = self.$Grid.options,
                    page    = parseInt(options.page),
                    perPage = parseInt(options.perPage),
                    start   = (page - 1) * perPage;

                self.$Grid.setData({
                    data : result.slice(start, start + perPage),
                    page : page,
                    total: result.length
                });

                self.$ProjectSelect.enable();
                self.$Grid.hideLoader();
            });
        },

        /**
         * @return {Object}
         */
        getValue: function () {
            return this.$Grid.getSelectedData();
        },

        $onDblClick: function () {
            this.fireEvent('dblClick', [this]);
        }
    });
});
