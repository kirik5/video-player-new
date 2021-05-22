import { getOffsetLeft, getOffsetWidth, getOffsetTop } from './offset-left-width'
import { getHours, getMinutes, getSeconds } from "./get-time";

class VideoPlayerObj {
    constructor(settings) {
        this._video = new Video(settings.video) // Объект видео
        this._clickToPlayLabel = new ClickToPlayLabel({ // Объект надписи, по щелчку на которую видео начинает воспроизводится
            elem: settings.clickToPlayLabel,
            styles: settings.styles,
        })
        this._volume = new Volume({ // Объект панели регулировки громкости
            container: settings.volumeContainer,
            progress: settings.volumeProgress,
            styles: settings.styles,
        })
        this._controls = new Controls({ // Объект панели управления видео
            elem: settings.controls,
            styles: settings.styles,
        })
        this._videoPointer = new VideoPointer({ // Объект ползунка перемотки видео
            elem: settings.videoPointer,
        })
        this._videoProgress = new VideoProgress({ // Объект прогресс-бара воспроизведения видео
            elem: {
                container: settings.videoProgress.container,
                progress: settings.videoProgress.progress,
            },
        })
        this._pause = new Pause({ // Объект кнопки "Пауза"
            elem: settings.pause,
            styles: settings.styles,
        })
        this._cTime = new CTime({ // Объект отображения текущего времени воспроизведения
            elem: settings.cTime
        })
        this._aTime = new ATime({ // Объект отображения полного времени воспроизведения видео
            elem: settings.aTime
        })
        this._videoContainer = new VideoContainer({ // Объект видеоконтейнера, по щелчку на котором видео переходит в полноэкранный режим
            elem: settings.videoContainer
        })
        this._videoBackground = new VideoBackground({ // Объект темного фона для видеоплеера, который разворачивается на весь екран
            elem: settings.videoBackground
        })
        this._loader = new Loader({ // Объект лоадера (отображается, когда видео подгружается)
            elem: settings.loader,
            styles: settings.styles,
        })
        this._timeout = settings.timeout // Задаем время, по прошествию которого (елси не шевелить мышкой) панели управления прячутся
        this._inControls = false // Маркер, который показывает, находится ли указатель мыши над панелями управления видео (панель с ползунком видео и панель громкости)
        this._timerId = null // Отложенное скрытие панелей управления видео не запущено, поэтому и id таймера равен null
        this._video.elem.addEventListener('canplaythrough', this._showClickToPlayLabelHandler) // Подписываемся на событие готовности видео к воспроизведению (если видео готово - показываем надпись "Кликни меня, чтобы воспроизвести видео")
        this._loader.show() // Пока видео не загружено - показываем лоадер
    }

    // ПОДГОТОВКА К ВОСПРОИЗВЕДЕНИЮ видео НАЧАЛО

    // Показываем начальную надпись "ClickToPlay", когда видео готово
    _showClickToPlayLabelHandler = () => {
        this._video.elem.removeEventListener('canplaythrough', this._showClickToPlayLabelHandler) // Отписываемся от прослушивания первой готовности видео к воспроизведению
        this._loader.hide() // Прячем лоадер, когда видео первый раз готово к воспроизведению
        this._clickToPlayLabel.show() // Показываем начальную кнопку воспроизведения видео
        this._video.elem.addEventListener('click', this._clickToPlayLabelHandler) // При клике по видео запускаем воспроизведение видео
        this._clickToPlayLabel.elem.addEventListener('click', this._clickToPlayLabelHandler) // При клике по надписи "ClickToPlay" запускаем воспроизведение видео
        document.addEventListener('keydown', this._pressSpaceToPlayLabelHandler) // При нажатии любой клавиши клавиатуры на документе запускаем воспроизведение видео
        this._video.canPlay = true // Устанавливаем маркер возможности воспроизведения видео
    }

    // Нажатие клавиши "Пробел" для начала воспроизведения видео
    _pressSpaceToPlayLabelHandler = (evt) => {
        if (evt.code !== 'Space') return
        this._clickToPlayLabelHandler()
    }

