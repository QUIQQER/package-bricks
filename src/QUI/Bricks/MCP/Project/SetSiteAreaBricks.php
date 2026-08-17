<?php

/**
 * This file contains \QUI\Bricks\MCP\Project\SetSiteAreaBricks
 */

namespace QUI\Bricks\MCP\Project;

use Mcp\Schema\Result\CallToolResult;
use Mcp\Server\Builder;
use QUI\AI\MCP\Server;
use QUI\AI\MCP\ToolHelper;
use QUI\Bricks\MCP\AbstractTool;
use Throwable;

class SetSiteAreaBricks extends AbstractTool
{
    public function register(Builder $serverBuilder): void
    {
        $serverBuilder->addTool(
            function (
                string $project,
                int $siteId,
                string $area,
                array $bricks,
                string | null $lang = null,
                bool | null $deactivate = null
            ): CallToolResult | array {
                try {
                    self::checkBricksPermission();

                    return self::getBrickService()->setSiteAreaBricks(
                        $project,
                        $siteId,
                        $area,
                        $bricks,
                        Server::getRequestUser(),
                        $lang,
                        $deactivate === true
                    );
                } catch (Throwable $Exception) {
                    return ToolHelper::parseExceptionToResult($Exception);
                }
            },
            name: 'quiqqer_site_bricks_set_area',
            description: 'Sets the brick assignment for one area on a QUIQQER site.',
            inputSchema: [
                'type' => 'object',
                'additionalProperties' => false,
                'required' => ['project', 'siteId', 'area', 'bricks'],
                'properties' => [
                    'project' => ['type' => 'string', 'description' => 'Project name.'],
                    'lang' => ['type' => 'string', 'description' => 'Project language.'],
                    'siteId' => ['type' => 'integer', 'description' => 'Site ID.', 'minimum' => 1],
                    'area' => ['type' => 'string', 'description' => 'Brick area name.'],
                    'bricks' => [
                        'type' => 'array',
                        'description' => 'Ordered brick assignments for the area.',
                        'items' => [
                            'type' => 'object',
                            'required' => ['brickId'],
                            'additionalProperties' => true,
                            'properties' => [
                                'brickId' => ['type' => 'integer', 'minimum' => 1],
                                'uid' => ['type' => 'string'],
                                'customfields' => [
                                    'oneOf' => [
                                        ['type' => 'string'],
                                        ['type' => 'object', 'additionalProperties' => true]
                                    ]
                                ]
                            ]
                        ]
                    ],
                    'deactivate' => ['type' => 'boolean', 'default' => false]
                ]
            ]
        );
    }
}
