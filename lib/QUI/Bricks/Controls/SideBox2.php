<?php

/**
 * This file contains QUI\Bricks\Controls\SideBox2
 */

namespace QUI\Bricks\Controls;

use QUI;

/**
 * Class SocialBox
 *
 * @package quiqqer/bricks
 */
class SideBox2 extends QUI\Control
{
    /**
     * constructor
     *
     * @param Array $attributes
     */
    public function __construct($attributes = array())
    {
        // default options
        $this->setAttributes(array(
            'showImage'          => true,
            'showTitle'          => true,
            'showDescription'    => true,
            'showContent'        => false,
            'class'              => 'quiqqer-bricks-sidebox2',
            'nodeName'           => 'section',
            'site'               => false,
            'limit'              => 2,
            'grid-class-row'     => 'row',
            'grid-class-article' => '6u'
        ));

        parent::setAttributes($attributes);
    }

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

        return $Engine->fetch(dirname(__FILE__).'/SideBox2.html');
    }
}