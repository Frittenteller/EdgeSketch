// GENERATED by @edgedb/generate v0.5.3

import * as $ from "../reflection";
import * as _ from "../imports";
import type * as _std from "./std";
export type $PageλShape = $.typeutil.flatten<_std.$Object_8ce8c71ee4fa5f73840c22d7eaa58588λShape & {
  "queries": $.LinkDesc<$Query, $.Cardinality.Many, {}, false, false,  false, false>;
  "slug": $.PropertyDesc<_std.$str, $.Cardinality.One, true, false, false, false>;
}>;
type $Page = $.ObjectType<"Generator::Page", $PageλShape, null, [
  ..._std.$Object_8ce8c71ee4fa5f73840c22d7eaa58588['__exclusives__'],
  {slug: {__element__: _std.$str, __cardinality__: $.Cardinality.One | $.Cardinality.AtMostOne },},
]>;
const $Page = $.makeType<$Page>(_.spec, "01ec1a82-1556-11ef-8860-4f6c03f7c8f6", _.syntax.literal);

const Page: $.$expr_PathNode<$.TypeSet<$Page, $.Cardinality.Many>, null> = _.syntax.$PathNode($.$toSet($Page, $.Cardinality.Many), null);

export type $QueryλShape = $.typeutil.flatten<_std.$Object_8ce8c71ee4fa5f73840c22d7eaa58588λShape & {
  "body": $.PropertyDesc<_std.$str, $.Cardinality.One, false, false, false, false>;
  "<queries[is Generator::Page]": $.LinkDesc<$Page, $.Cardinality.Many, {}, false, false,  false, false>;
  "<queries": $.LinkDesc<$.ObjectType, $.Cardinality.Many, {}, false, false,  false, false>;
}>;
type $Query = $.ObjectType<"Generator::Query", $QueryλShape, null, [
  ..._std.$Object_8ce8c71ee4fa5f73840c22d7eaa58588['__exclusives__'],
]>;
const $Query = $.makeType<$Query>(_.spec, "01eac34e-1556-11ef-bd4a-619a36c36f2e", _.syntax.literal);

const Query: $.$expr_PathNode<$.TypeSet<$Query, $.Cardinality.Many>, null> = _.syntax.$PathNode($.$toSet($Query, $.Cardinality.Many), null);



export { $Page, Page, $Query, Query };

type __defaultExports = {
  "Page": typeof Page;
  "Query": typeof Query
};
const __defaultExports: __defaultExports = {
  "Page": Page,
  "Query": Query
};
export default __defaultExports;
