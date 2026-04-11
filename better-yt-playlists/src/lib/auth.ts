export async function getAuthToken(): Promise<string> {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage({ type: 'GET_AUTH_TOKEN' }, (response) => {
      if (response?.error) reject(response.error)
      else resolve(response.token)
    })
  })
}

export async function clearAuthToken(): Promise<void> {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage({ type: 'CLEAR_AUTH_TOKEN' }, () => resolve())
  })
}