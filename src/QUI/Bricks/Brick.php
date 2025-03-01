<?php

/**
 * This file contains \QUI\Bricks\Brick
 */

namespace QUI\Bricks;

use Exception;
use QUI;
use QUI\Control;

use function array_filter;
use function array_flip;
use function array_merge;
use function array_unique;
use function array_values;
use function class_exists;
use function dirname;
use function explode;
use function fnmatch;
use function get_class;
use function implode;
use function is_array;
use function is_callable;
use function is_object;
use function is_string;
use function json_decode;
use function md5;
use function serialize;
use function trim;

/**
 * Class Brick
 * A Brick from the Brickmanager
 *
 * @author  www.pcsg.de (Henning Leutz)
 * @package quiqqer/bricks
 */
class Brick extends QUI\QDOM
{
    /**
     * internal brick id
     *
     * @var int|bool
     */
    protected int|bool $id = false;

    /**
     * internal unique ID
     * This ID is unique for the complete system
     */
    protected mixed $uniqueId = false;

    /**
     * Brick settings
     *
     * @var array
     */
    protected array $settings = [];

    /**
     * Fields can be overwritten by another user
     *
     * @var array
     */
    protected array $customfields = [];

    /**
     * Internal control
     *
     * @var null|Control
     */
    protected ?Control $Control = null;

    /**
     * List of extra css classes
     *
     * @var array
     */
    protected array $cssClasses = [];

    /**
     * @var string
     */
    protected string $hash;

    /**
     * Constructor
     *
     * @param array $params - brick params
     * @throws QUI\Exception
     */
    public function __construct(array $params = [])
    {
        // default
        $default = [
            'type' => 'content',
            'content' => '',
            'title' => '',
            'description' => '',
            'project' => '',
            'lang' => '',
            'areas' => '',
            'height' => '',
            'width' => '',
            'classes' => '',
            'frontendTitle' => '',
            'hasContent' => 1,
            'cacheable' => 1, // if the brick is cacheable or not
            'deprecated' => 0
        ];

        $this->setAttributes($default);

        foreach ($default as $key => $value) {
            if (isset($params[$key])) {
                $this->setAttribute($key, $params[$key]);
            }
        }

        if (isset($params['id'])) {
            $this->id = (int)$params['id'];
        }

        if (isset($params['uniqueId'])) {
            $this->uniqueId = $params['uniqueId'];
        }

        if (isset($params['classes'])) {
            $cssClasses = json_decode($params['classes'], true);

            if (!$cssClasses) {
                $cssClasses = [];
            }

            foreach ($cssClasses as $cssClass) {
                $this->addCSSClass($cssClass);
            }

            unset($params['classes']);
        }

        // default settings from control
        if (isset($params['Site'])) {
            $this->setAttribute('Site', $params['Site']);
        }

        $Control = $this->getControl();
        $Manager = Manager::init();

        $availableSettings = $Manager->getAvailableBrickSettingsByBrickType(
            $this->getAttribute('type')
        );

        foreach ($availableSettings as $entry) {
            $this->settings[$entry['name']] = false;
        }

        $availableAttributes = Utils::getAttributesForBrick($this);

        foreach ($availableAttributes as $attribute) {
            $this->settings[$attribute] = false;
        }


        // control default settings
        if (is_object($Control)) {
            $controlSettings = $Control->getAttributes();

            foreach ($this->settings as $key => $value) {
                if (isset($controlSettings[$key])) {
                    $this->settings[$key] = $controlSettings[$key];
                }
            }
        }

        // settings from database
        if (isset($params['settings'])) {
            $settings = $params['settings'];

            if (is_string($settings)) {
                $settings = json_decode($settings, true);
            }

            if (is_array($settings)) {
                foreach ($this->settings as $key => $value) {
                    if (isset($settings[$key])) {
                        $this->settings[$key] = $settings[$key];
                    }
                }
            }
        }

        // customfields
        if (isset($params['customfields'])) {
            $customfields = $params['customfields'];

            if (is_string($customfields)) {
                $customfields = json_decode($customfields, true);
            }

            if (is_array($customfields)) {
                $this->customfields = $customfields;
            }
        }

        // deprecated
        $BricksManager = QUI\Bricks\Manager::init();
        $type = $this->getAttribute('type');

        $brick = array_filter($BricksManager->getAvailableBricks(), function ($brick) use ($type) {
            if (!isset($brick['control'])) {
                return false;
            }

            return $brick['control'] === $type;
        });

        if ($brick) {
            $brick = array_values($brick)[0];

            if (!empty($brick['deprecated'])) {
                $this->setAttribute('deprecated', 1);
            }
        }

        $this->hash = $this->createBrickHash();
    }

    /**
     * Return the class type
     *
     * @return String
     * @throws QUI\Exception
     */
    public function getType(): string
    {
        $Control = $this->getControl();

        if (is_object($Control)) {
            return get_class($Control);
        }

        return get_class($this);
    }

