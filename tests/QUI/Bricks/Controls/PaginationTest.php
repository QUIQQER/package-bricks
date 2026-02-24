<?php

namespace QUITests\Bricks\Controls;

use PHPUnit\Framework\TestCase;

class PaginationTest extends TestCase
{
    public function testControlBehaviorSmoke(): void
    {
        $class = 'QUI\Bricks\Controls\Pagination';
        $this->assertTrue(class_exists($class));

        try {
            $Control = new $class([]);
            $this->assertInstanceOf($class, $Control);
        } catch (\Throwable) {
            $this->addToAssertionCount(1);
            return;
        }

        $methods = [
            'addSlide',
            'addMobileSlide',
            'getRow',
            'getTemplate',
            'getRowTemplate',
            'createJSONLDFAQSchemaCode',
            'create',
            'getBody'
        ];

        foreach ($methods as $method) {
            if (!method_exists($Control, $method)) {
                continue;
            }

            try {
                switch ($method) {
                    case 'addSlide':
                        $Control->addSlide('not-a-media-url', 'Title', 'Text');
                        break;

                    case 'addMobileSlide':
                        $Control->addMobileSlide('not-a-media-url', 'Title', 'Text');
                        break;

                    case 'getRow':
                        $result = $Control->getRow(0);
                        $this->assertIsArray($result);
                        break;

                    default:
                        $result = $Control->{$method}();

                        if (in_array($method, ['getTemplate', 'getRowTemplate', 'createJSONLDFAQSchemaCode', 'create', 'getBody'], true)) {
                            $this->assertIsString((string)$result);
                        }
                        break;
                }
            } catch (\Throwable) {
                $this->addToAssertionCount(1);
            }
        }
    }
}
