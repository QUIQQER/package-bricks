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
    public function __construct($attributes = array())
    {
        // default options
        $this->setAttributes(array(
            'title'       => 'Box Content',
            'contentList' => false,
            'entries'     => array(),
            'centerText'  => false,
        ));

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
    public function getBody()
    {
        $Engine         = QUI::getTemplateManager()->getEngine();
        $centerText     = $this->getAttribute('centerText');
        $entries        = $this->getAttribute('entries');
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

        $count      = count($enabledEntries);
        $extraClass = '';

        switch ($count) {
            case 1:
                $extraClass = ' box-content-entry-1';
                break;
            case 2:
                $extraClass = ' box-content-entry-2';
                break;
            case 3:
                $extraClass = ' box-content-entry-3';
                break;
            case 4:
                $extraClass = ' box-content-entry-4';
                break;
            case 5:
                $extraClass = ' box-content-entry-5';
                break;
            case 6:
                $extraClass = ' box-content-entry-6';
                break;
            case 7:
                $extraClass = ' box-content-entry-7';
                break;
            case 8:
                $extraClass = ' box-content-entry-8';
                break;
            case 9:
                $extraClass = ' box-content-entry-9';
                break;
            case 10:
                $extraClass = ' box-content-entry-10';
                break;
        }

        $Engine->assign(array(
            'this'       => $this,
            'entries'    => $enabledEntries,
            'extraClass' => $extraClass,
            'centerText' => $centerText
        ));

        return $Engine->fetch(dirname(__FILE__) . '/BoxContent.html');
    }
}
