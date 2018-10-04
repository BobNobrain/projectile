const { Enum } = require('ptl-orm');

class SexEnum extends Enum {
    constructor({ name, letter }) {
        this.name = name;
        this.letter = letter;
    }
}
SexEnum.members({
    M: new SexEnum({ name: 'male', letter: 'M' }),
    F: new SexEnum({ name: 'female', letter: 'F' })
});

module.exports = SexEnum;
