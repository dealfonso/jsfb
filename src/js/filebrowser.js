if (typeof exports === 'undefined') {
    exports = window;
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
        'html': 'fas fa-file-code',
        'md': 'fas fa-file-alt',
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
        // Whether to enable selection of files or not (if enabled, the filebrowser will manage the selection; otherwise, the user will 
        // have to manage it)
        enableSelection: true,
        // If selection is enabled, whether to allow multiple selection or not
        allowMultipleSelection: true,
        // Called when a file is clicked (file) => { }
        onFileClick: (file) => { },
        // Called when a file is double clicked (file) => {
        onFileDoubleClick:  (file) => { },
        // Called when the selection is updated (files) => { }, where <files> is an array with the files selected
        onSelectionUpdate: (files) => { },
        // Called to generate a "toolbar" for the file (the original purpose is to generate a context menu for the file)
        overlayGenerator: (file) => null,
        // Called when a file is created (element, file, mode) => { }, where <element> is the HTML element created, <file>
        //  is the file created and <mode> is the mode of the file browser ("list" or "grid")
        onHtmlCreated: (element, file, mode) => { },
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
        // The context menu options is an object with the options to be shown in the context menu. This is an object
        //  where the key is the action to be performed and the value is either an object with the options for the item
        //  or a function to be called when the item is clicked.
        //
        //  The options are:
        //  - label: the label to be shown in the context menu (if not provided, the key will be used)
        //  - icon: the icon to be shown in the context menu (if not provided, no icon will be shown)
        //  - handler: the function to be called when the item is clicked 
        //
        //  If the value is a function, it will be considered as the handler, the label will be the key and no icon
        //  will be shown.
        //
        //  If the key starts with '__', it will be ignored.
        //
        // (*) If a context menu is passed, the options onFileDownload, onFileDelete, onFileRename, onFileCopy, onFileMove,
        //     onFileShare and onFileInfo will be ignored.
        // (*) If the context menu is null, a default context menu will be generated based on the callbacks passed as options
        //     (onFileDownload, onFileDelete, onFileRename, onFileCopy, onFileMove, onFileShare, onFileInfo).
        customContextMenu: null,
    }

    static mutationObserver = new MutationObserver((mutations) => {
        FileBrowser.fromDOM(document.querySelectorAll('.fb-filebrowser'));
    });

    static fromDOM(objects, options = {}) {
        let result = [];
        if (objects instanceof Element) {
            objects = [objects];
        } else if (objects instanceof NodeList) {
            objects = Array.from(objects);
        } else if (!Array.isArray(objects)) {
            throw new Error('Invalid type of objects');
        }
        if (objects.length === 0) {
            return null;
        }
        objects.forEach((filebrowser) => {
            let current = filebrowser._fbFileBrowser??null;
            if (current === null) {
                current = new FileBrowser(filebrowser, options);
            }
            result.push(current);
        });
        if (objects.length === 1) {
            return result[0];
        }
        return result;
    }    

    // The last file selected
    _lastFileSelected = null;

    /**
     * Creates a FileBrowser in the given element with the given options
     * @param {HTMLElement | string} element - the element to create the FileBrowser in (or the selector of the element)
     * @param {Object} options - the options to be used in the FileBrowser (see FileBrowser.defaultOptions)
     * @returns a FileBrowser object (or the existing FileBrowser if the element already has one)
     */
    constructor(element, options = {}) {
        if (element instanceof Element) {
        } else if (typeof element === 'string') {
            element = document.querySelector(element);
        } else {
            throw new Error('Invalid element');
        }

        // If the element already has a FileBrowser, we'll update the options and return the existing FileBrowser
        if (element._fbFileBrowser !== undefined) {
            if (Object.keys(options).length > 0) {
                console.warn('Options are being ignored as the FileBrowser already exists. Please use updateOptions instead');
            }
            // element._fbFileBrowser.updateOptions(options);
            return element._fbFileBrowser;
        }

        // We'll get the options from the DOM
        let optionsFromDOM = FileBrowser._optionsFromDOM(element, FileBrowser.defaultOptions, 'fb');

        // We'll merge the options from the DOM with the options passed to the constructor (giving priority to the options here)
        this.options = Object.assign({}, FileBrowser.defaultOptions, optionsFromDOM, options);

        // Finally we'll initialize the FileBrowser
        // this.orderColumn = null;
        // this.orderAscending = null;
        this.mode = null;
        this.filelist = [];
        this._elementsPlace = null;
        this._htmlElement = element;

        // And we'll evaluate the options
        this._evaluateOptions();

        // We'll set the FileBrowser in the element (so that we can recover it later)
        element._fbFileBrowser = this;

        // We'll read pre-existing files in the FileBrowser
        let files = element.querySelectorAll('fb-file');
        let existingFiles = Array.from(files).map((file) => {
            const basicFileInformation = { 
                filename: "", 
                size: 0, 
                modified: null, 
                isDirectory: false, 
                type: 'file',
                previewUrl: null,
                icon: null,
                data: null,
            };
            let options = FileBrowser._optionsFromDOM(file, basicFileInformation, 'fb');
            return Object.assign({}, {
                filename: file.textContent,
                size: 0,
                modified: null
            }, options);
        });

        // We'll create the FileBrowser
        this.render();

        // And finally we'll add the existing files
        existingFiles.forEach((file) => {
            if (file.isDirectory) {
                this.addFolder(file.filename, file.modified, file);
            } else {
                this.addFile(file.filename, file.size, file.modified, file);
            }
        });
    }

    /**
     * Updates the options of the FileBrowser
     * @param {Object} options - the options to be updated (see FileBrowser.defaultOptions)
     * @param {boolean} fromClear - whether the options are being updated keeping the previous options (false) or if
     *                              the options are being updated from a clear state (true)
     */
    updateOptions(options, fromClear = false) {
        let existingOptions = Object.assign({}, this.options);

        if (fromClear) {
            this.options = Object.assign({}, FileBrowser.defaultOptions, options);
        } else {
            this.options = Object.assign({}, this.options, options);
        }
        this._evaluateOptions();

        // We'll check if the options have changed and if so, we'll re-render the FileBrowser
        let changed = false;
        for (let key in this.options) {
            if (typeof this.options[key] === 'function') {
                continue;
            }
            if (this.options[key] != existingOptions[key]) {
                changed = true;
                break;
            }
        }
        if (!changed) {
            return;
        }

        // We'll re-render the FileBrowser, as the options have changed and the file order might have changed because
        //  of the orderColumn and orderAscending
        this.render();
    }

    /**
     * Returns the files in the FileBrowser
     * @returns an array with the files in the FileBrowser
     */
    getFiles() {
        return this.filelist;
    }

    /**
     * Returns the files selected in the FileBrowser
     * @returns an array with the files selected
     */
    getSelectedFiles() {
        return this.filelist.filter((file) => file.selected);
    }

    /**
     * Clears the selection of the files in the FileBrowser
     */
    clearSelection() {
        this.filelist.forEach((file) => file.unselect());
    }
    
    /**
     * Sets the mode of the FileBrowser
     * @param {string} mode - the mode to be set ("list", "grid" or "preview")
     * @throws {Error} if the mode is invalid
     */
    _setMode(mode) {
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

    _addFile(filename, options = {}) {
        if (!this.options.allowDuplicates) {
            // If we don't allow duplicates, we'll check if the file already exists}
            let existing = this.filelist.find((file) => file.filename === filename);
            if (existing !== undefined) {
                throw new Error('File already exists');
            }
        }

        filename = `${filename}`;
        options = Object.assign({}, {
            contextMenu: this.options.customContextMenu,
            icon: options.isDirectory?"fa-regular fa-folder": this._filenameToIcon(filename),
            type: filename.split('.').pop().toLowerCase(),
            onFileClick: (file, e) => {
                if (this.options.enableSelection) {
                    let indexesSelected = this.filelist.filter((file) => file.selected).map((file) => this.filelist.indexOf(file));

                    if (!this.options.allowMultipleSelection) {
                        // Simply select the file
                        this.clearSelection();
                        file.select();
                    } else {
                        if (!e.shiftKey && !e.ctrlKey && !e.metaKey) {
                            this.clearSelection();
                            file.select();
                            this._lastFileSelected = file;
                        }

                        if (e.shiftKey) {
                            // If shift key is pressed, select all files between the last selected and the current one
                            if (this._lastFileSelected !== null) {
                                let lastFileIndex = this.filelist.indexOf(this._lastFileSelected);
                                let currentFileIndex = this.filelist.indexOf(file);
                                let start = Math.min(lastFileIndex, currentFileIndex);
                                let end = Math.max(lastFileIndex, currentFileIndex);
                                for (let i = start; i <= end; i++) {
                                    this.filelist[i].select();
                                }
                            } else {
                                // But if there is no last file selected, we'll just select the current one
                                file.select();
                            }
                            this._lastFileSelected = file;
                        } else {
                            if (e.ctrlKey || e.metaKey) {
                                // If control key is pressed, toggle the selection of the current file
                                file.toggleSelect();
                                if (file.selected) {
                                    this._lastFileSelected = file;
                                } else {
                                    this._lastFileSelected = null;
                                }
                            }
                        }
                    }

                    // We'll check if the selection has changed and if so, we'll call the onSelectionUpdate callback
                    let indexesSelectedNow = this.filelist.filter((file) => file.selected).map((file) => this.filelist.indexOf(file));
                    if (indexesSelected.join(',') !== indexesSelectedNow.join(',')) {
                        this.options.onSelectionUpdate(this.getSelectedFiles());
                    }
                }
                this.options.onFileClick(file, e);
            },
            onFileDoubleClick: this.options.onFileDoubleClick,
        }, options);

        let file = new FileInFileBrowser(filename, options);
        let nextFile = this._findNextFile(file);
        if (nextFile !== null) {
            this.filelist.splice(this.filelist.indexOf(nextFile), 0, file);
            this._placeFile(this._renderFile(file), nextFile);
        } else {
            // If there is no next file, we add it at the end
            this.filelist.push(file);
            this._placeFile(this._renderFile(file));
        }
        return file;
    }

    /**
     * Adds a file to the FileBrowser
     * @param {string} filename - the name of the file
     * @param {number} size - the size of the file
     * @param {Date} modified - the date the file was modified
     * @param {Object} options - the options for the file (see FileInFileBrowser.defaultOptions)
     * @returns the FileInFileBrowser object created
     * @throws {Error} if the file already exists and duplicates are not allowed
     */
    addFile(filename, size, modified, options = {}) {
        return this._addFile(filename, Object.assign({}, options, {
            isDirectory: false,
            size: size,
            modified: modified,
        }));
    }

    /**
     * Adds or updates a file in the FileBrowser. If the file already exists, it will be updated with the new options
     * @param {string} filename - the name of the file
     * @param {Object} options - the options for the file (see FileInFileBrowser.defaultOptions)
     * @returns the FileInFileBrowser object created or updated
     */
    addOrUpdateFile(filename, options = {}) {
        let existing = this.findFile(filename);
        options = Object.assign({}, options, {
            isDirectory: false,
            type: filename.split('.').pop().toLowerCase(),
        });
        if (existing === null) {
            return this.addFile(filename, 0, new Date(), options);
        }
        if (existing.isDirectory) {
            throw new Error('Existing file is not a file');
        }
        return this.updateFile(filename, options);
        // existing.update(options);
        // this.render();
        // return existing;
    }

    /**
     * Updates a file in the FileBrowser. If the file does not exist, an error will be thrown. Size and modified date
     *   may be updated using the options { size: <size>, modified: <modified> }
     * @param {string} filename - the name of the file
     * @param {Object} options - the options for the file (see FileInFileBrowser.defaultOptions)
     * @returns the FileInFileBrowser object updated
     * @throws {Error} if the file does not exist
     */
    updateFile(filename, options = {}) {
        let existing = this.findFile(filename);
        if (existing === null) {
            throw new Error('File not found');
        }

        let htmlElement = existing._htmlElement;
        if (existing.compareOptions(options)) {
            return existing;
        }
        htmlElement.remove();
        existing.update(options);

        // We'll remove the element and re-insert it in the correct place
        let nextFile = this._findNextFile(existing);
        if (nextFile !== null) {
            this.filelist.splice(this.filelist.indexOf(nextFile), 0, existing);
            this._placeFile(this._renderFile(existing), nextFile);
        } else {
            // If there is no next file, we add it at the end
            this.filelist.push(existing);
            this._placeFile(this._renderFile(existing));
        }
        return existing;
    }

    /**
     * Adds a folder to the FileBrowser
     * @param {string} name - the name of the folder
     * @param {Date} modified - the date the folder was modified
     * @param {Object} options - the options for the folder (see FileInFileBrowser.defaultOptions)
     * @returns the FileInFileBrowser object created
     * @throws {Error} if the folder already exists and duplicates are not allowed
     */
    addFolder(name, modified, options = {}) {
        return this._addFile(name, Object.assign({}, {
                // Allow to override the icon using the options
                icon: "fa-regular fa-folder",
                // Also allow to override the size (which will be null for folders unless specified)
                size: null,
            }, options, {
                isDirectory: true,
                modified: modified,
                type: 'folder',
            }
        ));
    }

    /**
     * Updates a folder in the FileBrowser. If the folder does not exist, an error will be thrown.
     * @param {string} name - the name of the folder
     * @param {Object} options - the options for the folder (see FileInFileBrowser.defaultOptions)
     * @returns the FileInFileBrowser object updated
     * @throws {Error} if the folder does not exist
     */
    updateFolder(name, options = {}) {
        let existing = this.findFile(name);
        if (existing === null) {
            throw new Error('Folder not found');
        }
        if (!existing.isDirectory) {
            throw new Error('Existing file is not a folder');
        }

        options = Object.assign({}, options, {
            isDirectory: true,
            type: 'folder',
        });

        let htmlElement = existing._htmlElement;
        if (existing.compareOptions(options)) {
            return existing;
        }
        htmlElement.remove();
        existing.update(options);

        // We'll remove the element and re-insert it in the correct place
        let nextFile = this._findNextFile(existing);
        if (nextFile !== null) {
            this.filelist.splice(this.filelist.indexOf(nextFile), 0, existing);
            this._placeFile(this._renderFile(existing), nextFile);
        } else {
            // If there is no next file, we add it at the end
            this.filelist.push(existing);
            this._placeFile(this._renderFile(existing));
        }
        return existing;
    }

    /**
     * Adds or updates a folder in the FileBrowser. If the folder already exists, it will be updated with the new options
     * @param {string} name - the name of the folder
     * @param {Object} options - the options for the folder (see FileInFileBrowser.defaultOptions)
     * @returns the FileInFileBrowser object created or updated
     */
    addOrUpdateFolder(name, options = {}) {
        let existing = this.findFile(name);
        options = Object.assign({}, options, {
            isDirectory: true,
            type: 'folder',
        });
        if (existing === null) {
            return this.addFolder(name, new Date(), options);
        }
        if (!existing.isDirectory) {
            throw new Error('Existing file is not a folder');
        }
        return this.updateFolder(name, options);
    }

    /**
     * Finds a file in the FileBrowser by its name (if there are multiple files with the same name, the first one 
     *  will be returned)
     * @param {string} filename - the name of the file to be found
     * @returns the FileInFileBrowser object found or null if the file was not found 
     */
    findFile(filename) {
        let existing = this.filelist.find((file) => file.filename === filename);
        if (existing === undefined) {
            return null;
        }
        return existing;
    }

    /**
     * Finds all files in the FileBrowser by their name (if there are multiple files with the same name, all of them
     *  will be returned)
     * @param {string} filter - the filter to be used to find the files (bash-like filter)
     * @returns an array with all the FileInFileBrowser objects found (or an empty array if no file was found)
     */
    findFiles(filter) {
        let regex = new RegExp(filter.replace(/\*/g, '.*').replace(/\?/g, '.'), 'i');
        return this.filelist.filter((file) => regex.test(file.filename));
    }

    /**
     * Removes a file from the FileBrowser (either by its name or by the FileInFileBrowser object). If there are multiple
     *  files with the same name, all of them will be removed.
     * @param {string | FileInFileBrowser} file - the name of the file to be removed or the FileInFileBrowser object
     */
    removeFile(file) {
        if (file instanceof FileInFileBrowser) {
            let index = this.filelist.indexOf(file);
            if (index >= 0) {
                this.filelist.splice(index, 1);
            }
        } else if (typeof file === 'string') {
            file = this.findFile(file);
            if (file !== null) {
                let index = this.filelist.indexOf(file);
                if (index >= 0) {
                    this.filelist.splice(index, 1);
                }
            };
        }
        this.render();
    }

    /**
     * Executes a callback for each file in the FileBrowser
     * @param {Function} callback - the callback to be executed for each file (file) => { }
     */
    forEachFile(callback) {
        this.filelist.forEach(callback);
        // this.render();
    }

    /**
     * Renders the FileBrowser
     * @param {string} mode - the mode to be rendered ("list", "grid" or "preview"). If null, the current mode will be used
     * @throws {Error} if the mode is invalid
     */
    render(mode = null) {
        // Show trace of calls
        // console.trace("FileBrowser.render");
        if (mode !== null) {
            this._setMode(mode);
        }
        this._htmlElement.innerHTML = '';
        let element = null;
        switch (this.mode) {
            case 'list':
                element = this._createList();
                break;
            case 'grid':
                element = this._createGrid();
                break;
            case 'preview':
                element = this._createPreview();
                break;
        }
        this._renderFiles();
        this._htmlElement.appendChild(element);
        if (this.mode === 'list') {
            let resizableColumnTable = new ResizableColumnTable(element, {
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
            switch (this.options.orderColumn) {
                case 'filename':
                    resizableColumnTable.setOrder(0, this.options.orderAscending?'asc':'desc');
                    break;
                case 'size':
                    resizableColumnTable.setOrder(1, this.options.orderAscending?'asc':'desc');
                    break;
                case 'modified':
                    resizableColumnTable.setOrder(2, this.options.orderAscending?'asc':'desc');
                    break;
            }
        }

        // Clear the last file selected
        this._lastFileSelected = null;
    }

    /**
     * Sorts the files in the FileBrowser by the given column and order (ascending or descending)
     * @param {string} column - the column to be sorted by ("filename", "size", "modified", "type")
     * @param {boolean} ascending - the order of the sorting (true = ascending, false = descending)
     * @throws {Error} if the column is invalid
     */
    sort(column, ascending) {
        let sortFunction = this._getSortFunction(column, ascending);
        this.options.orderColumn = column;
        this.options.orderAscending = ascending;
        this.filelist.sort(sortFunction);
        this._elementsPlace.innerHTML = '';
        this._renderFiles();
    }

    /**
     * Clears the FileBrowser (removes all files)
     */
    clear() {
        this.filelist = [];
        this.render();
    }

    /**
     * Extracts the options from the DOM element using the data attributes data-<prefix>-<key> where <prefix> is the
     *  prefix passed as parameter and <key> is the key of the option
     * @param {HTMLElement} element - the element to extract the options from
     * @param {string} prefix - the prefix to be used in the data attributes
     * @returns an object with the options extracted from the DOM element
     */
    static _optionsFromDOM(element, defaultOptions = {}, prefix = 'fb') {
        let options = {};
        for (let key in defaultOptions) {
            let dataKey = prefix + key[0].toUpperCase() + key.slice(1);
            if (element.dataset[dataKey] !== undefined) {
                let value = element.dataset[dataKey];

                // We'll try to convert the value to the correct type
                if (value === 'true' || value === 'false') {
                    options[key] = value === 'true';
                } else if ((!isNaN(parseFloat(value))) && (parseFloat(value).toString() == value)) {
                    options[key] = parseFloat(value);
                } else {
                    options[key] = value;
                }
            }
        }
        return options;
    }

    /**
     * Generates a default context menu based on the options passed to the constructor
     * @returns an object with the context menu options
     */
    _generateContextMenu() {
        let contextMenu = {};
        if (this.options.onFileDownload instanceof Function) {
            contextMenu["download"] = {
                label: 'Download',
                handler: this.options.onFileDownload,
            };
        }
        if (this.options.onFileDelete instanceof Function) {
            contextMenu["delete"] = {
                label: 'Delete',
                handler: this.options.onFileDelete,
            };
        }
        if (this.options.onFileRename instanceof Function) {
            contextMenu["rename"] = {
                label: 'Rename',
                handler: this.options.onFileRename,
            };
        }
        if (this.options.onFileCopy instanceof Function) {
            contextMenu["copy"] = {
                label: 'Copy',
                handler: this.options.onFileCopy,
            };
        }
        if (this.options.onFileMove instanceof Function) {
            contextMenu["move"] = {
                label: 'Move',
                handler: this.options.onFileMove,
            };
        }
        if (this.options.onFileShare instanceof Function) {
            contextMenu["share"] = {
                label: 'Share',
                handler: this.options.onFileShare,
            };
        }
        if (this.options.onFileInfo instanceof Function) {
            contextMenu["info"] = {
                label: 'Info',
                handler: this.options.onFileInfo,
            };
        }
        if (Object.keys(contextMenu).length > 0) {
            contextMenu.__generated = true;
            return contextMenu;
        }
        return null;
    }

    _evaluateOptions() {
        // Order of the columns
        // this.orderColumn = this.options.orderColumn;
        // this.orderAscending = this.options.orderAscending;

        // Mode of the file browser
        this._setMode(this.options.mode);

        this.options.onHtmlCreated = this.options.onHtmlCreated?.bind(this);

        let callbacks = ['onFileClick', 'onFileDoubleClick', 'onSelectionUpdate' , 'onFileDownload', 'onFileDelete', 'onFileRename', 'onFileCopy', 'onFileMove', 'onFileShare', 'onFileInfo'];
        callbacks.forEach((callback) => {
            this.options[callback] = covertCallback(this.options[callback], this);
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

    _placeFile(file, nextFile = null) {
        if (nextFile !== null) {
            nextFile._htmlElement.insertAdjacentElement('beforebegin', file._htmlElement);
        } else {
            this._elementsPlace.appendChild(file._htmlElement);
        }
        return file;
    }

    _renderFile(file) {
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
            element.querySelector('.fb-file-size').innerHTML = '';
        }
        this.options.onHtmlCreated?.call(this, element, file, this.mode);
        return file;
    }

    /**
     * Returns a comparison function to be used in the sort function to check the appropriate order of the files, taking
     *   into account the separation of folders from files and the showFirst option
     */
    _getDirectoryAndShowFirstComparisonFunctions() {
        if (this.options.separateFoldersFromFiles) {
            return function (a,b) {
                if (a.isDirectory && !b.isDirectory) {
                    return -1;
                }
                if (!a.isDirectory && b.isDirectory) {
                    return 1;
                }
                if (a.showFirst && !b.showFirst) {
                    return -1;
                }
                if (!a.showFirst && b.showFirst) {
                    return 1;
                }
                return 0;
            }
        } else {
            return function (a,b) {
                if (a.showFirst && !b.showFirst) {
                    return -1;
                }
                if (!a.showFirst && b.showFirst) {
                    return 1;
                }
                return 0;
            }
        }
    }

    /**
     * Returns a sort function to be used to sort the files in the FileBrowser
     * @param {string} column - the column to be sorted by ("filename", "size", "modified", "type")
     * @param {boolean} ascending - the order of the sorting (true = ascending, false = descending)
     * 
     * If the column or the ascending is null, the current orderColumn and orderAscending will be used
     * 
     * @returns a sort function to be used in the sort method of the filelist
     * @throws {Error} if the column is invalid
     */
    _getSortFunction(column = null, ascending = null) {
        if (column === null) {
            column = this.options.orderColumn;
        }
        if (ascending === null) {
            ascending = this.options.orderAscending;
        }
        let sortFunction = null;
        let checkDirectoryAndShowFirst = this._getDirectoryAndShowFirstComparisonFunctions();
        switch (column) {
            case 'filename':
                sortFunction = (a, b) => a.filename.localeCompare(b.filename);
                break;
            case 'size':
                sortFunction = (a, b) => a.size - b.size;
                break;
            case 'modified':
                sortFunction = (a, b) => {
                    if (a.modified === null) {
                        return -1;
                    }
                    if (b.modified === null) {
                        return 1;
                    }
                    return a.modified.getTime() - b.modified.getTime();
                }
                break;
            case 'type':
                sortFunction = (a, b) => a.type.localeCompare(b.type);
                break;
            default:
                throw new Error('Invalid column');
        }
        let multiplyer = ascending?1:-1;
        return (a, b) => {
            let result = checkDirectoryAndShowFirst(a,b);
            if (result !== 0) {
                return result;
            }
            return multiplyer * sortFunction(a,b);
        }
    }

    /**
     * Finds the next file of the given file in the filelist, so that the given file can be inserted before it
     * @param {FileInFileBrowser} file - the file to be inserted
     * @returns the next file in the filelist or null if the file is the last one
     */
    _findNextFile(file) {
        let sortFunction = this._getSortFunction();
        if (this.filelist.length == 0) {
            return null;
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
        return this.options.extensionToIcon[''] || 'far fa-file';
    }

    _createGrid() {
        let grid = document.createElement('div');
        grid.classList.add('fb-grid');
        this._elementsPlace = grid;
        return grid;
    }

    _createPreview() {
        let preview = document.createElement('div');
        preview.classList.add('fb-preview');
        this._elementsPlace = preview;
        return preview;
    }

    _createList() {
        let list = document.createElement('div');
        list.classList.add('fb-list');
        list.innerHTML = `
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
        `;
        this._elementsPlace = list.querySelector('tbody');
        return list;
    }

    _renderFiles() {
        this.filelist.forEach(file => {
            this._placeFile(this._renderFile(file));
        });
    }
}

FileBrowser.version = '1.0.5';

document.addEventListener('DOMContentLoaded', () => {
    FileBrowser.mutationObserver.observe(document.body, {
        childList: true,
        subtree: true,
    });
    FileBrowser.fromDOM(document.querySelectorAll('.fb-filebrowser'));
});

exports.FileBrowser = FileBrowser;