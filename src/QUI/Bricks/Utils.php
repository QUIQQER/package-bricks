<?php

/**
 * This file contains \QUI\Bricks\Utils
 */

namespace QUI\Bricks;

use DOMElement;
use DOMNode;
use DOMXPath;
use QUI;
use QUI\Projects\Project;
use QUI\Utils\Text\XML;

use function file_exists;
use function md5;
use function realpath;
use function trim;

use const OPT_DIR;
use const USR_DIR;

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
    public static function getBricksFromXML(string $file): array
    {
        if (!file_exists($file)) {
            return [];
        }

        $Dom = XML::getDomFromXml($file);
        $Path = new DOMXPath($Dom);

        $bricks = $Path->query("//quiqqer/bricks/brick");
        $list = [];

        if (!$bricks->length) {
            return $list;
        }

        /* @var $Brick DOMElement */
        foreach ($bricks as $Brick) {
            if (!method_exists($Brick, 'getAttribute')) {
                continue;
            }

            if ($Brick->getAttribute('control') == '*') {
                continue;
            }

            $list[] = self::parseAreaToArray($Brick, $Path);
        }

        return $list;
    }

    /**
     * Return the template bricks from a xml file
     *
     * @param string $file - path to xm file
     * @param bool|string $layoutType - optional, return only the bricks for the specific layout type
     * @param bool|string $siteType - optional, return only the bricks for the specific site type
     *
     * @return array
     */
    public static function getTemplateAreasFromXML(
        string $file,
        bool | string $layoutType = false,
        bool | string $siteType = false
    ): array {
        if (!file_exists($file)) {
            return [];
        }

        $Dom = XML::getDomFromXml($file);
        $Path = new DOMXPath($Dom);

        $globalAreas = $Path->query("//quiqqer/bricks/templateAreas/areas/area");

        if ($layoutType) {
            $typeAreas = $Path->query(
                "//quiqqer/bricks/templateAreas/layouts/layout[@layout='$layoutType']/area"
            );
        } else {
            $typeAreas = $Path->query("//quiqqer/bricks/templateAreas/layouts/layout/area");
        }

        if ($siteType) {
            $siteTypeAreas = $Path->query(
                "//quiqqer/bricks/templateAreas/siteTypes/type[@type='$siteType']/area"
            );
        } else {
            $siteTypeAreas = $Path->query(
                "//quiqqer/bricks/templateAreas/siteTypes/type/area"
            );
        }


        $list = [];

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

        if ($siteTypeAreas->length) {
            foreach ($siteTypeAreas as $Area) {
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
     * @param DOMNode|DOMElement $Brick
     * @param DOMXPath $Path
     *
     * @return array
     */
    public static function parseAreaToArray(DOMNode | DOMElement $Brick, DOMXPath $Path): array
    {
        $control = '';
        $name = '';

        if (method_exists($Brick, 'getAttribute')) {
            $control = $Brick->getAttribute('control');
            $name = $Brick->getAttribute('name');
        }

        $hasContent = 1;
        $cacheable = 1;
        $deprecated = 0;

        if (
            method_exists($Brick, 'getAttribute')
            && method_exists($Brick, 'hasAttribute')
            && $Brick->hasAttribute('deprecated')
            && (int)$Brick->getAttribute('deprecated') === 1
        ) {
            $deprecated = 1;
        }

        if (
            method_exists($Brick, 'getAttribute')
            && method_exists($Brick, 'hasAttribute')
            && $Brick->hasAttribute('hasContent')
            && (int)$Brick->getAttribute('hasContent') === 0
        ) {
            $hasContent = 0;
        }

        if (
            method_exists($Brick, 'getAttribute')
            && method_exists($Brick, 'hasAttribute')
            && $Brick->hasAttribute('cacheable')
            && (int)$Brick->getAttribute('cacheable') === 0
        ) {
            $cacheable = 0;
        }

        $title = [];
        $description = [];

        $titleLocale = $Path->query('./title/locale', $Brick);
        $descLocale = $Path->query('./description/locale', $Brick);

        if (
            $titleLocale->length
            && $titleLocale->item(0)
            && method_exists($titleLocale->item(0), 'getAttribute')
        ) {
            $title = [
                'group' => $titleLocale->item(0)->getAttribute('group'),
                'var' => $titleLocale->item(0)->getAttribute('var')
            ];
        }

        if (
            $descLocale->length
            && $descLocale->item(0)
            && method_exists($descLocale->item(0), 'getAttribute')
        ) {
            $description = [
                'group' => $descLocale->item(0)->getAttribute('group'),
                'var' => $descLocale->item(0)->getAttribute('var')
            ];
        }

        return [
            'control' => $control,
            'hasContent' => $hasContent,
            'cacheable' => $cacheable,
            'name' => $name,
            'title' => $title,
            'description' => $description,
            'inheritance' => method_exists($Brick, 'getAttribute') ? $Brick->getAttribute('inheritance') : '',
            'priority' => method_exists($Brick, 'getAttribute') ? $Brick->getAttribute('priority') : '',
            'deprecated' => $deprecated
        ];
    }

    /**
     *
     * @param Project $Project
     * @param String $areaName
     *
     * @return bool
     */
    public static function hasInheritance(
        Project $Project,
        string $areaName
    ): bool {
        $template = $Project->getAttribute('template');

        // getAreasByProject
        $brickXML = realpath(OPT_DIR . $template . '/bricks.xml');
        $bricks = self::getTemplateAreasFromXML($brickXML);

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

    /**
     * List of available bricks.xml files
     *
     * @return array
     */
    public static function getBricksXMLFiles(): array
    {
        $cache = 'quiqqer/bricks/availableBrickFiles';

        try {
            return QUI\Cache\Manager::get($cache);
        } catch (QUI\Exception) {
        }

        $PKM = QUI::getPackageManager();
        $Projects = QUI::getProjectManager();
        $packages = $PKM->getInstalled();
        $result = [];

        // package bricks
        foreach ($packages as $package) {
            $bricksXML = OPT_DIR . $package['name'] . '/bricks.xml';

            if (file_exists($bricksXML)) {
                $result[] = $bricksXML;
            }
        }

        // project bricks
        $projects = $Projects->getProjects();

        foreach ($projects as $project) {
            $bricksXML = USR_DIR . $project . '/bricks.xml';

            if (file_exists($bricksXML)) {
                $result[] = $bricksXML;
            }
        }


        QUI\Cache\Manager::set($cache, $result);

        return $result;
    }

    /**
     * Return all available attributes for a brick
     *
     * @param Brick $Brick
     * @return array
     */
    public static function getAttributesForBrick(Brick $Brick): array
    {
        $attributes = [];
        $files = Panel::getInstance()->getXMLFilesForBricks($Brick);

        // main path
        $type = $Brick->getAttribute('type');
        $type = '\\' . trim($type, '\\');

        $path = '//quiqqer/bricks/brick[@control="' . $type . '"]';
        $cache = 'quiqqer/bricks/' . md5($type) . '/attributes';

        try {
            return QUI\Cache\Manager::get($cache);
        } catch (QUI\Exception) {
        }


        $settingsPath = $path . '/settings/setting';
        $categoriesPath = $path . '/window/categories/category/settings';

        foreach ($files as $file) {
            $Dom = QUI\Utils\Text\XML::getDomFromXml($file);
            $Path = new DOMXPath($Dom);

            // settings
            $settings = $Path->query($settingsPath);

            foreach ($settings as $Setting) {
                if (method_exists($Setting, 'getAttribute')) {
                    $attributes[] = $Setting->getAttribute('name');
                }
            }

            // categories
            $categories = $Path->query($categoriesPath);

            /* @var $Settings DOMElement */
            foreach ($categories as $Settings) {
                $children = $Settings->childNodes;

                /* @var $Child DOMElement */
                foreach ($children as $Child) {
                    if (!method_exists($Child, 'getAttribute')) {
                        continue;
                    }

                    switch ($Child->nodeName) {
                        case 'input':
                        case 'textarea':
                            $attributes[] = $Child->getAttribute('conf');
                            break;
                    }
                }
            }
        }

        QUI\Cache\Manager::set($cache, $attributes);

        return $attributes;
    }
}
