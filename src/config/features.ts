// Feature flags. New or experimental features check their flag before showing,
// so they can ship turned off and be switched on (or back off) in one place.

export const features = {
  // Real sign-in and the Firebase database. Off: the prototype, on browser
  // storage with sample data and a "Viewing as" bar to switch who you are.
  realSignIn: true,
  // The Naughty / Nice tag, set for each other by the family.
  santasList: true,
  // Home shows the screen-print picture of the house instead of the night sky
  // with the sleigh. Off brings the night sky back.
  housePrint: true,
  // A link on Home to download everything you can see as a spreadsheet.
  spreadsheetDownload: true,
} as const

export type FeatureName = keyof typeof features