    /**
     * Checks if the internal control is of this class or has this class as one of its parents
     *
     * @param string $className
     * @return bool
     * @throws QUI\Exception
     */
    public function isInstanceOf(string $className): bool
    {
        $Control = $this->getControl();

        if (is_object($Control)) {
            return $Control instanceof $className;
        }

        return $this instanceof $className;
    }

    /**
     * Check, if control can be created
     *
     * @return QUI\Bricks\Brick
     * @throws QUI\Exception
     */
    public function check(): Brick
    {
        if ($this->getAttribute('type') == 'content') {
            return $this;
        }

        $Control = $this->getControl();

        if (!$Control) {
            throw new QUI\Exception(
                'Control not found. Brick could not be created. Maybe wrong type ' . $this->getAttribute('type')
            );
        }

        return $this;
    }

    /**
     * Create a unique brick hash
     * which is created from the brick data
     *
     * @return string
     */
    protected function createBrickHash(): string
    {
        $attributes = $this->getAttributes();
        $hashParams = array_filter($attributes, function ($entry) {
            return is_object($entry) === false;
        });

        $hash = serialize($hashParams);

        return md5($hash);
    }

    /**
     * Return the HTML of the Brick
     *
     * @return string
     *
     * @throws QUI\Exception
     */
    public function create(): string
    {
        $settings = $this->getSettings();
        $settings = array_filter($settings, function ($entry) {
            return is_object($entry) === false;
        });

        $cacheName = Manager::getBrickCacheNamespace()
            . md5($this->getType())
            . '/'
            . $this->hash
            . '/' . md5(serialize($settings));

        if ($this->getAttribute('cacheable')) {
            try {
                $data = QUI\Cache\Manager::get($cacheName);
                $cssFiles = $data['cssFiles'];
                $cssClasses = $data['cssClasses'];

                if (is_array($cssClasses)) {
                    foreach ($cssClasses as $cssClass) {
                        $this->addCSSClass($cssClass);
                    }
                }

                if (is_array($cssFiles)) {
                    foreach ($cssFiles as $cssFile) {
                        QUI\Control\Manager::addCSSFile($cssFile);
                    }
                }

                if (!empty($data['html'])) {
                    return $data['html'];
                }
            } catch (Exception) {
            }
        }

        if ($this->getAttribute('type') == 'content') {
            $_classes = [
                'brick-' . $this->id
            ];

            foreach ($this->cssClasses as $cssClass) {
                $_classes[] = $cssClass;
            }


            $oldCssClasses = $this->getAttribute('classes');
            $oldCssClassesJson = null;

            if (is_string($oldCssClasses)) {
                $oldCssClassesJson = json_decode($oldCssClasses, true);
            }

            if (is_array($oldCssClassesJson)) {
                $oldCssClasses = $oldCssClassesJson;
            }

            $classes = $oldCssClasses;

            if (is_string($oldCssClasses)) {
                $classes = explode(' ', $oldCssClasses);
            }

            foreach ($classes as $class) {
                $_classes[] = trim($class);
            }

            $_classes = array_unique($_classes);
            $classesStr = implode(' ', $_classes);
            $classesStr = 'class="' . $classesStr . '"';

            $Engine = QUI::getTemplateManager()->getEngine();

            $Engine->assign([
                'this' => $this,
                'classesStr' => $classesStr
            ]);

            $result = $Engine->fetch(dirname(__FILE__) . '/Brick.html');

            QUI\Cache\Manager::set($cacheName, [
                'html' => $result,
                'cssClasses' => $this->cssClasses,
                'cssFiles' => []
            ]);

            return $result;
        }

        $Control = $this->getControl();

        if (!$Control) {
            throw new QUI\Exception('Control not found. Brick could not be created');
        }

        $Control->setAttributes($this->getSettings());

        if ($this->getAttribute('classes')) {
            $Control->addCSSClass($this->getAttribute('classes'));
        }

        if ($Control->existsAttribute('cacheable')) {
            $Control->setAttribute('cacheable', $Control->getAttribute('cacheable'));
        }

        // workaround wegen title bug
        // @todo backendTitle einführen und title als frontend Title nutzen (Versionssprung)
        $Control->setAttribute('title', $this->getAttribute('frontendTitle'));

        if ($this->id) {
            $Control->addCSSClass('brick-' . $this->id);
            $Control->setAttribute('data-brickid', $this->id);
        }

        if ($this->uniqueId) {
            $Control->setAttribute('data-brickuid', $this->uniqueId);
        }

        foreach ($this->cssClasses as $cssClass) {
            $Control->addCSSClass($cssClass);
        }

        $result = $Control->create();
        $cssFiles = $Control->getCSSFiles();

        QUI\Cache\Manager::set($cacheName, [
            'html' => $result,
            'cssClasses' => $this->cssClasses,
            'cssFiles' => $cssFiles
        ]);

        return $result;
    }

