<?php

namespace QUITests\Bricks\Rest;

use GuzzleHttp\Psr7\Response;
use GuzzleHttp\Psr7\ServerRequest;
use PHPUnit\Framework\MockObject\MockObject;
use PHPUnit\Framework\TestCase;
use QUI\Bricks\Api\BrickService;
use QUI\Bricks\Rest\Provider;
use QUI\Interfaces\Users\User;
use QUI\REST\Server;
use QUI\Users\SystemUser;

class ProviderTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        if (!class_exists(Server::class)) {
            self::markTestSkipped('The optional quiqqer/rest package is not installed.');
        }
    }

    public function testRegistersCrudAndMcpParityRoutes(): void
    {
        $Provider = $this->createProvider($this->createBrickServiceMock());
        $Server = new Server();

        $Provider->register($Server);

        $routes = array_map(
            static fn($Route): string => $Route->getPattern(),
            $Server->getSlim()->getRouteCollector()->getRoutes()
        );

        $this->assertContains('/bricks/create', $routes);
        $this->assertContains('/bricks/types', $routes);
        $this->assertContains('/bricks/list', $routes);
        $this->assertContains('/bricks/areas', $routes);
        $this->assertContains('/bricks/site-areas', $routes);
    }

    public function testCreateForwardsModernBrickData(): void
    {
        $Service = $this->createBrickServiceMock();
        $Service->expects($this->once())
            ->method('create')
            ->with([
                'project' => 'demo',
                'lang' => 'de',
                'type' => 'content',
                'title' => 'REST brick',
                'content' => '<p>Content</p>',
                'classes' => ['hero']
            ])
            ->willReturn([
                'id' => 23,
                'title' => 'REST brick'
            ]);
        $Provider = $this->createProvider($Service);
        $Request = (new ServerRequest('POST', '/bricks/create'))->withParsedBody([
            'project' => 'demo',
            'lang' => 'de',
            'type' => 'content',
            'title' => 'REST brick',
            'content' => '<p>Content</p>',
            'classes' => ['hero']
        ]);

        $Response = $Provider->create($Request, new Response());
        $payload = json_decode((string)$Response->getBody(), true);

        $this->assertSame(201, $Response->getStatusCode());
        $this->assertSame('application/json; charset=utf-8', $Response->getHeaderLine('Content-Type'));
        $this->assertTrue($payload['success']);
        $this->assertSame(23, $payload['data']['id']);
    }

    public function testListBrickTypesParsesQueryParameters(): void
    {
        $Service = $this->createBrickServiceMock();
        $Service->expects($this->once())
            ->method('listBrickTypes')
            ->with(true, true, 'slider', 20, 5)
            ->willReturn([]);
        $Provider = $this->createProvider($Service);
        $Request = (new ServerRequest('GET', '/bricks/types'))->withQueryParams([
            'includeDeprecated' => 'true',
            'withSettings' => '1',
            'query' => 'slider',
            'limit' => '20',
            'offset' => '5'
        ]);

        $Response = $Provider->listBrickTypes($Request, new Response());
        $payload = json_decode((string)$Response->getBody(), true);

        $this->assertSame(200, $Response->getStatusCode());
        $this->assertTrue($payload['success']);
        $this->assertSame([], $payload['data']);
    }

    public function testGetRejectsMissingId(): void
    {
        $Service = $this->createBrickServiceMock();
        $Service->expects($this->never())->method('get');
        $Provider = $this->createProvider($Service);

        $Response = $Provider->get(
            new ServerRequest('GET', '/bricks/get'),
            new Response()
        );
        $payload = json_decode((string)$Response->getBody(), true);

        $this->assertSame(400, $Response->getStatusCode());
        $this->assertFalse($payload['success']);
        $this->assertStringContainsString('id', $payload['error']);
    }

    public function testProviderMetadataUsesBricksPackage(): void
    {
        $Provider = $this->createProvider($this->createBrickServiceMock());

        $this->assertSame('QuiqqerBricks', $Provider->getName());
        $this->assertNotFalse($Provider->getOpenApiDefinitionFile());
    }

    private function createBrickServiceMock(): BrickService&MockObject
    {
        return $this->getMockBuilder(BrickService::class)
            ->disableOriginalConstructor()
            ->onlyMethods([
                'create',
                'get',
                'update',
                'delete',
                'listBrickTypes',
                'getBrickType',
                'listBricks',
                'listAreas',
                'getSiteBrickAreas',
                'setSiteAreaBricks'
            ])
            ->getMock();
    }

    private function createProvider(BrickService $Service): Provider
    {
        return new class ($Service) extends Provider {
            protected function authorizeRequest(): User
            {
                return new SystemUser();
            }
        };
    }
}
