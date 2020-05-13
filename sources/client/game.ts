import { openScreen } from './screens.js';
import * as GameScreen from './screens/game.js';
import * as ResultScreen from './screens/result.js';
import { PlayerState } from "../common/messages";

GameScreen.setTurnHandler( turnHandler );
GameScreen.setStartHandler(startHandler);
ResultScreen.setRestartHandler( restartHandler );

/**
 * Отправляет сообщение на сервер
 */
let sendMessage: typeof import( './connection.js' ).sendMessage;

/**
 * Устанавливает функцию отправки сообщений на сервер
 * 
 * @param sendMessageFunction Функция отправки сообщений
 */
function setSendMessage( sendMessageFunction: typeof sendMessage ): void
{
	sendMessage = sendMessageFunction;
}

/**
 * Обрабатывает ход игрока
 * 
 * @param number Загаданное пользователем число
 */
function turnHandler( move: PlayerState ): void
{
	sendMessage( {
		type: 'playerRoll',
		move,
	} );
}

function startHandler(): void
{
	sendMessage({
		type: 'startEvent',
	})
}

/**
 * Обрабатывает перезапуск игры
 */
function restartHandler(): void
{
	sendMessage( {
		type: 'repeatGame',
	} );
}

/**
 * Начинает игру
 */
function startGame(): void
{
	openScreen( 'game' );
}

function startListener(): void
{
	GameScreen.startListener();
}

/**
 * Меняет активного игрока
 * 
 * @param myTurn Ход текущего игрока?
 */
function changePlayer( myTurn: boolean, lives: number ): void
{
	GameScreen.update( myTurn, lives );
}

/**
 * Завершает игру
 * 
 * @param result Результат игры
 */
function endGame( result: 'win' | 'loose' | 'abort' ): void
{
	ResultScreen.update( result );
	openScreen( 'result' );
}

export {
	startGame,
	changePlayer,
	endGame,
	setSendMessage,
	startListener
};
