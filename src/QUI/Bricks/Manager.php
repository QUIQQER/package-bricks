<?php

/**
 * This file contains \QUI\Bricks\Manager
 */

namespace QUI\Bricks;

use QUI;
use QUI\Projects\Project;
use QUI\Projects\Site;
use QUI\Utils\Text\XML;

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
     * Returns the bricks table name
     *
     * @return String
     */
    public static function getTable()
    {
        return QUI::getDBTableName(self::TABLE);
    }

    /**
     * @return string
     */
    public static function getUIDTable()
    {
        return QUI::getDBTableName(self::TABLE_UID);
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
        QUI\Permissions\Permission::checkPermission('quiqqer.bricks.create');

        QUI::getDataBase()->insert(
            $this->getTable(),
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
     * Create and update a unique site brick
     *
     * @param Site $Site
     * @param array $brickData
     * @return string - Unique ID
     */
    public function createUniqueSiteBrick(Site $Site, $brickData = array())
    {
        if (isset($brickData['uid']) || empty($brickData['uid'])) {
            $uid = $brickData['uid'];

            if ($this->existsUniqueBrickId($uid) === false) {
                $uid = $this->createUniqueBrickId((int)$brickData['brickId'], $Site);
            }
        } else {
            $uid = $this->createUniqueBrickId((int)$brickData['brickId'], $Site);
        }

        $customFields = array();

        if (isset($brickData['customfields'])) {
            $customFields = $brickData['customfields'];
        }

        if (is_array($customFields)) {
            $customFields = json_encode($customFields);
        }

        QUI::getDataBase()->update($this->getUIDTable(), array(
            'customfields' => $customFields
        ), array(
            'uid' => $uid
        ));


        return $uid;
    }

    /**
     * Create a new unique Brick ID
     *
     * @param integer $brickId - Brick ID
     * @param Site $Site - Current Site
     * @return bool
     */
    protected function createUniqueBrickId($brickId, $Site)
    {
        $Project = $Site->getProject();
        $uuid    = QUI\Utils\Uuid::get();
        $Brick   = $this->getBrickById($brickId);

        QUI::getDataBase()->insert($this->getUIDTable(), array(
            'uid'        => $uuid,
            'brickId'    => $brickId,
            'project'    => $Project->getName(),
            'lang'       => $Project->getLang(),
            'siteId'     => $Site->getId(),
            'attributes' => json_encode($Brick->getAttributes())
        ));

        return $uuid;
    }

    /**
     * Check if an unique brick ID exists
     *
     * @param string $uid - Brick Unique ID
     * @return bool
     */
    public function existsUniqueBrickId($uid)
    {
        $result = QUI::getDataBase()->fetch(array(
            'from'  => $this->getUIDTable(),
            'where' => array(
                'uid' => $uid
            ),
            'limit' => 1
        ));

        return isset($result[0]);
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
        QUI\Permissions\Permission::checkPermission('quiqqer.bricks.delete');

        // check if brick exist
        $Brick = $this->getBrickById($brickId);

        QUI::getDataBase()->delete($this->getTable(), array(
            'id' => $brickId
        ));

        if (isset($this->bricks[$brickId])) {
            unset($this->bricks[$brickId]);
        }


        $uniqueBrickIds = QUI::getDataBase()->fetch(array(
            'select' => 'siteId, project, lang',
            'from'   => QUI\Bricks\Manager::getUIDTable(),
            'where'  => array(
                'brickId' => $brickId,
                'project' => $Brick->getAttribute('project'),
                'lang'    => $Brick->getAttribute('lang')
            ),
            'group'  => 'siteId, project, lang'
        ));

        // delete bricks in sites
        foreach ($uniqueBrickIds as $uniqueBrickId) {
            $project = $uniqueBrickId['project'];
            $lang    = $uniqueBrickId['lang'];

            $Project = QUI::getProject($project, $lang);
            $Site    = $Project->get($uniqueBrickId['siteId']);
            $Edit    = $Site->getEdit();

            $Edit->load();
            $Edit->save(QUI::getUsers()->getSystemUser());
        }

        // delete unique ids
        QUI::getDataBase()->delete(QUI\Bricks\Manager::getUIDTable(), array(
            'brickId' => $brickId,
            'project' => $Brick->getAttribute('project'),
            'lang'    => $Brick->getAttribute('lang')
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
            $brickXML = realpath(OPT_DIR.$template.'/bricks.xml');

            if (!$brickXML) {
                continue;
            }

            $bricks = array_merge(
                $bricks,
                Utils::getTemplateAreasFromXML($brickXML, $layoutType)
            );
        }

        // unique values
        $cleaned = array();
        foreach ($bricks as $val) {
            if (!isset($cleaned[$val['name']])) {
                $cleaned[$val['name']] = $val;
            }
        }

        $bricks = array_values($cleaned);

        // use @ because: https://bugs.php.net/bug.php?id=50688
        @usort($bricks, function ($a, $b) {
            if (isset($a['priority']) && isset($b['priority'])) {
                if ($a['priority'] == $b['priority']) {
                    return 0;
                }

                return ($a['priority'] < $b['priority']) ? -1 : 1;
            }

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
            'title'       => array('quiqqer/bricks', 'brick.content.title'),
            'description' => array(
                'quiqqer/bricks',
                'brick.content.description'
            ),
            'control'     => 'content'
        );

        foreach ($xmlFiles as $bricksXML) {
            $result = array_merge($result, Utils::getBricksFromXML($bricksXML));
        }

        $result = array_filter($result, function ($brick) {
            return !empty($brick['title']);
        });

        // js workaround
        $list = array();

        foreach ($result as $entry) {
            $list[] = $entry;
        }

        QUI\Cache\Manager::set($cache, $list);

        return $list;
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
            'from'  => $this->getTable(),
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
     * @param string $uid - unique id
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
            'from'  => $this->getUIDTable(),
            'where' => array(
                'uid' => $uid
            ),
            'limit' => 1
        ));

        if (!isset($data[0])) {
            throw new QUI\Exception('Brick not found');
        }

        $data    = $data[0];
        $brickId = $data['brickId'];
        $custom  = $data['customfields'];

        $attributes = $data['attributes'];
        $attributes = json_decode($attributes, true);

        $real = QUI::getDataBase()->fetch(array(
            'from'  => $this->getTable(),
            'where' => array(
                'id' => (int)$brickId
            ),
            'limit' => 1
        ));

        $Original = new Brick($real[0]);
        $Original->setAttribute('id', $brickId);

        $Clone = clone $Original;

        if (!empty($custom)) {
            $custom = json_decode($custom, true);

            if ($custom) {
                $Clone->setSettings($custom);
            }

            // workaround
            if (isset($custom['brickTitle'])) {
                $Clone->setAttribute('frontendTitle', $custom['brickTitle']);
            }
        }

        $this->brickUIDs[$uid] = $Clone;

        return $Clone;
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
        $cache = 'quiqqer/bricks/brickType/'.md5($brickType);

        try {
            return QUI\Cache\Manager::get($cache);
        } catch (QUI\Exception $Exception) {
        }


        $settings = array();

        $settings[] = array(
            'name'     => 'width',
            'text'     => array('quiqqer/bricks', 'site.area.window.settings.setting.width'),
            'type'     => '',
            'class'    => '',
            'data-qui' => '',
            'options'  => false
        );

        $settings[] = array(
            'name'     => 'height',
            'text'     => array('quiqqer/bricks', 'site.area.window.settings.setting.height'),
            'type'     => '',
            'class'    => '',
            'data-qui' => '',
            'options'  => false
        );

        $settings[] = array(
            'name'     => 'classes',
            'text'     => array('quiqqer/bricks', 'site.area.window.settings.setting.classes'),
            'type'     => '',
            'class'    => '',
            'data-qui' => '',
            'options'  => false
        );

        $xmlFiles = $this->getBricksXMLFiles();

        foreach ($xmlFiles as $brickXML) {
            $Dom  = XML::getDomFromXml($brickXML);
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
                    'text'  => QUI\Utils\DOM::getTextFromNode($Option, false)
                );
            }
        }

        return array(
            'name'     => $Setting->getAttribute('name'),
            'text'     => QUI\Utils\DOM::getTextFromNode($Setting, false),
            'type'     => $Setting->getAttribute('type'),
            'class'    => $Setting->getAttribute('class'),
            'data-qui' => $Setting->getAttribute('data-qui'),
            'options'  => $options
        );
    }

    /**
     * Return the bricks from the area
     *
     * @param string $brickArea - Name of the area
     * @param QUI\Interfaces\Projects\Site $Site
     *
     * @return array
     */
    public function getBricksByArea($brickArea, QUI\Interfaces\Projects\Site $Site)
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

        foreach ($bricks as $key => $brickData) {
            $brickId = (int)$brickData['brickId'];

            try {
                if (isset($brickData['uid'])) {
                    $Brick    = $this->getBrickByUID($brickData['uid']);
                    $result[] = $Brick->check();
                    continue;
                }

                // fallback
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
                QUI\System\Log::writeRecursive($brickData);
                QUI\System\Log::writeException($Exception);
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
            'from'  => $this->getTable(),
            'where' => array(
                'project' => $Project->getName(),
                'lang'    => $Project->getLang()
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
        QUI\Permissions\Permission::checkPermission('quiqqer.bricks.edit');

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
            $areaString = ','.implode(',', $areas).',';
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

        $brickAttributes = Utils::getAttributesForBrick($Brick);

        foreach ($brickAttributes as $attribute) {
            if (isset($brickData['attributes'][$attribute])) {
                $Brick->setSetting($attribute, $brickData['attributes'][$attribute]);
            }
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
            'title'         => $Brick->getAttribute('title'),
            'frontendTitle' => $Brick->getAttribute('frontendTitle'),
            'description'   => $Brick->getAttribute('description'),
            'content'       => $Brick->getAttribute('content'),
            'type'          => $Brick->getAttribute('type'),
            'settings'      => json_encode($Brick->getSettings()),
            'customfields'  => json_encode($customfields),
            'areas'         => $areaString,
            'height'        => $Brick->getAttribute('height'),
            'width'         => $Brick->getAttribute('width'),
            'classes'       => json_encode($Brick->getCSSClasses())
        ), array(
            'id' => (int)$brickId
        ));

        // refresh all bricks with this id
        $uniqueBricks = QUI::getDataBase()->fetch(array(
            'from'  => QUI\Bricks\Manager::getUIDTable(),
            'where' => array(
                'project' => $Project->getName(),
                'lang'    => $Project->getLang(),
                'brickId' => (int)$brickId
            )
        ));

        foreach ($uniqueBricks as $uniqueBrick) {
            $customFieldsUniqueBrick = json_decode($uniqueBrick['customfields'], true);
            $attributes              = $Brick->getAttributes();

            if (isset($attributes['attributes'])) {
                unset($attributes['attributes']);
            }

            if (!is_array($customFieldsUniqueBrick)) {
                $customFieldsUniqueBrick = array();
            }

            QUI::getDataBase()->update(QUI\Bricks\Manager::getUIDTable(), array(
                'customfields' => json_encode($customFieldsUniqueBrick),
                'attributes'   => json_encode($attributes)
            ), array(
                'uid' => $uniqueBrick['uid']
            ));
        }
    }

    /**
     * Copy a brick
     *
     * @param integer|string $brickId
     * @param array $params - project, lang, title, description
     * @return integer
     *
     * @throws QUI\Exception
     */
    public function copyBrick($brickId, $params = array())
    {
        QUI\Permissions\Permission::checkPermission('quiqqer.bricks.create');

        $result = QUI::getDataBase()->fetch(array(
            'from'  => $this->getTable(),
            'where' => array(
                'id' => $brickId
            )
        ));

        if (!isset($result[0])) {
            throw new QUI\Exception('Brick not found');
        }

        $allowed = array('project', 'lang', 'title', 'description');
        $allowed = array_flip($allowed);
        $data    = $result[0];

        unset($data['id']);

        if (!is_array($params)) {
            $params = array();
        }

        foreach ($params as $param => $value) {
            if (!isset($allowed[$param])) {
                continue;
            }

            $data[$param] = $value;
        }

        QUI::getDataBase()->insert($this->getTable(), $data);

        $lastId = QUI::getPDO()->lastInsertId();

        return $lastId;
    }

    /**
     * List of available bricks.xml files
     *
     * @return array
     */
    protected function getBricksXMLFiles()
    {
        return Utils::getBricksXMLFiles();
    }

    /**
     * Return the bricks from an area which are inherited from its parents
     *
     * @param string $brickArea - Name of the area
     * @param QUI\Interfaces\Projects\Site $Site - Site object
     *
     * @return array
     */
    protected function getInheritedBricks($brickArea, QUI\Interfaces\Projects\Site $Site)
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
                'from'  => $projectCacheTable,
                'where' => array(
                    'id'   => $parentId,
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
                $customFields = json_decode($brick['customfields'], true);

                if ($customFields
                    && isset($customFields['inheritance'])
                    && $customFields['inheritance'] === false) {
                    continue;
                }

                if (isset($brick['brickId'])
                    && isset($brickIds[$brick['brickId']])) {
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
