/**
 * Area manager for the site object
 *
 * @module package/quiqqer/bricks/bin/Site/Category
 * @author www.pcsg.de (Henning Leutz)
 *
 * @event onLoaded
 */
define('package/quiqqer/bricks/bin/Site/Category', [

    'qui/QUI',
    'qui/controls/Control',
    'qui/controls/loader/Loader',
    'Ajax',
    'Locale',
    'package/quiqqer/bricks/bin/Site/Area',

    'css!package/quiqqer/bricks/bin/Site/Category.css'

], function (QUI, QUIControl, QUILoader, QUIAjax, QUILocale, Area) {
    "use strict";

    return new Class({

        Extends: QUIControl,
        Type   : 'package/quiqqer/bricks/bin/Site/Category',

        Binds: [
            '$onInject',
            '$onDestroy'
        ],

        initialize: function (options) {
            this.parent(options);

            this.Loader = new QUILoader();
            this.areas  = [];

            this.$Areas = null;

            this.addEvents({
                onInject : this.$onInject,
                onDestroy: this.$onDestroy
            });
        },

        /**
         * Return the domnode element
         * @return {HTMLElement}
         */
        create: function () {
            this.$Elm = new Element('div', {
                'class': 'quiqqer-bricks-site-category',
                'html' : '<div class="quiqqer-bricks-site-category-areas"></div>' +
                '<div class="quiqqer-bricks-site-category-image"></div>'
            });

            this.Loader.inject(this.$Elm);

            this.$Areas = this.$Elm.getElement('.quiqqer-bricks-site-category-areas');
            this.$Image = this.$Elm.getElement('.quiqqer-bricks-site-category-image');

            return this.$Elm;
        },

        /**
         * event : on inject
         */
        $onInject: function () {
            this.Loader.show();

            var self    = this,
                Site    = this.getAttribute('Site'),
                Project = Site.getProject(),
                layout  = Site.getAttribute('layout');

            Project.getLayouts().then(function (layouts) {
                layout = layouts.find(function (entry) {
                    return entry.type === layout;
                });

                if (layout && "image" in layout && layout.image !== '') {
                    new Element('img', {
                        src: layout.image
                    }).inject(self.$Image);
                } else {
                    self.$Image.setStyle('display', 'none');
                    self.$Areas.setStyle('width', '100%');
                }

                return self.getBrickAreas();
            }).then(function (bricks) {
                if (!bricks.length) {
                    self.$Areas.set(
                        'html',
                        QUILocale.get('quiqqer/bricks', 'bricks.message.no.areas.found')
                    );

                    self.Loader.hide();
                    return;
                }

                var i, len, data, AC;

                var Site  = self.getAttribute('Site'),
                    areas = Site.getAttribute('quiqqer.bricks.areas');

                if (areas) {
                    areas = JSON.decode(areas);
                }

                var loadData = function (brickData) {
                    AC.addBrick(brickData);
                };

                for (i = 0, len = bricks.length; i < len; i++) {
                    AC = self.$insertBrickAreaEdit(bricks[i]);

                    if (typeof areas[AC.getAttribute('name')] === 'undefined') {
                        continue;
                    }

                    data = areas[AC.getAttribute('name')];

                    if (!data) {
                        continue;
                    }

                    if (typeOf(data) === 'object') {
                        Object.each(data, loadData);
                    } else if (data && typeof data.each !== 'undefined') {
                        data.each(loadData);
                    }
                }

                self.Loader.hide();
                self.fireEvent('loaded');
            });
        },

        /**
         * event : on destroy
         */
        $onDestroy: function () {
            this.updateSite();

            // destroy areas
            this.areas.each(function (Area) {
                Area.destroy();
            });
        },

        /**
         * on control unload
         */
        unload: function () {
            this.updateSite();
        },

        /**
         * Update the internal site object
         */
        updateSite: function () {
            var i, len, AC;

            var Site  = this.getAttribute('Site'),
                areas = {};

            for (i = 0, len = this.areas.length; i < len; i++) {
                AC = this.areas[i];

                areas[AC.getAttribute('name')] = AC.getData();
            }

            Site.setAttribute('quiqqer.bricks.areas', JSON.encode(areas));
        },

        /**
         * Return the available areas for the site
         *
         * @param {Function} [callback] - callback function
         * @return {Promise}
         */
        getBrickAreas: function (callback) {
            var Site    = this.getAttribute('Site'),
                Project = Site.getProject();

            return new Promise(function (resolve, reject) {
                Project.getConfig(function (layout) {
                    if (Site.getAttribute('layout')) {
                        layout = Site.getAttribute('layout');
                    }

                    QUIAjax.get('package_quiqqer_bricks_ajax_project_getAreas', function (result) {
                        if (typeof callback === 'function') {
                            callback(result);
                        }

                        resolve(result);
                    }, {
                        'package': 'quiqqer/bricks',
                        project  : Project.encode(),
                        layout   : layout,
                        onError  : reject
                    });

                }, 'layout');
            });
        },

        /**
         * Create a brick area edit container
         *
         * @param {Object} area - Data of the area
         * @return Area
         */
        $insertBrickAreaEdit: function (area) {
            var Site    = this.getAttribute('Site'),
                Project = Site.getProject(),
                Control = new Area();

            Control.setAttribute('Project', Project);
            Control.setAttribute('Site', Site);
            Control.setAttributes(area);

            Control.inject(this.$Areas);

            this.areas.push(Control);

            return Control;
        }
    });
});
