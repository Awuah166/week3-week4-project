const assert = require("node:assert/strict");
const test = require("node:test");
const bcrypt = require("bcryptjs");
const User = require("../models/user");
const requireAuth = require("../middleware/requireAuth");
const { login, logout, register } = require("../controllers/authController");

const createResponse = () => ({
    statusCode: 200,
    body: undefined,
    clearedCookie: undefined,
    status(code) {
        this.statusCode = code;
        return this;
    },
    json(body) {
        this.body = body;
        return this;
    },
    clearCookie(name, options) {
        this.clearedCookie = { name, options };
        return this;
    },
});

test("registration stores only a bcrypt hash and starts a session", async (t) => {
    const originalCreate = User.create;
    t.after(() => { User.create = originalCreate; });
    let storedUser;
    User.create = async (values) => {
        storedUser = values;
        return { id: "user-id", email: values.email };
    };

    const response = createResponse();
    const request = {
        body: { email: "Alex@Example.com", password: "SecurePassword123!" },
        login(user, callback) {
            assert.equal(user.email, "alex@example.com");
            callback(null);
        },
        session: { save: (callback) => callback(null) },
    };

    await register(request, response, (error) => { throw error; });

    assert.equal(response.statusCode, 201);
    assert.notEqual(storedUser.passwordHash, request.body.password);
    assert.equal(Object.values(storedUser).includes(request.body.password), false);
    assert.equal(await bcrypt.compare(request.body.password, storedUser.passwordHash), true);
    assert.deepEqual(response.body.user, { id: "user-id", email: "alex@example.com", name: undefined });
});

test("login accepts the stored password and rejects a wrong password", async (t) => {
    const originalFindOne = User.findOne;
    t.after(() => { User.findOne = originalFindOne; });
    const passwordHash = await bcrypt.hash("SecurePassword123!", 4);
    User.findOne = () => ({ select: async (fields) => {
        assert.equal(fields, "+passwordHash");
        return { id: "user-id", email: "alex@example.com", passwordHash };
    } });

    const makeRequest = (password) => ({
        body: { email: "alex@example.com", password },
        login: (user, callback) => callback(null),
        session: { save: (callback) => callback(null) },
    });
    const validResponse = createResponse();
    await login(makeRequest("SecurePassword123!"), validResponse, (error) => { throw error; });
    assert.equal(validResponse.statusCode, 200);

    const invalidResponse = createResponse();
    await login(makeRequest("WrongPassword123!"), invalidResponse, (error) => { throw error; });
    assert.equal(invalidResponse.statusCode, 401);
});

test("logout destroys the session and clears the cookie", () => {
    const response = createResponse();
    const request = {
        logout: (callback) => callback(null),
        session: { destroy: (callback) => callback(null) },
    };

    logout(request, response, (error) => { throw error; });

    assert.equal(response.statusCode, 200);
    assert.equal(response.clearedCookie.name, "movie.sid");
    assert.equal(response.body.message, "Logged out successfully");
});

test("protected routes reject anonymous requests", () => {
    let statusCode;
    let nextCalled = false;
    const response = {
        status(code) {
            statusCode = code;
            return this;
        },
        json: () => undefined,
    };

    requireAuth({ isAuthenticated: () => false }, response, () => { nextCalled = true; });

    assert.equal(statusCode, 401);
    assert.equal(nextCalled, false);
});