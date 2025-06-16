<?php

/**
 * This file contains package_quiqqer_bricks_ajax_contact
 */

use QUI\Captcha\Handler as CaptchaHandler;

/**
 * Returns the Brick data
 *
 * @param String|Integer $brickId - Brick-ID (will be cast to int)
 * @param string $project
 * @param int $siteId
 * @param string $message
 * @param string $email
 * @param bool $privacyPolicyAccepted
 * @param string $captchaResponse
 *
 * @return array
 */
QUI::$Ajax->registerFunction(
    'package_quiqqer_bricks_ajax_contact',
    function ($brickId, $project, $siteId, $message, $name, $email, $privacyPolicyAccepted, $captchaResponse = null) {
        // check if email correct
        if (!QUI\Utils\Security\Orthos::checkMailSyntax($email)) {
            throw new QUI\Exception(
                QUI::getLocale()->get(
                    'quiqqer/bricks',
                    'brick.control.simpleContact.error.wrongEmail'
                )
            );
        }

        // If SimpleContact was used in a brick
        $privacyPolicyCheckboxBrick = false;
        $Brick = null;

        if (!empty($brickId)) {
            $BrickManager = QUI\Bricks\Manager::init();
            $Brick = $BrickManager->getBrickByID((int)$brickId);
            $privacyPolicyCheckboxBrick = $Brick->getSetting('showPrivacyPolicyCheckbox');
        }

        $Project = QUI::getProjectManager()->decode($project);
        $Site = $Project->get((int)$siteId);
        $privacyPolicyCheckbox = boolval(
            $Site->getAttribute('quiqqer.settings.sitetypes.contact.showPrivacyPolicyCheckbox')
        );
        $useCaptcha = boolval($Site->getAttribute('quiqqer.settings.sitetypes.contact.useCaptcha'));

        if (($privacyPolicyCheckbox || $privacyPolicyCheckboxBrick) && !(int)$privacyPolicyAccepted) {
            throw new QUI\Exception(
                QUI::getLocale()->get(
                    'quiqqer/bricks',
                    'brick.control.simpleContact.error.privacyPolicyRequired'
                )
            );
        }

        if (
            $useCaptcha
            && QUI::getPackageManager()->isInstalled('quiqqer/captcha')
            && class_exists('QUI\Captcha\Handler')
        ) {
            if (!CaptchaHandler::isResponseValid($captchaResponse)) {
                throw new QUI\Exception(
                    QUI::getLocale()->get(
                        'quiqqer/bricks',
                        'brick.control.simpleContact.error.captcha_failed'
                    )
                );
            }
        }

        if ($Site->getAttribute('type') === 'quiqqer/sitetypes:types/contact') {
            // Contact form (site)
            $receiver = $Site->getAttribute('quiqqer.settings.sitetypes.contact.email');
        } else {
            // Contact form (brick)
            $receiver = $Brick?->getSetting('mailTo');
        }

        // fallback: admin email
        if (!QUI\Utils\Security\Orthos::checkMailSyntax($receiver)) {
            $receiver = (QUI::conf('mail', 'admin_mail'));
        }

        $Mailer = QUI::getMailManager()->getMailer();

        $Mailer->addRecipient($receiver);
        $Mailer->addReplyTo($email);
        $Mailer->setSubject($Site->getAttribute('title') . ' ' . $Site->getUrlRewritten());

        $body = "
            <span style=\"font-weight: bold;\">From:</span> $name<br />
            <span style=\"font-weight: bold;\">E-mail:</span> $email<br />
        ";

        if ($privacyPolicyAccepted) {
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
        } catch (Exception $Exception) {
            QUI\System\Log::writeException($Exception);

            throw new QUI\Exception(
                QUI::getLocale()->get('quiqqer/bricks', 'brick.control.simpleContact.error.serverError')
            );
        }

        return true;
    },
    ['brickId', 'project', 'siteId', 'message', 'name', 'email', 'privacyPolicyAccepted', 'captchaResponse']
);
