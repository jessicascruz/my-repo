-- =================================================================================
-- CONSULTA PARA ENCONTRAR O ID DA Cidade EM PreferenciaCidade 
-- =================================================================================


    SELECT * FROM [DB_M2C_INSIDESALES].[Watts].[PreferenciaCidade] WHERE Cidade = 'Guarulhos'

-- =================================================================================
-- CONSULTA PARA LISTAR CIDADES VINCULADAS
-- =================================================================================


    SELECT * FROM [DB_M2C_INSIDESALES].[Watts].[PreferenciaCidade] WHERE IdentificadorConcessionaria = 7