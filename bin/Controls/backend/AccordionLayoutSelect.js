define('package/quiqqer/bricks/bin/Controls/backend/AccordionLayoutSelect', [
    'qui/controls/Control',
    'Locale',
    'css!package/quiqqer/bricks/bin/Controls/backend/AccordionLayoutSelect.css'
], function (QUIControl, QUILocale) {
    "use strict";

    const lg = 'quiqqer/bricks';

    return new Class({
        Extends: QUIControl,
        Type: 'package/quiqqer/bricks/bin/Controls/backend/AccordionLayoutSelect',

        Binds: [
            '$onImport',
            '$onCardKeyDown',
            '$onDestroy'
        ],

        initialize: function (options) {
            this.parent(options);

            this.$Input = null;
            this.$Container = null;
            this.$Grid = null;
            this.$registry = this.$buildRegistry();
            this.$allowedLayouts = [];

            this.addEvents({
                onImport: this.$onImport,
                onDestroy: this.$onDestroy
            });
        },

        $onImport: function () {
            this.$Input = this.getElm();

            if (!this.$Input) {
                return;
            }

            this.$allowedLayouts = this.$getAllowedLayouts();
            this.$Input.setStyles({
                display: 'none'
            });

            this.$Container = new Element('div', {
                'class': 'quiqqer-bricks-accordionLayoutSelect'
            }).wraps(this.$Input);

            this.$Grid = new Element('div', {
                'class': 'quiqqer-bricks-accordionLayoutSelect-grid'
            }).inject(this.$Container);

            this.$renderCards();
            this.$refreshDisplay();
        },

        $onDestroy: function () {
            if (this.$Input) {
                this.$Input.setStyle('display', null);
            }
        },

        $buildRegistry: function () {
            return {
                default: {
                    title: QUILocale.get(lg, 'brick.accordion.template.default'),
                    preview: 'default'
                },
                simple: {
                    title: QUILocale.get(lg, 'brick.accordion.template.simple'),
                    preview: 'simple'
                },
                boxOutline: {
                    title: QUILocale.get(lg, 'brick.accordion.template.boxOutline'),
                    preview: 'outline'
                },
                boxOutlineAccent: {
                    title: QUILocale.get(lg, 'brick.accordion.template.boxOutlineAccent'),
                    preview: 'outlineAccent'
                },
                boxOutlineTextColor: {
                    title: QUILocale.get(lg, 'brick.accordion.template.boxOutlineTextColor'),
                    preview: 'outlineTextColor'
                },
                boxFillAccent: {
                    title: QUILocale.get(lg, 'brick.accordion.template.boxFillAccent'),
                    preview: 'fill'
                },
                boxFillSubtle: {
                    title: QUILocale.get(lg, 'brick.accordion.template.boxFillSubtle'),
                    preview: 'fillSubtle'
                },
                softCard: {
                    title: QUILocale.get(lg, 'brick.accordion.template.softCard'),
                    preview: 'card'
                },
                softCardAccentFill: {
                    title: QUILocale.get(lg, 'brick.accordion.template.softCardAccentFill'),
                    preview: 'cardAccent'
                }
            };
        },

        $getAllowedLayouts: function () {
            const registryKeys = Object.keys(this.$registry);
            const allowlist = this.$Input.get('data-qui-options-allowedlayouts');

            if (!allowlist || typeof allowlist !== 'string') {
                return registryKeys;
            }

            return allowlist.split(',').map(function (entry) {
                return entry.trim();
            }).filter(function (entry, index, list) {
                return entry !== '' && list.indexOf(entry) === index && registryKeys.contains(entry);
            });
        },

        $getVisibleValue: function () {
            const value = this.getValue();

            if (!value || !this.$registry[value] || !this.$allowedLayouts.contains(value)) {
                return '';
            }

            return value;
        },

        $renderCards: function () {
            if (!this.$Grid) {
                return;
            }

            this.$Grid.set('html', '');

            this.$allowedLayouts.forEach(function (layoutKey) {
                const entry = this.$registry[layoutKey];

                if (!entry) {
                    return;
                }

                const Card = new Element('button', {
                    'class': 'quiqqer-bricks-accordionLayoutSelect-card',
                    type: 'button',
                    'data-layout': layoutKey,
                    'aria-pressed': 'false',
                    events: {
                        click: function () {
                            this.$selectLayout(layoutKey);
                        }.bind(this),
                        keydown: function (event) {
                            this.$onCardKeyDown(event, layoutKey);
                        }.bind(this)
                    }
                }).inject(this.$Grid);

                new Element('div', {
                    'class': 'quiqqer-bricks-accordionLayoutSelect-cardPreview'
                }).adopt(this.$createPreviewNode(entry.preview)).inject(Card);

                new Element('div', {
                    'class': 'quiqqer-bricks-accordionLayoutSelect-cardTitle',
                    text: entry.title
                }).inject(Card);
            }.bind(this));
        },

        $refreshDisplay: function () {
            const value = this.$getVisibleValue();
            const isDisabled = !this.$allowedLayouts.length;

            if (isDisabled) {
                this.$Container.addClass('is-disabled');
            } else {
                this.$Container.removeClass('is-disabled');
            }

            if (!this.$Grid) {
                return;
            }

            this.$Grid.getElements('.quiqqer-bricks-accordionLayoutSelect-card').each(function (Card) {
                const isActive = Card.get('data-layout') === value;

                Card.disabled = isDisabled;
                Card.set('aria-pressed', isActive ? 'true' : 'false');

                if (isActive) {
                    Card.addClass('is-active');
                    return;
                }

                Card.removeClass('is-active');
            });
        },

        $createPreviewNode: function (previewType) {
            const Preview = new Element('div', {
                'class': 'quiqqer-bricks-accordionLayoutSelect-skeleton is-' + previewType
            });

            for (let i = 0; i < 3; i++) {
                const Item = new Element('div', {
                    'class': 'quiqqer-bricks-accordionLayoutSelect-skeletonItem'
                }).inject(Preview);

                const Header = new Element('div', {
                    'class': 'quiqqer-bricks-accordionLayoutSelect-skeletonHeader'
                }).inject(Item);

                new Element('div', {
                    'class': 'quiqqer-bricks-accordionLayoutSelect-skeletonLine is-title'
                }).inject(Header);

                new Element('div', {
                    'class': 'quiqqer-bricks-accordionLayoutSelect-skeletonIcon'
                }).inject(Header);

                if (i === 0) {
                    const Body = new Element('div', {
                        'class': 'quiqqer-bricks-accordionLayoutSelect-skeletonBody'
                    }).inject(Item);

                    new Element('div', {
                        'class': 'quiqqer-bricks-accordionLayoutSelect-skeletonLine is-long'
                    }).inject(Body);

                    new Element('div', {
                        'class': 'quiqqer-bricks-accordionLayoutSelect-skeletonLine'
                    }).inject(Body);

                    new Element('div', {
                        'class': 'quiqqer-bricks-accordionLayoutSelect-skeletonLine is-short'
                    }).inject(Body);
                }
            }

            return Preview;
        },

        $onCardKeyDown: function (event, layoutKey) {
            if (!event || !layoutKey || !this.$allowedLayouts.length) {
                return;
            }

            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                this.$selectLayout(layoutKey);
            }
        },

        $selectLayout: function (layoutKey) {
            if (!layoutKey || !this.$registry[layoutKey] || !this.$allowedLayouts.contains(layoutKey)) {
                return;
            }

            this.setValue(layoutKey);
        },

        getValue: function () {
            if (!this.$Input) {
                return '';
            }

            return this.$Input.value || '';
        },

        setValue: function (value) {
            if (!this.$Input) {
                return;
            }

            this.$Input.value = value;
            this.$refreshDisplay();
            this.fireEvent('change', [value, this]);
        }
    });
});
