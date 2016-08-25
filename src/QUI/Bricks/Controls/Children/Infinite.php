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

        if (!$childrenPerRow) {
            $childrenPerRow = 3;
        }

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
        $rows     = $this->getAttribute('rows');

        switch ($this->getAttribute('childrenPerRow')) {
            case 2:
                $this->setAttribute('gridClass', 'grid-50');
                break;

            case 3:
                $this->setAttribute('gridClass', 'grid-33');
                break;

            case 4:
                $this->setAttribute('gridClass', 'grid-25');
                break;

            case 5:
                $this->setAttribute('gridClass', 'grid-20');
                break;

            default:
                $this->setAttribute('gridClass', 'grid-25');
        }

        $this->setAttribute(
            'data-qui-options-childrenperrow',
            $this->getAttribute('childrenPerRow')
        );

        $rows = (int)$rows;

        if (empty($rows)) {
            $rows = 1;
        }

        for ($i = 0, $len = $rows; $i < $len; $i++) {
            $Engine->assign(array(
                'children'  => $this->getRow($i),
                'row'       => $i,
                'this'      => $this,
                'gridClass' => $this->getAttribute('gridClass')
            ));

            $children .= $Engine->fetch($this->getRowTemplate());
        }

        // more button
        $listCount = $this->getAttribute('childrenPerRow') * $rows;
        $count     = $this->countChildren();

        $showMoreButton = true;

        if ($count <= $listCount) {
            $showMoreButton = false;
        }

        $Engine->assign(array(
            'this'           => $this,
            'children'       => $children,
            'showMoreBUtton' => $showMoreButton
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
     * Return the number of children
     *
     * @return int
     */
    protected function countChildren()
    {
        $result = QUI\Projects\Site\Utils::getSitesByInputList(
            $this->getProject(),
            $this->getAttribute('site'),
            array('count' => true)
        );

        return (int)$result[0]['count'];
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
