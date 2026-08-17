<?php

/**
 * This file contains \QUI\Bricks\MCP\BrickTypes\ListBrickTypes
 */

namespace QUI\Bricks\MCP\BrickTypes;

use Mcp\Schema\Result\CallToolResult;
use Mcp\Server\Builder;
use QUI\AI\MCP\ToolHelper;
use QUI\Bricks\MCP\AbstractTool;
use Throwable;

class ListBrickTypes extends AbstractTool
{
    public function register(Builder $serverBuilder): void
    {
        $serverBuilder->addTool(
            function (
                bool | null $includeDeprecated = null,
                bool | null $withSettings = null,
                string | null $query = null,
                int | null $limit = null,
                int | null $offset = null
            ): CallToolResult | array {
                try {
                    self::checkBricksPermission();

                    return self::getBrickService()->listBrickTypes(
                        $includeDeprecated === true,
                        $withSettings === true,
                        $query,
                        $limit,
                        $offset
                    );
                } catch (Throwable $Exception) {
                    return ToolHelper::parseExceptionToResult($Exception);
                }
            },
            name: 'quiqqer_brick_types_list',
            description: 'Lists available QUIQQER brick types from installed bricks.xml files.',
            inputSchema: [
                'type' => 'object',
                'additionalProperties' => false,
                'properties' => [
                    'includeDeprecated' => ['type' => 'boolean', 'default' => false],
                    'withSettings' => ['type' => 'boolean', 'default' => false],
                    'query' => [
                        'type' => 'string',
                        'description' => 'Optional search term for control, title or description.'
                    ],
                    'limit' => ['type' => 'integer', 'default' => 50, 'minimum' => 1, 'maximum' => 100],
                    'offset' => ['type' => 'integer', 'default' => 0, 'minimum' => 0]
                ]
            ]
        );
    }
}
