function setStep(){}

var log = document.getElementById('stepLog');

function pdpScrapeFinished(c){
    var logEntry = htmlToElements("<div class='logentry'><b>Completed Scraping PDP Pages, total of  " + c  + " Products Scraped</b></div>");
    log.insertBefore(logEntry, log.children[0])
}

function showUI(){
    document.getElementById('datagrid').style.display='';
    document.getElementById('resulTitle').style.display='';    
}

function toggleLog(){
    if(document.getElementById('stepLog').style.display=='none'){
        document.getElementById('stepLog').style.display='';
    }else{
        document.getElementById('stepLog').style.display='none';
    }
}

function pdpMessage(c){
    var logEntry = htmlToElements("<div class='logentry'>" + c  + "</div>");
    log.insertBefore(logEntry, log.children[0])
}

function downloadImageMessage(c){
    var logEntry = htmlToElements("<div class='logentry'>" + c  + "</div>");
    log.insertBefore(logEntry, log.children[0])
}

function plpScrapeResult(url, category, catId, parent){
    var logEntry = htmlToElements("<div class='logentry'>Found Product Page: " + url + " </div>");
    log.insertBefore(logEntry, log.children[0])
}

function plpStartScrape(url)
{
    var logEntry = htmlToElements("<div class='logentry'><b>Scraping PLP Page: " + url + "</b></div>");
    log.insertBefore(logEntry, log.children[0])
}

function plpScrapeResultCount(c)
{
    var logEntry = htmlToElements("<div class='logentry'>Finished Scraping PLP Page: " + c + " Products Found</div>");
    log.insertBefore(logEntry, log.children[0])
}

function pdpStartScrape(url){
    var logEntry = htmlToElements("<div class='logentry'>Scraping PDP Page: " + url + "</div>");
    log.insertBefore(logEntry, log.children[0])
}

function scrapePaused(){
    document.getElementById('startBut').style.display='';
}




function htmlToElements(html) {
    var template = document.createElement('template');
    html = html.trim(); // Never return a text node of whitespace as the result
    template.innerHTML = html;
    return template.content.firstChild;
}

/*
DATA GRID
*/

const datacolumnDefs = [
    { field: "LNK",
    cellRendererSelector: (params) => {
        const linkRenderer = {
          component: LinkRenderer,
        }
        return linkRenderer
    
    }
    },
    { field: "CatID", resizable: true },
    { field: "Category", resizable: true },
    { field: "Parent" , resizable: true}
  ];

  const datarowData = [

  ];

function mapFieldsToGrid(fmap){
    for(var i=0;i<fmap.length;i++){
        if(fmap[i]!=null){
      //  if(fmap[i].name=='fieldMapping'){
            if(fmap[i].type=='image'){
                datacolumnDefs.push(
                    {
                        field:fmap[i].field, 
                        resizable: true, 
                        editable: true,
                        cellRendererSelector: (params) => {
                            const imageRenderer = {
                                component: ImageRenderer,
                            } 
                            return imageRenderer}
                    }
                )
                datacolumnDefs.push(
                    {
                        field:fmap[i].field+'_name',
                        hide:true
                    }
                )
                

            }else{
                datacolumnDefs.push({field:fmap[i].field, resizable: true})
            }

       // }
    }
    }


    const datagridDiv =  document.querySelector('#datagrid')
    new agGrid.Grid(datagridDiv, datagridOptions);
    datasizeToFit()    
}

function datasizeToFit() {
    datagridOptions.api.sizeColumnsToFit({
      defaultMinWidth: 40,
      columnLimits: [{ key: 'URL', minWidth: 40 }],
    });
  }

function pdpAddProduct(prod){
    var p = `[{"LNK":"${prod.url}", "URL":"${prod.url}", "CatID":"${prod.catid}", "Category":"${prod.cat}", "Parent":"${prod.parent}" `;
    for(let i=0; i<prod.fields.length;i++){
        if(prod.fields[i].type=='image'){
            p = p + `, "${prod.fields[i].field}": "${prod.fields[i].content}", "${prod.fields[i].field}_name": "${prod.fields[i].imageName}"`
        }else{
            p = p + `, "${prod.fields[i].field}": "${htmlDecode(prod.fields[i].content)}"`
        }
    }

    p = p + "}]"

    datagridOptions.api.applyTransaction({
        add: JSON.parse(p)
      });    

    var row = gridOptions.api.getRowNode(prod.url);
    row.setDataValue('Complete', "true")
}

