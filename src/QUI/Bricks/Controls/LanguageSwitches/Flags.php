<?php

/**
 * This file contains \QUI\Bricks\Controls\LanguageSwitches\Flags
 */

namespace QUI\Bricks\Controls\LanguageSwitches;

use QUI;

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
    public function __construct($attributes = array())
    {
        parent::__construct($attributes);

        // defaults values
        $this->setAttributes(array(
            'Site' => false,
            'showFlags' => true,
            'showText' => true,
            'all' => true,
            'data-qui' => 'package/quiqqer/bricks/bin/Controls/LanguageSwitches/Flags',
            'flagFolderPath' => URL_BIN_DIR . '16x16/flags/'
        ));

        $this->addCSSFile(
            dirname(__FILE__) . '/Flags.css'
        );

        $this->setAttribute('class', 'quiqqer-bricks-languageswitch-flag');
    }

    /**
     * (non-PHPdoc)
     *
     * @see \QUI\Control::create()
     */
    public function getBody()
    {
        $Engine = QUI::getTemplateManager()->getEngine();
        $Site   = $this->getSite();

        if (!$Site) {
            return '';
        }

        $Project = $Site->getProject();

        if (count($Project->getLanguages()) < 2) {
            QUI\System\Log::addNotice(
                'The Project "' . $Project->getName() . '" has only one Language.' .
                'The Control (\QUI\Bricks\Controls\LanguageSwitches\Flags) makes here no sense.'
            );

            return '';
        }

        $Engine->assign(array(
            'Site' => $Site,
            'Project' => $Project,
            'langs' => $Project->getLanguages(),
            'this' => $this
        ));

        return $Engine->fetch(dirname(__FILE__) . '/Flags.html');
    }

    /**
     * Return the Project
     *
     * @return QUI\Projects\Site
     */
    protected function getSite()
    {
        if ($this->getAttribute('Site')) {
            return $this->getAttribute('Site');
        }

        return QUI::getRewrite()->getSite();
    }
}
