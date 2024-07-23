
import React from 'react';
import HomePage from '@views/HomePage';
import { getServerMode } from '@core/utils/serverHelpers'


const App = () => {

  const mode = getServerMode()

  return (
    <HomePage mode={mode}/>
  )
}

export default App;
