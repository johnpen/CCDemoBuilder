const Store = require('electron-store');
const store = new Store() 
const fs = require('fs')
const mainProcess =  module.parent.exports;
var catsAdded = [];
var orderedCategories = [];
var newCats = [];
const util = require('./utils');
const { rootCertificates } = require('tls');





module.exports = {
    createSitePreferences : function(){
        var home = require("os").homedir();
        let rootFolder = home + `/Documents/CCDemo/data/${store.get("project")}-project`

        let curs = store.get("supportedcurrency", "GBP").split(':')
        let suppricebooks = ''
        for(let i=0;i<curs.length;i++){
          suppricebooks = suppricebooks + store.get("project") + '-' + curs[i]  + '-price'  + ':'
        }
      
        let xml = `<?xml version="1.0" encoding="UTF-8"?>
        <preferences xmlns="http://www.demandware.com/xml/impex/preferences/2007-03-31">
            <standard-preferences>
                <all-instances>
                    <preference preference-id="AccountNumberRetentionDays">30</preference>
                    <preference preference-id="AddProductToBasketBehavior">IncrementQuantities</preference>
                    <preference preference-id="CouponGeneratorIncludeDashes">true</preference>
                    <preference preference-id="CouponGeneratorIncludeVowels">true</preference>
                    <preference preference-id="EnableSiteOrderNumbers">false</preference>
                    <preference preference-id="IntegrationOrderCenterIncludeSite">true</preference>
                    <preference preference-id="SiteCatalog">${store.get("project")}-cat</preference>
                    <preference preference-id="SiteCurrencies">${store.get("supportedcurrency", "GBP")}</preference>
                    <preference preference-id="SiteCustomerList">${store.get("project")}</preference>
                    <preference preference-id="SiteDefaultLocale">${store.get("baselocale", "en_GB")}</preference>
                    <preference preference-id="SiteInventoryList">${store.get("project")}-inv</preference>
                    <preference preference-id="SiteLibrary">${store.get("project")}</preference>
                    <preference preference-id="SiteLocales">${store.get("translate", "en_GB")}:en:default</preference>
                    <preference preference-id="SitePriceBooks">${suppricebooks}</preference>
                    <preference preference-id="SiteTimezone">Etc/UTC</preference>
                    <preference preference-id="StorefrontOrderAccess">customer_or_session_match</preference>
                    <preference preference-id="StorefrontOrderFiltering">true</preference>
                    <preference preference-id="StorefrontURLsEnabled">true</preference>
                </all-instances>
                <development>
                    <preference preference-id="ExternallyPublishProductIndex">false</preference>
                    <preference preference-id="MergedVariationGroupsDisplayMode">false</preference>
                    <preference preference-id="RobotsTxtContent"/>
                    <preference preference-id="RobotsTxtMode">Cartridge</preference>
                </development>
                <staging>
                    <preference preference-id="ExternallyPublishProductIndex">false</preference>
                    <preference preference-id="MergedVariationGroupsDisplayMode">false</preference>
                    <preference preference-id="RobotsTxtContent"/>
                    <preference preference-id="RobotsTxtMode">Cartridge</preference>
                </staging>
                <production>
                    <preference preference-id="ExternallyPublishProductIndex">false</preference>
                    <preference preference-id="MergedVariationGroupsDisplayMode">false</preference>
                    <preference preference-id="RobotsTxtContent"/>
                    <preference preference-id="RobotsTxtMode">Cartridge</preference>
                </production>
            </standard-preferences>
            <custom-preferences>
                <all-instances/>
                <development/>
                <staging/>
                <production/>
            </custom-preferences>
        </preferences>`
      
        fs.writeFileSync (rootFolder + `/${store.get("project")}/${store.get("project")}/sites/${store.get("project")}-site/preferences.xml`, xml)
      
        let sitexml = `<?xml version="1.0" encoding="UTF-8"?>
        <site xmlns="http://www.demandware.com/xml/impex/site/2007-04-30" site-id="${store.get("project")}-site">
            <name>${store.get("project")}</name>
            <currency>GBP</currency>
            <taxation>gross</taxation>
            <custom-cartridges>app_custom_nto:plugin_ditto:plugin_lightningordermanagement:plugin_dis:plugin_cartridge_merge:plugin_commercepayments:plugin_datadownload:plugin_wishlists:plugin_giftregistry:lib_productlist:plugin_instorepickup:plugin_sitemap:plugin_applepay:plugin_sitemap:plugin_productcompare:plugin_service_cloud:int_service_cloud:app_storefront_base:int_handlerframework:app_q_pwa_support:plugin_hooktacular</custom-cartridges>
            <storefront-status>online</storefront-status>
        </site>`
      
        fs.writeFileSync (rootFolder + `/${store.get("project")}/${store.get("project")}/sites/${store.get("project")}-site/site.xml`, sitexml)  
    },
      
    shippingConfig: function(){
        var home = require("os").homedir();
        let rootFolder = home + `/Documents/CCDemo/data/${store.get("project")}-project`        
        let header = `<?xml version="1.0" encoding="UTF-8"?>
        <shipping xmlns="http://www.demandware.com/xml/impex/shipping/2007-03-31">
        <shipping-method method-id="001" default="true">
              <display-name xml:lang="x-default">default</display-name>
              <online-flag>true</online-flag>
              <price-table>
                  <amount order-value="0">0</amount>
              </price-table>
              <custom-attributes>
                  <custom-attribute attribute-id="storePickupEnabled">false</custom-attribute>
              </custom-attributes>
              <currency>GBP</currency>
          </shipping-method>
          `
      
      
            let curs = store.get("supportedcurrency", "GBP").split(':');
            let sm = '';
            for(let i=0;i<curs.length;i++){
              if(curs[i]!='GBP'){
              sm = sm + `<shipping-method method-id="001-${curs[i]}" default="true">
              <display-name xml:lang="x-default">default</display-name>
              <online-flag>true</online-flag>
              <price-table>
                  <amount order-value="0">0</amount>
              </price-table>
              <custom-attributes>
                  <custom-attribute attribute-id="storePickupEnabled">false</custom-attribute>
              </custom-attributes>
              <currency>${curs[i]}</currency>
          </shipping-method>
          `}
            }      
        
        let foot = "</shipping>"
      
        let xml = header + sm + foot;
      
      
        fs.writeFileSync (rootFolder + `/${store.get("project")}/${store.get("project")}/sites/${store.get("project")}-site/shipping.xml`, xml)
    },

    createCat : function(products){
        var home = require("os").homedir();
        let rootFolder = home + `/Documents/CCDemo/data/${store.get("project")}-project`            
        let catHeader = `<?xml version="1.0" encoding="UTF-8"?>
        <catalog xmlns="http://www.demandware.com/xml/impex/catalog/2006-10-31" catalog-id="${store.get("project")}-cat">
            <header>
                <image-settings>
                    <internal-location base-path="/"/>
                    <view-types>
                        <view-type>large</view-type>
                        <view-type>medium</view-type>
                        <view-type>small</view-type>
                        <view-type>swatch</view-type>
                        <view-type>hi-res</view-type>
                    </view-types>
                    <alt-pattern>\${productname}</alt-pattern>
                    <title-pattern>\${productname}</title-pattern>
                </image-settings>
            </header>
        
            <category category-id="root">
                <display-name xml:lang="x-default">${store.get("project")}</display-name>
                <description xml:lang="x-default">${store.get("project")}</description>
                <online-flag>true</online-flag>
                <template/>
                <page-attributes/>
                <custom-attributes>
                    <custom-attribute attribute-id="enableCompare">true</custom-attribute>
                    <custom-attribute attribute-id="showInMenu">true</custom-attribute>
                </custom-attributes>
            </category>`
        
        const catFoot = `</catalog>`
      
        let prodxml = '';
        for(let i=0;i<products.length;i++){
          prodxml = prodxml + catProduct(products[i])
        }
      
        prodxml = catHeader + getCategory(products) + prodxml + getMappings(products) + catFoot;
      
        fs.writeFileSync (rootFolder + `/${store.get("project")}/${store.get("project")}/catalogs/${store.get("project")}-cat/${store.get("project")}-cat.xml`, prodxml)
    },
      
    createInventory : function (products){
        var home = require("os").homedir();
        let rootFolder = home + `/Documents/CCDemo/data/${store.get("project")}-project`            
        let header = `<?xml version="1.0" encoding="UTF-8"?>
        <inventory xmlns="http://www.demandware.com/xml/impex/inventory/2007-05-31">
            <inventory-list>
                <header list-id="${store.get("project")}-inv">
                    <default-instock>false</default-instock>
                    <use-bundle-inventory-only>false</use-bundle-inventory-only>
                    <on-order>false</on-order>
                </header>
                <records>
        `
      
        let footer = `</records>
        </inventory-list>
        </inventory>
        `
        //          <allocation-timestamp>${dt}</allocation-timestamp>
        let d =  new Date(Date.now()- 86400000);
        let dt = util.isoDate(d)
        let invxml = '';
        for(let i=0;i<products.length;i++){
          let stock = util.randomIntFromInterval(0,1000)
          let prod = products[i];
          let id = (prod.fields.find(item => item.field === 'ID') != undefined ? prod.fields.find(item => item.field === 'ID').content : '');
          invxml = invxml + `<record product-id="${id}">
          <allocation>${stock}</allocation>

          <perpetual>false</perpetual>
          <preorder-backorder-handling>none</preorder-backorder-handling>
          <ats>${stock}</ats>
          <on-order>0</on-order>
          <turnover>0</turnover>
      </record>
      `
        }  
      
        fs.writeFileSync (rootFolder + `/${store.get("project")}/${store.get("project")}/inventory-lists/${store.get("project")}-inv.xml`, header + invxml + footer)
    },
      
    createPriceBook :  function(currency, rate, products){
        var home = require("os").homedir();
        let rootFolder = home + `/Documents/CCDemo/data/${store.get("project")}-project`            
    let header = `<?xml version="1.0" encoding="UTF-8"?>
    <pricebooks xmlns="http://www.demandware.com/xml/impex/pricebook/2006-10-31">
        <pricebook>
            <header pricebook-id="${store.get("project")}-${currency}-price">
                <currency>${currency}</currency>
                <display-name xml:lang="x-default">${store.get("project")}-${currency}</display-name>
                <online-flag>true</online-flag>
            </header>

            <price-tables>
    `

    let footer = `        </price-tables>
            </pricebook>
        </pricebooks>

    `
    let pricexml = '';
    for(let i=0;i<products.length;i++){
    let stock = util.randomIntFromInterval(0,1000)
    let prod = products[i];
    let id = (prod.fields.find(item => item.field === 'ID') != undefined ? prod.fields.find(item => item.field === 'ID').content : '');
    let price = (prod.fields.find(item => item.field === 'price') != undefined ? prod.fields.find(item => item.field === 'price').content : '');

    if(rate!=1){
        price = price * rate;
        price = price.toFixed(2)
    }

    pricexml = pricexml + `
    
    <price-table product-id="${id}">
    <amount quantity="1">${price}</amount>
    </price-table>

    `
    }    


    fs.writeFileSync (rootFolder + `/${store.get("project")}/${store.get("project")}/pricebooks/${store.get("project")}-${currency}-price.xml`, header + pricexml + footer)
    }    
}

