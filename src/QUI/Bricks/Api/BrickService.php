<?php

/**
 * This file contains \QUI\Bricks\Api\BrickService
 */

namespace QUI\Bricks\Api;

use InvalidArgumentException;
use QUI;
use QUI\Bricks\Brick;
use QUI\Bricks\Manager;
use QUI\Exception;
use QUI\Interfaces\Users\User;
use QUI\Permissions\Permission;
use QUI\Projects\Project;
use QUI\Projects\Site\Edit;

use function array_key_exists;
use function array_map;
use function array_slice;
use function array_values;
use function implode;
use function is_array;
use function is_object;
use function is_string;
use function json_decode;
use function json_encode;
use function max;
use function min;
use function str_contains;
use function strtolower;
use function trim;

/**
 * Shared brick operations for machine-facing APIs such as REST and MCP.
 */
class BrickService
{
    protected Manager $Manager;

    /**
     * @throws Exception
     */
    public function __construct(?Manager $Manager = null)
    {
        $Manager ??= Manager::init();

        if ($Manager === null) {
            throw new Exception('Bricks manager could not be initialized');
        }

        $this->Manager = $Manager;
    }

    /**
     * @param array<string, mixed> $data
     * @return array<string, mixed>
     * @throws Exception
     */
    public function create(array $data): array
    {
        $project = self::requireString($data, 'project');
        $title = self::requireString($data, 'title');
        $lang = self::optionalString($data, 'lang');
        $type = self::optionalString($data, 'type') ?? 'content';
        $description = self::optionalString($data, 'description') ?? '';
        $active = ($data['active'] ?? true) !== false;
        $Project = $lang === null
            ? QUI::getProject($project)
            : QUI::getProject($project, $lang);
        $Brick = new Brick([
            'type' => $type,
            'title' => $title,
            'description' => $description,
            'active' => $active ? 1 : 0
        ]);

        $Brick->check();

        $brickId = $this->Manager->createBrickForProject($Project, $Brick);

        if ($this->hasExtendedCreateData($data)) {
            $saveData = [
                'title' => $title,
                'description' => $description,
                'content' => self::optionalString($data, 'content') ?? '',
                'type' => $type,
                'active' => $active ? 1 : 0,
                'frontendTitle' => self::optionalString($data, 'frontendTitle') ?? '',
                'width' => self::optionalString($data, 'width') ?? '',
                'height' => self::optionalString($data, 'height') ?? '',
                'settings' => self::optionalArray($data, 'settings') ?? [],
                'customfields' => array_key_exists('customfields', $data)
                    ? self::normalizeStringList($data['customfields'], 'customfields')
                    : []
            ];

            if (array_key_exists('areas', $data)) {
                $saveData['areas'] = self::normalizeAreas($data['areas']);
            }

            if (array_key_exists('classes', $data)) {
                $saveData['settings']['classes'] = self::normalizeClasses($data['classes']);
            }

            $this->Manager->saveBrick($brickId, $saveData);
        }

        return $this->get($brickId);
    }

    /**
     * @return array<string, mixed>
     * @throws Exception
     */
    public function get(int $id, bool $withAttributes = true): array
    {
        if ($id < 1) {
            throw new InvalidArgumentException('Brick ID must be greater than zero.');
        }

        return self::serializeBrick(
            $this->Manager->getBrickById($id),
            $withAttributes
        );
    }

