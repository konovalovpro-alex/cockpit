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
      <div style={{ flexShrink: 0 }}>
        <TopBar />
      </div>
      <div style={{ flexShrink: 0 }}>
        <ContextBar />
      </div>
      <div style={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
        <div style={{ height: '100%', display: 'flex', gap: 'var(--space-gap)', padding: 'var(--space-page)', maxWidth: 'var(--max-width)', margin: '0 auto', boxSizing: 'border-box' }}>
          {/* Left 2fr */}
          <div style={{ flex: 2, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 'var(--space-gap)', minHeight: 0, overflow: 'hidden' }}>
            <div style={{ flexShrink: 0 }}>
              <PinsBlock />
            </div>
            <div style={{ flex: 1, minHeight: 0 }}>
              <LinksBlock />
            </div>
            <div style={{ flexShrink: 0 }}>
              <SpacesBlock />
            </div>
          </div>
          {/* Right 1fr */}
          <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 'var(--space-gap)', minHeight: 0, overflow: 'hidden' }}>
            <div style={{ flex: 1, minHeight: 0 }}>
              <TodoistWidget />
            </div>
            <div style={{ flex: 1, minHeight: 0 }}>
              <NotionWidget />
            </div>
            <div style={{ flexShrink: 0 }}>
              <ProjectsWidget />
            </div>
            <div style={{ flexShrink: 0 }}>
              <ServerWidget />
            </div>
          </div>
        </div>
      </div>
      <FABButtons />
    </div>
  )
}
