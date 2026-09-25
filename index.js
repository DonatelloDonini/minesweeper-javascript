import GameBoard from "./GameBoard.js";
import ModalMessage from "./ModalMessage.js";
import ScoreBoard from "./ScoreBoard.js";
import RulesButton from "./RulesButton.js";
import SettingsButton from "./SettingsButton.js";
import { css } from "./utils.js";
import { applyRandomPalette } from "./Palette.js";

/**
 * Rules shown inside the rules panel, one entry per section.
 *
 * @type {import("./RulesButton.js").RulesSection[]}
 */
const RULES= [
    {
        title: "Goal",
        items: [
            "Dig up every covered cell that does not hide a bomb.",
            "The game starts with the safest cells already dug: only bombs and cells touching 3 or more bombs are covered.",
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
            "A cell shows how many bombs touch it, diagonals included (1 to 8). A blank cell has no bombs around it.",
            "Use the numbers to work out which neighbours are safe and which hide bombs.",
        ],
    },
    {
        title: "End of the game",
        items: [
            "Dig a bomb and it's game over.",
            "Dig every covered safe cell and you win.",
            "Each safe cell dug is worth 1 point.",
            "Press \"replay\" to start a new board.",
            "Use the settings button to change the field size: easy (10x10), medium (15x15) or hard (20x20). Changing it starts a new board.",
        ],
    },
];

/**
 * Available dimensions of the field, as number of cells per side.
 */
const FIELD_SIZES= [
    { label: "Easy (10x10)", value: 10 },
    { label: "Medium (15x15)", value: 15 },
    { label: "Hard (20x20)", value: 20 },
];

/**
 * localStorage key holding the field size selected by the user.
 */
const FIELD_SIZE_STORAGE_KEY= "minesweeper-field-size";

/**
 * Reads the field size stored in the browser.
 *
 * @returns {number} The stored size, or the easy one when nothing valid is stored or the storage is unavailable.
 */
const loadFieldSize= ()=> {
    try {
        const storedSize= Number(localStorage.getItem(FIELD_SIZE_STORAGE_KEY));
        if (FIELD_SIZES.some(size=> size.value === storedSize)) return storedSize;
    }
    catch {}

    return FIELD_SIZES[0].value;
};

/**
 * Stores the field size in the browser, silently doing nothing when the storage is unavailable.
 *
 * @param {number} size The field size to store.
 *
 * @returns {void}
 */
const saveFieldSize= (size)=> {
    try {
        localStorage.setItem(FIELD_SIZE_STORAGE_KEY, String(size));
    }
    catch {}
};

