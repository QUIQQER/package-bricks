<?php

/**
 * This file contains \QUI\Bricks\MCP\SkillProvider
 */

namespace QUI\Bricks\MCP;

use QUI\AI\MCP\Skill\SkillProviderInterface;
use QUI\AI\MCP\Skill\SkillRepository;

/**
 * Bricks MCP skill provider
 */
class SkillProvider implements SkillProviderInterface
{
    public function registerSkills(SkillRepository $repository): void
    {
        $root = dirname(__DIR__, 4);

        $repository->addFromMarkdownFile(
            $root . '/skills/content/quiqqer_bricks_create_and_edit_blocks.md'
        );

        $repository->addFromMarkdownFile(
            $root . '/skills/developer/quiqqer_bricks_develop_brick_types.md'
        );
    }
}
