import { Howl } from 'howler'

type SoundName = 'correct' | 'wrong' | 'complete' | 'click'

const sounds: Record<SoundName, string> = {
  correct: '/sounds/correct.mp3',
  wrong: '/sounds/wrong.mp3',
  complete: '/sounds/complete.mp3',
  click: '/sounds/click.mp3',
}

class SoundManager {
  private howls: Record<string, Howl> = {}

  play(name: SoundName) {
    if (!this.howls[name]) {
      this.howls[name] = new Howl({
        src: [sounds[name]],
        preload: true,
      })
    }
    this.howls[name].play()
  }
}

export const soundManager = new SoundManager()
