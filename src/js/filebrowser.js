if (typeof exports === 'undefined') {
    exports = {}
}

class FileBrowser {
    static extensionToIcon = {
        'txt': 'fas fa-file-alt',
        'pdf': 'fas fa-file-pdf',
        'doc': 'fas fa-file-word',
        'docx': 'fas fa-file-word',
        'xls': 'fas fa-file-excel',
        'xlsx': 'fas fa-file-excel',
        'ppt': 'fas fa-file-powerpoint',
        'pptx': 'fas fa-file-powerpoint',
        'jpg': 'fas fa-file-image',
        'jpeg': 'fas fa-file-image',
        'png': 'fas fa-file-image',
        'gif': 'fas fa-file-image',
        'mp3': 'fas fa-file-audio',
        'wav': 'fas fa-file-audio',
        'mov': 'fas fa-file-video',
        'mp4': 'fas fa-file-video',
        'avi': 'fas fa-file-video',
        'zip': 'fas fa-file-archive',
        'rar': 'fas fa-file-archive',
        'tar': 'fas fa-file-archive',
        'gz': 'fas fa-file-archive',
        '7z': 'fas fa-file-archive',
        'exe': 'fas fa-file-executable',
        'js': 'fas fa-file-code',
        'css': 'fas fa-file-code',
        'html': 'fas fa-file-code',
        'php': 'fas fa-file-code',
        'py': 'fas fa-file-code',
        'java': 'fas fa-file-code',
        'c': 'fas fa-file-code',
        'cpp': 'fas fa-file-code',
        'h': 'fas fa-file-code',
        'hpp': 'fas fa-file-code',
        'json': 'fas fa-file-code',
        'xml': 'fas fa-file-code',
        'csv': 'fas fa-file-excel',
        'file': 'fas fa-file',
    };    
    static defaultOptions = {
        // The mode of the file browser ("list" or "grid")
        mode: 'list',
        // The column to order the files by
        orderColumn: 'filename',
        // The order of the files (true = ascending, false = descending)
        orderAscending: true,
        // Whether to hide the size from zero size files (only the size will be hidden, the file will still be shown)
        hideZeroSize: true,
        // Allow duplicate files (files with the same name)
        allowDuplicates: false,
        // Whether to separate the folders from the files
        separateFoldersFromFiles: true,
        // Called when a file is clicked (file) => { }
        onFileClick: (file) => { },
        // Called when a file is double clicked (file) => {
        onFileDblClick:  (file) => { },
        // Called to generate a "toolbar" for the file (the original purpose is to generate a context menu for the file)
        overlayGenerator: (file) => null,
        // Called when a file is created (element, file, mode) => { }, where <element> is the HTML element created, <file>
        //  is the file created and <mode> is the mode of the file browser ("list" or "grid")
        onFileHtmlElementCreated: (element, file, mode) => { },
        // Called when the option "Download" is selected in the default context menu (file) => { }
        onFileDownload: null,
        // Called when the option "Delete" is selected in the default context menu (file) => { }
        onFileDelete: null,
        // Called when the option "Rename" is selected in the default context menu (file) => { }
        onFileRename: null,
        // Called when the option "Copy" is selected in the default context menu (file) => { }
        onFileCopy: null,
        // Called when the option "Move" is selected in the default context menu (file) => { }
        onFileMove: null,
        // Called when the option "Share" is selected in the default context menu (file) => { }
        onFileShare: null,
        // Called when the option "Info" is selected in the default context menu (file) => { }
        onFileInfo: null,
        // The mapping of file extensions to icons. This is a dictionary with the keys being the extension (without the
        //   dot), and the value being a css string to be used as the class of the icon for the file. 
        //   If the extension is not found, the default icon will be used (the "" extension).
        extensionToIcon: FileBrowser.extensionToIcon,
        // The definition of a custom context menu for the file. It may consist of a dictionary with the keys being the 
        //  name of the option and the value being 
        //      a) an object with the keys "label", "icon" and "handler" (the function to be called)
        //      b) a function to be called
        //  If the label is omitted, the key will be used as the label. If the icon is omitted, no icon will be shown.
        //
        // (*) If a context menu is passed, the options onFileDownload, onFileDelete, onFileRename, onFileCopy, onFileMove,
        //     onFileShare and onFileInfo will be ignored.
        // (*) If the context menu is null, a default context menu will be generated based on the callbacks passed as options
        //     (onFileDownload, onFileDelete, onFileRename, onFileCopy, onFileMove, onFileShare, onFileInfo).
        customContextMenu: null,
    }
    _generateContextMenu() {
        let contextMenu = {};
        if (this.options.onFileDownload instanceof Function) {
            contextMenu["download"] = {
                label: 'Download',
                icon: 'fa fa-download',
                handler: this.options.onFileDownload,
            };
        }
        if (this.options.onFileDelete instanceof Function) {
            contextMenu["delete"] = {
                label: 'Delete',
                icon: 'fa fa-trash',
                handler: this.options.onFileDelete,
            };
        }
        if (this.options.onFileRename instanceof Function) {
            contextMenu["rename"] = {
                label: 'Rename',
                icon: 'fa fa-edit',
                handler: this.options.onFileRename,
            };
        }
        if (this.options.onFileCopy instanceof Function) {
            contextMenu["copy"] = {
                label: 'Copy',
                icon: 'fa fa-copy',
                handler: this.options.onFileCopy,
            };
        }
        if (this.options.onFileMove instanceof Function) {
            contextMenu["move"] = {
                label: 'Move',
                icon: 'fa fa-arrows-alt',
                handler: this.options.onFileMove,
            };
        }
        if (this.options.onFileShare instanceof Function) {
            contextMenu["share"] = {
                label: 'Share',
                icon: 'fa fa-share-alt',
                handler: this.options.onFileShare,
            };
        }
        if (this.options.onFileInfo instanceof Function) {
            contextMenu["info"] = {
                label: 'Info',
                icon: 'fa fa-info',
                handler: this.options.onFileInfo,
            };
        }
        if (Object.keys(contextMenu).length > 0) {
            contextMenu.__generated = true;
            return contextMenu;
        }
        return null;
    }
    constructor(element, options = {}) {
        this.options = Object.assign({}, FileBrowser.defaultOptions, options);
        this.filelist = [];
        this.element = element;
        this.filelistElement = element.querySelector('.jsfb-filelist');
        this._elementsPlace = null;

        this._evaluateOptions();
    }

