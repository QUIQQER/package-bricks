<?php

/**
 * This file contains \QUI\Bricks\Rest\Provider
 */

namespace QUI\Bricks\Rest;

use InvalidArgumentException;
use JsonException;
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use QUI;
use QUI\Bricks\Api\BrickService;
use QUI\Interfaces\Users\User;
use QUI\Permissions\Permission;
use QUI\REST\ProviderInterface;
use QUI\REST\Server;
use Slim\Routing\RouteCollectorProxy;
use Throwable;

use function array_key_exists;
use function array_merge;
use function class_exists;
use function file_exists;
use function get_object_vars;
use function in_array;
use function is_array;
use function is_bool;
use function is_int;
use function is_numeric;
use function is_object;
use function is_string;
use function json_encode;
use function strtolower;
use function trim;

use const JSON_THROW_ON_ERROR;
use const JSON_UNESCAPED_SLASHES;
use const JSON_UNESCAPED_UNICODE;

/**
 * REST API endpoints for QUIQQER bricks.
 */
class Provider implements ProviderInterface
{
    public const BRICKS_REST_PERMISSION = 'quiqqer.bricks.rest';

    protected BrickService $BrickService;

    /**
     * @throws QUI\Exception
     */
    public function __construct(?BrickService $BrickService = null)
    {
        $this->BrickService = $BrickService ?? new BrickService();
    }

    public function register(Server $Server): void
    {
        $Server->getSlim()->group('/bricks', function (RouteCollectorProxy $Routes): void {
            // Backwards-compatible CRUD paths from quiqqer/bricks-rest.
            $Routes->post('/create', [$this, 'create']);
            $Routes->get('/get', [$this, 'get']);
            $Routes->patch('/update', [$this, 'update']);
            $Routes->delete('/delete', [$this, 'delete']);

            // Read and assignment capabilities matching the bricks MCP provider.
            $Routes->get('/types', [$this, 'listBrickTypes']);
            $Routes->get('/type', [$this, 'getBrickType']);
            $Routes->get('/list', [$this, 'listBricks']);
            $Routes->get('/areas', [$this, 'listAreas']);
            $Routes->get('/site-areas', [$this, 'getSiteBrickAreas']);
            $Routes->put('/site-areas', [$this, 'setSiteAreaBricks']);
        });
    }

    public function create(ServerRequestInterface $Request, ResponseInterface $Response): ResponseInterface
    {
        try {
            $this->authorizeRequest();
            $params = self::getRequestData($Request);
            $data = [];

            foreach (
                [
                    'project',
                    'lang',
                    'type',
                    'title',
                    'description',
                    'content',
                    'frontendTitle',
                    'width',
                    'height'
                ] as $field
            ) {
                if (array_key_exists($field, $params)) {
                    $data[$field] = self::stringValue($params, $field);
                }
            }

            if (array_key_exists('settings', $params)) {
                $data['settings'] = self::arrayValue($params, 'settings');
            }

            foreach (['customfields', 'classes'] as $field) {
                if (array_key_exists($field, $params)) {
                    $data[$field] = self::stringListValue($params, $field);
                }
            }

            if (array_key_exists('areas', $params)) {
                if (!is_array($params['areas']) && !is_string($params['areas'])) {
                    throw new InvalidArgumentException('Field "areas" must be a string or an array of strings.');
                }

                $data['areas'] = $params['areas'];
            }

            if (array_key_exists('active', $params)) {
                $data['active'] = self::booleanValue($params, 'active');
            }

            return self::successResponse(
                $Response,
                'Brick created.',
                $this->BrickService->create($data),
                201
            );
        } catch (Throwable $Exception) {
            return self::exceptionResponse($Response, $Exception);
        }
    }

    public function get(ServerRequestInterface $Request, ResponseInterface $Response): ResponseInterface
    {
        try {
            $this->authorizeRequest();
            $params = self::getRequestData($Request);

            return self::successResponse(
                $Response,
                null,
                $this->BrickService->get(
                    self::positiveIntegerValue($params, 'id'),
                    self::optionalBooleanValue($params, 'withAttributes') ?? true
                )
            );
        } catch (Throwable $Exception) {
            return self::exceptionResponse($Response, $Exception);
        }
    }

