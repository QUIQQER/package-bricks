/**
 *
 * @module package/quiqqer/bricks/bin/Controls/BoxContent
 *
 * @require qui/controls/elements/FormList
 * @require css!package/quiqqer/bricks/bin/Controls/BoxContent.css
 */
define('package/quiqqer/bricks/bin/Controls/BoxContent', [

    'qui/controls/elements/FormList',

    'css!package/quiqqer/bricks/bin/Controls/BoxContent.css'

], function(QUIFormList)
{
   "use strict";

   return new Class({

       Extends : QUIFormList,
       Type    : 'package/quiqqer/bricks/bin/Controls/BoxContent',

       initialize : function(options)
       {
           this.parent( options );

           this.setAttribute(
               'entry',

               '<div class="quiqqer-bricks-BoxContent-entry">' +
                   '<label>' +
                       '<span>Überschrift</span>' +
                       '<input type="text" name="title" />' +
                   '</label>' +
                   '<label>' +
                       '<span>Text</span>' +
                       '<textarea name="text"></textarea>' +
                   '<label>' +
               '</div>'
           );
       }
   });
});

