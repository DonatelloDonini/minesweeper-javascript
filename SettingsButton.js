import { css } from "./utils.js";

/**
 * @typedef {Object} SettingChoice
 * @property {string} label The text shown on the choice.
 * @property {any} value The value passed to `onChange` when the choice is picked.
 */

/**
 * @typedef {Object} Setting
 * @property {string} title The setting title.
 * @property {SettingChoice[]} choices The choices the user can pick from, shown as a row of buttons.
 * @property {any} [selected] The value of the choice selected at start.
 * @property {function(any): void} onChange Called with the value of the picked choice.
 */

/**
 * A round "⚙" button that opens a panel with the given settings, each one being a group of exclusive choices.\
 * The panel closes by clicking the ✕ button, clicking the blurred backdrop or pressing Escape.\
 * Colors default to black and white and the button is not positioned: pass the style options to theme and place it.
 *
 * @example
 * const settingsButton= new SettingsButton([
 *     {
 *         title: "Difficulty",
 *         choices: [{ label: "Easy", value: 1 }, { label: "Hard", value: 2 }],
 *         selected: 1,
 *         onChange: (value)=> console.log(value),
 *     },
 * ], {
 *     style: { position: "fixed", top: "1rem", right: "1rem" },
 * });
 * document.body.appendChild(settingsButton.DOMElement);
 */
export default class SettingsButton{
    /** @type {HTMLElement} The "⚙" button. */
    #DOMElement;

    /** @type {HTMLElement} The fullscreen backdrop holding the settings panel, attached to the body only while shown. */
    #maskElement;

    /**
     * @param {Setting[]} settings The settings shown inside the panel.
     * @param {Object} [options]
     * @param {Object} [options.style] CSS properties applied to the "⚙" button, including its position in the page.
     * @param {Object} [options.panelStyle] CSS properties applied to the settings panel.
     * @param {Object} [options.closeButtonStyle] CSS properties applied to the ✕ button inside the panel.
     * @param {Object} [options.sectionTitleStyle] CSS properties applied to each setting title.
     * @param {Object} [options.choiceStyle] CSS properties applied to each choice.
     * @param {Object} [options.selectedChoiceStyle] CSS properties applied on top of `choiceStyle` to the selected choice.
     */
    constructor(settings, options= {}){
        this.settings= settings;
        this.style= options.style ?? {};
        this.panelStyle= options.panelStyle ?? {};
        this.closeButtonStyle= options.closeButtonStyle ?? {};
        this.sectionTitleStyle= options.sectionTitleStyle ?? {};
        this.choiceStyle= options.choiceStyle ?? {};
        this.selectedChoiceStyle= options.selectedChoiceStyle ?? {};
        this.isShown= false;

        this.#init();
    }

    /**
     * Builds the "⚙" button, the backdrop and the settings panel, and registers the open/close listeners.
     *
     * @returns {void}
     */
    #init(){
        this.#DOMElement= document.createElement("button");
        this.#DOMElement.innerText= "⚙";
        this.#DOMElement.title= "Settings";
        this.#DOMElement.setAttribute("aria-label", "Show the settings");
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
        panel.setAttribute("aria-label", "Settings");
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
            ...this.panelStyle,
        });

        const closeButton= document.createElement("button");
        closeButton.innerText= "✕";
        closeButton.setAttribute("aria-label", "Close the settings");
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
        header.innerText= "Settings";
        css(header, { marginTop: 0, textAlign: "center" });
        panel.appendChild(header);

        this.settings.forEach(setting=> {
            const title= document.createElement("h3");
            title.innerText= setting.title;
            css(title, {
                marginBottom: ".5rem",
                borderBottom: "2px solid black",
                ...this.sectionTitleStyle,
            });

            const choicesContainer= document.createElement("div");
            choicesContainer.setAttribute("role", "radiogroup");
            choicesContainer.setAttribute("aria-label", setting.title);
            css(choicesContainer, { display: "flex", flexWrap: "wrap", gap: ".5rem" });

            const choiceElements= setting.choices.map(choice=> {
                const choiceElement= document.createElement("button");
                choiceElement.innerText= choice.label;
                choiceElement.setAttribute("role", "radio");
                choiceElement.addEventListener("click", ()=> {
                    this.#selectChoice(choiceElements, choiceElement);
                    setting.onChange(choice.value);
                });
                choicesContainer.appendChild(choiceElement);
                return choiceElement;
            });

            const selectedIndex= setting.choices.findIndex(choice=> choice.value === setting.selected);
            this.#selectChoice(choiceElements, choiceElements[selectedIndex]);

            panel.appendChild(title);
            panel.appendChild(choicesContainer);
        });

        this.#maskElement.appendChild(panel);

        document.addEventListener("keydown", (event)=> {
            if (event.key === "Escape" && this.isShown) this.hide();
        });
    }

    /**
     * Marks a choice of a setting as selected, restyling all the choices of that setting.
     *
     * @param {HTMLElement[]} choiceElements All the choices of the setting.
     * @param {HTMLElement} [selectedElement] The choice to select, none when undefined.
     *
     * @returns {void}
     */
    #selectChoice(choiceElements, selectedElement){
        choiceElements.forEach(choiceElement=> {
            const isSelected= choiceElement === selectedElement;
            choiceElement.setAttribute("aria-checked", String(isSelected));
            css(choiceElement, {
                padding: ".4rem .8rem",
                borderRadius: ".3rem",
                border: "2px solid black",
                backgroundColor: "white",
                color: "black",
                fontFamily: "inherit",
                cursor: "pointer",
                ...this.choiceStyle,
                ...(isSelected ? {
                    backgroundColor: "black",
                    color: "white",
                    ...this.selectedChoiceStyle,
                } : {}),
            });
        });
    }

    /**
     * Shows the settings panel.
     *
     * @returns {void}
     */
    show(){
        document.body.appendChild(this.#maskElement);
        this.isShown= true;
    }

    /**
     * Hides the settings panel.
     *
     * @returns {void}
     */
    hide(){
        this.#maskElement.remove();
        this.isShown= false;
    }

    /**
     * Shows the settings panel if hidden, hides it otherwise.
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
     * The "⚙" button, to be appended to the page.
     *
     * @returns {HTMLElement}
     */
    get DOMElement(){
        return this.#DOMElement;
    }
}