    /**
     * @param array<string, mixed> $attributes
     * @param array<string, mixed>|null $settings
     * @param array<int, string>|null $customFields
     * @param array<int, string>|null $classes
     * @return array<string, mixed>
     * @throws Exception
     */
    public function update(
        int $id,
        array $attributes = [],
        ?array $settings = null,
        ?array $customFields = null,
        ?array $classes = null
    ): array {
        if ($id < 1) {
            throw new InvalidArgumentException('Brick ID must be greater than zero.');
        }

        $Brick = $this->Manager->getBrickById($id);
        $saveData = [
            'title' => $Brick->getAttribute('title'),
            'description' => $Brick->getAttribute('description'),
            'content' => $Brick->getAttribute('content'),
            'type' => $Brick->getAttribute('type'),
            'active' => (int)$Brick->getAttribute('active'),
            'frontendTitle' => $Brick->getAttribute('frontendTitle'),
            'areas' => $Brick->getAttribute('areas'),
            'width' => $Brick->getAttribute('width'),
            'height' => $Brick->getAttribute('height'),
            'settings' => $settings ?? $Brick->getSettings(),
            'customfields' => $customFields === null
                ? $Brick->getCustomFields()
                : self::normalizeStringList($customFields, 'customfields')
        ];

        if (array_key_exists('areas', $attributes)) {
            $attributes['areas'] = self::normalizeAreas($attributes['areas']);
        }

        if (array_key_exists('classes', $attributes)) {
            $classes = self::normalizeClasses($attributes['classes']);
            unset($attributes['classes']);
        }

        foreach ($attributes as $attribute => $value) {
            $saveData[$attribute] = $value;
        }

        if ($classes !== null) {
            $saveData['settings']['classes'] = self::normalizeClasses($classes);
        }

        $this->Manager->saveBrick($id, $saveData);

        return $this->get($id);
    }

