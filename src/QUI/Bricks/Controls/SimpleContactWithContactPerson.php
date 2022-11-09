<?php

/**
 * This file contains \QUI\Bricks\Controls\SimpleContactWithContactPerson
 */

namespace QUI\Bricks\Controls;

use QUI;
use QUI\Captcha\Handler as CaptchaHandler;

/**
 * Mini contact control
 * {control control="\QUI\Bricks\Controls\SimpleContact" labels=false}
 *
 * @author  www.pcsg.de (Dominik Chrzanowski)
 */
class SimpleContactWithContactPerson extends QUI\Control
{
    /**
     * constructor
     *
     * @param array $attributes
     */
    public function __construct($attributes = [])
    {
        $this->setAttributes([
            'class'                     => 'quiqqer-simpleContactPerson',
            'qui-class'                 => 'package/quiqqer/bricks/bin/Controls/SimpleContactWithContactPerson',
            'labels'                    => true,
            'data-brickid'              => false,
            'mailTo'                    => '', // receiver email
            'showPrivacyPolicyCheckbox' => false,
            'useCaptcha'                => false,
            'formContent'               => '',
            'template'                  => 'default',
            'textPosition'              => '',
            'maxWidth'                  => '',
            'personFormProportion'      => "30"
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
    public function getBody()
    {
        $Engine                    = QUI::getTemplateManager()->getEngine();
        $name                      = '';
        $email                     = '';
        $message                   = '';
        $privacyPolicyCheckbox     = $this->getAttribute('showPrivacyPolicyCheckbox');
        $useCaptcha                = $this->getAttribute('useCaptcha');
        $formContent               = $this->getAttribute('formContent');
        $error                     = false;
        $template                  = $this->getAttribute('template');
        $textPosition              = $this->getAttribute('textPosition');
        $maxWidth                  = $this->getAttribute('maxWidth');
        $formWrapperWidth          = '100%';
        $contactPersonWrapperWidth = '0%';

        switch ($template) {
            case 'standard.formRight':
                $template = 'standard';
                break;
            case 'standard.formLeft':
                $textPosition = 'quiqqer-simple-contact-textRight__horizontal';
                $template     = "standard";
                break;
            default:
                $template = "." . $template;
        }

        $this->addCSSFiles([
            dirname(__FILE__) . '/SimpleContactWithContactPerson.css',
            dirname(__FILE__) . '/SimpleContactWithContactPerson.' . $template . '.css'
        ]);

        // Is javascript disabled?
        if (isset($_POST['name'])
            && isset($_POST['email'])
            && isset($_POST['message'])
        ) {
            if ($useCaptcha && QUI::getPackageManager()->isInstalled('quiqqer/captcha')) {
                if (empty($_POST['quiqqer-captcha-response'])
                    || !CaptchaHandler::isResponseValid($_POST['quiqqer-captcha-response'])) {
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
                } catch (\Exception $Exception) {
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
            $label             = QUI::getLocale()->get(
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
                    'siteId'      => $PrivacyPolicySite->getId()
                ]);
            }

            $label = str_replace(['[', ']'], '', $label);

            $Engine->assign([
                'privacyPolicyLabel'      => $label,
                'createPrivacyPolicyLink' => $PrivacyPolicySite !== false
            ]);
        }

        // CAPTCHA
        if ($useCaptcha && QUI::getPackageManager()->isInstalled('quiqqer/captcha')) {
            $Engine->assign('CaptchaDisplay', new QUI\Captcha\Controls\CaptchaDisplay());
        }

        if ($error) {
            $name    = !empty($_POST['name']) ? $_POST['name'] : '';
            $email   = !empty($_POST['email']) ? $_POST['email'] : '';
            $message = !empty($_POST['message']) ? $_POST['message'] : '';
        }

        $contactPersonId   = $this->getAttribute('contactPerson');
        $contactPersonData = false;

        $User   = QUI::getUsers()->get((int)$contactPersonId);
        $avatar = false;
        $phone  = false;
        $mail   = false;

        if ($User->getName() != "Nobody") {
            if ($User->getAvatar()) {
                $avatar = $User->getAvatar()->getUrl();
            }

            try {
                $StandardAddress = $User->getStandardAddress();
                $userPhones      = $StandardAddress->getPhoneList();

                foreach ($userPhones as $phones) {
                    if ($phones['type'] === 'tel') {
                        $phone = $phones['no'];
                    }
                }
            } catch (QUI\Exception $Exception) {
                // user has no address
            }

            try {
                $StandardAddress = $User->getStandardAddress();
                $allMails        = $StandardAddress->getMailList();

                if (!empty($allMails)) {
                    $mail = $allMails[0];
                }
            } catch (QUI\Exception $Exception) {
                // user hat no email address
            }

            $contactPersonData = [
                'id'        => $User->getId(),
                'firstName' => $User->getAttribute('firstname'),
                'lastName'  => $User->getAttribute('lastname'),
                'phone'     => $phone,
                'mail'      => $mail,
                'position'  => $User->getAttribute('quiqqer.teamPage.positionMultiLang'),
                'avatar'    => $avatar
            ];

            $contactPersonWrapperWidth = $this->getAttribute('personFormProportion') . '%';
            $formWrapperWidth          = (100 - $this->getAttribute('personFormProportion')) . "%";
        }

        if ($maxWidth > 1920) {
            $maxWidth = 1920;
        }

        if ($maxWidth < 0) {
            $maxWidth = 0;
        }

        $Engine->assign([
            'this'                      => $this,
            'name'                      => $name,
            'email'                     => $email,
            'message'                   => $message,
            'formContent'               => $formContent,
            'textPosition'              => $textPosition,
            'contactPersonData'         => $contactPersonData,
            'maxWidth'                  => $maxWidth,
            'contactPersonWrapperWidth' => $contactPersonWrapperWidth,
            'formWrapperWidth'          => $formWrapperWidth
        ]);

        return $Engine->fetch(dirname(__FILE__) . '/SimpleContactWithContactPerson.' . $template . '.html');
    }

    /**
     * Send email per post request if javascript is disabled
     *
     * @param QUI\Interfaces\Template\EngineInterface $Engine
     * @throws QUI\Exception
     */
    public function sendMail($Engine)
    {
        $Site                  = $this->getSite();
        $privacyPolicyCheckbox = boolval($Site->getAttribute(
            'quiqqer.settings.sitetypes.contact.showPrivacyPolicyCheckbox'
        ));

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
        $url      = $this->getProject()->getHost() . $Site->getUrlRewritten();

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
        } catch (\Exception $Exception) {
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
    protected function getPrivacyPolicySite()
    {
        try {
            $Project = QUI::getRewrite()->getProject();

            $result = $Project->getSites([
                'where' => [
                    'type' => 'quiqqer/sitetypes:types/privacypolicy'
                ],
                'limit' => 1
            ]);
        } catch (\Exception $Exception) {
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
    public function getSite()
    {
        if ($this->getAttribute('Site')) {
            return $this->getAttribute('Site');
        }

        $Site = QUI::getRewrite()->getSite();

        $this->setAttribute('Site', $Site);

        return $Site;
    }
}
