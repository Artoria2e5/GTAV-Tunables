function set(obj, path, value) {
    const pathArray = Array.isArray(path) ? path : path.match(/([^[.\]])+/g);

    pathArray.reduce((acc, key, i) => {
        if (acc[key] === undefined) acc[key] = {};
        if (i === pathArray.length - 1) acc[key] = value;
        return acc[key];
    }, obj);
}

function omit(obj, props) {
    obj = { ...obj };
    props.forEach(prop => delete obj[prop]);
    return obj;
}

function findKey(obj, predicate = o => o) {
    return Object.keys(obj).find(key => predicate(obj[key], key, obj));
}


// findKey(dictionary.other, x => x == value);
function invertOther(other) {
    const inverted = {};
    for (const [key, value] of Object.entries(other)) {
        inverted[value] = key;
    }
    return inverted;
}
function findOtherKey(iother, value) {
    return iother[value];
}


// findKey(dictionary.tunables, x => x.sum[contextKey] == keyWithoutPrefix);
function invertTunablesSum(tunables) {
    const inverted = {};
    for (const [key, value] of Object.entries(tunables)) {
        for (const [contextKey, contextValue] of Object.entries(value.sum)) {
            if (!inverted[contextKey]) inverted[contextKey] = {};
            inverted[contextKey][contextValue] = key;
        }
    }
    return inverted;
}
function findTunablesSumKey(isum, contextKey, value) {
    if (isum[contextKey]) {
        return isum[contextKey][value];
    }
}


function mapToObject(m) {
    let lo = {}
    for (let [k, v] of m) {
        if (v instanceof Map) {
            lo[k] = mapToObject(v)
        }
        else {
            lo[k] = v
        }
    }
    return lo
};

function objectToMap(o) {
    let m = new Map()
    for (let k of Object.keys(o)) {
        if (o[k] instanceof Object) {
            m.set(k, objectToMap(o[k]))
        }
        else {
            m.set(k, o[k])
        }
    }
    return m
};

const stripHexPrefix = (hex) => hex.substring(3, hex.length);

module.exports = {
    set,
    omit,
    findKey,
    invertOther,
    findOtherKey,
    invertTunablesSum,
    findTunablesSumKey,
    mapToObject,
    objectToMap,
    stripHexPrefix,
};
