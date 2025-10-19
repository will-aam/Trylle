import { Sidebar } from "./sidebar"
import { MainContent } from "./main-content"
import { RightSidebar } from "./right-sidebar"

export default function MusicDashboard() {
  return (
    <div className="flex h-screen bg-[#0a0a0a] text-white overflow-hidden">
      <Sidebar />
      <MainContent />
      <RightSidebar />
    </div>
  )
}
