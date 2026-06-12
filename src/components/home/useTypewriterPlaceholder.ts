"use client"

import { useState, useEffect, useRef } from "react"

/**
 * 打字机效果的 placeholder 文本。
 * 循环展示一组提示词：逐字打出 → 停顿 → 逐字删除 → 切换下一个。
 *
 * 实现要点：
 * - 使用 useRef 持有可变阶段状态，避免 useCallback 依赖导致 effect 频繁重建
 * - 单一 useEffect 驱动整个打字/删除生命周期
 * - 组件卸载时自动清理所有 timer
 */
const phrases = [
  "销售团队在用 Excel 管理客户，经常漏跟线索……",
  "供应链库存数据分散在三个系统，无法实时查看……",
  "运营每天手动复制粘贴数据做日报，耗时 2 小时……",
  "客服团队缺少统一的工单系统，问题流转全靠微信群……",
  "财务每月手工核对三张表，容易出错且无法追溯……",
]

const TYPING_SPEED = 50 // ms / 字符
const DELETING_SPEED = 25
const PAUSE_AFTER_TYPING = 2000
const PAUSE_AFTER_DELETING = 400

type Phase = "typing" | "pause-after-type" | "deleting" | "pause-after-delete"

export function useTypewriterPlaceholder() {
  const [text, setText] = useState("")
  const [phraseIndex, setPhraseIndex] = useState(0)

  // 用 ref 持有可变阶段，避免 effect 依赖频繁变化
  const phaseRef = useRef<Phase>("typing")
  const textRef = useRef("")
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    function schedule(delay: number) {
      timerRef.current = setTimeout(tick, delay)
    }

    function tick() {
      const currentPhrase = phrases[phraseIndex]
      const phase = phaseRef.current

      if (phase === "typing") {
        if (textRef.current.length < currentPhrase.length) {
          const next = currentPhrase.slice(0, textRef.current.length + 1)
          textRef.current = next
          setText(next)
          schedule(TYPING_SPEED)
        } else {
          phaseRef.current = "pause-after-type"
          schedule(PAUSE_AFTER_TYPING)
        }
        return
      }

      if (phase === "pause-after-type") {
        phaseRef.current = "deleting"
        schedule(DELETING_SPEED)
        return
      }

      if (phase === "deleting") {
        if (textRef.current.length > 0) {
          const next = currentPhrase.slice(0, textRef.current.length - 1)
          textRef.current = next
          setText(next)
          schedule(DELETING_SPEED)
        } else {
          phaseRef.current = "pause-after-delete"
          schedule(PAUSE_AFTER_DELETING)
        }
        return
      }

      if (phase === "pause-after-delete") {
        phaseRef.current = "typing"
        textRef.current = ""
        setPhraseIndex((prev) => (prev + 1) % phrases.length)
        // 不在这里 schedule — setPhraseIndex 触发效果重建后会重新调度
      }
    }

    // 首次启动
    schedule(TYPING_SPEED)

    return () => {
      if (timerRef.current !== null) clearTimeout(timerRef.current)
    }
    // phraseIndex 变化时重建整个 effect（切换短语后重新开始键入）
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phraseIndex])

  return text
}
