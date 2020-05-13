import WebSocket from 'ws';
import { onError } from './on-error.js';

import type {
	AnyClientMessage,
	AnyServerMessage,
	GameStartedMessage,
	GameAbortedMessage, PlayerState,
} from '../../common/messages.js';

/**
 * Класс игры
 * 
 * Запускает игровую сессию.
 */
class Game
{
	/**
	 * Количество игроков в сессии
	 */
	static readonly PLAYERS_IN_SESSION = 2;
	
	/**
	 * Игровая сессия
	 */
	private _session: WebSocket[];
	/**
	 * Информация о ходах игроков
	 */
	private _playersState!: WeakMap<WebSocket, string>;
	
	private _playerLives!: WeakMap<WebSocket, number>;
	
	/**
	 * @param session Сессия игры, содержащая перечень соединений с игроками
	 */
	constructor( session: WebSocket[] )
	{
		this._session = session;
		
		this._sendStartMessage()
			.then(
				() =>
				{
					this._listenMessages();
				}
			)
			.catch( onError );
	}
	
	/**
	 * Уничтожает данные игровой сессии
	 */
	destroy(): void
	{
		// Можно вызвать только один раз
		this.destroy = () => {};
		
		for ( const player of this._session )
		{
			if (
				( player.readyState !== WebSocket.CLOSED )
				&& ( player.readyState !== WebSocket.CLOSING )
			)
			{
				const message: GameAbortedMessage = {
					type: 'gameAborted',
				};
				
				this._sendMessage( player, message )
					.catch( onError );
				player.close();
			}
		}
		
		// Обнуляем ссылки
		this._session = null as unknown as Game['_session'];
		this._playersState = null as unknown as Game['_playersState'];
		this._playerLives = null as unknown as Game['_playerLives'];
	}
	
	/**
	 * Отправляет сообщение о начале игры
	 */
	private _sendStartMessage(): Promise<void[]>
	{
		this._playersState = new WeakMap<WebSocket, string>();
		this._playerLives = new WeakMap<WebSocket, number>();
		const data: GameStartedMessage = {
			type: 'gameStarted',
			myTurn: true,
			lives: 3,
		};
		const promises: Promise<void>[] = [];
		
		for ( const player of this._session )
		{
			promises.push( this._sendMessage( player, data ) );
			this._playersState.set(player, '');
			this._playerLives.set(player, data.lives);
			data.myTurn = false;
		}
		
		return Promise.all( promises );
	}
	
	/**
	 * Отправляет сообщение игроку
	 * 
	 * @param player Игрок
	 * @param message Сообщение
	 */
	private _sendMessage( player: WebSocket, message: AnyServerMessage ): Promise<void>
	{
		return new Promise(
			( resolve, reject ) =>
			{
				player.send(
					JSON.stringify( message ),
					( error ) =>
					{
						if ( error )
						{
							reject();
							
							return;
						}
						
						resolve();
					}
				)
			},
		);
	}
	
	/**
	 * Добавляет слушателя сообщений от игроков
	 */
	private _listenMessages(): void
	{
		for ( const player of this._session )
		{
			player.on(
				'message',
				( data ) =>
				{
					const message = this._parseMessage( data );
					
					this._processMessage( player, message );
				},
			);
			
			player.on( 'close', () => this.destroy() );
		}
	}
	
	/**
	 * Разбирает полученное сообщение
	 * 
	 * @param data Полученное сообщение
	 */
	private _parseMessage( data: unknown ): AnyClientMessage
	{
		if ( typeof data !== 'string' )
		{
			return {
				type: 'incorrectRequest',
				message: 'Wrong data type',
			};
		}
		
		try
		{
			return JSON.parse( data );
		}
		catch ( error )
		{
			return {
				type: 'incorrectRequest',
				message: 'Can\'t parse JSON data: ' + error,
			};
		}
	}
	
	/**
	 * Выполняет действие, соответствующее полученному сообщению
	 * 
	 * @param player Игрок, от которого поступило сообщение
	 * @param message Сообщение
	 */
	private _processMessage( player: WebSocket, message: AnyClientMessage ): void
	{
		switch ( message.type )
		{
			case 'playerRoll':
				this._onPlayerRoll( player, message.move );
				break;
			
			case 'repeatGame':
				this._sendStartMessage()
					.catch( onError );
				break;
			
			case 'startEvent':
				this._startButton();
				break;
				
			case 'incorrectRequest':
				this._sendMessage( player, message )
					.catch( onError );
				break;
			
			case 'incorrectResponse':
				console.error( 'Incorrect response: ', message.message );
				break;
			
			default:
				this._sendMessage(
					player,
					{
						type: 'incorrectRequest',
						message: `Unknown message type: "${(message as AnyClientMessage).type}"`,
					},
				)
					.catch( onError );
				break;
		}
	}

