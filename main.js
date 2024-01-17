const { app, Menu,  protocol, BrowserView, BrowserWindow, ipcMain } = require('electron')
const path = require('path')
const isMac = process.platform === 'darwin'
const Crawler = require('crawler');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const puppeteer = require('puppeteer');
const fs = require('fs')
const { clipboard } = require('electron')
const { shell } = require('electron')
const util = require('./app/utils')
const files = require('./app/files')
const exp = require('./app/data-export')
const settings = require('./app/settings')
const meinTemplate = require('./app/app-menu')
const deepl = require("deepl-node");



const https = require('https')

var devMode= false;

const {newProject} = require('./app/files');
const { devNull } = require('os');
const { start } = require('repl');
const randomstring = require("randomstring");

var filenames = [];
var pdpLinks = [];
var products = [];
let windows = new Set();
let view = null
let mainView = null
let curStep = 0;
let imgPath = '';
var pup = true;
var pause = false;
var page = null;

var authKey = ""; // Replace with your key
var translator = null;


let sfview = null
const ua =   "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/66.0.3359.181 Safari/537.36";

 const  applicationMenu = Menu.buildFromTemplate(meinTemplate.mainMenu(isMac))

protocol.registerSchemesAsPrivileged([
  { scheme: 'http', privileges: { standard: true, bypassCSP: true, allowServiceWorkers: true, supportFetchAPI: true, corsEnabled: true, stream: true } },
  { scheme: 'https', privileges: { standard: true, bypassCSP: true, allowServiceWorkers: true, supportFetchAPI: true, corsEnabled: true, stream: true } },
 ]);

app.whenReady().then(() => {

  Menu.setApplicationMenu(applicationMenu)
  ipcMain.handle('getVal-FromSelector', getValFromCSSSelector)
  ipcMain.handle('get-WinUrl', getWinUrl)

  
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      
      createWindow()
      
    }
  })

  ipcMain.on('set-MainURL', handleURL)
  ipcMain.on('set-ToolURL', handleToolURL)
  ipcMain.on('set-Selector', handleSelector)
  ipcMain.on('start-PDP', handleStartPDP)
  ipcMain.on('test-Selector', testSelector)
  ipcMain.on('set-PDPField', handlePDPField)
  ipcMain.on('set-cssval', handleCssVal)

  ipcMain.on('save-setting', settings.saveSettingVal)
  ipcMain.on('del-setting', settings.delSetting)
  ipcMain.on('get-setting', getSettingValue)
  ipcMain.on('step-five', handleStepFive)

  ipcMain.on('init-Scrape', initScrape)
  ipcMain.on('start-Scrape', startScrape)
  ipcMain.on('restart-Scrape', restartScraping)
  ipcMain.on('goto-Export', gotoExport)
  ipcMain.on('start-Export', startExport)
  ipcMain.on('open-Folder', openFolder)
  

})

app.on('window-all-closed', () => {
    app.quit()
})


 const createWindow = () => {
    let win = new BrowserWindow({
      width: 1800,
      height: 1000,
      contextIsolation: false,
      webPreferences: {
        preload: path.join(__dirname, 'preload.js'),
        sandbox: false,
        webSecurity: false
      }
    })

    //left toolbar
    sfview = new BrowserView({
      webPreferences: {
          preload: path.join(__dirname, 'sfpreload.js'),
          sandbox: false,
          webSecurity: false
        }
      })

      win.addBrowserView(sfview)
      sfview.setBounds({ x: 0, y: 0, width: 500, height: 1000 })
      sfview.setAutoResize({width:false, height: true, horizontal: false, vertical: true})
      sfview.webContents.loadFile('pages/sfview.html') 
      

    mainView = new BrowserView({
        webPreferences: {
             preload: path.join(__dirname, 'preload.js'),
             sandbox: false,
             allowRunningInsecureContent: true,
             webSecurity: false, 
             nodeIntegration: true
          }
      })      


    win.addBrowserView(mainView);
    mainView.setBounds({ x: 500, y: 0, width: 1300, height: 1000 })
    mainView.setAutoResize({width:true, height: true, horizontal: false, vertical: true})
    mainView.webContents.loadFile('pages/index.html')

    windows.add(win);
      win.on("closed", () => {
      windows.delete(win);
      win = null;
    });  

    devMode = settings.getSetting('devmode', false)

    loadProjectSeettings()
    var home = require("os").homedir();
    let rootFolder = home + `/Documents/CCDemo/data/${settings.getSetting("project")}-prods.json`    

    if(fs.existsSync(rootFolder))
    {
      const popWindow = new BrowserWindow({
        parent: mainView, modal: true, show: false,
        width: 500,
        height: 350,
        contextIsolation: false,
        webPreferences: {
          preload: path.join(__dirname, 'data-preload.js'),
          sandbox: false,
          webSecurity: false
        }        
      })

      popWindow.loadFile('pages/dialogue/createExport.html');
      popWindow.once('ready-to-show', () => {
        popWindow.show();
      })
    }

    
    if(devMode){
    sfview.webContents.openDevTools({ mode: 'detach' })
    mainView.webContents.openDevTools({ mode: 'detach' })
    popWindow.webContents.openDevTools({mode: 'detach'})
    }

}


