import { isEqual, uuid , formatTime, unique } from '../src';

describe('blah', () => {
  it('works', () => {
    expect(isEqual({a: 1, b: [1 , 22 , {a : 1} , undefined] , v: {a: null}}, {a : 1 , b: [1,22, {a: 1}] , v: { a: null}})).toEqual(false);
  });
});


describe("blah" , () => {
  it("works" , () => {
    expect(uuid(16)).toHaveLength(16);
  })
})


describe("blah" , () => {
  it("works" , () => {
    expect(formatTime(1635754317815, ["/", ":"]))
    .toBe("2021/11/01 16:11:57");
  })
})

describe("blah" , () => {
  it("works" , () => {
    expect(unique([{}], "jobId"))
    .toStrictEqual([{}]);
  })
})