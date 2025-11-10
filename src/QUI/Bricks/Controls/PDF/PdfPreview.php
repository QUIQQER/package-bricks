<?php

namespace QUI\Bricks\Controls\PDF;

use QUI;

class PdfPreview extends QUI\Control
{
    public function __construct(array $attributes = [])
    {
        $this->addCSSClass('quiqqer-bricks-pdfPreview');
        $this->addCSSFile(dirname(__FILE__) . '/PdfPreview.css');

        $this->setJavaScriptControl('package/namefruits/namereport-service/bin/controls/PdfPreviewBrick');

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
            'pdfFile' => $pdfFile
        ]);

        return $Engine->fetch(dirname(__FILE__) . '/PdfPreview.html');
    }
}
