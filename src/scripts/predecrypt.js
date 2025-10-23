const fs = require('fs');
const upath = require('upath');
const http = require('http-wrapper');
const joaat = require('../lib/joaat');
const CONFIG = require('../config');
const jobsDictionary = require(upath.normalize(`../static/${CONFIG.FILE_NAMES.JOBS_DICTIONARY}`));

const contexts = {};
const tunables = {};
const jobs = {};
const other = {};

// To help figure out what takes so long.
console.profile("predecrypt");

// Getting TUNABLE_NAMES and GTA_DICTIONARY has no dependency on any other variable,
// so spawn independent promises for them both to speed things up.
const parse_tune_ctx = http.get(CONFIG.URLS.TUNABLE_NAMES).then(function parse_tunables(response) {
    for (const line of response.content.toString().split(/\r?\n/)) {
        if (line.length) {
            const { unsigned: uhash } = joaat(line);
            const hash = joaat.hex(uhash);
            tunables[line] = { hash, sum: {} };
            for (const context of CONFIG.TUNABLE_CONTEXTS) {
                const contextJoaat = joaat(context);
                // Only signed is used for now
                contexts[context] = { signed: contextJoaat.signed };
                tunables[line].sum[context] = (uhash + contextJoaat.unsigned).toString(16).toUpperCase();
            }
        }
    }
});

const parse_other_dict = http.get(CONFIG.URLS.GTA_DICTIONARY).then(function parse_gta_dict(response) {
    for (const line of response.content.toString().split(/\r?\n/)) {
        if (line.length) {
            const [hash, key] = line.split('\t');
            other[key] = hash;
        }
    }

    for (const [key, value] of Object.entries(jobsDictionary)) {
        jobs[joaat(key.toLowerCase()).signed] = value;
    }
});

// This one has a potential to fight over "other", but because JS async is single-threaded, nothing bad will happen.
const parse_other_labels = http.get(CONFIG.URLS.GTA_LABELS_DICTIONARY).then(function parse_gta_labels_dict(response) {
    for (const line of response.content.toString().split(/\r?\n/)) {
        if (line.length) {
            other[line] = joaat(line).signed.toString();
        }
    }
});

Promise.all([parse_tune_ctx, parse_other_dict, parse_other_labels]).then(function write_dictionary() {
    fs.writeFile(upath.normalize(`./src/static/${CONFIG.FILE_NAMES.DICTIONARY}`), JSON.stringify({
        contexts,
        tunables,
        jobs,
        other,
    }, null, CONFIG.DEBUG ? 1 : null), () => { if (CONFIG.DEBUG) console.log('Tunables Dictionary processed'); });
});

console.profileEnd("predecrypt");
