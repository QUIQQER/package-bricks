<?php

/**
 * This file contains \QUI\Bricks\MCP\Project\ListAreas
 */

namespace QUI\Bricks\MCP\Project;

use Mcp\Schema\Result\CallToolResult;
use Mcp\Server\Builder;
use QUI\AI\MCP\ToolHelper;
use QUI\Bricks\MCP\AbstractTool;
use Throwable;

class ListAreas extends AbstractTool
{
    public function register(Builder $serverBuilder): void
    {
        $serverBuilder->addTool(
            function (
                string $project,
                string | null $lang = null,
                string | null $layoutType = null,
                string | null $siteType = null
            ): CallToolResult | array {
                try {
                    self::checkBricksPermission();

                    return self::getBrickService()->listAreas(
                        $project,
                        $lang,
                        $layoutType,
                        $siteType
                    );
                } catch (Throwable $Exception) {
                    return ToolHelper::parseExceptionToResult($Exception);
                }
            },
            name: 'quiqqer_brick_areas_list',
            description: 'Lists available QUIQQER brick areas for a project template.',
            inputSchema: [
                'type' => 'object',
                'additionalProperties' => false,
                'required' => ['project'],
                'properties' => [
                    'project' => ['type' => 'string', 'description' => 'Project name.'],
                    'lang' => ['type' => 'string', 'description' => 'Project language.'],
                    'layoutType' => ['type' => 'string', 'description' => 'Optional layout type filter.'],
                    'siteType' => ['type' => 'string', 'description' => 'Optional site type filter.']
                ]
            ]
        );
    }
}
