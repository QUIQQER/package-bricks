<?php

/**
 * This file contains QUI\Bricks\Controls\SideBox3
 */

namespace QUI\Bricks\Controls;

use QUI;

/**
 * Class SocialBox
 *
 * @package quiqqer/bricks
 */
class SideBox3 extends QUI\Control
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
            'showImage'       => true,
            'showTitle'       => true,
            'showDescription' => true,
            'showContent'     => false,
            'class'           => 'quiqqer-bricks-sidebox3',
            'nodeName'        => 'section',
            'site'            => false,
            'limit'           => 3,
            'order'           => 'release_from DESC'
        ));

        $this->addCSSFile(dirname(__FILE__) . '/SideBox3.css');

        parent::__construct($attributes);
    }

    /**
     * (non-PHPdoc)
     *
     * @see \QUI\Control::create()
     */
    public function getBody()
    {
        $Engine = QUI::getTemplateManager()->getEngine();
        $limit  = $this->getAttribute('limit');

        if (!$limit) {
            $limit = 3;
        }

        // order
        switch ($this->getAttribute('order')) {
            case 'name ASC':
            case 'name DESC':
            case 'title ASC':
            case 'title DESC':
            case 'c_date ASC':
            case 'c_date DESC':
            case 'd_date ASC':
            case 'd_date DESC':
            case 'release_from ASC':
            case 'release_from DESC':
                $order = $this->getAttribute('order');
                break;

            default:
                $order = 'release_from DESC';
                break;
        }

        $children = QUI\Projects\Site\Utils::getSitesByInputList(
            $this->_getProject(),
            $this->getAttribute('site'),
            array(
                'limit' => $limit,
                'order' => $order
            )
        );

        $Engine->assign(array(
            'this'     => $this,
            'children' => $children
        ));

        return $Engine->fetch(dirname(__FILE__) . '/SideBox3.html');
    }
}