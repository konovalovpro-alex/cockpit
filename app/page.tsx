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
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      <TopBar />
      <ContextBar />
      <div style={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
        <div style={{ height: '100%', display: 'flex', gap: 'var(--space-gap)', padding: 'var(--space-page)', maxWidth: 'var(--max-width)', margin: '0 auto' }}>
          {/* Left 2fr */}
          <div style={{ flex: 2, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 'var(--space-gap)', overflowY: 'auto' }}>
            <PinsBlock />
            <LinksBlock />
            <SpacesBlock />
          </div>
          {/* Right 1fr */}
          <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 'var(--space-gap)', overflowY: 'auto' }}>
            <TodoistWidget />
            <NotionWidget />
            <ProjectsWidget />
            <ServerWidget />
          </div>
        </div>
      </div>
      <FABButtons />
    </div>
  )
}
