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

        $Engine->assign(array(
            'this'     => $this,
            'children' => $this->_getSites()
        ));

        return $Engine->fetch(dirname(__FILE__).'/SideBox2.html');
    }

    /**
     * Return the site objects
     *
     * @return array
     */
    protected function _getSites()
    {
        $Project = $this->_getProject();
        $site = $this->getAttribute('site');
        $limit = $this->getAttribute('limit');

        if (!$limit) {
            $limit = 2;
        }

        $sitetypes = explode(';', $site);

        $ids = array();
        $types = array();
        $where = array();

        foreach ($sitetypes as $sitetypeEntry) {
            if (is_numeric($sitetypeEntry)) {
                $ids[] = $sitetypeEntry;
                continue;
            }

            $types[] = $sitetypeEntry;
        }

        if (!empty($ids)) {
            $where['id'] = array(
                'type'  => 'IN',
                'value' => $ids
            );
        }

        if (!empty($types)) {
            $where['type'] = array(
                'type'  => 'IN',
                'value' => $types
            );
        }

        return $Project->getSites(array(
            'where_or' => $where,
            'limit'    => $limit,
            'order'    => 'release_from DESC'
        ));
    }
}