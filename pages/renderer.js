console.log('renderer.js loaded')

const information = document.getElementById('info')
information.innerText = `This app is using Chrome (v${window.versions.chrome()}), Node.js (v${window.versions.node()}), and Electron (v${window.versions.electron()})`


const setButton = document.getElementById('btn')
const titleInput = document.getElementById('url')
const testButton = document.getElementById('testsel')
const restartButton = document.getElementById('restart')
const step3Button = document.getElementById('step3button')
const step4button = document.getElementById('step4button')

document.getElementById('step3').style.display='none';
document.getElementById('step4').style.display='none';

setButton.addEventListener('click', () => {
  const URL = url.value;
  var ret = {url: URL, proj: document.getElementById('projname').value}
  window.electronAPI.setMainURL(ret)

  document.getElementById('start').style.display='none'
  document.getElementById('step2').style.display='block'
  document.getElementById('step3').style.display='none'
  document.getElementById('step4').style.display='none'
})

testButton.addEventListener('click', () => {
  window.cssSel.testSelector(document.getElementById('selector').value)
})

step3button.addEventListener('click', () => {
  document.getElementById('start').style.display='none'
  document.getElementById('step2').style.display='none'
  document.getElementById('step3').style.display='block'
  document.getElementById('step4').style.display='none'  
  window.setting.SaveSettingValue({'plp-selector':document.getElementById('selector').value}) 
})

step4button.addEventListener('click', () => {
  window.toolAPI.setToolURL('mapFields')
  document.getElementById('start').style.display='none'
  document.getElementById('step2').style.display='none'  
  document.getElementById('step3').style.display='none'
  document.getElementById('step4').style.display='block'

  window.pdpSelector.startPDPmap('')
})




restartButton.addEventListener('click', () => {
  document.getElementById('start').style.display='block'
  document.getElementById('step2').style.display='none'
  document.getElementById('step3').style.display='none'
  document.getElementById('step4').style.display='none'
})

function settingValueEnd(key, value){
  switch(key){
    case 'start-url' :{
      document.getElementById('url').value=value;
      break;
    }
    case 'project':{
      document.getElementById('projname').value=value;
      break;
    }
    case 'plp-selector' : {
      document.getElementById('selector').value=value;
      break;      
    }
    case 'deepLapi' : {
      document.getElementById('apikey').value=value;
      break;      
    }    
  }
}
