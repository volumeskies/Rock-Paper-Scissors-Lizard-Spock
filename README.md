# game-server

Пример-основа для пошаговой игры на нескольких игроков.

Содержит в себе сервер HTTP для выдачи статики, и WebSocket для поддержания соединения с игроками.

## Правила игры

У каждого игрока по 3 жизни

После нажатия на кнопку "Старт" у игроков есть 5 секунд на выбор фигуры

### Правила для фигур:

Ножницы режут бумагу, отрезают голову ящерице

Бумага заворачивает камень; на бумаге улики против Спока

Камень давит ящерицу, затупляет ножницы

Ящерица травит Спока, ест бумагу

Спок ломает ножницы, испаряет камень

## Запуск

Устанавливаем зависимости:
```
npm i
```

Запускаем сборку:
```
npm run build
```

Запускаем сервер:
```
npm start
```

## Подключение игроков

В браузере открываем http://localhost:8000/

Игра запускается на двух игроков, но это настраивается в константе `PLAYERS_IN_SESSION` файла `server/game/game.ts`. Сервер последовательно соединяет двух подключившихся клиентов в игру.
