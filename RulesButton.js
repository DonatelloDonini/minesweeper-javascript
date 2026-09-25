import { css } from "./utils.js";

/**
 * @typedef {Object} RulesSection
 * @property {string} title The section title.
 * @property {string[]} items The rules of the section, shown as a bulleted list.
 */

/**
 * A round "?" button that opens a panel with the given rules.\
 * The panel closes by clicking the X button, clicking the blurred backdrop or pressing Escape.\
 * Colors default to black and white and the button is not positioned: pass the style options to theme and place it.
 *
 * @example
 * const rulesButton= new RulesButton([
 *     { title: "Goal", items: ["Dig up every safe cell."] },
 * ], {
 *     style: { position: "fixed", top: "1rem", right: "1rem", backgroundColor: "var(--containers)" },
 *     panelStyle: { backgroundColor: "var(--background)" },
 * });
 * document.body.appendChild(rulesButton.DOMElement);
 */
export default class RulesButton{
    /** @type {HTMLElement} The "?" button. */
    #DOMElement;

    /** @type {HTMLElement} The fullscreen backdrop holding the rules panel, attached to the body only while shown. */
    #maskElement;

    /**
     * @param {RulesSection[]} rules The rules shown inside the panel, one entry per section.
     * @param {Object} [options]
     * @param {Object} [options.style] CSS properties applied to the "?" button, including its position in the page.
     * @param {Object} [options.panelStyle] CSS properties applied to the rules panel.
     * @param {Object} [options.closeButtonStyle] CSS properties applied to the X button inside the panel.
     * @param {Object} [options.sectionTitleStyle] CSS properties applied to each section title of the rules.
     */
    constructor(rules, options= {}){
        this.rules= rules;
        this.style= options.style ?? {};
        this.panelStyle= options.panelStyle ?? {};
        this.closeButtonStyle= options.closeButtonStyle ?? {};
        this.sectionTitleStyle= options.sectionTitleStyle ?? {};
        this.isShown= false;

        this.#init();
    }

    /**
     * Builds the "?" button, the backdrop and the rules panel, and registers the open/close listeners.
     *
     * @returns {void}
     */
    #init(){
        this.#DOMElement= document.createElement("button");
        this.#DOMElement.innerText= "?";
        this.#DOMElement.title= "Rules";
        this.#DOMElement.setAttribute("aria-label", "Show the rules");
        css(this.#DOMElement, {
            width: "2.5rem",
            height: "2.5rem",
            borderRadius: "50%",
            border: "2px solid white",
            backgroundColor: "black",
            color: "white",
            fontFamily: "inherit",
            fontSize: "1.25rem",
            fontWeight: "bold",
            cursor: "pointer",
            ...this.style,
        });
        this.#DOMElement.addEventListener("click", ()=> this.toggle());

        this.#maskElement= document.createElement("div");
        css(this.#maskElement, {
            backdropFilter: "blur(3px)",
            backgroundColor: "#00000078",
            position: "fixed",
            inset: 0,
            zIndex: 300,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "1rem",
        });
        this.#maskElement.addEventListener("click", (event)=> {
            if (event.target === this.#maskElement) this.hide();
        });

        const panel= document.createElement("div");
        panel.setAttribute("role", "dialog");
        panel.setAttribute("aria-label", "Rules");
        css(panel, {
            position: "relative",
            backgroundColor: "white",
            color: "black",
            border: "2px solid black",
            borderRadius: ".5rem",
            padding: "1rem 1.5rem",
            maxWidth: "32rem",
            maxHeight: "85vh",
            overflowY: "auto",
            userSelect: "text",
            ...this.panelStyle,
        });

        const closeButton= document.createElement("button");
        closeButton.innerText= "X";
        closeButton.setAttribute("aria-label", "Close the rules");
        css(closeButton, {
            position: "absolute",
            top: ".5rem",
            right: ".5rem",
            background: "none",
            border: "none",
            color: "inherit",
            fontSize: "1.1rem",
            cursor: "pointer",
            ...this.closeButtonStyle,
        });
        closeButton.addEventListener("click", ()=> this.hide());
        panel.appendChild(closeButton);

        const header= document.createElement("h2");
        header.innerText= "Rules";
        css(header, { marginTop: 0, textAlign: "center" });
        panel.appendChild(header);

        this.rules.forEach(section=> {
            const title= document.createElement("h3");
            title.innerText= section.title;
            css(title, {
                marginBottom: ".25rem",
                borderBottom: "2px solid black",
                ...this.sectionTitleStyle,
            });

            const list= document.createElement("ul");
            css(list, { marginTop: 0, paddingLeft: "1.25rem", lineHeight: 1.5 });
            section.items.forEach(item=> {
                const listItem= document.createElement("li");
                listItem.innerText= item;
                list.appendChild(listItem);
            });

            panel.appendChild(title);
            panel.appendChild(list);
        });

        this.#maskElement.appendChild(panel);

        document.addEventListener("keydown", (event)=> {
            if (event.key === "Escape" && this.isShown) this.hide();
        });
    }

    /**
     * Shows the rules panel.
     *
     * @returns {void}
     */
    show(){
        document.body.appendChild(this.#maskElement);
        this.isShown= true;
    }

    /**
     * Hides the rules panel.
     *
     * @returns {void}
     */
    hide(){
        this.#maskElement.remove();
        this.isShown= false;
    }

    /**
     * Shows the rules panel if hidden, hides it otherwise.
     *
     * @returns {void}
     */
    toggle(){
        if (this.isShown){
            this.hide();
        }
        else {
            this.show();
        }
    }

    /**
     * The "?" button, to be appended to the page.
     *
     * @returns {HTMLElement}
     */
    get DOMElement(){
        return this.#DOMElement;
    }
}
