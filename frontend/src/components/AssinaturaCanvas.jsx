import { useRef, useEffect, useState } from 'react'
import { Trash2 } from 'lucide-react'

export default function AssinaturaCanvas({ onChange }) {
  const canvasRef = useRef(null)
  const [desenhando, setDesenhando] = useState(false)
  const [vazio, setVazio] = useState(true)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.strokeStyle = '#1e293b'
    ctx.lineWidth = 2
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
  }, [])

  const getPos = (e, canvas) => {
    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    if (e.touches) {
      return {
        x: (e.touches[0].clientX - rect.left) * scaleX,
        y: (e.touches[0].clientY - rect.top) * scaleY,
      }
    }
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    }
  }

  const iniciar = (e) => {
    e.preventDefault()
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const pos = getPos(e, canvas)
    ctx.beginPath()
    ctx.moveTo(pos.x, pos.y)
    setDesenhando(true)
  }

  const desenhar = (e) => {
    e.preventDefault()
    if (!desenhando) return
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const pos = getPos(e, canvas)
    ctx.lineTo(pos.x, pos.y)
    ctx.stroke()
    setVazio(false)
    onChange(canvas.toDataURL('image/png'))
  }

  const parar = () => setDesenhando(false)

  const limpar = () => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    setVazio(true)
    onChange(null)
  }

  return (
    <div className="space-y-2">
      <div className="relative border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl overflow-hidden bg-white">
        <canvas
          ref={canvasRef}
          width={500}
          height={160}
          className="w-full touch-none cursor-crosshair"
          onMouseDown={iniciar}
          onMouseMove={desenhar}
          onMouseUp={parar}
          onMouseLeave={parar}
          onTouchStart={iniciar}
          onTouchMove={desenhar}
          onTouchEnd={parar}
        />
        {vazio && (
          <p className="absolute inset-0 flex items-center justify-center text-xs text-slate-400 pointer-events-none">
            Assine aqui
          </p>
        )}
      </div>
      <button type="button" onClick={limpar}
        className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-red-500 transition-colors">
        <Trash2 size={12} /> Limpar assinatura
      </button>
    </div>
  )
}
