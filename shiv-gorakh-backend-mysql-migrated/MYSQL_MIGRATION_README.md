# Hostinger MySQL backend

This backend has been switched from Mongoose/MongoDB runtime calls to a MySQL-backed compatibility data layer so existing controller/service call sites and API routes can be retained while migrating the storage engine.

## Environment

Configure these variables in Hostinger Web App environment settings (never commit actual credentials):

- `MYSQL_HOST`: exact database host shown by Hostinger
- `MYSQL_PORT`: normally `3306`, unless Hostinger specifies another port
- `MYSQL_DATABASE`: exact database name
- `MYSQL_USER`: exact database username
- `MYSQL_PASSWORD`: database user's password
- `MYSQL_CONNECTION_LIMIT`: optional pool size (default 5)
- Existing app variables such as `PORT`, `CLIENT_URL`, `DASHBOARD_URL`, `JWT_SECRET`, `JWT_REFRESH_SECRET`, `ADMIN_SECRET_KEY`

## Database creation

1. Create a MySQL database and user in Hostinger hPanel.
2. Grant the user access to that database.
3. Configure the environment variables above in the backend Web App.
4. Redeploy/restart the backend. On startup the app creates missing tables from registered model definitions.
5. Run `npm run db:check` to verify connectivity.

## Notes

- This package intentionally does not include a `.env` file or real secrets.
- The data layer keeps the existing model-style query surface for compatibility. Array/nested fields are stored as JSON columns; scalar fields are typed MySQL columns. This is a pragmatic migration layer rather than a full normalized redesign of every nested field.
- New MySQL primary keys are numeric auto-increment IDs. `mongoose.isValidObjectId` checks have been adapted to numeric IDs.
- Test every API and admin workflow before treating the deployment as production-ready. The adapter is generic and does not reproduce every Mongoose behavior; see the migration status report for known limits.
