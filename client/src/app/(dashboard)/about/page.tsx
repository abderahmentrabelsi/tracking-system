// app/views/about/page.tsx
import { checkAuth } from '@/utils/checkAuth'

const Page = async () => {
  checkAuth()

  return <h1>About page!</h1>
}

export default Page
