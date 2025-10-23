'use client'

import { useCallback, useRef } from 'react'

type PulseType = 'repel'

type Nodes = {
  ctx: AudioContext
  master: GainNode
  hum?: { osc: OscillatorNode; gain: GainNode }
}

function makeCtx() {
  const ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
  const master = ctx.createGain()
  master.gain.value = 0.9
  master.connect(ctx.destination)
  return { ctx, master } as Nodes
}

function startHum(nodes: Nodes) {
  if (nodes.hum) return
  const { ctx, master } = nodes
  const humGain = ctx.createGain()
  humGain.gain.value = 0
  humGain.connect(master)

  const osc = ctx.createOscillator()
  osc.type = 'sine'
  osc.frequency.value = 110 // low calm hum
  osc.connect(humGain)
  osc.start()

  // soft attack
  const t = ctx.currentTime
  humGain.gain.cancelScheduledValues(t)
  humGain.gain.setValueAtTime(0, t)
  humGain.gain.linearRampToValueAtTime(0.02, t + 0.3)

  nodes.hum = { osc, gain: humGain }
}

function stopHum(nodes: Nodes) {
  if (!nodes.hum) return
  const { ctx } = nodes
  const { osc, gain } = nodes.hum
  const t = ctx.currentTime
  gain.gain.cancelScheduledValues(t)
  gain.gain.setTargetAtTime(0, t, 0.15)
  setTimeout(() => {
    try {
      osc.stop()
      osc.disconnect()
      gain.disconnect()
    } catch {}
  }, 400)
  nodes.hum = undefined
}

function noiseBurst(nodes: Nodes, durMs = 140) {
  const { ctx, master } = nodes
  const dur = Math.max(0.04, durMs / 1000)
  const buffer = ctx.createBuffer(1, Math.floor(ctx.sampleRate * dur), ctx.sampleRate)
  const data = buffer.getChannelData(0)
  // white noise
  for (let i = 0; i < data.length; i++) {
    data[i] = (Math.random() * 2 - 1) * 0.6
  }
  const src = ctx.createBufferSource()
  src.buffer = buffer

  const hp = ctx.createBiquadFilter()
  hp.type = 'highpass'
  hp.frequency.value = 800

  const gn = ctx.createGain()
  gn.gain.value = 0.0001

  src.connect(hp)
  hp.connect(gn)
  gn.connect(master)

  const t = ctx.currentTime
  gn.gain.cancelScheduledValues(t)
  gn.gain.setValueAtTime(0.0001, t)
  gn.gain.exponentialRampToValueAtTime(0.2, t + dur * 0.25)
  gn.gain.exponentialRampToValueAtTime(0.0001, t + dur)

  src.start(t)
  src.stop(t + dur + 0.02)
}

export function useAudio() {
  const nodesRef = useRef<Nodes | null>(null)

  const ensure = useCallback(async () => {
    if (!nodesRef.current) nodesRef.current = makeCtx()
    const ctx = nodesRef.current.ctx
    if (ctx.state === 'suspended') {
      try {
        await ctx.resume()
      } catch {}
    }
    return nodesRef.current
  }, [])

  const start = useCallback(async () => {
    const nodes = await ensure()
    startHum(nodes)
  }, [ensure])

  const stop = useCallback(async () => {
    const nodes = nodesRef.current
    if (!nodes) return
    stopHum(nodes)
    try {
      await nodes.ctx.suspend()
    } catch {}
  }, [])

  const pulse = useCallback(
    async (type: PulseType) => {
      const nodes = await ensure()
      if (type === 'repel') {
        noiseBurst(nodes, 140)
        // slight dip in hum
        if (nodes.hum) {
          const t = nodes.ctx.currentTime
          nodes.hum.gain.gain.cancelScheduledValues(t)
          const v = nodes.hum.gain.gain.value
          nodes.hum.gain.gain.setValueAtTime(v, t)
          nodes.hum.gain.gain.linearRampToValueAtTime(Math.max(0.005, v * 0.5), t + 0.06)
          nodes.hum.gain.gain.linearRampToValueAtTime(0.02, t + 0.25)
        }
      }
    },
    [ensure],
  )

  const victory = useCallback(async () => {
    const nodes = await ensure()
    if (!nodes.hum) return
    const t = nodes.ctx.currentTime
    nodes.hum.gain.gain.cancelScheduledValues(t)
    nodes.hum.gain.gain.setTargetAtTime(0, t, 0.4)
    setTimeout(() => stopHum(nodes), 900)
  }, [ensure])

  return { start, stop, pulse, victory }
}
