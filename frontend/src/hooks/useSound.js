// Gera um toque de confirmação agradável usando a Web Audio API.
// Nenhum arquivo externo necessário — sintetizado inteiramente no navegador.
export function useSound() {
  const playConfirm = () => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)()

      // Acorde ascendente de três notas: Dó5 → Mi5 → Sol5
      const notas = [523.25, 659.25, 783.99]
      const agora = ctx.currentTime

      notas.forEach((freq, i) => {
        const osc = ctx.createOscillator()
        const ganho = ctx.createGain()

        osc.connect(ganho)
        ganho.connect(ctx.destination)

        osc.type = 'sine'
        osc.frequency.value = freq

        const inicio = agora + i * 0.12
        const fim = inicio + 0.35

        // Ataque suave + decaimento exponencial
        ganho.gain.setValueAtTime(0, inicio)
        ganho.gain.linearRampToValueAtTime(0.18, inicio + 0.02)
        ganho.gain.exponentialRampToValueAtTime(0.001, fim)

        osc.start(inicio)
        osc.stop(fim)
      })

      // Fecha o contexto após o toque para liberar recursos
      setTimeout(() => ctx.close(), 800)
    } catch {
      // AudioContext bloqueado ou indisponível — falha silenciosa
    }
  }

  // Baque descendente curto para indicar exclusão
  const playDelete = () => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)()
      const agora = ctx.currentTime

      // Duas notas descendentes: Sol4 → Ré4
      const notas = [392.0, 293.66]
      notas.forEach((freq, i) => {
        const osc = ctx.createOscillator()
        const ganho = ctx.createGain()

        osc.connect(ganho)
        ganho.connect(ctx.destination)

        osc.type = 'sine'
        osc.frequency.value = freq

        const inicio = agora + i * 0.14
        const fim = inicio + 0.28

        ganho.gain.setValueAtTime(0, inicio)
        ganho.gain.linearRampToValueAtTime(0.15, inicio + 0.02)
        ganho.gain.exponentialRampToValueAtTime(0.001, fim)

        osc.start(inicio)
        osc.stop(fim)
      })

      setTimeout(() => ctx.close(), 700)
    } catch {
      // falha silenciosa
    }
  }

  return { playConfirm, playDelete }
}
