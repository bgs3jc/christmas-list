import { useEveryoneElse, useHomes, usePeople } from '../../data'
import { toSpreadsheet } from './toSpreadsheet'
import styles from './Export.module.css'

// Everything on the shopping pages, in one spreadsheet, for anyone who'd
// rather see it all at once.
export function DownloadLink() {
  const views = useEveryoneElse()
  const people = usePeople()
  const homes = useHomes()

  function download() {
    const file = new Blob([toSpreadsheet(views, people, homes)], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(file)
    const link = document.createElement('a')
    link.href = url
    link.download = 'family-list.csv'
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <button type="button" className={styles.download} onClick={download}>
      Download everything as a spreadsheet
    </button>
  )
}
