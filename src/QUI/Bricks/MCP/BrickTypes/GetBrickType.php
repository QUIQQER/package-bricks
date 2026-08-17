<?php

/**
 * This file contains \QUI\Bricks\MCP\BrickTypes\GetBrickType
 */

namespace QUI\Bricks\MCP\BrickTypes;

use Mcp\Schema\Result\CallToolResult;
use Mcp\Server\Builder;
use QUI\AI\MCP\ToolHelper;
use QUI\Bricks\MCP\AbstractTool;
use Throwable;

class GetBrickType extends AbstractTool
{
    public function register(Builder $serverBuilder): void
    {
        $serverBuilder->addTool(
            function (
                string $control,
                bool | null $withSettings = null
            ): CallToolResult | array {
                try {
                    self::checkBricksPermission();

                    return self::getBrickService()->getBrickType($control, $withSettings !== false);
                } catch (Throwable $Exception) {
                    return ToolHelper::parseExceptionToResult($Exception);
                }
            },
            name: 'quiqqer_brick_types_get',
            description: 'Returns one available QUIQQER brick type by its control identifier.',
            inputSchema: [
                'type' => 'object',
                'additionalProperties' => false,
                'required' => ['control'],
                'properties' => [
                    'control' => [
                        'type' => 'string',
                        'description' => 'Brick control identifier, for example \\QUI\\Bricks\\Controls\\SimpleContact.'
                    ],
                    'withSettings' => ['type' => 'boolean', 'default' => true]
                ]
            ]
        );
    }
}