function getMappings(products){
    let resString="";
    for(let i=0;i<products.length;i++){
      let id = (products[i].fields.find(item => item.field === 'ID') != undefined ? products[i].fields.find(item => item.field === 'ID').content : '');
      resString = resString + `
      <category-assignment category-id="${products[i].catid}" product-id="${id}">
          <primary-flag>true</primary-flag>
      </category-assignment>    
      `;
    }
  
    return resString;
}


function getTextVals(txt, key){
    let s = ''
    if(typeof txt==='object'){
        s = `<${key} xml:lang="x-default">${txt[0].content}</${key}>`
        for(let i=0;i<txt.length;i++)
        {
            s = s + `<${key} xml:lang="${txt[i].lang.replace('_', '-')}">${txt[i].content}</${key}>`
        }
    }
    else{
        return `<${key} xml:lang="x-default">${txt}</${key}>`
    }
    return s;
}


function  catProduct(prod) {
    let id = (prod.fields.find(item => item.field === 'ID') != undefined ? prod.fields.find(item => item.field === 'ID').content : '');

    let name = (prod.fields.find(item => item.field === 'name')  != undefined ? prod.fields.find(item => item.field === 'name').content : '')
    let sdescription = (prod.fields.find(item => item.field === 'shortDescription')  != undefined ? prod.fields.find(item => item.field === 'shortDescription').content : '')
    let ldescription = (prod.fields.find(item => item.field === 'longDescription') != undefined ? prod.fields.find(item => item.field === 'longDescription').content : '')
  




    let prodString = `
      <product product-id="${id}">
      <ean/>
      <upc/>
      <unit/>
      <unit-quantity>0</unit-quantity>
      <min-order-quantity>1</min-order-quantity>
      <step-quantity>1</step-quantity>
      ${getTextVals(name, 'display-name')}
      ${getTextVals(sdescription, 'short-description')}
      ${getTextVals(ldescription, 'long-description')}
      <online-flag>true</online-flag>
      <available-flag>false</available-flag>
      <searchable-flag>true</searchable-flag>
      <searchable-if-unavailable-flag>true</searchable-if-unavailable-flag>
      <images>
        ${getImages(prod)}
      </images>
      <brand>food</brand>
      <page-attributes/>
      <pinterest-enabled-flag>false</pinterest-enabled-flag>
      <facebook-enabled-flag>false</facebook-enabled-flag>
    
      </product>
      `
    return prodString;
  //  ${getCustomAttrs(prod)}
}

