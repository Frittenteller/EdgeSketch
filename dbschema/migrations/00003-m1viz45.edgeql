CREATE MIGRATION m1viz456n772dou3ngpsged3tvqkfpt32ughui3j65fij5hdqpfprq
    ONTO m1zcjcsciafnvuymthdhalm454oc2gwmxpnaye6qe6kyowdq6qjjwa
{
  ALTER TYPE default::Post {
      CREATE REQUIRED LINK from_user: default::User {
          SET REQUIRED USING (SELECT
              default::User 
          LIMIT
              1
          );
      };
      ALTER LINK posts {
          SET MULTI;
      };
  };
};
