export function message(flag: MessageType, user: string = '', msg: string = ''): Message {
    return {
        flag: flag,
        user: user,
        msg: msg,
        timestamp: Date.now() + new Date().getTimezoneOffset() * 60_000,
        uuid: ''
    }
}

export type Message = {
    flag: MessageType,
    user: string,
    msg: string,
    timestamp: number,
    uuid: string
}

export const CONSTS = { 
    SHOW: 1,
    LOG: 1 << 1,
    SPECIAL: 1 << 2,
}

export function isSet(type: MessageType, flag: number) {
    return (type['flags'] & flag) !== 0;
}

function flag(id: number, flags: number = 0): MessageType {
    return {
        id: id,
        flags: flags,
    };
}

type MessageType = {
    id: number,
    flags: number;
}

export const FLAGS = {
    message: flag(0, CONSTS.SHOW | CONSTS.LOG),
    join: flag(1, CONSTS.SHOW | CONSTS.LOG),
    leave: flag(2, CONSTS.SHOW | CONSTS.LOG),
    name_check: flag(3, CONSTS.SPECIAL),
    name_failed: flag(4),
    name_succeed: flag(5),
    log_request: flag(6, CONSTS.SPECIAL),
    log_finish: flag(7),
}