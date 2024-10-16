import { UserJsonType } from "../enum/user-json-types.enum";
import { UserJson } from "../json/user.json";

export interface ICreateUser {
  id: string,
  username: string,
  age: number,
  hobbies: string[],
}

export class CreateUser {
  private username: string;
  private age: number;
  private hobbies: string[];

  constructor(value: ICreateUser) {
    this.username = value.username;
    this.age = value.age;
    this.hobbies = value.hobbies;
  }

  factory(
    type: UserJsonType,
    id?: string,
  ): Partial<UserJson> | any {
    switch (type) {
      case UserJsonType.CreateUserJson:
        if (id) {
          return this.getCreateUserJson(id);
        } else {
          return {};
        }
      case UserJsonType.CreateUserJsonFormatDate:
        return this.getCreateUserJsonFormatDate();
      default:
        return;
    }
  }

  private getCreateUserJson(
    id: string,
  ): Partial<UserJson> {
    return {
      id,
      username: this.username,
      age: this.age,
      hobbies: this.hobbies,
    };
  }

  private getCreateUserJsonFormatDate(): Partial<UserJson> {
    return {
      username: this.username,
      age: this.age,
      hobbies: this.hobbies,
    };
  }
}
