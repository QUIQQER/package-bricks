<?php

/**
 * This file contains \QUI\Bricks\MCP\Project\UpdateBrick
 */

namespace QUI\Bricks\MCP\Project;

use Mcp\Schema\Result\CallToolResult;
use Mcp\Server\Builder;
use QUI\AI\MCP\ToolHelper;
use QUI\Bricks\MCP\AbstractTool;
use Throwable;

class UpdateBrick extends AbstractTool
{
    public function register(Builder $serverBuilder): void
    {
        $serverBuilder->addTool(
            function (
                int $id,
                array | null $attributes = null,
                array | null $settings = null,
                array | null $customfields = null,
                array | null $classes = null
            ): CallToolResult | array {
                try {
                    self::checkBricksPermission();

                    return self::getBrickService()->update(
                        $id,
                        $attributes ?? [],
                        $settings,
                        $customfields,
                        $classes
                    );
                } catch (Throwable $Exception) {
                    return ToolHelper::parseExceptionToResult($Exception);
                }
            },
            name: 'quiqqer_bricks_update',
            description: 'Updates an existing QUIQQER brick.',
            inputSchema: [
                'type' => 'object',
                'additionalProperties' => false,
                'required' => ['id'],
                'properties' => [
                    'id' => ['type' => 'integer', 'description' => 'Brick ID.', 'minimum' => 1],
                    'attributes' => [
                        'type' => 'object',
                        'description' => 'Brick attributes such as title, description, content, active or areas.',
                        'additionalProperties' => true
                    ],
                    'settings' => ['type' => 'object', 'additionalProperties' => true],
                    'customfields' => ['type' => 'array', 'items' => ['type' => 'string']],
                    'classes' => [
                        'type' => 'array',
                        'items' => ['type' => 'string'],
                        'description' => 'CSS classes applied to the brick.'
                    ]
                ]
            ]
        );
    }
}
