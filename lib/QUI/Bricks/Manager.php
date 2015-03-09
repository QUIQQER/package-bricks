<?php

/**
 * This file contains \QUI\Bricks\Manager
 */

namespace QUI\Bricks;

use QUI;
use QUI\Projects\Project;
use QUI\Projects\Site;

/**
 * Brick Manager
 *
 * @package quiqqer/bricks
 */
class Manager
{
    /**
     * Bricks table name
     */
    const TABLE       = 'bricks';
    const TABLE_CACHE = 'bricksCache';

    /**
     * Brick temp collector
     * @var array
     */
    protected $_bricks = array();

    /**
     * Creates a new brick for the project
     *
     * @param Project $Project
     * @param Brick $Brick
     * @return integer - Brick-ID
     */
    public function createBrickForProject(Project $Project, Brick $Brick)
    {
        QUI\Rights\Permission::checkPermission( 'quiqqer.bricks.create' );


        QUI::getDataBase()->insert(
            $this->_getTable(),
            array(
                'project'     => $Project->getName(),
                'lang'        => $Project->getLang(),
                'title'       => $Brick->getAttribute('title'),
                'description' => $Brick->getAttribute('description'),
                'type'        => $Brick->getAttribute('type')
            )
        );

        $lastId = QUI::getPDO()->lastInsertId();

        return $lastId;
    }

    /**
     * CLears the bricks cache
     */
    public function clearCache()
    {
        QUI\Cache\Manager::clear( 'quiqqer/bricks' );
    }

    /**
     * Delete the brick
     *
     * @param Integer $brickId - Brick-ID
     */
    public function deleteBrick($brickId)
    {
        QUI\Rights\Permission::checkPermission( 'quiqqer.bricks.delete' );

        // check if brick exist
        $this->getBrickById( $brickId );

        QUI::getDataBase()->delete($this->_getTable(), array(
            'id' => $brickId
        ));
    }

    /**
     * Return the areas which are available in the project
     *
     * @param Project $Project
     * @param string|bool $layoutType - optional, returns only the areas for the specific layout type (default = false)
     * @return array
     */
    public function getAreasByProject(Project $Project, $layoutType=false)
    {
        $templates = array();
        $bricks    = array();

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

        $templates = array_unique( $templates );

        // get bricks
        foreach ( $templates as $template )
        {
            $brickXML = realpath( OPT_DIR . $template .'/bricks.xml' );

            if ( !$brickXML ) {
                continue;
            }

            $bricks = array_merge(
                $bricks,
                Utils::getTemplateAreasFromXML( $brickXML, $layoutType )
            );
        }

        QUI::getEvents()->fireEvent(
            'onBricksGetAreaByProject',
            array( $this, $Project, &$bricks )
        );

        return $bricks;
    }

    /**
     * Returns the available bricks
     *
     * @return array
     */
    public function getAvailableBricks()
    {
        $cache = 'quiqqer/bricks/availableBricks';

        try
        {
            return QUI\Cache\Manager::get( $cache );

        } catch ( QUI\Exception $Exception )
        {

        }

        $xmlFiles = $this->_getBricksXMLFiles();
        $result   = array();

        $result[] = array(
            'title'       => array( 'quiqqer/bricks', 'brick.content.title' ),
            'description' => array( 'quiqqer/bricks', 'brick.content.description' ),
            'control'     => 'content'
        );

        foreach ( $xmlFiles as $bricksXML ) {
            $result = array_merge( $result, Utils::getBricksFromXML( $bricksXML ) );
        }

        QUI\Cache\Manager::set( $cache, $result );


        return $result;
    }

    /**
     * Get a Brick by its Brick-ID
     *
     * @param Integer $id
     * @return Brick
     * @throws QUI\Exception
     */
    public function getBrickById($id)
    {
        if ( isset( $this->_bricks[ $id ] ) ) {
            return $this->_bricks[ $id ];
        }

        $data = QUI::getDataBase()->fetch(array(
            'from'  => $this->_getTable(),
            'where' => array(
                'id' => (int)$id
            ),
            'limit' => 1
        ));

        if ( !isset( $data[0] ) ) {
            throw new QUI\Exception( 'Brick not found' );
        }

        $this->_bricks[ $id ] = new Brick( $data[0] );

        return $this->_bricks[ $id ];
    }

    /**
     * Return the available brick settings by the brick type
     *
     * @param $brickType
     * @return array
     */
    public function getAvailableBrickSettingsByBrickType($brickType)
    {
        if ( $brickType == 'content' ) {
            return array();
        }

        $cache = 'quiqqer/bricks/brickType/'. md5($brickType);

        try
        {
            return QUI\Cache\Manager::get( $cache );

        } catch ( QUI\Exception $Exception )
        {

        }


        $settings = array();
        $xmlFiles = $this->_getBricksXMLFiles();

        foreach ( $xmlFiles as $brickXML )
        {
            $Dom  = QUI\Utils\XML::getDomFromXml( $brickXML );
            $Path = new \DOMXPath( $Dom );

            $Settings = $Path->query(
                "//quiqqer/bricks/brick[@control='{$brickType}']/settings/setting"
            );

            if ( !$Settings->length ) {
                continue;
            }

            foreach ( $Settings as $Setting )
            {
                /* @var $Setting \DOMElement */
                $settings[] = array(
                    'name'     => $Setting->getAttribute( 'name' ),
                    'text'     => QUI\Utils\DOM::getTextFromNode( $Setting ),
                    'type'     => $Setting->getAttribute( 'type' ),
                    'class'    => $Setting->getAttribute( 'class' ),
                    'data-qui' => $Setting->getAttribute( 'data-qui' )
                );
            }

            break;
        }

        QUI\Cache\Manager::set( $cache, $settings );

        return $settings;
    }

