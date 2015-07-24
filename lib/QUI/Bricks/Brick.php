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
    protected $_id = false;

    /**
     * Brick settings
     *
     * @var array
     */
    protected $_settings = array();

    /**
     * Fields can be overwritten by another user
     *
     * @var array
     */
    protected $_customfields = array();

    /**
     * Internal control
     *
     * @var null
     */
    protected $_Control = null;

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
            $this->_id = $params['id'];
        }

        // default settings from control
        $Control = $this->_getControl();
        $Manager = Manager::init();

        $availableSettings = $Manager->getAvailableBrickSettingsByBrickType(
            $this->getAttribute('type')
        );

        foreach ($availableSettings as $entry) {
            $this->_settings[$entry['name']] = false;
        }

        // control default settings
        if (is_object($Control)) {
            $controlSettings = $Control->getAttributes();

            foreach ($this->_settings as $key => $value) {
                if (isset($controlSettings[$key])) {
                    $this->_settings[$key] = $controlSettings[$key];
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
                foreach ($this->_settings as $key => $value) {
                    if (isset($settings[$key])) {
                        $this->_settings[$key] = $settings[$key];
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
                $this->_customfields = $customfields;
            }
        }
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

        $Control = $this->_getControl();

        if (!$Control) {
            throw new QUI\Exception('Control not found. Brick could not be created');
        }

        return $this;
    }

    /**
     * Return the HTML of the Brick
     *
     * @throw QUI\Exception
     */
    public function create()
    {
        if ($this->getAttribute('type') == 'content') {
            return $this->getAttribute('content');
        }

        $Control = $this->_getControl();

        if (!$Control) {
            throw new QUI\Exception('Control not found. Brick could not be created');
        }

        $Control->setAttributes($this->getSettings());

        return $Control->create();
    }

    /**
     * Return the internal control
     *
     * @return QUI\Control|Bool
     */
    protected function _getControl()
    {
        if ($this->_Control) {
            return $this->_Control;
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

        if ($this->getAttribute('classes')) {
            $classes = explode(' ', $this->getAttribute('classes'));

            foreach ($classes as $class) {
                $class = trim($class);
                $class = preg_replace('/[^a-zA-Z0-9\-]/', '', $class);

                $Control->addCSSClass($class);
            }
        }

        if ($this->_id) {
            $Control->addCSSClass('brick-'.$this->_id);
        }

        if (!($Control instanceof QUI\Control) || !$Control) {
            return false;
        }

        $this->_Control = $Control;

        return $Control;
    }

    /**
     * Return the brick settings
     *
     * @return Array
     */
    public function getSettings()
    {
        return $this->_settings;
    }

    /**
     * Set brick settings
     *
     * @param Array $settings
     */
    public function setSettings($settings)
    {
        foreach ($settings as $key => $value) {
            $this->setSetting($key, $value);
        }
    }

    /**
     * Return the setting of the brick
     *
     * @param String $name - Name of the setting
     *
     * @return Bool|String
     */
    public function getSetting($name)
    {
        if (isset($this->_settings[$name])) {
            return $this->_settings[$name];
        }

        return false;
    }

    /**
     * Set a brick setting
     *
     * @param String $name  - name of the setting
     * @param String $value - value of the setting
     */
    public function setSetting($name, $value)
    {
        if (isset($this->_settings[$name])) {
            $this->_settings[$name] = $value;
        }
    }

    /**
     * This fields can be overwritten by another user
     *
     * @return array
     */
    public function getCustomFields()
    {
        return $this->_customfields;
    }
}
