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
     * Block temp collector
     * @var array
     */
    protected $_blocks = array();

    /**
     * Creates a new block for the project
     *
     * @param Project $Project
     * @param Block $Block
     * @return integer - Block-ID
     */
    public function createBlockForProject(Project $Project, Block $Block)
    {
        QUI::getDataBase()->insert(
            $this->_getTable(),
            array(
                'project'     => $Project->getName(),
                'title'       => $Block->getAttribute('title'),
                'description' => $Block->getAttribute('description'),
                'type'        => $Block->getAttribute('type')
            )
        );

        $lastId = QUI::getPDO()->lastInsertId();

        return $lastId;
    }

    /**
     * Return the areas which are available in the project
     *
     * @param Project $Project
     * @param string|bool $siteType - optional, returns only the areas for the specific site type (default = false)
     * @return array
     */
    public function getAreasByProject(Project $Project, $siteType=false)
    {
        $templates = array();
        $blocks    = array();

        $projectName = $Project->getName();

        // get all vhosts, and the used templates of the project
        $vhosts = QUI::getRewrite()->getVHosts();

        foreach ( $vhosts as $vhost )
        {
            if ( !isset( $vhost['template'] ) ) {
                continue;
            }

            if ( $vhost['project'] != $projectName ) {
                continue;
            }

            $templates[] = $vhost['template'];
        }

        // get blocks
        foreach ( $templates as $template )
        {
            $blockXML = realpath( OPT_DIR . $template .'/blocks.xml' );

            if ( !$blockXML ) {
                continue;
            }

            $blocks = array_merge(
                $blocks,
                Utils::getTemplateAreasFromXML( $blockXML, $siteType )
            );
        }

        return $blocks;
    }

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

        $result[] = array(
            'title'       => array( 'quiqqer/blocks', 'block.content.title' ),
            'description' => array( 'quiqqer/blocks', 'block.content.description' ),
            'control'     => 'content'
        );

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
     * Get a Block by its Block-ID
     *
     * @param Integer $id
     * @return Block
     * @throws QUI\Exception
     */
    public function getBlockById($id)
    {
        if ( isset( $this->_blocks[ $id ] ) ) {
            return $this->_blocks[ $id ];
        }

        $data = QUI::getDataBase()->fetch(array(
            'from'  => $this->_getTable(),
            'where' => array(
                'id' => (int)$id
            ),
            'limit' => 1
        ));

        if ( !isset( $data[0] ) ) {
            throw new QUI\Exception( 'Block not found' );
        }

        $this->_blocks[ $id ] = new Block( $data[0] );

        return $this->_blocks[ $id ];
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
        $blockAreas = json_decode( $blockAreas, true );

        if ( !isset( $blockAreas[ $blockArea ] ) ) {
            return array();
        }

        $result = array();
        $blocks = $blockAreas[ $blockArea ];

        foreach ( $blocks as $blockId )
        {
            $blockId = (int)$blockId;

            try
            {
                $result[] = $this->getBlockById( $blockId );

            } catch ( QUI\Exception $Exception )
            {

            }
        }


        return $result;
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

            $Block->setAttribute( 'id', $entry['id'] );
            $Block->setAttribute( 'title', $entry['title'] );
            $Block->setAttribute( 'description', $entry['description'] );

            $settings = json_decode( $entry['settings'], true );
            $Block->setAttributes( $settings );

            $result[] = $Block;
        }

        return $result;
    }

    /**
     * @param string|integer $blockId - Block-ID
     * @param array $blockData - Block data
     */
    public function saveBlock($blockId, array $blockData)
    {
        $Block      = $this->getBlockById( $blockId );
        $areas      = array();
        $areaString = '';

        if ( isset( $blockData[ 'id' ] ) ) {
            unset( $blockData[ 'id' ] );
        }

        // check areas
        $Project = QUI::getProjectManager()->getProject(
            $Block->getAttribute( 'project' )
        );

        $availableAreas = array_map(function($data)
        {
            if ( isset( $data[ 'name' ] ) ) {
                return $data[ 'name' ];
            }

            return '';
        }, $this->getAreasByProject( $Project ));


        if ( isset( $blockData[ 'areas' ] ) )
        {
            $parts = explode( ',', $blockData[ 'areas' ] );

            foreach ( $parts as $area )
            {
                if ( in_array( $area, $availableAreas ) ) {
                    $areas[] = $area;
                }
            }
        }

        if ( !empty( $areas ) ) {
            $areaString = ','. implode( ',', $areas ) .',';
        }


        $Block->setAttributes( $blockData );

        QUI::getDataBase()->update($this->_getTable(), array(
            'title'       => $Block->getAttribute( 'title' ),
            'description' => $Block->getAttribute( 'description' ),
            'content'     => $Block->getAttribute( 'content' ),
            'type'        => $Block->getAttribute( 'type' ),
            'settings'    => json_encode( $Block->getAttribute( 'settings' ) ),
            'areas'       => $areaString
        ), array(
            'id' => (int)$blockId
        ));
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
