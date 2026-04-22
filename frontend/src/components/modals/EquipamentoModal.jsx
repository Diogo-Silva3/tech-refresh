import { useState, useEffect, useRef } from 'react'
import { X, Camera, Upload } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import api from '../../services/api'
import { useToast } from '../../contexts/ToastContext'
import { useAuth } from '../../contexts/AuthContext'

const STATUS_OPTIONS = [
  { value: 'DISPONIVEL', label: 'Disponível' },
  { value: 'EM_USO', label: 'Em Uso' },
  { value: 'MANUTENCAO', label: 'Manutenção' },
  { value: 'DESCARTADO', label: 'Descartado' },
  { value: 'EMPRESTADO', label: 'Emprestado' },
]

const PROCESSO_OPTIONS = [
  'Novo', 'Imagem Instalada', 'Softwares Instalados', 'Asset Registrado',
  'Agendado para Entrega', 'Entregue ao Usuário', 'Em Uso', 'Em Manutenção', 'Baixado',
]

export default function EquipamentoModal({ equipamento, unidades, onClose, onSave }) {
  const { usuario, isTecnico } = useAuth()
  const [form, setForm] = useState({
    tipo: equipamento?.tipo || '',
    marca: equipamento?.marca || '',
    modelo: equipamento?.modelo || '',
    serialNumber: equipamento?.serialNumber || '',
    patrimonio: equipamento?.patrimonio || '',
    status: equipamento?.status || 'DISPONIVEL',
    statusProcesso: equipamento?.statusProcesso || 'Novo',
    unidadeId: equipamento?.unidadeId || '',
    tecnicoId: equipamento?.tecnicoId || (isTecnico ? usuario?.id : ''),
    observacao: equipamento?.observacao || '',
    dataGarantia: equipamento?.dataGarantia ? new Date(equipamento.dataGarantia).toISOString().split('T')[0] : '',
  })
  const [erros, setErros] = useState({})
  const [tecnicos, setTecnicos] = useState([])
  const [loading, setLoading] = useState(false)
  const [fotoPreview, setFotoPreview] = useState(equipamento?.foto || null)
  const [fotoFile, setFotoFile] = useState(null)
  const fotoRef = useRef(null)
  const toast = useToast()
  const { t } = useTranslation()

  useEffect(() => {
    // Se for técnico, não carrega lista - usa seu próprio ID
    if (isTecnico) {
      setTecnicos([{ id: usuario?.id, nome: usuario?.nome }])
      return
    }
    
    // Se for admin, carrega lista de técnicos
    api.get('/usuarios?role=TECNICO&limit=500').then(r => {
      const todos = r.data?.data || r.data || []
      setTecnicos(todos)
    }).catch(() => {})
  }, [isTecnico, usuario])

  const set = (field) => (e) => {
    setForm(f => ({ ...f, [field]: e.target.value }))
    if (erros[field]) setErros(e => ({ ...e, [field]: null }))
  }

  const validar = () => {
    const e = {}
    if (!form.tipo.trim()) e.tipo = 'Tipo é obrigatório'
    if (!form.marca.trim()) e.marca = 'Marca é obrigatória'
    if (!form.modelo.trim()) e.modelo = 'Modelo é obrigatório'
    setErros(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validar()) return
    setLoading(true)
    try {
      const data = { ...form, unidadeId: form.unidadeId || null, tecnicoId: form.tecnicoId || null, dataGarantia: form.dataGarantia || null }
      let saved
      if (equipamento) {
        const res = await api.put(`/equipamentos/${equipamento.id}`, data)
        saved = res.data
        toast.success(t('salvoSucesso'))
      } else {
        const res = await api.post('/equipamentos', data)
        saved = res.data
        toast.success(t('salvoSucesso'))
      }
      // Upload de foto se houver
      if (fotoFile && saved?.id) {
        const fd = new FormData()
        fd.append('foto', fotoFile)
        await api.post(`/equipamentos/${saved.id}/foto`, fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      }
      onSave()
    } catch (err) {
      toast.error(err.response?.data?.error || t('erroSalvar'))
    }
    setLoading(false)
  }

  const inputCls = (campo) => `w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 bg-white dark:bg-slate-700 text-slate-800 dark:text-white transition-colors ${
    erros[campo]
      ? 'border-red-400 focus:ring-red-500/30'
      : 'border-slate-300 dark:border-slate-600 focus:ring-blue-500'
  }`
  const labelCls = 'block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1'

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto border border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-lg font-semibold text-slate-800 dark:text-white">
            {equipamento ? `${t('editar')} ${t('equipamentos').slice(0,-1)}` : `${t('novo')} ${t('equipamentos').slice(0,-1)}`}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>{t('tipo')} *</label>
              <input type="text" value={form.tipo} onChange={set('tipo')} placeholder="Notebook, Desktop..." className={inputCls('tipo')} />
              {erros.tipo && <p className="text-xs text-red-500 mt-1">{erros.tipo}</p>}
            </div>
            <div>
              <label className={labelCls}>{t('marca')} *</label>
              <input type="text" value={form.marca} onChange={set('marca')} placeholder="Dell, HP, Lenovo..." className={inputCls('marca')} />
              {erros.marca && <p className="text-xs text-red-500 mt-1">{erros.marca}</p>}
            </div>
          </div>
          <div>
            <label className={labelCls}>{t('modelo')} *</label>
            <input type="text" value={form.modelo} onChange={set('modelo')} className={inputCls('modelo')} />
            {erros.modelo && <p className="text-xs text-red-500 mt-1">{erros.modelo}</p>}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>{t('serial')}</label>
              <input type="text" value={form.serialNumber} onChange={set('serialNumber')} className={inputCls('serialNumber') + ' font-mono'} />
            </div>
            <div>
              <label className={labelCls}>{t('patrimonio')}</label>
              <input type="text" value={form.patrimonio} onChange={set('patrimonio')} className={inputCls('patrimonio')} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>{t('status')}</label>
              <select value={form.status} onChange={set('status')} className={inputCls('status')}>
                {STATUS_OPTIONS.map(s => <option key={s.value} value={s.value}>{t(s.value === 'DISPONIVEL' ? 'disponivel' : s.value === 'EM_USO' ? 'emUso' : s.value === 'MANUTENCAO' ? 'manutencao' : s.value === 'DESCARTADO' ? 'descartado' : 'emprestado')}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>{t('unidade')}</label>
              <select value={form.unidadeId} onChange={set('unidadeId')} className={inputCls('unidadeId')}>
                <option value="">{t('semUnidade')}</option>
                {unidades.map(u => <option key={u.id} value={u.id}>{u.nome}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>{t('processo')}</label>
              <select value={form.statusProcesso} onChange={set('statusProcesso')} className={inputCls('statusProcesso')}>
                {PROCESSO_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>{t('tecnico')}</label>
              <select 
                value={form.tecnicoId} 
                onChange={set('tecnicoId')} 
                disabled={isTecnico}
                className={inputCls('tecnicoId') + (isTecnico ? ' opacity-60 cursor-not-allowed' : '')}>
                <option value="">{t('semTecnico')}</option>
                {tecnicos.map(u => <option key={u.id} value={u.id}>{u.nome}</option>)}
              </select>
              {isTecnico && <p className="text-xs text-slate-400 mt-1">Seu técnico é atribuído automaticamente</p>}
            </div>
          </div>
          <div>
            <label className={labelCls}>{t('observacao')}</label>
            <textarea value={form.observacao} onChange={set('observacao')} rows={2} className={inputCls('observacao') + ' resize-none'} />
          </div>
          <div>
            <label className={labelCls}>Data de Garantia</label>
            <input type="date" value={form.dataGarantia} onChange={set('dataGarantia')} className={inputCls('dataGarantia')} />
          </div>

          {/* Foto do equipamento */}
          <div>
            <label className={labelCls}>Foto do equipamento</label>
            <input type="file" accept="image/*" ref={fotoRef} className="hidden"
              onChange={e => {
                const file = e.target.files[0]
                if (!file) return
                setFotoFile(file)
                setFotoPreview(URL.createObjectURL(file))
              }} />
            {fotoPreview ? (
              <div className="relative w-full h-36 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-600 group">
                <img src={fotoPreview} alt="Foto" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button type="button" onClick={() => fotoRef.current?.click()}
                    className="bg-white text-slate-800 px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1">
                    <Camera size={12} /> Trocar
                  </button>
                  <button type="button" onClick={() => { setFotoPreview(null); setFotoFile(null) }}
                    className="bg-red-500 text-white px-3 py-1.5 rounded-lg text-xs font-medium">
                    Remover
                  </button>
                </div>
              </div>
            ) : (
              <button type="button" onClick={() => fotoRef.current?.click()}
                className="w-full h-24 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl flex flex-col items-center justify-center gap-1.5 hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/5 transition-colors">
                <Upload size={18} className="text-slate-400" />
                <span className="text-xs text-slate-400">Clique para adicionar foto</span>
              </button>
            )}
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700">
              {t('cancelar')}
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white px-4 py-2 rounded-lg text-sm font-medium">
              {loading ? t('carregando') : t('salvar')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
