<?php

/**
 * This file contains QUI\Bricks\Panel
 */

namespace QUI\Bricks;

use QUI;

/**
 * Class Panel
 * - Helper class for the brick panel in the administration
 *
 * @package QUI\Bricks
 */
class Panel extends QUI\Utils\Singleton
{
    /**
     * @param integer $brickId
     * @param string $category
     *
     * @return string
     */
    public function getCategoryFromBrick($brickId, $category)
    {
        $BrickManager = QUI\Bricks\Manager::init();
        $Brick        = $BrickManager->getBrickById($brickId);
        $type         = $Brick->getAttribute('type');

        $cacheName = 'quiqqer/bricks/categories/category/'.$type.'/'.$category;

        try {
            return QUI\Cache\Manager::get($cacheName);
        } catch (QUI\Exception $Exception) {
        }


        $files = Utils::getBricksXMLFiles();
        $path  = $this->getPath($Brick);
        $path  = $path.'/window';

        $Settings = QUI\Utils\XML\Settings::getInstance();
        $Settings->setXMLPath($path);

        $result = '';

        try {
            $result = $Settings->getCategoriesHtml($files, $category);
            QUI\Cache\Manager::set($cacheName, $result);
        } catch (\Exception $Exception) {
            QUI\System\Log::writeException($Exception);
        }

        return $result;
    }

    /**
     * @param string|integer $brickId
     * @return array
     */
    public function getCategoriesFromBrick($brickId)
    {
        $BrickManager = QUI\Bricks\Manager::init();
        $Brick        = $BrickManager->getBrickById($brickId);

        $xmlFiles = $this->getXMLFilesForBricks($Brick);
        $path     = $this->getPath($Brick);
        $path     = $path.'/window';

        $Settings = QUI\Utils\XML\Settings::getInstance();
        $Settings->setXMLPath($path);

        $categories = array();

        foreach ($xmlFiles as $file) {
            $panel      = $Settings->getPanel($file);
            $categories = array_merge(
                $categories,
                $panel['categories']->toArray()
            );
        }

        // locale
        foreach ($categories as $key => $category) {
            if (isset($category['title']) && is_array($category['title'])) {
                $categories[$key]['text'] = QUI::getLocale()->get(
                    $category['title'][0],
                    $category['title'][1]
                );

                $categories[$key]['title'] = QUI::getLocale()->get(
                    $category['title'][0],
                    $category['title'][1]
                );
            }

            if (empty($category['text']) && !empty($category['title'])) {
                $categories[$key]['text'] = $category['title'];
            }
        }

        return $categories;
    }

    /**
     * @param Brick $Brick
     * @return array
     */
    public function getXMLFilesForBricks(Brick $Brick)
    {
        $path = $this->getPath($Brick);

        $xmlFiles = Utils::getBricksXMLFiles();
        $result   = array();

        foreach ($xmlFiles as $xmlFile) {
            try {
                $Dom    = QUI\Utils\Text\XML::getDomFromXml($xmlFile);
                $Path   = new \DOMXPath($Dom);
                $bricks = $Path->query($path);

                if ($bricks->length) {
                    $result[] = $xmlFile;
                }
            } catch (QUI\Exception $Exception) {
                continue;
            }
        }

        return $result;
    }

    /**
     * @param Brick $Brick
     * @return string
     */
    protected function getPath(Brick $Brick)
    {
        $type = $Brick->getAttribute('type');
        $type = '\\'.trim($type, '\\');
        $path = '//quiqqer/bricks/brick[@control="'.$type.'"]';

        return $path;
    }
}
