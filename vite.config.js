import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Vercel serves at the domain root; GitHub Pages serves under /betting-sim/.
// Vercel sets the VERCEL env var during builds, so we pick the base path
// automatically per host.
const base = process.env.VERCEL ? '/' : '/betting-sim/'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base,
})
