import type { CSSProperties, ReactNode } from 'react'

import { getPublicThemeSettings } from '../lib/publicTheme'

export default async function PublicTheme({
  children,
}: {
  children: ReactNode
}) {
  const theme = await getPublicThemeSettings()

  return (
    <div
      className="public-theme"
      style={
        {
          ['--public-headline-font' as string]: theme.headlineFontFamily,
          ['--public-primary-color' as string]: theme.primaryColor,
        } as CSSProperties
      }
    >
      {children}
    </div>
  )
}
