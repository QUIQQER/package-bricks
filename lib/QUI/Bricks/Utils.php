<?php

/**
 * This file contains \QUI\Bricks\Utils
 */

namespace QUI\Bricks;

use QUI;
use QUI\Utils\XML;
use QUI\Projects\Project;

/**
 * Class Utils
 * Bricks helper class
 *
 * @package quiqqer/bricks
 * @author www.pcsg.de (Henning Leutz)
 */

class Utils
{
    /**
     * Return the bricks from a xml file
     *
     * @param String $file
     * @return array
     */
    static function getBricksFromXML($file)
    {
        if ( !file_exists( $file ) ) {
            return array();
        }

        $Dom  = XML::getDomFromXml( $file );
        $Path = new \DOMXPath( $Dom );

        $bricks = $Path->query( "//quiqqer/bricks/brick" );
        $list   = array();

        if ( !$bricks->length ) {
            return $list;
        }

        foreach ( $bricks as $Brick ) {
            $list[] = self::parseAreaToArray( $Brick, $Path );
        }

        return $list;
    }

    /**
     * Return the template bricks from a xml file
     *
     * @param string $file - path to xm file
     * @param string|bool $siteType - optional, return only the bricks for the specific site type
     * @return array
     */
    static function getTemplateAreasFromXML($file, $siteType=false)
    {
        if ( !file_exists( $file ) ) {
            return array();
        }

        $Dom  = XML::getDomFromXml( $file );
        $Path = new \DOMXPath( $Dom );

        $globalAreas = $Path->query( "//quiqqer/bricks/templateAreas/areas/area" );

        if ( $siteType )
        {
            $typeAreas = $Path->query(
                "//quiqqer/bricks/templateAreas/types/type[@type='{$siteType}']/area"
            );

        } else
        {
            $typeAreas = $Path->query( "//quiqqer/bricks/templateAreas/types/type/area" );
        }


        $list = array();

        if ( $globalAreas->length )
        {
            foreach ( $globalAreas as $Area ) {
                $list[] = self::parseAreaToArray( $Area, $Path );
            }
        }

        if ( $typeAreas->length )
        {
            foreach ( $typeAreas as $Area ) {
                $list[] = self::parseAreaToArray( $Area, $Path );
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
     * parse a <area> xml node to an array
     *
     * @param \DOMElement $Brick
     * @param \DOMXPath $Path
     * @return array
     */
    static function parseAreaToArray(\DOMElement $Brick, \DOMXPath $Path)
    {
        $control     = $Brick->getAttribute( 'control' );
        $name        = $Brick->getAttribute( 'name' );
        $title       = array();
        $description = array();

        $titleLocale = $Path->query( './title/locale', $Brick );
        $descLocale  = $Path->query( './description/locale', $Brick );

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
            'description' => $description,
            'inheritance' => $Brick->getAttribute( 'inheritance' )
        );
    }

    /**
     *
     * @param Project $Project
     * @param String $areaName
     * @return bool
     */
    static function hasInheritance(Project $Project, $areaName)
    {
        $template = $Project->getAttribute( 'template' );

        // getAreasByProject
        $brickXML = realpath( OPT_DIR . $template .'/bricks.xml' );
        $bricks   = self::getTemplateAreasFromXML( $brickXML );

        foreach ( $bricks as $brickData )
        {
            QUI\Log::writeRecursive( $brickData );
        }

        return true;
    }
}
