import { css } from "./utils.js";

export default class ScoreBoard{
    /** @type {number} */
    #score;

    /** @type {HTMLElement} */
    #DOMElement;

    constructor(score, options= {}){
        this.#score= score;
        // this.#score= 10;
        this.style= options.style ?? {};
        this.numbersStyle= options.numbersStyle ?? {};
        this.debug= options.debug ?? false;

        this.#init();
    }

    get score(){
        return this.#score;
    }

    set score(score){
        this.#score= score;
        this.#init();
    }

    #init(){
        this.#DOMElement= this.DOMElement ?? document.createElement("div");
        this.DOMElement.innerHTML= "";
        css(this.#DOMElement, {
            display: "flex",
            gap: ".1rem",
            ...this.style,
        });

        if (this.debug){
            console.log(">>> [ ScoreBoard ] ---");
            console.log(this.#score);
            console.log("<<< [ ScoreBoard ] ---");
        }

        const scoreLength= String(this.#score).length;
        for (let i=0; i<scoreLength; i++){
            const scorePiece= document.createElement("div");
            css(scorePiece, {
                height: "1.5rem",
                width: "1.5rem",
                backgroundColor: "black",
                color: "white",
                borderRadius: ".4rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                ...this.numbersStyle,
            });

            const scorePieceText= document.createElement("p");
            css(scorePieceText, {
                margin: 0,
                textAlign: "center",
            });

            scorePieceText.innerText= String(this.#score)[i];

            scorePiece.appendChild(scorePieceText);
            this.#DOMElement.appendChild(scorePiece);
        }
    }

    get DOMElement(){
        return this.#DOMElement;
    }
}