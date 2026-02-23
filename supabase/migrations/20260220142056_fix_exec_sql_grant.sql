GRANT EXECUTE ON FUNCTION public.exec_sql(text) TO service_role;
GRANT USAGE ON SCHEMA sumer TO service_role;
GRANT SELECT ON sumer.balanco_epi_cons TO service_role;