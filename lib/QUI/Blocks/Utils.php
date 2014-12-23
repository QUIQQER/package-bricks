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

        foreach ( $blocks as $Block ) {
            $list[] = self::parseBlockToArray( $Block, $Path );
        }

        return $list;
    }

    /**
     * Return the template blocks from a xml file
     *
     * @param string $file - path to xm file
     * @return array
     */
    static function getTemplateAreasFromXML($file)
    {
        if ( !file_exists( $file ) ) {
            return array();
        }

        $Dom  = XML::getDomFromXml( $file );
        $Path = new \DOMXPath( $Dom );

        $globalBlocks = $Path->query( "//quiqqer/blocks/templateAreas/areas/area" );
        $typeBlocks   = $Path->query( "//quiqqer/blocks/templateAreas/types/type/area" );

        $list = array();

        if ( $globalBlocks->length )
        {
            foreach ( $globalBlocks as $Block ) {
                $list[] = self::parseBlockToArray( $Block, $Path );
            }
        }

        if ( $typeBlocks->length )
        {
            foreach ( $typeBlocks as $Block ) {
                $list[] = self::parseBlockToArray( $Block, $Path );
            }
        }

        return $list;
    }


    static function getGlobalTemplateAreasFromXML()
    {

    }

    static function getTypeTemplateAreasFromXML($file, $siteType)
    {

    }

    /**
     * parse a <block> xml node to an array
     *
     * @param \DOMElement $Block
     * @param \DOMXPath $Path
     * @return array
     */
    static function parseBlockToArray(\DOMElement $Block, \DOMXPath $Path)
    {
        $control     = $Block->getAttribute( 'control' );
        $name        = $Block->getAttribute( 'name' );
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

        return array(
            'control'     => $control,
            'name'        => $name,
            'title'       => $title,
            'description' => $description
        );
    }
}
