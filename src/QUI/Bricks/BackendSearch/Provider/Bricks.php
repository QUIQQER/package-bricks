<?php

namespace QUI\Bricks\BackendSearch\Provider;

use QUI;
use QUI\BackendSearch\ProviderInterface;
use QUI\Bricks\Manager;
use QUI\Exception;

use function array_map;
use function count;
use function implode;
use function in_array;
use function is_array;
use function json_encode;
use function mb_strtolower;
use function trim;

class Bricks implements ProviderInterface
{
    public const FILTER_GROUP = 'bricks';

    public function buildCache(): void
    {
    }

    /**
     * @param string $search
     * @param array<string, mixed> $params
     * @return array<int, array<string, string>>
     * @throws Exception
     */
    public function search(string $search, array $params = []): array
    {
        $search = trim($search);

        if ($search === '') {
            return [];
        }

        $filterGroups = $params['filterGroups'] ?? [];

        if (
            is_array($filterGroups)
            && $filterGroups !== []
            && !in_array(self::FILTER_GROUP, $filterGroups, true)
        ) {
            return [];
        }

        try {
            $QueryBuilder = QUI::getQueryBuilder();
            $searchFields = [
                'title',
                'frontendTitle',
                'description',
                'type',
                'content',
                'settings',
                'customfields'
            ];
            $searchConditions = [];

            foreach ($searchFields as $field) {
                $searchConditions[] = $QueryBuilder->expr()->like(
                    'LOWER(' . QUI\Utils\Doctrine::quoteIdentifier($field) . ')',
                    ':search'
                );
            }

            $QueryBuilder
                ->select(
                    ...array_map(
                        static fn (string $field): string => QUI\Utils\Doctrine::quoteIdentifier($field),
                        ['id', 'project', 'lang', ...$searchFields]
                    )
                )
                ->from(QUI\Utils\Doctrine::quoteIdentifier(Manager::getTable()))
                ->where($QueryBuilder->expr()->or(...$searchConditions))
                ->setParameter('search', '%' . mb_strtolower($search) . '%')
                ->orderBy(QUI\Utils\Doctrine::quoteIdentifier('title'), 'ASC');

            if (!empty($params['limit'])) {
                $QueryBuilder->setMaxResults((int)$params['limit']);
            }

            $result = $QueryBuilder->executeQuery()->fetchAllAssociative();
        } catch (\Doctrine\DBAL\Exception $Exception) {
            QUI\System\Log::addError(
                self::class . ' :: search -> ' . $Exception->getMessage()
            );

            return [];
        }

        $results = [];

        foreach ($result as $row) {
            $id = $row['id'];
            $project = $row['project'];
            $lang = $row['lang'];
            $title = $row['frontendTitle'] ?: $row['title'];
            $descriptionParts = [];

            if (!empty($row['title']) && $row['frontendTitle'] && $row['frontendTitle'] !== $row['title']) {
                $descriptionParts[] = $row['title'];
            }

            if (!empty($row['description'])) {
                $descriptionParts[] = $row['description'];
            }

            $descriptionParts[] = $project . ' (' . $lang . ')';

            if (!empty($row['type'])) {
                $descriptionParts[] = $row['type'];
            }

            $results[] = [
                'id' => $project . '-' . $lang . '-' . $id,
                'title' => $title ?: ('Brick #' . $id),
                'description' => implode(' | ', $descriptionParts),
                'icon' => 'fa fa-cubes',
                'groupLabel' => QUI::getLocale()->get(
                    'quiqqer/bricks',
                    'search.provider.bricks.group.label'
                ),
                'group' => self::FILTER_GROUP
            ];
        }

        return $results;
    }

    /**
     * @return array<string, string>
     */
    public function getEntry(string | int $id): array
    {
        $parts = explode('-', (string)$id, 3);

        if (count($parts) !== 3) {
            return [];
        }

        $searchData = json_encode([
            'require' => 'package/quiqqer/bricks/bin/BackendSearch/Provider/Bricks',
            'params' => [
                'projectName' => $parts[0],
                'projectLang' => $parts[1],
                'id' => $parts[2]
            ]
        ]);

        if ($searchData === false) {
            return [];
        }

        return [
            'searchdata' => $searchData
        ];
    }

    /**
     * @return array<int, array<string, array<int, string>|string>>
     */
    public function getFilterGroups(): array
    {
        return [
            [
                'group' => self::FILTER_GROUP,
                'label' => [
                    'quiqqer/bricks',
                    'search.provider.bricks.filter.label'
                ]
            ]
        ];
    }
}
