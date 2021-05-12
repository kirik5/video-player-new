import React from 'react'
import { useEffect, useState, useRef } from 'react'
import styles from './video-player.module.css'
import { getOffsetLeft, getOffsetWidth, getOffsetTop } from './offset-left-width'
import { getHours, getMinutes, getSeconds } from './get-time'
import VideoPlayerObj from './video-player-obj'


let timerId = null // Aйдишник таймера, который доступен для всех useEffect`ов
let removeHideControlsPanel = false // Отмена всех действий по скрытию панели управления видео
let waiting = false // Ожидает ли загрузку
let playing = false // Проигрывается ли
let canPlay = false // Готово ли к воспроизведению


const VideoPlayer = ({videoLink, posterLink, filmName}) => {
    
    // const [isPlaying, setPlayMode] = useState(false) // Воспроизводится или нет
    // const [isShowingControls, setShowControlsMode] = useState(false) // Показываются или нет панели управления видео и громкостью
  
    const video = useRef() // реф на видео
    const progress = useRef() // реф на индикатор прогресса
    const progressContainer = useRef() // реф на контейнер индикатора прогресса
    const toggler = useRef() // реф на ползунок видео
    const container = useRef() // реф на весь контейнер с видео
    const background = useRef() // реф на контейнер с фоном
    const controlsPanel = useRef() // реф на панель управления видео
    const pause = useRef() // реф на значок с паузой
    const volume = useRef() // реф для индикатора громкости
    const volumeContainer = useRef() // реф для контейнера индикатора громкости
    const clickToPlayLabel = useRef() // реф для надписи запуска видео
    const currTime = useRef() // реф для надписи текущего времени
    const allTime = useRef() // реф для надписи всего времени
  
    
    // // ДОПОЛНИТЕЛЬНЫЕ ФУНКЦИИ НАЧАЛО
    // // Планирование скрытия панелей управления видео и громкостью
    // const planingHideControlsPanels = () => {
    //     timerId = setTimeout(() => {
    //         const cp = controlsPanel.current
    //         if (!cp.classList.contains(`${styles["controls--hide"]}`)) {
    //             cp.classList.add(`${styles["controls--hide"]}`)
    //         }
    //         const vc = volumeContainer.current
    //         vc.classList.add(`${styles["volume_container--hide"]}`)
    //     }, 3000)
    // }
    //
    // // Очистка таймера
    // const clearTimer = () => {
    //     if (timerId) { // Если есть отложенное скрытие панели управления видео -
    //         clearTimeout(timerId) // Удаляем таймер отложенного скрытия панели управления видео
    //         timerId = null // Очищаем ID таймера отложенного скрытия панели управления видео
    //     }
    // }
    //
    // // Показываем панели управления видео и громкостью
    // const showControlsPanels = () => {
    //     const cp = controlsPanel.current
    //     const vc = volumeContainer.current
    //     if (cp?.classList?.contains(`${styles["controls--hide"]}`)) { // Если панель управления видео скрыта -
    //         cp.classList.remove(`${styles["controls--hide"]}`) // Показываем ее
    //     }
    //     if (vc?.classList?.contains(`${styles["volume_container--hide"]}`)) {
    //         vc.classList.remove(`${styles["volume_container--hide"]}`)
    //     }
    // }
    // // ДОПОЛНИТЕЛЬНЫЕ ФУНКЦИИ КОНЕЦ


    
    // После загрузки видео, после клика на нем, воспроизводим видео
    useEffect(() => {

        const videoPlayer = new VideoPlayerObj({
            video: video.current,
            clickToPlayLabel: clickToPlayLabel.current,
            controls: controlsPanel.current,
            volumeContainer: volumeContainer.current,
            volumeProgress: volume.current,
            videoPointer: toggler.current,
            videoProgress: {
                container: progressContainer.current,
                progress: progress.current
            },
            pause: pause.current,
            cTime: currTime.current,
            aTime: allTime.current,
            videoContainer: container.current,
            videoBackground: background.current,
            styles: styles,
        })

        return () => {
            videoPlayer.removeEventListeners()
        }
    }, [])
  
  
    // // Проверяем, играть или поставить на паузу
    // useEffect(() => {
    //   const vd = video.current
    //   if (isPlaying) {
    //     vd.play()
    //   } else {
    //     vd.pause()
    //   }
    // }, [isPlaying])


    // // Функция обновления позиции ползунка видео и индикатора прогресса
    // const updateTogglerPosition = (toggler, progress, newPos) => {
    //     toggler.style.left = `${newPos}%`
    //     progress.style.width = `${newPos}%`
    // }
    //
    // // Обновляем позицию toggler`a
    // useEffect(() => {
    //     if (!isShowingControls) return
    //     const vd = video.current
    //     const tg = toggler.current
    //     const pg = progress.current
    //     const vl = volume.current
    //     const updateTogglerPositionHandler = () => {
    //         const pos = vd.currentTime / vd.duration * 100
    //         updateTogglerPosition(tg, pg, pos)
    //     }
    //     vd.addEventListener('timeupdate', updateTogglerPositionHandler)
    //     vl.style.height = `${vd.volume * 100}%` // Устанавливаем начальный уровень индикатора громкости
    //     return () => vd.removeEventListener('timeupdate', updateTogglerPositionHandler)
    //   }, [isShowingControls])
    //
    //
    // // // После окончания видео меняем значение в стейте...
    // // useEffect(() => {
    // //     const vd = video.current
    // //     const stopingVideoHandler = () => {
    // //         const ps = pause.current
    // //         // setPlayMode(false)
    // //         removeHideControlsPanel = true // Записываем true в переменную отмены планирования скрытия панели управления видео
    // //         clearTimer() // Если есть запланированный таймер - очищаем его
    // //         showControlsPanels() // Показываем панели управления видео и громкостью
    // //         ps.classList.add(`${styles.pause_show}`) // Показываем кнопку паузы
    // //     }
    // //     vd.addEventListener('ended', stopingVideoHandler)
    // //     return () => vd.removeEventListener('ended', stopingVideoHandler)
    // // }, [])
    //
    //
    //
    // // ПЕРЕТАСКИВАНИЕ ПОЛЗУНКА ВИДЕО, ПАУЗА/ИГРА, СКРЫТИЕ/ПОКАЗ ПАНЕЛИ
    // useEffect(() => {
    //     if (!isShowingControls) return // Если не появилась панель управления видео отменяем какие-либо действия
    //
    //     const tg = toggler.current // Указатель на ползунок видео
    //
    //     // Отмена стандартного механизма DnD (Drag and Drop)
    //     tg.ondragstart = function() {
    //         return false
    //     }
    //
    //     const vd = video.current // Указатель на видео
    //     const ct = container.current // Указатель на контейнер с видео
    //     const cp = controlsPanel.current // Указатель на панель управления видео
    //     const ps = pause.current // Указатель на иконку с паузой
    //     const pgct = progressContainer.current // Указатель на контейнер для индикатора прогресса
    //     const vl = volume.current // Указатель на индикатор громкости
    //     const vc = volumeContainer.current // Указатель на контейнер с индикатором громкости
    //     const pg = progress.current // Указатель на прогресс-бар
    //     const cut = currTime.current // Указатель на
    //
    //     let isPlayingLocal // Играет ли плеер
    //     let canMouseDown = true // Можно ли делать следующее перетаскивание ползунка видео (можно ли делать перемотку) (догрузилось ли видео)
    //     let didMove = false // Показывает, было ли перетаскивание ползунка видео (показывает также, происходит ли перетаскивание ползунка видео сейчас)
    //     let onControls // Курсор находится над панелью управления видео
    //     let didMouseUp = false // Показывает, была ли отпущена кнопка мыши при перетаскивании
    //     let downloaded = true // Показывает, была ли догрузка видео
    //     let canStopPlay
    //
    //
    //
    //
    //
    //     // После перемотки видео, когда оно готово к проигрыванию, разрешаем начать следующую перемотку
    //     const canMouseDownHandler = () => {
    //
    //         if (!canMouseDown) {
    //             if (didMouseUp) {
    //                 if (isPlayingLocal) vd.play()
    //             }
    //         }
    //         canMouseDown = true
    //         downloaded = true
    //         console.log('canplaythrough')
    //         canPlay = true
    //     }
    //     vd.addEventListener('canplaythrough', canMouseDownHandler)
    //
    //
    //     // Пока движем мышкой - панель управления видео видна
    //     const moveToShowControlsHandler = () => {
    //         clearTimer() // Очистка таймера
    //         if (onControls) return // Если мышь над панелью управления видео - отменям скрытие панели
    //         if (didMove) return // Отменяем планирование скрытия панели управления видео, если происходит перетаскивание ползунка видео (даже за пределами панели управления)
    //         if (removeHideControlsPanel) return // Отменяем планирование скрытия панели управления видео
    //         showControlsPanels() // Показываем панели
    //         planingHideControlsPanels() // Планируем
    //     }
    //     ct.addEventListener('mousemove', moveToShowControlsHandler)
    //
    //
    //     // По клику останавливаем/запускаем видео
    //     // Если видео остановлено - панель управления видео не должна скрываться
    //     const videoClickHandler = () => {
    //
    //         if (!downloaded) return
    //         if (!isShowingControls) return // Если нет панели управления видео - то и клик по видео не работает
    //         if (didMove) return // Если при перетаскивании нажмер "Space" - стоп/плей не сработает
    //         if (!canMouseDown) return // Если видео подгрузилось - мы не можем нажать на паузу!
    //         if (!canStopPlay) return
    //
    //         isPlayingLocal = !vd.paused // Записываем в переменную воспроизводится ли видео (true) или нет (false)
    //         if (isPlayingLocal) { // Если видео воспроизводится
    //             removeHideControlsPanel = true // Записываем true в переменную отмены планирования скрытия панели управления видео
    //             clearTimer() // Отменяем таймер
    //             showControlsPanels() // Показываем панели управления
    //             ps.classList.add(`${styles.pause_show}`) // Показываем кнопку паузы
    //             vd.pause()
    //         } else { // Если видео не проигрывается (то есть, сейчас мы будем снимать его с паузы)
    //             removeHideControlsPanel = false // Записываем false в переменную отмены планирования скрытия панели управления видео
    //             planingHideControlsPanels() // Планируем скрытие панелей управления видео и громкостью
    //             ps.classList.remove(`${styles.pause_show}`) // Скрываем кнопку паузы
    //             vd.play()
    //         }
    //         // setPlayMode(playMode => !playMode)
    //     }
    //     vd.addEventListener('click', videoClickHandler)
    //     ps.addEventListener('click', videoClickHandler)
    //
    //
    //     const startPlayHandler = () => {
    //         canStopPlay = true
    //         console.log('playing')
    //         playing = true
    //         waiting = false
    //     }
    //     const stopPlayHandler = () => {
    //         canStopPlay = false
    //         console.log('waiting')
    //         playing = false
    //         waiting = true
    //     }
    //     vd.addEventListener('playing', startPlayHandler)
    //     vd.addEventListener('waiting', stopPlayHandler)
    //
    //
    //     // Показываем панель регулирования звука
    //     const showVolumeLevel = () => {
    //         if (onControls) return // Если мышь над панелью управления видео - отменям скрытие панели
    //         if (didMove) return // Отменяем планирование скрытия панели управления видео, если происходит перетаскивание ползунка видео (даже за пределами панели управления)
    //         if (removeHideControlsPanel) return // Отменяем планирование скрытия панели управления видео
    //         // Отменяем скрытие и планируем следующее скрытие и прогрессбара громкости, и панели управления видео, если она видна
    //         clearTimer() // Отменяем таймер
    //         // Планируем скрытие панели управления видео индикатора громкости
    //         vc.classList.remove(`${styles["volume_container--hide"]}`)
    //         planingHideControlsPanels() // Планируем скрыть все панели
    //     }
    //
    //     // Реагируем на нажатие пробела и стрелок "Вверх/Вниз/Вправо/Влево"
    //     const pressKeyHandler = (evt) => {
    //         if (evt.code === 'Space') {
    //             videoClickHandler()
    //         } else {
    //             if (evt.code === 'ArrowUp') {
    //                 if (Number((vd.volume + 0.1).toFixed(1)) <= 1) {
    //                     vd.volume = Number((vd.volume + 0.1).toFixed(1))
    //                     vl.style.height = `${vd.volume * 100}%`
    //                 }
    //                 showVolumeLevel() // Показываем панель регулировки звука и планируем ее скрыть
    //             } else if (evt.code === 'ArrowDown') {
    //                 if (Number((vd.volume - 0.1).toFixed(1)) >= 0) {
    //                     vd.volume = Number((vd.volume - 0.1).toFixed(1))
    //                     vl.style.height = `${vd.volume * 100}%`
    //                 }
    //                 showVolumeLevel() // Показываем панель регулировки звука и планируем ее скрыть
    //             } else if (evt.code === 'ArrowLeft') {
    //                 if (didMove) return
    //                 downloaded = false
    //                 clearTimer() // Отменяем таймер
    //                 showControlsPanels() // Показываем панели управления
    //                 const currTime = vd.currentTime - 5 < 0 ? 0 : vd.currentTime - 5
    //                 vd.currentTime = currTime // Обновляем текущее время видео
    //                 cut.innerHTML = `${getHours(vd.currentTime)}:${getMinutes(vd.currentTime)}:${getSeconds(vd.currentTime)}`
    //                 const pos = vd.currentTime / vd.duration * 100
    //                 updateTogglerPosition(tg, pg, pos) // Обновляем позицию ползунка видео
    //                 if (vd.paused) return // Отменяем скрытие панели управления видео, если перематываем стрелками, а видео стоит на паузе
    //                 planingHideControlsPanels() // Планируем скрытие панелей управления видео и громкостью
    //
    //             } else if (evt.code === 'ArrowRight') {
    //                 if (didMove) return
    //                 downloaded = false
    //                 clearTimer() // Отменяем таймер
    //                 showControlsPanels() // Показываем панели управления
    //                 const currTime = vd.currentTime + 5 > vd.duration ? vd.duration : vd.currentTime + 5
    //                 vd.currentTime = currTime // Обновляем текущее время видео
    //                 cut.innerHTML = `${getHours(vd.currentTime)}:${getMinutes(vd.currentTime)}:${getSeconds(vd.currentTime)}`
    //                 const pos = vd.currentTime / vd.duration * 100
    //                 updateTogglerPosition(tg, pg, pos) // Обновляем позицию ползунка видео
    //                 if (vd.paused) return // Отменяем скрытие панели управления видео, если перематываем стрелками, а видео стоит на паузе
    //                 planingHideControlsPanels() // Планируем скрытие панелей управления видео и громкостью
    //             }
    //         }
    //     }
    //     document.addEventListener('keydown', pressKeyHandler)
    //
    //
    //     // При вращении колесика мыши добавляем/убираем громкость
    //     const changeVolumeHandler = (evt) => {
    //         let delta = evt.deltaY || evt.detail || evt.wheelDelta
    //         delta = -Number((delta / 1000).toFixed(1));
    //         if ((vd.volume + delta >= 0) && (vd.volume + delta <= 1)) {
    //             vd.volume = Number((vd.volume + delta).toFixed(1))
    //         }
    //         vl.style.height = `${vd.volume * 100}%`
    //         if (onControls) return // Если мышь над панелью управления видео - отменям скрытие панели
    //         if (didMove) return // Отменяем планирование скрытия панели управления видео, если происходит перетаскивание ползунка видео (даже за пределами панели управления)
    //         if (removeHideControlsPanel) return // Отменяем планирование скрытия панели управления видео
    //         // Отменяем скрытие и планируем следующее скрытие и прогрессбара громкости, и панели управления видео, если она видна
    //         clearTimer() // Удаляем таймер
    //         // Планируем скрытие панели управления видео индикатора громкости
    //         vc.classList.remove(`${styles["volume_container--hide"]}`)
    //         planingHideControlsPanels() // Планируем скрыть все панели
    //     }
    //     ct.addEventListener('mousewheel', changeVolumeHandler)
    //
    //
    //     // По щелчку на индикаторе громкости меняем громкость
    //     const changeClickVolumeHandler = (evt) => {
    //         let y = evt.clientY - getOffsetTop(volumeContainer)
    //         if (y >= 95) {
    //             vd.volume = 0
    //             vl.style.height = `${vd.volume * 100}%`
    //         } else if (y >= 85) {
    //             vd.volume = 0.1
    //             vl.style.height = `${vd.volume * 100}%`
    //         } else if (y >= 75) {
    //             vd.volume = 0.2
    //             vl.style.height = `${vd.volume * 100}%`
    //         } else if (y >= 65) {
    //             vd.volume = 0.3
    //             vl.style.height = `${vd.volume * 100}%`
    //         } else if (y >= 55) {
    //             vd.volume = 0.4
    //             vl.style.height = `${vd.volume * 100}%`
    //         } else if (y >= 45) {
    //             vd.volume = 0.5
    //             vl.style.height = `${vd.volume * 100}%`
    //         } else if (y >= 35) {
    //             vd.volume = 0.6
    //             vl.style.height = `${vd.volume * 100}%`
    //         } else if (y >= 25) {
    //             vd.volume = 0.7
    //             vl.style.height = `${vd.volume * 100}%`
    //         } else if (y >= 15) {
    //             vd.volume = 0.8
    //             vl.style.height = `${vd.volume * 100}%`
    //         } else if (y >= 5) {
    //             vd.volume = 0.9
    //             vl.style.height = `${vd.volume * 100}%`
    //         } else if (y < 5) {
    //             vd.volume = 1
    //             vl.style.height = `${vd.volume * 100}%`
    //         }
    //     }
    //     vc.addEventListener('click', changeClickVolumeHandler)
    //
    //
    //     // Ставим флажок о том, что мы над панелью управления видео
    //     const enterControlsHanlder = () => {
    //         onControls = true
    //     }
    //     cp.addEventListener('mouseenter', enterControlsHanlder)
    //     vc.addEventListener('mouseenter', enterControlsHanlder)
    //
    //
    //     // Снимаем флажок о том, что мы не над панелью управления видео
    //     const leaveControlsHanlder = () => {
    //         onControls = false
    //     }
    //     cp.addEventListener('mouseleave', leaveControlsHanlder)
    //     vc.addEventListener('mouseleave', leaveControlsHanlder)
    //
    //
    //     // Меняем положение ползунка видео на прогрессбаре и текущее время проигрывания видео
    //     const changePositionToggler = (evt) => {
    //         const clientX = evt.clientX
    //         const tg = toggler.current
    //         const pg = progress.current
    //         const vd = video.current
    //         const offsetLeft = getOffsetLeft(progressContainer)
    //         const offsetWidth = getOffsetWidth(progressContainer)
    //         let x
    //         if (clientX < offsetLeft) {
    //             x = 0
    //         } else if (clientX > offsetLeft + offsetWidth) {
    //             x = offsetWidth
    //         } else {
    //             x = clientX - offsetLeft
    //         }
    //         const pos = x * vd.duration / offsetWidth / vd.duration * 100
    //         updateTogglerPosition(tg, pg, pos) // Обновляем позицию ползунка видео
    //         const currTime = x * vd.duration / offsetWidth
    //         vd.currentTime = currTime // Обновляем текущее время видео
    //     }
    //
    //     // Перетаскивание ползунка видео
    //     const move = (evt) => {
    //         didMove = true // Укажем в маркере didMove о том, что было перетаскивание ползунка видео
    //         changePositionToggler(evt) // Меняем позицию прогресс-бара и ползунка видео
    //         downloaded = false
    //     }
    //
    //
    //     // Заканчиваем перетаскивать ползунок видео
    //     const up = () => {
    //         document.removeEventListener('mousemove', move)
    //         document.removeEventListener('mouseup', up)
    //         if (downloaded) { // Если произошла догрузка видео (ползунок видео при перетаскивании отпустили не сразу)
    //             if (isPlayingLocal) vd.play()
    //         }
    //         if (didMove) { // Если было перетаскивание ползунка видео
    //             didMove = false // стираем информацию о нем
    //         } else {
    //             canMouseDown = true // если перетаскивания ползунка не было - нет и подгрузки видео - разрешаем начать следующее перетаскивание
    //         }
    //         didMouseUp = true // Была отпущена кнопка мыши при перетаскивании
    //     }
    //
    //     // Начинаем перетаскивать ползунок видео
    //     const down = () => {
    //         if (!canMouseDown) return // Если не разрешается нажимать - нажатия не происходит
    //         document.addEventListener('mousemove', move) // После нажатия мышки подписываемся на перемещение курсора
    //         document.addEventListener('mouseup', up) // Подписываемся и на отпускание мышки
    //         canMouseDown = false // Запрещаем дальнейшие нажатия мышкой
    //         isPlayingLocal = !vd.paused // Сохраняем состояние проигрывания видео в локальную переменную isPlaying
    //         if (isPlayingLocal) vd.pause() // Если видео проигрывалось - останавливаем (без изменения состояния в react-компоненте)
    //         didMouseUp = false // Сбрасываем маркер была ли отпущена кнопка мыши при перетаскивании
    //
    //     }
    //     tg.addEventListener('mousedown', down)
    //
    //
    //
    //
    //     // Перематываем видео по клику на прогрессбаре
    //     const clickProgressHandler = (evt) => {
    //         if (!canMouseDown) return // Если не разрешается нажимать - нажатия не происходит
    //         canMouseDown = false // Запрещаем дальнейшие нажатия мышкой
    //         changePositionToggler(evt) // Меняем позицию прогресс-бара и ползунка видео
    //     }
    //     pgct.addEventListener('click', clickProgressHandler)
    //
    //
    //     // Отписываемся от всех событий, если компонент перерисовывается
    //     return () => {
    //         tg.removeEventListener('mousedown', down)
    //         vd.removeEventListener('canplaythrough', canMouseDownHandler)
    //         ct.removeEventListener('mousemove', moveToShowControlsHandler)
    //         vd.removeEventListener('click', videoClickHandler)
    //         cp.removeEventListener('mouseenter', enterControlsHanlder)
    //         cp.removeEventListener('mouseleave', leaveControlsHanlder)
    //         pgct.removeEventListener('click', clickProgressHandler)
    //         document.removeEventListener('keydown', pressKeyHandler)
    //         ct.removeEventListener('mousewheel', changeVolumeHandler)
    //         ct.removeEventListener('click', changeClickVolumeHandler)
    //         vc.removeEventListener('mouseenter', enterControlsHanlder)
    //         vc.removeEventListener('mouseleave', enterControlsHanlder)
    //         vc.removeEventListener('click', changeClickVolumeHandler)
    //         ps.removeEventListener('click', videoClickHandler)
    //         if (timerId) clearTimer(timerId)
    //     }
    // }, [isShowingControls])
    //
    //
    // // По двойному щелчку переходим в полноэкранный режим
    // useEffect(() => {
    //     const bg = background.current
    //     const ct = container.current
    //
    //     const fullScreenHandler = () => {
    //         if (!document.fullscreenElement) {
    //             if (bg.requestFullScreen) {
    //                 bg.requestFullScreen()
    //             } else if(bg.mozRequestFullScreen) {
    //                 bg.mozRequestFullScreen()
    //             } else if(bg.webkitRequestFullScreen) {
    //                 bg.webkitRequestFullScreen()
    //             }
    //
    //         } else {
    //             if (document.cancelFullScreen) {
    //                 document.cancelFullScreen()
    //             } else if(document.mozCancelFullScreen) {
    //                 document.mozCancelFullScreen()
    //             } else if(document.webkitCancelFullScreen) {
    //                 document.webkitCancelFullScreen()
    //             }
    //         }
    //     }
    //     ct.addEventListener('dblclick', fullScreenHandler)
    //
    //     return () => ct.removeEventListener('dblclick', fullScreenHandler)
    // }, [])
    //
    //
    // // Отображаем все время фильма и текущее время на шкале
    // useEffect(() => {
    //     if (!isShowingControls) return // Если не появилась панель управления видео отменяем какие-либо действия
    //     const alt = allTime.current
    //     const vd = video.current
    //     let time
    //     time = vd.duration
    //     alt.innerHTML = `${getHours(time)}:${getMinutes(time)}:${getSeconds(time)}`
    //     const cut = currTime.current
    //     const getCurrentTime = () => {
    //         cut.innerHTML = `${getHours(vd.currentTime)}:${getMinutes(vd.currentTime)}:${getSeconds(vd.currentTime)}`
    //     }
    //     vd.addEventListener('timeupdate', getCurrentTime)
    //     return () => vd.removeEventListener('timeupdate', getCurrentTime)
    // }, [isShowingControls])


    return (
        <div
            className={styles.playerBackground}
            ref={background}
        >
            <div
                className={styles.player_container}
                ref={container}
            >

                <video
                    ref={video}
                    className={styles.player}
                    src={videoLink}
                    poster={posterLink}
                    autoPlay={false}
                    muted={true}
                    controls={false}
                ></video>


                        <div
                            className={styles.player_controls}
                            ref={controlsPanel}
                        >
                            <div
                                className={styles['progress_bar--grey']}
                                ref={progressContainer}
                            >
                                <div
                                    className={styles.progress_bar}
                                    ref={progress}
                                ></div>
                                <div
                                    className={styles.toggler}
                                    ref={toggler}
                                ></div>
                            </div>
                            <div className={styles.time}>
                                <span
                                    className={styles.current_time}
                                    ref={currTime}
                                >
                                    00:00:01
                                </span>/
                                <span
                                    className={styles.all_time}
                                    ref={allTime}
                                >
                                    01:39:45
                                </span>
                                <span
                                    className={styles.film_name}
                                >{filmName}</span>
                            </div>
                        </div>
                        <div
                            className={styles.volume_container}
                            ref={volumeContainer}
                        >
                            <div
                                className={styles.volume_progress}
                                ref={volume}
                            ></div>
                        </div>

                <div
                    className={styles.pause}
                    ref={pause}
                >
                    <div className={styles.horizontal_line}></div>
                    <div className={styles.horizontal_line}></div>
                </div>

                <div
                    className={styles.clickToPlay}
                    ref={clickToPlayLabel}
                >Click to PLAY</div>
            </div>
        </div>
    )
}


export default VideoPlayer