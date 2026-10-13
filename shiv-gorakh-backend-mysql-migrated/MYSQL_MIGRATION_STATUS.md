# MongoDB to Hostinger MySQL migration status

## Changes made
- Replaced the `mongoose` dependency with `mysql2` in `package.json`.
- Added `config/mysql-odm.js`, a MySQL-backed compatibility layer supporting the model/query patterns used by the current backend (find/findOne/findById, sort/skip/limit/select/populate, create/save, updates, deletes, count, exists, and the dashboard aggregation stages currently present).
- Updated model/controller/service/route imports to use the local compatibility layer instead of the MongoDB package.
- Replaced the MongoDB connection with Hostinger MySQL pool connection and automatic creation of missing model tables at startup.
- Added `.env.example`, `scripts/check-mysql.js`, and `MYSQL_MIGRATION_README.md`.
- Kept original routes, controllers, services, PDF utilities, tests, and Upload assets in the archive.

## Important implementation details
- Primary keys are MySQL auto-increment numeric IDs, not MongoDB ObjectIds. The project has no existing production data according to the user, so no data migration is included.
- Scalar model fields use typed MySQL columns. Array and nested object fields are stored as MySQL JSON columns to preserve the existing document-like structures and avoid dropping fields.
- Tables are created from registered model schemas on backend startup. This requires the configured Hostinger MySQL user to have `CREATE TABLE` permission.

## Known limits / required verification
- This is a compatibility migration layer, not a fully normalized hand-written SQL repository rewrite. Mongoose query semantics are not all identical; all critical routes need runtime testing against the actual Hostinger MySQL server.
- Automatic foreign-key constraints and all Mongoose validation semantics are not reproduced by the compatibility layer.
- Aggregation compatibility covers the stages currently used in `services/admin.service.js`, not arbitrary MongoDB aggregation pipelines.
- A runtime package install and live MySQL integration test could not be run in this environment because npm registry access was unavailable. JavaScript syntax checks passed.
- Do not consider the deployment verified until `npm install`, `npm run db:check`, backend startup, admin login, CRUD, donations, memberships, volunteers, uploads, and dashboard summaries are tested against the Hostinger database.
