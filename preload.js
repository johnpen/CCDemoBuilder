const { contextBridge, ipcRenderer  } = require('electron')
console.log('preload.js loaded');


contextBridge.exposeInMainWorld('elementSelector', {
    setSelector: (sel, save) => ipcRenderer.send('set-Selector', sel, save)
})

contextBridge.exposeInMainWorld('pdpfield', {
  setPDPField: (sel) => ipcRenderer.send('set-PDPField', sel)
})

contextBridge.exposeInMainWorld('fmapper', {
  SetCssSelValue: (res) => ipcRenderer.send('set-cssval', res)
})



contextBridge.exposeInMainWorld('restartscrape', {
  restartScrape: (data) => ipcRenderer.send('restart-Scrape', data)
})



contextBridge.exposeInMainWorld('StartExport', {
  startExport: () => ipcRenderer.send('start-Export')
})

contextBridge.exposeInMainWorld('Shell', {
  openFolder: () => ipcRenderer.send('open-Folder')
})

var curStep = 0;
var nonce = '';


document.addEventListener("DOMContentLoaded", () => {

    ipcRenderer.invoke('get-step').then((result) => {
        console.log('invoke step:' + result)
        curStep = result;

        window.curStep = result;
    })

    if(document.location.href.indexOf('http') >= 0)
    {
        addMetaTags();
        document.body.appendChild(injectCSS());

        var tooltip = document.createElement('div');
        tooltip.className = 'tooltip';
        tooltip.id = 'tooltip'  
        document.body.appendChild(tooltip);            


        nonce = getNonce();
        addScript('global', nonce);
    }
});


function addMetaTags(){
    var meta = document.createElement('meta');
    meta.httpEquiv = "Content-Security-Policy"
    meta.content = "default-src * 'self' data: 'unsafe-inline' 'unsafe-hashes' 'unsafe-eval'; script-src * 'self' data: 'unsafe-inline' 'unsafe-hashes' 'unsafe-eval' 'strict-dynamic'; script-src-elem * 'self' data: 'unsafe-inline' 'unsafe-hashes' 'unsafe-eval'; script-src-attr * 'self' data: 'unsafe-inline' 'unsafe-hashes' 'unsafe-eval'; style-src * 'self' data: 'unsafe-inline' 'unsafe-hashes'; style-src-elem * 'self' data: 'unsafe-inline' 'unsafe-hashes'; style-src-attr * 'self' data: 'unsafe-inline' 'unsafe-hashes'; img-src *"
    document.head.appendChild(meta)    
}

const convertStringToHTML = htmlString => {
    const parser = new DOMParser();
    const html = parser.parseFromString(htmlString, 'text/html');
  
    return html.body;
  }

function injectCSS(){
    var css = `
    <html><head></head><body><style>
.highlight {
    background-color: yellow; border{red 1px solid};
  }
  
  .tooltip {
    position: absolute;
    background-color: rgba(0, 0, 0, 0.8);
    color: white;
    padding: 15px;
    border-radius: 5px;
    font-size: 20px;
    font-family: arial
  }
.slds-button_brand{
background-color:#014486;
color:#fff;
padding-left:5px;padding-right:5px;
border:1px solid #014486;
font-weight:bold;
}
.slds-input {
width:308px;
color:#000;

}

.testhighlight {
border : 2px solid black;
background-color : #F67B4D
}

.lbut{
text-align:left;
}

.cbut {
text-align:center;
}

.rbut{
text-align:right;
}
.infodisplay {
width:95%;
height:120px;
overflow:auto;
border:1px solid black;
background-color:#fff;
color:#000;
margin-left:auto;margin-right:auto;
margin-bottom:5px;
}

.c {text-align:center}
</style></body></html>`
var styleTag = convertStringToHTML(css)
return styleTag

}



function enablePLP(){
    document.addEventListener('mouseover', event => {
        const target = event.target;
        const tooltip = document.getElementById('tooltip');
    
        cssSel = getMinSelector(target)
    
        if (target !== tooltip && target !== document) { 
          
          target.classList.add('highlight');
          const tag = target.tagName.toLowerCase();
          tooltip.innerHTML = 'Tag: ' + tag  + '<br>Selector: ' + cssSel ;
          tooltip.style.display = 'block';
          tooltip.style.fontSize = '12px';
          tooltip.style.left =  event.pageX + 10 + 'px';
          tooltip.style.top =  event.pageY + 10 + 'px';
          tooltip.style.zindex=9999;
        }
      });
      
      document.addEventListener('mouseout', event => {
        const target = event.target;
        if (target !== tooltip && target !== document) {
            target.classList.remove('highlight');
            tooltip.style.display = 'none';
        }
    });    
}


