<?php

/**
 * This file contains \QUI\Bricks\Controls\SimpleContact
 */

namespace QUI\Bricks\Controls;

use QUI;

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
     */
    public function __construct($attributes = array())
    {
        $this->setAttributes(array(
            'class'        => 'quiqqer-simple-contact',
            'qui-class'    => 'package/quiqqer/bricks/bin/Controls/SimpleContact',
            'labels'       => true,
            'data-brickid' => true,
            'mailTo'       => '' // receiver email
        ));


        parent::__construct($attributes);

        $this->addCSSFile(
            dirname(__FILE__) . '/SimpleContact.css'
        );
    }

    /**
     * (non-PHPdoc)
     *
     * @see \QUI\Control::create()
     */
    public function getBody()
    {
        $Engine  = QUI::getTemplateManager()->getEngine();
        $name    = '';
        $email   = '';
        $message = '';

        // is javascript disabled?
        if (isset($_POST['name'])
            && isset($_POST['email'])
            && isset($_POST['message'])
        ) {
            try {
                $this->sendMail($Engine);
            } catch (\Exception $Exception) {

                $name    = $_POST['name'];
                $email   = $_POST['email'];
                $message = $_POST['message'];

                $Engine->assign(array(
                    'errorMessage' => $Exception->getMessage()
                ));
            }
        }

        $Engine->assign(array(
            'this'    => $this,
            'name'    => $name,
            'email'   => $email,
            'message' => $message
        ));

        return $Engine->fetch(dirname(__FILE__) . '/SimpleContact.html');
    }

    /**
     * Send email per post request if javascript is disabled
     *
     * @param $Engine
     * @throws QUI\Exception
     */
    public function sendMail($Engine)
    {
        $Site = $this->getSite();

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

        $Mailer->setBody("
            <span style=\"font-weight: bold;\">From:</span> {$_POST['name']}<br />
            <span style=\"font-weight: bold;\">E-mail:</span> {$_POST['email']}<br />
            <span style=\"font-weight: bold;\">Message:</span><br /><br />
            <div style=\"white-space: pre-line;\">{$_POST['message']}
            </div>
        ");

        try {
            $Mailer->send();
            $Engine->assign(array(
                'successMessage' => QUI::getLocale()->get(
                    'quiqqer/bricks', 'brick.control.simpleContact.successful'
                )
            ));

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
     * @return mixed|QUI\Projects\Site
     */
    protected function getSite()
    {
        if ($this->getAttribute('Site')) {
            return $this->getAttribute('Site');
        }

        $Site = \QUI::getRewrite()->getSite();

        $this->setAttribute('Site', $Site);

        return $Site;
    }
}
