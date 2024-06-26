<?php

/**
 * This file contains package_quiqqer_bricks_ajax_project_getAreas
 */

/**
 * Returns the feed list
 *
 * @param string $project - json array, Project Data
 * @param string $layout - layout type
 *
 * @return array
 */
QUI::$Ajax->registerFunction(
    'package_quiqqer_bricks_ajax_project_getAreas',
    function ($project, $layout, $siteType) {
        $Project = QUI::getProjectManager()->decode($project);
        $BrickManager = QUI\Bricks\Manager::init();

        return $BrickManager->getAreasByProject($Project, $layout, $siteType);
    },
    ['project', 'layout', 'siteType'],
    'Permission::checkAdminUser'
);
