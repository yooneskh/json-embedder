
const _find = require('lodash/find');
const _merge = require('lodash/merge');
const _pick = require('lodash/pick');

const fs = require('fs');
const path = require('path');

const rawData = require(path.resolve(process.argv[2]));
const AugmentData = require(path.resolve(process.argv[3]));

const augmentationResult = [];

for (const apiDoc of rawData) {

    let info = null;

    for (const augmentCriteria of AugmentData) {

        let found = true;

        for (const k in augmentCriteria.criteria) {
            if (apiDoc[k] !== augmentCriteria.criteria[k]) {
                found = false;
                break;
            }
        }

        if (found) {
            info = augmentCriteria;
            break;
        }

    }

    if (info) {
        augmentationResult.push(_merge(apiDoc, info.augment));
    }
    else {
        augmentationResult.push(apiDoc);
    }

}

fs.writeFileSync(`result-${path.parse(process.argv[3]).name}.json`, JSON.stringify(augmentationResult, null, '    '));

for (const filterFile of process.argv.slice(4)) {

    const filterData = require(path.resolve(filterFile));
    
    const filterResult = [];
    
    for (const doc of augmentationResult) {

        const filteredDoc = _pick(doc, filterData.fields);

        if (filterData.whitelist) {
            
            let whitelisted = false;

            for (const criteria of filterData.whitelist) {
                
                let found = true;

                for (const k in criteria) {
                    if (filteredDoc[k] !== criteria[k]) {
                        found = false;
                        break;
                    }
                }

                if (found) {
                    whitelisted = true;
                    break;
                }

            }

            if (whitelisted) {
                filterResult.push(filteredDoc);
            }

        }
        else if (filterData.blacklist) {

            let blacklisted = false;

            for (const criteria of filterData.blacklist) {

                let found = true;

                for (const k in criteria) {
                    if (filteredDoc[k] !== criteria[k]) {
                        found = false;
                        break;
                    }
                }

                if (found) {
                    blacklisted = true;
                    break;
                }

            }

            if (!blacklisted) {
                filterResult.push(filteredDoc);
            }

        }
        else {
            filterResult.push(filteredDoc);
        }

    }

    fs.writeFileSync(`result-${path.parse(filterFile).name}.json`, JSON.stringify(filterResult, null, '    '));

}
