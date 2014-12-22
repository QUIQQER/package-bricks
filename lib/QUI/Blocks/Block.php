<?php

/**
 * This file contains \QUI\Blocks\Block
 */

namespace QUI\BLocks;

use QUI;

/**
 * Class Block
 * A Block from the Blockmanager
 *
 * @author www.pcsg.de (Henning Leutz)
 * @package quiqqer/blocks
 */
class Block extends QUI\QDOM
{
    /**
     * Constructor
     * @param array $params - block params
     */
    public function __construct($params=array())
    {
        // default
        $this->setAttributes(array(
            'type'    => 'content',
            'content' => '',
            'control' => false
        ));
    }

    /**
     * Return the HTML of the Block
     */
    public function create()
    {
        if ( $this->getAttribute( 'control' ) )
        {
            $Ctrl = $this->getAttribute( 'control' );

            if ( !is_callable( $Ctrl ) ) {
                throw new QUI\Exception( 'Control not found. Block could not be create' );
            }

            /* @var $Control \QUI\Control */
            $Control = new $Ctrl();

            if ( !($Control instanceof QUI\Control) ) {
                throw new QUI\Exception( 'Control not found. Block could not be create' );
            }

            $Control->setAttributes( $this->getAttributes() );

            return $Control->create();
        }

        return $this->getAttribute( 'content' );
    }
}