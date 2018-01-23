module.exports = {
    slug(text) {
        return text.toLowerCase().replace(/ /g, '_');
    },

    async_handler(fn) {
        return (req, res, next) => Promise.resolve(fn(req, res, next))
            .catch((err) => {
                console.log(err);
                // handle error
                res.status(err ? err.status_code : 500).send({ error: err ? err.message : 'Unknown Error'});
            });
    },

    async sleep(seconds) {
        return new Promise(resolve => {
            setTimeout(resolve, seconds * 1000);
        });
    }
}
