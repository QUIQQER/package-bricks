/**
 * @module package/quiqqer/bricks/bin/Controls/CustomerReviews
 * @author www.pcsg.de (Michael Danielczok)
 */
define('package/quiqqer/bricks/bin/Controls/CustomerReviews', [

    'qui/controls/elements/FormList',
    'utils/Controls',
    'Locale',
    'Mustache',

    'text!package/quiqqer/bricks/bin/Controls/CustomerReviews.Settings.html',
    'css!package/quiqqer/bricks/bin/Controls/ContentSwitcher.css' //todo needed css?

], function (QUIFormList, QUIControls, QUILocale, Mustache, templateSettings) {
    "use strict";

    var lg = 'quiqqer/bricks';

    return new Class({

        Extends: QUIFormList,
        Type   : 'package/quiqqer/bricks/bin/Controls/CustomerReviews',

        Binds: [
            '$onParsed'
        ],

        initialize: function (options) {
            this.parent(options);

            this.$Project = null;

            this.addEvents({
                onParsed: this.$onParsed
            });

            this.setAttributes({
                buttonText: QUILocale.get(lg, 'customerReviews.reviews.addButton'),
                entry     : Mustache.render(templateSettings, {
                    'avatar'             : QUILocale.get(lg, 'customerReviews.reviews.entry.avatar'),
                    'userName'           : QUILocale.get(lg, 'customerReviews.reviews.entry.userName'),
                    'userNamePlaceholder': QUILocale.get(lg, 'customerReviews.reviews.entry.userName.placeholder'),
                    'jobTitle'           : QUILocale.get(lg, 'customerReviews.reviews.entry.jobTitle'),
                    'jobTitlePlaceholder': QUILocale.get(lg, 'customerReviews.reviews.entry.jobTitle.placeholder'),
                    'url'                : QUILocale.get(lg, 'customerReviews.reviews.entry.url'),
                    'urlPlaceholder'     : QUILocale.get(lg, 'customerReviews.reviews.entry.url.placeholder'),
                    'urlTitle'           : QUILocale.get(lg, 'customerReviews.reviews.entry.urlTitle'),
                    'urlTitlePlaceholder': QUILocale.get(lg, 'customerReviews.reviews.entry.urlTitle.placeholder'),
                    'review'             : QUILocale.get(lg, 'customerReviews.reviews.entry.content')
                })
            });
        },

        /**
         * @event on import
         *
         * https://dev.quiqqer.com/quiqqer/package-bricks/issues/97
         */
        $onImport: function () {
            // look if some value exist
            var value = this.getElm().value;

            if (value === '') {
                return;
            }

            value = JSON.decode(value);

            if (typeOf(value) !== 'array') {
                return;
            }

            for (var i = 0, len = value.length; i < len; i++) {
                if (typeof value[i].content !== 'undefined') {
                    value[i].customerReviewsContent = value[i].content;
                }
            }

            this.getElm().value = JSON.encode(value);
            this.parent();
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
                Node.getElements('.quiqqer-bricks-ContentSwitcher-entry').show();

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

