class FileInFileBrowser {
    static defaultOptions = {
        icon: "jsfb-svg-icon jsfb-svg-icon-file fa fa-file",
        type: 'file',
        contextMenu: null,
        isDirectory: false,
        onClick: null,
        onDoubleClick: null,
        previewUrl: null,
    };

    constructor(filename, size, modified, options = {}) {
        this.options = Object.assign({}, FileInFileBrowser.defaultOptions, options);
        this.filename = filename;
        this.size = size;
        this.type = this.options.type??'file';
        this.isDirectory = this.options.isDirectory??false;

        this.modified = null;
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
            this.modified = modified;
        } 

        this._htmlElement = null;
        this.selected = false;
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
        if (this.options.contextMenu === null) {
            return null;
        }
        let contextMenu = document.createElement('div');
        contextMenu.classList.add('jsfb-dropdown', 'jsfb-dropdown-s', 'jsfb-file-context-menu');
        contextMenu.innerHTML = `
            <button class="jsfb-dropdown-toggle no-chevron" type="button">
                <i class="jsfb-svg-icon jsfb-svg-icon-ellipsis-v fa fa-ellipsis-v"></i>
            </button>`;
        let dropdownContent = document.createElement('ul');
        dropdownContent.classList.add('jsfb-dropdown-content');

        let contextMenuOptions = this.options.contextMenu;

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
        return contextMenu;
    }
    tableRow() {
        if (this._htmlElement !== null) {
            this._htmlElement.remove();
        }

        let row = document.createElement('tr');
        row.innerHTML = `
            <td class="jsfb-file-name"><span class="jsfb-file-icon"><i class="${this.options.icon}"></i></span> ${this.filename}</td>
            <td class="jsfb-file-size">${toHumanSize(this.size)}</td>
            <td class="jsfb-file-modified">${this.modified?.toLocaleString()}</td>
        `;

        row.dataset.filename = btoa_utf8(this.filename);
        row.dataset.size = this.size;
        row.dataset.modified = this.modified?.getTime();
        row.dataset.type = this.options.type;

        if (this.selected) {
            row.classList.add('selected');
        }
        row.addEventListener('click', () => {
            if (this.options.onClick instanceof Function) {
                this.options.onClick(this);
            }
        });
        row.addEventListener('dblclick', () => {
            if (this.options.onDoubleClick instanceof Function) {
                this.options.onDoubleClick(this);
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
        element.classList.add('jsfb-preview-file-wrapper');
        element.innerHTML = `
            <div class="jsfb-preview-file">
            </div>
        `;
        let previewElement = element.querySelector('.jsfb-preview-file');
        if (this.options.previewUrl !== null) {
            previewElement.innerHTML = `
                <div class="jsfb-preview-image">
                    <div class="jsfb-preview-image-background" style="background-image: url('${this.options.previewUrl}')"></div>
                    <div class="jsfb-preview-image-image" style="background-image: url('${this.options.previewUrl}')"></div>
                </div>
            `;
        } else {
            previewElement.innerHTML = `
                <div class="jsfb-file-icon">
                    <i class="${this.options.icon}"></i>
                </div>`;
        }
        previewElement.innerHTML += `
                <div class="jsfb-file-details">
                    <p class="jsfb-file-name">${this.filename}</p>
                    <p class="jsfb-file-size">${toHumanSize(this.size)}</p>
                    <p class="jsfb-file-modified">${this.modified?.toLocaleString()}</p>
                </div>
        `;

        if ((overlay !== null) || (contextMenu !== null)) {
            let overlayElement = document.createElement('div');
            overlayElement.classList.add('jsfb-preview-overlay');
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
        element.dataset.type = this.options.type;

        if (this.selected) {
            element.classList.add('selected');
        }
        this._htmlElement = element;
        // element = element.querySelector('.jsfb-preview-file');
        element.addEventListener('click', () => {
            if (this.options.onClick instanceof Function) {
                this.options.onClick(this);
            }
        });
        element.addEventListener('dblclick', () => {
            if (this.options.onDoubleClick instanceof Function) {
                this.options.onDoubleClick(this);
            }
        }
        );
        return this._htmlElement;
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
        element.classList.add('jsfb-file-wrapper');
        element.innerHTML = `
            <div class="jsfb-file">
                <div class="jsfb-file-icon">
                    <i class="${this.options.icon}"></i>
                </div>
                <div class="jsfb-file-details" title="${this.filename}">
                    <p class="jsfb-file-name">${this.filename}</p>
                    <p class="jsfb-file-size">${toHumanSize(this.size)}</p>
                    <p class="jsfb-file-modified">${this.modified?.toLocaleString()}</p>
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
        element.dataset.modified = this.modified?.getTime();
        element.dataset.type = this.options.type;

        if (this.selected) {
            element.classList.add('selected');
        }
        this._htmlElement = element;
        element = element.querySelector('.jsfb-file');
        element.addEventListener('click', () => {
            if (this.options.onClick instanceof Function) {
                this.options.onClick(this);
            }
        });
        element.addEventListener('dblclick', () => {
            if (this.options.onDoubleClick instanceof Function) {
                this.options.onDoubleClick(this);
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