    public function update(ServerRequestInterface $Request, ResponseInterface $Response): ResponseInterface
    {
        try {
            $this->authorizeRequest();
            $params = self::getRequestData($Request);
            $id = self::positiveIntegerValue($params, 'id');
            $hasUpdateData = false;
            $attributes = [];
            $settings = null;
            $customFields = null;
            $classes = null;

            if (array_key_exists('attributes', $params)) {
                $attributes = self::arrayValue($params, 'attributes');
                $hasUpdateData = true;
            }

            if (array_key_exists('settings', $params)) {
                $settings = self::arrayValue($params, 'settings');
                $hasUpdateData = true;
            }

            if (array_key_exists('customfields', $params)) {
                $customFields = self::stringListValue($params, 'customfields');
                $hasUpdateData = true;
            }

            if (array_key_exists('classes', $params)) {
                $classes = self::stringListValue($params, 'classes');
                $hasUpdateData = true;
            }

            if (!$hasUpdateData) {
                throw new InvalidArgumentException(
                    'At least one of "attributes", "settings", "customfields" or "classes" is required.'
                );
            }

            return self::successResponse(
                $Response,
                'Brick #' . $id . ' successfully updated.',
                $this->BrickService->update(
                    $id,
                    $attributes,
                    $settings,
                    $customFields,
                    $classes
                )
            );
        } catch (Throwable $Exception) {
            return self::exceptionResponse($Response, $Exception);
        }
    }

    public function delete(ServerRequestInterface $Request, ResponseInterface $Response): ResponseInterface
    {
        try {
            $this->authorizeRequest();
            $params = self::getRequestData($Request);

            if (array_key_exists('ids', $params)) {
                $ids = self::positiveIntegerListValue($params, 'ids');
            } else {
                $ids = [self::positiveIntegerValue($params, 'id')];
            }

            return self::successResponse(
                $Response,
                'Bricks successfully deleted.',
                $this->BrickService->delete($ids)
            );
        } catch (Throwable $Exception) {
            return self::exceptionResponse($Response, $Exception);
        }
    }

    public function listBrickTypes(ServerRequestInterface $Request, ResponseInterface $Response): ResponseInterface
    {
        try {
            $this->authorizeRequest();
            $params = self::getRequestData($Request);

            return self::successResponse(
                $Response,
                null,
                $this->BrickService->listBrickTypes(
                    self::optionalBooleanValue($params, 'includeDeprecated') ?? false,
                    self::optionalBooleanValue($params, 'withSettings') ?? false,
                    self::optionalStringValue($params, 'query'),
                    self::optionalIntegerValue($params, 'limit'),
                    self::optionalIntegerValue($params, 'offset')
                )
            );
        } catch (Throwable $Exception) {
            return self::exceptionResponse($Response, $Exception);
        }
    }

    public function getBrickType(ServerRequestInterface $Request, ResponseInterface $Response): ResponseInterface
    {
        try {
            $this->authorizeRequest();
            $params = self::getRequestData($Request);

            return self::successResponse(
                $Response,
                null,
                $this->BrickService->getBrickType(
                    self::requiredStringValue($params, 'control'),
                    self::optionalBooleanValue($params, 'withSettings') ?? true
                )
            );
        } catch (Throwable $Exception) {
            return self::exceptionResponse($Response, $Exception);
        }
    }

    public function listBricks(ServerRequestInterface $Request, ResponseInterface $Response): ResponseInterface
    {
        try {
            $this->authorizeRequest();
            $params = self::getRequestData($Request);

            return self::successResponse(
                $Response,
                null,
                $this->BrickService->listBricks(
                    self::requiredStringValue($params, 'project'),
                    self::optionalStringValue($params, 'lang'),
                    self::optionalIntegerValue($params, 'limit'),
                    self::optionalIntegerValue($params, 'offset')
                )
            );
        } catch (Throwable $Exception) {
            return self::exceptionResponse($Response, $Exception);
        }
    }

    public function listAreas(ServerRequestInterface $Request, ResponseInterface $Response): ResponseInterface
    {
        try {
            $this->authorizeRequest();
            $params = self::getRequestData($Request);

            return self::successResponse(
                $Response,
                null,
                $this->BrickService->listAreas(
                    self::requiredStringValue($params, 'project'),
                    self::optionalStringValue($params, 'lang'),
                    self::optionalStringValue($params, 'layoutType'),
                    self::optionalStringValue($params, 'siteType')
                )
            );
        } catch (Throwable $Exception) {
            return self::exceptionResponse($Response, $Exception);
        }
    }

