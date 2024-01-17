const Store = require('electron-store');
const { shell } = require('electron')
const { contextBridge, ipcRenderer  } = require('electron')
const store = new Store()


contextBridge.exposeInMainWorld('Export', {
    gotoExport: () => ipcRenderer.send('goto-Export')
})





document.addEventListener("DOMContentLoaded", () => {

    document.getElementById("proj").innerText = store.get("project", "*");

});
