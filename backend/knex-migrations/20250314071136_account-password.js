export async function up(knex) {

    // Add account pincode column
    await knex.schema.alterTable("account", (table) => {
        table.string("pincode");
        table.timestamp("unlocked_until")
    });
}

export async function down(knex) {
    // Remove the pincode column
    await knex.schema.alterTable("account", (table) => {
        table.dropColumn("unlocked_until");
        table.dropColumn("pincode")
    });
}

