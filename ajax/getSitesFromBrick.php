<?php

/**
 * Return a xml category
 *
 * @param array $file - list of xml files
 * @param $category
 * @return String
 */
QUI::$Ajax->registerFunction(
    'package_quiqqer_bricks_ajax_getSitesFromBrick',
    function ($brickId, $options) {
        $options = json_decode($options, true);
        $Bricks  = QUI\Bricks\Manager::init();
        $Brick   = $Bricks->getBrickById($brickId);

        $sites  = $Bricks->getSitesByBrick($Brick);
        $result = array_map(function ($Site) {
            /* @var $Site \QUI\Projects\Site */
            return [
                'project' => $Site->getProject()->getName(),
                'lang'    => $Site->getProject()->getLang(),
                'id'      => $Site->getId(),
                'title'   => $Site->getAttribute('title'),
                'name'    => $Site->getAttribute('name'),
                'url'     => $Site->getUrlRewritten()
            ];
        }, $sites);

        $Grid = new QUI\Utils\Grid();

        return $Grid->parseResult($result, count($sites));
    },
    ['brickId', 'options'],
    'Permission::checkAdminUser'
);
