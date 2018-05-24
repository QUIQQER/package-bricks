<?php

/**
 * This file contains package_quiqqer_bricks_ajax_contact
 */

/**
 * Returns the Brick data
 *
 * @param {String|Integer} $brickId - Brick-ID
 *
 * @return array
 */
QUI::$Ajax->registerFunction(
    'package_quiqqer_bricks_ajax_contact',
    function ($brickId, $project, $siteId, $message, $name, $email, $privacyPolicyAccepted) {
        // check if email correct
        if (!QUI\Utils\Security\Orthos::checkMailSyntax($email)) {
            throw new QUI\Exception(
                QUI::getLocale()->get(
                    'quiqqer/bricks',
                    'brick.control.simpleContact.error.wrongEmail'
                )
            );
        }

        $BrickManager               = QUI\Bricks\Manager::init();
        $Project                    = QUI::getProjectManager()->decode($project);
        $Site                       = $Project->get((int)$siteId);
        $Brick                      = $BrickManager->getBrickByID($brickId);
        $privacyPolicyCheckbox      = boolval($Site->getAttribute('quiqqer.settings.sitetypes.contact.showPrivacyPolicyCheckbox'));
        $privacyPolicyCheckboxBrick = $Brick->getSetting('showPrivacyPolicyCheckbox');

        if (($privacyPolicyCheckbox || $privacyPolicyCheckboxBrick) && !(int)$privacyPolicyAccepted) {
            throw new QUI\Exception(
                QUI::getLocale()->get(
                    'quiqqer/bricks',
                    'brick.control.simpleContact.error.privacyPolicyRequired'
                )
            );
        }

        if ($Site->getAttribute('type') === 'quiqqer/sitetypes:types/contact') {
            // Contact form (site)
            $receiver = $Site->getAttribute('quiqqer.settings.sitetypes.contact.email');
        } else {
            // Contact form (brick)
            $receiver = $Brick->getSetting('mailTo');
        }

        // fallback: admin email
        if (!QUI\Utils\Security\Orthos::checkMailSyntax($receiver)) {
            $receiver = (QUI::conf('mail', 'admin_mail'));
        }

        $Mailer = QUI::getMailManager()->getMailer();

        $Mailer->addRecipient($receiver);
        $Mailer->addReplyTo($email);
        $Mailer->setSubject($Site->getAttribute('title').' '.$Site->getUrlRewritten());

        $body = "
            <span style=\"font-weight: bold;\">From:</span> {$name}<br />
            <span style=\"font-weight: bold;\">E-mail:</span> {$email}<br />
        ";

        if ($privacyPolicyCheckbox) {
            $body .= '<span style="font-weight: bold;">'
                     .QUI::getLocale()->get(
                         'quiqqer/bricks',
                         'brick.control.simpleContact.mail.privacyPolicy_accepted'
                     ).'</span><br/>';
        }

        $body .= "<span style=\"font-weight: bold;\">Message:</span><br /><br />
            <div style=\"white-space: pre-line;\">{$_POST['message']}
            </div>";

        $Mailer->setBody($body);

        try {
            $Mailer->send();
        } catch (\Exception $Exception) {
            QUI\System\Log::writeException($Exception);

            throw new QUI\Exception(
                QUI::getLocale()->get('quiqqer/bricks', 'brick.control.simpleContact.error.serverError')
            );
        }

        return true;
    },
    ['brickId', 'project', 'siteId', 'message', 'name', 'email', 'privacyPolicyAccepted'],
    false
);
