<?php

/**
 * This file contains \QUI\Bricks\MCP\AbstractTool
 */

namespace QUI\Bricks\MCP;

use QUI\AI\MCP\Server;
use QUI\Bricks\Api\BrickService;
use QUI\Bricks\Manager;
use QUI\Exception;
use QUI\MCP\ToolInterface;
use QUI\Permissions\Permission;

abstract class AbstractTool implements ToolInterface
{
    public const BRICKS_MCP_PERMISSION = 'quiqqer.bricks.mcp';

    protected static function checkBricksPermission(): void
    {
        Permission::checkPermission(
            self::BRICKS_MCP_PERMISSION,
            Server::getRequestUser()
        );
    }

    /**
     * @throws Exception
     */
    protected static function getManager(): Manager
    {
        $Manager = Manager::init();

        if ($Manager === null) {
            throw new Exception('Bricks manager could not be initialized');
        }

        return $Manager;
    }

    /**
     * @throws Exception
     */
    protected static function getBrickService(): BrickService
    {
        return new BrickService(self::getManager());
    }
}
