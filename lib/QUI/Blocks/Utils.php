<?php

/**
 * This file contains \QUI\Blocks\Utils
 */

namespace QUI\Blocks;

use QUI;
use QUI\Utils\XML;

/**
 * Class Utils
 * Blocks helper class
 *
 * @package quiqqer/blocks
 * @author www.pcsg.de (Henning Leutz)
 */

class Utils
{
    /**
     * Return the blocks from a xml file
     *
     * @param String $file
     * @return array
     */
    static function getBlocksFromXML($file)
    {
        if ( !file_exists( $file ) ) {
            return array();
        }

        $Dom  = XML::getDomFromXml( $file );
        $Path = new \DOMXPath( $Dom );

        $blocks = $Path->query( "//quiqqer/blocks/block" );
        $list   = array();

        if ( !$blocks->length ) {
            return $list;
        }

        foreach ( $blocks as $Block )
        {
            /* @var $Block \DOMElement */
            $control     = $Block->getAttribute( 'control' );
            $title       = array();
            $description = array();

            $titleLocale = $Path->query( './title/locale', $Block );
            $descLocale  = $Path->query( './description/locale', $Block );

            if ( $titleLocale->length )
            {
                $title = array(
                    'group' => $titleLocale->item( 0 )->getAttribute( 'group' ),
                    'var'   => $titleLocale->item( 0 )->getAttribute( 'var' )
                );
            }

            if ( $descLocale->length )
            {
                $description = array(
                    'group' => $descLocale->item( 0 )->getAttribute( 'group' ),
                    'var'   => $descLocale->item( 0 )->getAttribute( 'var' )
                );
            }

            $list[] = array(
                'control'     => $control,
                'title'       => $title,
                'description' => $description
            );
        }

        return $list;
    }
}
