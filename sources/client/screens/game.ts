import { PlayerState } from "../../common/messages";

/**
 * Заголовок экрана
 */
const title = document.querySelector( 'main.game>h2' ) as HTMLHeadingElement;
/**
 * Массив фигур
 */
const figures = document.getElementsByClassName('figures__figure') as HTMLCollection;

/**
 * Контейнер жизней
 */
const lives = document.getElementsByClassName('lives') as HTMLCollection;

/**
 * Кнопка старт игры
 */
const start = document.querySelector('.button') as HTMLButtonElement;

/**
 * Состояние игрока
 */
const currentMove: PlayerState = {
	lives: 3,
	figure: ''
}

if ( !title || !figures || !lives  || !start)
{
	throw new Error( 'Can\'t find required elements on "game" screen' );
}

/**
 * Обработчик хода игрока
 */
type TurnHandler = ( currentMove: PlayerState ) => void;

type StartHandler = () => void;
/**
 * Обработчик хода игрока
 */
let turnHandler: TurnHandler;

let startHandler: StartHandler;

function figuresListener(): void{
	for(let item of figures){
		item.addEventListener('click', onFigure);
	}
}

function removeFiguresListener(): void{
	for(let item of figures){
		item.removeEventListener('click', onFigure);
	}
}

function startGame(event: Event): void{
	event.preventDefault();
	start && startHandler();
}

function startEvent(): void{
	start.addEventListener('click', startGame)
}

function removeStartListener(): void{
	start.disabled = true;
}

const delay = (ms: number) => new Promise((resolve)=>setTimeout(resolve, ms));

async function startListener() {
	removeStartListener();
	figuresListener();
	await delay(5000);
	removeFiguresListener();
	turnHandler && turnHandler(currentMove);
}

function onFigure(event: Event): void{
	event.preventDefault();
	const figure = event.target as HTMLElement;
	switch(figure.classList[0]){
		case 'figures__rock':
			currentMove.figure = 'rock';
			break;
		case 'figures__paper':
			currentMove.figure = 'paper';
			break;
		case 'figures__scissors':
			currentMove.figure = 'scissors';
			break;
		case 'figures__lizard':
			currentMove.figure = 'lizard';
			break;
		case 'figures__spock':
			currentMove.figure = 'spock';
			break;
	}
	console.log('target', currentMove.figure);
}

function updateLives(life: number): void{
	console.log(currentMove.lives);
	if(life < lives[0].childElementCount){
		lives[0].removeChild(lives[0].lastElementChild!);
		currentMove.lives = life;
		console.log('dfsf', currentMove.lives);
	}
	else return;
}

/**
 * Обновляет экран игры
 * 
 * @param myTurn Ход текущего игрока
 */
function update( myTurn: boolean, lives: number ): void
{
	updateLives(lives);
	if ( myTurn )
	{
		title.textContent = 'Ваш ход';
		start.disabled = false;
		startEvent();
		return;
	}
	title.textContent = 'Ход противника';
	start.disabled = true;
}

/**
 * Устанавливает обработчик хода игрока
 * 
 * @param handler Обработчик хода игрока
 */
function setTurnHandler( handler: TurnHandler ): void
{
	turnHandler = handler;
}

function setStartHandler(handler: StartHandler): void
{
	startHandler = handler;
}

export {
	update,
	setTurnHandler,
	setStartHandler,
	startListener
};
