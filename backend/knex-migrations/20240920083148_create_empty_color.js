export async function up(knex) {
    // Drop the existing column if it exists
    await knex.schema.alterTable('product', (table) => {
        table.dropColumn('color');
    });

    // Create the new enum type
    await knex.schema.raw(`
        CREATE TYPE color_enum AS ENUM (
            'WHITE', 'BLUE', 'RED', 'BLACK', 'YELLOW',
            'REDBLUE', 'YELLOWBLACK', 'EMPTY'
        )
    `);

    // Add the new column with the new enum type
    await knex.schema.alterTable('product', (table) => {
        table.enu('color', [
            'WHITE', 'BLUE', 'RED', 'BLACK', 'YELLOW',
            'REDBLUE', 'YELLOWBLACK', 'EMPTY'
        ]).notNullable();
    });
}

export async function down(knex) {
    // Drop the new enum type
    await knex.schema.raw(`DROP TYPE color_enum`);

    // Drop the color column
    await knex.schema.alterTable('product', (table) => {
        table.dropColumn('color');
    });

    // Recreate the old enum type if needed
    await knex.schema.raw(`
        CREATE TYPE old_color_enum AS ENUM (
            'WHITE', 'BLUE', 'RED', 'BLACK', 'YELLOW',
            'REDBLUE', 'YELLOWBLACK'
        )
    `);

    // Add the old color column back
    await knex.schema.alterTable('product', (table) => {
        table.enu('color', [
            'WHITE', 'BLUE', 'RED', 'BLACK', 'YELLOW',
            'REDBLUE', 'YELLOWBLACK'
        ]).notNullable();
    });
}
