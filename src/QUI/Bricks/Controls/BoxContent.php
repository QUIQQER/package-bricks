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
            'entries'     => array()
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
        $Engine  = QUI::getTemplateManager()->getEngine();
        $entries = $this->getAttribute('entries');

        if (is_string($entries)) {
            $entries = json_decode($entries, true);
        }

        $count      = count($entries);
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
            'entries'    => $entries,
            'extraClass' => $extraClass
        ));

        return $Engine->fetch(dirname(__FILE__) . '/BoxContent.html');
    }
}
