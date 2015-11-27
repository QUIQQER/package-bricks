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
 * @package QUI\Bricks
 * @author  www.pcsg.de (Henning Leutz) <support@pcsg.de>
 */
class Utils
{
    /**
     * Return the bricks from a xml file
     *
     * @param String $file - path to file
     *
     * @return array
     */
    public static function getBricksFromXML($file)
    {
        if (!file_exists($file)) {
            return array();
        }

        $Dom  = XML::getDomFromXml($file);
        $Path = new \DOMXPath($Dom);

        $bricks = $Path->query("//quiqqer/bricks/brick");
        $list   = array();

        if (!$bricks->length) {
            return $list;
        }

        foreach ($bricks as $Brick) {
            $list[] = self::parseAreaToArray($Brick, $Path);
        }

        return $list;
    }

    /**
     * Return the template bricks from a xml file
     *
     * @param string $file - path to xm file
     * @param string|bool $layoutType - optional, return only the bricks for the specific layout type
     *
     * @return array
     */
    public static function getTemplateAreasFromXML($file, $layoutType = false)
    {
        if (!file_exists($file)) {
            return array();
        }

        $Dom  = XML::getDomFromXml($file);
        $Path = new \DOMXPath($Dom);

        $globalAreas
            = $Path->query("//quiqqer/bricks/templateAreas/areas/area");

        if ($layoutType) {
            $typeAreas = $Path->query(
                "//quiqqer/bricks/templateAreas/layouts/layout[@layout='{$layoutType}']/area"
            );

        } else {
            $typeAreas
                = $Path->query("//quiqqer/bricks/templateAreas/layouts/layout/area");
        }


        $list = array();

        if ($globalAreas->length) {
            foreach ($globalAreas as $Area) {
                $list[] = self::parseAreaToArray($Area, $Path);
            }
        }

        if ($typeAreas->length) {
            foreach ($typeAreas as $Area) {
                $list[] = self::parseAreaToArray($Area, $Path);
            }
        }

        return $list;
    }

    public static function getGlobalTemplateAreasFromXML()
    {

    }

    /**
     * @param $file
     * @param $siteType
     */
    public static function getTypeTemplateAreasFromXML($file, $siteType)
    {

    }

    /**
     * parse a <area> xml node to an array
     *
     * @param \DOMElement $Brick
     * @param \DOMXPath $Path
     *
     * @return array
     */
    public static function parseAreaToArray(\DOMElement $Brick, \DOMXPath $Path)
    {
        $control     = $Brick->getAttribute('control');
        $name        = $Brick->getAttribute('name');
        $title       = array();
        $description = array();

        $titleLocale = $Path->query('./title/locale', $Brick);
        $descLocale  = $Path->query('./description/locale', $Brick);

        if ($titleLocale->length) {
            $title = array(
                'group' => $titleLocale->item(0)->getAttribute('group'),
                'var'   => $titleLocale->item(0)->getAttribute('var')
            );
        }

        if ($descLocale->length) {
            $description = array(
                'group' => $descLocale->item(0)->getAttribute('group'),
                'var'   => $descLocale->item(0)->getAttribute('var')
            );
        }

        return array(
            'control'     => $control,
            'name'        => $name,
            'title'       => $title,
            'description' => $description,
            'inheritance' => $Brick->getAttribute('inheritance')
        );
    }

    /**
     *
     * @param Project $Project
     * @param String $areaName
     *
     * @return bool
     */
    public static function hasInheritance(Project $Project, $areaName)
    {
        $template = $Project->getAttribute('template');

        // getAreasByProject
        $brickXML = realpath(OPT_DIR . $template . '/bricks.xml');
        $bricks   = self::getTemplateAreasFromXML($brickXML);

        foreach ($bricks as $brickData) {
            if ($brickData['name'] != $areaName) {
                continue;
            }

            if (isset($brickData['inheritance']) && $brickData['inheritance']) {
                return true;
            }

            return false;
        }

        return true;
    }
}
