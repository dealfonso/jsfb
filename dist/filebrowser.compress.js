/* Copyright 2024 Carlos A. (https://github.com/dealfonso); License: http://www.apache.org/licenses/LICENSE-2.0 */
!function(exports){void 0===exports&&(exports=window);class FBDropdown{static defaults={closeOnOutsideClick:!0,openingSide:"auto",openingSideToPage:!1};extractOptions(){var e,t={};for(e in FBDropdown.defaults)void 0!==this.dropdown.dataset[e]&&(t[e]=this.dropdown.dataset[e]);return t}constructor(e,t={}){if(void 0!==e._fbDropdown)return e._fbDropdown;this.dropdown=e;t=Object.assign({},FBDropdown.defaults,this.extractOptions(),t);this.options=t,this.toggle=e.querySelector(".fb-dropdown-toggle"),this.content=e.querySelector(".fb-dropdown-content"),this.isOpen=!1,this.documentClickHandler=this.options.closeOnOutsideClick?e=>{this.dropdown.contains(e.target)||this.hide()}:null,this.optionsInMenu=e.querySelectorAll(".fb-dropdown-content"),this.closeHandler=e=>{this.hide(),e.stopPropagation()},this.toggle.addEventListener("click",e=>{this.toggleOpen(),e.stopPropagation()}),this.optionsInMenu.forEach(e=>{e.addEventListener("click",this.closeHandler)}),this.options.closeOnOutsideClick&&document.addEventListener("click",this.documentClickHandler),e._fbDropdown=this}show(){let e=!1;switch(this.options.openingSide){case"left":e=!0;break;case"right":e=!1;break;default:var t=(this.options.openingSideToPage?document.body:this.dropdown.parentElement).getBoundingClientRect(),i=this.toggle.getBoundingClientRect(),s=(this.content.style.removeProperty("right"),this.content.style.removeProperty("left"),this.content.style.removeProperty("top"),this.content.style.removeProperty("bottom"),this.content.getBoundingClientRect());t.right-(i.left+s.width)<i.right-s.width-t.left&&(e=!0)}e&&(this.content.style.right="0"),this.content.classList.add("show"),this.isOpen=!0}hide(){this.content.classList.remove("show"),this.isOpen=!1}toggleOpen(){this.isOpen=!this.isOpen,this.isOpen?this.show():this.hide()}}FBDropdown.version="1.0.0",void 0===exports&&(exports=window);class FileBrowser{static extensionToIcon={txt:"fas fa-file-alt",pdf:"fas fa-file-pdf",doc:"fas fa-file-word",docx:"fas fa-file-word",xls:"fas fa-file-excel",xlsx:"fas fa-file-excel",ppt:"fas fa-file-powerpoint",pptx:"fas fa-file-powerpoint",jpg:"fas fa-file-image",jpeg:"fas fa-file-image",png:"fas fa-file-image",gif:"fas fa-file-image",mp3:"fas fa-file-audio",wav:"fas fa-file-audio",mov:"fas fa-file-video",mp4:"fas fa-file-video",avi:"fas fa-file-video",zip:"fas fa-file-archive",rar:"fas fa-file-archive",tar:"fas fa-file-archive",gz:"fas fa-file-archive","7z":"fas fa-file-archive",exe:"fas fa-file-executable",js:"fas fa-file-code",css:"fas fa-file-code",html:"fas fa-file-code",html:"fas fa-file-code",php:"fas fa-file-code",py:"fas fa-file-code",java:"fas fa-file-code",c:"fas fa-file-code",cpp:"fas fa-file-code",h:"fas fa-file-code",hpp:"fas fa-file-code",json:"fas fa-file-code",xml:"fas fa-file-code",csv:"fas fa-file-excel",file:"fas fa-file",md:"fas fa-file-alt"};static defaultOptions={mode:"list",orderColumn:"filename",orderAscending:!0,hideZeroSize:!0,allowDuplicates:!1,separateFoldersFromFiles:!0,onFileClick:e=>{},onFileDoubleClick:e=>{},overlayGenerator:e=>null,onHtmlCreated:(e,t,i)=>{},onFileDownload:null,onFileDelete:null,onFileRename:null,onFileCopy:null,onFileMove:null,onFileShare:null,onFileInfo:null,extensionToIcon:FileBrowser.extensionToIcon,customContextMenu:null};static mutationObserver=new MutationObserver(e=>{FileBrowser.fromDOM(document.querySelectorAll(".fb-filebrowser"))});static fromDOM(e,i={}){let s=[];if(e instanceof Element)e=[e];else if(e instanceof NodeList)e=Array.from(e);else if(!Array.isArray(e))throw new Error("Invalid type of objects");return 0===e.length?null:(e.forEach(e=>{let t=e._fbFileBrowser??null;null===t&&(t=new FileBrowser(e,i)),s.push(t)}),1===e.length?s[0]:s)}constructor(e,t={}){if(!(e instanceof Element)){if("string"!=typeof e)throw new Error("Invalid element");e=document.querySelector(e)}if(void 0!==e._fbFileBrowser)return e._fbFileBrowser.updateOptions(t),e._fbFileBrowser;var i=FileBrowser._optionsFromDOM(e,FileBrowser.defaultOptions,"fb"),i=(this.options=Object.assign({},FileBrowser.defaultOptions,i,t),this.mode=null,this.filelist=[],this._elementsPlace=null,this._htmlElement=e,this._evaluateOptions(),e._fbFileBrowser=this,e.querySelectorAll("fb-file")),t=Array.from(i).map(e=>{var t=FileBrowser._optionsFromDOM(e,{filename:"",size:0,modified:null,isDirectory:!1,type:"file",previewUrl:null,icon:null,data:null},"fb");return Object.assign({},{filename:e.textContent,size:0,modified:null},t)});this.render(),t.forEach(e=>{e.isDirectory?this.addFolder(e.filename,e.modified,e):this.addFile(e.filename,e.size,e.modified,e)})}updateOptions(e,t=!1){this.options=t?Object.assign({},FileBrowser.defaultOptions,e):Object.assign({},this.options,e),this._evaluateOptions(),this.render()}_setMode(e){switch(e.toLowerCase()){case"list":case"grid":case"preview":this.mode=e;break;default:throw new Error("Invalid mode")}}_addFile(t,e={}){if(!this.options.allowDuplicates&&void 0!==this.filelist.find(e=>e.filename===t))throw new Error("File already exists");t=""+t,e=Object.assign({},{contextMenu:this.options.customContextMenu,icon:e.isDirectory?"fa-regular fa-folder":this._filenameToIcon(t),type:t.split(".").pop().toLowerCase(),onFileClick:this.options.onFileClick,onFileDoubleClick:this.options.onFileDoubleClick},e);var e=new FileInFileBrowser(t,e),i=this._findNextFile(e);return null!==i?(this.filelist.splice(this.filelist.indexOf(i),0,e),this._placeFile(this._renderFile(e),i)):(this.filelist.push(e),this._placeFile(this._renderFile(e))),e}addFile(e,t,i,s={}){return this._addFile(e,Object.assign({},s,{isDirectory:!1,size:t,modified:i}))}addOrUpdateFile(e,t={}){var i=this.findFile(e);if(t=Object.assign({},t,{isDirectory:!1,type:e.split(".").pop().toLowerCase()}),null===i)return this.addFile(e,0,new Date,t);if(i.isDirectory)throw new Error("Existing file is not a file");return this.updateFile(e,t)}updateFile(e,t={}){e=this.findFile(e);if(null===e)throw new Error("File not found");return e._htmlElement,e.update(t),this.render(),e}addFolder(e,t,i={}){return this._addFile(e,Object.assign({},{icon:"fa-regular fa-folder",size:null},i,{isDirectory:!0,modified:t}))}updateFolder(e,t={}){if(null===this.findFile(e))throw new Error("Folder not found");return this.addOrUpdateFolder(e,t)}addOrUpdateFolder(e,t={}){t=Object.assign({},t,{isDirectory:!0,type:"folder"});var i=this.findFile(e);if(null===i)return this.addFolder(e,new Date,t);if(i.isDirectory)return i.update(t),this.render(),i;throw new Error("Existing file is not a folder")}findFile(t){var e=this.filelist.find(e=>e.filename===t);return void 0===e?null:e}findFiles(e){let t=new RegExp(e.replace(/\*/g,".*").replace(/\?/g,"."),"i");return this.filelist.filter(e=>t.test(e.filename))}removeFile(e){if(e instanceof FileInFileBrowser){var t=this.filelist.indexOf(e);0<=t&&this.filelist.splice(t,1)}else if("string"==typeof e){t=this.getFiles(e);if(0===t.length)return;t.forEach(e=>{e=this.filelist.indexOf(e);0<=e&&this.filelist.splice(e,1)})}this.render()}forEachFile(e){this.filelist.forEach(e),this.render()}render(e=null){null!==e&&this._setMode(e),this._htmlElement.innerHTML="";let t=null;switch(this.mode){case"list":t=this._createList();break;case"grid":t=this._createGrid();break;case"preview":t=this._createPreview()}if(this._renderFiles(),this._htmlElement.appendChild(t),"list"===this.mode){var i=new ResizableColumnTable(t,{sortableHeaders:!0,onSort:(e,t)=>{switch(e.textContent.trim().toLowerCase()){case"name":this.sort("filename","asc"==t);break;case"size":this.sort("size","asc"==t);break;case"modified":this.sort("modified","asc"==t)}}});switch(this.options.orderColumn){case"filename":i.setOrder(0,this.options.orderAscending?"asc":"desc");break;case"size":i.setOrder(1,this.options.orderAscending?"asc":"desc");break;case"modified":i.setOrder(2,this.options.orderAscending?"asc":"desc")}}}sort(e,t){var i=this._getSortFunction(e,t);this.options.orderColumn=e,this.options.orderAscending=t,this.filelist.sort(i),this._elementsPlace.innerHTML="",this._renderFiles()}clear(){this.filelist=[],this.render()}static _optionsFromDOM(e,t={},i="fb"){var s,n={};for(s in t){var o=i+s[0].toUpperCase()+s.slice(1);void 0!==e.dataset[o]&&("true"===(o=e.dataset[o])||"false"===o?n[s]="true"===o:isNaN(parseFloat(o))||parseFloat(o).toString()!=o?n[s]=o:n[s]=parseFloat(o))}return n}_generateContextMenu(){var e={};return this.options.onFileDownload instanceof Function&&(e.download={label:"Download",handler:this.options.onFileDownload}),this.options.onFileDelete instanceof Function&&(e.delete={label:"Delete",handler:this.options.onFileDelete}),this.options.onFileRename instanceof Function&&(e.rename={label:"Rename",handler:this.options.onFileRename}),this.options.onFileCopy instanceof Function&&(e.copy={label:"Copy",handler:this.options.onFileCopy}),this.options.onFileMove instanceof Function&&(e.move={label:"Move",handler:this.options.onFileMove}),this.options.onFileShare instanceof Function&&(e.share={label:"Share",handler:this.options.onFileShare}),this.options.onFileInfo instanceof Function&&(e.info={label:"Info",handler:this.options.onFileInfo}),0<Object.keys(e).length?(e.__generated=!0,e):null}_evaluateOptions(){if(this._setMode(this.options.mode),this.options.onHtmlCreated=this.options.onHtmlCreated?.bind(this),["onFileClick","onFileDoubleClick","onFileDownload","onFileDelete","onFileRename","onFileCopy","onFileMove","onFileShare","onFileInfo"].forEach(e=>{this.options[e]=covertCallback(this.options[e],this)}),null!==this.options.customContextMenu&&!this.options.customContextMenu.__generated||(this.options.customContextMenu=this._generateContextMenu()),null===(this.options.extensionToIcon??null)&&(this.options.extensionToIcon={}),"object"!=typeof this.options.extensionToIcon)throw new Error("Invalid extensionToIcon")}_placeFile(e,t=null){return null!==t?t._htmlElement.insertAdjacentElement("beforebegin",e._htmlElement):this._elementsPlace.appendChild(e._htmlElement),e}_renderFile(e){let t=null;switch(this.mode){case"list":t=e.tableRow();break;case"grid":t=e.gridElement(this.options.overlayGenerator);break;case"preview":t=e.previewElement(this.options.overlayGenerator)}return this.options.hideZeroSize&&0===e.size&&(t.querySelector(".fb-file-size").innerHTML=""),this.options.onHtmlCreated?.call(this,t,e,this.mode),e}_getDirectoryAndShowFirstComparisonFunctions(){return this.options.separateFoldersFromFiles?function(e,t){return e.isDirectory&&!t.isDirectory?-1:!e.isDirectory&&t.isDirectory?1:e.showFirst&&!t.showFirst?-1:!e.showFirst&&t.showFirst?1:0}:function(e,t){return e.showFirst&&!t.showFirst?-1:!e.showFirst&&t.showFirst?1:0}}_getSortFunction(e=null,t=null){null===e&&(e=this.options.orderColumn),null===t&&(t=this.options.orderAscending);let s=null,n=this._getDirectoryAndShowFirstComparisonFunctions();switch(e){case"filename":s=(e,t)=>e.filename.localeCompare(t.filename);break;case"size":s=(e,t)=>e.size-t.size;break;case"modified":s=(e,t)=>null===e.modified?-1:null===t.modified?1:e.modified.getTime()-t.modified.getTime();break;case"type":s=(e,t)=>e.type.localeCompare(t.type);break;default:throw new Error("Invalid column")}let o=t?1:-1;return(e,t)=>{var i=n(e,t);return 0!==i?i:o*s(e,t)}}_findNextFile(t){var i=this._getSortFunction();if(0!=this.filelist.length)for(let e=0;e<this.filelist.length;e++)if(i(t,this.filelist[e])<0)return this.filelist[e];return null}_filenameToIcon(e){e=e.split(".").pop().toLowerCase();return this.options.extensionToIcon instanceof Function?this.options.extensionToIcon(e):e in this.options.extensionToIcon?this.options.extensionToIcon[e]:this.options.extensionToIcon[""]||"far fa-file"}_createGrid(){var e=document.createElement("div");return e.classList.add("fb-grid"),this._elementsPlace=e}_createPreview(){var e=document.createElement("div");return e.classList.add("fb-preview"),this._elementsPlace=e}_createList(){var e=document.createElement("div");return e.classList.add("fb-list"),e.innerHTML=`
        <table>
            <thead>
                <tr>
                    <th class="fb-file-name">Name</th>
                    <th class="fb-file-size">Size</th>
                    <th class="fb-file-modified">Modified</th>
                </tr>
            </thead>
            <tbody></tbody>
        </table>
        `,this._elementsPlace=e.querySelector("tbody"),e}_renderFiles(){this.filelist.forEach(e=>{this._placeFile(this._renderFile(e))})}}FileBrowser.version="1.0.3",document.addEventListener("DOMContentLoaded",()=>{FileBrowser.mutationObserver.observe(document.body,{childList:!0,subtree:!0}),FileBrowser.fromDOM(document.querySelectorAll(".fb-filebrowser"))}),exports.FileBrowser=FileBrowser,void 0===exports&&(exports=window);class FileInFileBrowser{static defaultOptions={size:0,modified:null,icon:"fa fa-file",type:"file",isDirectory:!1,showFirst:!1,previewUrl:null,onFileClick:null,onFileDoubleClick:null,data:null,contextMenu:null};constructor(e,t={}){t=Object.assign({},FileInFileBrowser.defaultOptions,t),this.update(t),this.filename=e,this.selected=!1,this._htmlElement=null}_setModified(e){var t;null===e?this.modified=null:(("string"==typeof e||e instanceof String)&&(isNaN(e)?"Invalid Date"!==(t=new Date(e)).toString()&&(e=t):e=parseInt(e)),(e=("number"==typeof e||e instanceof Number)&&"Invalid Date"!==(t=new Date(e)).toString()?t:e)instanceof Date&&(this.modified=e))}update(e={}){var t;for(t of Object.keys(FileInFileBrowser.defaultOptions))void 0!==e[t]&&("modified"===t?this._setModified(e[t]):this[t]=e[t]);this.isDirectory=e.isDirectory??!1}select(){this.selected=!0,this._htmlElement&&this._htmlElement.classList.add("selected")}unselect(){this.selected=!1,this._htmlElement&&this._htmlElement.classList.remove("selected")}toggleSelect(){this.selected?this.unselect():this.select()}insertBefore(e){null!==this._htmlElement&&null!==e._htmlElement&&e._htmlElement.insertAdjacentElement("beforebegin",this._htmlElement)}insertAfter(e){null!==this._htmlElement&&null!==e._htmlElement&&e._htmlElement.insertAdjacentElement("afterend",this._htmlElement)}createContextMenu(){if(null===this.contextMenu)return null;var e,t=document.createElement("div"),i=(t.classList.add("fb-dropdown","fb-dropdown-s","fb-file-context-menu"),t.innerHTML=`
            <button class="fb-dropdown-toggle" type="button">
                <i class="fa fa-ellipsis-v"></i>
            </button>`,document.createElement("ul"));i.classList.add("fb-dropdown-content");let s=this.contextMenu;for(e in s=s instanceof Array?s.reduce((e,t)=>(e[t]={},e),{}):s)if(!e.startsWith("__")){var n=document.createElement("li"),o=document.createElement("button"),l=(o.type="button",o.dataset.action=e,s[e].label??e);s[e].icon?o.innerHTML=`<i class="${s[e].icon}"></i> `+l:o.innerText=l;let t=s[e].handler??s[e];t instanceof Function&&o.addEventListener("click",e=>{t(this)}),n.appendChild(o),i.appendChild(n)}return t.appendChild(i),new FBDropdown(t,{closeOnOutsideClick:!0}),t}tableRow(){null!==this._htmlElement&&this._htmlElement.remove();var e=document.createElement("tr");return e.innerHTML=`
            <td class="fb-file-name"><span class="fb-file-icon"><i class="${this.icon}"></i></span> ${this.filename}</td>
            <td class="fb-file-size">${toHumanSize(this.size)}</td>
            <td class="fb-file-modified">${this._modifiedStr()}</td>
        `,e.dataset.filename=btoa_utf8(this.filename),e.dataset.size=this.size,e.dataset.modified=this.modified?.getTime(),e.dataset.type=this.type,this.selected&&e.classList.add("selected"),e.addEventListener("click",()=>{this.onFileClick instanceof Function&&this.onFileClick(this)}),e.addEventListener("dblclick",()=>{this.onFileDoubleClick instanceof Function&&this.onFileDoubleClick(this)}),this.selected&&e.classList.add("selected"),this._htmlElement=e,this._htmlElement}previewElement(e=null){null!==this._htmlElement&&this._htmlElement.remove();let t=null;e instanceof Function&&(t=e(this));var e=this.createContextMenu(),i=document.createElement("div"),s=(i.classList.add("fb-file-wrapper"),i.innerHTML=`
            <div class="fb-file">
            </div>
        `,i.querySelector(".fb-file"));return null!==this.previewUrl?s.innerHTML=`
                <div class="fb-preview-image">
                    <div class="fb-preview-image-background" style="background-image: url('${this.previewUrl}')"></div>
                    <div class="fb-preview-image-image" style="background-image: url('${this.previewUrl}')"></div>
                </div>
            `:s.innerHTML=`
                <div class="fb-file-icon">
                    <i class="${this.icon}"></i>
                </div>`,s.innerHTML+=`
                <div class="fb-file-details">
                    <p class="fb-file-name">${this.filename}</p>
                    <p class="fb-file-size">${toHumanSize(this.size)}</p>
                    <p class="fb-file-modified">${this._modifiedStr()}</p>
                </div>
        `,null===t&&null===e||((s=document.createElement("div")).classList.add("fb-preview-overlay"),null!==t&&s.appendChild(t),null!==e&&s.appendChild(e),i.appendChild(s)),i.dataset.filename=btoa_utf8(this.filename),i.dataset.size=this.size,i.dataset.modified=this.modified?.getTime(),i.dataset.type=this.type,this.selected&&i.classList.add("selected"),(this._htmlElement=i).addEventListener("click",()=>{this.onFileClick instanceof Function&&this.onFileClick(this)}),i.addEventListener("dblclick",()=>{this.onFileDoubleClick instanceof Function&&this.onFileDoubleClick(this)}),this._htmlElement}_modifiedStr(){return null==this.modified?"":this.modified.toLocaleString()}gridElement(e=null){null!==this._htmlElement&&this._htmlElement.remove();let t=null;e instanceof Function&&(t=e(this));var i,e=this.createContextMenu(),s=document.createElement("div");return s.classList.add("fb-file-wrapper"),s.innerHTML=`
            <div class="fb-file">
                <div class="fb-file-icon">
                    <i class="${this.icon}"></i>
                </div>
                <div class="fb-file-details" title="${this.filename}">
                    <p class="fb-file-name">${this.filename}</p>
                    <p class="fb-file-size">${toHumanSize(this.size)}</p>
                    <p class="fb-file-modified">${this._modifiedStr()}</p>
                </div>
            </div>
        `,null===t&&null===e||((i=document.createElement("div")).classList.add("fb-file-overlay"),null!==t&&i.appendChild(t),null!==e&&i.appendChild(e),s.appendChild(i)),s.dataset.filename=btoa_utf8(this.filename),s.dataset.size=this.size,s.dataset.modified=this.modified?.getTime(),s.dataset.type=this.type,this.selected&&s.classList.add("selected"),(this._htmlElement=s).addEventListener("click",()=>{this.onFileClick instanceof Function&&this.onFileClick(this)}),s.addEventListener("dblclick",()=>{this.onFileDoubleClick instanceof Function&&this.onFileDoubleClick(this)}),this._htmlElement}}exports.FileInFileBrowser=FileInFileBrowser;let ClassesMixin={hasClasses:function(e){if("string"==typeof e&&(e=e.split(" ").map(e=>e.trim()).filter(e=>0<e.length)),Array.isArray(e))return e.every(e=>this.classList.contains(e));throw new Error("Classes must be an array or a string")},addClasses:function(e){if("string"==typeof e&&(e=e.split(" ").map(e=>e.trim()).filter(e=>0<e.length)),!Array.isArray(e))throw new Error("Classes must be an array or a string");e.forEach(e=>this.classList.add(e))},removeClasses:function(e){if("string"==typeof e&&(e=e.split(" ").map(e=>e.trim()).filter(e=>0<e.length)),!Array.isArray(e))throw new Error("Classes must be an array or a string");e.forEach(e=>this.classList.remove(e))}};class ResizableColumnTable{static defaultOptions={firstColumn:0,lastColumn:-1,sortableHeaders:!0,classSorter:"sorter fas",classUnsorted:"fa-sort",classSorterUp:"up fa-sort-up",classSorterDown:"down fa-sort-down",onSort:(e,t)=>{}};constructor(e,t={}){this.options=Object.assign({},ResizableColumnTable.defaultOptions,t);var i=e.querySelectorAll("th");if(this.options.lastColumn<0&&(this.options.lastColumn=i.length+this.options.lastColumn),this.options.lastColumn<0||this.options.lastColumn>=i.length)throw new Error("Last column is invalid");if(this.options.firstColumn>this.options.lastColumn)throw new Error("First column is greater than last column");this.table=e,(this.table._fbResizableTable=this).headers=i,this.resizers=[];let s=null;for(let e=this.options.firstColumn;e<this.options.lastColumn+1;e++){var n=i[e],o=document.createElement("div");o.classList.add("fb-resizer"),n.appendChild(o),this.resizers.push(o),this.addEventHandlers(n,o),null!=s&&(s._nextHeader=n),s=n}null!=s&&s!=i[i.length-1]&&(s._nextHeader=i[i.length-1]),this.options.sortableHeaders&&this.addSortingIcons()}setOrder(e,t){if("number"!=typeof e)throw new Error("Column index must be a number");if(e<this.options.firstColumn||e>this.options.lastColumn)throw new Error("Column index out of range");e=this.headers[e].querySelector(".sorter");if(null==e)throw new Error("Column is not sortable");if(e.removeClasses(this.options.classSorterUp),e.removeClasses(this.options.classSorterDown),e.addClasses(this.options.classUnsorted),"asc"==t)e.removeClasses(this.options.classUnsorted),e.addClasses(this.options.classSorterUp),e.removeClasses(this.options.classSorterDown);else{if("desc"!=t)throw new Error("Invalid direction");e.removeClasses(this.options.classUnsorted),e.removeClasses(this.options.classSorterUp),e.addClasses(this.options.classSorterDown)}}addSortingIcons(){let e=[];Array.isArray(this.options.sortableHeaders)?e=this.options.sortableHeaders.filter(e=>0<=e&&e<this.headers.length):!0===this.options.sortableHeaders&&(e=Array.from(this.headers).map((e,t)=>t)),e.forEach(e=>{let t=this.headers[e],i=document.createElement("i");Object.assign(i,ClassesMixin),i.addClasses(this.options.classSorter),i.addClasses(this.options.classUnsorted),t.addEventListener("click",e=>{t.closest("thead").querySelectorAll(".sorter").forEach(e=>{e!=i&&(e.removeClasses(this.options.classSorterUp),e.removeClasses(this.options.classSorterDown),e.addClasses(this.options.classUnsorted))}),i.hasClasses(this.options.classSorterUp)?(i.removeClasses(this.options.classUnsorted),i.removeClasses(this.options.classSorterUp),i.addClasses(this.options.classSorterDown)):i.hasClasses(this.options.classSorterDown)?(i.removeClasses(this.options.classUnsorted),i.removeClasses(this.options.classSorterDown),i.addClasses(this.options.classSorterUp)):(i.removeClasses(this.options.classUnsorted),i.addClasses(this.options.classSorterUp),i.removeClasses(this.options.classSorterDown)),this.options.onSort instanceof Function&&this.options.onSort(t,i.hasClasses(this.options.classSorterUp)?"asc":"desc")}),t.appendChild(i)})}updateResizerHeight(){this.resizers.forEach(e=>{e.style.height=this.table.offsetHeight+"px"})}addEventHandlers(t,i){let s,n,o=null,l=0,r=e=>{e=e.clientX-s;n+e<20||null!=o&&(o.style.width=l-e+"px",l-e<20)||(t.style.width=n+e+"px")},a=()=>{document.removeEventListener("mousemove",r),document.removeEventListener("mouseup",a),t.classList.remove("resizing"),t._nextHeader?.classList.remove("resizing"),i.classList.remove("resizing")};i.addEventListener("mousedown",e=>{s=e.clientX,n=parseInt(window.getComputedStyle(t).width,10),null!=(o=t._nextHeader??null)&&(l=parseInt(window.getComputedStyle(o).width,10)),document.addEventListener("mousemove",r),document.addEventListener("mouseup",a),t.classList.add("resizing"),t._nextHeader?.classList.add("resizing"),i.classList.add("resizing")})}}function btoa_utf8(e){return btoa(String.fromCharCode(...new TextEncoder("utf-8").encode(e)))}function atob_utf8(e){let i=atob(e);new TextDecoder("utf-8").decode(Uint8Array.from({length:i.length},(e,t)=>i.charCodeAt(t)))}function toHumanSize(e){if(null==e)return"";let t=["B","KB","MB","GB","TB"],i=0;if(e=parseFloat(e),isNaN(e))return"0 B";for(;1024<=e&&i<t.length-1;)e/=1024,i++;return e.toFixed(2)+" "+t[i]}function covertCallback(callback,context=null){if(null===callback)return null;if("string"==typeof callback){let stringCallback=callback;callback=_=>{let file=_;eval(stringCallback)}}if(callback instanceof Function)return null!==context?callback.bind(context):callback;throw new Error("Invalid callback")}function isValidURL(e){if(!(e instanceof URL))try{new URL(e)}catch(e){}}}(window);