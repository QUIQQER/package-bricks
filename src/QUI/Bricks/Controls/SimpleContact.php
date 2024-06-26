<?php

/**
 * This file contains \QUI\Bricks\Controls\SimpleContact
 */

namespace QUI\Bricks\Controls;

use Exception;
use QUI;
use QUI\Captcha\Handler as CaptchaHandler;

use function class_exists;

/**
 * Mini contact control
 * {control control="\QUI\Bricks\Controls\SimpleContact" labels=false}
 *
 * @author  www.pcsg.de (Henning Leutz, Michael Danielczok)
 * @licence For copyright and license information, please view the /README.md
 */
class SimpleContact extends QUI\Control
{
    /**
     * constructor
     *
     * @param array $attributes
     * @throws QUI\Exception
     */
    public function __construct(array $attributes = [])
    {
        $this->setAttributes([
            'class' => 'quiqqer-simple-contact',
            'qui-class' => 'package/quiqqer/bricks/bin/Controls/SimpleContact',
            'labels' => true,
            'data-brickid' => false,
            'mailTo' => '', // receiver email
            'showPrivacyPolicyCheckbox' => false,
            'useCaptcha' => false,
            'formContent' => '',
            'template' => 'default',
            'textPosition' => ''
        ]);

        parent::__construct($attributes);

        $this->setAttribute('cacheable', 0);

        if (!isset($attributes['showPrivacyPolicyCheckbox'])) {
            $Site = $this->getSite();

            if ($Site) {
                $this->setAttribute(
                    'showPrivacyPolicyCheckbox',
                    $Site->getAttribute('quiqqer.settings.sitetypes.contact.showPrivacyPolicyCheckbox')
                );
            }
        }
    }

    /**
     * (non-PHPdoc)
     *
     * @throws QUI\Exception
     * @see \QUI\Control::create()
     */
    public function getBody(): string
    {
        $Engine = QUI::getTemplateManager()->getEngine();
        $name = '';
        $email = '';
        $message = '';
        $privacyPolicyCheckbox = $this->getAttribute('showPrivacyPolicyCheckbox');
        $useCaptcha = $this->getAttribute('useCaptcha');
        $formContent = $this->getAttribute('formContent');
        $error = false;
        $template = $this->getAttribute('template');
        $textPosition = $this->getAttribute('textPosition');

        switch ($template) {
            case 'horizontal':
                $template = dirname(__FILE__) . '/SimpleContact.horizontal.html';
                $templateCss = dirname(__FILE__) . '/SimpleContact.horizontal.css';
                break;

            case 'horizontal.textRight':
                $textPosition = 'quiqqer-simple-contact-textRight__horizontal';
                $template = dirname(__FILE__) . '/SimpleContact.horizontal.html';
                $templateCss = dirname(__FILE__) . '/SimpleContact.horizontal.css';
                break;

            case 'twoColumns':
                $template = dirname(__FILE__) . '/SimpleContact.twoColumns.html';
                $templateCss = dirname(__FILE__) . '/SimpleContact.twoColumns.css';
                break;

            case 'default':
            default:
                $template = dirname(__FILE__) . '/SimpleContact.html';
                $templateCss = dirname(__FILE__) . '/SimpleContact.css';
        }

        $this->addCSSFiles([dirname(__FILE__) . '/SimpleContact.css', $templateCss]);

        // Is javascript disabled?
        if (
            isset($_POST['name'])
            && isset($_POST['email'])
            && isset($_POST['message'])
        ) {
            if (
                $useCaptcha
                && QUI::getPackageManager()->isInstalled('quiqqer/captcha')
                && class_exists('QUI\Captcha\Handler')
            ) {
                if (
                    empty($_POST['quiqqer-captcha-response'])
                    || !CaptchaHandler::isResponseValid($_POST['quiqqer-captcha-response'])
                ) {
                    $Engine->assign([
                        'errorMessage' => QUI::getLocale()->get(
                            'quiqqer/bricks',
                            'brick.control.simpleContact.error.captcha_failed'
                        )
                    ]);

                    $error = true;
                }
            }

            if ($privacyPolicyCheckbox && empty($_POST['privacyPolicy'])) {
                $Engine->assign([
                    'errorMessage' => QUI::getLocale()->get(
                        'quiqqer/bricks',
                        'brick.control.simpleContact.error.privacyPolicyRequired'
                    )
                ]);

                $error = true;
            }

            if (!$error) {
                try {
                    $this->sendMail($Engine);
                } catch (Exception $Exception) {
                    $Engine->assign([
                        'errorMessage' => $Exception->getMessage()
                    ]);

                    $error = true;
                }
            }
        }

        // Privacy Policy checkbox
        if ($privacyPolicyCheckbox) {
            $PrivacyPolicySite = $this->getPrivacyPolicySite();
            $label = QUI::getLocale()->get(
                'quiqqer/bricks',
                'control.simpleContact.privacyPolicy.label'
            );

            if ($PrivacyPolicySite) {
                $url = $PrivacyPolicySite->getUrlRewrittenWithHost();

                $label = preg_replace(
                    '#\[([^\]]*)\]#i',
                    '<a href="' . $url . '" target="_blank">$1</a>',
                    $label
                );

                $Project = QUI::getRewrite()->getProject();

                $Engine->assign([
                    'projectName' => $Project->getName(),
                    'projectLang' => $Project->getLang(),
                    'siteId' => $PrivacyPolicySite->getId()
                ]);
            }

            $label = str_replace(['[', ']'], '', $label);

            $Engine->assign([
                'privacyPolicyLabel' => $label,
                'createPrivacyPolicyLink' => $PrivacyPolicySite !== false
            ]);
        }

        // CAPTCHA
        if (
            $useCaptcha
            && QUI::getPackageManager()->isInstalled('quiqqer/captcha')
            && class_exists('QUI\Captcha\Controls\CaptchaDisplay')
        ) {
            $Engine->assign('CaptchaDisplay', new QUI\Captcha\Controls\CaptchaDisplay());
        }

        if ($error) {
            $name = !empty($_POST['name']) ? $_POST['name'] : '';
            $email = !empty($_POST['email']) ? $_POST['email'] : '';
            $message = !empty($_POST['message']) ? $_POST['message'] : '';
        }

        $Engine->assign([
            'this' => $this,
            'name' => $name,
            'email' => $email,
            'message' => $message,
            'formContent' => $formContent,
            'textPosition' => $textPosition
        ]);

        return $Engine->fetch($template);
    }

