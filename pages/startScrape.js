function settingValueEnd(key, fmap){

  let setjson = JSON.parse(fmap);

  document.getElementById('apikey').value = setjson.deepLapi;
}

function setProps(url, proj){
     document.getElementById('proj').innerText = proj;
     document.getElementById('url').innerText = url;
}


function startButClick(){
    document.getElementById('button').classList.add('publishing')
    window.setting.SaveSettingValue({'pause': document.getElementById('pause').checked}, true)
    window.setting.SaveSettingValue({'headless': document.getElementById('headless').checked}, true)
    window.setting.SaveSettingValue({'sitename': document.getElementById('sitename').value}, true)

    window.setting.SaveSettingValue({'basecurrency': `${document.getElementById('bcurrency').value}`}, true)
    window.setting.SaveSettingValue({'supportedcurrency': `${Array.from(scurrency.selectedOptions).map(t => t.value).join(':')}`}, true)
    window.setting.SaveSettingValue({'baselocale': `${document.getElementById('blanguage').value}`}, true)
    window.setting.SaveSettingValue({'translate': `${Array.from(tlanguage.selectedOptions).map(t => t.value).join(':')}`}, true)
    window.setting.SaveSettingValue({'waitfor': `${document.getElementById('waitfor').value}`}, true)
    window.setting.SaveSettingValue({'deepLapi': `${document.getElementById('apikey').value}`}, true)

    
    window.startscrape.startScrape()
}

function stopSpin(){
    document.getElementById('button').classList.remove('publishing');
    document.getElementById('button').classList.add('published');

    document.getElementById('fin').style.display='';

    setTimeout(function () {
        document.getElementById('button').classList.remove('published');
      }, 4000);    
}

function filesClick(){
    window.Shell.openFolder()
  }

var startBut = document.getElementById('button');
startBut.addEventListener("click", startButClick)

var expBut = document.getElementById('viewfiles');
expBut.addEventListener("click", filesClick)

document.addEventListener("DOMContentLoaded", () => {
  var apikey = window.getSetting.GetSettingValue('deepLapi');
});