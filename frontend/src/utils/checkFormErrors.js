const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export const checkEmail = {
    checkEmpty: (stringEmail) => stringEmail !== "",
    checkFormat: (stringEmail) => regex.test(stringEmail),
}
