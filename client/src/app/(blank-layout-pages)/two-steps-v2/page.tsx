//client/src/app/(blank-layout-pages)/two-steps-v2/page.tsx
// Component Imports
import TwoStepsV2 from '@views/login/TwoStepsV2'

// Server Action Imports
import { getServerMode } from '@core/utils/serverHelpers'

const TwoStepsV2Page = () => {
  // Vars
  const mode = getServerMode()

  return <TwoStepsV2 mode={mode} />
}

export default TwoStepsV2Page
