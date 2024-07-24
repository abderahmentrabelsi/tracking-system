// src/app/equipments/page.tsx
import { checkAuth } from '@/utils/checkAuth';
import EquipmentsPage from '@/views/equipments';

const App = async () => {
  checkAuth();

  return <EquipmentsPage />;
};

export default App;
