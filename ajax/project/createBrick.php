<?php

/**
 * This file contains package_quiqqer_bricks_ajax_project_createBrick
 */

/**
 * Returns the feed list
 *
 * @param string $project - json array, Project Data
 * @param string $data - json array, Brick Data
 *
 * @return array
 */
QUI::getAjax()->registerFunction(
    'package_quiqqer_bricks_ajax_project_createBrick',
    function ($project, $data) {
        $Project = QUI::getProjectManager()->decode($project);
        $Brick = new QUI\Bricks\Brick(json_decode($data, true));

        $BrickManager = QUI\Bricks\Manager::init();

        return $BrickManager?->createBrickForProject($Project, $Brick) ?? 0;
    },
    ['project', 'data'],
    'Permission::checkAdminUser'
);