    /**
     * Return the bricks from the area
     *
     * @param string $brickArea - Name of the area
     * @param Site $Site
     * @return array
     */
    public function getBricksByArea($brickArea, Site $Site)
    {
        if ( empty( $brickArea ) ) {
            return array();
        }

        $brickAreas = $Site->getAttribute( 'quiqqer.bricks.areas' );
        $brickAreas = json_decode( $brickAreas, true );

        if ( !isset( $brickAreas[ $brickArea ] ) || empty( $brickAreas[ $brickArea ] ) )
        {
            $bricks = $this->_getInheritedBricks( $brickArea, $Site );

        } else
        {
            $bricks    = array();
            $brickData = $brickAreas[ $brickArea ];

            foreach ( $brickData as $brick )
            {
                if ( isset( $brick['deactivate'] ) ) {
                    break;
                }

                $bricks[] = $brick[ 'brickId' ];
            }
        }


        $result = array();

        foreach ( $bricks as $brickId )
        {
            $brickId = (int)$brickId;

            try
            {
                $result[] = $this->getBrickById( $brickId )->check();

            } catch ( QUI\Exception $Exception )
            {
                QUI\System\Log::addWarning(
                    $Exception->getMessage() .' Brick-ID:'. $brickId
                );
            }
        }


        return $result;
    }

    /**
     * Return a list with \QUI\Bricks\Brick which are assigned to a project
     *
     * @param Project $Project
     * @return array
     */
    public function getBricksFromProject(Project $Project)
    {
        $result = array();

        $list = QUI::getDataBase()->fetch(array(
            'from'  => $this->_getTable(),
            'where' => array(
                'project' => $Project->getName(),
                'lang'    => $Project->getLang()
            )
        ));

        foreach ( $list as $entry )
        {
            $Brick = new Brick( $entry );
            $Brick->setAttribute( 'id', $entry['id'] );

            $result[] = $Brick;
        }

        return $result;
    }

    /**
     * @param string|integer $brickId - Brick-ID
     * @param array $brickData - Brick data
     */
    public function saveBrick($brickId, array $brickData)
    {
        QUI\Rights\Permission::checkPermission( 'quiqqer.bricks.edit' );

        $Brick      = $this->getBrickById( $brickId );
        $areas      = array();
        $areaString = '';

        if ( isset( $brickData[ 'id' ] ) ) {
            unset( $brickData[ 'id' ] );
        }

        // check areas
        $Project = QUI::getProjectManager()->getProject(
            $Brick->getAttribute( 'project' )
        );

        $availableAreas = array_map(function($data)
        {
            if ( isset( $data[ 'name' ] ) ) {
                return $data[ 'name' ];
            }

            return '';
        }, $this->getAreasByProject( $Project ));


        if ( isset( $brickData[ 'areas' ] ) )
        {
            $parts = explode( ',', $brickData[ 'areas' ] );

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


        $Brick->setAttributes( $brickData );

        if ( isset( $brickData['settings'] ) ) {
            $Brick->setSettings( $brickData['settings'] );
        }

        QUI::getDataBase()->update($this->_getTable(), array(
            'title'       => $Brick->getAttribute( 'title' ),
            'description' => $Brick->getAttribute( 'description' ),
            'content'     => $Brick->getAttribute( 'content' ),
            'type'        => $Brick->getAttribute( 'type' ),
            'settings'    => json_encode( $Brick->getSettings() ),
            'areas'       => $areaString
        ), array(
            'id' => (int)$brickId
        ));
    }

    /**
     * Returns the bricks table name
     * @return String
     */
    protected function _getTable()
    {
        return QUI::getDBTableName( self::TABLE );
    }

    /**
     * List of available bricks.xml files
     * @return array
     */
    protected function _getBricksXMLFiles()
    {
        $cache = 'quiqqer/bricks/availableBrickFiles';

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
            $bricksXML = OPT_DIR . $package['name'] .'/bricks.xml';

            if ( !file_exists( $bricksXML ) ) {
                continue;
            }

            $result[] = $bricksXML;
        }

        QUI\Cache\Manager::set( $cache, $result );

        return $result;
    }

    /**
     * Return the bricks from an area which are inherited from its parents
     *
     * @param String $brickArea - Name of the area
     * @param Site $Site - Site object
     * @return array
     */
    protected function _getInheritedBricks($brickArea, Site $Site)
    {

        // inheritance ( vererbung )
        $Project = $Site->getProject();
        $areas   = $this->getAreasByProject( $Project );

        foreach ( $areas as $area )
        {
            if ( $area['name'] != $brickArea ) {
                continue;
            }

            if ( !$area['inheritance'] ) {
                return array();
            }

            break;
        }


        if ( !isset( $area ) || !isset( $area['name'] ) ) {
            return array();
        }

        if ( $area['name'] != $brickArea ) {
            return array();
        }

        if ( !Utils::hasInheritance( $Project, $brickArea ) ) {
            return array();
        }


        $result    = array();
        $parentIds = $Site->getParentIdTree();
        $parentIds = array_reverse( $parentIds );

        $projectCacheTable = QUI::getDBProjectTableName( self::TABLE_CACHE, $Project );

        foreach ( $parentIds as $parentId )
        {
            $bricks = QUI::getDataBase()->fetch(array(
                'from'  => $projectCacheTable,
                'where' => array(
                    'id'   => $parentId,
                    'area' => $brickArea
                )
            ));

            if ( empty( $bricks ) ) {
                continue;
            }

            foreach ( $bricks as $brick ) {
                $result[] = $brick['brick'];
            }

            break;
        }

        return $result;
    }
}
