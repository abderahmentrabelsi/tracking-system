// React Imports
import type { ReactElement } from 'react'

// Next Imports
import dynamic from 'next/dynamic'

// Type Imports
import type { Data } from '@/types/profileTypes'

// Component Imports
import UserProfile from '@views/user-profile'

// Utility Imports
import { checkAuth } from '@/utils/checkAuth'

const ProfileTab = dynamic(() => import('@views/user-profile/profile'))
const TeamsTab = dynamic<{ data: any }>(() => import('@views/user-profile/teams'))
const ProjectsTab = dynamic(() => import('@views/user-profile/projects'))
const ConnectionsTab = dynamic(() => import('@views/user-profile/connections'))

// Vars
const tabContentList = (data?: Data): { [key: string]: ReactElement } => ({
  profile: <ProfileTab data={data?.users.profile} />,
  teams: <TeamsTab data={data?.users.teams} />,
  projects: <ProjectsTab data={data?.users.projects} />,
  connections: <ConnectionsTab data={data?.users.connections} />
})

const ProfilePage = async () => {
  // Check authentication
  checkAuth()

  // Return component without passing any data
  return <UserProfile tabContentList={tabContentList()} />
}

export default ProfilePage
