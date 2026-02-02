define('package/quiqqer/bricks/bin/Controls/BrickWindow', [

    'qui/QUI',
    'qui/controls/windows/SimpleWindow',
    'Ajax'

], function (QUI, SimpleWindow, QUIAjax) {
    "use strict";

    return new Class({

        Type: 'package/quiqqer/bricks/bin/Controls/BrickWindow',
        Extends: SimpleWindow,

        Binds: [
            '$onOpen'
        ],

        options: {
            brickId: false
        },

        initialize: function (options) {
            this.parent(options);

            this.addEvents({
                onOpen: this.$onOpen
            });
        },

        $onOpen: function () {
            this.Loader.show();

            QUIAjax.get('package_quiqqer_bricks_ajax_brick_render', (html) => {
                this.$Content.innerHTML = html;
                QUI.parse(this.$Content).then(() => {
                    this.Loader.hide();
                });
            }, {
                'package': 'quiqqer/bricks',
                brickId: this.getAttribute('brickId')
            });
        }
    });
});