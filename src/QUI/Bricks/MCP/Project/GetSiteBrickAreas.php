<?php

/**
 * This file contains \QUI\Bricks\MCP\Project\GetSiteBrickAreas
 */

namespace QUI\Bricks\MCP\Project;

use Mcp\Schema\Result\CallToolResult;
use Mcp\Server\Builder;
use QUI\AI\MCP\ToolHelper;
use QUI\Bricks\MCP\AbstractTool;
use Throwable;

class GetSiteBrickAreas extends AbstractTool
{
    public function register(Builder $serverBuilder): void
    {
        $serverBuilder->addTool(
            function (
                string $project,
                int $siteId,
                string | null $lang = null,
                string | null $area = null,
                bool | null $withBrickData = null
            ): CallToolResult | array {
                try {
                    self::checkBricksPermission();

                    return self::getBrickService()->getSiteBrickAreas(
                        $project,
                        $siteId,
                        $lang,
                        $area,
                        $withBrickData === true
                    );
                } catch (Throwable $Exception) {
                    return ToolHelper::parseExceptionToResult($Exception);
                }
            },
            name: 'quiqqer_site_bricks_get_areas',
            description: 'Returns current brick assignments for a QUIQQER site.',
            inputSchema: [
                'type' => 'object',
                'additionalProperties' => false,
                'required' => ['project', 'siteId'],
                'properties' => [
                    'project' => ['type' => 'string', 'description' => 'Project name.'],
                    'lang' => ['type' => 'string', 'description' => 'Project language.'],
                    'siteId' => ['type' => 'integer', 'description' => 'Site ID.', 'minimum' => 1],
                    'area' => ['type' => 'string', 'description' => 'Optional area name filter.'],
                    'withBrickData' => ['type' => 'boolean', 'default' => false]
                ]
            ]
        );
    }
}
