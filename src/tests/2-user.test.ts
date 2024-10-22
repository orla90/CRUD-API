import request from "supertest";
import { ErrorType } from "../common/enum/error-types.enum";
import { BASE_URL } from "../common/constants";
import { requestHandler } from "../utils/request-handlers";
import http from "http";

const server = http.createServer(requestHandler);

describe("User API errors - Test Scenario 2", () => {
  afterAll((done: jest.DoneCallback) => {
    server.close();
    done();
  });

  it("POST /api/users with empty body should return 400", async () => {
    const response = await request(server).post(BASE_URL).send({});
    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("error");
  });

  it("POST /api/users with invalid and missing fields should return 400", async () => {
    const response = await request(server).post(BASE_URL).send({
      username: 1,
    });
    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("error");
  });

  it("GET /api/users/{nonExistentUserId} should return 404 with an error message", async () => {
    const response = await request(server).get(`${BASE_URL}/nonExistentUserId`);
    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty("error", ErrorType.USER_NOT_FOUND);
  });
});