    // Эти команды выполняем, когда произошел клик по надписи "ClickToPlay"
    _clickToPlayLabelHandler = () => {
        this._video.elem.removeEventListener('click', this._clickToPlayLabelHandler) // Отписываемся от прослушивания события клика по видео
        this._clickToPlayLabel.elem.removeEventListener('click', this._clickToPlayLabelHandler) // Отписываемся от прослушивания события клика по надписи "ClickToPlay"
        document.removeEventListener('keydown', this._pressSpaceToPlayLabelHandler) // Отписываемся от прослушивания события нажатия клавиши на документе
        this._initialPlayer() // Запускаем все подписки на события в плеере
        this._clickToPlayLabel.hide() // Прячем надпись "ClickToPlay"
        this._controls.show() // Показываем панель управления видео
        this._volume.show() // Показываем панель управления громкостью
        this._video.play() // Запускаем воспроизведение видео
        this._video.unmute() // Даем звук
        this._video.changeVolume(0.3) // Меняем уровень громкости видео
        this._volume.changeVolume(0.3) // Меняем отображение уровня громкости видео
        this._video.didPlayed = true // ЭТОТ МАРКЕР В ДАЛЬНЕЙШЕМ НУЖНО УБРАТЬ, ТАК КАК ОН ДУБЛИРУЕТ МАРКЕР НАХОЖДЕНИЯ НА ПАУЗЕ
        this._video.pause = false // Показываем, что видео не на паузе
        this._planingToHideControlsAndVolumeHandler() // Планируем будущее скрытие панелей управления видео и громкостью
    }
    // ПОДГОТОВКА К ВОСПРОИЗВЕДЕНИЮ видео КОНЕЦ



    // ОТОБРАЖАЕМ ВРЕМЯ видео (текущее и общее) во время воспроизведения НАЧАЛО

    // Вычисляем новую позицию прогресс-бара и ползунка видео при воспроизведении видео
    _calculateNewPositionPointerProgress = () => {
        const currentTime = this._video.elem.currentTime
        const allTime = this._video.elem.duration
        return currentTime / allTime * 100
    }

    // Показываем время на панели управления видео
    _showTimesHandler = () => {
        let time
        time = this._video.elem.duration
        this._aTime.elem.innerHTML = `${getHours(time)}:${getMinutes(time)}:${getSeconds(time)}` // Пишем в панели управления видео все время видео
        time = this._video.elem.currentTime
        this._cTime.elem.innerHTML = `${getHours(time)}:${getMinutes(time)}:${getSeconds(time)}` // Пишем в панели управления видео текущее время воспроизведения видео
    }

    // При воспроизведении видео меняем положение ползунка видео и индикатора прогресса воспроизведения а также выводим время на панель
    _updateVideoTime = () => {
        this._videoPointer.changePosition(this._calculateNewPositionPointerProgress())
        this._videoProgress.changePosition(this._calculateNewPositionPointerProgress())
        this._showTimesHandler()
    }
    // ОТОБРАЖАЕМ ВРЕМЯ видео (текущее и общее) во время воспроизведения КОНЕЦ


    // ПЕРЕМОТКА ВИДЕО НАЧАЛО
    // МЕХАНИЗМ ПЕРЕТАСКИВАНИЯ ПОЛЗУНКА ВИДЕО:
    // При клике на ползунке видео останавливаем воспроизведение видео.
    // Остановка видео не происходит, если видео на паузе, или если видео находится в режиме подгрузки (waiting),
    // или если перетаскивание ползунка началось сразу же после такого же перетаскивания без запуска на воспроизведение (не наступило событие "canplaythrough").

    // Во время перетаскивания ползунка видео отменяем стандартное поведение при DnD (в объекте VideoPointer),
    // меняем отображение на панели управления видео текущее время, меняем текущее времи видео (video.currentTime) а также меняем длинну индикатор прогресса видео.
    // Во время перетаскивания ползунка видео также устанавливаем маркер возможности воспроизведения видео (canPlay = false)
    // и маркер отвечающий за индикацию режима перетаскивания (moving = true)

    // При отпускании ползунка видео отписываемся от слушателей событий mousemove и mouseup,
    // а также запускаем воспроизведение видео если:
    // видео находилось не на паузе;
    // видео находится в догруженном состоянии (перетащили ползунок видео и не отпустили клавишу мыши до наступления события canplaythrough).

    // Если перемотка видео осуществляется из состояния waiting - видео не останавливается, поэтому в обработчике события canplay
    // останавливаем видео, если перемотка началась из состояния недокачки (waiting)

    // Когда кликаем по ползунку видео MOUSEDOWN
    _startDragVideoPointer = () => {
        if (this._videoPointer.moveArrows) return // Если ползунок видео перемещаем стрелками клавиатуры (ArrowLeft/ArrowRight) - отменяется перетаскивание ползунка методом Drag and Drop!!!
        // Функция обрабатующая движения курсора мыши после события MOUSEDOWN на ползунке видео
        const moveVideoPointer = (evt) => {
            this._video.canPlay = false // Показываем, что при перетаскивании ползунка видео оно не может быть воспроизведено
            const newPosition = this._calculateNewPositionPointerProgressOnDrag(evt.clientX)
            this._videoPointer.changePosition(newPosition.persent)
            this._videoProgress.changePosition(newPosition.persent)
            this._video.changeCurrentVideoTime(newPosition.currentTime)
            this._showTimesHandler() // При перетаскивании ползунка видео меняем и текущее время, отображаемое на панели управления видео
        }
        // Функция завершения перетаскивания ползунка видео
        const mouseUp = () => {
            document.removeEventListener('mousemove', moveVideoPointer) // Отписываемся от событий
            document.removeEventListener('mouseup', mouseUp) // Отписываемся от событий
            if (!this._video.pause) this._loader.show()
            this._videoPointer.clickOnVideoPointer = false // Показываем, что закончили клин на ползунке видено
            if (this._video.pause) return // Если видео стоит на паузе - дальнейший код не выполняем
            if (!this._video.canPlay) return // Если видео не готово к воспроизведению - дальнейший код не выполняем
            this._video.play() // Если видео было запущено до начала перетаскивания ползунка видео - воспроизводим его
        }
        document.addEventListener('mousemove', moveVideoPointer) // После нажатия мышки подписываемся на перемещение курсора
        document.addEventListener('mouseup', mouseUp) // Подписываемся и на отпускание мышки
        this._videoPointer.clickOnVideoPointer = true // Показываем, что кликнули на ползунке видео и перешли в режим возможного перетаскивания ползунка (и не нужно обрабатывать клик на видео-прогресс-баре)
        if (this._video.playing) {
            this._video.stop()
            console.log('stop')
        }
    }

