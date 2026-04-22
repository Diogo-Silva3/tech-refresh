import { useEffect, useRef, useState } from 'react'
import { X, Camera } from 'lucide-react'

export default function QrScanner({ onResult, onClose }) {
  const scannerRef = useRef(null)
  const instanceRef = useRef(null)
  const [erro, setErro] = useState(null)

  useEffect(() => {
    let scanner
    import('html5-qrcode').then(({ Html5Qrcode }) => {
      scanner = new Html5Qrcode('qr-reader')
      instanceRef.current = scanner
      scanner.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (text) => {
          scanner.stop().catch(() => {})
          // Extrai o ID do equipamento da URL ou usa o texto direto
          const match = text.match(/\/equipamentos\/(\d+)/)
          const id = match ? match[1] : text
          onResult(id)
        },
        () => {}
      ).catch(e => setErro('Não foi possível acessar a câmera. Verifique as permissões.'))
    })

    return () => {
      if (instanceRef.current) {
        instanceRef.current.stop().catch(() => {})
      }
    }
  }, [])

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center p-4">
      <div className="bg-white dark:bg-[#0f1623] rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-white/5">
          <div className="flex items-center gap-2">
            <Camera size={16} className="text-blue-500" />
            <p className="text-sm font-semibold text-slate-800 dark:text-white">Escanear QR Code</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1">
            <X size={18} />
          </button>
        </div>

        <div className="p-4">
          {erro ? (
            <div className="text-center py-8">
              <p className="text-sm text-red-500">{erro}</p>
              <button onClick={onClose} className="mt-4 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg">
                Fechar
              </button>
            </div>
          ) : (
            <>
              <div id="qr-reader" ref={scannerRef} className="rounded-xl overflow-hidden" />
              <p className="text-xs text-slate-400 text-center mt-3">
                Aponte a câmera para o QR Code do equipamento
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
