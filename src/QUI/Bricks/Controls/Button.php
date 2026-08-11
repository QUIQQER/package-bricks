<?php

/**
 * This file contains QUI\Bricks\Controls\Button
 */

namespace QUI\Bricks\Controls;

use QUI;
use QUI\Bricks\Utils;
use QUI\Components\Controls\Button as ButtonComponent;

use function trim;

/**
 * Class Button
 *
 * Single button brick. It delegates rendering to
 * QUI\Components\Controls\Button and exposes every button option as a native
 * brick setting. displayMode and size are per button here, while the Buttons
 * brick keeps them as global brick settings.
 */
class Button extends QUI\Control
{
    /**
     * @param array<string, mixed> $attributes
     */
    public function __construct(array $attributes = [])
    {
        $this->setAttributes([
            'class' => 'quiqqer-bricks-button',
            'nodeName' => 'div',
            'text' => '',
            'iconClass' => '',
            'iconPosition' => 'start',
            'btnType' => 'primary',
            'displayMode' => 'button', // button, icon-only, icon-only-rounded
            'size' => 'default',
            'customClass' => '',
            'identifier' => '',
            'openBrickId' => 0,
            'openBrickWinWidth' => '',
            'openBrickWinHeight' => '',
            'openBrickSpacing' => true,
            'href' => '',
            'targetBlank' => false,
            'title' => '',
            'ariaLabel' => '',
            'disabled' => false,
            'fullWidth' => false,
            'onClick' => '',
            'dataAttributes' => [],
        ]);

        parent::__construct($attributes);
    }

    /**
     * Omit the whole brick markup when the button is not renderable.
     */
    public function create(): string
    {
        if ($this->getButton()->create() === '') {
            return '';
        }

        return parent::create();
    }

    public function getBody(): string
    {
        $Button = $this->getButton();
        $this->addCSSFiles($Button->getCSSFiles());

        return $Button->create();
    }

    /**
     * Build the delegated button component from the brick settings.
     */
    private function getButton(): ButtonComponent
    {
        return new ButtonComponent([
            'text' => $this->getAttribute('text'),
            'icon' => trim((string)$this->getAttribute('iconClass')),
            'iconType' => 'fa',
            'iconPosition' => $this->getAttribute('iconPosition'),
            'btnType' => $this->getAttribute('btnType'),
            'displayMode' => $this->getAttribute('displayMode'),
            'size' => $this->getAttribute('size'),
            'customClass' => $this->getAttribute('customClass'),
            'identifier' => $this->getAttribute('identifier'),
            'openBrickId' => $this->getAttribute('openBrickId'),
            'openBrickWinWidth' => $this->getAttribute('openBrickWinWidth'),
            'openBrickWinHeight' => $this->getAttribute('openBrickWinHeight'),
            'openBrickSpacing' => $this->getAttribute('openBrickSpacing'),
            'href' => $this->getAttribute('href'),
            'targetBlank' => $this->getAttribute('targetBlank'),
            'title' => $this->getAttribute('title'),
            'ariaLabel' => $this->getAttribute('ariaLabel'),
            'disabled' => $this->getAttribute('disabled'),
            'fullWidth' => $this->getAttribute('fullWidth'),
            'onClick' => $this->getAttribute('onClick'),
            'dataAttributes' => Utils::dataAttributesFromEntries($this->getAttribute('dataAttributes')),
        ]);
    }
}
