import { css } from "./utils.js";

const RULES= [
    {
        title: "Goal",
        items: [
            "Dig up every cell that does not hide a bomb.",
        ],
    },
    {
        title: "Controls",
        items: [
            "Left click a covered cell to dig it.",
            "Right click a covered cell to plant a flag where you think a bomb is.",
            "Left click a flagged cell to remove the flag.",
        ],
    },
    {
        title: "Numbers",
        items: [
            "A dug cell shows how many bombs touch it, diagonals included (1 to 8). A blank cell has no bombs around it.",
            "Use the numbers to work out which neighbours are safe and which hide bombs.",
        ],
    },
    {
        title: "End of the game",
        items: [
            "Dig a bomb and it's game over.",
            "Dig every safe cell and you win.",
            "Each safe cell dug is worth 1 point.",
            "Press \"replay\" to start a new board.",
        ],
    },
];

export default class RulesButton{
    /** @type {HTMLElement} */
    #DOMElement;

    /** @type {HTMLElement} */
    #maskElement;

    constructor(options= {}){
        this.style= options.style ?? {};
        this.panelStyle= options.panelStyle ?? {};
        this.closeButtonStyle= options.closeButtonStyle ?? {};
        this.sectionTitleStyle= options.sectionTitleStyle ?? {};
        this.isShown= false;

        this.#init();
    }

    #init(){
        this.#DOMElement= document.createElement("button");
        this.#DOMElement.innerText= "?";
        this.#DOMElement.title= "Rules";
        this.#DOMElement.setAttribute("aria-label", "Show the rules");
        css(this.#DOMElement, {
            position: "fixed",
            top: "1rem",
            right: "1rem",
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
            zIndex: 200,
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
        panel.setAttribute("aria-label", "Minesweeper rules");
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
        closeButton.innerText= "✕";
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

        RULES.forEach(section=> {
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
