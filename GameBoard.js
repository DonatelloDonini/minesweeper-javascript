import { css, randomBoolean } from "./utils.js";

class GameCell extends EventTarget{
    static CELL_TYPES= Object.freeze({
        DIRT: "dirt",
        BOMB: "bomb",
    });

    constructor(hasBomb, options= {}){
        super();
        this.hasBomb= hasBomb;
        this.style= options.style ?? {};
        this.onHoverStyle= options.onHoverStyle ?? {};
        this.flagStyle= options.flagStyle ?? {};
        this.bombStyle= options.bombStyle ?? {};
        this.coverStyle= options.coverStyle ?? {};
        this.debugView= options.debugView ?? false;
        this.eventsManager= options.eventsManager;
        this.coveredUp= false;
        this.flagged= false;

        // Events callbacks
        this.gameOverCallbacks= [];
        this.digCallbacks= [];

        this.#init();
    }

    #init(){
        this.element= document.createElement("td");

        css(this.element, {
            position: "relative",
            padding: 0,
            overflow: "hidden",
            ...this.style,
        });
    }

    get DOMElement(){
        if (this.hasBomb){
            const bombElement= document.createElement("div");
            css(bombElement, {
                backgroundColor: "black",
                borderRadius: "100%",
                height: "40%",
                width: "40%",
                margin: "auto",
                ...this.bombStyle,
            });

            this.element.appendChild(bombElement);
        }

        return this.element;
    }

    #applyHoverBehaviour(element, defaultStyle, hoverStyle){
        element.addEventListener("mouseover", ()=> {
            css(element, hoverStyle);
        }, { signal: this.eventsManager.signal });

        const revertedStyle = Object.fromEntries(
            Object.keys(hoverStyle).map(key => [
                key,
                defaultStyle[key] ?? "revert"
            ])
        );

        element.addEventListener("mouseout", ()=> {
            css(element, revertedStyle);
        }, { signal: this.eventsManager.signal });
    }

    setNumberNeighbouringBombs(n){
        if (n!== 0){
            const numberElement= document.createElement("p");
            numberElement.innerText= n;
            css(numberElement, {
                textAlign: "center",
                margin: "0",
            });

            if (! this.hasBomb){
                this.element.appendChild(numberElement);
            }
        }

        if (n>2 || this.hasBomb){
            this.#coverUp();
        }
    }

    #coverUp(){
        this.coverElement= document.createElement("div");
        const coverElementStyle= {
            inset: 0,
            margin: 0,
            backgroundColor: "darkgray",
            position: "absolute",
            ...this.coverStyle,
        };
        css(this.coverElement, coverElementStyle);
        this.element.appendChild(this.coverElement);

        this.#applyHoverBehaviour(this.coverElement, coverElementStyle, this.onHoverStyle);
        this.#applyClickBehaviour();

        this.coveredUp= true;
    }

    #applyClickBehaviour(){
        this.element.addEventListener("mousedown", (event)=> {
            if (event.button !== 0) return;

            this.#unCover();
        }, { signal: this.eventsManager.signal });

        this.element.addEventListener("mousedown", (event)=> {
            if (event.button !== 2) return;
            event.preventDefault();

            this.#markFlag();
        }, { signal: this.eventsManager.signal });
    }

    disableEvents(){
        this.eventsManager.abort();
    }

    #markFlag(){
        console.log("marking flag...");

        this.flagElement= document.createElement("div");
        css(this.flagElement, {
            height: "100%",
            width: "100%",
            position: "absolute",
            top: 0,
            left: 0,
            display: "flex",
            pointerEvents: "none",
            fontWeight: "bold",
            textAlign: "center",
            ...this.flagStyle,
        });

        const flagText= document.createElement("p");
        flagText.innerText= "F";
        css(flagText, {
            margin: "auto",
            width: "100%",
        });

        this.flagElement.appendChild(flagText);

        this.coverElement.appendChild(this.flagElement);
        this.flagged= true;
    }

    #unCover(){
        if (this.flagged){
            this.flagElement.remove();
            this.flagged= false;
        }
        else if (this.coveredUp){
            this.coverElement.remove();
            this.coveredUp= false;
            if (this.hasBomb){
                const gameOverEvent= new CustomEvent(
                    GameBoard.EVENTS.GAME_OVER
                );
                this.dispatchEvent(gameOverEvent);
                this.disableEvents();

                this.gameOverCallbacks.forEach(callback=> callback(gameOverEvent));
            }

            const digEvent= new CustomEvent(
                GameBoard.EVENTS.DIG,
                {
                    detail: {
                        cellType: this.hasBomb ? GameCell.CELL_TYPES.BOMB : GameCell.CELL_TYPES.DIRT,
                    }
                }
            );
            this.dispatchEvent(digEvent);
        }
    }

    /**
     * @param {function} callback A function that must be executed when the game over event is dispatched.
     *
     * @returns {void}
     */
    set onGameOver(callback){
        this.gameOverCallbacks.push(callback);
    }

    /**
     * @param {function} callback A function that must be executed when the dig event is dispatched.
     *
     * @returns {void}
     */
    set onDig(callback){
        this.digCallbacks.push(callback);
    }
}

