/**
 *
 * @module package/quiqqer/bricks/bin/Controls/BoxContentAdvanced
 *
 * @require qui/controls/elements/FormList
 * @require css!package/quiqqer/bricks/bin/Controls/BoxContentAdvanced.css
 */
define('package/quiqqer/bricks/bin/Controls/BoxContentAdvanced', [

    'qui/controls/elements/FormList',
    'utils/Controls',
    'Locale',
    'Mustache',

    'text!package/quiqqer/bricks/bin/Controls/BoxContentAdvanced.Settings.html',
    'css!package/quiqqer/bricks/bin/Controls/BoxContentAdvanced.css'

], function (QUIFormList, QUIControls, QUILocale, Mustache, template) {
    "use strict";

    var lg = 'quiqqer/bricks';

    return new Class({

        Extends: QUIFormList,
        Type   : 'package/quiqqer/bricks/bin/Controls/BoxContentAdvanced',

        Binds: [
            '$onParsed'
        ],

        initialize: function (options) {
            this.parent(options);

            this.$Project = null;

            this.addEvents({
                onParsed: this.$onParsed
            });

            this.getElm().addClass('qui-controls-formlist-boxContentAdvanced');

            this.setAttributes({
                buttonText: QUILocale.get(lg, 'BoxContentAdvanced.entries.addButton'),
                entry     : Mustache.render(template, {
                    'entryTitle'   : QUILocale.get(lg, 'bricks.BoxContentAdvanced.entries.settings.entryTitle'),
                    'entrySubTitle': QUILocale.get(lg, 'bricks.BoxContentAdvanced.entries.settings.entrySubTitle'),
                    'entryImage'   : QUILocale.get(lg, 'bricks.BoxContentAdvanced.entries.settings.entryImage'),
                    'entryOrder'   : QUILocale.get(lg, 'bricks.BoxContentAdvanced.entries.settings.entryOrder'),
                    'entryContent' : QUILocale.get(lg, 'bricks.BoxContentAdvanced.entries.settings.entryContent')
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

            new Element('div', {
                'class': 'qui-controls-formlist-boxContentAdvanced-placeholderBox'
            }).inject(this.getElm().getElement('.qui-controls-formlist-container'));

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
                Node.getElements('.quiqqer-bricks-boxContentAdvanced-entry').show();

                self.getElm().addClass('qui-controls-formlist-boxContentAdvanced');

                var inputEditors = Node.getElements('[data-qui="controls/editors/Input"]').map(function (InnerNode) {
                    return QUI.Controls.getById(InnerNode.get('data-quiid'));
                });

                for (var i = 0, len = inputEditors.length; i < len; i++) {
                    inputEditors[i].setProject(self.$Project);
                }
            });
        }
    });
});

