// Component Imports
import UserList from '@views/user-list'
import { checkAuth } from '@/utils/checkAuth'

const UserListApp = () => {
  checkAuth();
  return <UserList />
}

export default UserListApp
