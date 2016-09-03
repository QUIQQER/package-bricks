<?php

/**
 * This file contains \QUI\Bricks\Events
 */

namespace QUI\Bricks;

use QUI;
use QUI\Projects\Site;
use QUI\Projects\Site\Edit;

/**
 * Class Events
 *
 * @package quiqqer/bricks
 */
class Events
{
    /**
     * Event : on site save
     * Create site brick cache, for inheritance
     *
     * @param Site|Edit $Site
     */
    public static function onSiteSave($Site)
    {
        QUI\Permissions\Permission::checkPermission('quiqqer.bricks.assign');

        $areas = $Site->getAttribute('quiqqer.bricks.areas');
        $areas = json_decode($areas, true);

        if (!$areas || empty($areas)) {
            return;
        }

        $Manager = Manager::init();

        // get inharitance areas
        $Project      = $Site->getProject();
        $projectAreas = $Manager->getAreasByProject($Project);
        $projectTable = QUI::getDBProjectTableName(Manager::TABLE_CACHE, $Project);


        foreach ($projectAreas as $area) {
            if (!$area['inheritance']) {
                continue;
            }

            if (!isset($areas[$area['name']])) {
                continue;
            }

            if (empty($areas[$area['name']])) {
                continue;
            }

            $bricks = $areas[$area['name']];

            // clear area and new data set
            QUI::getDataBase()->delete($projectTable, array(
                'id'   => $Site->getId(),
                'area' => $area['name']
            ));

            // check if deactivated
            if (isset($bricks[0]) && isset($bricks[0]['deactivate'])) {
                QUI::getDataBase()->insert($projectTable, array(
                    'id'    => $Site->getId(),
                    'area'  => $area['name'],
                    'brick' => -1
                ));

                continue;
            }


            foreach ($bricks as $brick) {
                $customFields = array();

                if (isset($brick['customfields'])
                    && is_string($brick['customfields'])
                ) {
                    $customFields = json_decode($brick['customfields'], true);
                }

                if (isset($brick['customfields'])
                    && is_array($brick['customfields'])
                ) {
                    $customFields = $brick['customfields'];
                }

                if (!isset($customFields['inheritance'])
                    || !(int)$customFields['inheritance']
                ) {
                    continue;
                }

                QUI::getDataBase()->insert($projectTable, array(
                    'id'    => $Site->getId(),
                    'area'  => $area['name'],
                    'brick' => (int)$brick['brickId']
                ));
            }
        }
    }

    /**
     * Event : on smarty init
     * add new brickarea function
     *
     * @param \Smarty $Smarty
     */
    public static function onSmartyInit($Smarty)
    {
        // {brickarea}
        if (!isset($Smarty->registered_plugins['function'])
            || !isset($Smarty->registered_plugins['function']['brickarea'])
        ) {
            $Smarty->registerPlugin("function", "brickarea", "\\QUI\\Bricks\\Events::brickarea");
        }
    }

    /**
     * Smarty brickarea function {brickarea}
     *
     * @param array $params - function parameter
     * @param \Smarty $smarty
     * @return string
     */
    public static function brickarea($params, $smarty)
    {
        if (!isset($params['Site']) || !isset($params['area'])) {
            if (!isset($params['assign'])) {
                return '';
            }

            $smarty->assign($params['assign'], array());
            return '';
        }


        $BricksManager = QUI\Bricks\Manager::init();

        $Site = $params['Site'];
        $area = $params['area'];

        $result = $BricksManager->getBricksByArea($area, $Site);

        if (!isset($params['assign'])) {
            return $result;
        }

        $smarty->assign($params['assign'], $result);
        return '';
    }
}