    // Запускается, когда видео готово к долгосрочному воспроизведению (событие "canplaythrough")
    _canplaythrough = () => {
        console.log('canplaythrough')
        if (!this._video.canPlay) this._video.canPlay = true // Показываем, что видео может быть воспроизведено
        if (this._video.pause) return // Не запускаем видео после перетаскивания, так как оно стоит на паузе
        if (this._videoPointer.clickOnVideoPointer) return // Дальнейший код выполнится только тогда, когда пользователь не находится в состоянии нажатого ползунка видео
        if (this._videoProgress.clickOnVideoProgress) return // Дальнейший код выполнится только тогда, когда пользователь не находится в состоянии нажатого прогресс-видео-бара
        if (this._videoPointer.moveArrows) return // Если нажата кнопка со стрелкой влево/вправо (и не оджата) - воспроизведение видео не запустится!!!
        this._video.play() // Если видео воспроизводилось до начала перетаскивания ползунка видео - продолжаем его воспроизводить!
    }

    // Обработчик события canPlay (данное событие запускается до события canplaythrough, когда видео готово к воспроизведению)
    // В нем ставим на паузу видео (так как осуществляется перетаскивание ползунка видео), если эта операция (перетаскивание ползунка) стартовала из состояния waiting!
    _canplayHandler = () => {
        console.log('canplay')
        if (!((this._videoPointer.clickOnVideoPointer) || (this._videoProgress.clickOnVideoProgress))) return // Дальнейший код выполнится только тогда, когда пользователь нажал и не отпустил (или нажал и перетаскивает) ползунок видео или же пользователь нажал и не отпустил на видео-прогресс-баре
        if (!this._video.waiting) return // Дальнейший код выполнится только тогда, когда была приостановка видео по причине недокачки
        this._video.stop() // Останавливаем видео, когда оно находится в процесе перетаскивания ползунка (или в режиме нажатой кнопки мыши на видео-прогресс-баре), но уже частично готовго воспроизводится!
        console.log('stop')
    }

    // Остановка видео и перемотка в то место, куда кликнул пользователь по видео-прогресс-бару
    _mousedownOnProgressBarToRewindVideoHandler = (evt) => {
        if (this._videoPointer.clickOnVideoPointer) return // Если нажат ползунок видео - клик по видео-прогресс-бару не обрабатываем!!!
        if (this._videoPointer.moveArrows) return // При перемотке видео стрелками клавиатуры (влево/вправо) перемотка кликом не будет работать!!!
        this._videoProgress.clickOnVideoProgress = true // Показываем, что кликнули на ползунке видео и перешли в режим возможного перетаскивания ползунка (и не нужно обрабатывать клик на видео-прогресс-баре)
        const newPosition = this._calculateNewPositionPointerProgressOnDrag(evt.clientX)
        this._videoPointer.changePosition(newPosition.persent)
        this._videoProgress.changePosition(newPosition.persent)
        this._video.canPlay = false
        if (this._video.playing) {
            this._video.stop()
            console.log('stop')
        }
        this._video.elem.currentTime = newPosition.currentTime
    }

    // Запуск видео после перемотки по клику
    _mouseupOnProgressBarToRewindVideoHandler = () => {
        if (!this._videoProgress.clickOnVideoProgress) return // Если нажали мышкой на видео-прогресс-баре во время перемотки стрелками, а отпустили после перемотки стрелками - такой "mouseup" не должен обрабатываться!!!
        if (this._videoPointer.clickOnVideoPointer) return // Если нажат ползунок видео - клик по видео-прогресс-бару не обрабатываем!!!
        if (this._videoPointer.moveArrows) return // При перемотке видео стрелками клавиатуры (влево/вправо) перемотка кликом не будет работать!!!
        this._videoProgress.clickOnVideoProgress = false // Показываем, что закончили клик на ползунке видено
        if (this._video.pause) return // Не запускаем видео после перетаскивания, так как оно стоит на паузе
        if (!this._video.canPlay) return // Если видео не готово к воспроизведению - даже не проверяем, нужно ли его запустить
        if (!this._video.pause) {
            this._video.play() // Если видео было запущено до начала перетаскивания ползунка видео - воспроизводим его
            this._video.canPlay = true
        }
    }

