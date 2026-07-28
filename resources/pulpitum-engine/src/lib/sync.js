import { ref } from 'vue'
const _stateByUuid = new Map()
const _channels = new Map()
const CHANNEL_PREFIX = 'pulpitum-sync-'
export function createSync(uuid) {
  if (!_stateByUuid.has(uuid)) {
    const currentPage = ref(1)
    const callbacks = new Set()
    let channel = null
    let channelName = CHANNEL_PREFIX + uuid
    if (typeof BroadcastChannel !== 'undefined') {
      if (!_channels.has(channelName)) {
        const ch = new BroadcastChannel(channelName)
        _channels.set(channelName, ch)
      }
      channel = _channels.get(channelName)
    }
    const gotoPage = (n, source = 'unknown') => {
      const page = Number(n)
      if (!Number.isFinite(page) || page < 1) return
      currentPage.value = page
      for (const cb of callbacks) {
        try {
          cb(page, source)
        } catch (_) {}
      }
      if (channel) {
        try {
          channel.postMessage({
            page,
            source
          })
        } catch (_) {}
      }
    }
    if (channel) {
      channel.onmessage = (event) => {
        const { page, source } = event.data || {}
        if (Number.isFinite(page)) {
          currentPage.value = page
          for (const cb of callbacks) {
            try {
              cb(page, source)
            } catch (_) {}
          }
        }
      }
    }
    const onPageChange = (cb) => {
      callbacks.add(cb)
      return () => callbacks.delete(cb)
    }
    _stateByUuid.set(uuid, {
      currentPage,
      gotoPage,
      onPageChange
    })
  }
  return _stateByUuid.get(uuid)
}
