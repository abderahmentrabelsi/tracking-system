import { checkAuth } from '@/utils/checkAuth';

const Page = async () => {
  await checkAuth();

  return <h1>Home page!</h1>;
};

export default Page;
