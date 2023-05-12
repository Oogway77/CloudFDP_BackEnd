module.exports = {
    wrapList: (list) => {
        const newList = {};
        for (const fnName in list) {
            if (list.hasOwnProperty(fnName)) {
                newList[fnName] = (req, res, next) => list[fnName](req, res, next).catch(next);
            }
        }
        return newList;
    },
};
