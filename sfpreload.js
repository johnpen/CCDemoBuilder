console.log('sfpereload.js loaded')

const { contextBridge, ipcRenderer  } = require('electron')
const path = require('path')

contextBridge.exposeInMainWorld('versions', {
    node: () => process.versions.node,
    chrome: () => process.versions.chrome,
    electron: () => process.versions.electron
})

contextBridge.exposeInMainWorld('scrapesiteurl', {
    geturl: () => ipcRenderer.invoke('get-WinUrl')
})

contextBridge.exposeInMainWorld('electronAPI', {
    setMainURL: (url) => ipcRenderer.send('set-MainURL', url)
  })

  contextBridge.exposeInMainWorld('toolAPI', {
    setToolURL: (url) => ipcRenderer.send('set-ToolURL', url)
  })  

  contextBridge.exposeInMainWorld('cssSel', {
    testSelector: (url) => ipcRenderer.send('test-Selector', url)
  })  


contextBridge.exposeInMainWorld('pdpSelector', {
  startPDPmap: (sel) => ipcRenderer.send('start-PDP', sel)
})

contextBridge.exposeInMainWorld('getValFromSelector', {
  getVal: (sel) => ipcRenderer.invoke('getVal-FromSelector', sel)
})  


contextBridge.exposeInMainWorld('setting', {
  SaveSettingValue: (setval) => ipcRenderer.send('save-setting', setval)
})

contextBridge.exposeInMainWorld('delsetting', {
  DelSettingValue: (setval) => ipcRenderer.send('del-setting', setval)
})

contextBridge.exposeInMainWorld('getSetting', {
  GetSettingValue: (key) => ipcRenderer.send('get-setting', key)
})

contextBridge.exposeInMainWorld('getplp', {
  StepFive: (setval) => ipcRenderer.send('step-five', setval)
})


contextBridge.exposeInMainWorld('scrape', {
  initScrape: () => ipcRenderer.send('init-Scrape')
})


contextBridge.exposeInMainWorld('startscrape', {
  startScrape: () => ipcRenderer.send('start-Scrape')
})

contextBridge.exposeInMainWorld('Shell', {
  openFolder: () => ipcRenderer.send('open-Folder')
})
