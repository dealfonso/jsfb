/**
   Copyright 2024 Carlos A. (https://github.com/dealfonso)

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/

(function (exports) {
	if (typeof exports === "undefined") {
		exports = window;
	}
	class FBDropdown {
		static defaults = {
			closeOnOutsideClick: true,
			openingSide: "auto",
			openingSideToPage: false
		};
		extractOptions() {
			let options = {};
			for (let key in FBDropdown.defaults) {
				if (this.dropdown.dataset[key] !== undefined) {
					options[key] = this.dropdown.dataset[key];
				}
			}
			return options;
		}
		constructor(dropdown, options = {}) {
			if (dropdown._fbDropdown !== undefined) {
				return dropdown._fbDropdown;
			}
			this.dropdown = dropdown;
			let effectiveOptions = Object.assign({}, FBDropdown.defaults, this.extractOptions(), options);
			this.options = effectiveOptions;
			this.toggle = dropdown.querySelector(".fb-dropdown-toggle");
			this.content = dropdown.querySelector(".fb-dropdown-content");
			this.isOpen = false;
			this.documentClickHandler = !this.options.closeOnOutsideClick ? null : event => {
				if (!this.dropdown.contains(event.target)) {
					this.hide();
				}
			};
			this.optionsInMenu = dropdown.querySelectorAll(".fb-dropdown-content"),
				this.closeHandler = event => {
					this.hide();
					event.stopPropagation();
				};
			this.toggle.addEventListener("click", event => {
				this.toggleOpen();
				event.stopPropagation();
			});
			this.optionsInMenu.forEach(option => {
				option.addEventListener("click", this.closeHandler);
			});
			if (this.options.closeOnOutsideClick) {
				document.addEventListener("click", this.documentClickHandler);
			}
			dropdown._fbDropdown = this;
		}
		show() {
			let openToLeft = false;
			switch (this.options.openingSide) {
			case "left":
				openToLeft = true;
				break;
			case "right":
				openToLeft = false;
				break;
			case "auto":
			default:
				let parentRect;
				if (this.options.openingSideToPage) {
					parentRect = document.body.getBoundingClientRect();
				} else {
					parentRect = this.dropdown.parentElement.getBoundingClientRect();
				}
				let buttonRect = this.toggle.getBoundingClientRect();
				this.content.style.removeProperty("right");
				this.content.style.removeProperty("left");
				this.content.style.removeProperty("top");
				this.content.style.removeProperty("bottom");
				let rect = this.content.getBoundingClientRect();
				let openToRightDistance = parentRect.right - (buttonRect.left + rect.width);
				let openToLeftDistance = buttonRect.right - rect.width - parentRect.left;
				if (openToLeftDistance > openToRightDistance) {
					openToLeft = true;
				}
				break;
			}
			if (openToLeft) {
				this.content.style.right = "0";
			}
			this.content.classList.add("show");
			this.isOpen = true;
		}
		hide() {
			this.content.classList.remove("show");
			this.isOpen = false;
		}
		toggleOpen() {
			this.isOpen = !this.isOpen;
			if (this.isOpen) {
				this.show();
			} else {
				this.hide();
			}
		}
	}
	FBDropdown.version = "1.0.0";
	if (typeof exports === "undefined") {
		exports = window;
	}
	class FileBrowser {
		static extensionToIcon = {
			txt: "fas fa-file-alt",
			pdf: "fas fa-file-pdf",
			doc: "fas fa-file-word",
			docx: "fas fa-file-word",
			xls: "fas fa-file-excel",
			xlsx: "fas fa-file-excel",
			ppt: "fas fa-file-powerpoint",
			pptx: "fas fa-file-powerpoint",
			jpg: "fas fa-file-image",
			jpeg: "fas fa-file-image",
			png: "fas fa-file-image",
			gif: "fas fa-file-image",
			mp3: "fas fa-file-audio",
			wav: "fas fa-file-audio",
			mov: "fas fa-file-video",
			mp4: "fas fa-file-video",
			avi: "fas fa-file-video",
			zip: "fas fa-file-archive",
			rar: "fas fa-file-archive",
			tar: "fas fa-file-archive",
			gz: "fas fa-file-archive",
			"7z": "fas fa-file-archive",
			exe: "fas fa-file-executable",
			js: "fas fa-file-code",
			css: "fas fa-file-code",
			html: "fas fa-file-code",
			php: "fas fa-file-code",
			py: "fas fa-file-code",
			java: "fas fa-file-code",
			c: "fas fa-file-code",
			cpp: "fas fa-file-code",
			h: "fas fa-file-code",
			hpp: "fas fa-file-code",
			json: "fas fa-file-code",
			xml: "fas fa-file-code",
			csv: "fas fa-file-excel",
			file: "fas fa-file",
			html: "fas fa-file-code",
			md: "fas fa-file-alt"
		};
		static defaultOptions = {
			mode: "list",
			orderColumn: "filename",
			orderAscending: true,
			hideZeroSize: true,
			allowDuplicates: false,
			separateFoldersFromFiles: true,
			onFileClick: file => {},
			onFileDoubleClick: file => {},
			overlayGenerator: file => null,
			onHtmlCreated: (element, file, mode) => {},
			onFileDownload: null,
			onFileDelete: null,
			onFileRename: null,
			onFileCopy: null,
			onFileMove: null,
			onFileShare: null,
			onFileInfo: null,
			extensionToIcon: FileBrowser.extensionToIcon,
			customContextMenu: null
		};
		static mutationObserver = new MutationObserver(mutations => {
			FileBrowser.fromDOM(document.querySelectorAll(".fb-filebrowser"));
		});
		static fromDOM(objects, options = {}) {
			let result = [];
			if (objects instanceof Element) {
				objects = [objects];
			} else if (objects instanceof NodeList) {
				objects = Array.from(objects);
			} else if (!Array.isArray(objects)) {
				throw new Error("Invalid type of objects");
			}
			if (objects.length === 0) {
				return null;
			}
			objects.forEach(filebrowser => {
				let current = filebrowser._fbFileBrowser ?? null;
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
		constructor(element, options = {}) {
			if (element instanceof Element) {} else if (typeof element === "string") {
				element = document.querySelector(element);
			} else {
				throw new Error("Invalid element");
			}
			if (element._fbFileBrowser !== undefined) {
				element._fbFileBrowser.updateOptions(options);
				return element._fbFileBrowser;
			}
			let optionsFromDOM = FileBrowser._optionsFromDOM(element, FileBrowser.defaultOptions, "fb");
			this.options = Object.assign({}, FileBrowser.defaultOptions, optionsFromDOM, options);
			this.orderColumn = null;
			this.orderAscending = null;
			this.mode = null;
			this.filelist = [];
			this._elementsPlace = null;
			this._htmlElement = element;
			this._evaluateOptions();
			element._fbFileBrowser = this;
			let files = element.querySelectorAll("fb-file");
			let existingFiles = Array.from(files).map(file => {
				const basicFileInformation = {
					filename: "",
					size: 0,
					modified: null,
					isDirectory: false,
					type: "file",
					previewUrl: null,
					icon: null,
					data: null
				};
				let options = FileBrowser._optionsFromDOM(file, basicFileInformation, "fb");
				return Object.assign({}, {
					filename: file.textContent,
					size: 0,
					modified: null
				}, options);
			});
			this.render();
			existingFiles.forEach(file => {
				if (file.isDirectory) {
					this.addFolder(file.filename, file.modified, file);
				} else {
					this.addFile(file.filename, file.size, file.modified, file);
				}
			});
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
		_setMode(mode) {
			switch (mode.toLowerCase()) {
			case "list":
			case "grid":
			case "preview":
				this.mode = mode;
				break;
			default:
				throw new Error("Invalid mode");
			}
		}
		_addFile(filename, options = {}) {
			if (!this.options.allowDuplicates) {
				let existing = this.filelist.find(file => file.filename === filename);
				if (existing !== undefined) {
					throw new Error("File already exists");
				}
			}
			filename = `${filename}`;
			options = Object.assign({}, {
				contextMenu: this.options.customContextMenu,
				icon: options.isDirectory ? "fa-regular fa-folder" : this._filenameToIcon(filename),
				type: filename.split(".").pop().toLowerCase(),
				onFileClick: this.options.onFileClick,
				onFileDoubleClick: this.options.onFileDoubleClick
			}, options);
			let file = new FileInFileBrowser(filename, options);
			let nextFile = this._findNextFile(file);
			if (nextFile !== null) {
				this.filelist.splice(this.filelist.indexOf(nextFile), 0, file);
				this._renderFile(file, nextFile);
			} else {
				this.filelist.push(file);
				this._renderFile(file);
			}
			return file;
		}
		addFile(filename, size, modified, options = {}) {
			return this._addFile(filename, Object.assign({}, options, {
				isDirectory: false,
				size: size,
				modified: modified
			}));
		}
		addOrUpdateFile(filename, options = {}) {
			let existing = this.findFile(filename);
			options = Object.assign({}, options, {
				isDirectory: false,
				type: filename.split(".").pop().toLowerCase()
			});
			if (existing === null) {
				return this.addFile(filename, 0, new Date(), options);
			}
			if (existing.isDirectory) {
				throw new Error("Existing file is not a file");
			}
			existing.update(options);
			this.render();
			return existing;
		}
		updateFile(filename, options = {}) {
			let existing = this.findFile(filename);
			if (existing === null) {
				throw new Error("File not found");
			}
			return this.addOrUpdateFile(filename, options);
		}
		addFolder(name, modified, options = {}) {
			return this._addFile(name, Object.assign({}, {
				icon: "fa-regular fa-folder",
				size: null
			}, options, {
				isDirectory: true,
				modified: modified
			}));
		}
		updateFolder(name, options = {}) {
			let existing = this.findFile(name);
			if (existing === null) {
				throw new Error("Folder not found");
			}
			return this.addOrUpdateFolder(name, options);
		}
		addOrUpdateFolder(name, options = {}) {
			options = Object.assign({}, options, {
				isDirectory: true,
				type: "folder"
			});
			let existing = this.findFile(name);
			if (existing === null) {
				return this.addFolder(name, new Date(), options);
			}
			if (!existing.isDirectory) {
				throw new Error("Existing file is not a folder");
			}
			existing.update(options);
			this.render();
			return existing;
		}
		findFile(filename) {
			let existing = this.filelist.find(file => file.filename === filename);
			if (existing === undefined) {
				return null;
			}
			return existing;
		}
		findFiles(filter) {
			let regex = new RegExp(filter.replace(/\*/g, ".*").replace(/\?/g, "."), "i");
			return this.filelist.filter(file => regex.test(file.filename));
		}
		removeFile(file) {
			if (file instanceof FileInFileBrowser) {
				let index = this.filelist.indexOf(file);
				if (index >= 0) {
					this.filelist.splice(index, 1);
				}
			} else if (typeof file === "string") {
				let files = this.getFiles(file);
				if (files.length === 0) {
					return;
				}
				files.forEach(file => {
					let index = this.filelist.indexOf(file);
					if (index >= 0) {
						this.filelist.splice(index, 1);
					}
				});
			}
			this.render();
		}
		forEachFile(callback) {
			this.filelist.forEach(callback);
			this.render();
		}
		render(mode = null) {
			if (mode !== null) {
				this._setMode(mode);
			}
			this._htmlElement.innerHTML = "";
			let element = null;
			switch (this.mode) {
			case "list":
				element = this._createList();
				break;
			case "grid":
				element = this._createGrid();
				break;
			case "preview":
				element = this._createPreview();
				break;
			}
			this._renderFiles();
			this._htmlElement.appendChild(element);
			if (this.mode === "list") {
				new ResizableColumnTable(element, {
					sortableHeaders: true,
					onSort: (column, ascending) => {
						switch (column.textContent.trim().toLowerCase()) {
						case "name":
							this.sort("filename", ascending == "asc");
							break;
						case "size":
							this.sort("size", ascending == "asc");
							break;
						case "modified":
							this.sort("modified", ascending == "asc");
							break;
						}
					}
				});
			}
		}
		sort(column, ascending) {
			let sortFunction = this._getSortFunction(column, ascending);
			this.orderColumn = column;
			this.orderAscending = ascending;
			this.filelist.sort(sortFunction);
			this._elementsPlace.innerHTML = "";
			this._renderFiles();
		}
		clear() {
			this.filelist = [];
			this.render();
		}
		static _optionsFromDOM(element, defaultOptions = {}, prefix = "fb") {
			let options = {};
			for (let key in defaultOptions) {
				let dataKey = prefix + key[0].toUpperCase() + key.slice(1);
				if (element.dataset[dataKey] !== undefined) {
					let value = element.dataset[dataKey];
					if (value === "true" || value === "false") {
						options[key] = value === "true";
					} else if (!isNaN(parseFloat(value)) && parseFloat(value).toString() == value) {
						options[key] = parseFloat(value);
					} else {
						options[key] = value;
					}
				}
			}
			return options;
		}
		_generateContextMenu() {
			let contextMenu = {};
			if (this.options.onFileDownload instanceof Function) {
				contextMenu["download"] = {
					label: "Download",
					handler: this.options.onFileDownload
				};
			}
			if (this.options.onFileDelete instanceof Function) {
				contextMenu["delete"] = {
					label: "Delete",
					handler: this.options.onFileDelete
				};
			}
			if (this.options.onFileRename instanceof Function) {
				contextMenu["rename"] = {
					label: "Rename",
					handler: this.options.onFileRename
				};
			}
			if (this.options.onFileCopy instanceof Function) {
				contextMenu["copy"] = {
					label: "Copy",
					handler: this.options.onFileCopy
				};
			}
			if (this.options.onFileMove instanceof Function) {
				contextMenu["move"] = {
					label: "Move",
					handler: this.options.onFileMove
				};
			}
			if (this.options.onFileShare instanceof Function) {
				contextMenu["share"] = {
					label: "Share",
					handler: this.options.onFileShare
				};
			}
			if (this.options.onFileInfo instanceof Function) {
				contextMenu["info"] = {
					label: "Info",
					handler: this.options.onFileInfo
				};
			}
			if (Object.keys(contextMenu).length > 0) {
				contextMenu.__generated = true;
				return contextMenu;
			}
			return null;
		}
		_evaluateOptions() {
			this.orderColumn = this.options.orderColumn;
			this.orderAscending = this.options.orderAscending;
			this._setMode(this.options.mode);
			this.options.onHtmlCreated = this.options.onHtmlCreated?.bind(this);
			let callbacks = ["onFileClick", "onFileDoubleClick", "onFileDownload", "onFileDelete", "onFileRename", "onFileCopy", "onFileMove", "onFileShare", "onFileInfo"];
			callbacks.forEach(callback => {
				this.options[callback] = covertCallback(this.options[callback], this);
			});
			if (this.options.customContextMenu === null || this.options.customContextMenu.__generated) {
				this.options.customContextMenu = this._generateContextMenu();
			}
			if ((this.options.extensionToIcon ?? null) === null) {
				this.options.extensionToIcon = {};
			}
			if (typeof this.options.extensionToIcon !== "object") {
				throw new Error("Invalid extensionToIcon");
			}
		}
		_renderFile(file, nextFile = null) {
			let element = null;
			switch (this.mode) {
			case "list":
				element = file.tableRow();
				break;
			case "grid":
				element = file.gridElement(this.options.overlayGenerator);
				break;
			case "preview":
				element = file.previewElement(this.options.overlayGenerator);
				break;
			}
			if (this.options.hideZeroSize && file.size === 0) {
				element.querySelector(".fb-file-size").innerHTML = "";
			}
			this.options.onHtmlCreated?.call(this, element, file, this.mode);
			if (nextFile !== null) {
				nextFile._htmlElement.insertAdjacentElement("beforebegin", element);
			} else {
				this._elementsPlace.appendChild(element);
			}
		}
		_getDirectoryAndShowFirstComparisonFunctions() {
			if (this.options.separateFoldersFromFiles) {
				return function (a, b) {
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
				};
			} else {
				return function (a, b) {
					if (a.showFirst && !b.showFirst) {
						return -1;
					}
					if (!a.showFirst && b.showFirst) {
						return 1;
					}
					return 0;
				};
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
			let checkDirectoryAndShowFirst = this._getDirectoryAndShowFirstComparisonFunctions();
			switch (column) {
			case "filename":
				sortFunction = (a, b) => a.filename.localeCompare(b.filename);
				break;
			case "size":
				sortFunction = (a, b) => a.size - b.size;
				break;
			case "modified":
				sortFunction = (a, b) => {
					if (a.modified === null) {
						return -1;
					}
					if (b.modified === null) {
						return 1;
					}
					return a.modified.getTime() - b.modified.getTime();
				};
				break;
			case "type":
				sortFunction = (a, b) => a.type.localeCompare(b.type);
				break;
			default:
				throw new Error("Invalid column");
			}
			let multiplyer = ascending ? 1 : -1;
			return (a, b) => {
				let result = checkDirectoryAndShowFirst(a, b);
				if (result !== 0) {
					return result;
				}
				return multiplyer * sortFunction(a, b);
			};
		}
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
			let extension = filename.split(".").pop().toLowerCase();
			if (this.options.extensionToIcon instanceof Function) {
				return this.options.extensionToIcon(extension);
			}
			if (extension in this.options.extensionToIcon) {
				return this.options.extensionToIcon[extension];
			}
			return this.options.extensionToIcon[""] || "far fa-file";
		}
		_createGrid() {
			let grid = document.createElement("div");
			grid.classList.add("fb-grid");
			this._elementsPlace = grid;
			return grid;
		}
		_createPreview() {
			let preview = document.createElement("div");
			preview.classList.add("fb-preview");
			this._elementsPlace = preview;
			return preview;
		}
		_createList() {
			let list = document.createElement("div");
			list.classList.add("fb-list");
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
			this._elementsPlace = list.querySelector("tbody");
			return list;
		}
		_renderFiles() {
			this.filelist.forEach(file => {
				this._renderFile(file);
			});
		}
	}
	FileBrowser.version = "1.0.2";
	document.addEventListener("DOMContentLoaded", () => {
		FileBrowser.mutationObserver.observe(document.body, {
			childList: true,
			subtree: true
		});
		FileBrowser.fromDOM(document.querySelectorAll(".fb-filebrowser"));
	});
	exports.FileBrowser = FileBrowser;
	if (typeof exports === "undefined") {
		exports = window;
	}
	class FileInFileBrowser {
		static defaultOptions = {
			size: 0,
			modified: null,
			icon: "fa fa-file",
			type: "file",
			isDirectory: false,
			showFirst: false,
			previewUrl: null,
			onFileClick: null,
			onFileDoubleClick: null,
			data: null,
			contextMenu: null
		};
		constructor(filename, options = {}) {
			options = Object.assign({}, FileInFileBrowser.defaultOptions, options);
			this.update(options);
			this.filename = filename;
			this.selected = false;
			this._htmlElement = null;
		}
		_setModified(modified) {
			if (modified === null) {
				this.modified = null;
				return;
			}
			if (typeof modified === "string" || modified instanceof String) {
				if (!isNaN(modified)) {
					modified = parseInt(modified);
				} else {
					let date = new Date(modified);
					if (date.toString() !== "Invalid Date") {
						modified = date;
					}
				}
			}
			if (typeof modified === "number" || modified instanceof Number) {
				let date = new Date(modified);
				if (date.toString() !== "Invalid Date") {
					modified = date;
				}
			}
			if (modified instanceof Date) {
				this.modified = modified;
			}
		}
		update(options = {}) {
			let optionNames = Object.keys(FileInFileBrowser.defaultOptions);
			for (let option of optionNames) {
				if (options[option] !== undefined) {
					switch (option) {
					case "modified":
						this._setModified(options[option]);
						break;
					default:
						this[option] = options[option];
						break;
					}
				}
			}
			this.isDirectory = options.isDirectory ?? false;
		}
		select() {
			this.selected = true;
			if (this._htmlElement) {
				this._htmlElement.classList.add("selected");
			}
		}
		unselect() {
			this.selected = false;
			if (this._htmlElement) {
				this._htmlElement.classList.remove("selected");
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
			if (this._htmlElement !== null && otherFile._htmlElement !== null) {
				otherFile._htmlElement.insertAdjacentElement("beforebegin", this._htmlElement);
			}
		}
		insertAfter(otherFile) {
			if (this._htmlElement !== null && otherFile._htmlElement !== null) {
				otherFile._htmlElement.insertAdjacentElement("afterend", this._htmlElement);
			}
		}
		createContextMenu() {
			if (this.contextMenu === null) {
				return null;
			}
			let contextMenu = document.createElement("div");
			contextMenu.classList.add("fb-dropdown", "fb-dropdown-s", "fb-file-context-menu");
			contextMenu.innerHTML = `
            <button class="fb-dropdown-toggle" type="button">
                <i class="fa fa-ellipsis-v"></i>
            </button>`;
			let dropdownContent = document.createElement("ul");
			dropdownContent.classList.add("fb-dropdown-content");
			let contextMenuOptions = this.contextMenu;
			if (contextMenuOptions instanceof Array) {
				contextMenuOptions = contextMenuOptions.reduce((acc, item) => {
					acc[item] = {};
					return acc;
				}, {});
			}
			for (let option in contextMenuOptions) {
				if (option.startsWith("__")) {
					continue;
				}
				let item = document.createElement("li");
				let button = document.createElement("button");
				button.type = "button";
				button.dataset.action = option;
				let text = contextMenuOptions[option].label ?? option;
				if (contextMenuOptions[option].icon) {
					button.innerHTML = `<i class="${contextMenuOptions[option].icon}"></i> ${text}`;
				} else {
					button.innerText = text;
				}
				let handler = contextMenuOptions[option].handler ?? contextMenuOptions[option];
				if (handler instanceof Function) {
					button.addEventListener("click", file => {
						handler(this);
					});
				}
				item.appendChild(button);
				dropdownContent.appendChild(item);
			}
			contextMenu.appendChild(dropdownContent);
			new FBDropdown(contextMenu, {
				closeOnOutsideClick: true
			});
			return contextMenu;
		}
		tableRow() {
			if (this._htmlElement !== null) {
				this._htmlElement.remove();
			}
			let row = document.createElement("tr");
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
				row.classList.add("selected");
			}
			row.addEventListener("click", () => {
				if (this.onFileClick instanceof Function) {
					this.onFileClick(this);
				}
			});
			row.addEventListener("dblclick", () => {
				if (this.onFileDoubleClick instanceof Function) {
					this.onFileDoubleClick(this);
				}
			});
			if (this.selected) {
				row.classList.add("selected");
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
			let element = document.createElement("div");
			element.classList.add("fb-file-wrapper");
			element.innerHTML = `
            <div class="fb-file">
            </div>
        `;
			let previewElement = element.querySelector(".fb-file");
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
			if (overlay !== null || contextMenu !== null) {
				let overlayElement = document.createElement("div");
				overlayElement.classList.add("fb-preview-overlay");
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
				element.classList.add("selected");
			}
			this._htmlElement = element;
			element.addEventListener("click", () => {
				if (this.onFileClick instanceof Function) {
					this.onFileClick(this);
				}
			});
			element.addEventListener("dblclick", () => {
				if (this.onFileDoubleClick instanceof Function) {
					this.onFileDoubleClick(this);
				}
			});
			return this._htmlElement;
		}
		_modifiedStr() {
			return this.modified === null || this.modified === undefined ? "" : this.modified.toLocaleString();
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
			let element = document.createElement("div");
			element.classList.add("fb-file-wrapper");
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
			if (overlay !== null || contextMenu !== null) {
				let overlayElement = document.createElement("div");
				overlayElement.classList.add("fb-file-overlay");
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
				element.classList.add("selected");
			}
			this._htmlElement = element;
			element.addEventListener("click", () => {
				if (this.onFileClick instanceof Function) {
					this.onFileClick(this);
				}
			});
			element.addEventListener("dblclick", () => {
				if (this.onFileDoubleClick instanceof Function) {
					this.onFileDoubleClick(this);
				}
			});
			return this._htmlElement;
		}
	}
	exports.FileInFileBrowser = FileInFileBrowser;
	const ClassesMixin = {
		hasClasses: function (classes) {
			if (typeof classes === "string") {
				classes = classes.split(" ").map(c => c.trim()).filter(c => c.length > 0);
			}
			if (!Array.isArray(classes)) {
				throw new Error("Classes must be an array or a string");
			}
			return classes.every(c => this.classList.contains(c));
		},
		addClasses: function (classes) {
			if (typeof classes === "string") {
				classes = classes.split(" ").map(c => c.trim()).filter(c => c.length > 0);
			}
			if (!Array.isArray(classes)) {
				throw new Error("Classes must be an array or a string");
			}
			classes.forEach(c => this.classList.add(c));
		},
		removeClasses: function (classes) {
			if (typeof classes === "string") {
				classes = classes.split(" ").map(c => c.trim()).filter(c => c.length > 0);
			}
			if (!Array.isArray(classes)) {
				throw new Error("Classes must be an array or a string");
			}
			classes.forEach(c => this.classList.remove(c));
		}
	};
	class ResizableColumnTable {
		static defaultOptions = {
			firstColumn: 0,
			lastColumn: -1,
			sortableHeaders: true,
			classSorter: "sorter fas",
			classUnsorted: "fa-sort",
			classSorterUp: "up fa-sort-up",
			classSorterDown: "down fa-sort-down",
			onSort: (header, direction) => {}
		};
		constructor(table, options = {}) {
			this.options = Object.assign({}, ResizableColumnTable.defaultOptions, options);
			let headers = table.querySelectorAll("th");
			if (this.options.lastColumn < 0) {
				this.options.lastColumn = headers.length + this.options.lastColumn;
			}
			if (this.options.lastColumn < 0 || this.options.lastColumn >= headers.length) {
				throw new Error("Last column is invalid");
			}
			if (this.options.firstColumn > this.options.lastColumn) {
				throw new Error("First column is greater than last column");
			}
			this.table = table;
			this.table._fbResizableTable = this;
			this.headers = headers;
			this.resizers = [];
			let previousHeader = null;
			for (let i = this.options.firstColumn; i < this.options.lastColumn + 1; i++) {
				let header = headers[i];
				let resizer = document.createElement("div");
				resizer.classList.add("fb-resizer");
				header.appendChild(resizer);
				this.resizers.push(resizer);
				this.addEventHandlers(header, resizer);
				if (previousHeader != null) {
					previousHeader._nextHeader = header;
				}
				previousHeader = header;
			}
			if (previousHeader != null && previousHeader != headers[headers.length - 1]) {
				previousHeader._nextHeader = headers[headers.length - 1];
			}
			if (this.options.sortableHeaders) {
				this.addSortingIcons();
			}
		}
		addSortingIcons() {
			let columnIndexes = [];
			if (!Array.isArray(this.options.sortableHeaders)) {
				if (this.options.sortableHeaders === true) {
					columnIndexes = Array.from(this.headers).map((header, index) => index);
				}
			} else {
				columnIndexes = this.options.sortableHeaders.filter(index => index >= 0 && index < this.headers.length);
			}
			columnIndexes.forEach(index => {
				let header = this.headers[index];
				let sortingIcon = document.createElement("i");
				Object.assign(sortingIcon, ClassesMixin);
				sortingIcon.addClasses(this.options.classSorter);
				sortingIcon.addClasses(this.options.classUnsorted);
				header.addEventListener("click", event => {
					header.closest("thead").querySelectorAll(".sorter").forEach(icon => {
						if (icon != sortingIcon) {
							icon.removeClasses(this.options.classSorterUp);
							icon.removeClasses(this.options.classSorterDown);
							icon.addClasses(this.options.classUnsorted);
						}
					});
					if (sortingIcon.hasClasses(this.options.classSorterUp)) {
						sortingIcon.removeClasses(this.options.classUnsorted);
						sortingIcon.removeClasses(this.options.classSorterUp);
						sortingIcon.addClasses(this.options.classSorterDown);
					} else if (sortingIcon.hasClasses(this.options.classSorterDown)) {
						sortingIcon.removeClasses(this.options.classUnsorted);
						sortingIcon.removeClasses(this.options.classSorterDown);
						sortingIcon.addClasses(this.options.classSorterUp);
					} else {
						sortingIcon.removeClasses(this.options.classUnsorted);
						sortingIcon.addClasses(this.options.classSorterUp);
						sortingIcon.removeClasses(this.options.classSorterDown);
					}
					if (this.options.onSort instanceof Function) {
						this.options.onSort(header, sortingIcon.hasClasses(this.options.classSorterUp) ? "asc" : "desc");
					}
				});
				header.appendChild(sortingIcon);
			});
		}
		updateResizerHeight() {
			this.resizers.forEach(resizer => {
				resizer.style.height = this.table.offsetHeight + "px";
			});
		}
		addEventHandlers(th, resizer) {
			let x = 0;
			let width = 0;
			let next_header = null;
			let next_width = 0;
			let mousemoveEventHander = event => {
				let dx = event.clientX - x;
				if (width + dx < 20) {
					return;
				}
				if (next_header != null) {
					next_header.style.width = next_width - dx + "px";
					if (next_width - dx < 20) {
						return;
					}
				}
				th.style.width = width + dx + "px";
			};
			let mouseupEventHandler = () => {
				document.removeEventListener("mousemove", mousemoveEventHander);
				document.removeEventListener("mouseup", mouseupEventHandler);
				th.classList.remove("resizing");
				th._nextHeader?.classList.remove("resizing");
				resizer.classList.remove("resizing");
			};
			resizer.addEventListener("mousedown", event => {
				x = event.clientX;
				width = parseInt(window.getComputedStyle(th).width, 10);
				next_header = th._nextHeader ?? null;
				if (next_header != null) {
					next_width = parseInt(window.getComputedStyle(next_header).width, 10);
				}
				document.addEventListener("mousemove", mousemoveEventHander);
				document.addEventListener("mouseup", mouseupEventHandler);
				th.classList.add("resizing");
				th._nextHeader?.classList.add("resizing");
				resizer.classList.add("resizing");
			});
		}
	}

	function btoa_utf8(value) {
		return btoa(String.fromCharCode(...new TextEncoder("utf-8").encode(value)));
	}

	function atob_utf8(value) {
		const value_latin1 = atob(value);
		return new TextDecoder("utf-8").decode(Uint8Array.from({
			length: value_latin1.length
		}, (element, index) => value_latin1.charCodeAt(index)));
	}

	function toHumanSize(size) {
		if (size === null || size === undefined) {
			return "";
		}
		const units = ["B", "KB", "MB", "GB", "TB"];
		let unitIndex = 0;
		size = parseFloat(size);
		if (isNaN(size)) {
			return "0 B";
		}
		while (size >= 1024 && unitIndex < units.length - 1) {
			size /= 1024;
			unitIndex++;
		}
		return `${size.toFixed(2)} ${units[unitIndex]}`;
	}

	function covertCallback(callback, context = null) {
		if (callback === null) {
			return null;
		}
		if (typeof callback === "string") {
			let stringCallback = callback;
			callback = _ => {
				const file = _;
				eval(stringCallback);
			};
		}
		if (callback instanceof Function) {
			if (context !== null) {
				return callback.bind(context);
			}
			return callback;
		}
		throw new Error("Invalid callback");
	}

	function isValidURL(url) {
		if (url instanceof URL) {
			return true;
		}
		try {
			new URL(url);
			return true;
		} catch (_) {
			return false;
		}
	}
})(window);
