// Next Imports
import Providers from '@components/Providers';
import BlankLayout from '@layouts/BlankLayout';
import NotAuthorized from '@views/NotAuthorized';

// Util Imports
import { getServerMode, getSystemMode } from '@core/utils/serverHelpers';

const NotAuthorizedPage = () => {
  // Vars
  const direction = 'ltr';
  const mode = getServerMode();
  const systemMode = getSystemMode();

  return (
    <Providers direction={direction}>
      <BlankLayout systemMode={systemMode}>
        <NotAuthorized mode={mode} />
      </BlankLayout>
    </Providers>
  );
}

export default NotAuthorizedPage;