function testSelector(event, selector){
  mainView.webContents.executeJavaScript('testSelector("' + selector + '")')
}



function handleSelector(event, selector, save){
  sfview.webContents.executeJavaScript('document.getElementById("selector").value="' + selector + '"; ')
  if(save){
    settings.saveSettingVal('plp-selector',  selector)
  }
}

async function handleURL(event, url) {
  const webContents = event.sender
  mainView.webContents.loadURL('https://' + url.url)
  mainView.webContents.send('start-link', 1)
  curStep = 1; 

  settings.delSettingKey('start-url')
  settings.delSettingKey('project')

  settings.saveSettingVal('start-url', url.url)
  settings.saveSettingVal('project', url.proj)

}

function handleToolURL(event, url){
  sfview.webContents.loadFile('pages/mapFields.html').then(() =>{
  getSettingValue('fieldMapping')
  })
}

function handleStartPDP(event){
  mainView.webContents.executeJavaScript('document.getElementById("curstep").innerText = "4"; setStep(4)')
}

function handlePDPField(event, selector){
  sfview.webContents.executeJavaScript('pdpSlection("' + selector + '"); ')

}

function handleCssVal(event, result){
  sfview.webContents.executeJavaScript('setValue(`' + result + '`); ')  
}

ipcMain.handle('get-step', (event, arg) => {
  return curStep;
});

function getValFromCSSSelector(event, sel){
  mainView.webContents.executeJavaScript('iGetCssSelValue("' + sel+ '")')
}

function getWinUrl(event) {
  sfview.webContents.executeJavaScript(`setCurURL('${mainView.webContents.getURL()}')`)
}

function getSettingValue(key){
  let value = settings.getSetting(key, null);
  if(typeof value == 'object'){
    var jsonObj = JSON.stringify(value);
    sfview.webContents.executeJavaScript(`settingValueEnd('${key}', '${jsonObj}')`)
    return jsonObj
  }else{
    sfview.webContents.executeJavaScript(`settingValueEnd('${key}', '${value}')`)
    return value
  }       
}    

function handleStepFive(event){
  mainView.webContents.executeJavaScript('document.getElementById("curstep").innerText = "5"; setStep(5)')
  sfview.webContents.loadFile('pages/addPlp.html').then(() =>{
    getSettingValue('plpurl')
  })  
}

function initScrape(event){
  mainView.webContents.loadFile('pages/scrape.html');
  sfview.webContents.loadFile('pages/scrapeInfo.html')
  sfview.webContents.executeJavaScript(`setProps('${settings.getSetting('start-url')}', '${settings.getSetting('project')}')`)

}

function startNewProject(){
  newProject();
  mainView.webContents.loadFile('pages/index.html');
  sfview.webContents.loadFile('pages/sfview.html')  
}


function toggleDevMode(){
  var dmode = settings.getSetting('devmode', false);
  if(dmode===true){
    dmode=false;
    sfview.webContents.closeDevTools()
    mainView.webContents.closeDevTools()
  }else{
    dmode=true;
    sfview.webContents.openDevTools({ mode: 'detach' })
    mainView.webContents.openDevTools({ mode: 'detach' })
  }

  devMode = dmode;
}