    _covertCallback(callback) {
        if (callback === null) {
            return null;
        }
        if (callback instanceof Function) {
            return callback.bind(this);
        }
        if (typeof callback === 'string') {
            return (_) => {
                const file = _;
                eval(callback);
            }
        }
        throw new Error('Invalid callback');
    }

    updateOptions(options, fromClear = false) {
        if (fromClear) {
            this.options = Object.assign({}, FileBrowser.defaultOptions, options);
        } else {
            this.options = Object.assign({}, this.options, options);
        }
        this._evaluateOptions();
        this.render();
    }

    _evaluateOptions() {
        // Order of the columns
        this.orderColumn = this.options.orderColumn;
        this.orderAscending = this.options.orderAscending;

        // Mode of the file browser
        this.setMode(this.options.mode);

        this.options.onFileHtmlElementCreated = this.options.onFileHtmlElementCreated?.bind(this);

        let callbacks = ['onFileClick', 'onFileDblClick', 'onFileDownload', 'onFileDelete', 'onFileRename', 'onFileCopy', 'onFileMove', 'onFileShare', 'onFileInfo'];
        callbacks.forEach((callback) => {
            this.options[callback] = this._covertCallback(this.options[callback]);
        });

        // It is possible to pass a context menu as an array of options, but if not, we generate a default one
        //  based on the options passed to the constructor
        if ((this.options.customContextMenu === null) || (this.options.customContextMenu.__generated)) {
            this.options.customContextMenu = this._generateContextMenu();
        }

        // If the extensionToIcon is not defined, let's create an empty dictionary
        if ((this.options.extensionToIcon??null) === null) {
            this.options.extensionToIcon = {};
        }
        // If the extensionToIcon is not a dictionary, let's fail
        if (typeof this.options.extensionToIcon !== 'object') {
            throw new Error('Invalid extensionToIcon');
        }
    }

