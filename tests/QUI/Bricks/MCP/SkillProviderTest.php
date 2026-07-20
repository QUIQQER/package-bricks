<?php

namespace QUI\Bricks\MCP;

use PHPUnit\Framework\TestCase;
use QUI\AI\MCP\Skill\SkillRepository;

class SkillProviderTest extends TestCase
{
    public function testBrickSkillIsRegistered(): void
    {
        if (!class_exists(SkillRepository::class)) {
            self::markTestSkipped('The quiqqer/ai-mcp skill repository is not installed.');
        }

        $Repository = new SkillRepository();
        $Provider = new SkillProvider();
        $Provider->registerSkills($Repository);

        $Skill = $Repository->get('quiqqer_bricks_create_and_edit_blocks');

        $this->assertNotNull($Skill);
        $this->assertSame('content', $Skill->getCategory()->value);
        $this->assertStringContainsString('pixel-perfect', $Skill->getContent());
        $this->assertStringContainsString('index.php?id=', $Skill->getContent());
        $this->assertStringContainsString('customCSSScoping', $Skill->getContent());
    }

    public function testDevelopBrickTypesSkillIsRegistered(): void
    {
        if (!class_exists(SkillRepository::class)) {
            self::markTestSkipped('The quiqqer/ai-mcp skill repository is not installed.');
        }

        $Repository = new SkillRepository();
        $Provider = new SkillProvider();
        $Provider->registerSkills($Repository);

        $Skill = $Repository->get('quiqqer_bricks_develop_brick_types');

        $this->assertNotNull($Skill);
        $this->assertSame('developer', $Skill->getCategory()->value);
        $this->assertStringContainsString('bricks.xml', $Skill->getContent());
        $this->assertStringContainsString('hasContent', $Skill->getContent());
        $this->assertStringContainsString('quiqqer_bricks_create_and_edit_blocks', $Skill->getContent());
    }
}
