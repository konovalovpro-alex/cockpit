import { TopBar } from '@/components/cockpit/TopBar'
import { PinsBlock } from '@/components/cockpit/PinsBlock'
import { LinksBlock } from '@/components/cockpit/LinksBlock'
import { SpacesBlock, ContextBar } from '@/components/cockpit/SpacesBlock'
import { TodoistWidget } from '@/components/cockpit/TodoistWidget'
import { NotionWidget } from '@/components/cockpit/NotionWidget'
import { ProjectsWidget } from '@/components/cockpit/ProjectsWidget'
import { ServerWidget } from '@/components/cockpit/ServerWidget'
import { FABButtons } from '@/components/cockpit/FABButtons'

export default function CockpitPage() {
  return (
    <div className="flex flex-col h-screen">
      <TopBar />
      <ContextBar />
      <div className="flex flex-1 min-h-0">
        {/* Left column — 2/3 */}
        <div className="flex-[2] min-w-0 flex flex-col gap-4 p-4 overflow-y-auto border-r border-border">
          <PinsBlock />
          <LinksBlock />
          <SpacesBlock />
        </div>
        {/* Right column — 1/3 */}
        <div className="flex-[1] min-w-0 flex flex-col gap-3 p-4 overflow-y-auto">
          <TodoistWidget />
          <NotionWidget />
          <ProjectsWidget />
          <ServerWidget />
        </div>
      </div>
      <FABButtons />
    </div>
  )
}