function addScript(script, nonce){
  var stepDiv = document.createElement("div");
  stepDiv.id = "curstep";
  stepDiv.innerText='0';
  stepDiv.style.display = 'none'
  document.body.appendChild(stepDiv);

    var mainscript = document.createElement("script");
    switch(script){
        case 'global':{
            mainscript.innerHTML = injectGlobalJS()
            break;
        }    
    }

    mainscript.id = script
    mainscript.nonce = nonce;
    document.body.appendChild(mainscript)
}

function injectGlobalJS(){
    var js = `
    document.addEventListener('keydown', event => {
        console.log('Key Press :' + event.key)
    })

var curStep = 0;
function setStep(num){
  curStep = num;
}

function testSelector(sel){
    var selelements = document.getElementsByClassName('testhighlight');
    if(selelements.length > 0){    

      for(i=0;i<selelements.length;i++){
        selelements[i].classList.remove('testhighlight');
      }
    }   
    else {

    }

    var res = document.querySelectorAll(sel)
    console.log(res,length + ' Matching Elements Found');

    if(res.length > 0){
      window.fmapper.SetCssSelValue(res[0].outerHTML)
    //  document.getElementById('infodisplay').innerText = res.length +  " matched elements found"   
      res.forEach((element) => {
        element.classList.add('testhighlight');

      });          
    }
}


  
    
    document.addEventListener('mouseover', event => {

        const target = event.target;
        cssSel = getMinSelector(target)    
        if (target !== tooltip && target !== document) {

          target.classList.add('highlight');
          const tag = target.tagName.toLowerCase();
          tooltip.innerHTML = 'Tag: ' + tag  + '<br>Selector: ' + cssSel ;
          tooltip.style.display = 'block';
          tooltip.style.fontSize = '12px';
          tooltip.style.left =  event.pageX + 10 + 'px';
          tooltip.style.top =  event.pageY + 10 + 'px';
          
        }
      });
      
      document.addEventListener('mouseout', event => {
        const target = event.target;
        if (target !== tooltip && target !== document) {
          target.classList.remove('highlight');
          tooltip.style.display = 'none';
        }
      });

      document.addEventListener('contextmenu', (event) => {
        console.log(curStep)
            if(curStep==0)
            {
              if(containsLink(selector))
              {
                window.elementSelector.setSelector(cssSel, true)
              }
              else{    
              window.elementSelector.setSelector("No link found", false);          
              }
            }
            if(curStep==4){
              window.pdpfield.setPDPField(cssSel)
              window.elementSelector.setSelector(cssSel, false)
            }
    })   
    
    function containsLink(target){
      
        if(target.tagName=='A'){return true}

        if(target.getElementsByTagName('a').length == 0)
        {
          if(target.parentElement.getElementsByTagName('a').length == 0)
          {
            if(curStep!=4){
            window.elementSelector.setSelector(cssSel, true)
            }
            else
            {
              window.elementSelector.setSelector(cssSel, false)
            }
            return true;
          }
      
          return false;
        }
   
        if(curStep!=4)
        {
          window.elementSelector.setSelector(cssSel, true)
        }else
        {
            window.elementSelector.setSelector(cssSel, false)
        }

        return true;
      }    



    function iGetCssSelValue(sel){
      var result = null;
      var results = document.querySelectorAll(sel);
      if(results.length <= 0){
        result = null;
      }
      else{
        result = results[0]
      }
      window.fmapper.SetCssSelValue(result.outerHTML)
    }

      function getMinSelector(e){
        selector = e;
           return getCSSSelector(e)
           window.Simmer = window.Simmer.configure({
             depth: 15,
             errorHandling:true
         })
       
       
          var res =  window.Simmer(e)
          if(!res){
           return  getCSSSelector(e)
          }
          else{
       
           return res
          }
         }
       
       
         function getCSSSelector(element) {
           if (!(element instanceof Element)) return;
           
           const path = [];
           while (element.nodeType === Node.ELEMENT_NODE) {
             let selector = element.nodeName.toLowerCase();
             if (element.id) {
              if(curStep==4){
               selector += '#' + element.id 
               path.unshift(selector);
              }
               break;
             } else {
               let sibling = element;
               let nth = 1;
               while (sibling = sibling.previousElementSibling) {
                 if (sibling.nodeName.toLowerCase() === selector) {
                   nth++;
                 }
               }
               if (nth !== 1) {
                if(curStep==4){
                 selector += ":nth-of-type(" + nth +")";
                }
               }
             }
             path.unshift(selector);
             element = element.parentNode;
           }
           return path.join(' > ');
         }      
    `

    return js;
}

function getNonce(){
    var elems = document.getElementsByTagName('script');
    for(i=0;i<elems.length;i++)
    {
        if(document.getElementsByTagName('script')[i].nonce!="")
        {
          nonce = document.getElementsByTagName('script')[i].nonce;
          break;
        }
    } 
    
    return nonce;
}

