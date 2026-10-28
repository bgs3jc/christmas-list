import { useState, type FormEvent } from 'react'
import { addIdea, type Idea, type Person } from '../../data'
import { Button } from '../../shared/ui/Button'
import { EmptyRow, ListSection, Row, Rows, TitleNote } from '../../shared/ui/List'
import styles from './Shopping.module.css'

interface OverheardProps {
  person: Person
  ideas: Idea[]
  nameOf: (id: string) => string
  onMakeGift: (idea: Idea) => void
}

// Things noticed about someone through the year, to turn into gifts later.
// Notes, not gifts: nobody is getting them yet. One line each, nothing to open.
export function Overheard({ person, ideas, nameOf, onMakeGift }: OverheardProps) {
  const [text, setText] = useState('')

  function save(event: FormEvent) {
    event.preventDefault()
    if (!text.trim()) return
    addIdea(person.id, text.trim())
    setText('')
  }

  return (
    <ListSection title="Overheard">
      {ideas.length === 0 ? (
        <EmptyRow>Nothing yet. Heard {person.name} mention something? Add it below.</EmptyRow>
      ) : (
        <Rows>
          {ideas.map((idea) => (
            <Row
              key={idea.id}
              title={
                <>
                  <span className={styles.ideaText}>{idea.text}</span>
                  <TitleNote>{nameOf(idea.authorId)}</TitleNote>
                </>
              }
              fullTitle={idea.text}
              aside={
                idea.madeIntoGift ? (
                  <span className={styles.ideaDone}>Now a gift</span>
                ) : (
                  <Button variant="quiet" onClick={() => onMakeGift(idea)}>
                    Make it a gift
                  </Button>
                )
              }
            />
          ))}
        </Rows>
      )}
      <form onSubmit={save} className={styles.ideaForm}>
        <label htmlFor="new-idea" className={styles.visuallyHidden}>
          Add something you heard
        </label>
        <input
          id="new-idea"
          className={styles.ideaInput}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={`Heard ${person.name} mention something? Add it here`}
        />
        <Button type="submit" disabled={!text.trim()}>
          Save
        </Button>
      </form>
    </ListSection>
  )
}
