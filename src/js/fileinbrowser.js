if (typeof exports === 'undefined') {
    exports = window;
}

class FileInFileBrowser {
    static defaultOptions = {
        // The size of the file
        size: 0,
        // The date when the file was modified (it can be a Date object, a string or a number); null means that the file
        //  modification date is unknown
        modified: null,
        // The class to be used for the icon (into the i tag)
        icon: "fa fa-file",
        // The type of the file (file, image, video, audio, etc.)
        type: 'file',
        // If the file is a directory (it will be rendered as a folder)
        isDirectory: false,
        // In case that the file has to be shown first (for example, the '..' file). In this case, there will be no
        //  order in the files, the first file will be shown first.
        showFirst: false,
        // The URL to be used as a preview (in the preview mode, if the file is not a folder)
        previewUrl: null,
        // The function to be called when the file is clicked
        onFileClick: null,
        // The function to be called when the file is double clicked
        onFileDoubleClick: null,
        // A user defined data to be stored in the file
        data: null,
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
        contextMenu: null,
    };

    constructor(filename, options = {}) {
        options = Object.assign({}, FileInFileBrowser.defaultOptions, options);
        this.update(options);

        // The name of the file
        this.filename = filename;
        this.selected = false;

        // The HTML element to be used to show the file
        this._htmlElement = null;
    }

    _modifiedToDate(modified) {
        if (modified === null) {
            return null;
        }
        if ((typeof modified === 'string') || (modified instanceof String)) {
            // Check if the string is a number
            if (!isNaN(modified)) {
                modified = parseInt(modified);
            }
            else {
                let date = new Date(modified);
                if (date.toString() !== 'Invalid Date') {
                    modified = date;
                }
            }
        }
        if ((typeof modified === 'number') || (modified instanceof Number)) {
            let date = new Date(modified);
            if (date.toString() !== 'Invalid Date') {
                modified = date;
            }
        }
        if (modified instanceof Date) {
            return modified;
        }
        return null;
    }

    _setModified(modified) {
        this.modified = this._modifiedToDate(modified);

        // if (modified === null) {
        //     this.modified = null;
        //     return;
        // }
        // if ((typeof modified === 'string') || (modified instanceof String)) {
        //     // Check if the string is a number
        //     if (!isNaN(modified)) {
        //         modified = parseInt(modified);
        //     }
        //     else {
        //         let date = new Date(modified);
        //         if (date.toString() !== 'Invalid Date') {
        //             modified = date;
        //         }
        //     }
        // }
        // if ((typeof modified === 'number') || (modified instanceof Number)) {
        //     let date = new Date(modified);
        //     if (date.toString() !== 'Invalid Date') {
        //         modified = date;
        //     }
        // }
        // if (modified instanceof Date) {
        //     this.modified = modified;
        // } 
    }

    compareOptions(options) {
        for (let option in FileInFileBrowser.defaultOptions) {
            if (options[option] !== undefined) {
                switch (option) {
                    case 'modified':
                        if (this.modified?.getTime() !== this._modifiedToDate(options[option])?.getTime()) {
                            return false;
                        }
                        break;
                    default:
                        if (this[option] !== options[option]) {
                            return false;
                        }
                        break;
                }
            }
        }
        return true;
    }

