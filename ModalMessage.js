import { css } from "./utils.js";

export default class ModalMessage{
    /** @type {HTMLElement} */
    #DOMElement;

    /** @type {HTMLElement} */
    #maskElement;

    constructor(message, options= {}){
        this.message= message;
        this.style= options.style ?? {};
        this.maskStyle= options.maskStyle ?? {};
        this.textStyle= options.textStyle ?? {};
        this.isShown= false;

        this.#init();
    }

    #init(){
        this.#DOMElement= document.createElement("div");
        // Never bigger than the mask: long messages wrap and scroll inside the panel
        css(this.#DOMElement, {
            boxSizing: "border-box",
            maxWidth: "100%",
            maxHeight: "100%",
            overflowY: "auto",
            overflowWrap: "anywhere",
            backgroundColor: "black",
            color: "white",
            padding: ".5rem 1rem",
            borderRadius: ".5rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            ...this.style,
        });

        const textElement= document.createElement("p");
        css(textElement, {
            textAlign: "center",
            ...this.textStyle,
        });
        textElement.innerText= this.message;

        this.#DOMElement.appendChild(textElement);

        this.#maskElement= document.createElement("div");
        css(this.#maskElement, {
            backdropFilter: "blur(3px)",
            backgroundColor: "#00000078",
            // Fixed to the viewport so it stays visible when the page is scrolled
            position: "fixed",
            inset: 0,
            zIndex: 100,
            boxSizing: "border-box",
            padding: "1rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            ...this.maskStyle,
        });

        this.#maskElement.appendChild(this.#DOMElement);

        this.#maskElement.addEventListener("click", ()=> {
            this.hide();
        });
    }

    show(){
        document.body.appendChild(this.#maskElement);
        this.isShown= true;
    }

    hide(){
        this.#maskElement.remove();
        this.isShown= false;
    }

    toggle(){
        if (this.isShown){
            this.hide();
        }
        else {
            this.show();
        }
    }

    get DOMElement(){
        return this.#DOMElement;
    }
}