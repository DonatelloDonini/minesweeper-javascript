import GameBoard from "./GameBoard.js";
import ModalMessage from "./ModalMessage.js";
import ScoreBoard from "./ScoreBoard.js";
import RulesButton from "./RulesButton.js";
import { css } from "./utils.js";
import { applyRandomPalette } from "./Palette.js";

const main= ()=> {
    const gameBoard= new GameBoard(10, 10, {
        style: {
            border: "1px solid black",
            borderCollapse: "collapse",
            width: "70vw",
            height: "70vw",
            minWidth: "200px",
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

    gameBoard.addEventListener(GameBoard.EVENTS.GAME_ENDED, ()=> {
        console.log("Game ended event caught...");
        const replayButton= document.createElement("div");
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

    const rulesButton= new RulesButton({
        style: {
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

    document.body.appendChild(rulesButton.DOMElement);
    document.body.appendChild(scoreBoardContainer);
    document.body.appendChild(gameBoard.DOMElement);
};



document.addEventListener("DOMContentLoaded", ()=> {
    applyRandomPalette();
    main();
});