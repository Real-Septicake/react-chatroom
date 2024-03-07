export function message(flag: Flag, user: string = '', msg: string = ''): Message {
    return {
        flag: flag,
        user: user,
        msg: msg,
        timestamp: Date.now() + new Date().getTimezoneOffset() * 60_000,
        uuid: ''
    }
}

export type Message = {
    flag: Flag,
    user: string,
    msg: string,
    timestamp: number,
    uuid: string
}

const SHOW = 1;
const LOG = 1 << 1;
const SPECIAL = 1 << 2;

function flag(id: number, flags: number = 0): Flag {
    return {
        id: id,
        show: (flags & SHOW) !== 0,
        log: (flags & LOG) !== 0,
        special: (flags & SPECIAL) !== 0
    };
}

type Flag = {
    id: number,
    show: boolean,
    log: boolean,
    special: boolean;
}

export const FLAGS = {
    message: flag(0, SHOW | LOG),
    join: flag(1, SHOW | LOG),
    leave: flag(2, SHOW | LOG),
    name_check: flag(3, SPECIAL),
    name_failed: flag(4),
    name_succeed: flag(5),
    log_request: flag(6, SPECIAL),
    log_finish: flag(7),
}