export default class GameBoard extends EventTarget{
    /** @type {HTMLElement} */
    #DOMElement;

    /** @type {number} */
    #points;

    /** @type {number} */
    #cellsToUncover;

    static EVENTS= Object.freeze({
        GAME_OVER: "game-over",
        DIG: "dig",
        VICTORY: "victory",
        GAME_ENDED: "game-ended",
    });

    static CELL_TYPES= GameCell.CELL_TYPES;

    /**
     * @param {number} height
     * @param {number} width
     * @param {Object} style
     */
    constructor(height, width, options= {}) {
        super();
        this.height= height;
        this.width= width;
        this.table= [];
        this.initalized= false;
        this.gameOverCallbacks= [];
        this.onVictoryCallbacks= [];
        this.bombsInTheField= 0;
        this.#points= 0;
        this.#cellsToUncover= 0;
        this.victoryStatus= false;

        // Managing options
        this.style= options.style ?? {};
        this.cellStyle= options.cellStyle ?? {};
        this.cellCoverStyle= options.cellCoverStyle ?? {};
        this.flagStyle= options.flagStyle ?? {};
        this.cellCoverHoverStyle= options.cellHoverStyle ?? {};
        this.debugView= options.debugView ?? false;
        this.bombDensity= options.bombDensity ?? .3;

        this.#init();
    }

    /**
     * Returns the usable DOM element complete with all its functinoalities
     * @returns {HTMLElement}
     */
    get DOMElement(){
        return this.#DOMElement;
    }

    /**
     * Initializes the game board to be ready for a new game.
     *
     * @returns {void}
     */
    #init(){
        this.eventsManager= new AbortController();
        /** @type {GameCell[][]}*/
        this.table= [];
        this.bombsInTheField= 0;
        this.#points= 0;
        this.#cellsToUncover= 0;
        this.victoryStatus= false;

        for (let y=0; y<this.height; y++){
            const row= [];
            for (let x=0; x<this.width; x++){
                const hasBomb= randomBoolean(this.bombDensity);
                const gameCell= new GameCell(
                    hasBomb,
                    {
                        style: this.cellStyle,
                        onHoverStyle: this.cellCoverHoverStyle,
                        debugView: this.debugView,
                        eventsManager: this.eventsManager,
                        coverStyle: this.cellCoverStyle,
                        flagStyle: this.flagStyle,
                    }
                );

                if (hasBomb){
                    this.bombsInTheField++;
                }

                row.push(gameCell);
                gameCell.onGameOver= ()=> {
                    this.gameOverCallbacks.forEach(callback=> {
                        callback();
                    });
                }

                // DIG event
                gameCell.addEventListener(GameBoard.EVENTS.DIG, (event)=> {
                    if (event.detail.cellType=== GameCell.CELL_TYPES.DIRT){
                        this.#points++;
                    }

                    this.#checkForVictory();

                    this.dispatchEvent(new CustomEvent(GameBoard.EVENTS.DIG, {
                        detail: {
                            ...event.detail,
                            victory: this.victoryStatus,
                        },
                    }));
                });

                // GAME_OVER event
                gameCell.addEventListener(GameBoard.EVENTS.GAME_OVER, (event)=> {
                    this.dispatchEvent(new CustomEvent(GameBoard.EVENTS.GAME_OVER, {
                        detail: event.detail,
                    }));

                    this.#points= 0;

                    this.dispatchEvent(new CustomEvent(GameBoard.EVENTS.GAME_ENDED, {
                        detail: {
                            status: "game-over",
                            score: this.#points,
                        }
                    }));
                });
            }
            this.table.push(row);
        }

