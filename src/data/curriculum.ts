import type { Curriculum } from '../domain/exercise/types'

export const foundationPreviewCurriculum: Curriculum = {
  id: 'foundation-preview',
  version: 1,
  levels: [
    {
      id: 'technology-review-preview',
      title: 'Technology Review Preview',
      level: 'technology-review',
      exerciseIds: ['react-derived-state-01'],
    },
  ],
  totalWeight: 100,
}
