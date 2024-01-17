const path = require('path')
const fs = require('fs')
const Store = require('electron-store');
const store = new Store()
const https = require('https')
const mainProcess =  module.parent.exports;
const deepl = require("deepl-node");
let translator = null;
let translatedHistory = []


module.exports  = {

    downloadFile : function(url, filename){
        return new Promise((resolve, reject) =>{
          https.get(url, (res) => {
            if(res.statusCode===200){
              res.pipe(fs.createWriteStream(filename))
                .on('error', reject)
                .once('close', () => resolve(filename));
            }
            else{
              res.resume();
              reject(new Error(`Request Failed With Status Code: ${res.statusCode}`))
            }
          })
        })
    },

    createOutputFolderStructure : function (){
        var home = require("os").homedir();
        let rootFolder = home + `/Documents/CCDemo/data/${store.get("project")}-project`
        imgPath = path.join(home, `/Documents/CCDemo/data/images/${store.get("project")}`);
        
        if(! fs.existsSync(home + '/Documents/CCDemo')){
          fs.mkdirSync(home + '/Documents/CCdemo')
        }

        if(! fs.existsSync(home + '/Documents/CCDemo/data')){
          fs.mkdirSync(home + '/Documents/CCdemo/data')
        } 

        if(! fs.existsSync(home + '/Documents/CCDemo/data/siteExports')){
          fs.mkdirSync(home + '/Documents/CCdemo/data/siteExports')
        }         

        if(! fs.existsSync(home + '/Documents/CCDemo/data/images')){
          fs.mkdirSync(home + '/Documents/CCdemo/data/images')
        }    

        if(! fs.existsSync(home + `/Documents/CCDemo/data/images/${store.get("project")}`)){
          fs.mkdirSync(home + `/Documents/CCdemo/data/images/${store.get("project")}`)
        }  

        if(! fs.existsSync(rootFolder)){
          fs.mkdirSync(rootFolder)
        }else{
          fs.rmdirSync(rootFolder, {recursive:true, force:true})
          fs.mkdirSync(rootFolder)
        }
        
        fs.mkdirSync(rootFolder + `/${store.get("project")}`)
        fs.mkdirSync(rootFolder + `/${store.get("project")}/${store.get("project")}`)
      
        rootFolder = rootFolder + `/${store.get("project")}/${store.get("project")}`
        if(! fs.existsSync(imgPath)){
        fs.mkdirSync( `${imgPath}`)
        }
      
        fs.mkdirSync(rootFolder + '/catalogs')
        fs.mkdirSync(rootFolder + `/catalogs/${store.get("project")}-cat`)
        fs.mkdirSync(rootFolder + `/catalogs/${store.get("project")}-cat/static`)
        fs.mkdirSync(rootFolder + `/catalogs/${store.get("project")}-cat/static/default`)
        fs.mkdirSync(rootFolder + '/inventory-lists')
        fs.mkdirSync(rootFolder + '/pricebooks')
        fs.mkdirSync(rootFolder + '/sites')
        fs.mkdirSync(rootFolder + `/sites/${store.get("project")}-site`)
    },

    copyFilesToOutputFolder : function (){
      var home = require("os").homedir();
      let rootFolder = home + `/Documents/CCDemo/data/${store.get("project")}-project`
      imgPath = path.join(home, `/Documents/CCDemo/data/images/${store.get("project")}`);
        // copy images
        fs.cpSync(imgPath, rootFolder + `/${store.get("project")}/${store.get("project")}/catalogs/${store.get("project")}-cat/static/default`, {recursive:true})
        // copy config files

        fs.writeFileSync(rootFolder + `/${store.get("project")}/${store.get("project")}/sites/${store.get("project")}-site/url-rules.xml`, urlRules().toString())
        fs.writeFileSync(rootFolder + `/${store.get("project")}/${store.get("project")}/sites/${store.get("project")}-site/cache-settings.xml`, cachesettings())
        
        fs.writeFileSync(rootFolder + `/${store.get("project")}/${store.get("project")}/sites/${store.get("project")}-site/tax.xml`, tax().toString())
        fs.writeFileSync(rootFolder + `/${store.get("project")}/${store.get("project")}/sites/${store.get("project")}-site/payment-methods.xml`, payment().toString())

    },
    
    createZipFile : function () {
      var home = require("os").homedir();
      let rootFolder = home + `/Documents/CCDemo/data/${store.get("project")}-project`
      imgPath = path.join(home, `/Documents/CCDemo/data/images/${store.get("project")}`);      
        const archiver = require('archiver');
        const output = fs.createWriteStream(home + `/Documents/CCDemo/data/siteExports/${store.get("project")}.zip`)
      
        const archive = archiver('zip', {
          zlib: { level: 9 } // Sets the compression level.
        });
      
        output.on('close', function () {
          console.log(archive.pointer() + ' total bytes');
          console.log('archiver has been finalized and the output file descriptor has closed.');
        });
      
        archive.on('error', function (err) {
          throw err;
        });
      
        archive.pipe(output);
      
        archive.directory(rootFolder + `/${store.get("project")}`, false);
        archive.finalize();
    },

    writeJsonToDisk : async function (jsonData, name){

      if(name=='prods'){
        translator = new deepl.Translator(store.get('deepLapi'))
        for(let  i=0;i<jsonData.length;i++)
        {
          // translate category name
          let cname = jsonData[i].cat;
          let langs = store.get('translate').split(':')
          let ccontent = `{"lang":"${store.get('baselocale', 'en_GB')}", "content":"${jsonData[i].cat}"}`  
          for(let i=0;i<langs.length;i++){
            if(store.get('baselocale', 'en_GB')!=langs[i]){
              let trancname = getTranslatedPhrase(cname, langs[i])
              let result = ''
              if(trancname==''){
                  result = await translator.translateText(cname, store.get('baselocale', 'en_GB').split('_')[0], langs[i].split('_')[0]);
                  ccontent = ccontent +   `,{"lang":"${langs[i]}", "content":"${result.text}"}` 
                  addTranslatedPhrase(cname, result.text, langs[i])
              }else{
                ccontent = ccontent +   `,{"lang":"${langs[i]}", "content":"${trancname}"}` 
              }
          }


          }            
          

          let cl = JSON.parse(`[${ccontent}]`)
          jsonData[i].cat = cl;

          for(let f=0;f<jsonData[i].fields.length;f++){
            switch(jsonData[i].fields[f].type){
              case "text":
                {
                  if(jsonData[i].fields[f].field=='name' || jsonData[i].fields[f].field=='longDescription' || jsonData[i].fields[f].field=='shortDescription'){
                    let content = `{"lang":"${store.get('baselocale', 'en_GB')}", "content":"${jsonData[i].fields[f].content}"}`  
                    let text = jsonData[i].fields[f].content;
                   
                    
                      if(text!=''){
                          if(store.get('translate', '')!=''){
                            
                            for(let i=0;i<langs.length;i++){
                              if(store.get('baselocale', 'en_GB')!=langs[i]){
                                const result = await translator.translateText(text, store.get('baselocale', 'en_GB').split('_')[0], langs[i].split('_')[0]);
                                content = content +   `,{"lang":"${langs[i]}", "content":"${result.text}"}` 
                              }
                            }    
                            let l = JSON.parse(`[${content}]`)

                            jsonData[i].fields[f].content=l;
                          }
                        }
                                         
  
                  }
                  break;
                }
            }            
          }
        }

      }

      var home = require("os").homedir();
      let rootFolder = home + `/Documents/CCDemo/data/${store.get("project")}-project`
        fs.writeFile(home + `/Documents/CCDemo/data/${store.get("project")}-${name}.json`, JSON.stringify(jsonData).replace('&nbsp', ' '), (error) => {
          if(error){
            console.log('Error writing JSON Data to disk', error)
          }
        })
    },
      
} 

