var addBut = document.getElementById('addPlp');
addBut.addEventListener("click", addPlp);

var addcatBut = document.getElementById('addnewcatbut')
addcatBut.addEventListener("click", addNewCat)

var savePlpBut = document.getElementById('savePlp');
savePlpBut.addEventListener('click', savePlp)

var catSel = document.getElementById('pcat')
catSel.addEventListener('change', catSelChanged)

var plpurl = document.getElementById('plpurl');
var curURL = 'try clicking add again';

function setCurURL(url){
    curURL = url;
    plpurl.value = url;
}

function updateid(){
    let newid = document.getElementById('newcat').value;
    document.getElementById('newcatid').value = newid.toLowerCase().replace(' ', '_');
}


async function addPlp(){
    await window.scrapesiteurl.geturl()
    document.getElementById('plp').style.display='block';
    addBut.style.display='none';
    document.getElementById('cat').selectedIndex=0;
    plpurl.value = curURL;
}

var plpMaps = []
function settingValueEnd(key, fmap){
    if(fmap ==null || fmap =='null'){return}
   
    var o = JSON.parse(fmap);
    for(var i=0;i<o.length;i++)
    {
        addMappingFromSettings(o[i])
        plpMaps.push(o[i])
    }

    if(o.length>0){
        document.getElementById('fields').style.display='';
    }
}


function addMappingFromSettings(o){
    if(o==null){return}
    var map = document.createElement("div")
    map.classList.add('plp')    


    map.innerHTML = `<span style='cursor:no-drop' onclick='deleteMap(this, "${o.url}")'>[x]</span><div class='url'>${o.url}</div><div class='cat'>${o.category}</div>`

    document.getElementById('fields').appendChild(map)

}



function catSelChanged(){
    if(catSel.value=='add'){
        document.getElementById('addnewcat').style.display='block'
    }else{
        document.getElementById('addnewcat').style.display='none'
    }
}

function deleteMap(item, selector){
    item.parentNode.style.display='none'
    let i = plpMaps.findIndex(val => val.url === selector);
    var del = plpMaps.splice(i,1)
    console.log(del)
}

function savePlp(){
    addBut.style.display='block';
    var map = document.createElement("div")
    map.classList.add('plp')

    var parentID, parentText, newCatID, newCatText = ''

    var _parentID = document.getElementById('pcat').selectedOptions[0].getAttribute('data-parent');
    var _newCatID = document.getElementById('cat').selectedOptions[0].value;

    if(_parentID && _newCatID)


    map.innerHTML = `<span style='cursor:no-drop' onclick='deleteMap(this, "${plpurl.value}")'>[x]</span><div class='url'>${plpurl.value}</div><div class='cat'>${catSel.selectedOptions[0].text}</div>`
    document.getElementById('fields').appendChild(map);
    var result = {url: plpurl.value, catId: catSel.value, category:catSel.selectedOptions[0].getAttribute('data-text'), parent:document.getElementById('pcat').selectedOptions[0].getAttribute('data-parent')}

    plpMaps.push(result);

 
}

function addNewCat(){
    var cat = document.getElementById('newcat').value;
    var catId =  document.getElementById('newcatid').value;

    if(!cat || !catId){
        alert('You need to add a Category Name and ID');
        return;
    }

    if(catSel.querySelector('[value="' + catId + '"]')){
        alert('Category ID needs to be unique');
        return;
    }

    var parentID;

    if(document.getElementById('cat').selectedOptions[0].text.indexOf('>') >= 0){
        parentID = document.getElementById('cat').selectedOptions[0].value;
    }else{
        parentID = (document.getElementById('pcat').selectedOptions[0].value)=='add'?'root':document.getElementById('pcat').selectedOptions[0].value
    }

    var opt = document.createElement("option")
    opt.value = catId;
    opt.text =(document.getElementById('cat').value=='add'? 'root' : document.getElementById('cat').value)  +  ' > (' + catId + ') ' + cat;
    opt.setAttribute('data-parent', parentID)
    opt.setAttribute('data-text', document.getElementById('newcat').value)
    opt.selected=true;
    document.getElementById('cat').add(opt)

    var opt = document.createElement("option")
    opt.value = catId;
    opt.text =(document.getElementById('cat').value=='add'? 'root' : document.getElementById('cat').value) +  ' > (' + catId + ') ' + cat;
    opt.setAttribute('data-text', document.getElementById('newcat').value)
    opt.setAttribute('data-parent', parentID)
    opt.selected=true;
    document.getElementById('pcat').add(opt);

    document.getElementById('addnewcat').style.display='none'
}

function DelSettingValue(sel){
    window.delsetting.DelSettingValue(sel);
}

function saveSetting(setting){
    window.setting.SaveSettingValue(setting)
}

var nxtBut = document.getElementById('butnxt');
nxtBut.addEventListener("click", nxtButClick)

function nxtButClick(){
    let m = {'plpurl' : plpMaps }
    saveSetting(m)
    window.scrape.initScrape();
}