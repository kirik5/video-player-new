export const getSeconds = (sec) => {
    let s = Math.floor(sec) % 60
    return s < 10 ? '0' + s : String(s)
}

export const getMinutes = (sec) => {
    let m
    if (sec >= 3600) {
        m = Math.floor(sec) % 3600
    } else {
        m = Math.floor(sec)
    }
    m = Math.floor(m - m % 60) / 60
    return m < 10 ? '0' + m : String(m)
}

export const getHours = (sec) => {
    let h = Math.floor((Math.floor(sec) - Math.floor(sec) % 3600) / 3600)
    return h < 10 ? '0' + h : String(h)
}