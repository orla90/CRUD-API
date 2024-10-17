import { UserJson } from "../json/user.json";

export class User {
  public id: string;
  public username: string;
  public age: number;
  public hobbies: string[];

  constructor(json: UserJson) {
    this.id = json.id;
    this.username = json.username;
    this.age = json.age;
    this.hobbies = json.hobbies;
  }
}