        // Filling in the numbers
        for (let y=0; y<this.height; y++){
            for (let x = 0; x < this.width; x++) {
                const gameCell= this.table[y][x];
                gameCell.setNumberNeighbouringBombs(this.#checkNeighbours(x, y));

                if (gameCell.coveredUp && (!gameCell.hasBomb)){
                    this.#cellsToUncover++;
                }
            }
        }


        // Preventing the context menu from appearing
        document.addEventListener("contextmenu", (event) => {
            event.preventDefault();
        });

        if (this.#DOMElement !== undefined){
            this.DOMElement.innerHTML= "";
        }
        else{
            this.#DOMElement= document.createElement("table");
        }
        // Fixed layout keeps every column the same width regardless of the cells content,
        // --rows and --columns let the style size the content relatively to the cells
        css(this.#DOMElement, {
            tableLayout: "fixed",
            "--rows": this.height,
            "--columns": this.width,
            ...this.style,
        });

        for (let y=0; y<this.height; y++){
            const row= document.createElement("tr");
            for (let x=0; x<this.width; x++){
                row.appendChild(this.table[y][x].DOMElement);
            }

            this.#DOMElement.appendChild(row);
        }

        this.initalized= true;

        queueMicrotask(() => this.#checkForVictory());
    }

    /**
     * Checks for the status of victory.\
     * If the game is in a current status of victory, the flag `this.victoryStatus` gets set to `true`.\
     * Also, if the game is in the current status of victory, it emits the VICTORY and GAME_ENDED events.
     */
    #checkForVictory(){
        if (this.#points=== this.#cellsToUncover){
            // Stopping the game from accepting interaction
            for (let y=0; y<this.height; y++){
                for (let x=0; x<this.width; x++){
                    const gameCell= this.table[y][x];
                    gameCell.disableEvents();
                }
            }

            this.dispatchEvent(new CustomEvent(GameBoard.EVENTS.VICTORY, {
                detail: {
                    points: this.#points,
                }
            }));

            this.dispatchEvent(new CustomEvent(GameBoard.EVENTS.GAME_ENDED, {
                detail: {
                    status: "victory",
                    score: this.#points,
                }
            }));

            this.onVictoryCallbacks.forEach(callback=> callback());

            this.victoryStatus= true;
        }
    }

    /**
     * Checks how many neighbours with bombs are there around the passed coordinate.
     *
     * @param {number} x The x coordinate of the grid.
     * @param {number} y The y coordinate of the grid.
     *
     * @returns {number}
     */
    #checkNeighbours(x, y){
        let neighbouringBombs= 0;
        for (let _y= y-1; _y<y+2; _y++){
            for (let _x= x-1; _x<x+2; _x++){
                if (_y==y && _x==x) continue;

                if (this.table[_y]?.[_x]?.hasBomb === true) neighbouringBombs++;
            }
        }

        return neighbouringBombs;
    }

    /**
     * Sets a function to be executed upon game over event.
     *
     * @param {function} callable A function that must be executed when the game over event is dispatched.
     *
     * @returns {void}
     */
    set onGameOver(callable){
        this.gameOverCallbacks.push(callable);
    }

    /**
     * @returns {number}
     */
    get points(){
        return this.#points;
    }

    /**
     * Sets a function to be executed upon victory event.
     *
     * @param {function} callback A callback function to be executed upon victory event.
     *
     * @returns {void}
     */
    set onVictory(callback){
        this.onVictoryCallbacks.push(callback);
    }

    /**
     * Generates a new level.
     *
     * @returns {void}
     */
    reset(){
        this.#init();
    }

    /**
     * Changes the dimension of the field and generates a new level.
     *
     * @param {number} height The number of rows.
     * @param {number} width The number of columns.
     *
     * @returns {void}
     */
    resize(height, width){
        this.height= height;
        this.width= width;
        this.reset();
    }
}
