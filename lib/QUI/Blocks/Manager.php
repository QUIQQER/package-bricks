<?php

/**
 * This file contains \QUI\Blocks\Manager
 */

namespace QUI\Blocks;

use QUI;
use QUI\Projects\Project;
use QUI\Projects\Site;

/**
 * Block Manager
 *
 * @package quiqqer/blocks
 */
class Manager
{
    /**
     * Blocks table name
     */
    const TABLE = 'blocks';

    /**
     * Returns the available blocks
     *
     * @return array
     */
    public function getAvailableBlocks()
    {
        $cache = 'quiqqer/blocks/availableBlocks';

        try
        {
            return QUI\Cache\Manager::get( $cache );

        } catch ( QUI\Exception $Exception )
        {

        }

        $PKM      = QUI::getPackageManager();
        $packages = $PKM->getInstalled();
        $result   = array();

        foreach ( $packages as $package )
        {
            $blocksXML = OPT_DIR . $package['name'] .'/blocks.xml';

            if ( !file_exists( $blocksXML ) ) {
                continue;
            }

            $result = array_merge( $result, Utils::getBlocksFromXML( $blocksXML ) );
        }

        QUI\Cache\Manager::set( $cache, $result );


        return $result;
    }

    /**
     * Return the blocks from the area
     *
     * @param string $blockArea - Name of the area
     * @param Site $Site
     * @return array
     */
    public function getBlocksByArea($blockArea, Site $Site)
    {
        if ( empty( $blockArea ) ) {
            return array();
        }

        $blockAreas = $Site->getAttribute( 'quiqqer.blocks.areas' );

        QUI\System\Log::writeRecursive( $blockAreas );

        return array();
    }

    /**
     * Return a list with \QUI\Blocks\Block which are assigned to a project
     *
     * @param Project $Project
     * @return array
     */
    public function getBlocksFromProject(Project $Project)
    {
        $result = array();

        $list = QUI::getDataBase()->fetch(array(
            'from'  => $this->_getTable(),
            'where' => array(
                'project' => $Project->getName()
            )
        ));

        foreach ( $list as $entry )
        {
            $Block = new Block();

            $Block->setAttribute( 'title', $entry['title'] );
            $Block->setAttribute( 'description', $entry['description'] );

            $settings = json_decode( $entry['settings'], true );
            $Block->setAttributes( $settings );

            $result[] = $Block;
        }

        return $result;
    }

    /**
     * Returns the blocks table name
     * @return String
     */
    protected function _getTable()
    {
        return QUI::getDBTableName( self::TABLE );
    }
}