const main= ()=> {
    const fieldSize= loadFieldSize();
    const gameBoard= new GameBoard(fieldSize, fieldSize, {
        style: {
            border: "1px solid black",
            borderCollapse: "collapse",
            // Same side for width and height: the largest square fitting both the screen width
            // and the height left once the header and score (above) and the replay button (below) are placed,
            // never smaller than 200px
            "--board-side": "max(200px, min(90vw, calc(100dvh - 16rem)))",
            width: "var(--board-side)",
            height: "var(--board-side)",
            fontSize: "calc(var(--board-side) / var(--columns) * .5)",
            margin: "0 auto",
            borderColor: "var(--shadow)"
        },
        cellStyle: {
            backgroundColor: "var(--containers)",
        },
        cellHoverStyle: {
            backgroundColor: "var(--detail)",
        },
        cellCoverStyle: {
            inset: 0,
            margin: 0,
            backgroundColor: "var(--shadow)",
            position: "absolute",
            zIndex: 100,
        },
        flagStyle: {
            color: "var(--foreground)",
        },
        bombDensity: .3,
    });

    const scoreBoard= new ScoreBoard(gameBoard.points, {
        style: {
            margin: ".5rem 0",
        },
        numbersStyle: {
            color: "var(--foreground)",
            backgroundColor: "var(--containers)",
        },
    });

    gameBoard.addEventListener(GameBoard.EVENTS.DIG, (event)=> {
        if (event.detail.cellType=== GameBoard.CELL_TYPES.DIRT){
            scoreBoard.score= gameBoard.points;
        }
    });

    gameBoard.addEventListener(GameBoard.EVENTS.VICTORY, (event)=> {
        const victoryMessageModal= new ModalMessage("VICTORY", {
            style: {
                backgroundColor: "var(--containers)",
            }
        });
        victoryMessageModal.show();
    });

    gameBoard.addEventListener(GameBoard.EVENTS.GAME_OVER, (event)=> {
        const victoryMessageModal= new ModalMessage("GAME OVER", {
            style: {
                backgroundColor: "var(--containers)",
            }
        });
        victoryMessageModal.show();
    });

    /** @type {HTMLElement | null} */
    let replayButton= null;

    gameBoard.addEventListener(GameBoard.EVENTS.GAME_ENDED, ()=> {
        console.log("Game ended event caught...");
        replayButton= document.createElement("div");
        replayButton.innerText= "replay";
        // const icon=

        css(replayButton, {
            padding: ".5rem 1rem",
            borderRadius: ".2rem",
            color: "white",
            textAlign: "center",
            width: "fit-content",
            margin: "1rem auto",
            cursor: "pointer",
            backgroundColor: "var(--containers)",
            color: "var(--foreground)",
        });

        replayButton.addEventListener("click", ()=> {
            replayButton.remove();
            gameBoard.reset();
            scoreBoard.score= gameBoard.points;
        });

        document.body.appendChild(replayButton);
    });

    const scoreBoardContainer= document.createElement("div");
    {
        css(scoreBoardContainer, {
            fontFamily: "consolas",
            display: "flex",
            gap: ".5rem",
            alignItems: "center",
            marginLeft: "32px",
        });


        const scoreBoardContainerText= document.createElement("p");
        scoreBoardContainerText.innerText= "Score: ";
        scoreBoardContainer.appendChild(scoreBoardContainerText);
        scoreBoardContainer.appendChild(scoreBoard.DOMElement);
    }

    const rulesButton= new RulesButton(RULES, {
        style: {
            position: "fixed",
            top: "1rem",
            right: "1rem",
            zIndex: 200,
            border: "2px solid var(--shadow)",
            backgroundColor: "var(--containers)",
            color: "var(--foreground)",
        },
        panelStyle: {
            backgroundColor: "var(--background)",
            color: "var(--foreground)",
            border: "2px solid var(--shadow)",
        },
        sectionTitleStyle: {
            borderBottom: "2px solid var(--shadow)",
        },
    });

    const settingsIcon= document.createElement("i");
    settingsIcon.className= "fi fi-sr-settings";
    css(settingsIcon, {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
    });

    const settingsButton= new SettingsButton([
        {
            title: "Field size",
            choices: FIELD_SIZES,
            selected: gameBoard.width,
            onChange: (size)=> {
                replayButton?.remove();
                gameBoard.resize(size, size);
                saveFieldSize(size);
                scoreBoard.score= gameBoard.points;
            },
        },
    ], {
        style: {
            position: "fixed",
            top: "1rem",
            right: "4rem",
            zIndex: 200,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: "2px solid var(--shadow)",
            backgroundColor: "var(--containers)",
            color: "var(--foreground)",
        },
        panelStyle: {
            backgroundColor: "var(--background)",
            color: "var(--foreground)",
            border: "2px solid var(--shadow)",
        },
        sectionTitleStyle: {
            borderBottom: "2px solid var(--shadow)",
        },
        choiceStyle: {
            border: "2px solid var(--shadow)",
            backgroundColor: "var(--background)",
            color: "var(--foreground)",
        },
        selectedChoiceStyle: {
            backgroundColor: "var(--containers)",
            color: "var(--foreground)",
        },
        icon: settingsIcon,
    });

    document.body.appendChild(rulesButton.DOMElement);
    document.body.appendChild(settingsButton.DOMElement);
    document.body.appendChild(scoreBoardContainer);
    document.body.appendChild(gameBoard.DOMElement);
};



document.addEventListener("DOMContentLoaded", ()=> {
    applyRandomPalette();
    main();
});