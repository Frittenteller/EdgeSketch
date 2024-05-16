CREATE MIGRATION m1zcjcsciafnvuymthdhalm454oc2gwmxpnaye6qe6kyowdq6qjjwa
    ONTO m1ta5nmy64uopeumbnuhwle5bsaqvf6kdnw5gaxgjxznkh4iptx3cq
{
  CREATE TYPE default::Comment {
      CREATE REQUIRED LINK post: default::Post;
  };
  ALTER TYPE default::Post {
      CREATE LINK posts := (.<post[IS default::Comment]);
  };
  CREATE TYPE default::User {
      CREATE REQUIRED LINK post: default::Post;
  };
};