    public function getSiteBrickAreas(ServerRequestInterface $Request, ResponseInterface $Response): ResponseInterface
    {
        try {
            $this->authorizeRequest();
            $params = self::getRequestData($Request);

            return self::successResponse(
                $Response,
                null,
                $this->BrickService->getSiteBrickAreas(
                    self::requiredStringValue($params, 'project'),
                    self::positiveIntegerValue($params, 'siteId'),
                    self::optionalStringValue($params, 'lang'),
                    self::optionalStringValue($params, 'area'),
                    self::optionalBooleanValue($params, 'withBrickData') ?? false
                )
            );
        } catch (Throwable $Exception) {
            return self::exceptionResponse($Response, $Exception);
        }
    }

    public function setSiteAreaBricks(ServerRequestInterface $Request, ResponseInterface $Response): ResponseInterface
    {
        try {
            $User = $this->authorizeRequest();
            $params = self::getRequestData($Request);
            $bricks = self::arrayValue($params, 'bricks');

            return self::successResponse(
                $Response,
                'Brick area assignment saved.',
                $this->BrickService->setSiteAreaBricks(
                    self::requiredStringValue($params, 'project'),
                    self::positiveIntegerValue($params, 'siteId'),
                    self::requiredStringValue($params, 'area'),
                    $bricks,
                    $User,
                    self::optionalStringValue($params, 'lang'),
                    self::optionalBooleanValue($params, 'deactivate') ?? false
                )
            );
        } catch (Throwable $Exception) {
            return self::exceptionResponse($Response, $Exception);
        }
    }

    public function getOpenApiDefinitionFile(): bool|string
    {
        try {
            $path = QUI::getPackage('quiqqer/bricks')->getDir() . 'docs/openapi.json';
        } catch (Throwable $Exception) {
            QUI\System\Log::writeException($Exception);
            return false;
        }

        return file_exists($path) ? $path : false;
    }

    public function getName(): string
    {
        return 'QuiqqerBricks';
    }

    public function getTitle(?QUI\Locale $Locale = null): string
    {
        $Locale ??= QUI::getLocale();

        return $Locale->get('quiqqer/bricks', 'Provider.Rest.title');
    }

    protected function authorizeRequest(): User
    {
        $User = QUI::getUserBySession();

        if (class_exists('QUI\\OAuth\\Clients\\Handler')) {
            $User = QUI\OAuth\Clients\Handler::getSessionUser();
        }

        Permission::checkPermission(self::BRICKS_REST_PERMISSION, $User);
        Permission::setUser($User);

        return $User;
    }

    /**
     * @return array<string, mixed>
     */
    protected static function getRequestData(ServerRequestInterface $Request): array
    {
        $query = $Request->getQueryParams();
        $body = $Request->getParsedBody();

        if (is_object($body)) {
            $body = get_object_vars($body);
        }

        if (!is_array($body)) {
            $body = [];
        }

        return array_merge($query, $body);
    }

    /**
     * @param array<string, mixed> $data
     */
    protected static function stringValue(array $data, string $field): string
    {
        if (!array_key_exists($field, $data) || !is_string($data[$field])) {
            throw new InvalidArgumentException('Field "' . $field . '" must be a string.');
        }

        return $data[$field];
    }

    /**
     * @param array<string, mixed> $data
     */
    protected static function requiredStringValue(array $data, string $field): string
    {
        $value = self::stringValue($data, $field);

        if (trim($value) === '') {
            throw new InvalidArgumentException('Field "' . $field . '" is missing.');
        }

        return $value;
    }

    /**
     * @param array<string, mixed> $data
     */
    protected static function optionalStringValue(array $data, string $field): ?string
    {
        if (!array_key_exists($field, $data) || $data[$field] === null || $data[$field] === '') {
            return null;
        }

        return self::stringValue($data, $field);
    }

    /**
     * @param array<string, mixed> $data
     * @return array<mixed>
     */
    protected static function arrayValue(array $data, string $field): array
    {
        if (!array_key_exists($field, $data) || !is_array($data[$field])) {
            throw new InvalidArgumentException('Field "' . $field . '" must be an array.');
        }

        return $data[$field];
    }