    // Вычисляем позицию и текущее время воспроизведения видео при перетаскивании ползунка
    _calculateNewPositionPointerProgressOnDrag = (clientX) => {
        const offsetLeft = getOffsetLeft(this._videoProgress.elem.container)
        const offsetWidth = getOffsetWidth(this._videoProgress.elem.container)
        let x
        if (clientX < offsetLeft) {
            x = 0
        } else if (clientX > offsetLeft + offsetWidth) {
            x = offsetWidth
        } else {
            x = clientX - offsetLeft
        }
        const persent = x / offsetWidth * 100
        const currentTime = x * this._video.elem.duration / offsetWidth
        return {
            persent: persent,
            currentTime: currentTime
        }
    }

    // Показываем текущее время и меняем позицию прогресс-видео-бара и ползунка видео
    _showTimeChangeProgressPointerPosition = () => {
        this._showTimesHandler() // Показываем текущее время на панели управления видео
        this._videoPointer.changePosition(this._calculateNewPositionPointerProgress()) //
        this._videoProgress.changePosition(this._calculateNewPositionPointerProgress()) //
    }

    // Перемотка видео по нажатию стрелок (событие keydown)
    _pressedArrowsLeftRightKeyDownHandler = (evt) => {
        if (this._videoPointer.clickOnVideoPointer) return // Если ползунок видео находится в "нажатом" режиме - перемотка стрелкамп не будет работать!!!
        if (this._videoProgress.clickOnVideoProgress) return // Если нажат видео-прогресс-бар - клавиши стрелки не должны работать!!!
        if (!(evt.code === 'ArrowRight' || evt.code === 'ArrowLeft')) return // Елси пользователь нажал что-то кроме стрелок влево/вправо - дальнейший код не запустится!!!
        this._videoPointer.moveArrows = true // Указатель на то, что перемещаем ползунок видео стрелками клавиатуры
        this._video.canPlay = false
        this._planingToHideControlsAndVolumeHandler() // При нажатии стрелок перемотки видео появляются панели управления видео и звуком
        if (this._video.playing) {
            this._video.stop()
            console.log('stop')
        }
        if (evt.code === 'ArrowRight') {
            this._video.elem.currentTime += 5
            this._showTimeChangeProgressPointerPosition() // Показываем время и меняем позицию на прогресс-баре
        } else {
            this._video.elem.currentTime -= 5
            this._showTimeChangeProgressPointerPosition() // Показываем время и меняем позицию на прогресс-баре
        }
    }

    // После отпускания клавиш стрелок на клавиатуре сигнализируем, что перемотка стрелками закончена (например, для следующего перетаскивания ползунка видео) (событие keyup)
    _pressedArrowsLeftRightKeyUpHandler = () => {
        if (!this._videoPointer.moveArrows) return // Если нажатие стрелки произошло во время перетаскивания ползунка видео или клика на прогрес баре, то не изменился статус, была ли нажата кнопка мыши (не было keydown), соответственно, не нужно обрабатывать и отпускание (mouseup)
        if (this._videoPointer.clickOnVideoPointer) return // Если нажат ползунок видео - клик по видео-прогресс-бару не обрабатываем!!!
        if (this._videoProgress.clickOnVideoProgress) return // Если нажат видео-прогресс-бар - клавиши стрелки не должны работать!!!
        this._videoPointer.moveArrows = false
        if (this._video.pause) return // Не запускаем видео после перетаскивания, так как оно стоит на паузе
        if (!this._video.canPlay) return // Если видео не готово к воспроизведению - даже не проверяем, нужно ли его запустить
        this._video.play() // Если видео было запущено до начала перетаскивания ползунка видео - воспроизводим его
        this._video.canPlay = true
    }
    // ПЕРЕМОТКА ВИДЕО КОНЕЦ


    // ПАУЗА/СТАРТ НАЧАЛО

    // Функция запускающая/ставящая на паузу воспроизведение видео
    _playPauseVideo = () => {
        if (this._video.waiting) return // Если видео в ожидании подгрузки - пауза не нажимается
        if (!this._video.canPlay) return // Если видео не готово к воспроизведению - пауза не нажимается
        if (this._videoPointer.clickOnVideoPointer) return // Если ползунок видео перемещается или нажат - паузу не нажимаем
        if (this._videoProgress.clickOnVideoProgress) return // Если происходит клик по видео-прогресс-баре - пауза не должна нажиматся
        if (this._videoPointer.moveArrows) return // Если ползунок перемещаем стрелками клавиатуры - пауза не нажимается
        if (this._video.pause) { // Если видео стояло на паузе
            this._video.play() // Запускаем его
            this._video.pause = false // Изменяем маркер паузы
            this._pause.hide() // Прячем иконку паузы
        } else { // Если видео проигрывалось
            this._video.stop() // Останавливаем его
            this._video.pause = true // Изменяем маркер паузы
            this._pause.show() // Показываем иконку паузы
        }
        this._planingToHideControlsAndVolumeHandler() // Показываем панели управления видео и звуком, если видео ставится на паузу
    }

