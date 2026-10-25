// Feature flags. New or experimental features check their flag before showing,
// so they can ship turned off and be switched on (or back off) in one place.
//
// Add a flag here when you start a feature, e.g. `ideaLog: false`.

export const features = {
  // Shows the "coming soon" page while the real app is being built (M3).
  comingSoon: true,
} as const

export type FeatureName = keyof typeof features
