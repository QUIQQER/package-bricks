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
 * @author www.pcsg.de (Henning Leutz)
 * @package quiqqer/bricks
 */
class Brick extends QUI\QDOM
{
    /**
     * Brick settings
     * @var array
     */
    protected $_settings = array();

    /**
     * Constructor
     * @param array $params - brick params
     */
    public function __construct($params=array())
    {
        // default
        $default = array(
            'type'        => 'content',
            'content'     => '',
            'title'       => '',
            'description' => '',
            'project'     => '',
            'areas'       => ''
        );

        $this->setAttributes( $default );

        foreach ( $default as $key => $value )
        {
            if ( isset( $params[ $key ] ) ) {
                $this->setAttribute( $key, $params[ $key ] );
            }
        }


        // default settings from control
        $Control = $this->_getControl();
        $Manager = new Manager();

        $availableSettings = $Manager->getAvailableBrickSettingsByBrickType(
            $this->getAttribute( 'type' )
        );

        foreach ( $availableSettings as $entry ) {
            $this->_settings[ $entry['name'] ] = false;
        }

        // control default settings
        if ( $Control )
        {
            $controlSettings = $Control->getAttributes();

            foreach ( $this->_settings as $key => $value )
            {
                if ( isset( $controlSettings[ $key ] ) ) {
                    $this->_settings[ $key ] = $controlSettings[ $key ];
                }
            }
        }

        // settings from database
        if ( isset( $params['settings'] ) )
        {
            $settings = $params['settings'];

            if ( is_string( $settings ) ) {
                $settings = json_decode( $settings, true );
            }

            if ( !is_array( $settings ) ) {
                return;
            }

            foreach ( $this->_settings as $key => $value )
            {
                if ( isset( $settings[ $key ] ) ) {
                    $this->_settings[ $key ] = $settings[ $key ];
                }
            }
        }
    }

    /**
     * Return the HTML of the Brick
     *
     * @throw QUI\Exception
     */
    public function create()
    {
        if ( $this->getAttribute( 'type' ) == 'content' ) {
            return $this->getAttribute( 'content' );
        }

        $Control = $this->_getControl();

        if ( !$Control ) {
            throw new QUI\Exception( 'Control not found. Brick could not be create' );
        }

        $Control->setAttributes( $this->getSettings() );

        return $Control->create();
    }

    /**
     * Return the internal control
     * @return QUI\Control|Bool
     */
    protected function _getControl()
    {
        $Ctrl = $this->getAttribute( 'type' );

        if ( !is_callable( $Ctrl ) && !class_exists( $Ctrl ) ) {
            return false;
        }

        /* @var $Control \QUI\Control */
        $Control = new $Ctrl();

        if ( !($Control instanceof QUI\Control) ) {
            return false;
        }

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
        foreach ( $settings as $key => $value ) {
            $this->setSetting( $key, $value );
        }
    }

    /**
     * Return the setting of the brick
     *
     * @param String $name - Name of the setting
     * @return Bool|String
     */
    public function getSetting($name)
    {
        if ( isset( $this->_settings[ $name ] ) ) {
            return $this->_settings[ $name ];
        }

        return false;
    }

    /**
     * Set a brick setting
     *
     * @param String $name - name of the setting
     * @param String $value - value of the setting
     */
    public function setSetting($name, $value)
    {
        if ( isset( $this->_settings[ $name ] ) ) {
            $this->_settings[ $name ] = $value;
        }
    }
}
