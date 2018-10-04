const PtlLayer = require('../core/PtlLayer');

class RemoteLayer {
    constructor(name, version, connect) {
        super(name, version);
        this.connect = connect;
        this.synced = false;
    }

    sync() {

    }

    call() {}
}

module.exports = RemoteLayer;
