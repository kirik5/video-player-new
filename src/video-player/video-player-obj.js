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

    // Показываем начальную кнопку запуску по клику, когда видео готово
    _showClickToPlayLabelHandler = () => {
        this._video.elem.removeEventListener('canplaythrough', this._showClickToPlayLabelHandler)
        this._loader.hide()
        this._clickToPlayLabel.show()
        this._video.elem.addEventListener('click', this._clickToPlayLabelHandler)
        this._clickToPlayLabel.elem.addEventListener('click', this._clickToPlayLabelHandler)
        document.addEventListener('keydown', this._clickToPlayLabelHandler)
        this._video.canPlay = true // Показывает, что видео может быть воспроизведено
    }

    // Обрабатываем клик по начальной кнопке запуска видео
    _clickToPlayLabelHandler = () => {
        // Убираем начальные подписки на события НАЧАЛО
        this._video.elem.removeEventListener('click', this._clickToPlayLabelHandler)
        this._clickToPlayLabel.elem.removeEventListener('click', this._clickToPlayLabelHandler)
        document.removeEventListener('keydown', this._clickToPlayLabelHandler)
        //Убираем начальные подписки на события КОНЕЦ
        this._initialPlayer() // Запускаем все подписки на события в плеере
        this._clickToPlayLabel.hide()
        this._controls.show()
        this._volume.show()
        this._video.play()
        this._video.unmute()
        this._video.changeVolume(0.3)
        this._volume.changeVolume(0.3)
        this._video.playing = true
        this._video.didPlayed = true
        this._planingToHideControlsAndVolumeHandler()
    }

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

    // Вычисляем новую позицию прогресс-бара и ползунка видео при воспроизведении видео
    _calculateNewPositionPointerProgress = () => {
        const currentTime = this._video.elem.currentTime
        const allTime = this._video.elem.duration
        return currentTime / allTime * 100
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

    // Функция обработки клика по ползунку видео
    _startDragVideoPointer = () => {
        if (this._videoPointer.moveArrows) return
        // Функция перемещения ползунка видео
        const moveVideoPointer = (evt) => {
            this._videoPointer.moving = true // Показываем, чтомы сейчас пребываем в режиме перетаскивания ползунка видео
            this._video.canPlay = false // Показываем, что при перетаскивании ползунка видео оно не может быть воспроизведено
            const newPosition = this._calculateNewPositionPointerProgressOnDrag(evt.clientX)
            this._videoPointer.changePosition(newPosition.persent)
            this._videoProgress.changePosition(newPosition.persent)
            this._video.changeCurrentVideoTime(newPosition.currentTime)
            this._showTimesHandler()
        }
        // Функция завершения перетаскивания ползунка видео
        const mouseUp = () => {
            document.removeEventListener('mousemove', moveVideoPointer)
            document.removeEventListener('mouseup', mouseUp)
            if (!this._video.pause) this._loader.show()
            this._videoPointer.moving = false // Показываем, что перетаскивание ползунка завершилось
            if (this._video.pause) return // Не запускаем видео после перетаскивания, так как оно стоит на паузе
            if (!this._video.canPlay) return // Если видео не готово к воспроизведению - даже не проверяем, нужно ли его запустить
            if (this._video.didPlayed) {
                this._video.play() // Если видео было запущено до начала перетаскивания ползунка видео - воспроизводим его
                this._video.didPlayed = true
            }
        }
        document.addEventListener('mousemove', moveVideoPointer) // После нажатия мышки подписываемся на перемещение курсора
        document.addEventListener('mouseup', mouseUp) // Подписываемся и на отпускание мышки
        if (!this._video.playing && this._video.didPlayed) return // Если после перемотки начинается следующая перемотка, а видео еще не подгрузилось - не останавливаем его и не меняем маркер того, воспроизводилось ли видео до перемотки!!!
        if (this._video.waiting) return
        if (this._video.pause) return // Если выдео было на паузе - его не нужно останавливать!!!
        this._video.stop()
    }

    // Функция, которая запускается, если видео готово к воспроизведению
    _canplaythrough = () => {
        this._video.canPlay = true // Показываем, что видео может быть воспроизведено
        this._video.waiting = false // Убираем маркер принудительной остановки видео (по причине недогрузки)
        if (this._video.pause) return // Не запускаем видео после перетаскивания, так как оно стоит на паузе
        if (this._videoPointer.moving) return // Если еще не прекращено перетаскивание ползунка видео - воспроизведение не начинаем
        if (!this._video.didPlayed) return // Если видео не воспроизводилось до начала перетаскивания ползунка видео - то и не начинаем его воспроизводить!
        this._video.play() // Если видео воспроизводилось до начала перетаскивания ползунка видео - продолжаем его воспроизводить!
        this._video.didPlayed = true
    }

    // Функция запускающая/ставящая на паузу воспроизведение видео
    _playPauseVideo = () => {
        if (this._video.waiting) return
        if (!this._video.canPlay) return
        if (this._videoPointer.moving) return
        if (this._videoPointer.moveArrows) return
        if (this._video.pause) {
            this._video.play()
            this._video.pause = false
            this._pause.hide()
            this._video.didPlayed = true
        } else {
            this._video.stop()
            this._video.pause = true
            this._pause.show()
            this._video.didPlayed = false
        }
        this._planingToHideControlsAndVolumeHandler() // Показываем панели управления видео и звуком, елси видео ставится на паузу
    }

    // Функция, которая проверяет, была ли нажата клавиша "Пропуск" и если была - запускает функцию остановки/запуска воспроизведения видео
    _pressedSpaceKeyHandler = (evt) => {
        if (evt.code !== 'Space') return
        this._playPauseVideo()
    }

    // Перемотка видео по нажатию стрелок
    _pressedArrowsLeftRightKeyDownHandler = (evt) => {
        if (this._videoPointer.moving) return
        if (!(evt.code === 'ArrowRight' || evt.code === 'ArrowLeft')) return
        this._videoPointer.moveArrows = true // Указатель на то, что перемещаем ползунок видео стрелками клавиатуры
        this._planingToHideControlsAndVolumeHandler() // При нажатии стрелок перемотки видео появляются панели управления видео и звуком
        if (evt.code === 'ArrowRight') {
            this._video.elem.currentTime += 5
            this._showTimesHandler()
            this._videoPointer.changePosition(this._calculateNewPositionPointerProgress())
            this._videoProgress.changePosition(this._calculateNewPositionPointerProgress())
        } else {
            this._video.elem.currentTime -= 5
            this._showTimesHandler()
            this._videoPointer.changePosition(this._calculateNewPositionPointerProgress())
            this._videoProgress.changePosition(this._calculateNewPositionPointerProgress())
        }
    }

    // После отпускания клавиш стрелок на клавиатуре сигнализируем, что перемотка стрелками закончена (например, для следующего перетаскивания ползунка видео)
    _pressedArrowsLeftRightKeyUpHandler = () => {
        this._videoPointer.moveArrows = false
    }

    // Перемотка видео в то место, куда пользователь будет кликать на прогресс-баре
    _clickOnProgressBarToRewindVideoHandler = (evt) => {
        const newPosition = this._calculateNewPositionPointerProgressOnDrag(evt.clientX)
        this._video.elem.currentTime = newPosition.currentTime
        this._videoPointer.changePosition(newPosition.persent)
        this._videoProgress.changePosition(newPosition.persent)
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
        this._video.elem.addEventListener('timeupdate', this._updateVideoTime)
        this._videoPointer.elem.addEventListener('mousedown', this._startDragVideoPointer)
        this._video.elem.addEventListener('canplaythrough', this._canplaythrough)
        this._video.elem.addEventListener('ended', this._changeVideoPlayingStatus)
        document.addEventListener('keydown', this._pressedSpaceKeyHandler)
        document.addEventListener('keydown', this._pressedArrowsLeftRightKeyDownHandler)
        document.addEventListener('keyup', this._pressedArrowsLeftRightKeyUpHandler)
        this._videoProgress.elem.container.addEventListener('click', this._clickOnProgressBarToRewindVideoHandler)
        this._video.elem.addEventListener('click', this._playPauseVideo)
        this._pause.elem.addEventListener('click', this._playPauseVideo)
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
        this._video.elem.removeEventListener('canplaythrough', this._showClickToPlayLabelHandler)
        this._video.elem.removeEventListener('click', this._clickToPlayLabelHandler)
        this._clickToPlayLabel.elem.removeEventListener('click', this._clickToPlayLabelHandler)
        document.removeEventListener('keydown', this._clickToPlayLabelHandler)
        this._video.elem.removeEventListener('timeupdate', this._updateVideoTime)
        this._videoPointer.elem.removeEventListener('mousedown', this._startDragVideoPointer)
        this._video.elem.removeEventListener('canplaythrough', this._canplaythrough)
        this._videoPointer.elem.ondragstart = null
        this._video.elem.removeEventListener('ended', this._changeVideoPlayingStatus)
        document.removeEventListener('keydown', this._pressedSpaceKeyHandler)
        document.removeEventListener('keydown', this._pressedArrowsLeftRightKeyDownHandler)
        document.removeEventListener('keyup', this._pressedArrowsLeftRightKeyUpHandler)
        this._videoProgress.elem.container.removeEventListener('click', this._clickOnProgressBarToRewindVideoHandler)
        this._video.elem.removeEventListener('click', this._playPauseVideo)
        this._pause.elem.removeEventListener('click', this._playPauseVideo)
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
        this.didPlayed = false // Воспроизводилось ли видео до начала перетаскивания
        this.pause = false // Показывает, было ли видео поставлено на паузу пользователем
        this.elem = video
        this.elem.addEventListener('playing', this._playing)
        this.elem.addEventListener('waiting', this._waiting)
    }
    _playing = () => {
        this.playing = true
        this.waiting = false
    }
    _waiting = () => {
        this.didPlayed = true
        this.playing = false
        this.waiting = true
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
        this.currentTime = this.elem.currentTime
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
        this.elem.ondragstart = function() { // Отмена стандартного механизма DnD (Drag and Drop)
            return false
        }
        this.moving = false
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