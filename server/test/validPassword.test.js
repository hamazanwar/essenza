const {ifValidPassword} = require('../utils/validPassword')

describe("validPassword", ()=>{
    test("should accept valid password",()=>{
        expect(ifValidPassword("1234567")).toBe(true)
    })
    test("should reject invalid password", () => {
        expect(ifValidPassword("12345")).toBe(false);
    });
})