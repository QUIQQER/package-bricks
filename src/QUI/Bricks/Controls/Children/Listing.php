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
    public function __construct($attributes = array())
    {
        // default options
        $this->setAttributes(array(
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
            'child-itemtype' => 'http://schema.org/NewsArticle',
            'display'        => 'childrenlist',
            'order'          => 'c_date DESC'
        ));

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
        $Control->setAttribute('showImages', $this->getAttribute('showImages'));
        $Control->setAttribute('showTime', $this->getAttribute('showTime'));
        $Control->setAttribute('showDate', $this->getAttribute('showDate'));
        $Control->setAttribute('showCreator', $this->getAttribute('showCreator'));
        $Control->setAttribute('showSheets', $this->getAttribute('showSheets'));
        $Control->setAttribute('Site', false);

        $Control->setAttribute('showTitle', $this->getAttribute('showTitle'));
        $Control->setAttribute('showBrickTitle', $this->getAttribute('showBrickTitle'));
        $Control->setAttribute('title', $this->getAttribute('title'));
        $Control->setAttribute('content', $this->getAttribute('content'));


        return $Control->create();
    }
}
