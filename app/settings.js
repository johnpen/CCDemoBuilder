const Store = require('electron-store');
const store = new Store()
const mainProcess =  module.parent.exports;

module.exports = {
    delSetting : function(event, key){
        store.delete(key)    
    },

    delSettingKey : function(key){
        store.delete(key)    
    },

    saveSetting : function(event, setting, single=false){
        return store.set(setting)
    },

    saveSettingObj : function(setting){
        return store.set(setting)
    },

    saveSettingVal : function(setting, value){
        if(typeof setting==='object'){
            return store.set(value)
        }

        if(value==null || value == undefined)
        {
            if(typeof value==='object'){
                return store.set(setting)
            }
        }
        return store.set(setting, value)
    },
    
    getSetting : function(key, defaultVal){
        if(typeof key==='object'){
            return store.get(defaultVal)
        }
        return store.get(key, defaultVal)
    }
}