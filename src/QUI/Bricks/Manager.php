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
    const TABLE = 'bricks';

    /**
     * Bricks uid table name
     */
    const TABLE_UID = 'bricksUID';

    /**
     * Brick Cache table name
     */
    const TABLE_CACHE = 'bricksCache';

    /**
     * Brick temp collector
     *
     * @var array
     */
    protected $bricks = array();

    /**
     * Brick UID temp collector
     *
     * @var array
     */
    protected $brickUIDs = array();

    /**
     * Initialized brick manager
     *
     * @var null
     */
    public static $BrickManager = null;

    /**
     * Return the global QUI\Bricks\Manager
     *
     * @return Manager
     */
    public static function init()
    {
        if (self::$BrickManager === null) {
            self::$BrickManager = new QUI\Bricks\Manager(true);
        }

        return self::$BrickManager;
    }

    /**
     * Constructor
     * Please use \QUI\Bricks\Manager::init()
     *
     * @param boolean $init - please use \QUI\Bricks\Manager::init()
     */
    public function __construct($init = false)
    {
        if ($init === false) {
            QUI\System\Log::addWarning('Please use \QUI\Bricks\Manager::init()');
        }
    }

    /**
     * Creates a new brick for the project
     *
     * @param Project $Project
     * @param Brick $Brick
     *
     * @return integer - Brick-ID
     */
    public function createBrickForProject(Project $Project, Brick $Brick)
    {
        QUI\Rights\Permission::checkPermission('quiqqer.bricks.create');


        QUI::getDataBase()->insert(
            $this->getTable(),
            array(
                'project' => $Project->getName(),
                'lang' => $Project->getLang(),
                'title' => $Brick->getAttribute('title'),
                'description' => $Brick->getAttribute('description'),
                'type' => $Brick->getAttribute('type')
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
        QUI\Cache\Manager::clear('quiqqer/bricks');
    }

    /**
     * Delete the brick
     *
     * @param integer $brickId - Brick-ID
     */
    public function deleteBrick($brickId)
    {
        QUI\Rights\Permission::checkPermission('quiqqer.bricks.delete');

        // check if brick exist
        $this->getBrickById($brickId);

        QUI::getDataBase()->delete($this->getTable(), array(
            'id' => $brickId
        ));
    }

    /**
     * Return the areas which are available in the project
     *
     * @param Project $Project
     * @param string|boolean $layoutType - optional, returns only the areas
     *                                     for the specific layout type
     *                                     (default = false)
     * @return array
     */
    public function getAreasByProject(Project $Project, $layoutType = false)
    {
        $templates = array();
        $bricks    = array();

        $projectName = $Project->getName();

        if ($Project->getAttribute('template')) {
            $templates[] = $Project->getAttribute('template');
        }

        // get all vhosts, and the used templates of the project
        $vhosts = QUI::getRewrite()->getVHosts();

        foreach ($vhosts as $vhost) {
            if (!isset($vhost['template'])) {
                continue;
            }

            if ($vhost['project'] != $projectName) {
                continue;
            }

            $templates[] = $vhost['template'];
        }

        $templates = array_unique($templates);

        // get bricks
        foreach ($templates as $template) {
            $brickXML = realpath(OPT_DIR . $template . '/bricks.xml');

            if (!$brickXML) {
                continue;
            }

            $bricks = array_merge(
                $bricks,
                Utils::getTemplateAreasFromXML($brickXML, $layoutType)
            );
        }

        // unque values
        $cleaned = array();
        foreach ($bricks as $val) {
            if (!isset($cleaned[$val['name']])) {
                $cleaned[$val['name']] = $val;
            }
        }

        $bricks = array_values($cleaned);

        // use @ because: https://bugs.php.net/bug.php?id=50688
        @usort($bricks, function ($a, $b) {

            $transA = QUI::getLocale()->get(
                $a['title']['group'],
                $a['title']['var']
            );

            $transB = QUI::getLocale()->get(
                $b['title']['group'],
                $b['title']['var']
            );

            return $transA > $transB ? 1 : -1;
        });


        QUI::getEvents()->fireEvent(
            'onBricksGetAreaByProject',
            array($this, $Project, &$bricks)
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

        try {
            return QUI\Cache\Manager::get($cache);

        } catch (QUI\Exception $Exception) {
        }

        $xmlFiles = $this->getBricksXMLFiles();
        $result   = array();

        $result[] = array(
            'title' => array('quiqqer/bricks', 'brick.content.title'),
            'description' => array(
                'quiqqer/bricks',
                'brick.content.description'
            ),
            'control' => 'content'
        );

        foreach ($xmlFiles as $bricksXML) {
            $result = array_merge($result, Utils::getBricksFromXML($bricksXML));
        }

        QUI\Cache\Manager::set($cache, $result);


        return $result;
    }

    /**
     * Get a Brick by its Brick-ID
     *
     * @param integer $id
     *
     * @return Brick
     * @throws QUI\Exception
     */
    public function getBrickById($id)
    {
        if (isset($this->bricks[$id])) {
            return $this->bricks[$id];
        }

        $data = QUI::getDataBase()->fetch(array(
            'from' => $this->getTable(),
            'where' => array(
                'id' => (int)$id
            ),
            'limit' => 1
        ));

        if (!isset($data[0])) {
            throw new QUI\Exception('Brick not found');
        }

        $Brick = new Brick($data[0]);
        $Brick->setAttribute('id', $id);

        $this->bricks[$id] = $Brick;

        return $this->bricks[$id];
    }

    /**
     * Get a Brick by its unique ID
     *
     * @param string $uid
     *
     * @return Brick
     * @throws QUI\Exception
     */
    public function getBrickByUID($uid)
    {
        if (isset($this->brickUIDs[$uid])) {
            return $this->brickUIDs[$uid];
        }

        $data = QUI::getDataBase()->fetch(array(
            'from' => $this->getTable(),
            'where' => array(
                'id' => (int)$uid
            ),
            'limit' => 1
        ));

        if (!isset($data[0])) {
            throw new QUI\Exception('Brick not found');
        }

        $Brick = new Brick($data[0]);
        $Brick->setAttribute('id', $id);

        $this->bricks[$id] = $Brick;

        return $this->bricks[$id];
    }

    /**
     * Return the available brick settings by the brick type
     *
     * @param $brickType
     *
     * @return array
     */
    public function getAvailableBrickSettingsByBrickType($brickType)
    {
        $cache = 'quiqqer/bricks/brickType/' . md5($brickType);

        try {
            return QUI\Cache\Manager::get($cache);

        } catch (QUI\Exception $Exception) {
        }


        $settings = array();

        $settings[] = array(
            'name' => 'width',
            'text' => array('quiqqer/bricks', 'site.area.window.settings.setting.width'),
            'type' => '',
            'class' => '',
            'data-qui' => '',
            'options' => false
        );

        $settings[] = array(
            'name' => 'height',
            'text' => array('quiqqer/bricks', 'site.area.window.settings.setting.height'),
            'type' => '',
            'class' => '',
            'data-qui' => '',
            'options' => false
        );

        $settings[] = array(
            'name' => 'classes',
            'text' => array('quiqqer/bricks', 'site.area.window.settings.setting.classes'),
            'type' => '',
            'class' => '',
            'data-qui' => '',
            'options' => false
        );

        $xmlFiles = $this->getBricksXMLFiles();

        foreach ($xmlFiles as $brickXML) {
            $Dom  = QUI\Utils\XML::getDomFromXml($brickXML);
            $Path = new \DOMXPath($Dom);

            $Settings = $Path->query(
                "//quiqqer/bricks/brick[@control='{$brickType}']/settings/setting"
            );

            $Globals = $Path->query(
                "//quiqqer/bricks/brick[@control='*']/settings/setting"
            );

            foreach ($Globals as $Setting) {
                $settings[] = $this->parseSettingToBrickArray($Setting);
            }

            foreach ($Settings as $Setting) {
                $settings[] = $this->parseSettingToBrickArray($Setting);
            }
        }

        QUI\Cache\Manager::set($cache, $settings);

        return $settings;
    }

    /**
     * Parse a xml setting element to a brick array
     *
     * @param \DOMElement $Setting
     * @return array
     */
    protected function parseSettingToBrickArray(\DOMElement $Setting)
    {
        /* @var $Option \DOMElement */
        $options = false;

        if ($Setting->getAttribute('type') == 'select') {
            $optionElements = $Setting->getElementsByTagName('option');

            foreach ($optionElements as $Option) {
                $options[] = array(
                    'value' => $Option->getAttribute('value'),
                    'text' => QUI\Utils\DOM::getTextFromNode($Option, false)
                );
            }
        }

        return array(
            'name' => $Setting->getAttribute('name'),
            'text' => QUI\Utils\DOM::getTextFromNode($Setting, false),
            'type' => $Setting->getAttribute('type'),
            'class' => $Setting->getAttribute('class'),
            'data-qui' => $Setting->getAttribute('data-qui'),
            'options' => $options
        );
    }

    /**
     * Return the bricks from the area
     *
     * @param string $brickArea - Name of the area
     * @param Site $Site
     *
     * @return array
     */
    public function getBricksByArea($brickArea, Site $Site)
    {
        if (empty($brickArea)) {
            return array();
        }

        $brickAreas = $Site->getAttribute('quiqqer.bricks.areas');
        $brickAreas = json_decode($brickAreas, true);

        if (!isset($brickAreas[$brickArea]) || empty($brickAreas[$brickArea])) {
            $bricks = $this->getInheritedBricks($brickArea, $Site);

        } else {
            $bricks    = array();
            $brickData = $brickAreas[$brickArea];

            foreach ($brickData as $brick) {
                if (isset($brick['deactivate'])) {
                    break;
                }

                $bricks[] = $brick;
            }
        }


        $result = array();

        foreach ($bricks as $brickData) {
            $brickId = (int)$brickData['brickId'];

            try {
                $Brick = $this->getBrickById($brickId);
                $Clone = clone $Brick;

                if (isset($brickData['customfields'])
                    && !empty($brickData['customfields'])
                ) {
                    $custom = json_decode($brickData['customfields'], true);

                    if ($custom) {
                        $Clone->setSettings($custom);
                    }
                }

                $result[] = $Clone->check();

            } catch (QUI\Exception $Exception) {
                QUI\System\Log::addWarning(
                    $Exception->getMessage() . ' Brick-ID:' . $brickId
                );
            }
        }


        return $result;
    }

    /**
     * Return a list with \QUI\Bricks\Brick which are assigned to a project
     *
     * @param Project $Project
     *
     * @return array
     */
    public function getBricksFromProject(Project $Project)
    {
        $result = array();

        $list = QUI::getDataBase()->fetch(array(
            'from' => $this->getTable(),
            'where' => array(
                'project' => $Project->getName(),
                'lang' => $Project->getLang()
            )
        ));

        foreach ($list as $entry) {
            $result[] = $this->getBrickById($entry['id']);
        }

        return $result;
    }

    /**
     * @param string|integer $brickId - Brick-ID
     * @param array $brickData - Brick data
     */
    public function saveBrick($brickId, array $brickData)
    {
        QUI\Rights\Permission::checkPermission('quiqqer.bricks.edit');

        $Brick      = $this->getBrickById($brickId);
        $areas      = array();
        $areaString = '';

        if (isset($brickData['id'])) {
            unset($brickData['id']);
        }

        // check areas
        $Project = QUI::getProjectManager()->getProject(
            $Brick->getAttribute('project')
        );

        $availableAreas = array_map(function ($data) {
            if (isset($data['name'])) {
                return $data['name'];
            }

            return '';
        }, $this->getAreasByProject($Project));

        if (isset($brickData['attributes'])
            && isset($brickData['attributes']['areas'])
        ) {
            $brickData['areas'] = $brickData['attributes']['areas'];
        }


        if (isset($brickData['areas'])) {
            $parts = explode(',', $brickData['areas']);

            foreach ($parts as $area) {
                if (in_array($area, $availableAreas)) {
                    $areas[] = $area;
                }
            }
        }

        if (!empty($areas)) {
            $areaString = ',' . implode(',', $areas) . ',';
        }

        $Brick->setAttributes($brickData);

        // fields
        if (isset($brickData['attributes'])) {
            foreach ($brickData['attributes'] as $key => $value) {
                if ($key == 'areas') {
                    continue;
                }

                $Brick->setAttribute($key, $value);
            }
        }

        // brick settings
        if (isset($brickData['settings'])) {
            $Brick->setSettings($brickData['settings']);
        }


        // custom fields
        $customfields = array();

        if (isset($brickData['customfields'])) {
            $availableSettings           = $Brick->getSettings();
            $availableSettings['width']  = true;
            $availableSettings['height'] = true;

            foreach ($brickData['customfields'] as $customfield) {
                $customfield = str_replace('flexible-', '', $customfield);

                if ($customfield == 'classes') {
                    $customfields[] = $customfield;
                    continue;
                }

                if (isset($availableSettings[$customfield])) {
                    $customfields[] = $customfield;
                }
            }
        }

        // update
        QUI::getDataBase()->update($this->getTable(), array(
            'title' => $Brick->getAttribute('title'),
            'description' => $Brick->getAttribute('description'),
            'content' => $Brick->getAttribute('content'),
            'type' => $Brick->getAttribute('type'),
            'settings' => json_encode($Brick->getSettings()),
            'customfields' => json_encode($customfields),
            'areas' => $areaString,
            'height' => $Brick->getAttribute('height'),
            'width' => $Brick->getAttribute('width'),
            'classes' => json_encode($Brick->getCSSClasses())
        ), array(
            'id' => (int)$brickId
        ));
    }

    /**
     * Returns the bricks table name
     *
     * @return String
     */
    protected function getTable()
    {
        return QUI::getDBTableName(self::TABLE);
    }

    /**
     * @return string
     */
    protected function getUIDTable()
    {
        return QUI::getDBTableName(self::TABLE);
    }

    /**
     * List of available bricks.xml files
     *
     * @return array
     */
    protected function getBricksXMLFiles()
    {
        $cache = 'quiqqer/bricks/availableBrickFiles';

        try {
            return QUI\Cache\Manager::get($cache);

        } catch (QUI\Exception $Exception) {
        }

        $PKM      = QUI::getPackageManager();
        $Projects = QUI::getProjectManager();
        $packages = $PKM->getInstalled();
        $result   = array();

        // package bricks
        foreach ($packages as $package) {
            $bricksXML = OPT_DIR . $package['name'] . '/bricks.xml';

            if (file_exists($bricksXML)) {
                $result[] = $bricksXML;
            }
        }

        // project bricks
        $projects = $Projects->getProjects();

        foreach ($projects as $project) {
            $bricksXML = USR_DIR . $project . '/bricks.xml';

            if (file_exists($bricksXML)) {
                $result[] = $bricksXML;
            }
        }


        QUI\Cache\Manager::set($cache, $result);

        return $result;
    }

    /**
     * Return the bricks from an area which are inherited from its parents
     *
     * @param string $brickArea - Name of the area
     * @param Site $Site - Site object
     *
     * @return array
     */
    protected function getInheritedBricks($brickArea, Site $Site)
    {
        // inheritance ( vererbung )
        $Project = $Site->getProject();
        $areas   = $this->getAreasByProject($Project);


        foreach ($areas as $area) {
            if ($area['name'] != $brickArea) {
                continue;
            }

            if (!$area['inheritance']) {
                return array();
            }

            break;
        }

        if (!isset($area) || !isset($area['name'])) {
            return array();
        }

        if ($area['name'] != $brickArea) {
            return array();
        }

        if (!Utils::hasInheritance($Project, $brickArea)) {
            return array();
        }


        $result    = array();
        $parentIds = $Site->getParentIdTree();
        $parentIds = array_reverse($parentIds);

        $projectCacheTable = QUI::getDBProjectTableName(
            self::TABLE_CACHE,
            $Project
        );

        foreach ($parentIds as $parentId) {
            $bricks = QUI::getDataBase()->fetch(array(
                'from' => $projectCacheTable,
                'where' => array(
                    'id' => $parentId,
                    'area' => $brickArea
                )
            ));

            if (empty($bricks) || !is_array($bricks)) {
                continue;
            }

            try {
                $Parent = $Project->get($parentId);

            } catch (QUI\Exception $Exception) {
                continue;
            }

            $parentAreas = $Parent->getAttribute('quiqqer.bricks.areas');
            $parentAreas = json_decode($parentAreas, true);


            if (!isset($parentAreas[$brickArea])) {
                continue;
            }


            $brickIds = array();
            $area     = $parentAreas[$brickArea];

            foreach ($bricks as $brick) {
                $brickIds[$brick['brick']] = true;
            }

            foreach ($area as $brick) {
                if (isset($brickIds[$brick['brickId']])) {
                    $result[] = $brick;
                }
            }

            if (empty($result)) {
                continue;
            }

            break;
        }

        return $result;
    }
}
