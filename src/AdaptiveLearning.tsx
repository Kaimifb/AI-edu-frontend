import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { type AdaptiveResult, type LearningItem, type Recommendation } from './api'
import { useI18n } from './i18n'

export function LearningItemLink({ item, locked = item.is_locked, children }: { item: LearningItem; locked?: boolean; children: ReactNode }) {
  const { t } = useI18n()
  return locked ? <div className="locked-learning-item" aria-disabled="true" title={t('Сначала завершите предыдущий модуль')}>{children}</div> : <Link to={`/items/${item.short_id}`}>{children}</Link>
}

export function AdaptiveResultCard({ result, showNext = true }: { result: AdaptiveResult; showNext?: boolean }) {
  const { t } = useI18n()
  return <div className={`result-card ${result.module_completed ? 'passed' : 'failed'}`}>
    <h3>{t(result.module_completed ? 'Модуль освоен' : 'Повторите модуль')}</h3>
    <strong>{result.readiness}%</strong><p>{t('Готовность')} · {t('Порог')} {result.threshold}%</p>
    <div className="adaptive-indicators">{([
      ['Теория', result.theory], ['Практика', result.practice], ['Ошибки', result.errors], ['Компетенции', result.competency],
    ] as const).map(([label, value]) => <span key={label}>{t(label)}: {Math.round(value * 100)}%</span>)}</div>
    <p>{t(result.module_completed ? 'Можно продолжить обучение.' : 'Пройдите материалы и практику ещё раз, затем повторите итоговый тест.')}</p>
    {result.recommendation && <RecommendationDetails recommendation={result.recommendation}/>}
    {result.module_completed ? result.next_item_short_id ? showNext && <Link className="button" to={`/items/${result.next_item_short_id}`}>{t('Следующий модуль')}</Link> : <p>{t('Все опубликованные модули курса пройдены.')}</p> : <Link className="button" to={`/items/${result.repeat_item_short_id}`}>{t('Повторить модуль')}</Link>}
  </div>
}

const INDICATOR_LABELS = { theory: 'Теория', practice: 'Практика', competency: 'Компетенции' } as const
const LEVEL_HINTS = {
  repeat: 'Начните модуль заново: изучите лекции и практические с начала.',
  extra_practice: 'Вы близко к порогу: перед новой попыткой потренируйтесь на слабых темах.',
  next: 'Можно переходить к следующему модулю.',
  advanced: 'Отличный результат: попробуйте задания повышенной сложности.',
} as const

function points(value: number) {
  return Number(Math.abs(value).toFixed(2)).toLocaleString('ru-RU')
}

export function RecommendationDetails({ recommendation }: { recommendation: Recommendation }) {
  const { t } = useI18n()
  const { gap, weak_topics: topics } = recommendation
  return <section className="adaptive-recommendation" aria-label={t('Рекомендация')}>
    <h4>{t('Почему такой результат')}</h4>
    <p>{gap >= 0 ? `${t('Готовность выше порога на')} ${points(gap)} ${t('п.')}` : `${t('До порога не хватило')} ${points(gap)} ${t('п.')}`}</p>
    {recommendation.status === 'repeat' && <p>{t('Слабее всего')}: {t(INDICATOR_LABELS[recommendation.weakest_indicator])}</p>}
    {!!topics.length && <>
      <p>{t('Повторите темы')}:</p>
      <ul>{topics.map(topic => { const review = recommendation.review?.find(row => row.competency === topic.competency); return <li key={topic.competency}>
        {topic.title}: {Math.round(topic.score * 100)}% ({topic.correct}/{topic.total})
        {!!review?.items.length && <span className="adaptive-review">{t('Что повторить')}: {review.items.map((entry, index) => <span key={entry.short_id}>{index > 0 && ', '}<Link to={`/items/${entry.short_id}`}>{entry.title}</Link></span>)}</span>}
      </li> })}</ul>
    </>}
    <p className="adaptive-level">{t(LEVEL_HINTS[recommendation.level])}</p>
  </section>
}

export { PracticeRunner } from './practice/PracticeRunner'