    // Функция, которая проверяет, была ли нажата клавиша "Пропуск" и если была - запускает функцию остановки/запуска воспроизведения видео
    _pressedSpaceKeyHandler = (evt) => {
        if (evt.code !== 'Space') return
        this._playPauseVideo()
    }
    // ПАУЗА/СТАРТ КОНЕЦ


    // Отменяем запланированное предыдущее скрытие и планируем новое скрытие панелей управления видео
    _planingToHideControlsAndVolumeHandler = () => {
        if (!this._controls.isVisible) this._controls.show()
        if (!this._volume.isVisible) this._volume.show()
        if (this._timerId) { // Очищаем таймер предыдущего запуска планирования скрытия панелей
            clearTimeout(this._timerId)
            this._timerId = null
        } // Отменяем предыдущее скрытие панелей управления
        if (this._inControls) return // Если курсор мыши размещяется над панелями управления - не планируем скрытие этих панелей
        if (this._video.pause) return // Если видео стоит на паузе - не планируем скрывать панели управления видео и звуком
        if (this._videoPointer.moving) return // Если перетаскиваем ползунок видео - панели не скрываем
        this._timerId = setTimeout(() => { // Если курсор мыши не пребывает над панелями управления - планируем скрытие этих панелей
            this._volume.hide()
            this._controls.hide()
        }, this._timeout)
    }

    // Отменяем запланированное предыдущее скрытие и планируем новое скрытие панели управления звуком
    _planingToHideVolumeHandler = () => {
        if (!this._volume.isVisible) this._volume.show()
        if (this._timerId) { // Очищаем таймер предыдущего запуска планирования скрытия панелей
            clearTimeout(this._timerId)
            this._timerId = null
        } // Отменяем предыдущее скрытие панелей управления
        if (this._inControls) return // Если курсор мыши размещяется над панелями управления - не планируем скрытие этих панелей
        if (this._video.pause) return // Если видео стоит на паузе - не планируем скрывать панели управления видео и звуком
        if (this._videoPointer.moving) return // Если перетаскиваем ползунок видео - панели не скрываем
        this._timerId = setTimeout(() => { // Если курсор мыши не пребывает над панелями управления - планируем скрытие этих панелей
            this._volume.hide()
            if (this._controls.isVisible) this._controls.hide()
        }, this._timeout)
    }






    // При вращении колесика мыши добавляем/убираем громкость
    _changeVolumeScrollHandler = (evt) => {
        let delta = evt.deltaY || evt.detail || evt.wheelDelta
        delta = -Number((delta / 1000).toFixed(1));
        if ((this._video.elem.volume + delta >= 0) && (this._video.elem.volume + delta <= 1)) {
            this._video.elem.volume = Number((this._video.elem.volume + delta).toFixed(1))
        }
        this._volume.elem.progress.style.height = `${this._video.elem.volume * 100}%`
        this._planingToHideVolumeHandler()
    }

    // При нажатии на стрелку вверх/вниз добавляем/убираем громкость
    _changeVolumeArrowsHandler = (evt) => {
        if (!(evt.code === 'ArrowUp' || evt.code === 'ArrowDown')) return
        this._planingToHideVolumeHandler() // Показываем панель управления громкостью и планируем ее скрытие
        if (evt.code === 'ArrowUp') {
            if (Number((this._video.elem.volume + 0.1).toFixed(1)) <= 1) {
                this._video.elem.volume = Number((this._video.elem.volume + 0.1).toFixed(1))
                this._volume.elem.progress.style.height = `${this._video.elem.volume * 100}%`
            }
        } else {
            if (Number((this._video.elem.volume - 0.1).toFixed(1)) >= 0) {
                this._video.elem.volume = Number((this._video.elem.volume - 0.1).toFixed(1))
                this._volume.elem.progress.style.height = `${this._video.elem.volume * 100}%`
            }
        }
    }

