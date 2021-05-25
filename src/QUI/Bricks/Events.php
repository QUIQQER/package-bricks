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
    protected static $saved = [];

    /**
     * Event : on site save
     * Create site brick cache, for inheritance
     *
     * @param Site|Edit $Site
     * @throws QUI\Exception
     */
    public static function onSiteSave($Site)
    {
        if (isset(self::$saved[$Site->getId()])) {
            return;
        }

        QUI\Permissions\Permission::checkPermission('quiqqer.bricks.assign');

        $areas = $Site->getAttribute('quiqqer.bricks.areas');
        $areas = \json_decode($areas, true);

        if (!$areas || empty($areas)) {
            return;
        }

        $Manager = Manager::init();

        // get inheritance areas
        $Project      = $Site->getProject();
        $projectAreas = $Manager->getAreasByProject($Project);
        $projectTable = QUI::getDBProjectTableName(Manager::TABLE_CACHE, $Project);

        $uidTable           = QUI\Bricks\Manager::getUIDTable();
        $availableUniqueIds = [];

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
            QUI::getDataBase()->delete($projectTable, [
                'id'   => $Site->getId(),
                'area' => $area['name']
            ]);

            // check if deactivated
            if (isset($bricks[0]) && isset($bricks[0]['deactivate'])) {
                QUI::getDataBase()->insert($projectTable, [
                    'id'    => $Site->getId(),
                    'area'  => $area['name'],
                    'brick' => -1
                ]);

                continue;
            }

            foreach ($bricks as $bricksKey => $brick) {
                try {
                    $Manager->getBrickById($brick['brickId']);
                } catch (QUI\Exception $Exception) {
                    unset($areas[$area['name']][$bricksKey]);
                    continue;
                }

                try {
                    $uid = $Manager->createUniqueSiteBrick($Site, $brick);
                } catch (QUI\Exception $Exception) {
                    unset($areas[$area['name']][$bricksKey]);
                    continue;
                }

                $areas[$area['name']][$bricksKey]['uid'] = $uid;

                $availableUniqueIds[] = $uid;


                $customFields = [];

                // Custom data cache
                if (isset($brick['customfields']) && \is_string($brick['customfields'])) {
                    $customFields = \json_decode($brick['customfields'], true);
                }

                if (isset($brick['customfields']) && \is_array($brick['customfields'])) {
                    $customFields = $brick['customfields'];
                }

                if (!isset($customFields['inheritance']) || !(int)$customFields['inheritance']) {
                    continue;
                }

                QUI::getDataBase()->insert($projectTable, [
                    'id'    => $Site->getId(),
                    'area'  => $area['name'],
                    'brick' => (int)$brick['brickId']
                ]);
            }
        }

        // cleanup unique ids
        $uniquerIdsInDataBase = QUI::getDataBase()->fetch([
            'select' => 'uid',
            'from'   => $uidTable,
            'where'  => [
                'project' => $Project->getName(),
                'lang'    => $Project->getLang(),
                'siteId'  => $Site->getId()
            ]
        ]);

        $uniquerIdsInDataBase = \array_map(function ($uid) {
            return $uid['uid'];
        }, $uniquerIdsInDataBase);

        $availableUniqueIds = \array_flip($availableUniqueIds);

        foreach ($uniquerIdsInDataBase as $uid) {
            if (isset($availableUniqueIds[$uid])) {
                continue;
            }

            QUI::getDataBase()->delete($uidTable, [
                'uid' => $uid
            ]);
        }

        self::$saved[$Site->getId()] = true;

        // save bricks with unique ids
        $Site->setAttribute('quiqqer.bricks.areas', \json_encode($areas));
        $Site->save();
    }

    /**
     * event: on project delete
     *
     * @param string $project
     */
    public static function onDeleteProject(string $project)
    {
        // delete uid entries
        try {
            QUI::getDataBase()->delete(QUI\Bricks\Manager::getUIDTable(), [
                'project' => $project
            ]);
        } catch (QUI\Exception $Exception) {
            QUI\System\Log::addError($Exception->getMessage());
        }


        // delete project bricks
        try {
            QUI::getDataBase()->delete(QUI\Bricks\Manager::getTable(), [
                'project' => $project
            ]);
        } catch (QUI\Exception $Exception) {
            QUI\System\Log::addError($Exception->getMessage());
        }


        // delete bricks project tables
        // Mainproject_de_bricksCache
        $Table  = QUI::getDataBase()->table();
        $tables = $Table->getTables();

        foreach ($tables as $table) {
            if (\strpos($table, $project) !== 0) {
                continue;
            }

            if (\strpos($table, '_bricksCache') === false) {
                continue;
            }

            $Table->delete($table);
        }
    }

    /**
     * Event : on smarty init
     * add new brickarea function
     *
     * @param \Smarty $Smarty
     * @throws \SmartyException
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
     * @return string|array
     */
    public static function brickarea($params, $smarty)
    {
        if (!isset($params['Site']) || !isset($params['area'])) {
            if (!isset($params['assign'])) {
                return '';
            }

            $smarty->assign($params['assign'], []);

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

    /**
     * @param QUI\Package\Package $Package
     */
    public static function onPackageSetup(QUI\Package\Package $Package)
    {
        if ($Package->getName() !== 'quiqqer/bricks') {
            return;
        }

        // unique bricks cache patch
        $projects = QUI::getProjectManager()->getProjectList();

        foreach ($projects as $Project) {
            $projectCacheTable = QUI::getDBProjectTableName(
                Manager::TABLE_CACHE,
                $Project
            );

            try {
                // Only drop composite primary key if it exists
                if (QUI::getDataBase()->table()->issetPrimaryKey($projectCacheTable, 'id')
                    && QUI::getDataBase()->table()->issetPrimaryKey($projectCacheTable, 'area')) {
                    // Primary key no longer exists and should be removed
                    QUI::getDataBase()->execSQL("ALTER TABLE `{$projectCacheTable}` DROP PRIMARY KEY;");
                }
            } catch (QUI\Exception $Exception) {
                QUI\System\Log::addInfo($Exception->getMessage());
            }
        }
    }

    //region output filter

    /**
     * @param $content
     */
    public static function onOutputParseEnd(&$content)
    {
        if (\strpos($content, '{{brick id=') === false) {
            return;
        }

        // search css files
        $content = \preg_replace_callback(
            '#{{brick ([^}}]*)}}#',
            ['QUI\Bricks\Events', "outputParsing"],
            $content
        );
    }

    /**
     * @param $match
     */
    public static function outputParsing($match): string
    {
        $params = $match[0];
        $params = \str_replace('{{brick', '', $params);
        $params = \trim($params, '}}');
        $params = \trim($params);
        $params = \explode(' ', $params);

        $attributes = [];

        foreach ($params as $param) {
            $a = \explode('=', $param);

            $attributes[$a[0]] = $a[1];
        }

        if (!isset($attributes['id'])) {
            return $match[0];
        }

        try {
            $brickId = (int)$attributes['id'];
            $Brick   = Manager::init()->getBrickById($brickId);

            return QUI\Output::getInstance()->parse($Brick->create());
        } catch (\Exception $Exception) {
        }

        return $match[0];
    }

    //endregion
}
