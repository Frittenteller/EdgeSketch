CREATE MIGRATION m16f7rhsh2olgfxuwujsutabin57juruxqf4wotmn4f3b5jomnhjla
    ONTO m1qhauftl637jqqmolrsqzoa7dsyrpsh2ca5krmtphid4f3jrks33q
{
  ALTER TYPE default::Post {
      DROP LINK comment;
  };
  DROP TYPE default::Comment;
  ALTER TYPE default::User {
      DROP LINK posts;
  };
  DROP TYPE default::Post;
  CREATE TYPE default::Todo {
      CREATE REQUIRED PROPERTY completed: std::bool {
          SET default := false;
      };
      CREATE REQUIRED PROPERTY name: std::str;
  };
  DROP TYPE default::User;
};
