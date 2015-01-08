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

        if ( isset( $params['settings'] ) )
        {
            $settings = $params['settings'];

            if ( is_string( $settings ) ) {
                $settings = json_decode( $settings, true );
            }

            $this->_settings = $settings;
        }

        foreach ( $default as $key => $value )
        {
            if ( isset( $params[ $key ] ) ) {
                $this->setAttribute( $key, $params[ $key ] );
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


        $Ctrl = $this->getAttribute( 'type' );

        if ( !is_callable( $Ctrl ) && !class_exists( $Ctrl ) ) {
            throw new QUI\Exception( 'Control not found. Brick could not be create' );
        }

        /* @var $Control \QUI\Control */
        $Control = new $Ctrl();

        if ( !($Control instanceof QUI\Control) ) {
            throw new QUI\Exception( 'Control not found. Brick could not be create' );
        }

        $Control->setAttributes( $this->getSettings() );

        return $Control->create();
    }

    /**
     * Return the brick settings
     * @return array
     */
    public function getSettings()
    {
        return $this->_settings;
    }
}