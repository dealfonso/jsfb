if (typeof exports === 'undefined') {
    exports = {}
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
        orderColumn: 'filename',
        orderAscending: true
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

        // Order of the columns
        this.orderColumn = this.options.orderColumn;
        this.orderAscending = this.options.orderAscending;

        // It is possible to pass a context menu as an array of options, but if not, we generate a default one
        //  based on the options passed to the constructor
        if (this.options.customContextMenu === null) {
            this.options.customContextMenu = this._generateContextMenu();
        }
        this.setMode(this.options.mode);
        this.options.onFileHtmlElementCreated = this.options.onFileHtmlElementCreated.bind(this);
        this.options.onFileClick = this.options.onFileClick.bind(this);
        this.options.onFileDblClick = this.options.onFileDblClick?.bind(this);
        this.options.onFileDownload = this.options.onFileDownload?.bind(this);
        this.options.onFileDelete = this.options.onFileDelete?.bind(this);
        this.options.onFileRename = this.options.onFileRename?.bind(this);
        this.options.onFileCopy = this.options.onFileCopy?.bind(this);
        this.options.onFileMove = this.options.onFileMove?.bind(this);
        this.options.onFileShare = this.options.onFileShare?.bind(this);
        this.options.onFileInfo = this.options.onFileInfo?.bind(this);

        this._elementsPlace = null;
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

    _renderFile(file, nextFile = null) {
        let element = null;
        switch (this.mode) {
            case 'list':
                element = file.tableRow();
                break;
            case 'grid':
                element = file.htmlElement(this.options.overlayGenerator);
                break;
        }
        if (this.options.onFileClick instanceof Function) {
            file.clickHandler(this.options.onFileClick.bind(this));
        }
        if (this.options.onFileDblClick instanceof Function) {
            file.dblclickHandler(this.options.onFileDblClick.bind(this));
        }
        this.options.onFileHtmlElementCreated.call(this, element, file, this.mode);
        if (nextFile !== null) {
            nextFile._htmlElement.insertAdjacentElement('beforebegin', element);
        } else {
            this._elementsPlace.appendChild(element);
        }
    }

    _getSortFunction(column = null, ascending = null) {
        if (column === null) {
            column = this.orderColumn;
        }
        if (ascending === null) {
            ascending = this.orderAscending;
        }
        let sortFunction = null;
        switch (column) {
            case 'filename':
                if (ascending) {
                    sortFunction = (a, b) => {
                        return a.filename.localeCompare(b.filename);
                    };
                } else {
                    sortFunction = (a, b) => {
                        return b.filename.localeCompare(a.filename);
                    };
                }
                break;
            case 'size':
                if (ascending) {
                    sortFunction = (a, b) => {
                        return a.size - b.size;
                    }
                } else {
                    sortFunction = (a, b) => {
                        return b.size - a.size;
                    }
                }
                break;
            case 'modified':
                if (ascending) {
                    sortFunction = (a, b) => {
                        return a.modified.localeCompare(b.modified);
                    }
                } else {
                    sortFunction = (a, b) => {
                        return b.modified.localeCompare(a.modified);
                    }
                }
                break;
            default:
                throw new Error('Invalid column');

        }
        return sortFunction;
    }

    _findNextFile(file) {
        let sortFunction = this._getSortFunction();
        for (let i = 0; i < this.filelist.length; i++) {
            if (sortFunction(file, this.filelist[i]) < 0) {
                return this.filelist[i];
            }
        }
        return null;
    }

    addFile(filename, size, modified) {
        let file = new FileInFileBrowser(filename, size, modified, this.options.customContextMenu);
        let nextFile = this._findNextFile(file);
        if (nextFile !== null) {
            this.filelist.splice(this.filelist.indexOf(nextFile), 0, file);
            this._renderFile(file, nextFile);
        } else {
            // If there is no next file, we add it at the end
            this.filelist.push(file);
            this._renderFile(file);
        }
        return file;
    }

    removeFile(file) {
        let index = this.filelist.indexOf(file);
        if (index >= 0) {
            this.filelist.splice(index, 1);
        }
        this.render();
    }
    _createGrid() {
        let grid = document.createElement('div');
        grid.classList.add('jsfb-filelist-grid');
        this._elementsPlace = grid;
        return grid;
    }
    _createList() {
        let table = document.createElement('table');
        table.classList.add('jsfb-filelist-table');
        table.innerHTML = `
            <thead class="jsfb-filelist-header">
                <tr>
                    <th class="jsfb-file-name">Name</th>
                    <th class="jsfb-file-size">Size</th>
                    <th class="jsfb-file-modified">Modified</th>
                </tr>
            </thead>
            <tbody></tbody>
        `;
        this._elementsPlace = table.querySelector('tbody');
        return table;
    }
    render(mode = null) {
        if (mode !== null) {
            this.setMode(mode);
        }
        this.filelistElement.innerHTML = '';
        let element = null;
        switch (this.mode) {
            case 'list':
                element = this._createList();
                break;
            case 'grid':
                element = this._createGrid();
                break;
        }
        this.filelist.forEach(file => {
            this._renderFile(file);
        });
        this.filelistElement.appendChild(element);
        if (this.mode === 'list') {
            new ResizableColumnTable(element, {
                sortableHeaders: true,
                onSort: (column, ascending) => {
                    switch (column.textContent.trim().toLowerCase()) {
                        case 'name':
                            this.sort('filename', ascending == 'asc');
                            break;
                        case 'size':
                            this.sort('size', ascending == 'asc');
                            break;
                        case 'modified':
                            this.sort('modified', ascending == 'asc');
                            break;
                    }
                }
            });
        }
    }
    sort(column, ascending) {
        // implement manual sorting, by calling render with the new order
        let sortFunction = this._getSortFunction(column, ascending);
        this.filelist.sort(sortFunction);
        this._elementsPlace.innerHTML = '';
        this.filelist.forEach(file => {
            this._renderFile(file);
        });
        // for (let i = 0; i < this.filelist.length; i++) {
        //     for (let j = i + 1; j < this.filelist.length; j++) {
        //         if (sortFunction(this.filelist[i], this.filelist[j]) > 0) {
        //             let temp = this.filelist[i];
        //             this.filelist[i] = this.filelist[j];
        //             this.filelist[j] = temp;
        //         }
        //     }
        // }
    }
}

exports.jsFileBrowser = FileBrowser;