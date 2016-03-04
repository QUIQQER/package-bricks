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
        $BrickManager = QUI\Bricks\Manager::init();
        $Brick = $BrickManager->getBrickByID($brickId);
        $Project = QUI::getProjectManager()->decode($project);
        $Site = $Project->get((int)$siteId);

        $Mailer = QUI::getMailManager()->getMailer();

        $Mailer->addRecipient($Brick->getSetting('mailTo'));
        $Mailer->addReplyTo($email);
        $Mailer->setSubject($Site->getAttribute('title') .' '. $Site->getUrlRewritten());

        $Mailer->setBody("

            <span style=\"font-weight: bold;\">From:</span> {$name}<br />
            <span style=\"font-weight: bold;\">E-mail:</span> {$email}<br />
            <span style=\"font-weight: bold;\">Message:</span><br /><br />
            <div style=\"white-space: pre-line;\">{$message}
            </div>
        ");

        $Mailer->send();
    },
    array('brickId', 'project', 'siteId', 'message', 'email', 'name'),
    false
);