function loadProjectSeettings(){
  getSettingValue('start-url')
  getSettingValue('project')
  getSettingValue('plp-selector')


}

function startScrape(event){
  
  if(pup){
    startPuppeterrCrawler();
    return;
  }



  const c = new Crawler({
    jQuery: JSDOM,
    maxConnections: 10,
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36',
    // This will be called for each crawled page
    callback: (error, res, done) => {
        if (error) {
            console.log(error);
        } else {
          const virtualConsole = new jsdom.VirtualConsole();
          virtualConsole.sendTo(console);
       //   virtualConsole.sendTo(c, { omitJSDOMErrors: true });
          const dom = new JSDOM(res.body,
            { 
              runScripts: "dangerously",
              url: res.options.uri,
              resources: "usable",
              pretendToBeVisual: true,
              virtualConsole
          
            });



            res.options.a;
            // $ is Cheerio by default
            //a lean implementation of core jQuery designed specifically for the server
            console.log('done');
        }
        done();
    }



});

var urls = settings.getSetting('plpurl')
var parseUrls = [];
urls.forEach((item, index) => {
  if(item!=null)
  {
    parseUrls.push({uri:item.url, catId:item.catId, category:item.category, parent:item.parent})
  }
});
c.queue([parseUrls])
}


function gotoExport(){
  mainView.webContents.loadFile('pages/export.html')
  sfview.webContents.loadFile('pages/blank.html')  
}


function startExport(){
  var home = require("os").homedir();
  let rootFolder = home + `/Documents/CCDemo/data`


  console.log('start export')

  let data = fs.readFileSync(rootFolder + `/${settings.getSetting("project")}-pdpLinks.json`);
  pdpLinks = JSON.parse(data);

  let pdata = fs.readFileSync(rootFolder +`/${settings.getSetting("project")}-prods.json`);
  products = JSON.parse(pdata);


  writeResults()

  mainView.webContents.executeJavaScript(`stopSpin()`)
}


function addPDPLink(url, catname, catid, parent){
  if(pdpLinks.filter(e => e.url === url).length == 0)
  {
    pdpLinks.push({url, catname, catid, parent})
    return true;
  }

  return false; // duplicate
}


async function startPuppeterrCrawler(){
  var urls = settings.getSetting('plpurl')
  var parseUrls = [];
  urls.forEach((item, index) => {
    if(item!=null)
    {
      parseUrls.push({uri:item.url, catId:item.catId, category:item.category, parent:item.parent})
    }
  });  

	let browser;
	try {
	    console.log("Opening the browser......");
	    browser = await puppeteer.launch({
	        headless:  settings.getSetting("headless", true),
	        args: ["--disable-setuid-sandbox"],
	        'ignoreHTTPSErrors': true,
          IgnoreHTTPSErrors: true,
          devtools: false
	    }); 
	} catch (err) {
	    console.log("Could not create a browser instance => : ", err);
	}


  await puppeteerStartScrape(parseUrls, browser)
  await browser.close();
}


 
async function getPlpLinks(item, browser){
  let page = await browser.newPage();
  await page.setUserAgent(ua);
  await page.goto(item.uri, {waitUntil: `${settings.getSetting('waitfor', 'networkidle2')}`})


  mainView.webContents.executeJavaScript(`plpStartScrape('${item.uri}')`)

  var links = await page.$$eval(settings.getSetting('plp-selector'), links => {
    return links.map(links => links.href);
  });

  mainView.webContents.executeJavaScript(`plpScrapeResultCount(${links.length})`)
  
  links.forEach(element => {
    if(addPDPLink(element, item.category, item.catId, item.parent)){
      mainView.webContents.executeJavaScript(`addPdpRow([{LNK:'${element}', URL:'${element}',CatID:'${item.category}',Category:'${item.catId}',Parent:'${item.parent}', Complete:'false'}])`)
      mainView.webContents.executeJavaScript(`plpScrapeResult('${element}', '${item.category}', '${item.catId}', '${item.parent}')`)
    }
  });  

  files.writeJsonToDisk(pdpLinks, 'pdpLinks')

  page.close();
}



