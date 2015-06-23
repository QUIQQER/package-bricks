<?php

/**
 * This file contains package_quiqqer_bricks_ajax_project_createBrick
 */

/**
 * Returns the feed list
 *
 * @param string $project - json array, Project Data
 * @param string $data    - json array, Brick Data
 *
 * @return array
 */
function package_quiqqer_bricks_ajax_project_createBrick($project, $data)
{
    $Project = QUI::getProjectManager()->decode($project);
    $Brick = new QUI\Bricks\Brick(json_decode($data, true));

    $BrickManager = new QUI\Bricks\Manager();

    return $BrickManager->createBrickForProject($Project, $Brick);
}

QUI::$Ajax->register(
    'package_quiqqer_bricks_ajax_project_createBrick',
    array('project', 'data'),
    'Permission::checkAdminUser'
);
