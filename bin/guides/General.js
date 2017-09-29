/**
 * @module package/quiqqer/bricks/bin/guides/General
 *
 * Erste Tour für die Bricks (Grundlagentour)
 *
 * @require package/quiqqer/tour/bin/classes/Tour
 * @require utils/Panels
 * @require Locale
 * @require Projects
 */
define('package/quiqqer/bricks/bin/guides/General', [

    'package/quiqqer/tour/bin/classes/Tour',
    'utils/Panels',
    'Locale',
    'Projects'

], function (Tour, PanelUtils, QUILocale, Projects) {
    "use strict";

    var lg = 'quiqqer/bricks';

    var Bricks     = new Tour();
    var FooterZone = null;

    var DropDownMenu,
        BricksMenuEntry,
        PopupBox,
        PopupBox2,
        BrickPanel,
        BrickSettings,
        SitePanel,
        ProjectPanel;

    var step1Text = QUILocale.get(lg, 'tour.general.bricks.Step1_1.Text') +
        '<a target="_blank" href = "https://www.quiqqer.com/media/cache/quiqqer/zonen-bild.png">' +
        '<img src="' + URL_OPT_DIR + 'quiqqer/tour/img/zonen-bild.png"' +
        ' style="max-width: 100%; height: 200px;" /></a>'
        + QUILocale.get(lg, 'tour.general.bricks.Step1_2.Text');

    Bricks.addStep({
        title  : QUILocale.get(lg, 'tour.general.bricks.Step1.Title'),
        text   : step1Text,
        when   : {
            show: function () {
                var quiId    = document.getElement('[data-name = "extras"]').getAttribute('data-quiid');
                DropDownMenu = QUI.Controls.getById(quiId);
            }
        },
        buttons: [{
            text  : QUILocale.get(lg, 'tour.general.bricks.Button.Abbruch'),
            action: function () {
                Bricks.cancel();
            }
        }, {
            text  : QUILocale.get(lg, 'tour.general.bricks.Button.Weiter'),
            action: function () {
                Bricks.next();
            }
        }]
    });

    Bricks.addStep({
        title   : QUILocale.get(lg, 'tour.general.bricks.Step1.Title'),
        text    : QUILocale.get(lg, 'tour.general.bricks.Step2.Text'),
        tetherOptions: {
            constraints: null // this disables pinning (which breaks the arrows)
        },
        buttons : false,
        attachTo: {
            element: function () {
                return DropDownMenu.getElm();
            },
            on     : 'right'
        },
        when    : {
            show: function () {
                DropDownMenu.getElm().addEvent('click', Bricks.next);
                var Entries = DropDownMenu.getChildren();
                Entries.forEach(function (Entry) {
                    if (Entry.options.name === 'bricks') {
                        BricksMenuEntry = Entry;
                    }
                });
            },
            hide: function () {
                DropDownMenu.getElm().removeEvent('click', Bricks.next);
            }
        }
    });

    Bricks.addStep({
        title   : QUILocale.get(lg, 'tour.general.bricks.Step1.Title'),
        text    : QUILocale.get(lg, 'tour.general.bricks.Step3.Text'),
        buttons : false,
        attachTo: {
            element: function () {
                return BricksMenuEntry.getElm();
            },
            on     : 'right'
        },
        when    : {
            show: function () {
                BricksMenuEntry.getElm().addEvent('click', Bricks.next);
            },
            hide: function () {
                BricksMenuEntry.getElm().removeEvent('click', Bricks.next);
            }
        }
    });

    Bricks.addStep({
        title  : QUILocale.get(lg, 'tour.general.bricks.Step1.Title'),
        text   : QUILocale.get(lg, 'tour.general.bricks.Step4.Text'),
        buttons: {
            text  : QUILocale.get(lg, 'tour.general.bricks.Button.Weiter'),
            action: function () {
                Bricks.next();
            }
        }
    });

    Bricks.addStep({
        title   : QUILocale.get(lg, 'tour.general.bricks.Step1.Title'),
        text    : QUILocale.get(lg, 'tour.general.bricks.Step5.Text'),
        buttons : false,
        attachTo: {
            element: function () {
                return document.getElement('[name="brick-add"]');
            },
            on     : 'right'
        },
        when    : {
            show: function () {
                BrickPanel = QUI.Controls.getByType('package/quiqqer/bricks/bin/Manager')[0].getElm();
                BrickPanel.getElement('[name="brick-add"]').addEvent('click', Bricks.next);
            },
            hide: function () {
                BrickPanel.getElement('[name="brick-add"]').removeEvent('click', Bricks.next);
            }
        }
    });

    Bricks.addStep({
        title  : QUILocale.get(lg, 'tour.general.bricks.Step1.Title'),
        text   : QUILocale.get(lg, 'tour.general.bricks.Step6.Text'),
        buttons: {
            text  : QUILocale.get(lg, 'tour.general.bricks.Button.Weiter'),
            action: function () {
                Bricks.next();
            }
        }
    });

    Bricks.addStep({
        title   : QUILocale.get(lg, 'tour.general.bricks.Step1.Title'),
        text    : QUILocale.get(lg, 'tour.general.bricks.Step7.Text'),
        buttons : false,
        attachTo: {
            element: function () {
                PopupBox = document.getElement('.qui-window-popup.box');

                return PopupBox.getElement('select')
            },
            on     : 'right'

        },
        when    : {
            show: function () {
                PopupBox.getElement('select').addEvent('click', Bricks.next)
            },
            hide: function () {
                PopupBox.getElement('select').removeEvent('click', Bricks.next)
            }
        }
    });

    Bricks.addStep({
        title   : QUILocale.get(lg, 'tour.general.bricks.Step1.Title'),
        text    : QUILocale.get(lg, 'tour.general.bricks.Step8.Text'),
        attachTo: {
            element: function () {
                return PopupBox.getElement('input[name = "title"]')
            },
            on     : 'right'
        },
        buttons : false,
        // {
        //     text: QUILocale.get(lg, 'Bricks.Button.Weiter'),
        //     action: function () {
        //         Bricks.next();
        //     }
        // },
        when    : {
            show: function () {
                PopupBox.getElement('input[name = "title"]').addEvent('keydown', Bricks.next)
            },
            hide: function () {
                PopupBox.getElement('input[name = "title"]').removeEvent('keydown', Bricks.next)
            }
        }
    });

    Bricks.addStep({
        title   : QUILocale.get(lg, 'tour.general.bricks.Step1.Title'),
        text    : QUILocale.get(lg, 'tour.general.bricks.Step9.Text'),
        attachTo: {
            element: function () {
                return PopupBox.getElement('button[name = "submit"]')
            },
            on     : 'right'
        },
        buttons : false,
        // {
        //     text: QUILocale.get(lg, 'Bricks.Button.Weiter'),
        //     action: function () {
        //         Bricks.next();
        //     }
        // },
        when    : {
            show: function () {
                PopupBox.getElement('button[name = "submit"]').addEvent('click', Bricks.next)
            },
            hide: function () {
                PopupBox.getElement('button[name = "submit"]').removeEvent('click', Bricks.next)
            }
        }
    });

    Bricks.addStep({
        title  : QUILocale.get(lg, 'tour.general.bricks.Step1.Title'),
        text   : QUILocale.get(lg, 'tour.general.bricks.Step10.Text'),
        buttons: {
            text  : QUILocale.get(lg, 'tour.general.bricks.Button.Weiter'),
            action: function () {
                BrickSettings = QUI.Controls.getByType('package/quiqqer/bricks/bin/BrickEdit');
                BrickSettings = BrickSettings[BrickSettings.length - 1];
                Bricks.next();
            }
        }
    });

    Bricks.addStep({
        title   : QUILocale.get(lg, 'tour.general.bricks.Step1.Title'),
        text    : QUILocale.get(lg, 'tour.general.bricks.Step11.Text'),
        attachTo: {
            element: function () {
                return BrickSettings.getElm().getElement('[name="information"]')
            },
            on     : 'left'
        },
        buttons : {
            text  : QUILocale.get(lg, 'tour.general.bricks.Button.Weiter'),
            action: function () {
                BrickSettings.getElm().getElement('[name = "settings"]').fireEvent('click');
                Bricks.next();
            }
        }
    });

    Bricks.addStep({
        title   : QUILocale.get(lg, 'tour.general.bricks.Step1.Title'),
        text    : QUILocale.get(lg, 'tour.general.bricks.Step12_1.Text'),
        attachTo: {
            element: function () {
                return BrickSettings.getElm().getElement('[name="settings"]')
            },
            on     : 'left'
        },
        buttons : {
            text  : QUILocale.get(lg, 'tour.general.bricks.Button.Weiter'),
            action: function () {
                Bricks.next();
            }
        }
    });

    Bricks.addStep({
        title   : QUILocale.get(lg, 'tour.general.bricks.Step1.Title'),
        text    : QUILocale.get(lg, 'tour.general.bricks.Step12_2.Text'),
        buttons : false,
        attachTo: {
            element: function () {
                return BrickSettings.getElm().getElement('.quiqqer-bricks-brickareas-buttons button')
            },
            on     : 'right'
        },
        when    : {
            show: function () {
                BrickSettings.getElm().getElement('.quiqqer-bricks-brickareas-buttons button').addEvent('click', Bricks.next)
            },
            hide: function () {
                BrickSettings.getElm().getElement('.quiqqer-bricks-brickareas-buttons button').removeEvent('click', Bricks.next)
            }
        }
    });

    Bricks.addStep({
        title  : QUILocale.get(lg, 'tour.general.bricks.Step1.Title'),
        text   : QUILocale.get(lg, 'tour.general.bricks.Step12_3.Text'),
        buttons: {
            text  : QUILocale.get(lg, 'tour.general.bricks.Button.Weiter'),
            action: function () {
                PopupBox2 = QUI.Controls.getByType('package/quiqqer/bricks/bin/AreaWindow')[0].getElm();
                Bricks.next();
            }
        }
    });

    Bricks.addStep({
        title   : QUILocale.get(lg, 'tour.general.bricks.Step1.Title'),
        text    : QUILocale.get(lg, 'tour.general.bricks.Step12_4.Text'),
        attachTo: {
            element: function () {
                var Footer;
                Footer = PopupBox2.getElements('.quiqqer-bricks-area.smooth');
                Footer.forEach(function (Entry) {
                    if (Entry.getAttribute('data-area') === "footer") {
                        Footer = Entry;
                    }
                });

                return Footer
            },
            on     : 'right'
        },
        buttons : {
            text  : QUILocale.get(lg, 'tour.general.bricks.Button.Weiter'),
            action: function () {
                var Footer;
                Footer = PopupBox2.getElements('.quiqqer-bricks-area.smooth');
                Footer.forEach(function (Entry) {
                    if (Entry.getAttribute('data-area') === "footer") {
                        Footer = Entry;
                    }
                });
                if (!Footer.getAttribute('class').includes('quiqqer-bricks-area-selected')) {
                    Footer.fireEvent('click');
                } else {
                    Bricks.next();
                }
            }
        },
        when    : {
            show: function () {
                var Footer;
                Footer = PopupBox2.getElements('.quiqqer-bricks-area.smooth');
                Footer.forEach(function (Entry) {
                    if (Entry.getAttribute('data-area') === "footer") {
                        Footer = Entry;
                    }
                });

                Footer.addEvent('click', Bricks.next)
            },
            hide: function () {
                var Footer;
                Footer = PopupBox2.getElements('.quiqqer-bricks-area.smooth');
                Footer.forEach(function (Entry) {
                    if (Entry.getAttribute('data-area') === "footer") {
                        Footer = Entry;
                    }
                });

                Footer.removeEvent('click', Bricks.next)
            }
        }
    });

    Bricks.addStep({
        title   : QUILocale.get(lg, 'tour.general.bricks.Step1.Title'),
        text    : QUILocale.get(lg, 'tour.general.bricks.Step12_5.Text'),
        attachTo: {
            element: function () {
                return PopupBox2.getElement('[name = "submit"]');
            },
            on     : 'right'
        },
        buttons : {
            text  : QUILocale.get(lg, 'tour.general.bricks.Button.Weiter'),
            action: function () {
                PopupBox2.getElement('[name = "submit"]').fireEvent('click');
            }
        },
        when    : {
            show: function () {
                PopupBox2.getElement('[name = "submit"]').addEvent('click', Bricks.next)
            }
        }
    });


    Bricks.addStep({
        title   : QUILocale.get(lg, 'tour.general.bricks.Step1.Title'),
        text    : QUILocale.get(lg, 'tour.general.bricks.Step13.Text'),
        attachTo: {
            element: function () {
                return BrickSettings.getElm().getElement('[name="extra"]')
            },
            on     : 'left'
        },
        buttons : {
            text  : QUILocale.get(lg, 'tour.general.bricks.Button.Weiter'),
            action: function () {
                BrickSettings.getElm().getElement('[name = "content"]').fireEvent('click');
                Bricks.next();
            }
        },
        when    : {
            show: function () {
                BrickSettings.getElm().getElement('[name="extra"]').fireEvent('click');
            }
        }
    });

    Bricks.addStep({
        title   : QUILocale.get(lg, 'tour.general.bricks.Step1.Title'),
        text    : QUILocale.get(lg, 'tour.general.bricks.Step14.Text'),
        attachTo: {
            element: function () {
                return BrickSettings.getElm().getElement('[name="content"]')
            },
            on     : 'left'
        },
        buttons : {
            text  : QUILocale.get(lg, 'tour.general.bricks.Button.Weiter'),
            action: function () {
                Bricks.next();
            }
        }
    });

    Bricks.addStep({
        title   : QUILocale.get(lg, 'tour.general.bricks.Step1.Title'),
        text    : QUILocale.get(lg, 'tour.general.bricks.Step15.Text'),
        attachTo: {
            element: function () {
                return BrickSettings.getElm().getElement('[name="save"]')
            },
            on     : 'right'
        },
        buttons : {
            text  : QUILocale.get(lg, 'tour.general.bricks.Button.Weiter'),
            action: function () {
                BrickSettings.getElm().getElement('[name="save"]').click();
                Bricks.next();
            }
        },
        when    : {
            show: function () {
                BrickSettings.getElm().getElement('[name="save"]').addEvent('click', Bricks.next)
            },
            hide: function () {
                BrickSettings.getElm().getElement('[name="save"]').removeEvent('click', Bricks.next);
            }
        }
    });

    Bricks.addStep({
        title   : QUILocale.get(lg, 'tour.general.bricks.Step1.Title'),
        text    : QUILocale.get(lg, 'tour.general.bricks.Step16.Text'),
        attachTo: {
            element: function () {
                return BrickSettings.getElm().getElement('[name="close"]')
            },
            on     : 'left'
        },
        buttons : {
            text  : QUILocale.get(lg, 'tour.general.bricks.Button.Weiter'),
            action: function () {
                if (BrickSettings.getElm().getElement('[name="close"]')) {
                    BrickSettings.getElm().getElement('[name="close"]').fireEvent('click')
                } else {
                    Bricks.next();
                }
            }
        },
        when    : {
            show: function () {
                BrickSettings.getElm().getElement('[name="close"]').addEvent('click', Bricks.next);
            }
        }
    });

    Bricks.addStep({
        title  : QUILocale.get(lg, 'tour.general.bricks.Step1.Title'),
        text   : QUILocale.get(lg, 'tour.general.bricks.Step17.Text'),
        buttons: {
            text  : QUILocale.get(lg, 'tour.general.bricks.Button.Weiter'),
            action: function () {
                var ProjektBar = document.getElements('.project-container');
                var Panel      = QUI.Controls.getById(
                    ProjektBar.getParent('.qui-panel').get('data-quiid')
                );
                ProjectPanel   = Panel;
                Panel.open(function () {
                    Projects.getList(function (result) {
                        var keys        = Object.keys(result),
                            project     = result[keys[0]],
                            projectName = keys[0],
                            projectLang = project.default_lang;

                        Panel.setAttribute('project', projectName);
                        Panel.setAttribute('lang', projectLang);
                        Panel.openProject();

                        PanelUtils.openSitePanel(projectName, projectLang, 1)
                            .then(function (CreatedPanel) {
                                SitePanel = CreatedPanel;
                                Bricks.next.delay(500);
                            });
                    });
                });
            }
        }
    });

    Bricks.addStep({
        title   : QUILocale.get(lg, 'tour.general.bricks.Step1.Title'),
        text    : QUILocale.get(lg, 'tour.general.bricks.Step18.Text'),
        attachTo: {
            element: function () {
                return SitePanel.getElm().getElement('[name="quiqqer.bricks"]');
            },
            on     : 'left'
        },
        buttons : {
            text  : QUILocale.get(lg, 'tour.general.bricks.Button.Weiter'),
            action: function () {
                SitePanel.addEvent('onCategoryEnter', function () {
                    Bricks.next.delay(500)
                });
                SitePanel.getCategory('quiqqer.bricks').click();
            }
        },
        when    : {
            show: function () {
                SitePanel.getElm().getElement('[name="quiqqer.bricks"]').addEvent('click', function () {
                    Bricks.next.delay(500)
                })
            },
            hide: function () {
                SitePanel.getElm().getElement('[name="quiqqer.bricks"]').removeEvent('click', function () {
                    Bricks.next.delay(500)
                })
            }
        }
    });


    Bricks.addStep({
        title   : QUILocale.get(lg, 'tour.general.bricks.Step1.Title'),
        text    : QUILocale.get(lg, 'tour.general.bricks.Step19.Text'),
        attachTo: {
            element: function () {
                var rows    = SitePanel.getElm().getElements('.quiqqer-bricks-site-category-area');
                var counter = 1;
                while (rows === null) {
                    counter++;
                    rows = SitePanel.getElm().getElements('.quiqqer-bricks-site-category-area');
                    if (counter > 10) {
                        break;
                    }
                }
                rows.forEach(function (row) {
                    if (row.getAttribute('data-name') === "footer") {
                        FooterZone = row;
                    }
                });
                var Buttons = FooterZone.getElements('button');
                return FooterZone.getElement('button'); //@todo zufall ... welcher button das genau ist
            },
            on     : 'right'
        },
        buttons : {
            text  : QUILocale.get(lg, 'tour.general.bricks.Button.Weiter'),
            action: function () {
                FooterZone.getElement('button').fireEvent('click');
            }
        },
        when    : {
            show: function () {
                FooterZone.getElement('button').addEvent('click', function () {
                    Bricks.next.delay(500)
                })
            },
            hide: function () {
                FooterZone.getElement('button').removeEvent('click', function () {
                    Bricks.next.delay(500)
                })
            }
        }
    });
    //
    Bricks.addStep({
        title   : QUILocale.get(lg, 'tour.general.bricks.Step1.Title'),
        text    : QUILocale.get(lg, 'tour.general.bricks.Step20.Text'),
        attachTo: {
            element: function () {
                return document.getElement('.qui-window-popup.box')
            },
            on     : 'right'
        },
        buttons : false,
        // {
        // text  : QUILocale.get(lg, 'tour.general.bricks.Button.Weiter'),
        // action: function () {
        //     //console.log(document.getElements('.qui-window-popup.box .qui-window-popup-content.box .qui-elements-list-item.smooth')[0]);
        //     //document.getElements('.qui-window-popup.box .qui-window-popup-content.box .qui-elements-list-item.smooth')[0].fireEvent('click');
        //     var list = QUI.Controls.getByType('qui/controls/elements/List');
        //     console.log(list);
        //     list = list[list.length-1];
        //     console.log(list);
        //     var entries  = list.getElm().getChildren();
        //     var entry = entries[entries.length - 1];
        //     console.log(entry);
        //     entry.click();            //Das funktioniert leider nicht die entries haben keine click funktion
        //     Bricks.next.delay(1000);
        // }
        // },
        when    : {
            show: function () {
                document.getElements('.qui-window-popup.box .qui-window-popup-content.box .qui-elements-list-item.smooth').forEach(function (Item) {
                    Item.addEvent('click', Bricks.next)
                })
            }
        }
    });

    Bricks.addWaitingStepByCSSClass(document, 'button .fa.fa-gear' , 0, 50);

    Bricks.addStep({
        title   : QUILocale.get(lg, 'tour.general.bricks.Step1.Title'),
        text    : QUILocale.get(lg, 'tour.general.bricks.Step21.Text'),
        attachTo: {
            element: function () {
                return FooterZone.getElement('button .fa.fa-gear').getParent()

            },
            on     : 'right'
        },
        buttons : {
            text  : QUILocale.get(lg, 'tour.general.bricks.Button.Weiter'),
            action: function () {
                FooterZone.getElement('button .fa.fa-gear').getParent().getParent().click()
                Bricks.next();

            }
        },
        when    : {
            show: function () {
                FooterZone.getElement('button .fa.fa-gear').getParent().addEvent('click', function () {
                    Bricks.next.delay(500)
                })
            },
            hide: function () {
                FooterZone.getElement('button .fa.fa-gear').getParent().removeEvent('click', function () {
                    Bricks.next.delay(500)
                })
            }
        }
    });

    Bricks.addWaitingStepByCSSClass(document, '.qui-window-popup.box [name="inheritance"]' , 0, 50);

    Bricks.addStep({
        title   : QUILocale.get(lg, 'tour.general.bricks.Step1.Title'),
        text    : QUILocale.get(lg, 'tour.general.bricks.Step22.Text'),
        attachTo: {
            element: function () {
                return document.getElement('.qui-window-popup.box [name="inheritance"]')
            },
            on     : 'right'
        },
        buttons : {
            text  : QUILocale.get(lg, 'tour.general.bricks.Button.Weiter'),
            action: function () {
                Bricks.next();
            }
        },
        when    : {
            show: function () {
                document.getElement('.qui-window-popup.box [name="inheritance"]').addEvent('click', Bricks.next)
            },
            hide: function () {
                document.getElement('.qui-window-popup.box [name="inheritance"]').removeEvent('click', Bricks.next)
            }
        }
    });

    Bricks.addStep({
        title   : QUILocale.get(lg, 'tour.general.bricks.Step1.Title'),
        text    : QUILocale.get(lg, 'tour.general.bricks.Step23.Text'),
        attachTo: {
            element: function () {
                return document.getElement('.qui-window-popup.box [name="submit"]')
            },
            on     : 'right'
        },
        buttons : {
            text  : QUILocale.get(lg, 'tour.general.bricks.Button.Weiter'),
            action: function () {
                document.getElement('.qui-window-popup.box [name="submit"]').fireEvent('click')
            }
        },
        when    : {
            show: function () {
                document.getElement('.qui-window-popup.box [name="submit"]').addEvent('click', Bricks.next)
            },
            hide: function () {
                document.getElement('.qui-window-popup.box [name="submit"]').removeEvent('click', Bricks.next)
            }
        }
    });

    Bricks.addStep({
        title   : QUILocale.get(lg, 'tour.general.bricks.Step1.Title'),
        text    : QUILocale.get(lg, 'tour.general.bricks.Step24.Text'),
        attachTo: {
            element: function () {
                return FooterZone.getElement('button .fa.fa-remove').getParent()
            },
            on     : 'right'
        },
        buttons : {
            text  : QUILocale.get(lg, 'tour.general.bricks.Button.Weiter'),
            action: function () {
                Bricks.next()
            }
        }
    });

    Bricks.addStep({
        title   : QUILocale.get(lg, 'tour.general.bricks.Step1.Title'),
        text    : QUILocale.get(lg, 'tour.general.bricks.Step25.Text'),
        attachTo: {
            element: function () {
                return SitePanel.getElm().getElement('[name = "preview"]')
            },
            on     : 'right'
        },
        buttons : {
            text  : QUILocale.get(lg, 'tour.general.bricks.Button.Weiter'),
            action: function () {
                Bricks.next()
            }
        }
    });

    Bricks.addStep({
        title  : QUILocale.get(lg, 'tour.general.bricks.Step1.Title'),
        text   : QUILocale.get(lg, 'tour.general.bricks.Step26.Text'),
        buttons: {
            text  : QUILocale.get(lg, 'tour.general.bricks.Button.Ende'),
            action: function () {
                Bricks.cancel();
            }
        }
    });


    return Bricks
});