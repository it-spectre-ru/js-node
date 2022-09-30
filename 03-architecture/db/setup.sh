psql -f install.sql -U postgres
PGPASSWORD=postgres psql -d example -f structure.sql -U postgres
PGPASSWORD=postgres psql -d example -f data.sql -U postgres
