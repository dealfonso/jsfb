if (typeof exports === 'undefined') {
    exports = {}
}

class FileInFileBrowser {
    static extensionToIcon = {
        'txt': 'fa-file-alt',
        'pdf': 'fa-file-pdf',
        'doc': 'fa-file-word',
        'docx': 'fa-file-word',
        'xls': 'fa-file-excel',
        'xlsx': 'fa-file-excel',
        'ppt': 'fa-file-powerpoint',
        'pptx': 'fa-file-powerpoint',
        'jpg': 'fa-file-image',
        'jpeg': 'fa-file-image',
        'png': 'fa-file-image',
        'gif': 'fa-file-image',
        'mp3': 'fa-file-audio',
        'wav': 'fa-file-audio',
        'mov': 'fa-file-video',
        'mp4': 'fa-file-video',
        'avi': 'fa-file-video',
        'zip': 'fa-file-archive',
        'rar': 'fa-file-archive',
        'tar': 'fa-file-archive',
        'gz': 'fa-file-archive',
        '7z': 'fa-file-archive',
        'exe': 'fa-file-executable',
        'js': 'fa-file-code',
        'css': 'fa-file-code',
        'html': 'fa-file-code',
        'php': 'fa-file-code',
        'py': 'fa-file-code',
        'java': 'fa-file-code',
        'c': 'fa-file-code',
        'cpp': 'fa-file-code',
        'h': 'fa-file-code',
        'hpp': 'fa-file-code',
        'json': 'fa-file-code',
        'xml': 'fa-file-code',
        'csv': 'fa-file-excel',
        'file': 'fa-file',
    };
    constructor(filename, size, modified, contextMenu = null) {
        this.filename = filename;
        this.size = size;
        this.modified = modified;
        this.type = filename.split('.').pop().toLowerCase();
        if (!this.type in FileInFileBrowser.extensionToIcon) {
            this.type = 'file';
        }
        this.icon = FileInFileBrowser.extensionToIcon[this.type] || 'fa-file';
        this._htmlElement = null;
        this._tableRow = null;
        this.selected = false;
        this._clickHandler = null;
        this._dblclickHandler = null;
        this._contextMenu = contextMenu;
    }
    select() {
        this.selected = true;
        if (this._htmlElement) {
            this._htmlElement.querySelector('.jsfb-file').classList.add('selected');
        }
    }
    unselect() {
        this.selected = false;
        if (this._htmlElement) {
            this._htmlElement.querySelector('.jsfb-file').classList.remove('selected');
        }
    }
    toggleSelect() {
        if (this.selected) {
            this.unselect();
        } else {
            this.select();
        }
    }
    createContextMenu() {
        if (this._contextMenu === null) {
            return null;
        }
        let contextMenu = document.createElement('div');
        contextMenu.classList.add('jsfb-dropdown', 'jsfb-dropdown-s', 'jsfb-file-context-menu');
        contextMenu.innerHTML = `
            <button class="jsfb-dropdown-toggle" type="button">
                <i class="fas fa-ellipsis-v"></i>
            </button>`;
        let dropdownContent = document.createElement('ul');
        dropdownContent.classList.add('jsfb-dropdown-content');
        if (this._contextMenu instanceof Array) {
            this._contextMenu = this._contextMenu.reduce((acc, item) => {
                acc[item] = {};
                return acc;
            }, {});
        }
        for (let option in this._contextMenu) {
            // Create the structure for the context menu
            let item = document.createElement('li');

            // Prepare the button and get the options for each item
            let button = document.createElement('button');
            button.type = 'button';
            button.dataset.action = option;
            let text = this._contextMenu[option].label ?? option;
            if (this._contextMenu[option].icon) {
                button.innerHTML = `<i class="fas ${this._contextMenu[option].icon}"></i> ${text}`;
            } else {
                button.innerText = text;
            }
            let handler = this._contextMenu[option].handler ?? this._contextMenu[option];
            if (handler instanceof Function) {
                button.addEventListener('click', (file) => {
                    handler(this);
                });
            }
            item.appendChild(button);
            dropdownContent.appendChild(item);
        }
        contextMenu.appendChild(dropdownContent);
        return contextMenu;
    }
    tableRow() {
        if (this._tableRow !== null) {
            return this._tableRow;
        }
        let row = document.createElement('tr');
        row.innerHTML = `
            <td class="jsfb-file-name"><span class="jsfb-file-icon"><i class="fas ${this.icon}"></i></span> ${this.filename}</td>
            <td class="jsfb-file-size">${toHumanSize(this.size)}</td>
            <td class="jsfb-file-modified">${this.modified}</td>
        `;

        row.dataset.filename = btoa_utf8(this.filename);
        row.dataset.size = this.size;
        row.dataset.modified = this.modified;
        row.dataset.type = this.type;

        if (this.selected) {
            row.classList.add('selected');
        }
        row.addEventListener('click', () => {
            if (this._clickHandler instanceof Function) {
                this._clickHandler(this);
            }
        });
        row.addEventListener('dblclick', () => {
            if (this._dblclickHandler instanceof Function) {
                this._dblclickHandler(this);
            }
        });
        this._tableRow = row;
        return this._tableRow;
    }
    htmlElement(overlayGenerator = null) {
        if (this._htmlElement !== null) {
            return this._htmlElement;
        }

        let overlay = null;
        if (overlayGenerator instanceof Function) {
            overlay = overlayGenerator(this);
        }

        let contextMenu = this.createContextMenu();            

        let element = document.createElement('div');
        element.classList.add('jsfb-file-wrapper');
        element.innerHTML = `
            <div class="jsfb-file">
                <div class="jsfb-file-icon">
                    <i class="fas ${this.icon}"></i>
                </div>
                <div class="jsfb-file-details" title="${this.filename}">
                    <p class="jsfb-file-name">${this.filename}</p>
                    <p class="jsfb-file-size">${toHumanSize(this.size)}</p>
                    <p class="jsfb-file-modified">${this.modified}</p>
                </div>
            </div>
        `;

        if ((overlay !== null) || (contextMenu !== null)) {
            let overlayElement = document.createElement('div');
            overlayElement.classList.add('jsfb-file-overlay');
            if (overlay !== null) {
                overlayElement.appendChild(overlay);
            }
            if (contextMenu !== null) {
                overlayElement.appendChild(contextMenu);
            }
            element.appendChild(overlayElement);
        }

        element.dataset.filename = btoa_utf8(this.filename);
        element.dataset.size = this.size;
        element.dataset.modified = this.modified;
        element.dataset.type = this.type;

        if (this.selected) {
            element.querySelector('.jsfb-file').classList.add('selected');
        }
        this._htmlElement = element;
        element = element.querySelector('.jsfb-file');
        element.addEventListener('click', () => {
            if (this._clickHandler instanceof Function) {
                this._clickHandler(this);
            }
        });
        element.addEventListener('dblclick', () => {
            if (this._dblclickHandler instanceof Function) {
                this._dblclickHandler(this);
            }
        });
        return this._htmlElement;
    }
    clickHandler(handler) {
        this._clickHandler = handler;
    }
    dblclickHandler(handler) {
        this._dblclickHandler = handler;
    }
}
class FileBrowser {
    static defaultOptions = {
        onFileClick: (file) => { },
        onFileDblClick:  (file) => { },
        overlayGenerator: (file) => null,
        onFileHtmlElementCreated: (element, file, mode) => { },
        customContextMenu: null,
        onFileDownload: null,   // (file) => { },
        onFileDelete: null,
        onFileRename: null,
        onFileCopy: null,
        onFileMove: null,
        onFileShare: null,
        onFileInfo: null,
        mode: 'list',
    }
    _generateContextMenu() {
        let contextMenu = {};
        if (this.options.onFileDownload instanceof Function) {
            contextMenu["download"] = {
                label: 'Download',
                icon: 'fa-download',
                handler: this.options.onFileFileDownload,
            };
        }
        if (this.options.onFileDelete instanceof Function) {
            contextMenu["delete"] = {
                label: 'Delete',
                icon: 'fa-trash',
                handler: this.options.onFileDelete,
            };
        }
        if (this.options.onFileRename instanceof Function) {
            contextMenu["rename"] = {
                label: 'Rename',
                icon: 'fa-edit',
                handler: this.options.onFileRename,
            };
        }
        if (this.options.onFileCopy instanceof Function) {
            contextMenu["copy"] = {
                label: 'Copy',
                icon: 'fa-copy',
                handler: this.options.onFileCopy,
            };
        }
        if (this.options.onFileMove instanceof Function) {
            contextMenu["move"] = {
                label: 'Move',
                icon: 'fa-arrows-alt',
                handler: this.options.onFileMove,
            };
        }
        if (this.options.onFileShare instanceof Function) {
            contextMenu["share"] = {
                label: 'Share',
                icon: 'fa-share-alt',
                handler: this.options.onFileShare,
            };
        }
        if (this.options.onFileInfo instanceof Function) {
            contextMenu["info"] = {
                label: 'Info',
                icon: 'fa-info',
                handler: this.options.onFileInfo,
            };
        }
        if (Object.keys(contextMenu).length > 0) {
            return contextMenu;
        }
        return null;
    }
    constructor(element, options = {}) {
        this.options = Object.assign({}, FileBrowser.defaultOptions, options);
        this.filelist = [];
        this.element = element;
        this.filelistElement = element.querySelector('.jsfb-filelist');

        // It is possible to pass a context menu as an array of options, but if not, we generate a default one
        //  based on the options passed to the constructor
        if (this.options.customContextMenu === null) {
            this.options.customContextMenu = this._generateContextMenu();
        }
        this.setMode(this.options.mode);
    }
    setMode(mode) {
        switch (mode.toLowerCase()) {
            case 'list':
            case 'grid':
                this.mode = mode;
                break;
            default:
                throw new Error('Invalid mode');
        }
    }
    addFile(filename, size, modified) {
        let file = new FileInFileBrowser(filename, size, modified, this.options.customContextMenu);
        this.filelist.push(file);
        this.render();
        return file;
    }
    removeFile(file) {
        let index = this.filelist.indexOf(file);
        if (index >= 0) {
            this.filelist.splice(index, 1);
        }
        this.render();
    }
    renderList() {
        let table = document.createElement('table');
        table.classList.add('jsfb-filelist-table');
        table.innerHTML = `
            <thead>
                <tr>
                    <th class="jsfb-file-name">Name</th>
                    <th class="jsfb-file-size">Size</th>
                    <th class="jsfb-file-modified">Modified</th>
                </tr>
            </thead>
            <tbody></tbody>
        `;
        let tbody = table.querySelector('tbody');
        this.filelist.forEach(file => {
            let element = file.tableRow();
            if (this.options.onFileClick instanceof Function) {
                file.clickHandler(this.options.onFileClick.bind(this));
            }
            if (this.options.onFileDblClick instanceof Function) {
                file.dblclickHandler(this.options.onFileDblClick.bind(this));
            }
            this.options.onFileHtmlElementCreated.call(this, element, file, this.mode);
            tbody.appendChild(element);
        });
        return table;
    }
    renderGrid() {
        let grid = document.createElement('div');
        grid.classList.add('jsfb-filelist-grid');
        this.filelist.forEach(file => {
            let element = file.htmlElement(this.options.overlayGenerator);
            if (this.options.onFileClick instanceof Function) {
                file.clickHandler(this.options.onFileClick.bind(this));
            }
            if (this.options.onFileDblClick instanceof Function) {
                file.dblclickHandler(this.options.onFileDblClick.bind(this));
            }
            this.options.onFileHtmlElementCreated.call(this, element, file, this.mode);
            grid.appendChild(element);
        });
        return grid;
    }
    render(mode = null) {
        if (mode !== null) {
            this.setMode(mode);
        }
        this.filelistElement.innerHTML = '';
        switch (this.mode) {
            case 'list':
                let table = this.renderList();
                this.filelistElement.appendChild(table);
                new ResizableColumnTable(table);
                break;
            case 'grid':
                this.filelistElement.appendChild(this.renderGrid());
                break;
        }
    }
}

exports.jsFileBrowser = FileBrowser;