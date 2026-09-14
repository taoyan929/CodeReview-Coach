import AxeBuilder from '@axe-core/playwright'
import { expect, test, type Page } from '@playwright/test'

function monitorRuntimeErrors(page: Page) {
  const errors: string[] = []
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text())
  })
  page.on('pageerror', (error) => errors.push(error.message))
  return errors
}

async function expectNoSeriousA11yViolations(page: Page) {
  const results = await new AxeBuilder({ page }).analyze()
  expect(
    results.violations.filter(({ impact }) =>
      ['critical', 'serious'].includes(impact ?? ''),
    ),
  ).toEqual([])
}

test.beforeEach(async ({ page }) => {
  await page.goto('/')
  await page.evaluate(() => localStorage.clear())
})

test('first open shows an explainable and accessible mission', async ({
  page,
}) => {
  const errors = monitorRuntimeErrors(page)
  await page.goto('/')
  await expect(page.getByRole('heading', { level: 1 })).toContainText(
    'Build judgement',
  )
  await expect(
    page.getByText(/review the ai · literacy · javascript/i).first(),
  ).toBeVisible()
  await expectNoSeriousA11yViolations(page)
  expect(errors).toEqual([])
})

test('review, hint, retry, refresh recovery and code fix form a complete loop', async ({
  page,
}) => {
  const errors = monitorRuntimeErrors(page)
  await page.goto('/')
  await page
    .getByRole('link', { name: /continue today|start next challenge/i })
    .click()
  await expectNoSeriousA11yViolations(page)
  await page.getByRole('button', { name: /get hint 1/i }).click()
  await page.getByRole('button', { name: /select line 2:/i }).click()
  await page
    .getByLabel(/what did you notice/i)
    .fill('Loose equality allows type coercion.')
  await page
    .getByLabel(/why does it matter/i)
    .fill('A coerced role could pass an authorization check.')
  await page
    .getByLabel(/suggested fix/i)
    .fill('Use strict equality for the role comparison.')
  await page.getByRole('button', { name: 'Add finding' }).click()
  await page.getByRole('button', { name: /finish review/i }).click()
  await expect(page.getByRole('heading', { name: /evaluated/i })).toBeVisible()

  await page.reload()
  await expect(page.getByRole('heading', { name: /evaluated/i })).toBeVisible()
  await page.getByRole('button', { name: 'Try again' }).click()
  await page.getByRole('button', { name: /select line 2:/i }).click()
  await page
    .getByLabel(/what did you notice/i)
    .fill('Loose equality allows type coercion.')
  await page.getByRole('button', { name: 'Add finding' }).click()
  await page.getByRole('button', { name: /finish review/i }).click()
  await page.getByRole('button', { name: /finish & reveal/i }).click()
  await expectNoSeriousA11yViolations(page)
  await page.getByRole('button', { name: /fix the code/i }).click()
  await page
    .getByLabel(/edit src\/auth\/canopenadmin\.js/i)
    .fill(
      "export function canOpenAdmin(user) {\n  return user.role === 'admin'\n}",
    )
  await page.getByRole('button', { name: 'Submit fix' }).click()
  await expect(page.getByText('100% complete')).toBeVisible()
  expect(errors).toEqual([])
})

test('completed daily mission has a restrained next-step summary', async ({
  page,
}) => {
  await page.addInitScript(() => {
    const now = new Date()
    const date = new Intl.DateTimeFormat('en-CA', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(now)
    localStorage.setItem(
      'codereview-coach:learner-state',
      JSON.stringify({
        schemaVersion: 4,
        profile: {
          id: 'e2e-user',
          createdAt: now.toISOString(),
          preferredTracks: [],
          dailyTargetMinutes: 20,
        },
        attempts: [],
        completedExerciseIds: [],
        curriculumCompletion: 0,
        mastery: { byTrack: {}, byLevel: {}, byConcept: {} },
        weakConcepts: [],
        streak: { currentDays: 0, longestDays: 0, activityDates: [] },
        dailyMission: {
          date,
          exerciseIds: ['javascript-strict-equality-01'],
          completedExerciseIds: ['javascript-strict-equality-01'],
          estimatedMinutes: 6,
          recommendations: [
            {
              exerciseId: 'javascript-strict-equality-01',
              score: 100,
              reasonCode: 'next-foundation',
              reasonText: 'Continue your foundations.',
            },
          ],
        },
        unlocks: [],
        updatedAt: now.toISOString(),
      }),
    )
  })
  await page.goto('/')
  await expect(page.getByText('Today’s mission is complete.')).toBeVisible()
  await expect(page.getByText(/new mission will be prepared/i)).toBeVisible()
})

test('corrupted local data can be intentionally reset', async ({ page }) => {
  const errors = monitorRuntimeErrors(page)
  await page.evaluate(() =>
    localStorage.setItem('codereview-coach:learner-state', '{broken'),
  )
  await page.reload()
  await expect(
    page.getByRole('heading', { name: /needs attention/i }),
  ).toBeVisible()
  await expectNoSeriousA11yViolations(page)
  await page.getByRole('button', { name: 'Reset and recover app' }).click()
  await page.getByRole('button', { name: 'Confirm reset and reopen' }).click()
  await expect(page.getByRole('heading', { level: 1 })).toContainText(
    'Build judgement',
  )
  expect(errors).toEqual([])
})

for (const width of [390, 768, 1280]) {
  test(`${width}px layout has no page-level horizontal overflow`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 })
    await page.goto('/')
    expect(
      await page.evaluate(
        () =>
          document.documentElement.scrollWidth <=
          document.documentElement.clientWidth,
      ),
    ).toBe(true)
    await page
      .getByRole('link', { name: /continue today|start next challenge/i })
      .click()
    expect(
      await page.evaluate(
        () =>
          document.documentElement.scrollWidth <=
          document.documentElement.clientWidth,
      ),
    ).toBe(true)
  })
}
