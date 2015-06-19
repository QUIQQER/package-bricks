<?php

/**
 * This file contains package_quiqqer_bricks_ajax_brick_settingTemplate
 */

/**
 * Return the template for the brick settings
 *
 * @return String
 */
function package_quiqqer_bricks_ajax_brick_settingTemplate()
{
    $Template = QUI::getTemplateManager()->getEngine(true);
    $template = dirname(__FILE__).'/settingTemplate.html';

    return $Template->fetch($template);
}

QUI::$Ajax->register(
    'package_quiqqer_bricks_ajax_brick_settingTemplate',
    false,
    'Permission::checkAdminUser'
);
