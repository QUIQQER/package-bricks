<?php

/**
 * This file contains QUI\Bricks\Controls\Children\Slider
 */
namespace QUI\Bricks\Controls\Children;

use QUI;

/**
 * Class Infinite
 * @package QUI\Bricks\Controls\Children
 */
class Slider extends QUI\Control
{
    /**
     * constructor
     *
     * @param array $attributes
     */
    public function __construct($attributes = array())
    {
        // default options
        $this->setAttributes(array(
            'class' => 'quiqqer-bricks-children-slider',
            'nodeName' => 'section',
            'site' => '',
            'order' => false,
            'data-qui' => 'package/quiqqer/bricks/bin/Controls/Children/Slider',
            'height' => 200
        ));

        $this->addCSSFile(
            dirname(__FILE__) . '/Slider.css'
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
        $Engine = QUI::getTemplateManager()->getEngine();

        if (!$this->getAttribute('height')) {
            $this->setAttribute('height', 200);
        }

        $Engine->assign(array(
            'this' => $this,
            'children' => $this->getChildren()
        ));

        return $Engine->fetch(dirname(__FILE__) . '/Slider.html');
    }

    /**
     * Return the control template
     *
     * @return string
     */
    protected function getTemplate()
    {
        return dirname(__FILE__) . '/Slider.html';
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
            array(
                'order' => $this->getAttribute('order'),
                'limit' => false
            )
        );

        return $children;
    }
}
