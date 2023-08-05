//expect function of chai
const expect = require('chai').expect;

it('shoud add numbers correctly', function () {
  const num1 = 2;
  const num2 = 3;

  expect(num1 + num2).to.equal(5);
});

//difficulty{gte}=5
it('should append the $ to the operator', function () {
  //GIVEN
  const queryUrl = 'duration{gte}=5';
  const expected = '{duratoin}';
});
