import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// O deploy no GitHub Pages serve o site em /<nome-do-repositorio>/.
// A variável BASE_PATH é definida pelo workflow em .github/workflows/deploy.yml;
// em desenvolvimento (npm run dev) o caminho continua sendo a raiz.
export default defineConfig({
  base: process.env.BASE_PATH ?? '/',
  plugins: [react()],
  // PORT permite subir mais de um servidor de desenvolvimento ao mesmo tempo; sem ela, fica a 5173 padrão.
  server: process.env.PORT ? { port: Number(process.env.PORT), strictPort: true } : undefined,
})
