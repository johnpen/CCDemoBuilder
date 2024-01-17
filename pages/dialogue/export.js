var restartBut = document.getElementById('restart');
restartBut.addEventListener("click", restartClick)    

var expBut = document.getElementById('export');
expBut.addEventListener("click", exportClick)

function restartClick(){
window.close()
}

function exportClick(){
    window.Export.gotoExport();
    window.close();
}