function htmlDecode(input) {
    let doc = new DOMParser().parseFromString(input, "text/html");
    return doc.documentElement.textContent;
  }

/*
GRID
*/

class ImageRenderer{
    eGui; a; p;

    init(params){
        this.eGui = document.createElement('img');
        this.eGui.src = params.value;
        this.eGui.setAttribute('width', 50)
        this.eGui.setAttribute('height', 50)

        this.a = document.createElement('a');
        this.a.href = params.value;
        this.a.setAttribute('target', '_blank');
        this.a.appendChild(this.eGui);
    }

    getGui(){
        return this.a;
    }

    refresh(params)
    {
        return false;
    }
}


class LinkRenderer {
    eGui;
  
    init(params) {
      this.eGui = document.createElement('a');
      this.eGui.href = params.value
      this.eGui.setAttribute('target', '_blank');
      this.eGui.innerText = '⚓';
    }
  
    getGui() {
      return this.eGui;
    }
  
    refresh(params) {
      return false;
    }
  }

function addPdpRow(pdpRow) {
    gridOptions.api.applyTransaction({
      add: pdpRow
    });
  }

function deleteRows(){
gridOptions.api.applyTransaction(
    {remove: gridOptions.api.getSelectedRows()}
    )
}

const columnDefs = [
    {   
        field: "LNK",
        cellRendererSelector: (params) => {
            const linkRenderer = {
            component: LinkRenderer,
            }
            return linkRenderer
        
        }    
    },
    { field: "URL", resizable: true, width: 40,  filterParams: {
        filterOptions: ['startsWith', 'contains', 'notContains'],
        debounceMs: 200,
        maxNumConditions: 3
    },     editable: true, 
    cellEditor: 'agTextCellEditor'  },
    { field: "CatID", resizable: true },
    { field: "Category", resizable: true },
    { field: "Parent" , resizable: true},
    { field: "Complete", resizable: false, headerName:'', hide:true}
  ];

  const rowData = [

  ];

  function sizeToFit() {
    gridOptions.api.sizeColumnsToFit({
      defaultMinWidth: 40,
      columnLimits: [{ key: 'URL', minWidth: 700 }],
    });
  }

  const datagridOptions = {
    defaultColDef: {
        flex: 1,
        sortable: true
      },    
    columnDefs: datacolumnDefs,
    rowData: rowData
  };  


  // let the grid know which columns and what data to use
const gridOptions = {
    defaultColDef: {
        flex: 1,
        sortable: true,
        filter: true
      },    
    columnDefs: columnDefs,
    rowData: rowData,
    rowSelection: 'multiple',
    
    rowClassRules: {
        'finished' : (params) => {
            if(params.data.Complete=='true'){
                return true
            }
        }
      }   , 
    rowMultiSelectWithClick:true,
    getRowId: params => params.data.LNK,

  onSelectionChanged: onSelectionChanged
  };
  
  // setup the grid after the page has finished loading
  document.addEventListener('DOMContentLoaded', () => {
    const gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);

    sizeToFit()
  });

var rowcount = -1;

  function onSelectionChanged(){
    if(rowcount==-1){
        rowcount=gridOptions.api.rowModel.getRowCount();
    }
    if( gridOptions.api.getSelectedRows().length > 0){
        document.getElementById('delBut').style.display='';
    }else{
        document.getElementById('delBut').style.display='none';
    }
  }

  function continueScrape(){
    if(gridOptions.api.rowModel.getRowCount()==rowcount){
        window.restartscrape.restartScrape()
    }
    else{
        var rows = getAllRows();
        window.restartscrape.restartScrape(rows)

    }
}  


function getAllRows(){
        let allRows = [];
        gridOptions.api.forEachNodeAfterFilter((rowNode) => allRows.push(rowNode.data));
        return allRows;
}