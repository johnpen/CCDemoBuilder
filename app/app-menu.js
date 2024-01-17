const mainProcess =  module.parent.exports;
const { shell } = require('electron')
isMac = true;


const template = [
  // { role: 'appMenu' }
  ...(isMac
    ? [{
        label: 'CC Demo Builder',
        submenu: [
          {role: 'about'},
          {role: 'separator'},
          {role: 'quit'}
        ]
      }]
      : []),
      {
        label: 'File',
        submenu: [
          {
              label: 'New Project',
              accelerator : 'CommandOrControl+N',
              click(item, focusedWindow) {
                mainProcess.startNewProject()
              }
             },             
         {
          label: 'Open File',
          accelerator : 'CommandOrControl+O',
          click(item, focusedWindow) {
              mainProcess.getFileFromUser(focusedWindow)
          }
         }, 
         {
          label: 'Save File',
          accelerator : 'CommandOrControl+S',
          click(item, focusedWindow) {
              mainProcess.saveFile(focusedWindow)
          }
         },            
          isMac ? {role: 'close'} : {role: 'quit'}
        ]},
        {
          label: 'Edit',
          submenu: [
            {
              label: 'Cut',
              accelerator:  'CmdOrCtrl+X', 
              selector: "cut:" 
            },
            {
              label: 'Copy',
              accelerator:  'CmdOrCtrl+C', 
              selector: "cut:" 
            },
            {
              label: 'Paste',
              accelerator:  'CmdOrCtrl+V', 
              selector: "paste:" 
            },                            
          ]
        },          
        {
          role: 'help',
          submenu: [
            {
              label: 'Learn More',
              click: async () => {
                const { shell } = require('electron')
                await shell.openExternal('https://electronjs.org')
              }
            },
            {
              label: 'Toggle Dev Mode',
              click: async() => {
                mainProcess.toggleDevMode()
              }
            }
          ]
        }
] 


module.exports  = {
  mainMenu : function(isMacOs){
    isMac = isMacOs;
    return template;
  }
}

