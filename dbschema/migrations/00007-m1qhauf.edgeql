CREATE MIGRATION m1qhauftl637jqqmolrsqzoa7dsyrpsh2ca5krmtphid4f3jrks33q
    ONTO m1335bl5vlglduito24durkdoxmcvb7bdjbw4ynnm4tjpcb4hx656q
{
  ALTER TYPE Generator::Page {
      DROP LINK queries;
  };
  ALTER TYPE Generator::Page {
      CREATE MULTI PROPERTY queries: std::str;
  };
  DROP TYPE Generator::Query;
};
