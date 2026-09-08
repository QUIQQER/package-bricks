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
            brickId: false,
            // parameters handed to the rendered brick, e.g. {context: '...'}.
            // The server applies them prefixed, so they can never overwrite a
            // brick setting; a brick opts in by reading the prefixed value.
            brickParams: false
        },

        initialize: function (options) {
            this.parent(options);

            this.addEvents({
                onOpen: this.$onOpen
            });
        },

        $onOpen: function () {
            this.Loader.show();

            const params = {
                'package': 'quiqqer/bricks',
                brickId: this.getAttribute('brickId')
            };

            const brickParams = this.getAttribute('brickParams');

            if (brickParams && typeof brickParams === 'object') {
                params.brickParams = JSON.stringify(brickParams);
            }

            QUIAjax.get('package_quiqqer_bricks_ajax_brick_render', (html) => {
                this.$Content.innerHTML = html;
                QUI.parse(this.$Content).then(() => {
                    this.Loader.hide();
                });
            }, params);
        }
    });
});