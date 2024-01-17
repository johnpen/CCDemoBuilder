



function pdpSlection(sel){
    document.getElementById('fmap').style.display='block';

    startMapper(sel)
}

function fieldChanged(){
    if(cField.value=='custom'){
        document.getElementById('customfn').style.display='block'
    }
}

function test(){
    window.cssSel.testSelector(document.getElementById('selector').value)
    //setValue(document.querySelectorAll(document.getElementById('selector').value)[0].outerHtml)
}

function loadSelector(sel){
    document.getElementById('selector').value = sel;
}

function setValue(res){
    console.log(res);

    document.getElementById('selectorValue').value=res;

    switch(cType.value){
        case  'text': {
            var regex = /(<([^>]+)>)/ig
            document.getElementById('resulttxt').value=res.replace(regex, '');
            break;
        }

        case 'html' : {
            document.getElementById('resulttxt').value=res
            break;
        }

        case 'number' : {
            var resultString = res.replace(/(\d+)\.(\d+)/g, '$1.$2').replace(/[^\d.]+/g, '');
            document.getElementById('resulttxt').value=resultString;
            break;
        }

        case 'image' : {
            var regex = /<img[^>]+src=["'](.*?)["']/;
            var match = regex.exec(res);
            var firstImagePath = match ? match[1] : null;
            document.getElementById('resulttxt').value=firstImagePath;
            break;
        }

        case 'url' : {
            const linkRegex = /<a\s+(?:[^>]*?\s+)?href=["']([^"']+)["'][^>]*?>/;
            const match = res.match(linkRegex);
            document.getElementById('resulttxt').value=match[1];
            break;
        }
    }
}

async function  startMapper(sel){
    const val = await window.getValFromSelector.getVal(sel)
    console.log(val);
}


var fieldMaps = [];
function addMapping(){
    var map = document.createElement("div")
    map.style.height='70px';
    map.style.width='100%';
    map.style.overflow = 'hidden'
    document.getElementById('fields').style.display='';

    var cf = cField.value=='custom' ? document.getElementById('custFieldName').value : cField.value
    var str = `<span style='cursor:no-drop' onclick='deleteMap(this, "${cSelector.value}")'>[x]</span><span onclick='loadSelector("${cSelector.value}")'> CC Field : <b>${cf}</b>, Type: ${cType.value} <br/> ${document.getElementById('resulttxt').value} </span>` 

    map.innerHTML = str;
    document.getElementById('fields').appendChild(map)
    let setting = {field: cf, type: cType.value, selector: cSelector.value, custom: cField.value=='custom' ? 'true' : 'false'}
    fieldMaps.push(setting)
   // saveSetting(setting);

    cSelector.value = '';
    document.getElementById('resulttxt').value='';
    document.getElementById('customfn').style.display='none'
    cType.selectedIndex=0;
    cField.selectedIndex=0;
}

function addMappingFromSettings(o){
    if(o==null){return}
    fieldMaps.push(o)
    var map = document.createElement("div")
    map.style.height='70px';
    map.style.width='100%';
    map.style.overflow = 'hidden'
   // map.setAttribute('onclick','deleteMap(this, "' + o.selector + '")');

    var str = `<span style='cursor:no-drop' onclick='deleteMap(this, "${o.selector}")'>[x]</span> <span onclick='loadSelector("${o.selector}")'> CC Field : <b>${o.field}</b>, Type: ${o.type} <br/> ${o.selector} </span>` 
    map.innerHTML = str;
    document.getElementById('fields').appendChild(map)

}



function settingValueEnd(key, fmap){
    var o = JSON.parse(fmap);
    for(var i=0;i<o.length;i++)
    {
        addMappingFromSettings(o[i])
    }

    if(o.length>0){
        document.getElementById('fields').style.display='';
    }
}

function deleteMap(item, selector){
    item.parentNode.style.display='none'
    var s = {key:'fieldMapping', sel:selector};
    window.delsetting.DelSettingValue(s);

    let i = fieldMaps.findIndex(val => val.selector === selector);
    var del = fieldMaps.splice(i,1)
    console.log(del)    
}


function saveSetting(setting){
    window.setting.SaveSettingValue(setting)
}

function nxtButClick(event){
    let fmapping = {fieldMapping: fieldMaps};
    saveSetting(fmapping)

    window.getplp.StepFive()    
}




var cType = document.getElementById('ftype');
//cType.addEventListener("changed", typeChanged);

var cField = document.getElementById('cfield');
cField.addEventListener('change', fieldChanged)

var cSelector = document.getElementById('selector');
//cSelector.addEventListener("changed", selectorChanged)

var addBut = document.getElementById('addMap');
addBut.addEventListener("click", addMapping)

var nxtBut = document.getElementById('nxtButton');
nxtBut.addEventListener("click", nxtButClick)