function getCustomAttrs(prod)
{
  let atts = '';
  for(let i=0;i<prod.fields.length;i++) 
  {
    if(prod.fields[i].custom)
    {
      let d = prod.fields[i].content;
      let fname = prod.fields[i].field;
      atts = atts + `<custom-attribute attribute-id="${fname}">${d}</custom-attribute>`
    }
  }

  if(atts=='')
  {
    return '';
  }


  return '<custom-attributes>' + atts + '</custom-attributes>'
}

function getImages(prod){
    let img = '';
    let imgfile = ''
    for(let i=0;i<prod.fields.length;i++) {
      if(prod.fields[i].type=='image')
      {
        imgfile = prod.fields[i].imageName;
        img = img + `<image path="${imgfile}"/>`
      }
    }


    let imgs = `
    <image-group view-type="hi-res">
      ${img}
    </image-group>
    <image-group view-type="large">
      ${img}
    </image-group>
    <image-group view-type="medium">
      ${img}
    </image-group>
    <image-group view-type="small">
      ${img}
    </image-group>
    <image-group view-type="swatch">
      ${img}
    </image-group>  
    `
  return imgs;
  
  }

function catAlreadyAdded(cat) {
return orderedCategories.some((item) => item.id === cat);
}

function orderCats(parent) {
let chldItems = catsAdded.filter((item) => item.parent === parent);
for (let a = 0; a < chldItems.length; a++) {
    orderedCategories.push(chldItems[a]);
}
}

