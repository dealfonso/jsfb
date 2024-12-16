const ClassesMixin = {
    hasClasses: function(classes) {
        if (typeof classes === 'string') {
            classes = classes.split(' ').map((c) => c.trim()).filter((c) => c.length > 0);
        }
        if (!Array.isArray(classes)) {
            throw new Error('Classes must be an array or a string');
        }
        return classes.every((c) => this.classList.contains(c));
    },
    addClasses: function(classes) {
        if (typeof classes === 'string') {
            classes = classes.split(' ').map((c) => c.trim()).filter((c) => c.length > 0);
        }
        if (!Array.isArray(classes)) {
            throw new Error('Classes must be an array or a string');
        }
        classes.forEach((c) => this.classList.add(c));
    },
    removeClasses: function(classes) {
        if (typeof classes === 'string') {
            classes = classes.split(' ').map((c) => c.trim()).filter((c) => c.length > 0);
        }
        if (!Array.isArray(classes)) {
            throw new Error('Classes must be an array or a string');
        }
        classes.forEach((c) => this.classList.remove(c));
    }
};

class ResizableColumnTable {
    static defaultOptions = {
        firstColumn: 0,
        lastColumn: -1,
        sortableHeaders: true,
        classSorter: 'sorter fas',
        classUnsorted: 'fa-sort',
        classSorterUp: 'up fa-sort-up',
        classSorterDown: 'down fa-sort-down',
        onSort: (header, direction) => { }
    };

    constructor(table, options = {}) {
        this.options = Object.assign({}, ResizableColumnTable.defaultOptions, options);

        let headers = table.querySelectorAll('th');
        if (this.options.lastColumn < 0) {
            this.options.lastColumn = headers.length + this.options.lastColumn;
        }
        if ((this.options.lastColumn < 0) || (this.options.lastColumn >= headers.length)) {
            throw new Error('Last column is invalid');
        }
        if (this.options.firstColumn > this.options.lastColumn) {
            throw new Error('First column is greater than last column');
        }

        this.table = table;
        this.table._jsfbResizableTable = this;
        this.headers = headers;

        // Create the resizer elements
        this.resizers = [];
        let previousHeader = null;
        for (let i = this.options.firstColumn; i < this.options.lastColumn + 1 ; i++) {
            let header = headers[i];
            let resizer = document.createElement('div');
            resizer.classList.add('fb-resizer');
            header.appendChild(resizer);
            this.resizers.push(resizer);
            this.addEventHandlers(header, resizer);

            // Link the headers
            if (previousHeader != null) {
                previousHeader._nextHeader = header;
            }
            previousHeader = header;
        }
        if ((previousHeader != null) && (previousHeader != headers[headers.length - 1])) {
            previousHeader._nextHeader = headers[headers.length - 1];
        }

        if (this.options.sortableHeaders) {
            this.addSortingIcons();
        }        
        // this.updateResizerHeight();
    }

    addSortingIcons() {
        let columnIndexes = [];

        // Check if the sortableHeaders is an array of indexes of sortable headers or if it is a boolean
        if (!Array.isArray(this.options.sortableHeaders)) {
            if (this.options.sortableHeaders === true) {
                columnIndexes = Array.from(this.headers).map((header, index) => index);
            }
        } else {
            columnIndexes = this.options.sortableHeaders.filter((index) => index >= 0 && index < this.headers.length);
        }

        columnIndexes.forEach((index) => {
            let header = this.headers[index];
            // Add the sorting icon
            let sortingIcon = document.createElement('i');
            Object.assign(sortingIcon, ClassesMixin);
            sortingIcon.addClasses(this.options.classSorter);
            sortingIcon.addClasses(this.options.classUnsorted);

            header.addEventListener('click', (event) => {
                header.closest('thead').querySelectorAll('.sorter').forEach((icon) => {
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
                } else
                if (sortingIcon.hasClasses(this.options.classSorterDown)) {
                    sortingIcon.removeClasses(this.options.classUnsorted);
                    sortingIcon.removeClasses(this.options.classSorterDown);
                    sortingIcon.addClasses(this.options.classSorterUp);
                } else {
                    sortingIcon.removeClasses(this.options.classUnsorted);
                    sortingIcon.addClasses(this.options.classSorterUp);
                    sortingIcon.removeClasses(this.options.classSorterDown);
                }

                if (this.options.onSort instanceof Function) {
                    this.options.onSort(header, sortingIcon.hasClasses(this.options.classSorterUp) ? 'asc' : 'desc');
                }
            });
            header.appendChild(sortingIcon);
        });        
    }

    updateResizerHeight() {
        this.resizers.forEach((resizer) => {
            resizer.style.height = this.table.offsetHeight + 'px';
        });
    }

    addEventHandlers(th, resizer) {
        let x = 0;
        let width = 0;
        let next_header = null;
        let next_width = 0;

        let mousemoveEventHander = (event) => {
            let dx = event.clientX - x;
            if (width + dx < 20) {
                return;
            }
            if (next_header != null) {
                next_header.style.width = next_width - dx + 'px';
                if (next_width - dx < 20) {
                    return;
                }
            }
            th.style.width = width + dx + 'px';
        }

        let mouseupEventHandler = () => {
            document.removeEventListener('mousemove', mousemoveEventHander);
            document.removeEventListener('mouseup', mouseupEventHandler);
            th.classList.remove('resizing');
            th._nextHeader?.classList.remove('resizing');
            resizer.classList.remove('resizing');
        }

        resizer.addEventListener('mousedown', (event) => {
            x = event.clientX;
            width = parseInt(window.getComputedStyle(th).width, 10);
            next_header = th._nextHeader??null;
            if (next_header != null) {
                next_width = parseInt(window.getComputedStyle(next_header).width, 10);
            }
            document.addEventListener('mousemove', mousemoveEventHander);
            document.addEventListener('mouseup', mouseupEventHandler);
            th.classList.add('resizing');
            th._nextHeader?.classList.add('resizing');
            resizer.classList.add('resizing');
        });
    }
}