/**
 * CustomCSS for a brick
 */

define('package/quiqqer/bricks/bin/Controls/backend/CustomCSS', [

    'qui/QUI',
    'qui/controls/Control'

], function (QUI, QUIControl) {
    "use strict";

    return new Class({

        Extends: QUIControl,
        Type   : 'package/quiqqer/bricks/bin/Controls/backend/CustomCSS',

        Binds: [
            '$onInject'
        ],

        options: {
            css: false
        },

        initialize: function (options) {
            this.parent(options);

            this.$Editor = null;
            this.$Textarea = null;

            this.addEvents({
                onInject: this.$onInject
            });
        },

        /**
         * Create the DOMNode Element
         *
         * @return {HTMLElement}
         */
        create: function () {
            this.$Elm = this.parent();

            this.$Elm.set({
                'class': 'control-brick-setting-custom-css',
                html   : '<textarea></textarea>',
                styles : {
                    border : '1px solid rgb(213 213 213)',
                    'float': 'left',
                    height : '100%',
                    width  : '100%'
                }
            });

            this.$Textarea = this.$Elm.getElement('textarea');

            this.$Textarea.set({
                name  : 'customCSS',
                styles: {
                    display: 'none'
                }
            });

            return this.$Elm;
        },

        /**
         * event : on inject
         */
        $onInject: function () {
            require(['controls/editors/CodeEditor'], (CodeEditor) => {
                this.$Editor = new CodeEditor({
                    type: 'css'
                }).inject(this.getElm());

                if (this.getAttribute('css')) {
                    this.$Editor.setValue(this.getAttribute('css'));
                }

                this.$Textarea.value = this.$Editor.getValue();
                this.fireEvent('load');
            });
        },

        /**
         * set the editor value to the textarea
         *
         * @return string
         */
        save: function () {
            this.$Textarea.value = this.$Editor.getValue();
            return this.$Editor.getValue();
        },

        destroy: function () {
            if (this.$Editor) {
                this.$Editor.destroy();
                this.$Editor = null;
            }

            this.parent();
        }
    });
});
