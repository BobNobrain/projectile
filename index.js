module.exports = {
    layer(name, version) {
        return new PtlLayer(name, version);
    },

    remoteLayer(name, version) {
        return new RemoteLayer(name, version);
    }
};
