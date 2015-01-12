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
    static function onSiteSave($Site)
    {
        $areas = $Site->getAttribute( 'quiqqer.bricks.areas' );
        $areas = json_decode( $areas, true );

        if ( !$areas || empty( $areas ) ) {
            return;
        }

        $Manager = new Manager();

        // get inharitance areas
        $Project      = $Site->getProject();
        $projectAreas = $Manager->getAreasByProject( $Project );
        $projectTable = QUI::getDBProjectTableName( Manager::TABLE_CACHE, $Project );

        foreach ( $projectAreas as $area )
        {
            if ( !$area[ 'inheritance' ] ) {
                continue;
            }

            if ( !isset( $areas[ $area[ 'name' ] ] ) ) {
                continue;
            }

            if ( empty( $areas[ $area[ 'name' ] ] ) ) {
                continue;
            }

            $bricks = $areas[ $area[ 'name' ] ];

            // clear area and new data set
            QUI::getDataBase()->delete($projectTable, array(
                'id'   => $Site->getId(),
                'area' => $area
            ));

            foreach ( $bricks as $brickId )
            {
                QUI::getDataBase()->insert($projectTable, array(
                    'id'    => $Site->getId(),
                    'area'  => $area[ 'name' ],
                    'brick' => $brickId
                ));
            }
        }
    }
}