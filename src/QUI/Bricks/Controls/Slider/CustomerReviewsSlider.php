<?php

/**
 * This file contains QUI\Bricks\Controls\Slider\CustomerReviewsSlider
 * @author Dominik Chrzanowski
 */

namespace QUI\Bricks\Controls\Slider;

use QUI;

use function dirname;

/**
 * Class CustomerReviews
 *
 * @package quiqqer/bricks/Controls
 */
class CustomerReviewsSlider extends AbstractPromoslider
{
    public function __construct($attributes = [])
    {
        // default options
        $this->setAttributes([
            'data-qui' => 'package/quiqqer/bricks/bin/Controls/Slider/CustomerReviewsSlider',
            'template' => 'default',
            'delay' => 5000,
            'perView' => 2,
            'gap' => 40
        ]);

        parent::__construct($attributes);
    }

    public function getBody()
    {
        $Engine = QUI::getTemplateManager()->getEngine();

        $entries = json_decode($this->getAttribute('entries'), true);
        $template = $this->getAttribute('template');
        $path = dirname(__FILE__) . '/CustomerReviewsSlider.' . $template . '.html';
        $enabledEntries = [];
        $gap = $this->getAttribute('gap') ? intval($this->getAttribute('gap')) : 40;

        switch ($gap) {
            case $gap < 0:
                $gap = 0;
                break;

            case $gap > 200:
                $gap = 200;
                break;
        }

        $this->setJavaScriptControlOption('delay', $this->getAttribute('delay'));
        $this->setJavaScriptControlOption('autoplay', $this->getAttribute('autoplay'));
        $this->setJavaScriptControlOption('height', $this->getAttribute('sliderHeight'));
        $this->setJavaScriptControlOption('gap', $gap);

        switch ($template) {
            case 'default':
            case 'templateOne':
                $this->setJavaScriptControlOption('perview', intval($this->getAttribute('perView')));
                break;
        }

        foreach ($entries as $entry) {
            if ($entry['isDisabled'] === 1) {
                continue;
            }

            array_push($enabledEntries, $entry);
        }

        $options = [
            'this' => $this,
            'entries' => $enabledEntries,
            'arrows' => $this->getAttribute('showArrows'),
            'perView' => $this->getAttribute('perView')
        ];

        $this->addCSSFiles(
            [
                dirname(__FILE__) . '/CustomerReviewsSlider.css',
                dirname(__FILE__) . '/CustomerReviewsSlider.' . $template . '.css'
            ]
        );

        $Engine->assign($options);

        return $Engine->fetch($path);
    }
}