function cachesettings(){
  return `<?xml version="1.0" encoding="UTF-8"?>
  <cache-settings xmlns="http://www.demandware.com/xml/impex/cachesettings/2013-08-15">
      <settings>
          <development>
              <static-cache-ttl>0</static-cache-ttl>
              <page-cache-enabled>false</page-cache-enabled>
          </development>
          <staging>
              <static-cache-ttl>2592000</static-cache-ttl>
              <page-cache-enabled>true</page-cache-enabled>
          </staging>
          <production>
              <static-cache-ttl>2592000</static-cache-ttl>
              <page-cache-enabled>true</page-cache-enabled>
          </production>
      </settings>
  
      <page-cache-partitions/>
  
  </cache-settings>`
}

function urlRules(){
  var rule = `<?xml version="1.0" encoding="UTF-8"?>
  <url-rules xmlns="http://www.demandware.com/xml/impex/urlrules/2012-12-01">
      <general-settings>
          <lower-case-urls>false</lower-case-urls>
          <blank-substitute>%20</blank-substitute>
          <character-replacements-enabled>false</character-replacements-enabled>
          <character-replacements-for-page-url-enabled>true</character-replacements-for-page-url-enabled>
      </general-settings>
      <locale-settings>
      <type>parameter</type>
      <parameter-name>lang</parameter-name>
  </locale-settings>
      <category-rule>[ attribute, ID ]</category-rule>
      <category-page-url-override>false</category-page-url-override>
      <category-trailing-slash>false</category-trailing-slash>
      <category-offline-url-generation>true</category-offline-url-generation>
      <category-search-refinement-url-enabled>false</category-search-refinement-url-enabled>
      <product-rule/>
      <product-page-url-override>false</product-page-url-override>
      <product-id-separator>/</product-id-separator>
      <folder-rule>[ attribute, ID ]</folder-rule>
      <folder-page-url-override>false</folder-page-url-override>
      <folder-trailing-slash>false</folder-trailing-slash>
      <folder-offline-url-generation>true</folder-offline-url-generation>
      <folder-search-refinement-url-enabled>false</folder-search-refinement-url-enabled>
      <content-rule/>
      <content-page-url-override>false</content-page-url-override>
      <content-id-separator>/</content-id-separator>
      <pipeline-trailing-slash>false</pipeline-trailing-slash>
      <pipeline-perform-redirect>false</pipeline-perform-redirect>
      <search-refinement-url-settings>
          <position>after</position>
          <segment-delimiter>slash</segment-delimiter>
          <refinements-delimiter>minus</refinements-delimiter>
          <value-delimiter>underscore</value-delimiter>
          <conflicting-value-delimiter>blank</conflicting-value-delimiter>
          <exclude-pipeline-alias-type>none</exclude-pipeline-alias-type>
          <product-name-identifier>prefn</product-name-identifier>
          <product-value-identifier>prefv</product-value-identifier>
          <content-name-identifier>crefn</content-name-identifier>
          <content-value-identifier>crefv</content-value-identifier>
      </search-refinement-url-settings>
  </url-rules>  
  `
  return rule;
}

