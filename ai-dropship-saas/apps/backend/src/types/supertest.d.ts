declare module 'supertest' {
  import { SuperTest, Test } from 'supertest';
  function supertest(app: unknown): SuperTest<Test>;
  export = supertest;
}
