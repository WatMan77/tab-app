export async function up(knex) {

    await knex.raw(`
        CREATE TABLE admin_change(
        change INTEGER NOT NULL,
        id INTEGER REFERENCES account (id),
        change_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    `);
}

export async function down(knex) {
    // Add back the username column
    await knex.raw(`
        DROP TABLE admin_change;
        `)
}

