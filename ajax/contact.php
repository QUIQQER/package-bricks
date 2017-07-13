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
    function ($brickId, $project, $siteId, $message, $email, $name) {

        // check if email correct
        if (!QUI\Utils\Security\Orthos::checkMailSyntax($email)) {
            throw new QUI\Exception(
                QUI::getLocale()->get(
                    'quiqqer/system',
                    'exception.contact.wrong.email'
                )
            );
        }

        $BrickManager = QUI\Bricks\Manager::init();
        $Project      = QUI::getProjectManager()->decode($project);
        $Site         = $Project->get((int)$siteId);

        if ($Site->getAttribute('type') === 'quiqqer/sitetypes:types/contact') {
            // Contact form (site)
            $receiver = $Site->getAttribute('quiqqer.settings.sitetypes.contact.email');
        } else {
            // Contact form (brick)
            $Brick    = $BrickManager->getBrickByID($brickId);
            $receiver = $Brick->getSetting('mailTo');
        }

        if ($receiver == '') {
            $receiver = (QUI::conf('mail', 'admin_mail'));
        }

        $Mailer = QUI::getMailManager()->getMailer();

        $Mailer->addRecipient($receiver);
        $Mailer->addReplyTo($email);
        $Mailer->setSubject($Site->getAttribute('title') . ' ' . $Site->getUrlRewritten());

        $Mailer->setBody("

            <span style=\"font-weight: bold;\">From:</span> {$name}<br />
            <span style=\"font-weight: bold;\">E-mail:</span> {$email}<br />
            <span style=\"font-weight: bold;\">Message:</span><br /><br />
            <div style=\"white-space: pre-line;\">{$message}
            </div>
        ");

        try {
            $Mailer->send();
        } catch (\Exception $Exception) {
            throw new QUI\Exception(
                $Exception->getMessage(),
                $Exception->getCode()
            );
        }

        return true;
    },
    array('brickId', 'project', 'siteId', 'message', 'email', 'name'),
    false
);
