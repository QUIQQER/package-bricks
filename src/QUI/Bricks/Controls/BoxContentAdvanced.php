<?php

/**
 * This file contains QUI\Bricks\Controls\BoxContentAdvanced
 */

namespace QUI\Bricks\Controls;

use QUI;

/**
 * Class BoxContentAdvanced
 *
 * @package quiqqer/bricks
 */
class BoxContentAdvanced extends QUI\Control
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
            'title' => 'Box Content Advanced',
            'entriesPerLine' => 3,
            'template' => 'standard',
            'centerText' => false,
            'entries' => []
        ]);

        parent::__construct($attributes);

        $this->addCSSFile(
            dirname(__FILE__) . '/BoxContentAdvanced.css'
        );
    }

    /**
     * @see \QUI\Control::create()
     */
    public function getBody(): string
    {
        $Engine = QUI::getTemplateManager()->getEngine();
        $entries = $this->getAttribute('entries');

        if (is_string($entries)) {
            $entries = json_decode($entries, true);
        }

        $Engine->assign([
            'entries' => $entries,
            'centerText' => $this->getAttribute('centerText'),
            'entriesPerLine' => '-' . $this->getAttribute('entriesPerLine'),
            'SiteUtils' => '\\QUI\\Projects\\Site\\Utils'
        ]);

        switch ($this->getAttribute('template')) {
            case 'boxWithShadow':
                $boxTemplate = '/BoxContentAdvanced.boxWithShadow.html';
                $boxCss = '/BoxContentAdvanced.boxWithShadow.css';
                break;
            case 'default':
            default:
                $boxTemplate = '/BoxContentAdvanced.standard.html';
                $boxCss = '/BoxContentAdvanced.standard.css';
                break;
        }

        $entriesTemplate = $Engine->fetch(dirname(__FILE__) . $boxTemplate);
        $this->addCSSFile(dirname(__FILE__) . $boxCss);

        $Engine->assign([
            'this' => $this,
            'entriesTemplate' => $entriesTemplate
        ]);

        return $Engine->fetch(dirname(__FILE__) . '/BoxContentAdvanced.html');
    }
}
