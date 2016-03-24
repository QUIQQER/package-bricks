<?php

/**
 * This file contains \QUI\Bricks\Brick
 */

namespace QUI\Bricks;

use QUI;

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
     * @var
     */
    protected $id = false;

    /**
     * internal unique ID
     * This ID is unique for the complete system
     *
     * @var string
     */
    protected $uniqueId = false;

    /**
     * Brick settings
     *
     * @var array
     */
    protected $settings = array();

    /**
     * Fields can be overwritten by another user
     *
     * @var array
     */
    protected $customfields = array();

    /**
     * Internal control
     *
     * @var null
     */
    protected $Control = null;

    /**
     * List of extra css classes
     *
     * @var array
     */
    protected $cssClasses = array();

    /**
     * Constructor
     *
     * @param array $params - brick params
     */
    public function __construct($params = array())
    {
        // default
        $default = array(
            'type'        => 'content',
            'content'     => '',
            'title'       => '',
            'description' => '',
            'project'     => '',
            'areas'       => '',
            'height'      => '',
            'width'       => '',
            'classes'     => ''
        );

        $this->setAttributes($default);

        foreach ($default as $key => $value) {
            if (isset($params[$key])) {
                $this->setAttribute($key, $params[$key]);
            }
        }

        if (isset($params['id'])) {
            $this->id = $params['id'];
        }

        if (isset($params['uniqueId'])) {
            $this->uniqueId = $params['uniqueId'];
        }

        // default settings from control
        $Control = $this->getControl();
        $Manager = Manager::init();

        $availableSettings = $Manager->getAvailableBrickSettingsByBrickType(
            $this->getAttribute('type')
        );

        foreach ($availableSettings as $entry) {
            $this->settings[$entry['name']] = false;
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
    }

    /**
     * Return the class type
     *
     * @return String
     */
    public function getType()
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
     */
    public function isInstanceOf($className)
    {
        $Control = $this->getControl();

        if (is_object($Control)) {
            return $Control instanceof $className;
        }

        return $this instanceof $className;
    }

    /**
     * Check, if control canbe created
     *
     * @throws QUI\Exception
     * @return QUI\Bricks\Brick
     */
    public function check()
    {
        if ($this->getAttribute('type') == 'content') {
            return $this;
        }

        $Control = $this->getControl();

        if (!$Control) {
            throw new QUI\Exception('Control not found. Brick could not be created');
        }

        return $this;
    }

    /**
     * Return the HTML of the Brick
     *
     * @return string
     *
     * @throws QUI\Exception
     */
    public function create()
    {
        if ($this->getAttribute('type') == 'content') {
            $_classes = array(
                'brick-' . $this->id
            );

            foreach ($this->cssClasses as $cssClass) {
                $_classes[] = $cssClass;
            }

            if ($this->getAttribute('classes')) {
                $classes = explode(' ', $this->getAttribute('classes'));

                foreach ($classes as $class) {
                    $class = trim($class);
                    $class = preg_replace('/[^a-zA-Z0-9\-]/', '', $class);

                    $_classes[] = $class;
                }
            }

            $_classes   = array_unique($_classes);
            $classesStr = implode($_classes, ' ');
            $classesStr = 'class="' . $classesStr . '"';

            return "<div {$classesStr}>{$this->getAttribute('content')}</div>";
        }

        $Control = $this->getControl();

        if (!$Control) {
            throw new QUI\Exception('Control not found. Brick could not be created');
        }

        $Control->setAttributes($this->getSettings());

        if ($this->getAttribute('classes')) {
            $classes = explode(' ', $this->getAttribute('classes'));

            foreach ($classes as $class) {
                $class = trim($class);
                $class = preg_replace('/[^a-zA-Z0-9\-]/', '', $class);

                $Control->addCSSClass($class);
            }
        }

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

        return $Control->create();
    }

    /**
     * Return the internal control
     *
     * @return QUI\Control|Bool
     */
    protected function getControl()
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

        /* @var $Control \QUI\Control */
        $Control = new $Ctrl($this->getSettings());

        $Control->setAttribute('height', $this->getAttribute('height'));
        $Control->setAttribute('width', $this->getAttribute('width'));
        $Control->setAttribute('content', $this->getAttribute('content'));

        if ($this->getAttribute('Site')) {
            $Control->setAttribute('Site', $this->getAttribute('Site'));
        } else {
            $Control->setAttribute('Site', QUI::getRewrite()->getSite());
        }


        if (!($Control instanceof QUI\Control) || !$Control) {
            return false;
        }

        $this->Control = $Control;

        return $Control;
    }

    /**
     * Return the brick settings
     *
     * @return array
     */
    public function getSettings()
    {
        return $this->settings;
    }

    /**
     * Set brick settings
     *
     * @param array $settings - list of settings
     *
     * @return void
     */
    public function setSettings($settings)
    {
        foreach ($settings as $key => $value) {
            if ($key === 'classes') {
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
     * @return boolean|string
     */
    public function getSetting($name)
    {
        if (isset($this->settings[$name])) {
            return $this->settings[$name];
        }

        return false;
    }

    /**
     * Set a brick setting
     *
     * @param string $name - name of the setting
     * @param string $value - value of the setting
     *
     * @return void
     */
    public function setSetting($name, $value)
    {
        if (isset($this->settings[$name])) {
            $this->settings[$name] = $value;
        }
    }

    /**
     * This fields can be overwritten by another user
     *
     * @return array
     */
    public function getCustomFields()
    {
        return $this->customfields;
    }

    /**
     * Add an exxtra CSS Class to the control
     *
     * @param string $cssClass - Name of the CSS Class
     *
     * @return void
     */
    public function addCSSClass($cssClass)
    {
        $this->cssClasses[] = $cssClass;
    }

    /**
     * Match pattern agains the css classes
     *
     * @param string $pattern - The shell wildcard pattern.
     *
     * @return boolean
     */
    public function hasCSSClass($pattern)
    {
        if ($this->getAttribute('classes')
            && fnmatch($pattern, $this->getAttribute('classes'))
        ) {
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
