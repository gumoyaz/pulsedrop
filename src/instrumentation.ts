export async function register() {
  // Only needed on Vercel: the deployment filesystem is read-only, so we copy
  // the seeded dev.db (bundled at build time) to /tmp which is writable.
  if (process.env.VERCEL) {
    const fs = await import('fs')
    const path = await import('path')

    const dest = '/tmp/pulsedrop.db'
    if (!fs.existsSync(dest)) {
      const src = path.join(process.cwd(), 'dev.db')
      if (fs.existsSync(src)) {
        fs.copyFileSync(src, dest)
      }
    }
  }
}