function hasParent(parent){
return catsAdded.some((item) => item.id === parent) || newCats.some((item) => item.id === parent) ;
}

function addRootToList(parentName){
if(! catsAdded.some((item) => item.id === parentName) )
{
    catsAdded.push({id:parentName, parent:'root', cat:parentName}); 
}

if(newCats.some((item) => item.id === parentName)){
    newCats.push({id:parentName, parent:'root', cat:parentName}); 
}
}

function getCategory(products){
let catTemplate =''

for(let i=0;i<products.length;i++){
    if(!catsAdded.some(item=>item.id===products[i].catid)){
    catsAdded.push({id:products[i].catid, parent:products[i].parent, cat:products[i].cat}); 
    }
}  



for (let i = 0; i < catsAdded.length; i++) {
    if (!hasParent(catsAdded[i].parent)) {
    addRootToList(products[i].parent);
    }
}

orderCats("root");

for (let i = 0; i < catsAdded.length; i++) {
    if (!catAlreadyAdded(catsAdded[i].id)) {
    orderCats(catsAdded[i].parent);
    }
}  

for(let i=0;i<orderedCategories.length;i++){

catTemplate = catTemplate + `<category category-id="${orderedCategories[i].id}">
${getTextVals(orderedCategories[i].cat, 'display-name')}
<online-flag>true</online-flag>
<parent>${orderedCategories[i].parent}</parent>
<template/>
<page-attributes>
    ${getTextVals(orderedCategories[i].cat, 'page-title')}
</page-attributes>
<custom-attributes>
    <custom-attribute attribute-id="showInMenu">true</custom-attribute>
</custom-attributes>
</category>`     
}

return catTemplate;
}  