    // По щелчку на индикаторе громкости меняем громкость
    _changeVolumeClickHandler = (evt) => {
        let y = evt.clientY - getOffsetTop(this._volume.elem.container)
        if (y >= 95) {
            this._video.elem.volume = 0
            this._volume.elem.progress.style.height = `${this._video.elem.volume * 100}%`
        } else if (y >= 85) {
            this._video.elem.volume = 0.1
            this._volume.elem.progress.style.height = `${this._video.elem.volume * 100}%`
        } else if (y >= 75) {
            this._video.elem.volume = 0.2
            this._volume.elem.progress.style.height = `${this._video.elem.volume * 100}%`
        } else if (y >= 65) {
            this._video.elem.volume = 0.3
            this._volume.elem.progress.style.height = `${this._video.elem.volume * 100}%`
        } else if (y >= 55) {
            this._video.elem.volume = 0.4
            this._volume.elem.progress.style.height = `${this._video.elem.volume * 100}%`
        } else if (y >= 45) {
            this._video.elem.volume = 0.5
            this._volume.elem.progress.style.height = `${this._video.elem.volume * 100}%`
        } else if (y >= 35) {
            this._video.elem.volume = 0.6
            this._volume.elem.progress.style.height = `${this._video.elem.volume * 100}%`
        } else if (y >= 25) {
            this._video.elem.volume = 0.7
            this._volume.elem.progress.style.height = `${this._video.elem.volume * 100}%`
        } else if (y >= 15) {
            this._video.elem.volume = 0.8
            this._volume.elem.progress.style.height = `${this._video.elem.volume * 100}%`
        } else if (y >= 5) {
            this._video.elem.volume = 0.9
            this._volume.elem.progress.style.height = `${this._video.elem.volume * 100}%`
        } else if (y < 5) {
            this._video.elem.volume = 1
            this._volume.elem.progress.style.height = `${this._video.elem.volume * 100}%`
        }
    }

    // Перевод плеера в полноэкранный режим/выход из полноэкранного режима
    _fullScreenModeHandler = () => {
        if (!document.fullscreenElement) {
            if (this._videoBackground.elem.requestFullScreen) {
                this._videoBackground.elem.requestFullScreen()
            } else if(this._videoBackground.elem.mozRequestFullScreen) {
                this._videoBackground.elem.mozRequestFullScreen()
            } else if(this._videoBackground.elem.webkitRequestFullScreen) {
                this._videoBackground.elem.webkitRequestFullScreen()
            }
        } else {
            if (document.cancelFullScreen) {
                document.cancelFullScreen()
            } else if(document.mozCancelFullScreen) {
                document.mozCancelFullScreen()
            } else if(document.webkitCancelFullScreen) {
                document.webkitCancelFullScreen()
            }
        }
    }



    // НАЧАЛЬНЫЕ УСТАНОВКИ И ПОДПИСКИ НА СОБЫТИЯ ПЛЕЕРА ПЕРЕД НАЧАЛОМ ВОСПРОИЗВЕДЕНИЯ
    _initialPlayer = () => {
        this._video.elem.addEventListener('timeupdate', this._updateVideoTime) // Подписываемся на обновление времени
        this._videoPointer.elem.addEventListener('mousedown', this._startDragVideoPointer) // Подписываемся на начало перетаскивания ползунка видео
        this._video.elem.addEventListener('canplaythrough', this._canplaythrough) // Подписываемся на событие готовности к долгосрочному воспроизведению видео
        this._video.elem.addEventListener('ended', this._changeVideoPlayingStatus) // Подписываемся на событие завершения воспроизведения видео (меняем статус воспроизведения видео)
        document.addEventListener('keydown', this._pressedSpaceKeyHandler) // Подписываемся на нажатие пробела для паузы/воспроизведения
        this._video.elem.addEventListener('click', this._playPauseVideo) // Подписываемся на прослушивание события клика для паузы/воспроизведения
        this._pause.elem.addEventListener('click', this._playPauseVideo) // Подписываемся на прослушивание события клика на кнопке паузы для паузы/воспроизведения
        document.addEventListener('keydown', this._pressedArrowsLeftRightKeyDownHandler) // Подписываемся на прослушивание события нажатия срелок влево/вправо для перемотки воспроизведения видео
        document.addEventListener('keyup', this._pressedArrowsLeftRightKeyUpHandler) // Подписываемся на прослушивание события отпускания клавишей стрелов влево/вправо для запуска воспроизведения видео
        this._videoProgress.elem.container.addEventListener('mousedown', this._mousedownOnProgressBarToRewindVideoHandler) // Подписываемся на прослушивание события нажатие кнопки мыши (mousedown) для перемотки видео до кликнутого состояния
        this._videoProgress.elem.container.addEventListener('mouseup', this._mouseupOnProgressBarToRewindVideoHandler) // Подписываемся на прослушивание события отпускания кнопки мыши (mouseup) для завершения перемотки видео до кликнутого состояния


        this._videoContainer.elem.addEventListener('mousewheel', this._changeVolumeScrollHandler)
        document.addEventListener('keydown', this._changeVolumeArrowsHandler)
        this._volume.elem.container.addEventListener('click', this._changeVolumeClickHandler)
        this._videoBackground.elem.addEventListener('dblclick', this._fullScreenModeHandler)
        this._controls.elem.addEventListener('mouseenter', this._mouseEnterToControlsHandler)
        this._volume.elem.container.addEventListener('mouseenter', this._mouseEnterToControlsHandler)
        this._controls.elem.addEventListener('mouseleave', this._mouseLeaveToControlsHandler)
        this._volume.elem.container.addEventListener('mouseleave', this._mouseLeaveToControlsHandler)
        this._videoContainer.elem.addEventListener('mousemove', this._planingToHideControlsAndVolumeHandler)
        this._video.elem.addEventListener('waiting', this._loader.show)
        this._video.elem.addEventListener('playing', this._loader.hide)
        this._video.elem.addEventListener('canplay', this._canplayHandler) // Добавляем обработчик ...
    }

