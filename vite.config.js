import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
    base: '/cd_search-not-for-general-audiences-git/', // ✅ ← ここに追加！
    plugins: [react()],
})
