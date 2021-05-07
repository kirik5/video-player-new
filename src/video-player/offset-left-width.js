// Берем отступ слева от прогрессбара до края страницы
export const getOffsetLeft = (containerElementRef) => {
    const containerElement = containerElementRef.current
    let offsetLeft = 0
    let container = containerElement
    while (container) {
        offsetLeft += container.offsetLeft
        container = container.offsetParent
    }
    return offsetLeft
}

// Берем отступ сверху от прогрессбара до края страницы
export const getOffsetTop = (containerElementRef) => {
    const containerElement = containerElementRef.current
    let offsetTop = 0
    let container = containerElement
    while (container) {
        offsetTop += container.offsetTop
        container = container.offsetParent
    }
    return offsetTop
}

// Берем ширину прогрессбара
export const getOffsetWidth = (togglerElementRef) => {
    const togglerElement = togglerElementRef.current
    return togglerElement.offsetWidth
}

// Берем высоту прогрессбара
export const getOffsetHeight = (togglerElementRef) => {
    const togglerElement = togglerElementRef.current
    return togglerElement.offsetHeight
}