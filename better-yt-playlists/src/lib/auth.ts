export async function getAuthToken(): Promise<string> {
  return new Promise((resolve, reject) => {
    chrome.identity.getAuthToken({ interactive: true }, (token) => {
      if (chrome.runtime.lastError || !token) {
        reject(chrome.runtime.lastError?.message ?? 'Auth failed')
      } else {
        resolve(token)
      }
    })
  })
}

export async function clearAuthToken(): Promise<void> {
  return new Promise((resolve) => {
    chrome.identity.clearAllCachedAuthTokens(resolve)
  })
}