    /**
     * Send email per post request if javascript is disabled
     *
     * @param QUI\Interfaces\Template\EngineInterface $Engine
     * @throws QUI\Exception
     */
    public function sendMail(QUI\Interfaces\Template\EngineInterface $Engine): void
    {
        $Site = $this->getSite();
        $privacyPolicyCheckbox = boolval(
            $Site->getAttribute(
                'quiqqer.settings.sitetypes.contact.showPrivacyPolicyCheckbox'
            )
        );

        // email correct?
        if (!QUI\Utils\Security\Orthos::checkMailSyntax($_POST['email'])) {
            throw new QUI\Exception(
                QUI::getLocale()->get(
                    'quiqqer/bricks',
                    'brick.control.simpleContact.error.wrongEmail'
                )
            );
        }

        $receiver = $this->getAttribute('mailTo');
        $url = $this->getProject()->getHost() . $Site->getUrlRewritten();

        // fallback: admin email
        if (!QUI\Utils\Security\Orthos::checkMailSyntax($receiver)) {
            $receiver = (QUI::conf('mail', 'admin_mail'));
        }

        $Mailer = QUI::getMailManager()->getMailer();

        $Mailer->addRecipient($receiver);
        $Mailer->addReplyTo($_POST['email']);
        $Mailer->setSubject($Site->getAttribute('title') . ' | ' . $url);

        $body = "
            <span style=\"font-weight: bold;\">From:</span> {$_POST['name']}<br />
            <span style=\"font-weight: bold;\">E-mail:</span> {$_POST['email']}<br />
        ";

        if ($privacyPolicyCheckbox && !empty($_POST['privacyPolicy'])) {
            $body .= '<span style="font-weight: bold;">';
            $body .= QUI::getLocale()->get(
                'quiqqer/bricks',
                'brick.control.simpleContact.mail.privacyPolicy_accepted'
            );
            $body .= '</span><br/>';
        }

        $body .= "<span style=\"font-weight: bold;\">Message:</span><br /><br />
            <div style=\"white-space: pre-line;\">{$_POST['message']}
            </div>";

        $Mailer->setBody($body);

        try {
            $Mailer->send();
            $Engine->assign([
                'successMessage' => QUI::getLocale()->get(
                    'quiqqer/bricks',
                    'brick.control.simpleContact.successful'
                )
            ]);
        } catch (Exception $Exception) {
            QUI\System\Log::writeException($Exception);

            throw new QUI\Exception(
                QUI::getLocale()->get(
                    'quiqqer/bricks',
                    'brick.control.simpleContact.error.serverError'
                )
            );
        }
    }

    /**
     * Get Privacy Policy Site of the current Project
     *
     * @return QUI\Projects\Site|false
     */
    protected function getPrivacyPolicySite(): bool|QUI\Projects\Site
    {
        try {
            $Project = QUI::getRewrite()->getProject();

            $result = $Project->getSites([
                'where' => [
                    'type' => 'quiqqer/sitetypes:types/privacypolicy'
                ],
                'limit' => 1
            ]);
        } catch (Exception $Exception) {
            QUI\System\Log::writeException($Exception);

            return false;
        }

        if (empty($result)) {
            return false;
        }

        return current($result);
    }

    /**
     * @return mixed|QUI\Projects\Site
     *
     * @throws QUI\Exception
     */
    public function getSite(): mixed
    {
        if ($this->getAttribute('Site')) {
            return $this->getAttribute('Site');
        }

        $Site = QUI::getRewrite()->getSite();

        $this->setAttribute('Site', $Site);

        return $Site;
    }
}
