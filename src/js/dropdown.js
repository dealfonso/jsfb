if (typeof exports === 'undefined') {
    exports = window;
}

/**
 * JSFBDropdown
 * 
 * A simple dropdown component that can be used to create dropdowns with a toggle button and a content. It is
 *   very similar to the dropdowns in Bootstrap, but it is much simpler and is included in this library to
 *   avoid the need to include Bootstrap.
 * 
 * In fact, it is only used to create a context menu in the file browser cards, to offer the options regarding
 *   the file.
 * 
 * Anyway it can be used to create any kind of dropdown.
 */

class JSFBDropdown {
    static defaults = {
        // Close the dropdown when clicked outside of the dropdown
        closeOnOutsideClick: true,
        // The side to open the dropdown content (auto, left, right)
        openingSide: "auto",
        // When openingSide is auto, this option will be used to determine the rect to compare the distance 
        //  to the right and left edges. If true, the rect of the page will be used, otherwise the rect of 
        //  the parent element
        openingSideToPage: false,
    };

    static mutationObserver = new MutationObserver((mutations) => {
        JSFBDropdown.fromDOM(document.querySelectorAll('.fb-dropdown'));
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
        this.toggle = dropdown.querySelector('.fb-dropdown-toggle');
        this.content = dropdown.querySelector('.fb-dropdown-content');
        this.isOpen = false;
        this.documentClickHandler = !this.options.closeOnOutsideClick?null:(event) => {
            if (!this.dropdown.contains(event.target)) {
                this.hide();
            }
        };
        this.optionsInMenu = dropdown.querySelectorAll('.fb-dropdown-content'),
        this.closeHandler = (event) => {
            this.hide();
            event.stopPropagation();
        }
        this.toggle.addEventListener('click', (event) => {
            this.toggleOpen();
            event.stopPropagation();
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
    JSFBDropdown.mutationObserver.observe(document.body, {
        childList: true,
        subtree: true,
    });
});
