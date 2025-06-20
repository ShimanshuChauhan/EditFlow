import { Home, History, Users, Settings, FolderKanban, Bell } from 'lucide-react';

import SideBar from "./components/Sidebar"
import { SideBarItem } from './components/Sidebar';

function App() {
  return (
    <SideBar>
      <SideBarItem icon={History} text="Recent" />
      <SideBarItem icon={Home} text="Home" />
      <SideBarItem icon={FolderKanban} text="My Projects" />
      <SideBarItem icon={Users} text="Shared With Me" />
      <SideBarItem icon={Bell} text="Notifications" />
      <SideBarItem icon={Settings} text="Settings" />
    </SideBar>
  )
}

export default App