async function puppeteerStartScrape(urls, browser){
  
  mainView.webContents.executeJavaScript(`showUI()`)
  mainView.webContents.executeJavaScript(`pdpMessage('<b>STARTING SCRAPE</b>')`)
  var home = require("os").homedir();


  for(var i=0;i<urls.length;i++){
    try{
    await getPlpLinks(urls[i], browser)
    }
    catch(e){
      console.log(e)
    }
  }



  if(settings.getSetting('pause', true))
  {
    console.log('PAUSE')
    mainView.webContents.executeJavaScript(`pdpMessage('<br><b>SCRAPE PAUSED: Click Continue When Ready</b><br>')`)
    mainView.webContents.executeJavaScript(`scrapePaused()`)
    imgPath = path.join(home, `/Documents/CCDemo/data/images/${settings.getSetting("project")}`);   
  }
  else{
    getPdps(browser);
    console.log(products)

    mainView.webContents.executeJavaScript(`pdpScrapeFinished('${products.length}')`)
    mainView.webContents.executeJavaScript(`pdpMessage('...<br>Starting to download any linked images')`)
    var home = require("os").homedir();
    let rootFolder = home + `/Documents/CCDemo/data/${store.get("project")}-project`
    imgPath = path.join(home, `/Documents/CCDemo/data/images/${settings.getSetting("project")}`);    

    
    await downloadImages(products)
  
    mainView.webContents.executeJavaScript(`pdpMessage('<br><b>Finished Downloading ${filenames.length} images</b>')`)
  
    mainView.webContents.executeJavaScript(`pdpMessage('<br><b>PACKAGING FILES</b>')`)

    writeResults()

    mainView.webContents.executeJavaScript(`pdpMessage('<br><b>Catalogue Created</b>')`)


    
  
    sfview.webContents.executeJavaScript('stopSpin()')    
  }


}

async function restartScraping(even, data){

	let browser;
	try {
	    console.log("Opening the browser......");
	    browser = await puppeteer.launch({
	        headless: settings.getSetting("headless", true),
	        args: ["--disable-setuid-sandbox"],
	        'ignoreHTTPSErrors': true,
          IgnoreHTTPSErrors: true,
          devtools: false
	    });
	} catch (err) {
	    console.log("Could not create a browser instance => : ", err);
	}

  mainView.webContents.executeJavaScript(`pdpMessage('<br><b>SCRAPE RESUMED</b><br>')`)
  mainView.webContents.executeJavaScript(`mapFieldsToGrid(${JSON.stringify(settings.getSetting('fieldMapping'))})`);

  if(data.length<pdpLinks.length){
    pdpLinks = []
    for(var i=0;i<data.length;i++){
      var url = data[i].URL;
      var catname = data[i].Category;
      var catid = data[i].CatID;
      var parent = data[i].Parent;
      var row = `{url: '${data[i].URL}', catname: '${data[i].Category}', catid: '${data[i].CatID}', parent: '${data[i].Parent}'}`;
      pdpLinks.push({url, catname, catid, parent})
    }
  }

  await getPdps(browser);
  console.log(products);

  files.writeJsonToDisk(products, 'prods')

  mainView.webContents.executeJavaScript(`pdpScrapeFinished('${products.length}')`)
  mainView.webContents.executeJavaScript(`pdpMessage('...<br>Starting to download any linked images')`)
  
  await downloadImages(products)

  mainView.webContents.executeJavaScript(`pdpMessage('<br><b>Finished Downloading ${filenames.length} images</b>')`)

  mainView.webContents.executeJavaScript(`pdpMessage('<br><b>PACKAGING FILES</b>')`)

  writeResults()
  mainView.webContents.executeJavaScript(`pdpMessage('<br><b>Catalogue Created</b>')`)

  sfview.webContents.executeJavaScript('stopSpin()')      

}



