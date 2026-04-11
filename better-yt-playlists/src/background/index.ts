chrome.action.onClicked.addListener((tab) => {
  if (!tab.id) return
  chrome.tabs.sendMessage(tab.id, { type: 'TOGGLE_OVERLAY' })
})

const CLIENT_ID = chrome.runtime.getManifest().oauth2!.client_id
const REDIRECT_URI = `https://${chrome.runtime.id}.chromiumapp.org`
const SCOPES = chrome.runtime.getManifest().oauth2!.scopes?.join(' ') || ''


chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === 'GET_AUTH_TOKEN') {
    const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth')
    
    authUrl.searchParams.set('client_id', CLIENT_ID)
    authUrl.searchParams.set('redirect_uri', REDIRECT_URI)
    authUrl.searchParams.set('response_type', 'token')
    authUrl.searchParams.set('scope', SCOPES)

    chrome.identity.launchWebAuthFlow(
      { url: authUrl.toString(), interactive: true },
      (redirectUrl) => {
        if (chrome.runtime.lastError || !redirectUrl) {
          sendResponse({ error: chrome.runtime.lastError?.message ?? 'Auth failed' })
          return
        }
        // Token is in the URL fragment
        const hash = new URL(redirectUrl).hash.substring(1)
        const params = new URLSearchParams(hash)
        const token = params.get('access_token')
        if (!token) {
          sendResponse({ error: 'No access token in response' })
        } else {
          sendResponse({ token })
        }
      }
    )
    return true
  }

  if (message.type === 'CLEAR_AUTH_TOKEN') {
    // launchWebAuthFlow doesn't cache, so nothing to clear
    sendResponse({})
    return true
  }

  if (message.type === 'TOGGLE_OVERLAY') {
    // handled elsewhere
  }
})