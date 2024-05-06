<?php

/**
 * This file contains QUI\Bricks\Controls\BoxContent
 */

namespace QUI\Bricks\Controls;

use QUI;

/**
 * Class BoxContent
 *
 * @package quiqqer/bricks
 */
class BoxContent extends QUI\Control
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
            'class' => 'quiqqer-boxContent',
            'contentList' => false,
            'entries' => [],
            'centerText' => false,
        ]);

        parent::__construct($attributes);

        $this->addCSSFile(
            dirname(__FILE__) . '/BoxContent.css'
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
        $centerText = $this->getAttribute('centerText');
        $entries = $this->getAttribute('entries');
        $enabledEntries = [];

        if (is_string($entries)) {
            $entries = json_decode($entries, true);
        }

        foreach ($entries as $entry) {
            if (isset($entry['isDisabled']) && $entry['isDisabled'] === 1) {
                continue;
            }

            array_push($enabledEntries, $entry);
        }

        $Engine->assign([
            'this' => $this,
            'entries' => $enabledEntries,
            'centerText' => $centerText
        ]);

        return $Engine->fetch(dirname(__FILE__) . '/BoxContent.html');
    }
}
