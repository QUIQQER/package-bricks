<?php

/**
 * This file contains QUI\Bricks\Controls\SideBox1
 */

namespace QUI\Bricks\Controls;

use QUI;
use QUI\Database\Exception;
use QUI\Interfaces\Projects\Site;

/**
 * Class SocialBox
 *
 * @package quiqqer/bricks
 */
class SideBox1 extends QUI\Control
{
    /**
     * constructor
     *
     * @param array $attributes
     */
    public function __construct(array $attributes = [])
    {
        // default options
        $this->setAttributes([
            'showImage' => true,
            'showTitle' => true,
            'showDescription' => true,
            'showContent' => true,
            'class' => 'quiqqer-bricks-sidebox1',
            'nodeName' => 'article',
            'site' => false,
            'order' => 'release_from DESC'
        ]);

        parent::__construct($attributes);

        $this->setAttribute('cacheable', 0);
    }

    /**
     * @return string
     * @throws Exception
     * @throws QUI\Exception
     */
    public function getBody(): string
    {
        $Engine = QUI::getTemplateManager()->getEngine();

        $Engine->assign([
            'this' => $this,
            'Site' => $this->getSite()
        ]);

        return $Engine->fetch(dirname(__FILE__) . '/SideBox1.html');
    }

    /**
     * Return the site object
     *
     * @return Site
     * @throws Exception
     * @throws QUI\Exception
     * @throws \Exception
     */
    public function getSite(): QUI\Interfaces\Projects\Site
    {
        $Project = $this->getProject();
        $site = $this->getAttribute('site');

        if (is_numeric($site)) {
            try {
                return $Project->get((int)$site);
            } catch (QUI\Exception $Exception) {
                QUI\System\Log::addWarning($Exception->getMessage());

                return $Project->firstChild();
            }
        }

        // order
        switch ($this->getAttribute('order')) {
            case 'name ASC':
            case 'name DESC':
            case 'title ASC':
            case 'title DESC':
            case 'c_date ASC':
            case 'c_date DESC':
            case 'd_date ASC':
            case 'd_date DESC':
            case 'release_from ASC':
            case 'release_from DESC':
                $order = $this->getAttribute('order');
                break;

            default:
                $order = 'release_from DESC';
                break;
        }

        $children = QUI\Projects\Site\Utils::getSitesByInputList(
            $this->getProject(),
            $this->getAttribute('site'),
            [
                'limit' => 1,
                'order' => $order
            ]
        );

        if (isset($children[0])) {
            return $children[0];
        }

        return $Project->firstChild();
    }
}
