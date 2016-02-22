<?php

namespace QUI\Bricks\Controls\Children;

use QUI;

/**
 * Class Infinite
 * @package QUI\Bricks\Controls\Children
 */
class Infinite extends QUI\Control
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
            'class' => 'quiqqer-bricks-children-infinite',
            'nodeName' => 'section',
            'childrenPerRow' => 4,
            'rows' => 2,
            'site' => '',
            'order' => false,
            'data-qui' => 'package/quiqqer/bricks/bin/Controls/Children/Infinite'
        ));

        $this->addCSSFile(
            dirname(__FILE__) . '/Infinite.css'
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

        $Engine->assign(array(
            'this' => $this,
            'children' => $this->getChildren()
        ));

        return $Engine->fetch(dirname(__FILE__) . '/Infinite.html');
    }

    /**
     * Return the control template
     *
     * @return string
     */
    protected function getTemplate()
    {
        return dirname(__FILE__) . '/Infinite.html';
    }

    /**
     *
     * @param int $start
     * @return array
     */
    protected function getChildren($start = 0)
    {
        $max = $this->getAttribute('childrenPerRow') * $this->getAttribute('rows');

        $children = QUI\Projects\Site\Utils::getSitesByInputList(
            $this->getProject(),
            $this->getAttribute('site'),
            array(
                'limit' => $start . ',' . $max,
                'order' => $this->getAttribute('order')
            )
        );

        return $children;
    }
}
