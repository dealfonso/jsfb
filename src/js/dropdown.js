if (typeof exports === 'undefined') {
    exports = window;
}

class JSFBDropdown {
    static defaults = {
        closeOnOutsideClick: true,
        openingSide: "auto",                    // auto, left, right
        openingSideToPage: false,
    };

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
        objects.forEach((dropdown) => {
            let current = dropdown._jsfbDropdown??null;
            if (current === null) {
                current = new JSFBDropdown(dropdown, options);
            }
            result.push(current);
        });
        if (objects.length === 1) {
            return result[0];
        }
        return result;
    }

    extractOptions() {
        let options = {};
        for (let key in JSFBDropdown.defaults) {
            if (this.dropdown.dataset[key] !== undefined) {
                options[key] = this.dropdown.dataset[key];
            }
        }
        return options;
    }

    constructor(dropdown, options = {}) {
        this.dropdown = dropdown;
        let effectiveOptions = Object.assign({}, JSFBDropdown.defaults, this.extractOptions(), options, );
        this.options = effectiveOptions;
        this.toggle = dropdown.querySelector('.jsfb-dropdown-toggle');
        this.content = dropdown.querySelector('.jsfb-dropdown-content');
        this.isOpen = false;
        this.documentClickHandler = !this.options.closeOnOutsideClick?null:(event) => {
            if (!this.dropdown.contains(event.target)) {
                this.hide();
            }
        };
        this.optionsInMenu = dropdown.querySelectorAll('.jsfb-dropdown-content'),
        this.closeHandler = (event) => {
            this.hide();
            console.log(event.target);
            console.log(event.target.onclick);
            console.log('closeHandler');
        }
        this.toggle.addEventListener('click', () => {
            this.toggleOpen();
        });
        this.optionsInMenu.forEach((option) => {
            option.addEventListener('click', this.closeHandler);
        });
        if (this.options.closeOnOutsideClick) {
            document.addEventListener('click', this.documentClickHandler);
        }
        dropdown._jsfbDropdown = this;
    }

    show() {
        let openToLeft = false;

        switch (this.options.openingSide) {
            case 'left':
                openToLeft = true;
                break;
            case 'right':
                openToLeft = false;
                break;
            case 'auto':
            default:
                // if showing the content will make to go out from the right edge of the parent, then show it to the left by using the right: 0 in the style
                let parentRect;
                if (this.options.openingSideToPage) {
                    parentRect = document.body.getBoundingClientRect();
                } else {
                    parentRect = this.dropdown.parentElement.getBoundingClientRect();
                }
                // parentRect = this.dropdown.parentElement.getBoundingClientRect();
                let buttonRect = this.toggle.getBoundingClientRect();

                // unset the right, left, top and bottom properties
                this.content.style.removeProperty('right');
                this.content.style.removeProperty('left');
                this.content.style.removeProperty('top');
                this.content.style.removeProperty('bottom');
                
                let rect = this.content.getBoundingClientRect();
                let openToRightDistance = parentRect.right - (buttonRect.left + rect.width);
                let openToLeftDistance = buttonRect.right - rect.width - parentRect.left;
                if (openToLeftDistance > openToRightDistance) {
                    openToLeft = true;
                }
                break;
        }
        if (openToLeft) {
            this.content.style.right = '0';
        }
        this.content.classList.add('show');

        this.isOpen = true;
    }

    hide() {
        this.content.classList.remove('show');
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

exports.JSFBDropdown = JSFBDropdown;
exports.JSFBDropdown.version = "1.0.0";

document.addEventListener('DOMContentLoaded', () => {
    JSFBDropdown.fromDOM(document.querySelectorAll('.jsfb-dropdown'));
    let mutationObserver = new MutationObserver((mutations) => {
        JSFBDropdown.fromDOM(document.querySelectorAll('.jsfb-dropdown'));
    });
    mutationObserver.observe(document.body, {
        childList: true,
        subtree: true
    });
});