function tax(){
  return `<?xml version="1.0" encoding="UTF-8"?>
  <tax xmlns="http://www.demandware.com/xml/impex/tax/2007-02-14">
      <tax-classes>
          <tax-class class-id="default" default="true">
              <display-name/>
              <description/>
          </tax-class>
  
      </tax-classes>
      <tax-jurisdictions>
          <tax-jurisdiction jurisdiction-id="default" default="true">
              <display-name>default</display-name>
          </tax-jurisdiction>
  
      </tax-jurisdictions>
      <tax-rates>
          <tax-rate jurisdiction-id="default" class-id="default">0.2</tax-rate>
  
      </tax-rates>
  </tax>  
  `
}
  
  function payment(){
    return `<?xml version="1.0" encoding="UTF-8"?>
    <payment-settings xmlns="http://www.demandware.com/xml/impex/paymentsettings/2009-09-15">
        <payment-method method-id="GIFT_CERTIFICATE">
            <name xml:lang="x-default">Gift Certificate</name>
            <enabled-flag>false</enabled-flag>
            <processor-id>BASIC_GIFT_CERTIFICATE</processor-id>
        </payment-method>
    
        <payment-method method-id="CREDIT_CARD">
            <name xml:lang="x-default">Credit Card</name>
            <enabled-flag>true</enabled-flag>
            <processor-id>BASIC_CREDIT</processor-id>
        </payment-method>
    
        <payment-method method-id="BANK_TRANSFER">
            <name xml:lang="x-default">Bank Transfer</name>
            <enabled-flag>true</enabled-flag>
        </payment-method>
    
        <payment-method method-id="BML">
            <name xml:lang="x-default">Bill Me Later</name>
            <enabled-flag>false</enabled-flag>
            <processor-id>CYBERSOURCE_BML</processor-id>
        </payment-method>
    
        <payment-method method-id="DW_APPLE_PAY">
            <name xml:lang="x-default">Apple Pay</name>
            <enabled-flag>false</enabled-flag>
        </payment-method>
    
        <payment-method method-id="DW_ANDROID_PAY">
            <name xml:lang="x-default">Android Pay</name>
            <enabled-flag>false</enabled-flag>
        </payment-method>
    
        <payment-method method-id="CASH">
            <name xml:lang="x-default">Cash On Collection</name>
            <enabled-flag>true</enabled-flag>
        </payment-method>
    
        <payment-card card-type="Visa">
            <name xml:lang="x-default">Visa</name>
            <enabled-flag>true</enabled-flag>
            <card-number-settings>
                <enable-checksum-verification>true</enable-checksum-verification>
                <number-length>
                    <length>13</length>
                    <length>16</length>
                </number-length>
                <number-prefix>
                    <prefix>4</prefix>
                </number-prefix>
            </card-number-settings>
            <security-code-length>3</security-code-length>
        </payment-card>
    
        <payment-card card-type="Amex">
            <name xml:lang="x-default">American Express</name>
            <enabled-flag>true</enabled-flag>
            <card-number-settings>
                <enable-checksum-verification>true</enable-checksum-verification>
                <number-length>
                    <length>15</length>
                </number-length>
                <number-prefix>
                    <prefix>34</prefix>
                    <prefix>37</prefix>
                </number-prefix>
            </card-number-settings>
            <security-code-length>4</security-code-length>
        </payment-card>
    
        <payment-card card-type="Master">
            <name xml:lang="x-default">Master Card</name>
            <enabled-flag>true</enabled-flag>
            <card-number-settings>
                <enable-checksum-verification>true</enable-checksum-verification>
                <number-length>
                    <length>16</length>
                </number-length>
                <number-prefix>
                    <prefix>2221-2720</prefix>
                    <prefix>51-55</prefix>
                </number-prefix>
            </card-number-settings>
            <security-code-length>3</security-code-length>
        </payment-card>
    
        <payment-card card-type="Discover">
            <name xml:lang="x-default">Discover</name>
            <enabled-flag>true</enabled-flag>
            <card-number-settings>
                <enable-checksum-verification>true</enable-checksum-verification>
                <number-length>
                    <length>16</length>
                </number-length>
                <number-prefix>
                    <prefix>6011</prefix>
                    <prefix>622126-622925</prefix>
                    <prefix>644-649</prefix>
                    <prefix>65</prefix>
                </number-prefix>
            </card-number-settings>
            <security-code-length>3</security-code-length>
            <countries>
                <country country-code="US"/>
            </countries>
        </payment-card>
    
    </payment-settings>
    
    `
  }

  function getTranslatedPhrase(key, lang){
    var res = translatedHistory.find((item) => 
      (item.lang==lang && item.base==key)
    )

    if(res===undefined){
      return '';
    }
  console.log('cache value :' + key + ':' + lang)
    return res.text
  }

function addTranslatedPhrase(baseText, text, language){
  translatedHistory.push({'lang':language, 'base': baseText, 'text': text})
}


