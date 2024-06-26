<?php

/**
 * This file contains QUI\Bricks\Controls\SideBox4
 */

namespace QUI\Bricks\Controls;

use QUI;

/**
 * Class SocialBox
 *
 * @package quiqqer/bricks
 */
class SideBox4 extends QUI\Control
{
    /**
     * constructor
     *
     * @param array $attributes
     */
    public function __construct(array $attributes = [])
    {
        // default options
        $this->setAttributes([
            'showImage' => true,
            'showTitle' => true,
            'showDescription' => true,
            'showContent' => false,
            'site' => false,
            'limit' => 4,
            'order' => 'release_from DESC',
            'cacheable' => 0
        ]);

        parent::__construct($attributes);

        $this->setAttribute('cacheable', 0);
        $this->addCSSFile(dirname(__FILE__) . '/SideBox4.css');
    }

    /**
     * (non-PHPdoc)
     *
     * @see \QUI\Control::create()
     */
    public function getBody(): string
    {
        $Engine = QUI::getTemplateManager()->getEngine();
        $limit = $this->getAttribute('limit');

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
            $this->getProject(),
            $this->getAttribute('site'),
            [
                'limit' => $limit,
                'order' => $order
            ]
        );

        $Engine->assign([
            'this' => $this,
            'children' => $children
        ]);

        return $Engine->fetch(dirname(__FILE__) . '/SideBox4.html');
    }
}
