<?php

/**
 * This file contains \QUI\Bricks\Controls\LanguageSwitches\DropDown
 */

namespace QUI\Bricks\Controls\LanguageSwitches;

use QUI;

/**
 * Class Language Switch - DropDown
 *
 * @package quiqqer/quiqqer
 * @author  www.pcsg.de (Henning Leutz)
 * @licence For copyright and license information, please view the /README.md
 */
class DropDown extends QUI\Control
{
    /**
     * constructor
     *
     * @param array $attributes
     */
    public function __construct($attributes = [])
    {
        // defaults values
        $this->setAttributes([
            'Site'             => false,
            // button: the visible part of the language switch.
            'buttonShowFlag'   => true,
            'buttonText'       => '', // false: disable text, `abbreviation`: i.e. DE, EN, `text`: i.e. German, English
            // dropdown: the part that appears when the user clicks on the button
            'dropdownShowFlag' => true,
            'dropdownText'     => 'text', // false: disable text, `abbreviation`: i.e. DE, EN, `text`: i.e. German, English
            'dropdownPosition' => 'right', // 'right', 'left'. stick to right or left bottom control corner
            'showArrow'        => true, // enable arrow down
            'flagFolderPath'   => URL_BIN_DIR.'16x16/flags/'
        ]);

        parent::__construct($attributes);

        $this->addCSSFile(
            dirname(__FILE__).'/DropDown.css'
        );

        $this->setAttribute('class', 'quiqqer-bricks-languageswitch-dropdown');
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
                'The Project "'.$Project->getName().'" has only one Language.'.
                'The Control (\QUI\Bricks\Controls\LanguageSwitches) makes here no sense.'
            );

            return '';
        }

        $langs        = $Project->getLanguages();
        $counter      = 0;
        $showDropdown = false;

        foreach ($langs as $lang) {
            $a = $Site->existLang($lang);
            if ($a) {
                $counter++;
            }
        }

        if ($counter > 1) {
            $showDropdown = true;
            $this->setJavaScriptControl('package/quiqqer/bricks/bin/Controls/LanguageSwitches/DropDown');
        }

        $Engine->assign([
            'Site'             => $Site,
            'Project'          => $Project,
            'langs'            => $langs,
            'buttonShowFlag'   => $this->getAttribute('buttonShowFlag'),
            'buttonText'       => $this->getAttribute('buttonText'),
            'dropdownShowFlag' => $this->getAttribute('dropdownShowFlag'),
            'dropdownText'     => $this->getAttribute('dropdownText'),
            'dropdownPosition' => $this->getAttribute('dropdownPosition'),
            'showArrow'        => $this->getAttribute('showArrow'),
            'showDropdown'     => $showDropdown,
            'this'             => $this
        ]);

        return $Engine->fetch(dirname(__FILE__).'/DropDown.html');
    }

    /**
     * Return the Project
     *
     * @return QUI\Projects\Site
     */
    public function getSite()
    {
        if ($this->getAttribute('Site')) {
            return $this->getAttribute('Site');
        }

        return QUI::getRewrite()->getSite();
    }
}