    setMode(mode) {
        switch (mode.toLowerCase()) {
            case 'list':
            case 'grid':
            case 'preview':
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
                element = file.gridElement(this.options.overlayGenerator);
                break;
            case 'preview':
                element = file.previewElement(this.options.overlayGenerator);
                break;
        }
        if (this.options.hideZeroSize && (file.size === 0)) {
            element.querySelector('.jsfb-file-size').innerHTML = '';
        }
        this.options.onFileHtmlElementCreated?.call(this, element, file, this.mode);
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
                        let result = a.filename.localeCompare(b.filename);
                        if (result === 0) {
                            return a.size - b.size;
                        }
                        return result;
                    };
                } else {
                    sortFunction = (a, b) => {
                        let result = b.filename.localeCompare(a.filename);
                        if (result === 0) {
                            return b.size - a.size;
                        }
                        return result;
                    };
                }
                break;
            case 'size':
                if (ascending) {
                    sortFunction = (a, b) => {
                        let result = a.size - b.size;
                        if (result === 0) {
                            return a.filename.localeCompare(b.filename);
                        }
                        return result;
                    }
                } else {
                    sortFunction = (a, b) => {
                        let result = b.size - a.size;
                        if (result === 0) {
                            return b.filename.localeCompare(a.filename);
                        }
                        return result;
                    }
                }
                break;
            case 'modified':
                if (ascending) {
                    sortFunction = (a, b) => {
                        if (a.modified === null) {
                            return -1;
                        }
                        if (b.modified === null) {
                            return 1;
                        }
                        return a.modified.getTime() - b.modified.getTime();
                    }
                } else {
                    sortFunction = (a, b) => {
                        if (a.modified === null) {
                            return 1;
                        }
                        if (b.modified === null) {
                            return -1;
                        }
                        return b.modified.getTime() - a.modified.getTime();
                    }
                }
                break;
            case 'type':
                if (ascending) {
                    sortFunction = (a, b) => {
                        let result = a.type.localeCompare(b.type);
                        if (result === 0) {
                            return a.filename.localeCompare(b.filename);
                        }
                        return result;
                    }
                } else {
                    sortFunction = (a, b) => {
                        let result = b.type.localeCompare(a.type);
                        if (result === 0) {
                            return b.filename.localeCompare(a.filename);
                        }
                        return result;
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
        if (this.filelist.length == 0) {
            return null;
        }
        if (this.options.separateFoldersFromFiles) {
            if (file.isDirectory) {
                // If the file is a directory, we'll compare to the other directories
                for (let i = 0; i < this.filelist.length; i++) {
                    if (this.filelist[i].isDirectory) {
                        if (sortFunction(file, this.filelist[i]) < 0) {
                            return this.filelist[i];
                        }
                    }
                }
                // If we didn't find a directory, we'll return the first file
                for (let i = 0; i < this.filelist.length; i++) {
                    if (!this.filelist[i].isDirectory) {
                        return this.filelist[i];
                    }
                }
                return null;
            } else {
                // If the file is a file, we'll compare to the other files
                for (let i = 0; i < this.filelist.length; i++) {
                    if (!this.filelist[i].isDirectory) {
                        if (sortFunction(file, this.filelist[i]) < 0) {
                            return this.filelist[i];
                        }
                    }
                }
                return null;
            }
        }
        for (let i = 0; i < this.filelist.length; i++) {
            if (sortFunction(file, this.filelist[i]) < 0) {
                return this.filelist[i];
            }
        }
        return null;
    }

    _filenameToIcon(filename) {
        let extension = filename.split('.').pop().toLowerCase();
        if (this.options.extensionToIcon instanceof Function) {
            return this.options.extensionToIcon(extension);
        }
        if (extension in this.options.extensionToIcon) {
            return this.options.extensionToIcon[extension];
        }
        return this.options.extensionToIcon[''] || 'jsfb-svg-icon jsfb-svg-icon-file fa fa-file';
    }

    addFile(filename, size, modified, options = {}) {
        if (!this.options.allowDuplicates) {
            // If we don't allow duplicates, we'll check if the file already exists}
            let existing = this.filelist.find((file) => file.filename === filename);
            if (existing !== undefined) {
                throw new Error('File already exists');
            }
        }

        options = Object.assign({}, {
            contextMenu: this.options.customContextMenu,
            icon: options.isDirectory?"fa-regular fa-folder": this._filenameToIcon(filename),
            type: filename.split('.').pop().toLowerCase(),
            onClick: this.options.onFileClick,
            onDoubleClick: this.options.onFileDblClick,
            isDirectory: false,
        }, options);

        let file = new FileInFileBrowser(filename, size, modified, options);
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

    _renderFiles() {
        /// First we'll render the folders
        if (this.options.separateFoldersFromFiles) {
            this.filelist.forEach(file => {
                if (file.isDirectory) {
                    this._renderFile(file);
                }
            });
            this.filelist.forEach(file => {
                if (!file.isDirectory) {
                    this._renderFile(file);
                }
            });
        } else {
            /// And now the files
            this.filelist.forEach(file => {
                this._renderFile(file);
            });
        }
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
            case 'preview':
                element = this._createGrid();
                break;
        }
        this._renderFiles();
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
        this.orderColumn = column;
        this.orderAscending = ascending;
        this.filelist.sort(sortFunction);
        this._elementsPlace.innerHTML = '';
        this._renderFiles();
    }
}

exports.FileBrowser = FileBrowser;