async function pdpToProduct(url, browser){

  if (products.filter(e => e.url === url.url).length > 0) {
    return;
  }
  mainView.webContents.executeJavaScript(`pdpStartScrape('${url.url}')`)

  var productmap  = settings.getSetting('fieldMapping')
  if(page==null)
  {
   page = await browser.newPage();
  }
  await page.setUserAgent(ua);
  await page.goto(url.url, {waitUntil: `${settings.getSetting('waitfor', 'networkidle2')}`})

  //var content = await page.content()

  var prod={url:url.url, cat:url.catname, catid:url.catid, parent:url.parent, fields:[]}
  let idSet = false;

  for(let f=0;f<productmap.length;f++){
    if(productmap[f]!=null){
    var fld = productmap[f].field;
    var typ = productmap[f].type;
    var sel = productmap[f].selector
    var cust = productmap[f].custom
    var iname = ''

    var data = "";

    
    try{
    var res = await page.$eval(sel, el => el.outerHTML);
    data = res;
    }catch(e){
      data = await page.$(sel);
      console.log(data)
    }

    if(data == "" || data == undefined || data == null){
      console.log("no data found for: " + sel);
      data="";
    }

    switch(typ){
      case "text":
        {
          var regex = /(<([^>]+)>)/ig
          data = data.replace(regex, ' ')
          data = data.replace('&nbsp;', ' ')


          break;
        }
      case "number":
        {
          data = data.replace(/(\d+)\.(\d+)/g, '$1.$2').replace(/[^\d.]+/g, '');
          break;
        }
      case "image":
        {
          var regex = /<img[^>]+src=["'](.*?)["']/;
          var match = regex.exec(data);
          if(match==null){
            iname='';
          }else{
          data = match ? match[1] : null;
          var filename = util.getFileName(data);
          filename = util.newFileName(filename, filenames);
          filenames.push(filename)          
          iname = filename;
          }
          break;
        }
      case "url":
        {
          const linkRegex = /<a\s+(?:[^>]*?\s+)?href=["']([^"']+)["'][^>]*?>/;
          const match = data.match(linkRegex);
          data = match[0]
          break;
        }
      case "custom":
        {}
    }

    

    var fmapdata = {field:fld, type:typ, content:data, imageName:iname, custom:cust}
    prod.fields.push(fmapdata);

  }
}
if(prod.fields.length>0){

  if(! idSet){
    let _id = randomstring.generate(8);
    let fmapdata = {field:'ID', type:'text', content:_id, imageName:'', custom:''}
    prod.fields.push(fmapdata)
  }

  products.push(prod);
  mainView.webContents.executeJavaScript(`pdpAddProduct(${JSON.stringify(prod)})`)  
}
else {
  mainView.webContents.executeJavaScript(`pdpMessage('Skipping :  ${url.url} ')`)
}
 //page.close();

}

async function getPdps(browser){
 // 
 for(var i=0;i<pdpLinks.length;i++){
    await pdpToProduct(pdpLinks[i], browser)
  }
}


function filenameInUse(name){
  if (filenames.filter(name).length == 0) {
    return false;
  }  

  return true;
}


async function downloadImages(products){
  var home = require("os").homedir();
  imgPath = path.join(home, `/Documents/CCDemo/data/images/${settings.getSetting("project")}`);    
  for(var i=0;i<products.length;i++){
    for(var n=0;n<products[i].fields.length;n++){
      if(products[i].fields[n].type==='image'){
        mainView.webContents.executeJavaScript(`downloadImageMessage('${products[i].fields[n].content}')`)
        files.downloadFile(products[i].fields[n].content, path.join(imgPath,products[i].fields[n].imageName))
      }
    }
  }
}


function writeResults(){
  files.createOutputFolderStructure()
  exp.createSitePreferences()
  exp.createCat(products)
  exp.createInventory(products)
  exp.shippingConfig()

  let curs = settings.getSetting("supportedcurrency", "GBP").split(':');
  let rate =1;
  for(let i=0;i<curs.length;i++){
    switch(curs[i])
    {
      case "GBP" :
        {
          rate = 1;
          break;
        }
      case "EUR":
        {
          rate = 1.1;
          break;
        }   
        case "USD":
          {
            rate = 1.4;
            break;
          }     
          case "JPY":
            {
              rate = 183;
              break;
            }                     
    }

    exp.createPriceBook(curs[i], rate, products)
  }


  files.copyFilesToOutputFolder()
  files.createZipFile()
}



function openFolder(){
  var home = require("os").homedir();
  let rootFolder = home + `/Documents/CCDemo/data/`  
  shell.openPath(rootFolder)
}

function translateKey(){
  return settings.getSetting('deepLapi')
}

exports.toggleDevMode = toggleDevMode
exports.startNewProject = startNewProject
exports.sfview = sfview
exports.products = products
exports.app = app
exports.translateKey = translateKey