    /**
     * Return the internal control
     *
     * @return Control|bool|null
     * @throws QUI\Exception
     */
    protected function getControl(): Control|bool|null
    {
        if ($this->Control) {
            return $this->Control;
        }

        $Ctrl = $this->getAttribute('type');

        if ($Ctrl === 'content') {
            return true;
        }

        if (!is_callable($Ctrl) && !class_exists($Ctrl)) {
            return false;
        }

        $Site = $this->getAttribute('Site');

        if ($Site instanceof QUI\Projects\Site) {
            $Project = $Site->getProject();

            $Ctrl = QUI\Bricks\Manager::init()->getAlternateClass(
                $Ctrl,
                $Project->getAttribute('template')
            );
        }

        /* @var $Control Control */
        $Control = new $Ctrl(
            array_merge($this->getSettings(), $this->getAttributes())
        );

        $Control->setAttribute('height', $this->getAttribute('height'));
        $Control->setAttribute('width', $this->getAttribute('width'));
        $Control->setAttribute('content', $this->getAttribute('content'));

        if ($this->getAttribute('Site')) {
            $Control->setAttribute('Site', $this->getAttribute('Site'));
        } else {
            $Control->setAttribute('Site', QUI::getRewrite()->getSite());
        }


        if (!($Control instanceof Control)) {
            return false;
        }

        $this->Control = $Control;

        if ($this->Control->existsAttribute('cacheable')) {
            $this->setAttribute('cacheable', $this->Control->getAttribute('cacheable'));
        }

        return $Control;
    }

    /**
     * Return the brick settings
     *
     * @return array
     */
    public function getSettings(): array
    {
        $this->settings['classes'] = $this->getCSSClasses();

        return $this->settings;
    }

    /**
     * Set brick settings
     *
     * @param array $settings - list of settings
     *
     * @return void
     */
    public function setSettings(array $settings): void
    {
        foreach ($settings as $key => $value) {
            if ($key === 'classes') {
                $this->clearCSSClasses();
                $this->addCSSClass($value);
                continue;
            }
            $this->setSetting($key, $value);
        }
    }

    /**
     * Return the setting of the brick
     *
     * @param String $name - Name of the setting
     *
     * @return boolean|string|array
     */
    public function getSetting(string $name): bool|array|string
    {
        if ($name === 'classes') {
            return $this->getCSSClasses();
        }

        if (isset($this->settings[$name])) {
            return $this->settings[$name];
        }

        return false;
    }

    /**
     * Set a brick setting
     *
     * @param string $name - name of the setting
     * @param mixed $value - value of the setting
     *
     * @return void
     */
    public function setSetting(string $name, mixed $value): void
    {
        if (isset($this->settings[$name])) {
            $this->settings[$name] = $value;
        }

        if ($this->Control instanceof Control) {
            $this->Control->setAttribute($name, $value);
        }
    }

    /**
     * @param string $name
     * @return mixed
     */
    public function getAttribute(string $name): mixed
    {
        if ($name === 'classes') {
            return $this->getCSSClasses();
        }

        return parent::getAttribute($name);
    }

    /**
     * @return array
     */
    public function getAttributes(): array
    {
        $attributes = parent::getAttributes();
        $attributes['classes'] = $this->getCSSClasses();

        return $attributes;
    }

    /**
     * This fields can be overwritten by another user
     *
     * @return array
     */
    public function getCustomFields(): array
    {
        return $this->customfields;
    }

    /**
     * Add an extra CSS Class to the control
     *
     * @param array|string $cssClass - Name of the CSS Class
     *
     * @return void
     */
    public function addCSSClass(array|string $cssClass): void
    {
        if (is_array($cssClass)) {
            $cssClass = implode(' ', $cssClass);
        }

        if (!is_string($cssClass)) {
            return;
        }

        if (empty($cssClass)) {
            return;
        }

        $classes = QUI\ControlUtils::clearClassName($cssClass);
        $classes = explode(' ', $classes);

        $keys = array_flip($this->cssClasses);

        foreach ($classes as $cssClass) {
            if (!isset($keys[$cssClass])) {
                $this->cssClasses[] = $cssClass;
                $keys[$cssClass] = true;
            }
        }
    }

    /**
     * Remove all css classes
     */
    public function clearCSSClasses(): void
    {
        $this->cssClasses = [];
    }

    /**
     * Return all css classes
     *
     * @return array
     */
    public function getCSSClasses(): array
    {
        return $this->cssClasses;
    }

    /**
     * Match pattern against the css classes
     *
     * @param string $pattern - The shell wildcard pattern.
     *
     * @return boolean
     */
    public function hasCSSClass(string $pattern): bool
    {
        $cssClasses = $this->getAttribute('classes');

        if (is_array($cssClasses)) {
            $cssClasses = implode(' ', $cssClasses);
        }

        if ($cssClasses && fnmatch($pattern, $cssClasses)) {
            return true;
        }

        if (empty($this->cssClasses)) {
            return false;
        }

        foreach ($this->cssClasses as $cssClass) {
            if (fnmatch($pattern, $cssClass)) {
                return true;
            }
        }

        return false;
    }
}
