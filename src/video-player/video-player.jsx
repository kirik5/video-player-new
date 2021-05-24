import React from 'react'
import { useEffect, useRef } from 'react'
import styles from './video-player.module.css'
import VideoPlayerObj from './video-player-obj'
import './loader.css'


const VideoPlayer = ({videoLink, posterLink, filmName}) => {
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
    const loader = useRef() // реф для лоадера
    
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
            loader: loader.current,
            timeout: 3000,
            styles: styles,
        })

        // videoPlayer.showMarkers() // Запускаем отображение маркеров видео-плеера

        return () => {
            videoPlayer.removeEventListeners()
        }
    }, [])


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
                <div
                    className={styles.loader}
                    ref={loader}
                >
                    <div className="lds-roller">
                        <div></div>
                        <div></div>
                        <div></div>
                        <div></div>
                        <div></div>
                        <div></div>
                        <div></div>
                        <div></div>
                    </div>
                </div>
            </div>
        </div>
    )
}


export default VideoPlayer