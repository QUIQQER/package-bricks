<?php

/**
 * This file contains QUI\Bricks\Children\Listing
 */

namespace QUI\Bricks\Controls\Children;

use QUI;

/**
 * Class Listing
 *
 * @package QUI\Bricks\Controls\Children
 */
class Listing extends QUI\Control
{
    /**
     * constructor
     *
     * @param array $attributes
     */
    public function __construct($attributes = [])
    {
        // default options
        $this->setAttributes([
            'class'          => 'qui-control-brick',
            'limit'          => 2,
            'showSheets'     => false,
            'showImages'     => true,
            'showShort'      => true,
            'showHeader'     => true,
            'showContent'    => true,
            'showTime'       => false,
            'showCreator'    => false,
            'Site'           => true,
            'where'          => false,
            'itemtype'       => 'http://schema.org/ItemList',
            'child-itemtype' => 'https://schema.org/ListItem',
            'child-itemprop' => 'itemListElement',
            'display'        => 'childrenlist',
            'order'          => 'c_date DESC',
            'cacheable'      => 0
        ]);

        parent::__construct($attributes);
    }

    /**
     * Return the inner body of the element
     * Can be overwritten
     *
     * @return String
     */
    public function getBody()
    {
        $Control = new QUI\Controls\ChildrenList();

        $Control->setAttribute('parentInputList', $this->getAttribute('site'));
        $Control->setAttribute('order', $this->getAttribute('order'));
        $Control->setAttribute('display', $this->getAttribute('template'));
        $Control->setAttribute('limit', $this->getAttribute('max'));
        $Control->setAttribute('showShort', $this->getAttribute('showShort'));
        $Control->setAttribute('showSheets', $this->getAttribute('showSheets'));
        $Control->setAttribute('showImages', $this->getAttribute('showImages'));
        $Control->setAttribute('showTime', $this->getAttribute('showTime'));
        $Control->setAttribute('showDate', $this->getAttribute('showDate'));
        $Control->setAttribute('showCreator', $this->getAttribute('showCreator'));
        $Control->setAttribute('showSheets', $this->getAttribute('showSheets'));
        $Control->setAttribute('Site', false);
        $Control->setAttribute('content', $this->getAttribute('content'));

        $Control->setAttribute('frontendTitle', $this->getAttribute('frontendTitle'));
        $Control->setAttribute('showTitle', $this->getAttribute('showTitle'));
        $result = $Control->create();

        $this->addCSSFiles($Control->getCSSFiles());

        return $result;
    }
}
