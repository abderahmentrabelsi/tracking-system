// RootLayout.js
// Third-party Imports
import 'react-perfect-scrollbar/dist/css/styles.css'

// Type Imports
import type { ChildrenType } from '@core/types'

// Style Imports
import '@/app/globals.css'

// Generated Icon CSS Imports
import '@assets/iconify-icons/generated-icons.css'

// Local Imports
import ReactQueryProvider from '../views/ReactQueryProvider'

export const metadata = {
  title: 'Qore Tracking System',
  description: 'Qore Employee Tracking System - A comprehensive solution for tracking employee attendance, time logs, absences and more.'
}

const RootLayout = ({ children }: ChildrenType) => {
  // Vars
  const direction = 'ltr'

  return (
    <html id='__next' lang='en' dir={direction}>
    <body className='flex is-full min-bs-full flex-auto flex-col'>
    <ReactQueryProvider>
      {children}
    </ReactQueryProvider>
    </body>
    </html>
  )
}

export default RootLayout