    update(options = {}) {
        let optionNames = Object.keys(FileInFileBrowser.defaultOptions);
        for (let option of optionNames) {
            if (options[option] !== undefined) {
                switch (option) {
                    case 'modified':
                        this._setModified(options[option]);
                        break;
                    default:
                        this[option] = options[option];
                        break;
                }
            }
        }
        // if (this.previewUrl !== null) {
        //     if (!isValidURL(this.previewUrl)) {
        //         this.previewUrl = null;
        //         console.warn('The preview URL is not valid');
        //     }
        // }
        this.isDirectory = options.isDirectory??false;
    }
    select() {
        this.selected = true;
        if (this._htmlElement) {
            this._htmlElement.classList.add('selected');
        }
    }
    unselect() {
        this.selected = false;
        if (this._htmlElement) {
            this._htmlElement.classList.remove('selected');
        }
    }
    toggleSelect() {
        if (this.selected) {
            this.unselect();
        } else {
            this.select();
        }
    }
    insertBefore(otherFile) {
        if ((this._htmlElement !== null) && (otherFile._htmlElement !== null)) {
            otherFile._htmlElement.insertAdjacentElement('beforebegin', this._htmlElement);
        }
    }
    insertAfter(otherFile) {
        if ((this._htmlElement !== null) && (otherFile._htmlElement !== null)) {
            otherFile._htmlElement.insertAdjacentElement('afterend', this._htmlElement);
        }
    }
    createContextMenu() {
        if (this.contextMenu === null) {
            return null;
        }
        let contextMenu = document.createElement('div');
        contextMenu.classList.add('fb-dropdown', 'fb-dropdown-s', 'fb-file-context-menu');
        contextMenu.innerHTML = `
            <button class="fb-dropdown-toggle" type="button">
                <i class="fa fa-ellipsis-v"></i>
            </button>`;
        let dropdownContent = document.createElement('ul');
        dropdownContent.classList.add('fb-dropdown-content');

        let contextMenuOptions = this.contextMenu;

        if (contextMenuOptions instanceof Array) {
            contextMenuOptions = contextMenuOptions.reduce((acc, item) => {
                acc[item] = {};
                return acc;
            }, {});
        }
        for (let option in contextMenuOptions) {
            if (option.startsWith('__')) {
                continue;
            }

            // Create the structure for the context menu
            let item = document.createElement('li');

            // Prepare the button and get the options for each item
            let button = document.createElement('button');
            button.type = 'button';
            button.dataset.action = option;
            let text = contextMenuOptions[option].label ?? option;
            if (contextMenuOptions[option].icon) {
                button.innerHTML = `<i class="${contextMenuOptions[option].icon}"></i> ${text}`;
            } else {
                button.innerText = text;
            }
            let handler = contextMenuOptions[option].handler ?? contextMenuOptions[option];
            if (handler instanceof Function) {
                button.addEventListener('click', (file) => {
                    handler(this);
                });
            }
            item.appendChild(button);
            dropdownContent.appendChild(item);
        }
        contextMenu.appendChild(dropdownContent);

        new FBDropdown(contextMenu, { closeOnOutsideClick: true });

        return contextMenu;
    }
    tableRow() {
        if (this._htmlElement !== null) {
            this._htmlElement.remove();
        }

        let row = document.createElement('tr');
        row.innerHTML = `
            <td class="fb-file-name"><span class="fb-file-icon"><i class="${this.icon}"></i></span> ${this.filename}</td>
            <td class="fb-file-size">${toHumanSize(this.size)}</td>
            <td class="fb-file-modified">${this._modifiedStr()}</td>
        `;

        row.dataset.filename = btoa_utf8(this.filename);
        row.dataset.size = this.size;
        row.dataset.modified = this.modified?.getTime();
        row.dataset.type = this.type;

        if (this.selected) {
            row.classList.add('selected');
        }
        row.addEventListener('click', (e) => {
            if (this.onFileClick instanceof Function) {
                this.onFileClick(this, e);
            }
        });
        row.addEventListener('dblclick', (e) => {
            if (this.onFileDoubleClick instanceof Function) {
                this.onFileDoubleClick(this, e);
            }
        });
        if (this.selected) {
            row.classList.add('selected');
        }

        this._htmlElement = row;
        return this._htmlElement;
    }
    previewElement(overlayGenerator = null) {
        if (this._htmlElement !== null) {
            this._htmlElement.remove();
        }

        let overlay = null;
        if (overlayGenerator instanceof Function) {
            overlay = overlayGenerator(this);
        }

        let contextMenu = this.createContextMenu();

        let element = document.createElement('div');
        element.classList.add('fb-file-wrapper');
        element.innerHTML = `
            <div class="fb-file">
            </div>
        `;
        let previewElement = element.querySelector('.fb-file');
        if (this.previewUrl !== null) {
            previewElement.innerHTML = `
                <div class="fb-preview-image">
                    <div class="fb-preview-image-background" style="background-image: url('${this.previewUrl}')"></div>
                    <div class="fb-preview-image-image" style="background-image: url('${this.previewUrl}')"></div>
                </div>
            `;
        } else {
            previewElement.innerHTML = `
                <div class="fb-file-icon">
                    <i class="${this.icon}"></i>
                </div>`;
        }
        previewElement.innerHTML += `
                <div class="fb-file-details">
                    <p class="fb-file-name">${this.filename}</p>
                    <p class="fb-file-size">${toHumanSize(this.size)}</p>
                    <p class="fb-file-modified">${this._modifiedStr()}</p>
                </div>
        `;

        if ((overlay !== null) || (contextMenu !== null)) {
            let overlayElement = document.createElement('div');
            overlayElement.classList.add('fb-preview-overlay');
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
        element.dataset.modified = this.modified?.getTime();
        element.dataset.type = this.type;

        if (this.selected) {
            element.classList.add('selected');
        }
        this._htmlElement = element;
        // element = element.querySelector('.fb-file');
        element.addEventListener('click', (e) => {
            if (this.onFileClick instanceof Function) {
                this.onFileClick(this, e);
            }
        });
        element.addEventListener('dblclick', (e) => {
            if (this.onFileDoubleClick instanceof Function) {
                this.onFileDoubleClick(this, e);
            }
        }
        );
        return this._htmlElement;
    }

    _modifiedStr() {
        return ((this.modified===null)||(this.modified===undefined))?'':this.modified.toLocaleString();
    }

    gridElement(overlayGenerator = null) {
        if (this._htmlElement !== null) {
            this._htmlElement.remove();
        }

        let overlay = null;
        if (overlayGenerator instanceof Function) {
            overlay = overlayGenerator(this);
        }

        let contextMenu = this.createContextMenu();     

        let element = document.createElement('div');
        element.classList.add('fb-file-wrapper');
        element.innerHTML = `
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
        `;

        if ((overlay !== null) || (contextMenu !== null)) {
            let overlayElement = document.createElement('div');
            overlayElement.classList.add('fb-file-overlay');
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
        element.dataset.modified = this.modified?.getTime();
        element.dataset.type = this.type;

        if (this.selected) {
            element.classList.add('selected');
        }
        this._htmlElement = element;
        // element = element.querySelector('.fb-file');
        element.addEventListener('click', (e) => {
            if (this.onFileClick instanceof Function) {
                this.onFileClick(this, e);
            }
        });
        element.addEventListener('dblclick', (e) => {
            if (this.onFileDoubleClick instanceof Function) {
                this.onFileDoubleClick(this, e);
            }
        });
        return this._htmlElement;
    }
}

exports.FileInFileBrowser = FileInFileBrowser;