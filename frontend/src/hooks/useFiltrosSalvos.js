import { useState, useCallback } from 'react'

/**
 * Hook para salvar e recuperar filtros favoritos no localStorage.
 * @param {string} chave - Identificador único da página (ex: 'atribuicoes', 'equipamentos')
 */
export function useFiltrosSalvos(chave) {
  const storageKey = `filtros_salvos_${chave}`

  const [filtrosSalvos, setFiltrosSalvos] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(storageKey)) || []
    } catch {
      return []
    }
  })

  const salvarFiltro = useCallback((nome, filtros) => {
    if (!nome?.trim()) return
    const novo = { id: Date.now(), nome: nome.trim(), filtros, criadoEm: new Date().toISOString() }
    setFiltrosSalvos(prev => {
      const atualizado = [novo, ...prev.filter(f => f.nome !== nome.trim())].slice(0, 10)
      localStorage.setItem(storageKey, JSON.stringify(atualizado))
      return atualizado
    })
  }, [storageKey])

  const removerFiltro = useCallback((id) => {
    setFiltrosSalvos(prev => {
      const atualizado = prev.filter(f => f.id !== id)
      localStorage.setItem(storageKey, JSON.stringify(atualizado))
      return atualizado
    })
  }, [storageKey])

  return { filtrosSalvos, salvarFiltro, removerFiltro }
}
