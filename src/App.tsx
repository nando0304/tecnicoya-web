import { useState } from 'react'

function App() {
  const [count, setCount] = useState(0)

  return (
    <main className="min-h-svh bg-base-200 flex items-center justify-center p-4">
      <div className="card bg-base-100 w-full max-w-md shadow-md">
        <div className="card-body items-center text-center">
          <h1 className="card-title text-3xl">TecnicoYa</h1>
          <p className="text-base-content/70">
            Tailwind CSS + DaisyUI funcionando
          </p>
          <div className="badge badge-success">Instalado</div>
          <div className="card-actions mt-4">
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => setCount((count) => count + 1)}
            >
              Contador: {count}
            </button>
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => setCount(0)}
            >
              Reiniciar
            </button>
          </div>
        </div>
      </div>
    </main>
  )
}

export default App
