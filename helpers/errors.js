class AbtractMethodError extends TypeError {
    constructor(what) {
        super(what + ' is abstract!');
    }
}
function abstract(what) {
    throw new AbtractMethodError(what);
}

module.exports = {
    abstract;
}
