/**
 * CIC — Hook de Chat com streaming SSE
 * Usado no IAPanel e ProducaoPanel do frontend.
 *
 * const { messages, send, isStreaming, clearHistory } = useChat('geral')
 */

import { useState, useRef, useCallback } from 'react'
import { ia } from '../api/endpoints.js'

export function useChat(agente = 'geral') {
  const [messages,    setMessages]    = useState([])
  const [isStreaming, setIsStreaming] = useState(false)
  const [error,       setError]       = useState(null)
  const streamRef = useRef(null)

  const send = useCallback(async (texto) => {
    if (!texto.trim() || isStreaming) return

    setError(null)
    const userMsg = { role: 'user', content: texto, ts: Date.now() }
    setMessages(prev => [...prev, userMsg])

    // Placeholder da resposta que vai crescendo
    const botMsg = { role: 'assistant', content: '', ts: Date.now() + 1, streaming: true }
    setMessages(prev => [...prev, botMsg])
    setIsStreaming(true)

    let accum = ''

    streamRef.current = ia.chat(
      texto,
      agente,
      messages.slice(-10), // últimas 10 mensagens como contexto
      // onToken
      (token) => {
        accum += token
        setMessages(prev => {
          const updated = [...prev]
          updated[updated.length - 1] = { ...botMsg, content: accum, streaming: true }
          return updated
        })
      },
      // onDone
      ({ tokens, model, ragUsed }) => {
        setMessages(prev => {
          const updated = [...prev]
          updated[updated.length - 1] = {
            ...botMsg,
            content:   accum,
            streaming: false,
            meta:      { tokens, model, ragUsed }
          }
          return updated
        })
        setIsStreaming(false)
      },
      // onError
      (err) => {
        setError(err)
        setIsStreaming(false)
        setMessages(prev => {
          const updated = [...prev]
          updated[updated.length - 1] = {
            ...botMsg,
            content:   `❌ Erro: ${err}`,
            streaming: false,
            isError:   true
          }
          return updated
        })
      }
    )
  }, [agente, isStreaming, messages])

  const cancel = useCallback(() => {
    streamRef.current?.cancel()
    setIsStreaming(false)
  }, [])

  const clearHistory = useCallback(() => {
    cancel()
    setMessages([])
    setError(null)
  }, [cancel])

  return { messages, send, cancel, clearHistory, isStreaming, error }
}
