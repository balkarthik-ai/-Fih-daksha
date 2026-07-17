const assert = require('assert');
const { getScoreDelta, clamp } = require('./utils');

assert.strictEqual(getScoreDelta('green'), 2, 'Green fish should be worth 2 points');
assert.strictEqual(getScoreDelta('yellow'), 0, 'Yellow fish should be worth 0 points');
assert.strictEqual(getScoreDelta('red'), -2, 'Red fish should be worth -2 points');
assert.strictEqual(clamp(10, 0, 5), 5, 'Clamp should return max when value is above range');
assert.strictEqual(clamp(-1, 0, 5), 0, 'Clamp should return min when value is below range');
assert.strictEqual(clamp(3, 0, 5), 3, 'Clamp should preserve values inside range');

console.log('1 unit test run successfully.');
