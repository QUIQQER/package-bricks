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
            'class' => 'quiqqer-bricks-children-slider',
            'nodeName' => 'section',
            'site' => '',
            'order' => false,
            'limit' => false,
            'moreLink' => false,
            'data-qui' => 'package/quiqqer/bricks/bin/Controls/Children/Slider',
            'template' => false, // default -> onlyImage
            'data-qui-options-usemobile' => false
        ]);

        parent::__construct($attributes);

        $this->setAttribute('cacheable', 0);

        $this->addCSSFiles([
            dirname(__FILE__) . '/Slider.OnlyImage.css',
            dirname(__FILE__) . '/Slider.ImageAndText.css'
        ]);
    }

    /**
     * (non-PHPdoc)
     *
     * @see \QUI\Control::create()
     */
    public function getBody()
    {
        $Engine = QUI::getTemplateManager()->getEngine();
        $MoreLink = null;

        if (!$this->getAttribute('slideHeight')) {
            $this->setAttribute('slideHeight', $this->getAttribute('height'));
        }

        if ($this->getAttribute('moreLink')) {
            try {
                $MoreLink = QUI\Projects\Site\Utils::getSiteByLink($this->getAttribute('moreLink'));
            } catch (QUI\Exception $Exception) {
            }
        }

        $template = $this->getTemplate();
        $css = $this->getTemplate();

        switch ($this->getAttribute('template')) {
            case 'onlyImage':
                $template = dirname(__FILE__) . '/Slider.OnlyImage.html';
                $css = dirname(__FILE__) . '/Slider.OnlyImage.css';
                break;
            case 'imageAndText':
                $template = dirname(__FILE__) . '/Slider.ImageAndText.html';
                $css = dirname(__FILE__) . '/Slider.ImageAndText.css';

                if (!$this->getAttribute('slideHeight')) {
                    $this->setAttribute('slideHeight', 600);
                }
                break;
        }

        if (!$this->getAttribute('slideHeight')) {
            $this->setAttribute('slideHeight', 200);
        }

        $Engine->assign([
            'this' => $this,
            'children' => $this->getChildren(),
            'MoreLink' => $MoreLink
        ]);

        $this->addCSSFile($css);

        return $Engine->fetch($template);
    }

    /**
     * Return the control template
     *
     * @return string
     */
    protected function getTemplate()
    {
        return dirname(__FILE__) . '/Slider.OnlyImage.html';
    }

    /**
     * Return the control css
     *
     * @return string
     */
    protected function getCSS()
    {
        return dirname(__FILE__) . '/Slider.OnlyImage.css';
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
