<?php

/**
 * This file contains QUI\Bricks\Controls\Children\Infinite
 */
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
        $childrenPerRow = $this->getAttribute('childrenPerRow');
        $rows           = $this->getAttribute('rows');

        // default options
        $this->setAttributes(array(
            'class'          => 'quiqqer-bricks-children-infinite',
            'nodeName'       => 'section',
            'childrenPerRow' => $childrenPerRow,
            'rows'           => $rows,
            'site'           => '',
            'order'          => false,
            'data-qui'       => 'package/quiqqer/bricks/bin/Controls/Children/Infinite'
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
        $Engine   = QUI::getTemplateManager()->getEngine();
        $children = '';

        switch ($this->getAttribute('childrenPerRow')) {
            case 2 :
                $this->setAttribute('gridClass', 'grid-50');
                break;
            case 3 :
                $this->setAttribute('gridClass', 'grid-33');
                break;
            case 4 :
                $this->setAttribute('gridClass', 'grid-25');
                break;
            case 5 :
                $this->setAttribute('gridClass', 'grid-20');
                break;
            default :
                $this->setAttribute('gridClass', 'grid-25');
        }



        $this->setAttribute(
            'data-qui-options-childrenperrow',
            $this->getAttribute('childrenPerRow')

        );

        for ($i = 0, $len = (int)$this->getAttribute('rows'); $i < $len; $i++) {
            $Engine->assign(array(
                'children' => $this->getRow($i),
                'row'      => $i,
                'this'     => $this,
                'gridClass' => $this->getAttribute('gridClass')
            ));

            $children .= $Engine->fetch($this->getRowTemplate());
        }

        $Engine->assign(array(
            'this'     => $this,
            'children' => $children
        ));

        return $Engine->fetch(dirname(__FILE__) . '/Infinite.html');
    }

    /**
     * Return the control template
     *
     * @return string
     */
    public function getTemplate()
    {
        return dirname(__FILE__) . '/Infinite.html';
    }

    /**
     * Return the row template
     *
     * @return string
     */
    public function getRowTemplate()
    {
        return dirname(__FILE__) . '/InfiniteRow.html';
    }

    /**
     * Return the children
     *
     * @param int $start
     * @return array
     */
    protected function getChildren($start = 0)
    {
        $max = $this->getAttribute('childrenPerRow');

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

    /**
     * Return the children of the row
     *
     * @param integer $row
     * @return array
     */
    public function getRow($row)
    {
        $perRow = $this->getAttribute('childrenPerRow');
        $start  = (int)$row * $perRow;

        return $this->getChildren($start);
    }
}
