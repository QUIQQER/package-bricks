<?php

/**
 * This file contains QUI\Bricks\Controls\Children\Slider
 */

namespace QUI\Bricks\Controls\Children;

use QUI;

/**
 * Class Slider
 * @package QUI\Bricks\Controls\Children
 */
class Slider extends QUI\Control
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
            'class'       => 'quiqqer-bricks-children-slider',
            'nodeName'    => 'section',
            'site'        => '',
            'order'       => false,
            'limit'       => false,
            'moreLink'    => false,
            'data-qui'    => 'package/quiqqer/bricks/bin/Controls/Children/Slider',
            'template'    => null, // default -> onlyImage

            'data-qui-options-usemobile' => false
        ]);

        $this->addCSSFile(
            dirname(__FILE__).'/Slider.css'
        );

        parent::__construct($attributes);
    }

    /**
     * (non-PHPdoc)
     *
     * @see \QUI\Control::create()
     */
    public function getBody()
    {
        $Engine   = QUI::getTemplateManager()->getEngine();
        $MoreLink = null;

        if (!$this->getAttribute('height')) {
            $this->setAttribute('slideHeight', 200);
        }

        if ($this->getAttribute('moreLink')) {
            try {
                $MoreLink = QUI\Projects\Site\Utils::getSiteByLink($this->getAttribute('moreLink'));
            } catch (QUI\Exception $Exception) {
            }
        }

        $template = $this->getTemplate();

        switch ($this->getAttribute('template')) {
            case 'onlyImage':
                $template = dirname(__FILE__).'/Slider.OnlyImage.html';
                break;
            case 'imageAndText':
                $template = dirname(__FILE__).'/Slider.ImageAndText.html';

                if (!$this->getAttribute('slideHeight')) {
                    $this->setAttribute('slideHeight', 400);
                }
                break;
        }

        $Engine->assign([
            'this'     => $this,
            'children' => $this->getChildren(),
            'MoreLink' => $MoreLink
        ]);

        return $Engine->fetch($template);
    }

    /**
     * Return the control template
     *
     * @return string
     */
    protected function getTemplate()
    {
        return dirname(__FILE__).'/Slider.OnlyImage.html';
    }

    /**
     * Return the children
     *
     * @param int $start
     * @return array
     */
    protected function getChildren($start = 0)
    {
        $children = QUI\Projects\Site\Utils::getSitesByInputList(
            $this->getProject(),
            $this->getAttribute('site'),
            [
                'order' => $this->getAttribute('order'),
                'limit' => $this->getAttribute('limit')
            ]
        );

        return $children;
    }
}
