export class Message {
    readonly flag: Flag;
    readonly user: string;
    readonly msg: string;
    readonly timestamp: number;

    constructor(flag: Flag, user: string = '', msg: string = '', timestamp: number = Date.now() + new Date().getTimezoneOffset() * 60_000) {
        this.flag = flag;
        this.user = user;
        this.msg = msg;
        this.timestamp = timestamp;
    }
}

const SHOW = 1;
const LOG = 1 << 1;
const SPECIAL = 1 << 2;

class Flag {
    readonly show: boolean;
    readonly log: boolean;
    readonly special: boolean;

    constructor(flags: number = 0) {
        this.show = (flags & SHOW) !== 0;
        this.log = (flags & LOG) !== 0;
        this.special = (flags & SPECIAL) !== 0;
    }
}

export const FLAGS = {
    message: new Flag(SHOW | LOG),
    join: new Flag(SHOW | LOG),
    leave: new Flag(SHOW | LOG),
}