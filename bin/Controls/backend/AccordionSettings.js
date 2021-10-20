/**
 *
 * @module package/quiqqer/bricks/bin/Controls/backend/AccordionSettings
 *
 * @require qui/controls/elements/FormList
 * @require css!package/quiqqer/bricks/bin/Controls/backend/AccordionSettings.css
 */
define('package/quiqqer/bricks/bin/Controls/backend/AccordionSettings', [

    'qui/controls/elements/FormList',
    'utils/Controls',
    'Locale',
    'Mustache',

    'text!package/quiqqer/bricks/bin/Controls/backend/AccordionSettings.html',
    'css!package/quiqqer/bricks/bin/Controls/backend/AccordionSettings.css'

], function (QUIFormList, QUIControls, QUILocale, Mustache, template) {
    "use strict";

    var lg = 'quiqqer/bricks';

    return new Class({

        Extends: QUIFormList,
        Type   : 'package/quiqqer/bricks/bin/Controls/backend/AccordionSettings',

        Binds: [
            '$onParsed'
        ],

        initialize: function (options) {
            this.parent(options);

            this.$Project = null;

            this.addEvents({
                onParsed: this.$onParsed
            });

            this.getElm().addClass('qui-controls-formlist-accordion');

            this.setAttributes({
                buttonText: QUILocale.get(lg, 'bricks.accordion.settings.addButton'),
                entry     : Mustache.render(template, {
                    'title'  : QUILocale.get(lg, 'brick.accordion.settings.title'),
                    'content': QUILocale.get(lg, 'brick.accordion.settings.content')
                })
            });
        },

        /**
         * set the project to the control
         *
         * @param Project
         */
        setProject: function (Project) {
            this.$Project = Project;
            this.$onParsed(false, this.getElm());
        },

        /**
         * Parses QUI controls when a new entry is created
         *
         * Fired after (inherited) FormList has parsed the content
         *
         * @param event
         * @param Node - The element that was previously parsed by (inherited) FormList
         */
        $onParsed: function (event, Node) {
            if (!this.$Project) {
                return;
            }

            this.$executeParsing(Node);
        },

        /**
         * Parse the editor
         *
         * @param Node
         * @returns {Promise}
         */
        $executeParsing: function (Node) {
            var self = this;

            return QUIControls.parse(Node).then(function () {
                // Element is fully parsed so we can finally show it
                Node.getElements('.quiqqer-bricks-accordion-entry').show();
                self.getElm().addClass('qui-controls-formlist-accordion');

                var inputEditors = Node.getElements('[data-qui="controls/editors/Input"]').map(function (InnerNode) {
                    return QUI.Controls.getById(InnerNode.get('data-quiid'));
                });

                for (var i = 0, len = inputEditors.length; i < len; i++) {
                    if (inputEditors[i]) {
                        inputEditors[i].setProject(self.$Project);
                    }
                }
            });
        }
    });
});
