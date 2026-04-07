export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { getDb } = await import('./lib/db')
    getDb() // Initialize DB and run migrations

    // Start cron jobs
    const cron = await import('node-cron')
    const { syncTodoist, syncNotion, syncWeather } = await import('./lib/cron')

    // Sync every 5 minutes
    cron.schedule('*/5 * * * *', async () => {
      await Promise.all([syncTodoist(), syncNotion()])
    })

    // Sync weather every 30 minutes
    cron.schedule('*/30 * * * *', async () => {
      await syncWeather()
    })

    // Initial sync on startup
    await Promise.all([syncTodoist(), syncNotion(), syncWeather()])
    console.log('[instrumentation] DB initialized, cron started')
  }
}
