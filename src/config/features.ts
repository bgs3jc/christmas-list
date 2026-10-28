// Feature flags. New or experimental features check their flag before showing,
// so they can ship turned off and be switched on (or back off) in one place.

export const features = {
  // Prototype only: a bar to switch who you're "signed in" as. Real sign-in
  // replaces it in M4.
  viewAsSwitch: true,
  // The Naughty / Nice tag, set for each other by the family.
  santasList: true,
  // Home shows the screen-print picture of the house instead of the night sky
  // with the sleigh. Off brings the night sky back.
  housePrint: true,
  // A link on Home to download everything you can see as a spreadsheet.
  spreadsheetDownload: true,
} as const

export type FeatureName = keyof typeof features
