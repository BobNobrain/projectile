class Remote {
    constructor() {
        this.connection = null;
        this.environment = null;
    }

    setEnvironment(ptl) {
        this.environment = ptl;
    }

    connect() {}
    disconnect() {}

    call(objectName, method, arguments) {}
}
