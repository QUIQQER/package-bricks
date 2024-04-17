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
     *
     * @param array $attributes
     */
    public function __construct($attributes = [])
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
     * (non-PHPdoc)
     *
     * @see \QUI\Control::create()
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
     * @return QUI\Projects\Site
     */
    public function getSite()
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