    /**
     * @param array<string, mixed> $data
     * @return array<int, string>
     */
    protected static function stringListValue(array $data, string $field): array
    {
        $values = self::arrayValue($data, $field);
        $result = [];

        foreach ($values as $value) {
            if (!is_string($value)) {
                throw new InvalidArgumentException('Field "' . $field . '" must contain only strings.');
            }

            $result[] = $value;
        }

        return $result;
    }

    /**
     * @param array<string, mixed> $data
     */
    protected static function positiveIntegerValue(array $data, string $field): int
    {
        $value = self::optionalIntegerValue($data, $field);

        if ($value === null || $value < 1) {
            throw new InvalidArgumentException('Field "' . $field . '" must be a positive integer.');
        }

        return $value;
    }

    /**
     * @param array<string, mixed> $data
     */
    protected static function optionalIntegerValue(array $data, string $field): ?int
    {
        if (!array_key_exists($field, $data) || $data[$field] === null || $data[$field] === '') {
            return null;
        }

        if (!is_int($data[$field]) && !(is_string($data[$field]) && is_numeric($data[$field]))) {
            throw new InvalidArgumentException('Field "' . $field . '" must be an integer.');
        }

        return (int)$data[$field];
    }

    /**
     * @param array<string, mixed> $data
     * @return array<int, int>
     */
    protected static function positiveIntegerListValue(array $data, string $field): array
    {
        $values = self::arrayValue($data, $field);
        $result = [];

        foreach ($values as $value) {
            if (!is_int($value) && !(is_string($value) && is_numeric($value))) {
                throw new InvalidArgumentException('Field "' . $field . '" must contain only integers.');
            }

            $value = (int)$value;

            if ($value < 1) {
                throw new InvalidArgumentException('Field "' . $field . '" must contain only positive integers.');
            }

            $result[] = $value;
        }

        if (empty($result)) {
            throw new InvalidArgumentException('Field "' . $field . '" must not be empty.');
        }

        return $result;
    }

    /**
     * @param array<string, mixed> $data
     */
    protected static function booleanValue(array $data, string $field): bool
    {
        $value = $data[$field] ?? null;

        if (is_bool($value)) {
            return $value;
        }

        if (is_int($value) && in_array($value, [0, 1], true)) {
            return (bool)$value;
        }

        if (is_string($value)) {
            $value = strtolower($value);

            if (in_array($value, ['1', 'true'], true)) {
                return true;
            }

            if (in_array($value, ['0', 'false'], true)) {
                return false;
            }
        }

        throw new InvalidArgumentException('Field "' . $field . '" must be a boolean.');
    }

    /**
     * @param array<string, mixed> $data
     */
    protected static function optionalBooleanValue(array $data, string $field): ?bool
    {
        if (!array_key_exists($field, $data) || $data[$field] === null || $data[$field] === '') {
            return null;
        }

        return self::booleanValue($data, $field);
    }

    /**
     * @param array<mixed> $data
     * @throws JsonException
     */
    protected static function successResponse(
        ResponseInterface $Response,
        ?string $message,
        array $data,
        int $status = 200
    ): ResponseInterface {
        return self::jsonResponse($Response, [
            'success' => true,
            'message' => $message,
            'data' => $data
        ], $status);
    }

    protected static function exceptionResponse(
        ResponseInterface $Response,
        Throwable $Exception
    ): ResponseInterface {
        $status = 500;
        $message = 'The brick request could not be processed.';

        if ($Exception instanceof InvalidArgumentException) {
            $status = 400;
            $message = $Exception->getMessage();
        } elseif ($Exception instanceof QUI\Exception) {
            $status = (int)$Exception->getCode();

            if ($status < 400 || $status > 599) {
                $status = 500;
            }

            $message = $Exception->getMessage();
        } else {
            QUI\System\Log::writeException($Exception);
        }

        try {
            return self::jsonResponse($Response, [
                'success' => false,
                'error' => $message
            ], $status);
        } catch (JsonException $JsonException) {
            QUI\System\Log::writeException($JsonException);
            return $Response->withStatus(500);
        }
    }

    /**
     * @param array<string, mixed> $payload
     * @throws JsonException
     */
    protected static function jsonResponse(
        ResponseInterface $Response,
        array $payload,
        int $status
    ): ResponseInterface {
        $json = json_encode(
            $payload,
            JSON_THROW_ON_ERROR | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE
        );
        $Response = $Response
            ->withStatus($status)
            ->withHeader('Content-Type', 'application/json; charset=utf-8');
        $Response->getBody()->write($json);

        return $Response;
    }
}
