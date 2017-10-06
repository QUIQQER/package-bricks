/**
 * Main area handler
 *
 * @author www.pcsg.de (Henning Leutz)
 */
define('package/quiqqer/bricks/bin/classes/Areas', [

    'qui/QUI',
    'qui/classes/DOM',
    'Ajax'

], function (QUI, QDOM, QUIAjax) {
    "use strict";

    return new Class({

        Extends: QDOM,
        Type   : 'package/quiqqer/bricks/bin/classes/Areas',

        initialize: function (options) {
            this.parent(options);

            this.$areas = null;
        },

        /**
         * Return the area list
         *
         * @param project
         * @param lang
         * @return {Promise|*}
         */
        getList: function (project, lang) {
            if (this.$areas) {
                return Promise.resolve(this.$areas);
            }

            var self = this;

            return new Promise(function (resolve) {
                QUIAjax.get('package_quiqqer_bricks_ajax_project_getAreas', function (result) {
                    self.$areas = result;
                    resolve(self.$areas);
                }, {
                    'package': 'quiqqer/brick',
                    project  : JSON.encode({
                        name: project,
                        lang: lang
                    })
                });
            });
        }
    });
});
