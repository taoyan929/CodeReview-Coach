import type { Exercise } from '../../domain/exercise/types'

const source = `import { useState } from 'react'

interface Task {
  id: string
  title: string
  completed: boolean
}

interface TaskListProps {
  tasks: Task[]
  query: string
}

export function TaskList({ tasks, query }: TaskListProps) {
  const [visibleTasks] = useState(
    tasks.filter((task) => task.title.includes(query)),
  )

  return (
    <ul>
      {visibleTasks.map((task) => (
        <li key={task.id}>{task.title}</li>
      ))}
    </ul>
  )
}`

const solution = `interface Task {
  id: string
  title: string
  completed: boolean
}

interface TaskListProps {
  tasks: Task[]
  query: string
}

export function TaskList({ tasks, query }: TaskListProps) {
  const visibleTasks = tasks.filter((task) =>
    task.title.includes(query),
  )

  return (
    <ul>
      {visibleTasks.map((task) => (
        <li key={task.id}>{task.title}</li>
      ))}
    </ul>
  )
}`

export const reactDerivedStateExercise: Exercise = {
  id: 'react-derived-state-01',
  version: 1,
  title: 'Why does the task filter stay stale?',
  track: 'react',
  secondaryTracks: ['typescript'],
  topics: ['state', 'derived-data', 'props'],
  concepts: ['derived-state', 'render-calculation'],
  level: 'technology-review',
  difficulty: 1,
  missionType: 'bug-hunt',
  estimatedMinutes: 12,
  requirement: {
    summary:
      'Review a task list that should update whenever its tasks or search query changes.',
    description:
      'The parent supplies the latest tasks and query on every render. Users report that changing the query does not update the visible list.',
    acceptanceCriteria: [
      'The visible list updates when tasks change.',
      'The visible list updates when the query changes.',
      'The component avoids unnecessary synchronisation state.',
    ],
    constraints: [
      'Keep the component controlled by its props.',
      'Do not add an effect solely to mirror props into state.',
    ],
  },
  files: [
    {
      id: 'task-list',
      path: 'src/components/TaskList.tsx',
      language: 'tsx',
      content: source,
      changeType: 'modified',
    },
  ],
  expectedFindings: [
    {
      id: 'derived-state-does-not-update',
      fileId: 'task-list',
      acceptedLocations: [{ startLine: 15, endLine: 17 }],
      category: 'logic',
      acceptedCategories: ['maintainability'],
      concepts: ['derived-state', 'render-calculation'],
      diagnosisAliases: [
        'useState only uses the initial filtered value',
        'visibleTasks becomes stale when props change',
        'the filtered list is derived from props',
      ],
      reasoningConcepts: [
        'state initializer runs only on the initial render',
        'props can change after the initial render',
      ],
      fixConcepts: ['calculate visibleTasks during render', 'remove useState'],
      severity: 'high',
      weight: 1,
      hints: [
        {
          level: 1,
          text: 'Which values can change after the first render?',
          concept: 'props',
        },
        {
          level: 2,
          text: 'Compare a state initializer with a calculation performed during every render.',
          concept: 'derived-state',
        },
        {
          level: 3,
          text: 'Inspect how visibleTasks is initialised on lines 15–17.',
          concept: 'render-calculation',
        },
      ],
      explanation:
        'A useState initializer is used only for the initial state. Later task or query props do not recalculate visibleTasks, so the rendered list becomes stale.',
      referenceComment:
        'visibleTasks is derived entirely from tasks and query, but the useState initializer runs only once. Calculate it during render so prop changes are reflected immediately.',
    },
  ],
  hints: [
    {
      level: 1,
      text: 'Follow the data from props to the rendered list.',
      concept: 'data-flow',
    },
  ],
  referenceReview:
    'Request changes: the component stores derived data as state and stops responding to new props.',
  referenceSolution: [
    {
      id: 'task-list-solution',
      path: 'src/components/TaskList.tsx',
      language: 'tsx',
      content: solution,
      changeType: 'modified',
    },
  ],
  evaluationCases: [
    {
      id: 'react-derived-state-strong',
      kind: 'strong',
      expectedFindingId: 'derived-state-does-not-update',
      submission: {
        fileId: 'task-list',
        locations: [{ startLine: 15 }, { startLine: 17 }],
        category: 'logic',
        diagnosis: 'visibleTasks becomes stale when props change',
        impact: 'props can change after the initial render',
        suggestedFix:
          'remove useState and calculate visibleTasks during render',
      },
      expectedFindingStatus: 'strong',
    },
    {
      id: 'react-derived-state-poor-english',
      kind: 'poor-english-correct',
      expectedFindingId: 'derived-state-does-not-update',
      submission: {
        fileId: 'task-list',
        locations: [{ startLine: 15 }],
        category: 'logic',
        diagnosis: 'visibleTasks becomes stale when props change',
      },
      expectedFindingStatus: 'strong',
    },
    {
      id: 'react-derived-state-partial',
      kind: 'partial',
      expectedFindingId: 'derived-state-does-not-update',
      submission: {
        fileId: 'task-list',
        locations: [{ startLine: 16 }],
        category: 'other',
        diagnosis: 'Something in this area may be wrong.',
      },
      expectedFindingStatus: 'partial',
    },
    {
      id: 'react-derived-state-incorrect',
      kind: 'incorrect',
      expectedFindingId: 'derived-state-does-not-update',
      submission: {
        fileId: 'task-list',
        locations: [{ startLine: 2 }],
        category: 'other',
        diagnosis: 'Rename Task to Item.',
      },
      expectedFindingStatus: 'missed',
    },
  ],
  curriculumWeight: 8,
  tags: ['golden-exercise', 'm1', 'react'],
}
