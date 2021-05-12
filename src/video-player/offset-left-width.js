// Берем отступ слева от прогрессбара до края страницы
export const getOffsetLeft = (containerElement) => {
    let offsetLeft = 0
    let container = containerElement
    while (container) {
        offsetLeft += container.offsetLeft
        container = container.offsetParent
    }
    return offsetLeft
}

// Берем отступ сверху от прогрессбара до края страницы
export const getOffsetTop = (containerElement) => {

    let offsetTop = 0
    let container = containerElement
    while (container) {
        offsetTop += container.offsetTop
        container = container.offsetParent
    }
    return offsetTop
}

// Берем ширину прогрессбара
export const getOffsetWidth = (togglerElement) => {
    return togglerElement.offsetWidth
}

// Берем высоту прогрессбара
export const getOffsetHeight = (togglerElement) => {
    return togglerElement.offsetHeight
}