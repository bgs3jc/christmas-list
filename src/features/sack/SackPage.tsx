import { useState } from 'react'
import { useHomes, usePeople, useSack, useViewer, type Gift, type Person } from '../../data'
import { joinNames, storeFromLink } from '../../shared/format'
import { GiftDialog } from '../../shared/GiftDialog'
import { links } from '../../shared/router'
import { SnowGlobe } from '../../shared/SnowGlobe'
import { Button } from '../../shared/ui/Button'
import { EmptyRow, ListSection, NoteLine, Row, Rows, SectionNote, TitleNote } from '../../shared/ui/List'
import { Shelf } from '../../shared/ui/Shelf'
import { SantasSack } from './SantasSack'
import styles from './Sack.module.css'

// Everything you're getting, for everyone, and the boxes headed to your house.
export function SackPage() {
  const { landing, groups } = useSack()
  const viewer = useViewer()
  const people = usePeople()
  const homes = useHomes()
  const [editing, setEditing] = useState<{ gift: Gift; recipient: Person; fromList: boolean } | null>(null)

  const nameOf = (id: string) => people.find((p) => p.id === id)?.name ?? 'Someone'
  const houseOf = (id: string) => (id === viewer.homeId ? 'your place' : (homes.find((h) => h.id === id)?.name ?? 'somewhere'))

  const linkTo = (link?: string) =>
    link && (
      <a href={link} target="_blank" rel="noreferrer">
        {storeFromLink(link) ?? 'Open link'}
      </a>
    )

  return (
    <Shelf
      aside={
        <>
          <span className={styles.picture}>
            <SantasSack />
          </span>
          <h1 className={styles.title}>Santa's sack</h1>
          <p className={styles.subtitle}>Your gifts for {joinNames(groups.map((g) => g.person.name))}, and where they're shipping.</p>
        </>
      }
    >
      {landing.length > 0 && (
        <ListSection title="Landing at your place">
          <SectionNote>Boxes the family is shipping to your house.</SectionNote>
          <Rows>
            {landing.map((gift) => (
              <Row
                key={gift.id}
                title={gift.title}
                notes={<NoteLine parts={[`From ${nameOf(gift.giverId)}, for ${nameOf(gift.recipientId)}`]} />}
              />
            ))}
          </Rows>
        </ListSection>
      )}

      {groups.map(({ person, gifts }) => (
        <ListSection
          key={person.id}
          title={`For ${person.name}`}
          lead={<SnowGlobe size={56} scene={person.globeScene} />}
          action={
            <a href={links.shop(person.id)} className={styles.pageLink}>
              {person.name}'s page
            </a>
          }
        >
          {gifts.length === 0 ? (
            <EmptyRow>Nothing yet.</EmptyRow>
          ) : (
            <Rows>
              {gifts.map(({ gift, wish }) => (
                <Row
                  key={gift.id}
                  title={
                    <>
                      {gift.title}
                      {gift.place === 'stocking' && <TitleNote>stocking</TitleNote>}
                      {gift.shipTo && <TitleNote>to {houseOf(gift.shipTo)}</TitleNote>}
                    </>
                  }
                  notes={
                    <>
                      {gift.wishItemId && !wish && <NoteLine parts={[`No longer on ${person.name}'s list`]} />}
                      <NoteLine
                        parts={[
                          wish?.kind === 'maybe' && `For "${wish.title}"`,
                          wish?.notes,
                          gift.notes,
                          linkTo(gift.link ?? wish?.link),
                        ]}
                      />
                    </>
                  }
                  aside={
                    <Button
                      variant="quiet"
                      onClick={() => setEditing({ gift, recipient: person, fromList: wish?.kind === 'specific' })}
                      aria-label={`Change ${gift.title}`}
                    >
                      Change
                    </Button>
                  }
                />
              ))}
            </Rows>
          )}
        </ListSection>
      ))}

      {editing && (
        <GiftDialog
          setup={{ heading: 'Change this gift', gift: editing.gift, fromList: editing.fromList }}
          recipient={editing.recipient}
          others={people.filter((p) => p.id !== editing.recipient.id)}
          homes={homes.filter((h) => h.id !== editing.recipient.homeId)}
          viewer={viewer}
          onClose={() => setEditing(null)}
        />
      )}
    </Shelf>
  )
}
