export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { getDb } = await import('./lib/db')
    getDb() // Initialize DB and run migrations

    // Start cron jobs
    const cron = await import('node-cron')
    const { syncTodoist, syncNotion, syncWeather } = await import('./lib/cron')
    const { syncServerMetrics, pruneServerMetricsHistory } = await import('./lib/server-metrics')

    const serverPollMinutes = parseInt(process.env.SERVER_POLL_MINUTES || '5', 10)

    // Sync every 5 minutes
    cron.schedule('*/5 * * * *', async () => {
      await Promise.all([syncTodoist(), syncNotion()])
    })

    // Sync weather every 30 minutes
    cron.schedule('*/30 * * * *', async () => {
      await syncWeather()
    })

    // Sync server metrics every SERVER_POLL_MINUTES
    cron.schedule(`*/${serverPollMinutes} * * * *`, async () => {
      await syncServerMetrics()
    })

    // Prune server metrics history daily at 03:00
    cron.schedule('0 3 * * *', async () => {
      await pruneServerMetricsHistory()
    })

    // Initial sync on startup
    await Promise.all([syncTodoist(), syncNotion(), syncWeather()])
    syncServerMetrics().catch(e => console.error('[instrumentation] server metrics initial sync:', e))
    console.log('[instrumentation] DB initialized, cron started')
  }
}
