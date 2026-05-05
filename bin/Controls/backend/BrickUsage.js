define('package/quiqqer/bricks/bin/Controls/backend/BrickUsage', [

    'qui/QUI',
    'qui/controls/Control',
    'controls/grid/Grid',
    'utils/Panels',
    'utils/Site',
    'Locale',
    'Ajax'

], function (QUI, QUIControl, Grid, PanelUtils, SiteUtils, QUILocale, QUIAjax) {
    "use strict";

    return new Class({

        Extends: QUIControl,
        Type: 'package/quiqqer/bricks/bin/Controls/backend/BrickUsage',

        Binds: [
            '$onInject',
            '$dblClick',
            '$openFrontendSite',
            '$createFrontendButton'
        ],

        options: {
            brickId: false,
            styles: {
                'float': 'left',
                height: '100%',
                width: '100%'
            }
        },

        initialize: function (options) {
            this.parent(options);

            this.addEvents({
                onInject: this.$onInject
            });
        },

        /**
         * Create the DOMNode Element
         *
         * @return {Element}
         */
        create: function () {
            this.$Elm = new Element('div');

            if (this.getAttribute('styles')) {
                this.$Elm.setStyles(this.getAttribute('styles'));
            }

            const Container = new Element('div', {
                styles: {
                    height: '100%',
                    width: '100%'
                }
            }).inject(this.$Elm);

            this.$Grid = new Grid(Container, {
                columnModel: [{
                    header: QUILocale.get('quiqqer/system', 'project'),
                    dataIndex: 'project',
                    dataType: 'string',
                    width: 100
                }, {
                    header: QUILocale.get('quiqqer/system', 'language'),
                    dataIndex: 'lang',
                    dataType: 'string',
                    width: 100
                }, {
                    header: QUILocale.get('quiqqer/system', 'id'),
                    dataIndex: 'id',
                    dataType: 'string',
                    width: 100
                }, {
                    header: QUILocale.get('quiqqer/system', 'title'),
                    dataIndex: 'title',
                    dataType: 'string',
                    width: 200
                }, {
                    header: QUILocale.get('quiqqer/bricks', 'brick.panel.usage.grid.url'),
                    dataIndex: 'url',
                    dataType: 'string',
                    width: 300
                }, {
                    header: '&nbsp;',
                    dataIndex: 'openFrontend',
                    dataType: 'node',
                    width: 200
                }],
                onrefresh: this.refresh
            });

            this.$Grid.addEvents({
                onDblClick: this.$dblClick
            });

            return this.$Elm;
        },

        /**
         * Refresh the data
         */
        refresh: function () {
            const self = this;

            this.fireEvent('refreshBegin', [this]);

            return new Promise(function (resolve) {
                QUIAjax.get('package_quiqqer_bricks_ajax_getSitesFromBrick', function (result) {
                    result.data = result.data.map(function (entry) {
                        entry.openFrontend = self.$createFrontendButton(entry);

                        return entry;
                    });

                    self.$Grid.setData(result);
                    self.fireEvent('refresh', [this]);

                    resolve();
                }, {
                    'package': 'quiqqer/bricks',
                    brickId: self.getAttribute('brickId'),
                    options: JSON.encode({})
                });
            });
        },

        /**
         * resize the control
         */
        resize: function () {
            if (!this.$Grid) {
                return;
            }

            const Body = this.getElm();

            if (!Body) {
                return;
            }

            const size = Body.getSize();

            this.$Grid.setHeight(size.y);
            this.$Grid.setWidth(size.x);
        },

        /**
         * event : on inject
         */
        $onInject: function () {
            this.refresh().then(function () {
                this.fireEvent('load', [this]);
            }.bind(this));
        },

        /**
         * grid dbl click
         */
        $dblClick: function () {
            const selected = this.$Grid.getSelectedData();

            if (!selected.length) {
                return;
            }

            PanelUtils.openSitePanel(
                selected[0].project,
                selected[0].lang,
                selected[0].id
            );
        },

        /**
         * Open site in frontend
         *
         * @param {Object} Button
         */
        $openFrontendSite: function (Button) {
            SiteUtils.openSite(
                Button.project,
                Button.lang,
                Button.id
            );
        },

        /**
         * Create frontend button node for grid row
         *
         * @param {Object} entry
         * @return {HTMLButtonElement}
         */
        $createFrontendButton: function (entry) {
            return new Element('button', {
                type: 'button',
                'class': 'btn btn-light',
                html: 'Seite im Browser öffnen <span class="fa fa-external-link"></span>',
                title: 'Seite im Browser öffnen',
                events: {
                    click: function (event) {
                        event.stop();
                        this.$openFrontendSite(entry);
                    }.bind(this)
                }
            });
        }
    });
});
