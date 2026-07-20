<?php

/**
 * This file contains QUI\Bricks\Controls\Image
 */

namespace QUI\Bricks\Controls;

use QUI;

/**
 * Class Image
 */
class Image extends QUI\Control
{
    private const LINK_TARGET_OPTIONS = ['', '_self', '_blank'];
    private const LINK_REL_OPTIONS = ['nofollow', 'sponsored', 'ugc', 'noopener', 'noreferrer'];

    /**
     * constructor
     *
     * @param array<string, mixed> $attributes
     */
    public function __construct(array $attributes = [])
    {
        // default options
        $this->setAttributes([
            'nodeName' => 'section',
            'class' => 'quiqqer-bricks-controls-image',
            'altText' => '',
            'imageTitle' => '',
            'link' => '',
            'linkTarget' => '',
            'linkRel' => '',
            'picture' => ''
        ]);

        parent::__construct($attributes);

        $this->addCSSFile(
            dirname(__FILE__) . '/Image.css'
        );
    }

    public function getBody(): string
    {
        $Engine = QUI::getTemplateManager()->getEngine();
        $image = $this->getAttribute('picture');
        $altText = $this->getAttribute('altText');
        $imageTitle = $this->getAttribute('imageTitle');

        if (!is_string($image)) {
            $image = '';
        }

        if (!is_string($altText)) {
            $altText = '';
        }

        if (!is_string($imageTitle)) {
            $imageTitle = '';
        }

        $linkTarget = $this->normalizeLinkTarget($this->getAttribute('linkTarget'));

        $Engine->assign([
            'this' => $this,
            'image' => trim($image),
            'link' => $this->normalizeLink($this->getAttribute('link')),
            'linkTarget' => $linkTarget,
            'linkRel' => $this->normalizeLinkRel($this->getAttribute('linkRel'), $linkTarget),
            'altText' => trim($altText),
            'imageTitle' => trim($imageTitle)
        ]);

        return $Engine->fetch(dirname(__FILE__) . '/Image.html');
    }

    protected function normalizeLink(mixed $link): string
    {
        if (!is_string($link)) {
            return '';
        }

        $link = trim($link);

        if ($link === '' || preg_match('/[\x00-\x20\x7F]/', $link)) {
            return '';
        }

        $scheme = parse_url($link, PHP_URL_SCHEME);

        if ($scheme === false) {
            return '';
        }

        if ($scheme === null) {
            return $link;
        }

        if (!in_array(strtolower($scheme), ['http', 'https'], true)) {
            return '';
        }

        $host = parse_url($link, PHP_URL_HOST);

        if (!is_string($host) || $host === '') {
            return '';
        }

        return $link;
    }

    protected function normalizeLinkTarget(mixed $target): string
    {
        if (!is_string($target) || !in_array($target, self::LINK_TARGET_OPTIONS, true)) {
            return '';
        }

        return $target;
    }

    protected function normalizeLinkRel(mixed $rel, string $target): string
    {
        $selectedOptions = [];

        if (is_string($rel)) {
            $options = preg_split('/\s+/', strtolower(trim($rel)), -1, PREG_SPLIT_NO_EMPTY);

            foreach ($options ?: [] as $option) {
                if (in_array($option, self::LINK_REL_OPTIONS, true)) {
                    $selectedOptions[$option] = true;
                }
            }
        }

        if ($target === '_blank') {
            $selectedOptions['noopener'] = true;
        }

        $normalizedOptions = [];

        foreach (self::LINK_REL_OPTIONS as $option) {
            if (isset($selectedOptions[$option])) {
                $normalizedOptions[] = $option;
            }
        }

        return implode(' ', $normalizedOptions);
    }
}
