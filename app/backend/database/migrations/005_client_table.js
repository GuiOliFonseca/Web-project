
const tableName = 'tb_client';

exports.up = async function (knex) {
    await knex.schema.createTable(tableName, function (table) {
        table.increments('id').primary().notNullable();
        table.string('cpf', 11).unique().defaultTo(null);
        table.string('cnpj', 14).unique().defaultTo(null);
        table.boolean('is_deleted').defaultTo(false).notNullable();
        table.integer('id_user').notNullable().unsigned().references('id').inTable('tb_user').onDelete('CASCADE').notNullable();
        table.timestamps(false, true); //created_at/updated_at
    });

    await knex.raw(`
        CREATE TRIGGER update_timestamp
        BEFORE UPDATE
        ON ${tableName}
        FOR EACH ROW
        EXECUTE PROCEDURE update_timestamp();
    `);
};

exports.down = function (knex) {
    return knex.schema.dropTable(tableName);
};
