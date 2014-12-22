
/**
 * Block manager
 *
 * @module package/quiqqer/blocks/bin/Manager
 * @author www.pcsg.de (Henning Leutz)
 */

define('package/quiqqer/blocks/bin/Manager', [

    'qui/QUI',
    'qui/controls/desktop/Panel',
    'qui/controls/buttons/Select',
    'qui/controls/buttons/Button',
    'qui/controls/buttons/Seperator',
    'controls/grid/Grid',
    'Locale',
    'Projects',
    'Ajax'

], function(QUI, QUIPanel, QUISelect, QUIButton, QUISeperator, Grid, QUILocale, Projects, Ajax)
{
    "use strict";

    var lg = 'quiqqer/blocks';

    return new Class({

        Extends : QUIPanel,
        Type    : 'package/quiqqer/blocks/bin/Manager',

        Binds : [
            'loadBlocksFromProject',
            'refresh',
            '$onCreate',
            '$onResize'
        ],

        options : {
            title : QUILocale.get( lg, 'menu.blocks.text' )
        },

        initialize : function(options)
        {
            this.parent( options );

            this.$Grid = false;

            this.addEvents({
                onCreate : this.$onCreate,
                onResize : this.$onResize
            });
        },

        /**
         * Refresh the panel data
         */
        refresh : function()
        {
            if ( !this.$Elm ) {
                return;
            }

            var self = this;

            this.Loader.show();

            this.getBlocksFromProject(this.$ProjectSelect.getValue(), function(result)
            {

                console.log( result );

                self.Loader.hide();

            });
        },


        /**
         * event : on create
         */
        $onCreate : function()
        {
            var self = this;

            // Buttons
            this.$ProjectSelect = new QUISelect({
                name   : 'projects',
                events : {
                    onChange : this.refresh
                }
            });

            this.addButton( this.$ProjectSelect );
            this.addButton( new QUISeperator() );

            this.addButton(
                new QUIButton({
                    text : 'Block hinzufügen'
                })
            );

            // Grid
            var Container = new Element('div').inject(
                this.getContent()
            );

            this.$Grid = new Grid( Container, {
                columnModel : [{
                    header    : QUILocale.get( 'quiqqer/system', 'id' ),
                    dataIndex : 'id',
                    dataType  : 'integer',
                    width     : 40
                }, {
                    header    : QUILocale.get( 'quiqqer/system', 'title' ),
                    dataIndex : 'title',
                    dataType  : 'string',
                    width     : 140
                }, {
                    header    : QUILocale.get( 'quiqqer/system', 'description' ),
                    dataIndex : 'description',
                    dataType  : 'string',
                    width     : 300
                }, {
                    header    : QUILocale.get( lg, 'block.type' ),
                    dataIndex : 'type',
                    dataType  : 'string',
                    width     : 200
                }]
            });

            this.Loader.show();

            Projects.getList(function(projects)
            {
                for ( var project in projects )
                {
                    if ( !projects.hasOwnProperty( project ) ) {
                        continue;
                    }

                    self.$ProjectSelect.appendChild(
                        project, project, 'icon-home'
                    );
                }

                self.$ProjectSelect.setValue(
                    self.$ProjectSelect.firstChild().getAttribute( 'value' )
                );
            });
        },

        /**
         * event : on resize
         */
        $onResize : function()
        {
            if ( !this.$Grid ) {
                return;
            }

            var Body = this.getContent();

            if ( !Body ) {
                return;
            }


            var size = Body.getSize();

            this.$Grid.setHeight( size.y - 40 );
            this.$Grid.setWidth( size.x - 40 );
        },

        /**
         * Return the blocksf from a project
         *
         * @param {String} project - name of the project
         * @param {Function} callback - callback function
         */
        getBlocksFromProject : function(project, callback)
        {
            Ajax.get('package_quiqqer_blocks_ajax_project_getBlocks', callback, {
                'package' : 'quiqqer/blocks',
                project   : JSON.encode({
                    name : project
                })
            });
        }
    });
});
