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
        // this._tableRow = null;
        this.selected = false;
        this._clickHandler = null;
        this._dblclickHandler = null;
        this._contextMenu = contextMenu;
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
        // if (this._htmlElement !== null) {
        //     return this._htmlElement;
        // }
        if (this._htmlElement !== null) {
            this._htmlElement.remove();
        }

        let row = document.createElement('tr');
        row.innerHTML = `
            <td class="jsfb-file-name"><span class="jsfb-file-icon"><i class="fas ${this.icon}"></i></span> ${this.filename}</td>
            <td class="jsfb-file-size">${toHumanSize(this.size)}</td>
            <td class="jsfb-file-modified">${this.modified}</td>
        `;

        row.dataset.filename = this.filename//btoa_utf8(this.filename);
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
        if (this.selected) {
            row.classList.add('selected');
        }

        this._htmlElement = row;
        return this._htmlElement;
    }
    htmlElement(overlayGenerator = null) {
        // if (this._htmlElement !== null) {
        //     return this._htmlElement;
        // }
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
            element.classList.add('selected');
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