const knex = require('knex')({
    client: 'sqlite3',
    connection: {
        filename: './db/request_status.db'  // Path to your SQLite database
    },
    useNullAsDefault: true  // SQLite does not support default values in all cases
});

// Create the table for storing request statuses
knex.schema.hasTable('requests').then((exists) => {
    if (!exists) {
        return knex.schema.createTable('requests', (table) => {
            table.increments('id').primary();
            table.string('requestId').notNullable();
            table.string('status').notNullable();
            table.string('outputFilePath').nullable();
            table.timestamps(true, true);  // Automatically adds created_at and updated_at
        });
    }
}).then(() => {
    console.log("Table 'requests' is ready.");
}).catch((error) => {
    console.error("Error setting up the database:", error);
});

module.exports = knex;

