import type { Curriculum } from '../domain/exercise/types'

export const mvpCurriculum: Curriculum = {
  id: 'mvp-foundations',
  version: 2,
  levels: [
    {
      id: 'code-literacy',
      title: 'Code Literacy',
      level: 'literacy',
      exerciseIds: [
        'javascript-strict-equality-01',
        'javascript-map-return-01',
        'typescript-optional-name-01',
        'python-mutable-default-01',
        'python-broad-exception-01',
        'rest-post-status-01',
        'sql-null-comparison-01',
        'testing-error-path-01',
        'testing-missing-await-01',
        'security-hardcoded-secret-01',
      ],
    },
    {
      id: 'technology-review',
      title: 'Technology Review',
      level: 'technology-review',
      exerciseIds: [
        'typescript-unsafe-assertion-01',
        'react-derived-state-01',
        'react-index-key-01',
        'react-effect-cleanup-01',
        'fastapi-delete-status-01',
        'fastapi-blocking-sleep-01',
        'rest-pagination-limit-01',
        'sql-update-without-where-01',
        'sql-n-plus-one-01',
        'nosql-unbounded-query-01',
        'cosmos-partition-key-01',
        'security-object-authorization-01',
      ],
    },
    {
      id: 'software-engineering-review',
      title: 'Software Engineering Review',
      level: 'software-engineering-review',
      exerciseIds: [
        'full-stack-profile-contract-01',
        'full-stack-order-transaction-01',
      ],
    },
  ],
  totalWeight: 100,
}
