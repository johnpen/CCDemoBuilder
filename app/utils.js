module.exports = {
    randomIntFromInterval : function (min, max) { // min and max included 
        return Math.floor(Math.random() * (max - min + 1) + min)
    },    

    isoDate : function (d)  {
        return  d.getFullYear()+ "-" + ("00" + (d.getMonth() + 1)).slice(-2) + "-" +("00" + d.getDate()).slice(-2)+"T"+ ("00" + d.getHours()).slice(-2) + ":" +("00" + d.getMinutes()).slice(-2) + ":" + ("00" + d.getSeconds()).slice(-2) + "Z"
    },

    getFileName : function(urlstring){
        if (urlstring.endsWith("/")) {
          urlstring = urlstring.slice(0, urlstring.length - 1);
        }
        return (urlstring.slice(urlstring.lastIndexOf("/") + 1));  
    },

    newFileName : function(filename, filenames){
        if (filenames.filter((f) => f ==filename).length === 0)  {
          return filename;
        }else{
          if(filename.indexOf('.' > 0)){
            var ext = filename.split('.')[1];
            var fil = filename.split('.')[0];
            filename = fil + '_' + filenames.filter((f) => f ==filename).length + ext;
          }else{
            filename = filename + '_' + filenames.filter((f) => f ==filename).length;
          }
        }
      
        return filename;
    }    
}