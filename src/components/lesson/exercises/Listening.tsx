/* eslint-disable react-hooks/set-state-in-effect */
'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { Listening as ListeningType } from '@/types/schemas'
import { useLessonStore } from '@/lib/stores/use-lesson-store'
import { cn } from '@/lib/utils'
import { Pause, Play, RotateCcw, Volume2 } from 'lucide-react'

export function Listening({ exercise }: { exercise: ListeningType }) {
  const { setDraftAnswer, draftAnswer, status, lastFeedback, submitAnswer } =
    useLessonStore()
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [duration, setDuration] = useState<number>(0)
  const [currentTime, setCurrentTime] = useState<number>(0)
  const [audioError, setAudioError] = useState<string | null>(null)

  const mode: 'audio' | 'tts' = exercise.audioUrl ? 'audio' : 'tts'

  const progress = useMemo(() => {
    if (!duration || duration <= 0) return 0
    return Math.min(100, Math.max(0, (currentTime / duration) * 100))
  }, [currentTime, duration])

  useEffect(() => {
    setIsPlaying(false)
    setAudioError(null)
    setDuration(0)
    setCurrentTime(0)

    // Stop any ongoing playback when switching exercises.
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel()
    }

    const audio = audioRef.current
    if (!audio) return
    if (mode !== 'audio') return

    const onLoaded = () => {
      setDuration(audio.duration || 0)
      setAudioError(null)
    }
    const onTime = () => setCurrentTime(audio.currentTime || 0)
    const onEnded = () => setIsPlaying(false)
    const onPlay = () => setIsPlaying(true)
    const onPause = () => setIsPlaying(false)
    const onError = () => {
      setIsPlaying(false)
      setAudioError('Audio unavailable for this exercise.')
    }

    audio.addEventListener('loadedmetadata', onLoaded)
    audio.addEventListener('timeupdate', onTime)
    audio.addEventListener('ended', onEnded)
    audio.addEventListener('play', onPlay)
    audio.addEventListener('pause', onPause)
    audio.addEventListener('error', onError)

    return () => {
      audio.removeEventListener('loadedmetadata', onLoaded)
      audio.removeEventListener('timeupdate', onTime)
      audio.removeEventListener('ended', onEnded)
      audio.removeEventListener('play', onPlay)
      audio.removeEventListener('pause', onPause)
      audio.removeEventListener('error', onError)
    }
  }, [exercise.audioUrl, mode])

  // Stop playback when leaving active state.
  useEffect(() => {
    if (status === 'active') return

    if (mode === 'audio') {
      audioRef.current?.pause()
      setIsPlaying(false)
      return
    }

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel()
    }
    setIsPlaying(false)
  }, [status, mode])

  const speak = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      setAudioError('Text-to-speech is not supported in this browser.')
      return
    }

    const text = exercise.ttsText?.trim() || exercise.correctTranscript.trim()
    if (!text) {
      setAudioError('No text available for TTS.')
      return
    }

    window.speechSynthesis.cancel()

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = 'de-DE'
    utterance.onend = () => setIsPlaying(false)
    utterance.onerror = () => {
      setIsPlaying(false)
      setAudioError('Text-to-speech failed to play.')
    }
    utteranceRef.current = utterance

    setAudioError(null)
    setIsPlaying(true)
    window.speechSynthesis.speak(utterance)
  }

  const togglePlay = async () => {
    if (status !== 'active') return

    if (mode === 'tts') {
      if (isPlaying) {
        if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
          window.speechSynthesis.cancel()
        }
        setIsPlaying(false)
      } else {
        speak()
      }
      return
    }

    const audio = audioRef.current
    if (!audio) return

    try {
      if (isPlaying) audio.pause()
      else await audio.play()
    } catch {
      setAudioError('Audio could not be played in this browser.')
    }
  }

  const restart = () => {
    if (status !== 'active') return

    if (mode === 'tts') {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel()
      }
      setIsPlaying(false)
      speak()
      return
    }

    const audio = audioRef.current
    if (!audio) return
    audio.currentTime = 0
    setCurrentTime(0)
  }

  return (
    <div className="mx-auto mt-2 flex w-full max-w-2xl flex-col gap-6 px-0 sm:mt-6 sm:gap-8">
      <div className="space-y-2 text-center">
        <h2 className="font-heading text-foreground text-xl leading-tight font-extrabold sm:text-3xl">
          {exercise.prompt}
        </h2>
        <p className="text-muted-foreground text-sm">
          Listen carefully, then type what you hear.
        </p>
      </div>

      <div
        className={cn(
          'bg-card rounded-3xl border-2 p-5 shadow-sm sm:p-6',
          status === 'feedback' &&
            lastFeedback?.isCorrect &&
            'border-emerald-500 bg-emerald-50',
          status === 'feedback' &&
            !lastFeedback?.isCorrect &&
            'border-red-500 bg-red-50',
          status === 'active' && 'border-border'
        )}
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="border-border bg-muted flex h-11 w-11 items-center justify-center rounded-2xl border shadow-sm">
              <Volume2 className="text-foreground h-5 w-5" />
            </div>
            <div className="min-w-0">
              <div className="text-foreground truncate text-sm font-bold">
                {mode === 'audio' ? 'Audio' : 'Text-to-Speech'}
              </div>
              <div className="text-muted-foreground text-xs">
                {audioError
                  ? audioError
                  : mode === 'audio'
                    ? 'Tap play to listen'
                    : 'Tap play to hear TTS (German)'}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={restart}
              disabled={status !== 'active'}
              className="border-border bg-card text-foreground hover:bg-muted inline-flex h-10 w-10 items-center justify-center rounded-xl border shadow-sm transition-colors disabled:opacity-50"
              aria-label="Restart audio"
            >
              <RotateCcw className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={togglePlay}
              disabled={status !== 'active' || !!audioError}
              className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex h-10 w-10 items-center justify-center rounded-xl shadow-sm transition-colors disabled:opacity-50"
              aria-label={isPlaying ? 'Pause audio' : 'Play audio'}
            >
              {isPlaying ? (
                <Pause className="h-5 w-5" />
              ) : (
                <Play className="h-5 w-5 translate-x-[1px]" />
              )}
            </button>
          </div>
        </div>

        {mode === 'audio' ? (
          <>
            <div className="bg-muted mt-4 h-2 w-full overflow-hidden rounded-full">
              <div
                className="bg-primary h-full rounded-full transition-[width] duration-200"
                style={{ width: `${progress}%` }}
              />
            </div>
            <audio ref={audioRef} src={exercise.audioUrl} preload="metadata" />
          </>
        ) : (
          <div className="bg-muted mt-4 h-2 w-full overflow-hidden rounded-full">
            <div
              className={cn(
                'bg-primary h-full rounded-full',
                isPlaying ? 'animate-pulse' : 'opacity-20'
              )}
              style={{ width: isPlaying ? '100%' : '35%' }}
            />
          </div>
        )}
      </div>

      <div className="relative w-full">
        <textarea
          value={typeof draftAnswer === 'string' ? draftAnswer : ''}
          onChange={(e) => setDraftAnswer(e.target.value)}
          onKeyDown={(e) => {
            if (e.key !== 'Enter') return
            if (e.shiftKey || e.metaKey || e.ctrlKey || e.altKey) return
            e.preventDefault()
            if (status !== 'active') return
            const v = typeof draftAnswer === 'string' ? draftAnswer : ''
            if (v.trim().length === 0) return
            submitAnswer()
          }}
          disabled={status !== 'active'}
          placeholder="Type what you heard..."
          className={cn(
            'placeholder:text-muted-foreground min-h-[120px] w-full resize-none rounded-2xl border-2 p-5 text-lg font-medium transition-all outline-none sm:min-h-[160px] sm:p-6 sm:text-2xl',
            status === 'active' &&
              'border-border bg-card text-foreground focus:border-primary/60',
            status === 'feedback' &&
              lastFeedback?.isCorrect &&
              'border-emerald-500 bg-emerald-50 text-emerald-900',
            status === 'feedback' &&
              !lastFeedback?.isCorrect &&
              'border-red-500 bg-red-50 text-red-900',
            status !== 'active' && status !== 'feedback' && 'opacity-50'
          )}
          spellCheck={false}
          autoComplete="off"
        />
      </div>
    </div>
  )
}
