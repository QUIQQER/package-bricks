<?php

/**
 * This file contains QUI\Bricks\Controls\SideBox3TitleTop
 */

namespace QUI\Bricks\Controls;

use QUI;

/**
 * Class SocialBox
 *
 * @package quiqqer/bricks
 */
class SideBox3TitleTop extends QUI\Bricks\Controls\SideBox3
{
    /**
     * (non-PHPdoc)
     *
     * @see \QUI\Control::create()
     */
    public function getBody()
    {
        $Engine = QUI::getTemplateManager()->getEngine();
        $limit = $this->getAttribute('limit');

        if (!$limit) {
            $limit = 2;
        }

        $children = QUI\Projects\Site\Utils::getSitesByInputList(
            $this->_getProject(),
            $this->getAttribute('site'),
            array(
                'limit' => $limit,
                'order' => 'release_from DESC'
            )
        );

        $Engine->assign(array(
            'this'     => $this,
            'children' => $children
        ));

        return $Engine->fetch(dirname(__FILE__).'/SideBox3TitleTop.html');
    }
}
