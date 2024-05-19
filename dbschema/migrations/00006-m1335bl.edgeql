CREATE MIGRATION m1335bl5vlglduito24durkdoxmcvb7bdjbw4ynnm4tjpcb4hx656q
    ONTO m1wgbu7tve6nidanmqllkrtdubpnq6kksehcdfqjzzxcuov3rw76ja
{
  CREATE MODULE Generator IF NOT EXISTS;
  CREATE TYPE Generator::Query {
      CREATE REQUIRED PROPERTY body: std::str;
  };
  CREATE TYPE Generator::Page {
      CREATE MULTI LINK queries: Generator::Query;
      CREATE REQUIRED PROPERTY slug: std::str {
          CREATE CONSTRAINT std::exclusive;
      };
  };
};
