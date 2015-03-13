<?php

/**
 * This file contains QUI\Bricks\Controls\SideBox1
 */

namespace QUI\Bricks\Controls;

use QUI;

/**
 * Class SocialBox
 *
 * @package quiqqer/bricks
 */
class SideBox1 extends QUI\Control
{
    /**
     * constructor
     * @param Array $attributes
     */
    public function __construct($attributes = array())
    {
        // default options
        $this->setAttributes(array(
            'showImage'       => true,
            'showTitle'       => true,
            'showDescription' => true,
            'showContent'     => true,

            'class'    => 'quiqqer-bricks-sidebox1',
            'nodeName' => 'article',
            'site'     => false
        ));

        parent::setAttributes( $attributes );
    }

    /**
     * (non-PHPdoc)
     * @see \QUI\Control::create()
     */
    public function getBody()
    {
        $Engine = QUI::getTemplateManager()->getEngine();

        $Engine->assign(array(
            'this' => $this,
            'Site' => $this->_getSite()
        ));

        return $Engine->fetch( dirname( __FILE__ ) .'/SideBox1.html' );
    }

    /**
     * Return the site object
     *
     * @return QUI\Projects\Site
     */
    protected function _getSite()
    {
        $Project = $this->_getProject();
        $site    = $this->getAttribute( 'site' );

        if ( is_numeric( $site ) )
        {
            try
            {
                return $Project->get( (int)$site );

            } catch ( QUI\Exception $Exception )
            {
                QUI\System\Log::addWarning( $Exception->getMessage() );

                return $Project->firstChild();
            }
        }

        $sitetypes = explode( ';', $site );

        $ids   = array();
        $types = array();
        $where = array();

        foreach ( $sitetypes as $sitetypeEntry )
        {
            if ( is_numeric( $sitetypeEntry ) )
            {
                $ids[] = $sitetypeEntry;
                continue;
            }

            $types[] = $sitetypeEntry;
        }

        if ( !empty( $ids ) )
        {
            $where['id'] = array(
                'type'  => 'IN',
                'value' => $ids
            );
        }

        if ( !empty( $types ) )
        {
            $where['type'] = array(
                'type'  => 'IN',
                'value' => $types
            );
        }

        $result = $Project->getSites(array(
            'where_or' => $where,
            'limit'    => 1,
            'order'    => 'release_from ASC'
        ));

        if ( isset( $result[ 0 ] ) ) {
            return $result[ 0 ];
        }

        return $Project->firstChild();
    }
}