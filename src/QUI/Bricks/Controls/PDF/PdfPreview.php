<?php

namespace QUI\Bricks\Controls\PDF;

use QUI;

class PdfPreview extends QUI\Control
{
    public function __construct(array $attributes = [])
    {
        $this->setAttributes([
            'class' => 'quiqqer-bricks-pdfPreview',
            'qui-class' => 'package/quiqqer/bricks/bin/Controls/PDF/PdfPreviewBrick',
            'pdfFile' => '',
            'aspectRatio' => '210/297',
            'sheetsNumber' => 16
        ]);

        $this->addCSSFile(dirname(__FILE__) . '/PdfPreview.css');

        parent::__construct($attributes);
    }

    public function getBody(): string
    {
        $Engine = QUI::getTemplateManager()->getEngine();
        $pdfFile = '';

        if ($this->getAttribute('pdfFile')) {
            try {
                $file = QUI\Projects\Media\Utils::getMediaItemByUrl($this->getAttribute('pdfFile'));
                $pdfFile = $file->getUrl(true);
            } catch (\Exception) {
            }
        }

        $Engine->assign([
            'this' => $this,
            'pdfFile' => $pdfFile,
            'sheetsNumber' => $this->getAttribute('sheetsNumber')
        ]);

        return $Engine->fetch(dirname(__FILE__) . '/PdfPreview.html');
    }
}