    /**
     * @param array<int, int|string> $ids
     * @return array{deleted: array<int, int>}
     * @throws Exception
     */
    public function delete(array $ids): array
    {
        $deleted = [];

        foreach ($ids as $id) {
            $brickId = (int)$id;

            if ($brickId < 1) {
                continue;
            }

            $this->Manager->deleteBrick($brickId);
            $deleted[] = $brickId;
        }

        return [
            'deleted' => $deleted
        ];
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    public function listBrickTypes(
        bool $includeDeprecated = false,
        bool $withSettings = false,
        ?string $query = null,
        ?int $limit = null,
        ?int $offset = null
    ): array {
        $brickTypes = $this->filterBrickTypes(
            $this->Manager->getAvailableBricks(),
            $includeDeprecated,
            $query
        );

        return array_map(
            fn(array $brickType): array => $this->serializeBrickType($brickType, $withSettings),
            self::applyLimit($brickTypes, $limit, $offset)
        );
    }

    /**
     * @return array<string, mixed>
     * @throws Exception
     */
    public function getBrickType(string $control, bool $withSettings = true): array
    {
        foreach ($this->Manager->getAvailableBricks() as $brickType) {
            if (($brickType['control'] ?? '') !== $control) {
                continue;
            }

            return $this->serializeBrickType($brickType, $withSettings);
        }

        throw new Exception('Brick type not found', 404);
    }

    /**
     * @return array<string, mixed>
     */
    public function listAreas(
        string $project,
        ?string $lang = null,
        ?string $layoutType = null,
        ?string $siteType = null
    ): array {
        $Project = self::getProject($project, $lang);

        return [
            'project' => self::serializeProject($Project),
            'areas' => array_map(
                static fn(array $area): array => self::serializeArea($area),
                $this->Manager->getAreasByProject(
                    $Project,
                    $layoutType ?? false,
                    $siteType ?? false
                )
            )
        ];
    }

    /**
     * @return array<string, mixed>
     */
    public function listBricks(
        string $project,
        ?string $lang = null,
        ?int $limit = null,
        ?int $offset = null
    ): array {
        $Project = self::getProject($project, $lang);
        $bricks = array_map(
            static fn(Brick $Brick): array => self::serializeBrick($Brick, false),
            $this->Manager->getBricksFromProject($Project)
        );

        return [
            'project' => self::serializeProject($Project),
            'bricks' => self::applyLimit($bricks, $limit, $offset)
        ];
    }

    /**
     * @return array<string, mixed>
     */
    public function getSiteBrickAreas(
        string $project,
        int $siteId,
        ?string $lang = null,
        ?string $area = null,
        bool $withBrickData = false
    ): array {
        $Site = self::getEditSite($project, $siteId, $lang);
        $areas = self::parseSiteBrickAreas($Site);

        if ($area !== null) {
            $areas = [
                $area => $areas[$area] ?? []
            ];
        }

        if ($withBrickData) {
            foreach ($areas as $areaName => $bricks) {
                if (!is_array($bricks)) {
                    continue;
                }

                foreach ($bricks as $index => $brick) {
                    if (!is_array($brick) || empty($brick['brickId'])) {
                        continue;
                    }

                    try {
                        $areas[$areaName][$index]['brick'] = self::serializeBrick(
                            $this->Manager->getBrickById((int)$brick['brickId']),
                            false
                        );
                    } catch (\Throwable) {
                    }
                }
            }
        }

        return [
            'project' => $Site->getProject()->getName(),
            'lang' => $Site->getProject()->getLang(),
            'siteId' => $Site->getId(),
            'areas' => $areas
        ];
    }

    /**
     * @param array<int, array<string, mixed>> $bricks
     * @return array<string, mixed>
     * @throws Exception
     */
    public function setSiteAreaBricks(
        string $project,
        int $siteId,
        string $area,
        array $bricks,
        User $User,
        ?string $lang = null,
        bool $deactivate = false
    ): array {
        Permission::checkPermission('quiqqer.bricks.assign', $User);

        $Site = self::getEditSite($project, $siteId, $lang);
        $areas = self::parseSiteBrickAreas($Site);

        if ($deactivate) {
            $areas[$area] = [
                ['deactivate' => 1]
            ];
        } else {
            $areaBricks = [];

            foreach ($bricks as $brick) {
                if (empty($brick['brickId'])) {
                    continue;
                }

                $brickId = (int)$brick['brickId'];
                $this->Manager->getBrickById($brickId);
                $entry = [
                    'brickId' => $brickId
                ];

                if (!empty($brick['uid']) && is_string($brick['uid'])) {
                    $entry['uid'] = $brick['uid'];
                }

                if (array_key_exists('customfields', $brick)) {
                    $entry['customfields'] = self::normalizeSiteCustomFields($brick['customfields']);
                }

                $areaBricks[] = $entry;
            }

            $areas[$area] = $areaBricks;
        }

        $encodedAreas = json_encode($areas);

        if (!is_string($encodedAreas)) {
            throw new Exception('Site brick areas could not be encoded.');
        }

        $Site->setAttribute('quiqqer.bricks.areas', $encodedAreas);
        $Site->save($User);

        return [
            'saved' => true,
            'project' => $Site->getProject()->getName(),
            'lang' => $Site->getProject()->getLang(),
            'siteId' => $Site->getId(),
            'area' => $area,
            'areas' => self::parseSiteBrickAreas($Site)
        ];
    }

    /**
     * @return array<string, mixed>
     */
    public static function serializeBrick(Brick $Brick, bool $withAttributes = true): array
    {
        $Project = $Brick->getAttribute('project');
        $lang = $Brick->getAttribute('lang');
        $result = [
            'id' => (int)$Brick->getAttribute('id'),
            'project' => is_string($Project) ? $Project : '',
            'lang' => is_string($lang) ? $lang : '',
            'title' => $Brick->getAttribute('title'),
            'frontendTitle' => $Brick->getAttribute('frontendTitle'),
            'description' => $Brick->getAttribute('description'),
            'type' => $Brick->getAttribute('type'),
            'active' => (bool)$Brick->getAttribute('active'),
            'areas' => $Brick->getAttribute('areas'),
            'hasContent' => (bool)$Brick->getAttribute('hasContent'),
            'cacheable' => (bool)$Brick->getAttribute('cacheable'),
            'deprecated' => (bool)$Brick->getAttribute('deprecated')
        ];

        if ($withAttributes) {
            $result['attributes'] = $Brick->getAttributes();
            $result['settings'] = $Brick->getSettings();
            $result['customfields'] = $Brick->getCustomFields();
            $result['cssClasses'] = $Brick->getCSSClasses();
        }

        return $result;
    }

    protected static function getProject(string $project, ?string $lang = null): Project
    {
        if ($lang === null || $lang === '') {
            return QUI::getProject($project);
        }

        return QUI::getProject($project, $lang);
    }

    protected static function getEditSite(string $project, int $siteId, ?string $lang = null): Edit
    {
        if ($siteId < 1) {
            throw new InvalidArgumentException('Site ID must be greater than zero.');
        }

        return new Edit(self::getProject($project, $lang), $siteId);
    }

    /**
     * @return array{name: string, title: string, lang: string}
     */
    protected static function serializeProject(Project $Project): array
    {
        return [
            'name' => $Project->getName(),
            'title' => $Project->getTitle(),
            'lang' => $Project->getLang()
        ];
    }

    /**
     * @param array<string, mixed> $brickType
     * @return array<string, mixed>
     */
    protected function serializeBrickType(array $brickType, bool $withSettings = false): array
    {
        $control = (string)($brickType['control'] ?? '');
        $result = [
            'control' => $control,
            'title' => self::serializeLocaleValue($brickType['title'] ?? null),
            'description' => self::serializeLocaleValue($brickType['description'] ?? null),
            'hasContent' => (bool)($brickType['hasContent'] ?? true),
            'cacheable' => (bool)($brickType['cacheable'] ?? true),
            'recommended' => (bool)($brickType['recommended'] ?? false),
            'deprecated' => (bool)($brickType['deprecated'] ?? false),
            'mockup' => $brickType['mockup'] ?? null,
            'thumbnail' => $brickType['thumbnail'] ?? null,
            'mockups' => $brickType['mockups'] ?? [],
            'galleryMockups' => $brickType['galleryMockups'] ?? []
        ];

        foreach (['name', 'inheritance', 'priority'] as $field) {
            if (!empty($brickType[$field])) {
                $result[$field] = $brickType[$field];
            }
        }

        if ($withSettings) {
            $result['settings'] = array_map(
                static fn(array $setting): array => self::serializeSetting($setting),
                $this->Manager->getAvailableBrickSettingsByBrickType($control)
            );
        }

        return $result;
    }

    /**
     * @param array<string, mixed> $setting
     * @return array<string, mixed>
     */
    protected static function serializeSetting(array $setting): array
    {
        return [
            'name' => (string)($setting['name'] ?? ''),
            'title' => self::serializeLocaleValue($setting['text'] ?? null),
            'description' => is_string($setting['description'] ?? null) ? $setting['description'] : '',
            'type' => (string)($setting['type'] ?? ''),
            'class' => (string)($setting['class'] ?? ''),
            'dataQui' => (string)($setting['data-qui'] ?? ''),
            'options' => $setting['options'] ?? null,
            'dataAttributes' => $setting['data-attributes'] ?? []
        ];
    }

    /**
     * @param array<string, mixed> $area
     * @return array<string, mixed>
     */
    protected static function serializeArea(array $area): array
    {
        return [
            'name' => (string)($area['name'] ?? ''),
            'title' => self::serializeLocaleValue($area['title'] ?? null),
            'description' => self::serializeLocaleValue($area['description'] ?? null),
            'inheritance' => (string)($area['inheritance'] ?? ''),
            'priority' => (string)($area['priority'] ?? '')
        ];
    }

    /**
     * @return array{text: string, locale: array{group: string, var: string}|null}
     */
    protected static function serializeLocaleValue(mixed $value): array
    {
        if (!is_array($value)) {
            return [
                'text' => is_string($value) ? $value : '',
                'locale' => null
            ];
        }

        $group = $value['group'] ?? $value[0] ?? '';
        $var = $value['var'] ?? $value[1] ?? '';

        if (!is_string($group) || !is_string($var) || $group === '' || $var === '') {
            return [
                'text' => '',
                'locale' => null
            ];
        }

        return [
            'text' => (string)QUI::getLocale()->get($group, $var),
            'locale' => [
                'group' => $group,
                'var' => $var
            ]
        ];
    }

    /**
     * @param array<int, array<string, mixed>> $brickTypes
     * @return array<int, array<string, mixed>>
     */
    protected function filterBrickTypes(array $brickTypes, bool $includeDeprecated, ?string $query): array
    {
        $query = is_string($query) ? trim($query) : '';
        $result = [];

        foreach ($brickTypes as $brickType) {
            if (!$includeDeprecated && !empty($brickType['deprecated'])) {
                continue;
            }

            if ($query !== '') {
                $haystack = strtolower(
                    (string)($brickType['control'] ?? '')
                    . ' '
                    . (string)($brickType['name'] ?? '')
                    . ' '
                    . self::serializeLocaleValue($brickType['title'] ?? null)['text']
                    . ' '
                    . self::serializeLocaleValue($brickType['description'] ?? null)['text']
                );

                if (!str_contains($haystack, strtolower($query))) {
                    continue;
                }
            }

            $result[] = $brickType;
        }

        return $result;
    }

    /**
     * @param array<int, array<string, mixed>> $list
     * @return array<int, array<string, mixed>>
     */
    protected static function applyLimit(array $list, ?int $limit, ?int $offset): array
    {
        $limit = empty($limit) ? 50 : (int)min(100, max(1, $limit));

        return array_slice($list, (int)max(0, $offset ?? 0), $limit);
    }

    /**
     * @return array<string, mixed>
     */
    protected static function parseSiteBrickAreas(Edit $Site): array
    {
        $areas = $Site->getAttribute('quiqqer.bricks.areas');

        if (!is_string($areas) || $areas === '') {
            return [];
        }

        $decoded = json_decode($areas, true);

        return is_array($decoded) ? $decoded : [];
    }

    protected static function normalizeSiteCustomFields(mixed $customFields): string
    {
        if ($customFields === null || $customFields === '') {
            return '';
        }

        if (is_string($customFields)) {
            return $customFields;
        }

        if (is_array($customFields) || is_object($customFields)) {
            $encoded = json_encode($customFields);

            return is_string($encoded) ? $encoded : '';
        }

        return '';
    }

    /**
     * @param array<string, mixed> $data
     */
    protected function hasExtendedCreateData(array $data): bool
    {
        foreach (
            [
                'content',
                'frontendTitle',
                'settings',
                'areas',
                'customfields',
                'width',
                'height',
                'classes'
            ] as $field
        ) {
            if (array_key_exists($field, $data)) {
                return true;
            }
        }

        return false;
    }

    /**
     * @param array<string, mixed> $data
     */
    protected static function requireString(array $data, string $field): string
    {
        $value = self::optionalString($data, $field);

        if ($value === null) {
            throw new InvalidArgumentException('Field "' . $field . '" is missing.');
        }

        return $value;
    }

    /**
     * @param array<string, mixed> $data
     */
    protected static function optionalString(array $data, string $field): ?string
    {
        if (!array_key_exists($field, $data) || $data[$field] === null) {
            return null;
        }

        if (!is_string($data[$field])) {
            throw new InvalidArgumentException('Field "' . $field . '" must be a string.');
        }

        $value = trim($data[$field]);

        return $value === '' ? null : $value;
    }

    /**
     * @param array<string, mixed> $data
     * @return array<mixed>|null
     */
    protected static function optionalArray(array $data, string $field): ?array
    {
        if (!array_key_exists($field, $data) || $data[$field] === null) {
            return null;
        }

        if (!is_array($data[$field])) {
            throw new InvalidArgumentException('Field "' . $field . '" must be an array.');
        }

        return $data[$field];
    }

    protected static function normalizeAreas(mixed $areas): string
    {
        if (is_array($areas)) {
            $areas = array_values(array_filter(
                $areas,
                static fn(mixed $area): bool => is_string($area) && trim($area) !== ''
            ));

            return implode(',', $areas);
        }

        if (is_string($areas)) {
            return $areas;
        }

        throw new InvalidArgumentException('Field "areas" must be a string or an array of strings.');
    }

    /**
     * @return array<int, string>
     */
    protected static function normalizeClasses(mixed $classes): array
    {
        return self::normalizeStringList($classes, 'classes', true);
    }

    /**
     * @return array<int, string>
     */
    protected static function normalizeStringList(
        mixed $values,
        string $field,
        bool $acceptString = false
    ): array {
        if ($acceptString && is_string($values)) {
            $values = [$values];
        }

        if (!is_array($values)) {
            throw new InvalidArgumentException(
                'Field "' . $field . '" must be ' . ($acceptString ? 'a string or ' : '') . 'an array of strings.'
            );
        }

        $result = [];

        foreach ($values as $value) {
            if (!is_string($value)) {
                throw new InvalidArgumentException('Field "' . $field . '" must contain only strings.');
            }

            if (trim($value) === '') {
                continue;
            }

            $result[] = $value;
        }

        return $result;
    }
}
