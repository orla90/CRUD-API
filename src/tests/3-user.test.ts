import request from "supertest";
import { ErrorType } from "../common/enum/error-types.enum";
import { BASE_URL } from "../common/constants";
import { requestHandler } from "../utils/request-handlers";
import http from "http";

const server = http.createServer(requestHandler);

describe("User API Test Scenario 3", () => {
  afterAll((done: jest.DoneCallback) => {
    server.close();
    done();
  });

  it("should return 404 if record with id === userId doesn't exist", async () => {
    const nonExistentUserId = "3f9e0b62-4b33-4d4a-a8d4-9b5f6a76181c";
    const updatedUser = {
      username: "new_user_3",
      age: 32,
      hobbies: [],
    };
    const response = await request(server)
      .put(`/api/users/${nonExistentUserId}`)
      .send(updatedUser);
    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty("error", ErrorType.USER_NOT_FOUND);
  });

  it("GET /api/some-non/existing/resource should return 404", async () => {
    const response = await request(server).get(
      `/api/some-non/existing/resource`,
    );
    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty("error");
  });

  it("OPTIONS /api/users should return 404 with an error message", async () => {
    const response = await request(server).options(BASE_URL);
    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty("error", ErrorType.METHOD_NOT_ALLOWED);
  });
});
