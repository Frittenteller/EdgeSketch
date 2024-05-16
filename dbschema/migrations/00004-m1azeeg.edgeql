CREATE MIGRATION m1azeeg772jpya4s27nbmlx7vtk44fbsjnc5grqn3zwdzhjhpd6krq
    ONTO m1viz456n772dou3ngpsged3tvqkfpt32ughui3j65fij5hdqpfprq
{
  ALTER TYPE default::Post {
      ALTER LINK posts {
          RENAME TO comment;
      };
  };
  ALTER TYPE default::User {
      DROP LINK post;
  };
  ALTER TYPE default::User {
      CREATE MULTI LINK posts := (.<from_user[IS default::Post]);
  };
  ALTER TYPE default::User {
      CREATE REQUIRED PROPERTY name: std::str {
          SET REQUIRED USING ('');
      };
  };
};
