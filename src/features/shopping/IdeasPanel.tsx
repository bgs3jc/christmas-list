import { useState, type FormEvent } from 'react'
import { addIdea, type Idea, type Person } from '../../data'
import { shortDate } from '../../shared/format'
import { Button } from '../../shared/ui/Button'
import styles from './Shopping.module.css'

interface IdeasPanelProps {
  person: Person
  ideas: Idea[]
  nameOf: (id: string) => string
  onMakeGift: (idea: Idea) => void
}

// "Overheard": things noticed about someone through the year.
export function IdeasPanel({ person, ideas, nameOf, onMakeGift }: IdeasPanelProps) {
  const [text, setText] = useState('')

  function save(event: FormEvent) {
    event.preventDefault()
    if (!text.trim()) return
    addIdea(person.id, text.trim())
    setText('')
  }

  return (
    <section aria-labelledby="ideas-heading" className={styles.ideas}>
      <h2 id="ideas-heading" className={styles.ideasTitle}>
        Overheard
      </h2>
      {ideas.length === 0 ? (
        <p className={styles.ideasEmpty}>Nothing yet. Heard {person.name} mention something?</p>
      ) : (
        <ul className={styles.ideaList}>
          {ideas.map((idea) => (
            <li key={idea.id} className={styles.idea}>
              <p className={styles.ideaText}>{idea.text}</p>
              <div className={styles.ideaMeta}>
                <span>
                  {nameOf(idea.authorId)} · {shortDate(idea.createdAt)}
                </span>
                {idea.madeIntoGift ? (
                  <span className={styles.ideaDone}>Now a gift</span>
                ) : (
                  <Button variant="quiet" onClick={() => onMakeGift(idea)}>
                    Make it a gift
                  </Button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
      <form onSubmit={save} className={styles.ideaForm}>
        <label htmlFor="new-idea" className={styles.ideaLabel}>
          Heard something?
        </label>
        <div className={styles.ideaInputRow}>
          <input id="new-idea" className={styles.ideaInput} value={text} onChange={(e) => setText(e.target.value)} placeholder={`${person.name} mentioned…`} />
          <Button type="submit" disabled={!text.trim()}>
            Save
          </Button>
        </div>
      </form>
    </section>
  )
}
