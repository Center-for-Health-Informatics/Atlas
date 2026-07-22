import ko from 'knockout'

const callbacks = new Map()
const isPageForeground = ko.observable(document.visibilityState === 'visible')
document.addEventListener('visibilitychange', () => {
  const isForeground = document.visibilityState === 'visible'
  isPageForeground(isForeground)

  if (isForeground) {
    // when a user focuses tab, we should immediately sync
    PollService.pollImmediately()
  }
})

class PollService {
  add (opts = {}, ...args) {
    const { callback = () => {}, interval = 1000, isSilentAfterFirstCall = false } = opts
    const id = new Date().valueOf()
    callbacks.set(id, {
      callback,
      interval,
      isSilentAfterFirstCall,
      totalFnCalls: 0,
      args
    })
    this.start(id)
    return id
  }

  async start (id) {
    if (callbacks.has(id)) {
      const cb = callbacks.get(id)
      const { callback, interval, isSilentAfterFirstCall, totalFnCalls } = cb
      try {
        if (isPageForeground()) {
          const silently = isSilentAfterFirstCall && totalFnCalls > 0
          await callback(silently)
          this.extraActionsAfterCallback()
          callbacks.set(id, { ...cb, totalFnCalls: totalFnCalls + 1 })
        }
      } catch (e) {
        console.log(e)
      } finally {
        setTimeout(() => this.start(id), interval)
      }
    }
  }

  extraActionsAfterCallback () {
  }

  stop (id) {
    callbacks.delete(id)
  }

  static pollImmediately () {
    for (const [, c] of callbacks) {
      c.callback(c.args)
    }
  }
}

const _pollService = new PollService()
export { _pollService as PollService, PollService as PollServiceClass }
