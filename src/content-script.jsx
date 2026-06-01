import browser from 'webextension-polyfill'

// inject the script that will provide window.nostr
let script = document.createElement('script')
script.setAttribute('async', 'false')
script.setAttribute('type', 'text/javascript')
script.setAttribute('src', browser.runtime.getURL('nostr-provider.js'))
document.head.appendChild(script)

function getFavicon() {
  const link = document.querySelector('link[rel~="icon"], link[rel="shortcut icon"]')
  if (link) return link.href
  return location.origin + '/favicon.ico'
}

// listen for messages from that script
window.addEventListener('message', async message => {
  if (message.source !== window) return
  if (!message.data) return
  if (!message.data.params) return
  if (message.data.ext !== 'Nostrame') return

  // pass on to background
  var response
  try {
    // Guard: check that the extension runtime is still valid before sending.
    // In Brave (and Chrome) with MV3 service workers the runtime context can
    // become "invalidated" after a SW restart or extension update.  When that
    // happens chrome.runtime.id is undefined and the polyfill throws instead
    // of letting the browser wake the SW back up.
    if (!chrome?.runtime?.id) {
      response = {error: {message: 'Extension context invalidated. Please reload the page.'}}
    } else {
      response = await browser.runtime.sendMessage({
        type: message.data.type,
        params: message.data.params,
        host: location.host,
        favicon: getFavicon()
      })
    }
  } catch (error) {
    // Serialize the error as a plain object – Error instances lose their
    // .message when crossing the content-script/page isolated-world boundary
    // via postMessage in some Chromium / Brave versions (JSON.stringify gives {}).
    response = {error: {message: error.message || String(error)}}
  }

  // return response
  window.postMessage(
    {id: message.data.id, ext: 'Nostrame', response},
    message.origin
  )
})
