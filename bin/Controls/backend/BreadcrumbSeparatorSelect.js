define('package/quiqqer/bricks/bin/Controls/backend/BreadcrumbSeparatorSelect', [
    'qui/controls/Control',
    'Locale',
    'css!package/quiqqer/bricks/bin/Controls/backend/BreadcrumbSeparatorSelect.css'
], function (QUIControl, QUILocale) {
    "use strict";

    const lg = 'quiqqer/bricks';
    const defaultValue = 'angle-right';

    return new Class({
        Extends: QUIControl,
        Type: 'package/quiqqer/bricks/bin/Controls/backend/BreadcrumbSeparatorSelect',

        Binds: [
            '$onImport',
            '$onDestroy',
            '$onCardKeyDown'
        ],

        initialize: function (options) {
            this.parent(options);

            this.$Input = null;
            this.$Container = null;
            this.$Grid = null;
            this.$registry = this.$buildRegistry();

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

            this.$Input.setStyle('display', 'none');

            this.$Container = new Element('div', {
                'class': 'quiqqer-bricks-breadcrumbSeparatorSelect'
            }).wraps(this.$Input);

            this.$Grid = new Element('div', {
                'class': 'quiqqer-bricks-breadcrumbSeparatorSelect-grid'
            }).inject(this.$Container);

            this.$renderCards();

            if (!this.getValue()) {
                this.setValue(defaultValue);
                return;
            }

            this.$refreshDisplay();
        },

        $onDestroy: function () {
            if (this.$Input) {
                this.$Input.setStyle('display', null);
            }
        },

        $buildRegistry: function () {
            return {
                'angle-right': {
                    title: QUILocale.get(lg, 'brick.control.breadcrumb.setting.separator.option.angleRight'),
                    type: 'icon',
                    preview: 'fa-angle-right'
                },
                'chevron-right': {
                    title: QUILocale.get(lg, 'brick.control.breadcrumb.setting.separator.option.chevronRight'),
                    type: 'icon',
                    preview: 'fa-chevron-right'
                },
                'angles-right': {
                    title: QUILocale.get(lg, 'brick.control.breadcrumb.setting.separator.option.anglesRight'),
                    type: 'icon',
                    preview: 'fa-angles-right'
                },
                'caret-right': {
                    title: QUILocale.get(lg, 'brick.control.breadcrumb.setting.separator.option.caretRight'),
                    type: 'icon',
                    preview: 'fa-caret-right'
                },
                slash: {
                    title: QUILocale.get(lg, 'brick.control.breadcrumb.setting.separator.option.slash'),
                    type: 'text',
                    preview: '/'
                },
                bullet: {
                    title: QUILocale.get(lg, 'brick.control.breadcrumb.setting.separator.option.bullet'),
                    type: 'text',
                    preview: '•'
                },
                pipe: {
                    title: QUILocale.get(lg, 'brick.control.breadcrumb.setting.separator.option.pipe'),
                    type: 'text',
                    preview: '|'
                }
            };
        },

        $renderCards: function () {
            this.$Grid.set('html', '');

            Object.keys(this.$registry).forEach(function (key) {
                const entry = this.$registry[key];
                const Card = new Element('button', {
                    'class': 'quiqqer-bricks-breadcrumbSeparatorSelect-card',
                    type: 'button',
                    'data-value': key,
                    'aria-pressed': 'false',
                    events: {
                        click: function () {
                            this.setValue(key);
                        }.bind(this),
                        keydown: function (event) {
                            this.$onCardKeyDown(event, key);
                        }.bind(this)
                    }
                }).inject(this.$Grid);

                const Preview = new Element('div', {
                    'class': 'quiqqer-bricks-breadcrumbSeparatorSelect-preview'
                }).inject(Card);

                if (entry.type === 'icon') {
                    new Element('span', {
                        'class': 'fa ' + entry.preview,
                        'aria-hidden': 'true'
                    }).inject(Preview);
                } else {
                    new Element('span', {
                        'class': 'quiqqer-bricks-breadcrumbSeparatorSelect-previewText',
                        text: entry.preview,
                        'aria-hidden': 'true'
                    }).inject(Preview);
                }

                new Element('div', {
                    'class': 'quiqqer-bricks-breadcrumbSeparatorSelect-title',
                    text: entry.title
                }).inject(Card);
            }.bind(this));
        },

        $onCardKeyDown: function (event, key) {
            if (!event || !key) {
                return;
            }

            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                this.setValue(key);
            }
        },

        $refreshDisplay: function () {
            const value = this.getValue() || defaultValue;

            this.$Grid.getElements('.quiqqer-bricks-breadcrumbSeparatorSelect-card').each(function (Card) {
                const active = Card.get('data-value') === value;

                Card.set('aria-pressed', active ? 'true' : 'false');

                if (active) {
                    Card.addClass('is-active');
                    return;
                }

                Card.removeClass('is-active');
            });
        },

        getValue: function () {
            if (!this.$Input) {
                return '';
            }

            return this.$Input.value || '';
        },

        setValue: function (value) {
            if (!this.$Input || !this.$registry[value]) {
                return;
            }

            this.$Input.value = value;
            this.$refreshDisplay();
            this.fireEvent('change', [value, this]);
        }
    });
});