	private _startButton(): void{
		for ( const player of this._session )
		{
			this._sendMessage(
				player,
				{
					type: 'startButton',
				},
			)
				.catch( onError );
		}
	}
	
	/**
	 * Проверка фигур на победу (возвращает false, если текущая фигура побеждена и true если нет)
	 * @param currentFigure текущая фигура
	 * @param oppositeFigure фигура противника
	 * @private
	 */
	private static _figuresHandling(currentFigure: string, oppositeFigure: string): boolean{
		switch(currentFigure){
			case 'paper':
				if(oppositeFigure === 'scissors' || oppositeFigure === 'lizard')
					return false;
				else
					return true;
			case 'rock':
				if(oppositeFigure === 'paper' || oppositeFigure === 'spock')
					return false;
				else
					return true;
			case 'scissors':
				if(oppositeFigure === 'rock' || oppositeFigure === 'spock')
					return false;
				else
					return true;
			case 'lizard':
				if(oppositeFigure === 'scissors' || oppositeFigure === 'rock')
					return false;
				else
					return true;
			case 'spock':
				if(oppositeFigure === 'paper' || oppositeFigure === 'lizard')
					return false;
				else
					return true;
		}
		return false;
	}

	/**
	 * Проверка на проигрыш (кол-во жизней)
	 * @param lives жизни
	 * @private
	 */
	private static _checkLose(lives: number): boolean{
		return lives === 0;
	}
	
	private static _checkAnyLose(livesOne: number, livesTwo: number): boolean{
		return livesOne === 0 || livesTwo === 0;
	}
	
	/**
	 * Обрабатывает ход игрока
	 * 
	 * @param currentPlayer Игрок, от которого поступило сообщение
	 * @param currentPlayerNumber Число, загаданное игроком
	 */
	private _onPlayerRoll( currentPlayer: WebSocket, currentMove: PlayerState ): void
	{
		this._playersState.set(currentPlayer, currentMove.figure);
		this._playerLives.set(currentPlayer, currentMove.lives);
		let currentFigure: string = '';
		let oppositeFigure: string = '';
		let lose: boolean = false;
		let opPlayer: WebSocket = currentPlayer;
		for ( const player of this._session )
		{
			const playerFigure = this._playersState.get( player )!;
			if(player === currentPlayer)
				currentFigure! = playerFigure;
			else{
				oppositeFigure! = playerFigure;
				opPlayer = player;
			}
				
		}
		let currLives: number = -1;
		let oppLives: number = -1;
		
		if(!oppositeFigure || !currentFigure) return;
		else{
			let handle: boolean = Game._figuresHandling(currentFigure, oppositeFigure);
			currLives = handle ? this._playerLives.get(currentPlayer)! : this._playerLives.get(currentPlayer)! - 1;
			oppLives = handle ? this._playerLives.get(opPlayer)! - 1 : this._playerLives.get(opPlayer)!;
			if(this._playerLives.get(currentPlayer) === currLives && this._playerLives.get(opPlayer) === oppLives) return;
			lose = Game._checkAnyLose(this._playerLives.get(opPlayer)!, this._playerLives.get(currentPlayer)!)
			if(!lose){
				this._sendMessage(
					currentPlayer,
					{
						type: 'changePlayer',
						myTurn: false,
						lives: currLives,
					},
				).catch( onError );

				this._sendMessage(
					opPlayer,
					{
						type: 'changePlayer',
						myTurn: true,
						lives: oppLives,
					},
				).catch( onError );


				this._playerLives.set(currentPlayer, currLives);
				this._playerLives.set(opPlayer, oppLives);
			}
			else{
				for(const player of this._session){
					this._sendMessage(
						player,
						{
							type: 'gameResult',
							lose: Game._checkLose(this._playerLives.get(player)!),
						},
					)
						.catch( onError );
				}
			}
		}
		
	}
}

export {
	Game,
};
