<?php

/**
 * This file contains \QUI\Bricks\Controls\LanguageSwitches\Flags
 */

namespace QUI\Bricks\Controls\LanguageSwitches;

use QUI;
use QUI\Exception;

/**
 * Class LangSwitch
 *
 * @package quiqqer/quiqqer
 * @author  www.pcsg.de (Henning Leutz)
 * @licence For copyright and license information, please view the /README.md
 */
class Flags extends QUI\Control
{
    /**
     * constructor
     *
     * @param array $attributes
     */
    public function __construct(array $attributes = [])
    {
        // defaults values
        $this->setAttributes([
            'Site' => false,
            'showFlags' => true,
            'showText' => true,
            'all' => true,
            'data-qui' => 'package/quiqqer/bricks/bin/Controls/LanguageSwitches/Flags',
            'flagFolderPath' => URL_BIN_DIR . '16x16/flags/'
        ]);

        parent::__construct($attributes);

        $this->addCSSFile(
            dirname(__FILE__) . '/Flags.css'
        );

        $this->setAttribute('class', 'quiqqer-bricks-languageswitch-flag');
    }

    /**
     * (non-PHPdoc)
     *
     * @throws Exception
     * @see \QUI\Control::create()
     */
    public function getBody(): string
    {
        $Engine = QUI::getTemplateManager()->getEngine();
        $Site = $this->getSite();
        $Project = $Site->getProject();

        if (count($Project->getLanguages()) < 2) {
            QUI\System\Log::addNotice(
                'The Project "' . $Project->getName() . '" has only one Language.' .
                'The Control (\QUI\Bricks\Controls\LanguageSwitches\Flags) makes here no sense.'
            );

            return '';
        }

        $Engine->assign([
            'Site' => $Site,
            'Project' => $Project,
            'langs' => $Project->getLanguages(),
            'this' => $this
        ]);

        return $Engine->fetch(dirname(__FILE__) . '/Flags.html');
    }

    /**
     * Return the Project
     *
     * @return QUI\Interfaces\Projects\Site
     * @throws Exception
     */
    public function getSite(): QUI\Interfaces\Projects\Site
    {
        if ($this->getAttribute('Site')) {
            return $this->getAttribute('Site');
        }

        return QUI::getRewrite()->getSite();
    }
}
