<?php

/**
 * This file contains QUI\Bricks\Controls\Children\Infinite
 */

namespace QUI\Bricks\Controls\Children;

use QUI;
use QUI\Database\Exception;

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
    public function __construct(array $attributes = [])
    {
        $childrenPerRow = $this->getAttribute('childrenPerRow');
        $rows = $this->getAttribute('rows');

        if (!$childrenPerRow) {
            $childrenPerRow = 3;
        }

        // default options
        $this->setAttributes([
            'class' => 'quiqqer-bricks-children-infinite',
            'nodeName' => 'section',
            'childrenPerRow' => $childrenPerRow,
            'rows' => $rows,
            'site' => '',
            'order' => false,
            'data-qui' => 'package/quiqqer/bricks/bin/Controls/Children/Infinite'
        ]);

        parent::__construct($attributes);

        $this->setAttribute('cacheable', 0);

        $this->addCSSFile(
            dirname(__FILE__) . '/Infinite.css'
        );
    }

    /**
     * (non-PHPdoc)
     *
     * @see \QUI\Control::create()
     */
    public function getBody(): string
    {
        $Engine = QUI::getTemplateManager()->getEngine();
        $children = '';
        $rows = $this->getAttribute('rows');

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
            $Engine->assign([
                'children' => $this->getRow($i),
                'row' => $i,
                'this' => $this,
                'gridClass' => $this->getAttribute('gridClass')
            ]);

            $children .= $Engine->fetch($this->getRowTemplate());
        }

        // more button
        $listCount = $this->getAttribute('childrenPerRow') * $rows;
        $count = $this->countChildren();

        $showMoreButton = true;

        if ($count <= $listCount) {
            $showMoreButton = false;
        }

        $Engine->assign([
            'this' => $this,
            'children' => $children,
            'showMoreButton' => $showMoreButton
        ]);

        return $Engine->fetch(dirname(__FILE__) . '/Infinite.html');
    }

    /**
     * Return the control template
     *
     * @return string
     */
    public function getTemplate(): string
    {
        return dirname(__FILE__) . '/Infinite.html';
    }

    /**
     * Return the row template
     *
     * @return string
     */
    public function getRowTemplate(): string
    {
        return dirname(__FILE__) . '/InfiniteRow.html';
    }

    /**
     * Return the children
     *
     * @param int $start
     * @return array
     * @throws Exception
     */
    protected function getChildren(int $start = 0): array
    {
        $max = $this->getAttribute('childrenPerRow');

        return QUI\Projects\Site\Utils::getSitesByInputList(
            $this->getProject(),
            $this->getAttribute('site'),
            [
                'limit' => $start . ',' . $max,
                'order' => $this->getAttribute('order')
            ]
        );
    }

    /**
     * Return the number of children
     *
     * @return int
     * @throws Exception
     * @throws \Exception
     */
    protected function countChildren(): int
    {
        $result = QUI\Projects\Site\Utils::getSitesByInputList(
            $this->getProject(),
            $this->getAttribute('site'),
            ['count' => true]
        );

        return (int)$result[0]['count'];
    }

    /**
     * Return the children of the row
     *
     * @param integer $row
     * @return array
     * @throws Exception
     */
    public function getRow(int $row): array
    {
        $perRow = $this->getAttribute('childrenPerRow');
        $start = $row * $perRow;

        return $this->getChildren($start);
    }
}
