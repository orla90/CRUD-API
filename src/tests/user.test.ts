import request from 'supertest';
import { server } from '../index'; 
import { ErrorType } from '../common/enum/error-types.enum';
import { BASE_URL } from '../common/constants';

describe('User API', () => {
  let userId: string;

  it('GET /api/users should return an empty array', async () => {
    const response = await request(server).get(BASE_URL);
    expect(response.status).toBe(200);
    expect(response.body).toEqual([]);
  });

  it('POST /api/users should create a new user', async () => {
    const newUser = {
      username: 'new_user',
      age: 30,
      hobbies: ['swimming', 'reading']
    };

    const response = await request(server).post(BASE_URL).send(newUser);
    expect(response.status).toBe(201); 
    expect(response.body).toHaveProperty('id'); 
    expect(response.body.username).toBe(newUser.username);
    expect(response.body.age).toBe(newUser.age);
    expect(response.body.hobbies).toEqual(newUser.hobbies);

    userId = response.body.id; 
  });

  it('GET /api/users/:id should return the created user', async () => {
    const response = await request(server).get(`${BASE_URL}/${userId}`);
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('id', userId);
    expect(response.body.username).toBe('new_user');
    expect(response.body.age).toBe(30);
    expect(response.body.hobbies).toEqual(['swimming', 'reading']);
  });

  it('PUT /api/users/:id should update the user', async () => {
    const updatedUser = {
      username: 'updated_user',
      age: 31,
      hobbies: ['reading']
    };

    const response = await request(server).put(`${BASE_URL}/${userId}`).send(updatedUser);
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('id', userId);
    expect(response.body.username).toBe('updated_user');
    expect(response.body.age).toBe(31);
    expect(response.body.hobbies).toEqual(['reading']);
  });

  it('DELETE /api/users/:id should delete the user', async () => {
    const response = await request(server).delete(`${BASE_URL}//${userId}`);
    expect(response.status).toBe(204); 
  });

  it('GET /api/users/:id should return 404 for deleted user', async () => {
    const response = await request(server).get(`${BASE_URL}/${userId}`);
    expect(response.status).toBe(404);
    expect(response.body).toEqual({ error: ErrorType.USER_NOT_FOUND });
  });
});
