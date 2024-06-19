// React Imports
import type { ReactElement } from 'react'

// Next Imports
import dynamic from 'next/dynamic'

// Type Imports
import type { Data } from '@/types/profileTypes'

// Component Imports
import UserProfile from '@views/user-profile'

const ProfileTab = dynamic(() => import('@views/user-profile/profile'))
const TeamsTab = dynamic(() => import('@views/user-profile/teams'))
const ProjectsTab = dynamic(() => import('@views/user-profile/projects'))
const ConnectionsTab = dynamic(() => import('@views/user-profile/connections'))

// Vars
const tabContentList = (data?: Data): { [key: string]: ReactElement } => ({
  profile: <ProfileTab data={data?.users.profile} />,
  teams: <TeamsTab data={data?.users.teams} />,
  projects: <ProjectsTab data={data?.users.projects} />,
  connections: <ConnectionsTab data={data?.users.connections} />
})

const getData = async () => {
  // Vars
  const res = await fetch(`http://localhost:3000/api/pages/profile`)

  if (!res.ok) {
    throw new Error('Failed to fetch profileData')
  }

  return res.json()
}

const ProfilePage = async () => {
  // Vars
  const data = await getData()

  return <UserProfile data={data} tabContentList={tabContentList(data)} />
}

export default ProfilePage
