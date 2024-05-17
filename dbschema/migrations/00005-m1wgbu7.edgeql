CREATE MIGRATION m1wgbu7tve6nidanmqllkrtdubpnq6kksehcdfqjzzxcuov3rw76ja
    ONTO m1azeeg772jpya4s27nbmlx7vtk44fbsjnc5grqn3zwdzhjhpd6krq
{
  ALTER TYPE default::Comment {
      CREATE REQUIRED LINK user: default::User {
          SET REQUIRED USING (<default::User>{});
      };
      CREATE REQUIRED PROPERTY content: std::str {
          SET REQUIRED USING (<std::str>{});
      };
      CREATE REQUIRED PROPERTY created_on: std::datetime {
          SET default := (std::datetime_current());
      };
  };
};