    // Функция, меняющая статус воспроизведения видео (используется при окончании воспроизведения видео)
    _changeVideoPlayingStatus = () => {
        this._video.elem.playing = false
    }

    // При попадании указателя мыши на панели управления видео индикатор _inControls переходит в состояние true
    _mouseEnterToControlsHandler = () => {
        this._inControls = true
    }

    // При попадании указателя мыши на панели управления видео индикатор _inControls переходит в состояние true
    _mouseLeaveToControlsHandler = () => {
        this._inControls = false
    }

    // Удаляем все обработчики, навешанные видеоплеером!
    removeEventListeners = () => {
        this._video.elem.removeEventListener('canplaythrough', this._showClickToPlayLabelHandler) // Отписываемся от прослушивания события готовности воспроизведения видео для отрисовки кнопки воспроизведения вдиое по клику
        this._video.elem.removeEventListener('click', this._clickToPlayLabelHandler) // Отписываемся от прослушивания события клика по видео для начала воспроизведения видео
        this._clickToPlayLabel.elem.removeEventListener('click', this._clickToPlayLabelHandler) // Отписываемся от прослушивания события клика по надписи для начала воспроизведения видео
        document.removeEventListener('keydown', this._pressSpaceToPlayLabelHandler) // Отписываемся от прослушивания события нажатия клавиши Space для начала воспроизведения видео

        this._video.elem.removeEventListener('timeupdate', this._updateVideoTime) // Отписываемся от прослушивания события обновления времени воспроизведения видео
        this._videoPointer.elem.removeEventListener('mousedown', this._startDragVideoPointer) // Отписываемся от просшуливания события начала перетаскивания ползунка видео
        this._videoPointer.elem.ondragstart = null // возвращаем стандартное поведение при стандартном Drag and Drop
        this._video.elem.removeEventListener('canplaythrough', this._canplaythrough) // Отписываемся от прослушивания события готовности долгосрочного воспроизведения видео
        this._video.elem.removeEventListener('ended', this._changeVideoPlayingStatus) // Одписываемся от события завершения воспроизведения видео (меняем статус воспроизведения видео)
        document.removeEventListener('keydown', this._pressedSpaceKeyHandler) // Одписываемся от нажатие пробела для паузы/воспроизведения
        this._video.elem.removeEventListener('click', this._playPauseVideo) // Отписываемся от прослушивание события клика для паузы/воспроизведения
        this._pause.elem.removeEventListener('click', this._playPauseVideo) // Отписываемся от прослушивание события клика на кнопке паузы для паузы/воспроизведения
        document.removeEventListener('keydown', this._pressedArrowsLeftRightKeyDownHandler) // Отписываемся от прослушивания события нажатия срелок влево/вправо для перемотки воспроизведения видео
        document.removeEventListener('keyup', this._pressedArrowsLeftRightKeyUpHandler) // Отписываемся от прослушивания события "отжатия" стрелок влево/вправо для запуска воспроизведения видео
        this._videoProgress.elem.container.removeEventListener('mousedown', this._mousedownOnProgressBarToRewindVideoHandler)
        this._videoProgress.elem.container.removeEventListener('mouseup', this._mouseupOnProgressBarToRewindVideoHandler)


        this._videoContainer.elem.removeEventListener('mousewheel', this._changeVolumeScrollHandler)
        document.removeEventListener('keydown', this._changeVolumeArrowsHandler)
        this._volume.elem.container.removeEventListener('click', this._changeVolumeClickHandler)
        this._videoBackground.elem.removeEventListener('dblclick', this._fullScreenModeHandler)
        this._controls.elem.removeEventListener('mouseenter', this._mouseEnterToControlsHandler)
        this._volume.elem.container.removeEventListener('mouseenter', this._mouseEnterToControlsHandler)
        this._controls.elem.removeEventListener('mouseleave', this._mouseLeaveToControlsHandler)
        this._volume.elem.container.removeEventListener('mouseleave', this._mouseLeaveToControlsHandler)
        this._videoContainer.elem.removeEventListener('mousemove', this._planingToHideControlsAndVolumeHandler)
        this._video.elem.removeEventListener('waiting', this._loader.show)
        this._video.elem.removeEventListener('playing', this._loader.hide)
        this._video.elem.removeEventListener('canplay', this._canplayHandler)
    }
}

