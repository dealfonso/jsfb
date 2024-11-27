class ResizableColumnTable {
    constructor(table) {
        this.table = table;
        this.table._jsfbResizableTable = this;

        // Create the resizer elements
        this.resizers = [];
        let headers = this.table.querySelectorAll('th');
        let previousHeader = null;
        for (let i = 0; i < headers.length - 1; i++) {
            let header = headers[i];
            let resizer = document.createElement('div');
            resizer.classList.add('jsfb-resizer');
            header.appendChild(resizer);
            this.resizers.push(resizer);
            this.addEventHandlers(header, resizer);
            // get the current width of the column
            let width = parseInt(window.getComputedStyle(header).width, 10);
            header.style.width = width + 'px';
            console.log(i, header, previousHeader);
            if (previousHeader != null) {
                previousHeader._nextHeader = header;
            }
            previousHeader = header;
        }
        if (previousHeader != null) {
            previousHeader._nextHeader = headers[headers.length - 1];
        }
        // headers.forEach((header) => {
        //     let resizer = document.createElement('div');
        //     resizer.classList.add('jsfb-resizer');
        //     header.appendChild(resizer);
        //     this.resizers.push(resizer);
        //     this.addEventHandlers(header, resizer);
        //     // get the current width of the column
        //     let width = parseInt(window.getComputedStyle(header).width, 10);
        //     // header.style.width = width + 'px';
        // });
        this.table.querySelectorAll('td').forEach((td) => {
            //td.style.maxWidth = '20px';
        });


        this.updateResizerHeight();
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
        }

        resizer.addEventListener('mousedown', (event) => {
            x = event.clientX;
            width = parseInt(window.getComputedStyle(th).width, 10);
            next_header = th._nextHeader??null;
            console.log(next_header);
            if (next_header != null) {
                next_width = parseInt(window.getComputedStyle(next_header).width, 10);
            }
            document.addEventListener('mousemove', mousemoveEventHander);
            document.addEventListener('mouseup', mouseupEventHandler);
        });
        
    }
}