export type Figure = 'rock' | 'paper' | 'scissors' | 'lizard' | 'spock';

/**
 * Начало игры
 */
export type GameStartedMessage = {
	/** Тип сообщения */
	type: 'gameStarted';
	/** Мой ход? */
	myTurn: boolean;
};

/**
 * Состояние игрока
 */
export type PlayerState = {
	lives: number,
	figure: string
}

/**
 * Игра прервана
 */
export type GameAbortedMessage = {
	/** Тип сообщения */
	type: 'gameAborted';
};

/**
 * Ход игрока
 */
export type PlayerRollMessage = {
	/** Тип сообщения */
	type: 'playerRoll';
	/** Состояние игрока */
	move: PlayerState;
};

/**
 * Результат хода игроков
 */
export type GameResultMessage = {
	/** Тип сообщения */
	type: 'gameResult';
	/** Победа? */
	win: boolean;
};

/**
 * Смена игрока
 */
export type ChangePlayerMessage = {
	/** Тип сообщения */
	type: 'changePlayer';
	/** Кол-во сердец */
	lives: number;
};

/**
 * Повтор игры
 */
export type RepeatGame = {
	/** Тип сообщения */
	type: 'repeatGame';
};

/**
 * Некорректный запрос клиента
 */
export type IncorrectRequestMessage = {
	/** Тип сообщения */
	type: 'incorrectRequest';
	/** Сообщение об ошибке */
	message: string;
};

/**
 * Некорректный ответ сервера
 */
export type IncorrectResponseMessage = {
	/** Тип сообщения */
	type: 'incorrectResponse';
	/** Сообщение об ошибке */
	message: string;
};

/**
 * Сообщения от сервера к клиенту
 */
export type AnyServerMessage =
	| GameStartedMessage
	| GameAbortedMessage
	| GameResultMessage
	| ChangePlayerMessage
	| IncorrectRequestMessage
	| IncorrectResponseMessage;

/** 
 * Сообщения от клиента к серверу
 */
export type AnyClientMessage =
	| PlayerRollMessage
	| RepeatGame
	| IncorrectRequestMessage
	| IncorrectResponseMessage;