export default VideoPlayerObj


class ClickToPlayLabel {
    constructor({elem, styles}) {
        this.elem = elem
        this._styles = styles
    }
    show = () => {
        this.elem.classList.add(`${this._styles["clickToPlay--show"]}`)
    }
    hide = () => {
        this.elem.classList.remove(`${this._styles["clickToPlay--show"]}`)
    }
}

class Video {
    constructor(video) {
        this.canPlay = false // Может ли воспроизводится видео (при перетаскивании оно ставится в значение false)
        this.waiting = false // Прервалось ли воспроизведение видео через слабый интернет
        this.playing = false // Воспроизводится ли видео (этот маркер изменяется даже тогда, когда видео останавливает/запускает не пользователь!!!)
        this.pause = false // Показывает, было ли видео поставлено на паузу пользователем
        this.elem = video
        this.elem.addEventListener('playing', this._playing)
        this.elem.addEventListener('waiting', this._waiting)
    }
    _playing = () => {
        console.log('playing')
        if (!this.canPlay) this.canPlay = true // При перемотке видео ползунком из состояния waiting нужно, когда видео начинает воспроизводится, поставить маркер canPlay в значение true (иначе не будет работать пауза/запуск)
        this.waiting = false
        if (!this.playing) return // При перемотке из состояния waiting (когда при canplay ставим видео на паузу) наступает событие playing, но так как видео на паузе - ставим маркер playing = false
        this.playing = true
    }
    _waiting = () => {
        this.playing = false
        this.waiting = true
        console.log('waiting')
    }
    play = () => {
        this.elem.play()
        this.playing = true // При запуске видео изменяем маркер playing = true
    }
    stop = () => {
        this.elem.pause()
        this.playing = false // При остановке видео изменяем маркер playing = false
    }
    changeVolume = (level) => {
        this.elem.volume = level
    }
    mute = () => {
        this.elem.muted = true
    }
    unmute = () => {
        this.elem.muted = false
    }
    changeCurrentVideoTime = (newTime) => {
        this.elem.currentTime = newTime
        // this.currentTime = this.elem.currentTime
    }
}

class Volume {
    constructor({container, progress, styles}) {
        this.elem = {container, progress}
        this._styles = styles
        this.isVisible = false // Маркер, указывающий, отображается ли эта панель управления на экране
    }
    show = () => {
        this.elem.container.classList.add(`${this._styles["volume_container--show"]}`)
        this.isVisible = true
    }
    hide = () => {
        this.elem.container.classList.remove(`${this._styles["volume_container--show"]}`)
        this.isVisible = false
    }
    changeVolume = (level) => {
        this.elem.progress.style.height = `${level * 100}%`
    }
}

class Controls {
    constructor({elem, styles}) {
        this.elem = elem
        this._styles = styles
        this.isVisible = false // Маркер, указывающий, отображается ли эта панель управления на экране
    }
    show = () => {
        this.elem.classList.add(`${this._styles["player_controls--show"]}`)
        this.isVisible = true
    }
    hide = () => {
        this.elem.classList.remove(`${this._styles["player_controls--show"]}`)
        this.isVisible = false
    }
}

class VideoPointer {
    constructor({elem}) {
        this.elem = elem
        this.moveArrows = false
        this.clickOnVideoPointer = false // Показывает, клацнули лы ми на ползунке видео
        this.elem.ondragstart = function() { // Отмена стандартного механизма DnD (Drag and Drop)
            return false
        }
    }
    changePosition = (x) => {
        this.elem.style.left = `${x}%`
    }
}

class VideoProgress {
    constructor({elem}) {
        this.elem = {}
        this.elem.container = elem.container
        this.elem.progress = elem.progress
        this.clickOnVideoProgress = false
    }
    changePosition = (x) => {
        this.elem.progress.style.width = `${x}%`
    }
}

class Pause {
    constructor({elem, styles}) {
        this.elem = elem
        this._styles = styles
    }
    show = () => {
        this.elem.classList.add(`${this._styles["pause--show"]}`)
    }
    hide = () => {
        this.elem.classList.remove(`${this._styles["pause--show"]}`)
    }
}

class CTime {
    constructor({elem}) {
        this.elem = elem
    }
}

class ATime {
    constructor({elem}) {
        this.elem = elem
    }
}

class VideoContainer {
    constructor({elem}) {
        this.elem = elem
    }
}

class VideoBackground {
    constructor({elem}) {
        this.elem = elem
    }
}

class Loader {
    constructor({elem, styles}) {
        this.elem = elem
        this._styles = styles
    }
    show = () => {
        this.elem.classList.add(`${this._styles["loader--show"]}`)
    }
    hide = () => {
        this.elem.classList.remove(`${this._styles["loader--show"]}`)
    }
}