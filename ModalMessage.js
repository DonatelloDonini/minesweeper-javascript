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
        css(this.#DOMElement, {
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
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
            position: "absolute",
            height: "100vh",
            width: "100vw",
            top: 0,
            left: 0,
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