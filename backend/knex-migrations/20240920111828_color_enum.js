export async function up(knex) {
    // Step 1: Drop the existing 'color' column if it exists
    await knex.schema.alterTable('product', (table) => {
        table.dropColumn('color');
    });

    // Step 2: Create the new enum type 'color_enum'
    await knex.schema.raw(`
    CREATE TYPE color_enum AS ENUM (
      'WHITE', 'BLUE', 'RED', 'BLACK', 'YELLOW', 
      'REDBLUE', 'YELLOWBLACK', 'EMPTY'
    )
  `);

    // Step 3: Add the new 'color' column with the new enum type
    await knex.schema.alterTable('product', (table) => {
        table.enu('color', [
            'WHITE', 'BLUE', 'RED', 'BLACK', 'YELLOW',
            'REDBLUE', 'YELLOWBLACK', 'EMPTY'
        ]).notNullable();
    });
}

export async function down(knex) {
    // Step 1: Drop the 'color' column that uses the new enum type
    await knex.schema.alterTable('product', (table) => {
        table.dropColumn('color');
    });

    // Step 2: Drop the new 'color_enum' type
    await knex.schema.raw(`
    DROP TYPE color_enum
  `);

    // Step 3: Optionally recreate the old enum type if necessary
    await knex.schema.raw(`
    CREATE TYPE old_color_enum AS ENUM (
      'WHITE', 'BLUE', 'RED', 'BLACK', 'YELLOW',
      'REDBLUE', 'YELLOWBLACK'
    )
  `);

    // Step 4: Add the old 'color' column back with the old enum type
    await knex.schema.alterTable('product', (table) => {
        table.enu('color', [
            'WHITE', 'BLUE', 'RED', 'BLACK', 'YELLOW',
            'REDBLUE', 'YELLOWBLACK'
        ]).notNullable();
    });
}
