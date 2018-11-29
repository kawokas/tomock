import {makeUserMock} from '../out/mockMakers'

const result = makeUserMock({tags: ['override', 'attributes']})
console.log(result)
